// src/components/Home/Home.js
import React, { useState } from "react";
import "./Home.css";

const SKINS_DB = [
  { id: "default", name: "Classic Green", cost: 0, icon: "🐍" },
  { id: "neon", name: "Neon Rider", cost: 200, icon: "⚡" },
  { id: "robot", name: "Mecha Serpent", cost: 500, icon: "🤖" },
];

const Home = ({ highScore, lastScore, coins, unlockedSkins, equippedSkin, onStartGame, onPurchase }) => {
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [activeTab, setActiveTab] = useState("PLAY"); // PLAY, SHOP
  const [selectedSkin, setSelectedSkin] = useState(equippedSkin);

  const handleStart = () => {
    onStartGame(difficulty, selectedSkin);
  };

  const renderPlayTab = () => (
    <>
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
      <button className="play-btn" onClick={handleStart}>
        START GAME
      </button>
      <div className="instructions">
        <p>
          <span className="key-hint">⬅️ Left</span>
          <span className="key-hint">Right ➡️</span>
        </p>
        <p className="sub-text">Avoid Obstacles • Eat Fruit</p>
      </div>
    </>
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
            <div key={skin.id} className={`skin-card ${isSelected ? "selected" : ""}`} onClick={() => {
              if (isUnlocked) setSelectedSkin(skin.id);
            }}>
              <div className="skin-icon">{skin.icon}</div>
              <div className="skin-info">
                <h3>{skin.name}</h3>
                {!isUnlocked && <span className={`skin-cost ${!canAfford ? "locked" : ""}`}>🪙 {skin.cost}</span>}
                {isUnlocked && <span className="skin-unlocked">UNLOCKED</span>}
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

        <div className="tabs">
          <button className={`tab-btn ${activeTab === "PLAY" ? "active" : ""}`} onClick={() => setActiveTab("PLAY")}>PLAY</button>
          <button className={`tab-btn ${activeTab === "SHOP" ? "active" : ""}`} onClick={() => setActiveTab("SHOP")}>SHOP</button>
        </div>

        {activeTab === "PLAY" ? renderPlayTab() : renderShopTab()}
      </div>
    </div>
  );
};

export default Home;
