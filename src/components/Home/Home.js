// src/components/Home/Home.js
import React from "react";
import "./Home.css";

const Home = ({ highScore, lastScore, onStartGame }) => {
  return (
    <div className="home-container">
      <h1 className="title">SNAKE 3D 🐍</h1>

      <div className="stats-box">
        <div className="stat-item">
          <span className="label">Best Score</span>
          <span className="value">{highScore}</span>
        </div>
        <div className="stat-item">
          <span className="label">Last Run</span>
          <span className="value">{lastScore}</span>
        </div>
      </div>

      <button className="start-btn" onClick={onStartGame}>
        PLAY
      </button>

      <div className="instructions">
        <p>
          Tap <strong>Left / Right</strong> to Steer
        </p>
        <p>Eat Apples 🍎 • Dodge Trees 🌲</p>
      </div>
    </div>
  );
};

export default Home;
