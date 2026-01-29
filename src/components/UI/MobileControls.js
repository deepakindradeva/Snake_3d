// src/components/UI/MobileControls.js
import React from "react";

const MobileControls = ({ onTurnLeft, onTurnRight }) => {
  const containerStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 20, // Above the game canvas, below the HUD/Pause menus
    display: "flex",
    pointerEvents: "none", // Allow clicks to pass through the empty middle if needed
  };

  const touchZoneStyle = {
    flex: 1, // Each takes up 50% of the screen width
    pointerEvents: "auto", // Capture touches
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    touchAction: "none", // Prevent scrolling/zooming on mobile
    WebkitTapHighlightColor: "transparent", // Remove blue highlight on tap
  };

  const arrowStyle = {
    fontSize: "60px",
    color: "white",
    opacity: 0.3, // Subtle visibility
    filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.5))",
    userSelect: "none",
  };

  return (
    <div style={containerStyle}>
      {/* LEFT ZONE */}
      <div
        style={touchZoneStyle}
        onPointerDown={(e) => {
          e.preventDefault();
          onTurnLeft();
        }}>
        <span
          style={{ ...arrowStyle, marginRight: "auto", paddingLeft: "40px" }}>
          ⬅️
        </span>
      </div>

      {/* RIGHT ZONE */}
      <div
        style={touchZoneStyle}
        onPointerDown={(e) => {
          e.preventDefault();
          onTurnRight();
        }}>
        <span
          style={{ ...arrowStyle, marginLeft: "auto", paddingRight: "40px" }}>
          ➡️
        </span>
      </div>
    </div>
  );
};

export default MobileControls;
