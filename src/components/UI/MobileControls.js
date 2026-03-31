// src/components/UI/MobileControls.js
import React, { useState, useRef } from "react";

// ─── Swipe → relative turn conversion ────────────────────────────────────────
// The snake engine only understands turnLeft / turnRight (relative turns).
// We convert a 4-directional swipe to the correct relative turn by computing
// the 2D cross-product of the swipe vector with the current heading:
//   cross > 0  →  turn right
//   cross < 0  →  turn left
//   cross = 0  →  forward or backward (ignore)

const swipeToDirVector = (deltaX, deltaY) => {
  if (Math.abs(deltaX) >= Math.abs(deltaY)) {
    return deltaX > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
  }
  return deltaY > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
};

// cross(a, b) = a.x * b.y - a.y * b.x  (2D pseudo cross-product)
const cross2D = (a, b) => a.x * b.y - a.y * b.x;

const MIN_SWIPE_PX = 30; // minimum drag distance to register as a swipe

// ─── Main component ───────────────────────────────────────────────────────────
const MobileControls = ({ onTurnLeft, onTurnRight, currentDir }) => {
  const isTouch =
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches;

  if (!isTouch) {
    return (
      <div style={desktopWrapperStyle}>
        <TurnBtn onClick={onTurnLeft}  label="◄" hint="A / ←" side="left"  />
        <div style={kbHintStyle}>
          <div style={kbRowStyle}>
            <KbKey>A</KbKey><Dim>or</Dim><KbKey>←</KbKey>
            <div style={kbSepStyle} />
            <KbKey>D</KbKey><Dim>or</Dim><KbKey>→</KbKey>
          </div>
          <div style={kbRowStyle}><KbKey wide>SPACE</KbKey><Dim>· pause</Dim></div>
        </div>
        <TurnBtn onClick={onTurnRight} label="►" hint="D / →" side="right" />
      </div>
    );
  }

  return (
    <SwipeDetector
      onTurnLeft={onTurnLeft}
      onTurnRight={onTurnRight}
      currentDir={currentDir}
    />
  );
};

// ─── SwipeDetector ────────────────────────────────────────────────────────────
const SwipeDetector = ({ onTurnLeft, onTurnRight, currentDir }) => {
  const touchStartRef = useRef(null);
  const [swipeHint, setSwipeHint]   = useState(null); // "left" | "right" | "up" | "down"
  const [leftActive, setLeftActive] = useState(false);
  const [rightActive, setRightActive] = useState(false);

  const handleTouchStart = (e) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartRef.current.x;
    const dy = t.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < MIN_SWIPE_PX) return; // too short — treat as tap, ignore

    const swipeDir = swipeToDirVector(dx, dy);

    // Determine swipe label for visual feedback
    const label =
      swipeDir.x === 1  ? "right" :
      swipeDir.x === -1 ? "left"  :
      swipeDir.y === 1  ? "down"  : "up";
    setSwipeHint(label);
    setTimeout(() => setSwipeHint(null), 350);

    // Convert to relative turn
    const dir = currentDir || { x: 1, y: 0 };
    const c   = cross2D(dir, swipeDir);
    if (c > 0) {
      setRightActive(true);
      onTurnRight();
      setTimeout(() => setRightActive(false), 150);
    } else if (c < 0) {
      setLeftActive(true);
      onTurnLeft();
      setTimeout(() => setLeftActive(false), 150);
    }
    // c === 0 means forward or backward — intentionally ignored
  };

  // Fallback tap zones (left / right halves) still work for quick taps
  const handleTapLeft = (e) => {
    e.stopPropagation();
    setLeftActive(true);
    onTurnLeft();
    setTimeout(() => setLeftActive(false), 150);
  };
  const handleTapRight = (e) => {
    e.stopPropagation();
    setRightActive(true);
    onTurnRight();
    setTimeout(() => setRightActive(false), 150);
  };

  return (
    <div
      style={swipeWrapperStyle}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Left tap zone */}
      <div style={tapZoneStyle} onPointerDown={handleTapLeft}>
        <div style={{
          ...circleBtnStyle,
          background: leftActive ? "rgba(0,200,255,0.35)" : "rgba(255,255,255,0.10)",
          transform:  leftActive ? "scale(0.88)" : "scale(1)",
        }}>↺</div>
      </div>

      {/* Swipe hint arrow — appears briefly after each swipe */}
      <div style={hintContainerStyle}>
        {swipeHint && (
          <div style={swipeArrowStyle}>
            {swipeHint === "up"    && "↑"}
            {swipeHint === "down"  && "↓"}
            {swipeHint === "left"  && "←"}
            {swipeHint === "right" && "→"}
          </div>
        )}
        {/* Swipe guidance icon — always visible, subtle */}
        <div style={swipeGuideStyle}>⟵ swipe ⟶</div>
      </div>

      {/* Right tap zone */}
      <div style={tapZoneStyle} onPointerDown={handleTapRight}>
        <div style={{
          ...circleBtnStyle,
          background: rightActive ? "rgba(0,200,255,0.35)" : "rgba(255,255,255,0.10)",
          transform:  rightActive ? "scale(0.88)" : "scale(1)",
        }}>↻</div>
      </div>
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const TurnBtn = ({ onClick, label, hint, side }) => (
  <button
    style={{
      ...desktopBtnBase,
      borderRadius: side === "left" ? "16px 8px 8px 16px" : "8px 16px 16px 8px",
    }}
    onPointerDown={(e) => { e.preventDefault(); onClick(); }}
    title={`Turn ${side} (${hint})`}
  >
    <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>{label}</span>
    <span style={{ fontSize: "0.65rem", opacity: 0.5, letterSpacing: "0.5px", marginTop: "2px" }}>{hint}</span>
  </button>
);

