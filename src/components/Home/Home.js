// src/components/Home/Home.js
import React, { useState } from "react";
import "./Home.css";

const Home = ({ highScore, lastScore, onStartGame }) => {
  const [difficulty, setDifficulty] = useState("MEDIUM");

  const handleStart = () => {
    onStartGame(difficulty);
  };

  return (
    <div className="home-wrapper">
      <div className="home-card">
        <h1 className="game-title">SNAKE 3D</h1>

        {/* Stats Section */}
        <div className="stats-row">
          <div className="stat-box">
            <span className="stat-label">BEST</span>
            <span className="stat-value">{highScore}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">LAST</span>
            <span className="stat-value">{lastScore}</span>
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="difficulty-section">
          <span className="section-label">SELECT DIFFICULTY</span>
          <div className="diff-buttons">
            {["EASY", "MEDIUM", "HARD"].map((level) => (
              <button
                key={level}
                className={`diff-btn ${difficulty === level ? "active" : ""}`}
                onClick={() => setDifficulty(level)}>
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Main Action */}
        <button className="play-btn" onClick={handleStart}>
          START GAME
        </button>

        {/* Instructions */}
        <div className="instructions">
          <p>
            <span className="key-hint">⬅️ Left</span>
            <span className="key-hint">Right ➡️</span>
          </p>
          <p className="sub-text">Avoid Obstacles • Eat Fruit</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
