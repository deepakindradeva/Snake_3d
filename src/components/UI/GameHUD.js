// src/components/UI/GameHUD.js
import React from "react";

const GameHUD = ({ score, distance, isPaused, onTogglePause, onExit, lives }) => {
  return (
    <>
      {/* --- LEFT: STATS PANEL --- */}
      <div className="hud-stats">
        <div className="stat-row">
          <span className="stat-icon">❤️</span>
          <span className="stat-value">{lives}</span>
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
        {/* Pause Toggle */}
        <button
          className={`hud-btn pause-btn ${isPaused ? "active" : ""}`}
          onClick={onTogglePause}>
          {isPaused ? "▶" : "⏸"}
        </button>

        {/* Exit Button */}
        <button className="hud-btn exit-btn" onClick={onExit}>
          ✕
        </button>
      </div>
    </>
  );
};

export default GameHUD;