const KbKey = ({ children, wide }) => (
  <span style={{ ...kbKeyStyle, minWidth: wide ? "54px" : "26px" }}>{children}</span>
);
const Dim = ({ children }) => (
  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.68rem" }}>{children}</span>
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const desktopWrapperStyle = {
  position: "absolute", bottom: "24px", left: "50%", transform: "translateX(-50%)",
  display: "flex", alignItems: "center", gap: "10px", zIndex: 50, pointerEvents: "auto",
};

const desktopBtnBase = {
  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
  gap: "2px", width: "64px", height: "52px",
  background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.15)",
  backdropFilter: "blur(10px)", color: "rgba(255,255,255,0.8)",
  cursor: "pointer", fontFamily: "'Outfit', sans-serif", fontWeight: 800,
  transition: "all 0.15s ease", userSelect: "none", WebkitTapHighlightColor: "transparent",
};

const kbHintStyle = {
  display: "flex", flexDirection: "column", alignItems: "center", gap: "7px",
  background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "12px", padding: "10px 16px", backdropFilter: "blur(10px)",
};
const kbRowStyle  = { display: "flex", alignItems: "center", gap: "5px" };
const kbKeyStyle  = {
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  minWidth: "26px", height: "26px", padding: "0 6px",
  background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
  borderBottom: "3px solid rgba(255,255,255,0.15)", borderRadius: "6px",
  fontSize: "0.72rem", fontWeight: 700, color: "rgba(255,255,255,0.75)",
  fontFamily: "'Outfit', monospace",
};
const kbSepStyle  = { width: "1px", height: "16px", background: "rgba(255,255,255,0.15)", margin: "0 4px" };

// Mobile swipe overlay — covers the full screen
const swipeWrapperStyle = {
  position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
  zIndex: 20, display: "flex", pointerEvents: "none", touchAction: "none",
};

const tapZoneStyle = {
  flex: 1, pointerEvents: "auto",
  display: "flex", alignItems: "flex-end", justifyContent: "center",
  paddingBottom: "50px", touchAction: "none",
  WebkitTapHighlightColor: "transparent", cursor: "pointer",
};

const circleBtnStyle = {
  width: "76px", height: "76px", borderRadius: "50%",
  border: "2px solid rgba(255,255,255,0.3)", backdropFilter: "blur(8px)",
  display: "flex", alignItems: "center", justifyContent: "center",
  fontSize: "30px", color: "rgba(255,255,255,0.9)",
  boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
  transition: "all 0.1s ease",
};

const hintContainerStyle = {
  position: "absolute", top: "50%", left: "50%",
  transform: "translate(-50%, -50%)",
  display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
  pointerEvents: "none",
};

const swipeArrowStyle = {
  fontSize: "52px", color: "rgba(0,220,255,0.85)",
  textShadow: "0 0 16px rgba(0,220,255,0.7)",
  animation: "fadeOut 0.35s ease forwards",
};

const swipeGuideStyle = {
  fontSize: "0.7rem", color: "rgba(255,255,255,0.22)",
  letterSpacing: "2px", fontFamily: "'Outfit', sans-serif",
  userSelect: "none",
};

export default MobileControls;
