// src/components/UI/GameHUD.js
import React from "react";

const GameHUD = ({
  score,
  isPaused,
  onTogglePause,
  onExit,
  onCycleCamera,
  cameraMode,
}) => {
  return (
    <div className="hud">
      <div className="score-board">
        <span>Score: {score}</span>
      </div>

      {/* Camera Button */}
      <button
        className="icon-btn"
        onClick={onCycleCamera}
        title="Switch Camera (C)">
        {cameraMode === "FOLLOW" && "🎥"}
        {cameraMode === "TOP" && "🚁"}
        {cameraMode === "POV" && "👀"}
      </button>

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
