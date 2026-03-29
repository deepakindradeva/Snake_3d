// src/App.js
import React, { useState, useEffect } from "react";
import Home from "./components/Home/Home";
import GameBoard from "./components/Game/GameBoard";
import "./App.css";

const MAX_LEADERBOARD = 5;

const loadLeaderboard = () => {
  try { return JSON.parse(localStorage.getItem("snake3d-leaderboard") || "[]"); }
  catch { return []; }
};

const App = () => {
  const [gameState, setGameState] = useState("HOME");
  const [lastScore, setLastScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [leaderboard, setLeaderboard] = useState(loadLeaderboard);

  // META PROGRESSION
  const [coins, setCoins] = useState(0);
  const [unlockedSkins, setUnlockedSkins] = useState(["default"]);
  const [equippedSkin, setEquippedSkin] = useState("default");

  useEffect(() => {
    const storedBest = localStorage.getItem("snake3d-highscore");
    if (storedBest) setHighScore(parseInt(storedBest, 10));
    const storedCoins = localStorage.getItem("snake3d-coins");
    if (storedCoins) setCoins(parseInt(storedCoins, 10));
    const storedSkins = localStorage.getItem("snake3d-skins");
    if (storedSkins) setUnlockedSkins(JSON.parse(storedSkins));
    const storedEquipped = localStorage.getItem("snake3d-equipped");
    if (storedEquipped) setEquippedSkin(storedEquipped);
    setLeaderboard(loadLeaderboard());
  }, []);

  const startGame = (selectedDifficulty, selectedSkin) => {
    setDifficulty(selectedDifficulty);
    setEquippedSkin(selectedSkin);
    localStorage.setItem("snake3d-equipped", selectedSkin);
    setGameState("PLAYING");
  };

  const handlePurchase = (skinId, cost) => {
    if (coins >= cost && !unlockedSkins.includes(skinId)) {
      const newCoins = coins - cost;
      const newSkins = [...unlockedSkins, skinId];
      setCoins(newCoins);
      setUnlockedSkins(newSkins);
      localStorage.setItem("snake3d-coins", newCoins);
      localStorage.setItem("snake3d-skins", JSON.stringify(newSkins));
    }
  };

  const endGame = (score) => {
    setLastScore(score);

    // Update high score
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("snake3d-highscore", score);
    }

    // Update leaderboard
    const newEntry = { score, difficulty, date: new Date().toLocaleDateString() };
    const newBoard = [...leaderboard, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_LEADERBOARD);
    setLeaderboard(newBoard);
    localStorage.setItem("snake3d-leaderboard", JSON.stringify(newBoard));

    // Earn coins
    const earnedCoins = score * 5;
    if (earnedCoins > 0) {
      const newCoins = coins + earnedCoins;
      setCoins(newCoins);
      localStorage.setItem("snake3d-coins", newCoins);
    }

    setGameState("HOME");
  };

  return (
    <div className="app">
      {gameState === "HOME" && (
        <Home
          highScore={highScore}
          lastScore={lastScore}
          coins={coins}
          leaderboard={leaderboard}
          unlockedSkins={unlockedSkins}
          equippedSkin={equippedSkin}
          onStartGame={startGame}
          onPurchase={handlePurchase}
        />
      )}
      {gameState === "PLAYING" && (
        <GameBoard
          difficulty={difficulty}
          skin={equippedSkin}
          highScore={highScore}
          onGameEnd={endGame}
        />
      )}
    </div>
  );
};

export default App;
