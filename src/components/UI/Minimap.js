// src/components/UI/Minimap.js
import React from "react";

const Minimap = ({ snake, foods, obstacles, size }) => {
  // CONFIGURATION
  const MAP_SIZE = 140;
  const ZOOM_RADIUS = 15; // The actual visible radius logic

  // Scale: How many pixels per game tile
  const scale = MAP_SIZE / (ZOOM_RADIUS * 2);

  const head = snake[0] || { x: 0, y: 0 };

  // Helper to get position relative to center of minimap
  // RETURNS: { left, top, isOutOfBounds, rotation (if out of bounds) }
  const getDisplayProps = (targetX, targetY) => {
    const dx = targetX - head.x;
    const dy = targetY - head.y;

    // Distance from snake head
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Default: It is inside the view
    if (dist <= ZOOM_RADIUS) {
      return {
        left: dx * scale + MAP_SIZE / 2,
        top: dy * scale + MAP_SIZE / 2,
        isOutOfBounds: false,
      };
    }

    // Out of Bounds Logic: Clamp to edge
    // 1. Calculate angle
    const angle = Math.atan2(dy, dx);

    // 2. Place on the edge (radius of the widget is MAP_SIZE / 2)
    // We subtract a small margin (e.g. 10px) so the icon doesn't clip slightly
    const edgeRadius = MAP_SIZE / 2 - 8;

    return {
      left: Math.cos(angle) * edgeRadius + MAP_SIZE / 2,
      top: Math.sin(angle) * edgeRadius + MAP_SIZE / 2,
      isOutOfBounds: true,
      angle: angle, // Useful if we want to rotate an arrow
    };
  };

  const getFoodColor = (type) => {
    switch (type) {
      case "banana":
        return "#FFEB3B";
      case "cherry":
        return "#880E4F";
      case "ice":
        return "#00B0FF";
      case "star":
        return "#FFD700";
      default:
        return "#D32F2F";
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "20px",
        left: "20px",
        width: `${MAP_SIZE}px`,
        height: `${MAP_SIZE}px`,
        borderRadius: "50%",
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(5px)",
        border: "4px solid #fff",
        boxShadow: "0 8px 32px rgba(0, 100, 200, 0.2)",
        overflow: "hidden", // Keeps things circular
        zIndex: 90,
        transform: "rotate(180deg)",
      }}>
      {/* 1. OBSTACLES (Only nearby ones) */}
      {obstacles.map((obs) => {
        const props = getDisplayProps(obs.x, obs.y);
        // Don't show obstacles that are far away, clutter
        if (props.isOutOfBounds) return null;

        const color = obs.type === "rock" ? "#90A4AE" : "#66BB6A";
        const sizePx = obs.type === "rock" ? scale * 1.2 : scale * 0.8;

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
              borderRadius: obs.type === "rock" ? "20%" : "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        );
      })}

      {/* 2. FOOD (Show ALL of them, even far away) */}
      {foods &&
        foods.map((f) => {
          const props = getDisplayProps(f.x, f.y);
          const color = getFoodColor(f.type);

          return (
            <div
              key={f.id}
              style={{
                position: "absolute",
                left: props.left,
                top: props.top,
                // If far away, make it smaller
                width: props.isOutOfBounds ? `${scale}px` : `${scale * 1.8}px`,
                height: props.isOutOfBounds ? `${scale}px` : `${scale * 1.8}px`,
                backgroundColor: color,
                borderRadius: "50%",
                boxShadow: `0 0 6px ${color}`,
                // If far away, blink faster or look different
                animation: props.isOutOfBounds
                  ? "pulse 0.5s infinite"
                  : "pulse 1s infinite",
                transform: "translate(-50%, -50%)",
                zIndex: 15,
                // Optional: Add an arrow if out of bounds?
                // For now, just sticking to the edge is usually enough cue.
              }}
            />
          );
        })}

      {/* 3. SNAKE BODY */}
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
              width: isHead ? `${scale * 1.5}px` : `${scale}px`,
              height: isHead ? `${scale * 1.5}px` : `${scale}px`,
              backgroundColor: isHead ? "#0277BD" : "#29B6F6",
              borderRadius: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: isHead ? 10 : 5,
            }}
          />
        );
      })}

      {/* Center Grid Lines */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "100%",
          height: "1px",
          background: "rgba(0,0,0,0.1)",
          transform: "translate(-50%, -50%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "1px",
          height: "100%",
          background: "rgba(0,0,0,0.1)",
          transform: "translate(-50%, -50%)",
        }}
      />
    </div>
  );
};

export default Minimap;
