// src/App.js
import { useState, useEffect } from "react";
import Home from "./components/Home/Home";
import GameBoard from "./components/Game/GameBoard";
import { CHARACTER_MAP, DEFAULT_CHARACTER } from "./utils/characters";
import "./App.css";

const MAX_LEADERBOARD = 5;

const loadLeaderboard = () => {
  try { return JSON.parse(localStorage.getItem("snake3d-leaderboard") || "[]"); }
  catch { return []; }
};

const App = () => {
  const [gameState, setGameState]   = useState("HOME");
  const [lastScore, setLastScore]   = useState(0);
  const [highScore, setHighScore]   = useState(0);
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [leaderboard, setLeaderboard] = useState(loadLeaderboard);

  // Meta-progression: coins + unlocked/equipped character
  const [coins, setCoins]                         = useState(0);
  const [unlockedCharacters, setUnlockedCharacters] = useState(["sly"]);
  const [equippedCharacterId, setEquippedCharacterId] = useState("sly");

  useEffect(() => {
    const storedBest  = localStorage.getItem("snake3d-highscore");
    if (storedBest)  setHighScore(parseInt(storedBest, 10));

    const storedCoins = localStorage.getItem("snake3d-coins");
    if (storedCoins) setCoins(parseInt(storedCoins, 10));

    const storedChars = localStorage.getItem("snake3d-characters");
    if (storedChars) setUnlockedCharacters(JSON.parse(storedChars));

    const storedEquipped = localStorage.getItem("snake3d-equipped");
    if (storedEquipped) setEquippedCharacterId(storedEquipped);

    setLeaderboard(loadLeaderboard());
  }, []);

  const startGame = (selectedDifficulty, selectedCharacterId) => {
    setDifficulty(selectedDifficulty);
    setEquippedCharacterId(selectedCharacterId);
    localStorage.setItem("snake3d-equipped", selectedCharacterId);
    setGameState("PLAYING");
  };

  const handlePurchase = (charId, cost) => {
    if (coins >= cost && !unlockedCharacters.includes(charId)) {
      const newCoins   = coins - cost;
      const newChars   = [...unlockedCharacters, charId];
      setCoins(newCoins);
      setUnlockedCharacters(newChars);
      localStorage.setItem("snake3d-coins",      newCoins);
      localStorage.setItem("snake3d-characters", JSON.stringify(newChars));
    }
  };

  const endGame = (score) => {
    setLastScore(score);

    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("snake3d-highscore", score);
    }

    const newEntry = { score, difficulty, date: new Date().toLocaleDateString() };
    const newBoard = [...leaderboard, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_LEADERBOARD);
    setLeaderboard(newBoard);
    localStorage.setItem("snake3d-leaderboard", JSON.stringify(newBoard));

    const earned = score * 5;
    if (earned > 0) {
      const newCoins = coins + earned;
      setCoins(newCoins);
      localStorage.setItem("snake3d-coins", newCoins);
    }

    setGameState("HOME");
  };

  // Resolve character id → full object (fallback to default if not found)
  const activeCharacter = CHARACTER_MAP[equippedCharacterId] || DEFAULT_CHARACTER;

  return (
    <div className="app">
      {gameState === "HOME" && (
        <Home
          highScore={highScore}
          lastScore={lastScore}
          coins={coins}
          leaderboard={leaderboard}
          unlockedCharacters={unlockedCharacters}
          equippedCharacter={equippedCharacterId}
          onStartGame={startGame}
          onPurchase={handlePurchase}
        />
      )}
      {gameState === "PLAYING" && (
        <GameBoard
          difficulty={difficulty}
          character={activeCharacter}
          highScore={highScore}
          onGameEnd={endGame}
        />
      )}
    </div>
  );
};

export default App;
