// src/components/UI/FloatingScore.js
import React, { useEffect, useState } from "react";

/**
 * FloatingScore - Shows a "+N" or event label that floats up and fades out
 * over the game canvas when food is eaten.
 */
const FloatingScore = ({ id, value, label, color, x, y, onDone }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      onDone(id);
    }, 1200);
    return () => clearTimeout(t);
  }, [id, onDone]);

  if (!visible) return null;

  const text = label || (value > 0 ? `+${value}` : `${value}`);

  return (
    <div
      style={{
        position: "absolute",
        // x/y are grid coords; map them as percentages across the center viewport
        left: `${50 + (x - 30) * 0.8}%`,
        top: `${50 + (y - 30) * 0.8}%`,
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        zIndex: 500,
        animation: "floatUp 1.2s ease-out forwards",
        color: color || "#FFD700",
        fontFamily: "'Outfit', sans-serif",
        fontWeight: 900,
        fontSize: "1.5rem",
        textShadow: `0 2px 8px rgba(0,0,0,0.7), 0 0 12px ${color || "#FFD700"}`,
        letterSpacing: "1px",
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};

export default FloatingScore;
