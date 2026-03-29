// src/components/UI/AchievementToast.js
import React, { useEffect, useState } from "react";

const AchievementToast = ({ achievement, onDone }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!achievement) return;
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 400);
    }, 3200);
    return () => clearTimeout(t);
  }, [achievement, onDone]);

  if (!achievement) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: "80px",
        right: "20px",
        zIndex: 3000,
        transform: visible ? "translateX(0)" : "translateX(120%)",
        opacity: visible ? 1 : 0,
        transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        background: "linear-gradient(135deg, rgba(20,20,40,0.97), rgba(30,15,50,0.97))",
        border: "1px solid rgba(168, 85, 247, 0.5)",
        borderRadius: "16px",
        padding: "14px 18px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(168,85,247,0.15), 0 0 40px rgba(168,85,247,0.15)",
        maxWidth: "320px",
        pointerEvents: "none",
      }}
    >
      <div style={{ fontSize: "2rem", flexShrink: 0 }}>{achievement.icon}</div>
      <div>
        <div style={{
          fontSize: "0.62rem",
          fontWeight: 800,
          color: "#a855f7",
          letterSpacing: "2px",
          textTransform: "uppercase",
          marginBottom: "3px",
          fontFamily: "'Outfit', sans-serif",
        }}>
          🏅 Achievement Unlocked!
        </div>
        <div style={{
          fontSize: "1rem",
          fontWeight: 800,
          color: "#fff",
          fontFamily: "'Outfit', sans-serif",
        }}>
          {achievement.name}
        </div>
        <div style={{
          fontSize: "0.8rem",
          color: "rgba(255,255,255,0.5)",
          marginTop: "2px",
          fontFamily: "'Outfit', sans-serif",
        }}>
          {achievement.desc}
        </div>
      </div>
    </div>
  );
};

export default AchievementToast;
