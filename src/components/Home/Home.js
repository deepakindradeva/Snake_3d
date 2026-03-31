// src/components/Home/Home.js
import React, { useState } from "react";
import { CHARACTERS } from "../../utils/characters";
import "./Home.css";

const DIFF_META = {
  EASY:   { label: "EASY",   emoji: "🌿", desc: "Slow & chill" },
  MEDIUM: { label: "MEDIUM", emoji: "🔥", desc: "Balanced fun" },
  HARD:   { label: "HARD",   emoji: "💀", desc: "Pure chaos" },
};
const DIFF_BADGE = { EASY: "easy", MEDIUM: "medium", HARD: "hard" };

const StatBar = ({ label, value, max = 5, color = "#4CAF50" }) => (
  <div style={statBarWrap}>
    <span style={statBarLabel}>{label}</span>
    <div style={statBarTrack}>
      {Array.from({ length: max }, (_, i) => (
        <div key={i} style={{ ...statBarPip, background: i < value ? color : "rgba(255,255,255,0.12)" }} />
      ))}
    </div>
  </div>
);

const Home = ({
  highScore, lastScore, coins, leaderboard = [],
  unlockedCharacters, equippedCharacter,
  onStartGame, onPurchase,
}) => {
  const [difficulty, setDifficulty]       = useState("MEDIUM");
  const [activeTab, setActiveTab]         = useState("PLAY");
  const [selectedCharId, setSelectedCharId] = useState(equippedCharacter || "sly");

  const selectedChar = CHARACTERS.find(c => c.id === selectedCharId) || CHARACTERS[0];

  const handleStart = () => {
    if (typeof window !== "undefined" && window.innerWidth <= 768) {
      const el = document.documentElement;
      const req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
      if (req) try { req.call(el).catch(() => {}); } catch (_) {}
    }
    onStartGame(difficulty, selectedCharId);
  };

  // ── PLAY tab ───────────────────────────────────────────────────────────────
  const renderPlayTab = () => (
    <>
      <div className="stats-row">
        <div className="stat-box"><span className="stat-label">🏆 Best</span><span className="stat-value">{highScore}</span></div>
        <div className="stat-box"><span className="stat-label">🎯 Last</span><span className="stat-value">{lastScore}</span></div>
      </div>

      <div className="difficulty-section">
        <span className="section-label">SELECT DIFFICULTY</span>
        <div className="diff-buttons">
          {Object.values(DIFF_META).map(({ label, emoji, desc }) => (
            <button
              key={label}
              className={`diff-btn ${difficulty === label ? "active" : ""}`}
              onClick={() => setDifficulty(label)}
              title={desc}
            >{emoji} {label}</button>
          ))}
        </div>
      </div>

      <button className="play-btn" onClick={handleStart}>▶ Play Now</button>

      <div className="instructions">
        <p>
          <span className="key-hint">A / ←</span> Turn Left &nbsp;·&nbsp;
          <span className="key-hint">D / →</span> Turn Right &nbsp;·&nbsp;
          <span className="key-hint">SPACE</span> Pause
        </p>
        <p className="sub-text">Avoid Obstacles · Eat Fruit · Chain Combos · Survive</p>
        <p className="sub-text" style={{ color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
          📱 Mobile: swipe anywhere or tap left/right halves
        </p>
      </div>
    </>
  );

  // ── CHARACTERS tab ─────────────────────────────────────────────────────────
  const renderCharactersTab = () => (
    <div style={{ width: "100%" }}>
      <div style={charGridStyle}>
        {CHARACTERS.map(char => {
          const isUnlocked = (unlockedCharacters || ["sly"]).includes(char.id);
          const isSelected = selectedCharId === char.id;
          const canAfford  = coins >= char.cost;
          return (
            <div
              key={char.id}
              style={{
                ...charCardStyle,
                border: isSelected
                  ? "2px solid rgba(0,220,255,0.85)"
                  : "2px solid rgba(255,255,255,0.10)",
                background: isSelected
                  ? "rgba(0,220,255,0.12)"
                  : "rgba(255,255,255,0.05)",
                opacity: isUnlocked ? 1 : 0.55,
              }}
              onClick={() => { if (isUnlocked) setSelectedCharId(char.id); }}
            >
              <div style={charIconStyle}>{char.icon}</div>
              <div style={charNameStyle}>{char.name}</div>
              <div style={charTitleStyle}>{char.title}</div>
              {!isUnlocked && (
                <div style={lockBadgeStyle}>🔒 {char.cost} 🪙</div>
              )}
              {isSelected && isUnlocked && (
                <div style={activeBadgeStyle}>ACTIVE</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected character details */}
      <div style={charDetailStyle}>
        <div style={charDetailHeader}>
          <span style={{ fontSize: "2rem" }}>{selectedChar.icon}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#fff" }}>{selectedChar.name}</div>
            <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}>{selectedChar.title}</div>
          </div>
        </div>
        <p style={charDescStyle}>{selectedChar.description}</p>

        {/* Stat bars */}
        <div style={{ marginBottom: 10 }}>
          <StatBar label="Speed"  value={speedRating(selectedChar)}  color="#00E5FF" />
          <StatBar label="Growth" value={growthRating(selectedChar)} color="#69F0AE" />
          <StatBar label="Lives"  value={selectedChar.stats.startLives} max={4} color="#FF5252" />
        </div>

        {/* Passive */}
        <div style={passiveBadge}>
          <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "1px" }}>Passive</span>
          <span style={{ fontWeight: 700, color: "#FFD740", fontSize: "0.85rem" }}> {selectedChar.passive.label}</span>
          <p style={{ margin: "4px 0 0", fontSize: "0.75rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.4 }}>
            {selectedChar.passive.description}
          </p>
        </div>

        {/* Buy button if locked */}
        {!(unlockedCharacters || ["sly"]).includes(selectedChar.id) && (
          <button
            className="buy-btn"
            style={{ marginTop: 10, width: "100%" }}
            disabled={coins < selectedChar.cost}
            onClick={() => onPurchase(selectedChar.id, selectedChar.cost)}
          >
            🪙 Unlock for {selectedChar.cost} coins
          </button>
        )}
      </div>
    </div>
  );

  // ── LEADERBOARD tab ────────────────────────────────────────────────────────
  const renderLeaderboardTab = () => (
    <div className="leaderboard-section">
      {leaderboard.length === 0 ? (
        <div className="lb-empty">
          <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🏆</div>
          <p>Play your first game to set a record!</p>
        </div>
      ) : (
        <div className="lb-list">
          {leaderboard.map((entry, i) => (
            <div key={i} className={`lb-row ${i === 0 ? "lb-first" : ""}`}>
              <span className="lb-rank">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}</span>
              <span className="lb-score">{entry.score}</span>
              <span className={`lb-diff ${DIFF_BADGE[entry.difficulty] || "medium"}`}>{entry.difficulty}</span>
              <span className="lb-date">{entry.date}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="home-wrapper">
      <div className="home-card">
        <h1 className="game-title">SNAKE 3D</h1>
        <p className="game-subtitle">Infinite Arena · Power-ups · Portals · 5 Biomes</p>

        <div className="home-coins">🪙 {coins} coins</div>

        <div className="tabs">
          <button className={`tab-btn ${activeTab === "PLAY"       ? "active" : ""}`} onClick={() => setActiveTab("PLAY")}>🎮 PLAY</button>
          <button className={`tab-btn ${activeTab === "CHARACTERS" ? "active" : ""}`} onClick={() => setActiveTab("CHARACTERS")}>🐍 CHARS</button>
          <button className={`tab-btn ${activeTab === "LEADERBOARD"? "active" : ""}`} onClick={() => setActiveTab("LEADERBOARD")}>🏆 RANKS</button>
        </div>

        {activeTab === "PLAY"        && renderPlayTab()}
        {activeTab === "CHARACTERS"  && renderCharactersTab()}
        {activeTab === "LEADERBOARD" && renderLeaderboardTab()}
      </div>
    </div>
  );
};

// Derived stat ratings (1-5 scale) for the stat bars
const speedRating = (char) => {
  const bonus = char.stats.speedBonus;
  // bonus < 0 = faster, bonus > 0 = slower
  if (bonus <= -20) return 5;
  if (bonus <= -10) return 4;
  if (bonus === 0)  return 3;
  if (bonus <= 20)  return 2;
  return 1;
};
const growthRating = (char) => {
  const m = char.stats.growthMult;
  if (m >= 2.0) return 5;
  if (m >= 1.5) return 4;
  if (m >= 1.0) return 3;
  if (m >= 0.8) return 2;
  return 1;
};

// ── Styles ────────────────────────────────────────────────────────────────────
const charGridStyle = {
  display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px",
  width: "100%", marginBottom: "12px",
};
const charCardStyle = {
  borderRadius: "12px", padding: "10px 6px", cursor: "pointer",
  display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
  transition: "all 0.15s ease", position: "relative",
};
const charIconStyle  = { fontSize: "1.8rem", lineHeight: 1 };
const charNameStyle  = { fontWeight: 700, fontSize: "0.8rem", color: "#fff", textAlign: "center" };
const charTitleStyle = { fontSize: "0.62rem", color: "rgba(255,255,255,0.4)", textAlign: "center" };
const lockBadgeStyle = {
  position: "absolute", bottom: 5, left: "50%", transform: "translateX(-50%)",
  fontSize: "0.58rem", color: "rgba(255,200,0,0.9)",
  background: "rgba(0,0,0,0.6)", borderRadius: 4, padding: "2px 5px", whiteSpace: "nowrap",
};
const activeBadgeStyle = {
  position: "absolute", bottom: 5, left: "50%", transform: "translateX(-50%)",
  fontSize: "0.58rem", color: "#00E5FF", fontWeight: 700, letterSpacing: "1px",
};
const charDetailStyle = {
  background: "rgba(255,255,255,0.05)", borderRadius: "12px",
  padding: "12px 14px", width: "100%", boxSizing: "border-box",
};
const charDetailHeader = {
  display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px",
};
const charDescStyle = {
  fontSize: "0.78rem", color: "rgba(255,255,255,0.6)",
  margin: "0 0 10px", lineHeight: 1.5,
};
const passiveBadge = {
  background: "rgba(255,215,64,0.08)", border: "1px solid rgba(255,215,64,0.2)",
  borderRadius: "8px", padding: "8px 10px",
};
const statBarWrap  = { display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" };
const statBarLabel = { fontSize: "0.65rem", color: "rgba(255,255,255,0.45)", width: "44px", flexShrink: 0 };
const statBarTrack = { display: "flex", gap: "3px" };
const statBarPip   = { width: "18px", height: "6px", borderRadius: "3px", transition: "background 0.2s" };

export default Home;
