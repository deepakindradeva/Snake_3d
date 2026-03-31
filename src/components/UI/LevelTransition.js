// src/components/UI/LevelTransition.js
import React, { useState, useEffect, useCallback } from "react";
import { getLevelConfig } from "../../utils/constants";

const LevelTransition = ({ level, difficulty, snake, onContinue }) => {
  const [countdown, setCountdown] = useState(3);

  const handleContinue = useCallback(() => {
    onContinue(snake);
  }, [onContinue, snake]);

  useEffect(() => {
    if (countdown <= 0) {
      handleContinue();
      return;
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, handleContinue]);

  const nextConfig = getLevelConfig(level + 1, difficulty);
  const currConfig = getLevelConfig(level, difficulty);

  const speedDelta   = currConfig.speed - nextConfig.speed;
  const obsDelta     = nextConfig.obstacles - currConfig.obstacles;
  const enemyDelta   = nextConfig.enemies   - currConfig.enemies;

  return (
    <div className="level-transition-overlay">
      <div className="level-transition-card">
        <div className="lt-complete-label">LEVEL COMPLETE!</div>
        <div className="lt-level-badge">Lv {level}</div>

        <div className="lt-divider" />

        <div className="lt-next-label">NEXT UP — LEVEL {level + 1}</div>

        <div className="lt-changes">
          {speedDelta > 0 && (
            <div className="lt-change lt-change-bad">
              <span className="lt-change-icon">⚡</span>
              <span>Speed +{speedDelta}ms faster</span>
            </div>
          )}
          {obsDelta > 0 && (
            <div className="lt-change lt-change-bad">
              <span className="lt-change-icon">🌲</span>
              <span>+{obsDelta} obstacles</span>
            </div>
          )}
          {enemyDelta > 0 && (
            <div className="lt-change lt-change-bad">
              <span className="lt-change-icon">🕷️</span>
              <span>+{enemyDelta} {enemyDelta === 1 ? "enemy" : "enemies"}</span>
            </div>
          )}
          {speedDelta === 0 && obsDelta === 0 && enemyDelta === 0 && (
            <div className="lt-change">
              <span className="lt-change-icon">🐍</span>
              <span>Maximum difficulty reached!</span>
            </div>
          )}
        </div>

        <div className="lt-divider" />

        <div className="lt-snake-kept">
          Your snake length carries over!
        </div>

        <button className="lt-continue-btn" onClick={handleContinue}>
          Continue <span className="lt-countdown">({countdown})</span>
        </button>
      </div>
    </div>
  );
};

export default LevelTransition;
