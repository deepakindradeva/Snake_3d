// src/components/UI/GameHUD.js
import React from "react";

const GameHUD = ({ score, isPaused, onTogglePause, onExit }) => {
  return (
    <div className="hud">
      <span>Score: {score}</span>

      <button className="pause-btn" onClick={onTogglePause}>
        {isPaused ? "▶" : "⏸"}
      </button>

      <button className="exit-btn-small" onClick={onExit}>
        ✕
      </button>
    </div>
  );
};

export default GameHUD;
