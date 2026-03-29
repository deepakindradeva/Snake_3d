// src/components/UI/GameOverlay.js
import React from "react";

const FRUIT_EMOJI = {
  apple: "🍎", banana: "🍌", cherry: "🍒", ice: "🧊",
  mushroom: "🍄", star: "⭐", shield: "🛡️", magnet: "🧲",
};

const TIPS = [
  "🧲 MAGNET pulls nearby food — chain combos for huge points!",
  "⭐ STAR grants 5 seconds of full invincibility.",
  "🛡️ SHIELD absorbs one crash — a lifesaver on HARD mode.",
  "🍌 BANANA speeds you up — risky but more points per second!",
  "🍄 MUSHROOM shrinks your tail — easier to navigate tight spots.",
  "🌀 PORTALS teleport you across the arena instantly!",
  "🔥 Chain eats fast to keep the COMBO multiplier going!",
  "📷 Press C to cycle between camera modes!",
];

const fmtTime = (s) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
};

const GameOverlay = ({ isPaused, gameOver, score, highScore, runStats, onResume, onRestart, onQuit }) => {
  if (!isPaused && !gameOver) return null;

  const tip = TIPS[Math.floor(Date.now() / 8000) % TIPS.length];
  const coinsEarned = score * 5;
  const isNewRecord = score > 0 && score >= highScore;

  return (
    <div className="game-over-overlay">
      <div className="overlay-card">
        {/* Rainbow top strip */}
        <div className="overlay-title">
          {gameOver ? "GAME OVER" : "PAUSED"}
        </div>

        {gameOver && runStats ? (
          <>
            {isNewRecord && (
              <div className="new-record-badge">🏆 NEW RECORD!</div>
            )}

            {/* Score row */}
            <div className="overlay-stats">
              <div className="overlay-stat">
                <span className="overlay-stat-label">Score</span>
                <span className="overlay-stat-value gold">{score}</span>
              </div>
              {highScore > 0 && (
                <div className="overlay-stat">
                  <span className="overlay-stat-label">Best</span>
                  <span className="overlay-stat-value">{highScore}</span>
                </div>
              )}
              <div className="overlay-stat">
                <span className="overlay-stat-label">🪙 Coins</span>
                <span className="overlay-stat-value coin">+{coinsEarned}</span>
              </div>
              <div className="overlay-stat">
                <span className="overlay-stat-label">⏱️ Time</span>
                <span className="overlay-stat-value">{fmtTime(runStats.timeSurvived)}</span>
              </div>
            </div>

            {/* Run breakdown */}
            <div className="run-breakdown">
              <div className="run-row">
                <span>🍽️ Fruits Eaten</span><strong>{runStats.totalEaten}</strong>
              </div>
              <div className="run-row">
                <span>🔥 Max Combo</span><strong>x{runStats.maxCombo}</strong>
              </div>
              <div className="run-row">
                <span>🌀 Portals Used</span><strong>{runStats.portalsUsed}</strong>
              </div>
              <div className="run-row">
                <span>⬆️ Max Level</span><strong>Lv{runStats.maxLevel}</strong>
              </div>
            </div>

            {/* Fruits by type */}
            {Object.keys(runStats.fruitCounts).length > 0 && (
              <div className="fruit-breakdown">
                {Object.entries(runStats.fruitCounts).map(([type, count]) => (
                  <div key={type} className="fruit-chip">
                    <span>{FRUIT_EMOJI[type] || "🍏"}</span>
                    <span>{count}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="pause-tip">
            <span className="tip-label">💡 TIP</span>
            <p>{tip}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="overlay-btns">
          {gameOver ? (
            <button className="overlay-btn primary" onClick={onRestart}>🔄 Try Again</button>
          ) : (
            <button className="overlay-btn primary" onClick={onResume}>▶ Resume</button>
          )}
          <button className="overlay-btn danger" onClick={onQuit}>🚪 Quit</button>
        </div>
      </div>
    </div>
  );
};

export default GameOverlay;
