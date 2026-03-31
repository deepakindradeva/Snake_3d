// src/hooks/useSounds.js
// Web Audio API sound engine — no external files needed, all sounds synthesized.
import { useRef, useCallback } from "react";

const vibrate = (pattern) => {
  try {
    if (navigator.vibrate) navigator.vibrate(pattern);
  } catch (_) {}
};

const useSounds = () => {
  const ctxRef = useRef(null);

  const getCtx = () => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume if suspended (browser autoplay policy)
    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  };

  // Helper: create oscillator burst
  const burst = useCallback((freq, type, duration, gain = 0.3, decay = "linear") => {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gainNode.gain.setValueAtTime(gain, ctx.currentTime);
      if (decay === "linear") {
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
      } else {
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      }
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch (_) {}
  }, []);

  const play = useCallback((type, comboLevel = 1) => {
    try {
      switch (type) {
        case "eat": {
          // Pleasant pop, pitch scales with combo
          const f = Math.min(800, 300 + comboLevel * 80);
          burst(f, "sine", 0.12, 0.25, "exp");
          setTimeout(() => burst(f * 1.5, "sine", 0.08, 0.1, "exp"), 60);
          vibrate(30);
          break;
        }
        case "combo": {
          // Rising chime
          const notes = [400, 500, 630, 800, 1000];
          const n = Math.min(comboLevel - 1, notes.length - 1);
          for (let i = 0; i <= n; i++) {
            setTimeout(() => burst(notes[i], "sine", 0.15, 0.2, "exp"), i * 80);
          }
          // Escalating pulse pattern: more pulses for higher combo
          const pulses = [];
          for (let i = 0; i <= n; i++) { pulses.push(40, 30); }
          vibrate(pulses);
          break;
        }
        case "level_up": {
          // Fanfare arpeggio
          [440, 550, 660, 880].forEach((f, i) =>
            setTimeout(() => burst(f, "triangle", 0.25, 0.3, "exp"), i * 100)
          );
          vibrate([50, 50, 50, 50, 100]);
          break;
        }
        case "crash": {
          // Thud + noise-like
          burst(80, "sawtooth", 0.3, 0.5, "exp");
          setTimeout(() => burst(50, "square", 0.2, 0.4, "exp"), 80);
          vibrate(200);
          break;
        }
        case "shield_break": {
          burst(300, "square", 0.15, 0.4, "exp");
          setTimeout(() => burst(150, "square", 0.15, 0.3, "exp"), 80);
          vibrate([80, 40, 80]);
          break;
        }
        case "portal": {
          // Sci-fi whoosh
          const ctx = getCtx();
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          osc.connect(gainNode);
          gainNode.connect(ctx.destination);
          osc.type = "sine";
          osc.frequency.setValueAtTime(200, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.4);
          gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
          gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.4);
          vibrate([20, 30, 20, 30, 60]);
          break;
        }
        case "power_up": {
          // Sparkle ascending
          [600, 800, 1000, 1200].forEach((f, i) =>
            setTimeout(() => burst(f, "sine", 0.1, 0.2, "exp"), i * 60)
          );
          vibrate([40, 20, 40, 20, 80]);
          break;
        }
        case "game_over": {
          // Descending sad tone
          [440, 370, 280, 220].forEach((f, i) =>
            setTimeout(() => burst(f, "triangle", 0.3, 0.35, "exp"), i * 150)
          );
          vibrate([100, 50, 100, 50, 300]);
          break;
        }
        default:
          break;
      }
    } catch (_) {}
  }, [burst]);

  return { play };
};

export default useSounds;
