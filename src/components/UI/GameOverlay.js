// src/components/UI/GameOverlay.js
import React from "react";

const GameOverlay = ({
  isPaused,
  gameOver,
  score,
  onResume,
  onRestart,
  onQuit,
}) => {
  if (!isPaused && !gameOver) return null;

  return (
    <div className="game-over-overlay">
      <h2>{gameOver ? "Ouch!" : "PAUSED"}</h2>
      {gameOver && <p>Score: {score}</p>}

      <div className="overlay-btns">
        {gameOver ? (
          <button onClick={onRestart}>Try Again</button>
        ) : (
          <button onClick={onResume}>Resume</button>
        )}

        <button onClick={onQuit} className="danger-btn">
          Quit
        </button>
      </div>
    </div>
  );
};

export default GameOverlay;
