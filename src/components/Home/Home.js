// src/components/Home/Home.js
import React, { useState } from "react";
import "./Home.css";

const SKINS_DB = [
  { id: "default", name: "Classic Green", cost: 0,   icon: "🐍" },
  { id: "neon",    name: "Neon Rider",    cost: 200, icon: "⚡" },
  { id: "robot",   name: "Mecha Serpent", cost: 500, icon: "🤖" },
];

const DIFF_META = {
  EASY:   { label: "EASY",   emoji: "🌿", desc: "Slow & chill" },
  MEDIUM: { label: "MEDIUM", emoji: "🔥", desc: "Balanced fun" },
  HARD:   { label: "HARD",   emoji: "💀", desc: "Pure chaos" },
};

const DIFF_BADGE = { EASY: "easy", MEDIUM: "medium", HARD: "hard" };

const Home = ({ highScore, lastScore, coins, leaderboard = [], unlockedSkins, equippedSkin, onStartGame, onPurchase }) => {
  const [difficulty, setDifficulty]   = useState("MEDIUM");
  const [activeTab, setActiveTab]     = useState("PLAY");
  const [selectedSkin, setSelectedSkin] = useState(equippedSkin);

  const handleStart = () => onStartGame(difficulty, selectedSkin);

  const renderPlayTab = () => (
    <>
      <div className="stats-row">
        <div className="stat-box">
          <span className="stat-label">🏆 Best</span>
          <span className="stat-value">{highScore}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">🎯 Last</span>
          <span className="stat-value">{lastScore}</span>
        </div>
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
            >
              {emoji} {label}
            </button>
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
      </div>
    </>
  );

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
              <span className="lb-rank">
                {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
              </span>
              <span className="lb-score">{entry.score}</span>
              <span className={`lb-diff ${DIFF_BADGE[entry.difficulty] || "medium"}`}>
                {entry.difficulty}
              </span>
              <span className="lb-date">{entry.date}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderShopTab = () => (
    <div className="shop-section">
      <div className="shop-header">
        <span className="coin-balance">🪙 {coins} Coins</span>
      </div>
      <div className="skins-list">
        {SKINS_DB.map((skin) => {
          const isUnlocked = unlockedSkins.includes(skin.id);
          const isSelected = selectedSkin === skin.id;
          const canAfford = coins >= skin.cost;
          return (
            <div
              key={skin.id}
              className={`skin-card ${isSelected ? "selected" : ""}`}
              onClick={() => { if (isUnlocked) setSelectedSkin(skin.id); }}
            >
              <div className="skin-icon">{skin.icon}</div>
              <div className="skin-info">
                <h3>{skin.name}</h3>
                {!isUnlocked && (
                  <span className={`skin-cost ${!canAfford ? "locked" : ""}`}>🪙 {skin.cost}</span>
                )}
                {isUnlocked && <span className="skin-unlocked">✓ UNLOCKED</span>}
              </div>
              {!isUnlocked && (
                <button
                  className="buy-btn"
                  disabled={!canAfford}
                  onClick={(e) => { e.stopPropagation(); onPurchase(skin.id, skin.cost); }}
                >
                  BUY
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="home-wrapper">
      <div className="home-card">
        <h1 className="game-title">SNAKE 3D</h1>
        <p className="game-subtitle">Infinite Arena · Power-ups · Portals</p>

        <div className="home-coins">🪙 {coins} coins</div>

        <div className="tabs">
          <button className={`tab-btn ${activeTab === "PLAY" ? "active" : ""}`} onClick={() => setActiveTab("PLAY")}>
            🎮 PLAY
          </button>
          <button className={`tab-btn ${activeTab === "LEADERBOARD" ? "active" : ""}`} onClick={() => setActiveTab("LEADERBOARD")}>
            🏆 RANKS
          </button>
          <button className={`tab-btn ${activeTab === "SHOP" ? "active" : ""}`} onClick={() => setActiveTab("SHOP")}>
            🛒 SHOP
          </button>
        </div>

        {activeTab === "PLAY"        && renderPlayTab()}
        {activeTab === "LEADERBOARD" && renderLeaderboardTab()}
        {activeTab === "SHOP"        && renderShopTab()}
      </div>
    </div>
  );
};

export default Home;
