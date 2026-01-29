// src/components/UI/Minimap.js
import React from "react";

const Minimap = ({ snake, food, obstacles, size }) => {
  // CONFIGURATION
  const MAP_SIZE = 140; // Size of the widget in pixels
  const ZOOM_RADIUS = 15; // How many tiles we see in each direction

  // Calculate the scale: Map pixels per Game tile
  // We want to fit (ZOOM_RADIUS * 2) tiles into MAP_SIZE
  const scale = MAP_SIZE / (ZOOM_RADIUS * 2);

  const head = snake[0] || { x: 0, y: 0 };

  // Helper to convert Game Coordinates -> Minimap Coordinates
  // Returns relative position centered on the snake
  const getRelativePos = (x, y) => {
    // 1. Calculate distance from snake head
    const dx = x - head.x;
    const dy = y - head.y;

    // 2. Scale it up to pixels
    // 3. Add half map size to center it (0,0 becomes center of widget)
    return {
      left: dx * scale + MAP_SIZE / 2,
      top: dy * scale + MAP_SIZE / 2,
    };
  };

  // Helper: Is this point inside the radar circle?
  const isVisible = (x, y) => {
    const dx = Math.abs(x - head.x);
    const dy = Math.abs(y - head.y);
    return dx < ZOOM_RADIUS && dy < ZOOM_RADIUS;
  };

  const getFoodColor = (type) => {
    switch (type) {
      case "banana":
        return "#FFEB3B";
      case "cherry":
        return "#880E4F";
      case "ice":
        return "#00B0FF";
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
        borderRadius: "50%", // Circle Shape
        backgroundColor: "rgba(255, 255, 255, 0.7)", // Frosted Glass
        backdropFilter: "blur(5px)",
        border: "4px solid #fff",
        boxShadow: "0 8px 32px rgba(0, 100, 200, 0.2)", // Soft Blue Shadow
        overflow: "hidden",
        zIndex: 90,
        transform: "rotate(180deg)", // Optional: Matches coordinate system if needed
      }}>
      {/* 1. OBSTACLES (Only render nearby ones) */}
      {obstacles
        .filter((o) => isVisible(o.x, o.y))
        .map((obs) => {
          const pos = getRelativePos(obs.x, obs.y);
          // Different colors for rocks vs trees
          const color = obs.type === "rock" ? "#90A4AE" : "#66BB6A";
          const sizePx = obs.type === "rock" ? scale * 1.2 : scale * 0.8;

          return (
            <div
              key={obs.id}
              style={{
                position: "absolute",
                left: pos.left,
                top: pos.top,
                width: `${sizePx}px`,
                height: `${sizePx}px`,
                backgroundColor: color,
                borderRadius: obs.type === "rock" ? "20%" : "50%",
                transform: "translate(-50%, -50%)", // Center on coordinate
              }}
            />
          );
        })}

      {/* 2. SNAKE BODY */}
      {snake.map((segment, i) => {
        if (!isVisible(segment.x, segment.y)) return null;
        const pos = getRelativePos(segment.x, segment.y);
        const isHead = i === 0;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: pos.left,
              top: pos.top,
              width: isHead ? `${scale * 1.5}px` : `${scale}px`,
              height: isHead ? `${scale * 1.5}px` : `${scale}px`,
              backgroundColor: isHead ? "#0277BD" : "#29B6F6", // Dark head, light body
              borderRadius: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: isHead ? 10 : 5,
            }}
          />
        );
      })}

      {/* 3. FOOD */}
      {isVisible(food.x, food.y) && (
        <div
          style={{
            position: "absolute",
            left: getRelativePos(food.x, food.y).left,
            top: getRelativePos(food.x, food.y).top,
            width: `${scale * 1.8}px`,
            height: `${scale * 1.8}px`,
            backgroundColor: getFoodColor(food.type),
            borderRadius: "50%",
            boxShadow: `0 0 6px ${getFoodColor(food.type)}`,
            animation: "pulse 1s infinite", // Make it blink
            transform: "translate(-50%, -50%)",
            zIndex: 15,
          }}
        />
      )}

      {/* 4. PLAYER MARKER (Center Crosshair) */}
      {/* Since map moves around us, we are always effectively at center, 
          but drawing the snake body above handles this visual. 
          We can add a faint grid or ring to look cool. */}
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
