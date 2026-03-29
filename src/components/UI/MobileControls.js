// src/components/UI/MobileControls.js
import React, { useState } from "react";

const MobileControls = ({ onTurnLeft, onTurnRight }) => {
  const isTouch =
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches;

  // ── DESKTOP: compact bottom-center keyboard hint widget ──
  if (!isTouch) {
    return (
      <div style={desktopWrapperStyle}>
        <TurnBtn onClick={onTurnLeft} label="◄" hint="A / ←" side="left" />

        <div style={kbHintStyle}>
          <div style={kbRowStyle}>
            <KbKey>A</KbKey>
            <Dim>or</Dim>
            <KbKey>←</KbKey>
            <div style={kbSepStyle} />
            <KbKey>D</KbKey>
            <Dim>or</Dim>
            <KbKey>→</KbKey>
          </div>
          <div style={kbRowStyle}>
            <KbKey wide>SPACE</KbKey>
            <Dim>· pause</Dim>
          </div>
        </div>

        <TurnBtn onClick={onTurnRight} label="►" hint="D / →" side="right" />
      </div>
    );
  }

  // ── MOBILE: full-screen tap zones with visual feedback ──
  return <MobileTapZones onTurnLeft={onTurnLeft} onTurnRight={onTurnRight} />;
};

/* ─── Mobile tap zones as a separate component to use hooks cleanly ─── */
const MobileTapZones = ({ onTurnLeft, onTurnRight }) => {
  const [leftActive, setLeftActive] = useState(false);
  const [rightActive, setRightActive] = useState(false);

  const handleLeft = (e) => {
    e.preventDefault();
    setLeftActive(true);
    onTurnLeft();
    setTimeout(() => setLeftActive(false), 150);
  };

  const handleRight = (e) => {
    e.preventDefault();
    setRightActive(true);
    onTurnRight();
    setTimeout(() => setRightActive(false), 150);
  };

  return (
    <div style={mobileWrapperStyle}>
      {/* LEFT ZONE */}
      <div
        style={mobileTouchZone}
        onPointerDown={handleLeft}
        onTouchStart={handleLeft}
      >
        <div style={{
          ...mobileBtnStyle,
          background: leftActive
            ? "rgba(0, 200, 255, 0.35)"
            : "rgba(255,255,255,0.12)",
          transform: leftActive ? "scale(0.9)" : "scale(1)",
          transition: "all 0.1s ease",
        }}>
          ↺
        </div>
      </div>

      {/* RIGHT ZONE */}
      <div
        style={mobileTouchZone}
        onPointerDown={handleRight}
        onTouchStart={handleRight}
      >
        <div style={{
          ...mobileBtnStyle,
          background: rightActive
            ? "rgba(0, 200, 255, 0.35)"
            : "rgba(255,255,255,0.12)",
          transform: rightActive ? "scale(0.9)" : "scale(1)",
          transition: "all 0.1s ease",
        }}>
          ↻
        </div>
      </div>
    </div>
  );
};

/* ─── Sub-components ─── */
const TurnBtn = ({ onClick, label, hint, side }) => (
  <button
    style={{
      ...desktopBtnBase,
      borderRadius: side === "left" ? "16px 8px 8px 16px" : "8px 16px 16px 8px",
    }}
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    title={`Turn ${side} (${hint})`}
  >
    <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>{label}</span>
    <span style={{ fontSize: "0.65rem", opacity: 0.5, letterSpacing: "0.5px", marginTop: "2px" }}>
      {hint}
    </span>
  </button>
);

const KbKey = ({ children, wide }) => (
  <span style={{ ...kbKeyStyle, minWidth: wide ? "54px" : "26px" }}>{children}</span>
);

const Dim = ({ children }) => (
  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.68rem" }}>{children}</span>
);

/* ─── Styles ─── */
const desktopWrapperStyle = {
  position: "absolute",
  bottom: "24px",
  left: "50%",
  transform: "translateX(-50%)",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  zIndex: 50,
  pointerEvents: "auto",
};

const desktopBtnBase = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "2px",
  width: "64px",
  height: "52px",
  background: "rgba(0,0,0,0.5)",
  border: "1px solid rgba(255,255,255,0.15)",
  backdropFilter: "blur(10px)",
  color: "rgba(255,255,255,0.8)",
  cursor: "pointer",
  fontFamily: "'Outfit', sans-serif",
  fontWeight: 800,
  transition: "all 0.15s ease",
  userSelect: "none",
  WebkitTapHighlightColor: "transparent",
};

const kbHintStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "7px",
  background: "rgba(0,0,0,0.4)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "12px",
  padding: "10px 16px",
  backdropFilter: "blur(10px)",
};

const kbRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "5px",
};

const kbKeyStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: "26px",
  height: "26px",
  padding: "0 6px",
  background: "rgba(255,255,255,0.1)",
  border: "1px solid rgba(255,255,255,0.2)",
  borderBottom: "3px solid rgba(255,255,255,0.15)",
  borderRadius: "6px",
  fontSize: "0.72rem",
  fontWeight: 700,
  color: "rgba(255,255,255,0.75)",
  fontFamily: "'Outfit', monospace",
};

const kbSepStyle = {
  width: "1px",
  height: "16px",
  background: "rgba(255,255,255,0.15)",
  margin: "0 4px",
};

const mobileWrapperStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  zIndex: 20,
  display: "flex",
  pointerEvents: "none",
};

const mobileTouchZone = {
  flex: 1,
  pointerEvents: "auto",
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
  paddingBottom: "50px",
  touchAction: "none",
  WebkitTapHighlightColor: "transparent",
  cursor: "pointer",
};

const mobileBtnStyle = {
  width: "76px",
  height: "76px",
  borderRadius: "50%",
  border: "2px solid rgba(255,255,255,0.3)",
  backdropFilter: "blur(8px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "30px",
  color: "rgba(255,255,255,0.9)",
  boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
};

export default MobileControls;
