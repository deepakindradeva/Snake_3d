// src/components/UI/Minimap.js
import React from "react";

const Minimap = ({ snake, foods, obstacles, enemies, portals, size }) => {
  const isMobile = window.innerWidth < 768;
  const MAP_SIZE = isMobile ? 100 : 140;
  const ZOOM_RADIUS = 15;
  const scale = MAP_SIZE / (ZOOM_RADIUS * 2);
  const head = snake[0] || { x: 0, y: 0 };

  // Returns { left, top, isOutOfBounds } relative to minimap center
  const getDisplayProps = (targetX, targetY) => {
    const dx = targetX - head.x;
    const dy = targetY - head.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= ZOOM_RADIUS) {
      return {
        left: dx * scale + MAP_SIZE / 2,
        top:  dy * scale + MAP_SIZE / 2,
        isOutOfBounds: false,
      };
    }

    const angle = Math.atan2(dy, dx);
    const edgeRadius = MAP_SIZE / 2 - 8;
    return {
      left: Math.cos(angle) * edgeRadius + MAP_SIZE / 2,
      top:  Math.sin(angle) * edgeRadius + MAP_SIZE / 2,
      isOutOfBounds: true,
      angle,
    };
  };

  const getFoodColor = (type) => {
    switch (type) {
      case "banana":   return "#FFEB3B";
      case "cherry":   return "#E91E63";
      case "ice":      return "#00B0FF";
      case "star":     return "#FFD700";
      case "shield":   return "#448AFF";
      case "magnet":   return "#FF5252";
      case "mushroom": return "#FF7043";
      default:         return "#D32F2F";
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: "20px",
        right: "20px",
        width: `${MAP_SIZE}px`,
        height: `${MAP_SIZE}px`,
        borderRadius: "50%",
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        backdropFilter: "blur(6px)",
        border: "2px solid rgba(255,255,255,0.15)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.06)",
        overflow: "hidden",
        zIndex: 50,
        // No rotation — correct orientation
      }}
    >
      {/* 1. OBSTACLES (only nearby) */}
      {obstacles.map((obs) => {
        const props = getDisplayProps(obs.x, obs.y);
        if (props.isOutOfBounds) return null;
        const color = obs.type === "rock" ? "#78909C" : "#4CAF50";
        const sizePx = scale * 0.9;
        return (
          <div
            key={obs.id}
            style={{
              position: "absolute",
              left: props.left,
              top: props.top,
              width: `${sizePx}px`,
              height: `${sizePx}px`,
              backgroundColor: color,
              borderRadius: obs.type === "rock" ? "25%" : "50%",
              opacity: 0.6,
              transform: "translate(-50%, -50%)",
            }}
          />
        );
      })}

      {/* 2. PORTALS */}
      {portals && portals.map((p) => {
        const props = getDisplayProps(p.x, p.y);
        return (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: props.left,
              top: props.top,
              width: `${scale * 1.4}px`,
              height: `${scale * 1.4}px`,
              backgroundColor: "#CE93D8",
              borderRadius: "50%",
              boxShadow: "0 0 6px #CE93D8",
              transform: "translate(-50%, -50%)",
              zIndex: 8,
              animation: "pulse 1.2s ease-in-out infinite",
            }}
          />
        );
      })}

      {/* 3. ENEMIES */}
      {enemies && enemies.map((e) => {
        const props = getDisplayProps(e.x, e.y);
        return (
          <div
            key={e.id}
            style={{
              position: "absolute",
              left: props.left,
              top: props.top,
              width: `${scale * 1.6}px`,
              height: `${scale * 1.6}px`,
              backgroundColor: "#FF1744",
              borderRadius: "50%",
              boxShadow: "0 0 8px #FF1744",
              transform: "translate(-50%, -50%)",
              zIndex: 12,
              animation: "pulse 0.6s ease-in-out infinite",
            }}
          />
        );
      })}

      {/* 4. FOOD */}
      {foods && foods.map((f) => {
        const props = getDisplayProps(f.x, f.y);
        const color = getFoodColor(f.type);
        return (
          <div
            key={f.id}
            style={{
              position: "absolute",
              left: props.left,
              top: props.top,
              width: props.isOutOfBounds ? `${scale}px` : `${scale * 1.6}px`,
              height: props.isOutOfBounds ? `${scale}px` : `${scale * 1.6}px`,
              backgroundColor: color,
              borderRadius: "50%",
              boxShadow: `0 0 5px ${color}`,
              animation: props.isOutOfBounds ? "pulse 0.5s infinite" : "pulse 1s infinite",
              transform: "translate(-50%, -50%)",
              zIndex: 15,
            }}
          />
        );
      })}

      {/* 5. SNAKE BODY */}
      {snake.map((segment, i) => {
        const props = getDisplayProps(segment.x, segment.y);
        if (props.isOutOfBounds) return null;
        const isHead = i === 0;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: props.left,
              top: props.top,
              width: isHead ? `${scale * 1.8}px` : `${scale * 1.1}px`,
              height: isHead ? `${scale * 1.8}px` : `${scale * 1.1}px`,
              backgroundColor: isHead ? "#00E5FF" : "rgba(0, 200, 255, 0.7)",
              borderRadius: "50%",
              boxShadow: isHead ? "0 0 6px #00E5FF" : "none",
              transform: "translate(-50%, -50%)",
              zIndex: isHead ? 20 : 10,
            }}
          />
        );
      })}

      {/* Center crosshair */}
      <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: "1px", background: "rgba(255,255,255,0.08)", transform: "translateY(-50%)" }} />
      <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: "1px", background: "rgba(255,255,255,0.08)", transform: "translateX(-50%)" }} />

      {/* "N" North indicator */}
      <div style={{
        position: "absolute",
        top: "4px",
        left: "50%",
        transform: "translateX(-50%)",
        fontSize: "8px",
        fontWeight: 900,
        color: "rgba(255,255,255,0.4)",
        letterSpacing: "1px",
        fontFamily: "'Outfit', sans-serif",
      }}>N</div>
    </div>
  );
};

export default Minimap;
