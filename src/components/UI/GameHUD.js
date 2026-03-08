// src/components/UI/GameHUD.js
import React from "react";

const GameHUD = ({
  score,
  distance,
  lives, // <--- NEW PROP
  isPaused,
  onTogglePause,
  onExit,
}) => {
  // Helper to render hearts
  const renderHearts = () => {
    let hearts = [];
    for (let i = 0; i < 3; i++) {
      hearts.push(
        <span
          key={i}
          style={{
            opacity: i < lives ? 1 : 0.3, // Dim lost lives
            fontSize: "1.2rem",
            filter: i < lives ? "drop-shadow(0 0 2px red)" : "grayscale(100%)",
          }}>
          ❤️
        </span>,
      );
    }
    return hearts;
  };

  return (
    <>
      {/* --- LEFT: STATS PANEL --- */}
      <div className="hud-stats">
        {/* Lives Row */}
        <div className="stat-row" style={{ marginRight: "10px" }}>
          {renderHearts()}
        </div>

        <div className="stat-divider"></div>

        <div className="stat-row">
          <span className="stat-icon">🏆</span>
          <span className="stat-value">{score}</span>
        </div>

        <div className="stat-divider"></div>

        <div className="stat-row">
          <span className="stat-icon">👣</span>
          <span className="stat-value">{distance}m</span>
        </div>
      </div>

      {/* --- RIGHT: ACTION BUTTONS --- */}
      <div className="hud-controls">
        <button
          className={`hud-btn pause-btn ${isPaused ? "active" : ""}`}
          onClick={onTogglePause}>
          {isPaused ? "▶" : "⏸"}
        </button>

        <button className="hud-btn exit-btn" onClick={onExit}>
          ✕
        </button>
      </div>
    </>
  );
};

export default GameHUD;
