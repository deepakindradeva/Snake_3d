// src/components/UI/GameHUD.js
import React from "react";

const GameHUD = ({ score, distance, level, isPaused, onTogglePause, onExit, lives, combo, isInvincible, hasShield, isMagnet }) => {
  return (
    <>
      {/* ── LEFT: STATS PANEL ── */}
      <div className="hud-stats">
        {/* Lives */}
        <div className="stat-row">
          <span className="stat-icon">❤️</span>
          <span className="stat-value">{lives}</span>
        </div>
        <div className="stat-divider" />

        {/* Score */}
        <div className="stat-row">
          <span className="stat-icon">🏆</span>
          <span className="stat-value">{score}</span>
        </div>
        <div className="stat-divider" />

        {/* Level */}
        <div className="stat-row">
          <span className="stat-icon">⬆️</span>
          <span className="stat-value hud-level">Lv{level}</span>
        </div>
        <div className="stat-divider" />

        {/* Distance */}
        <div className="stat-row">
          <span className="stat-icon">👣</span>
          <span className="stat-value">{distance}m</span>
        </div>
      </div>

      {/* ── COMBO BADGE ── */}
      {combo > 1 && (
        <div className={`combo-badge ${combo >= 8 ? "c8" : combo >= 5 ? "c5" : combo >= 3 ? "c3" : "c2"}`}>
          <span className="combo-x">x{combo}</span>
          <span className="combo-label">COMBO</span>
        </div>
      )}

      {/* ── ABILITY PILLS (below HUD, top-left) ── */}
      {(isInvincible || hasShield || isMagnet) && (
        <div className="ability-pills">
          {isInvincible && <span className="ability-pill invincible">⭐ INVINCIBLE</span>}
          {hasShield    && <span className="ability-pill shield">🛡️ SHIELD</span>}
          {isMagnet     && <span className="ability-pill magnet">🧲 MAGNET</span>}
        </div>
      )}

      {/* ── RIGHT: ACTION BUTTONS ── */}
      <div className="hud-controls">
        <button
          className={`hud-btn pause-btn ${isPaused ? "active" : ""}`}
          onClick={onTogglePause}
          title="Pause (Space / P)"
        >
          {isPaused ? "▶" : "⏸"}
        </button>
        <button className="hud-btn exit-btn" onClick={onExit} title="Quit">
          ✕
        </button>
      </div>
    </>
  );
};

export default GameHUD;
