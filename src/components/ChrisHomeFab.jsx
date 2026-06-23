// ChrisHomeFab.jsx
// Self-contained React port of the Flutter ChrisHomeFab widget.
// Dependencies: React 18+. No external packages required.
// Usage: <ChrisHomeFab onSend={(text) => console.log(text)} />

import { useEffect, useRef, useState, useCallback } from "react";

// ── Constants ──────────────────────────────────────────────────────────────────
const TEAL = "#00D4B8";
const SHEET_BG = "#0D0D22";
const STRAND_COLORS = ["#5B21B6", "#4C1D95"];
const STRAND_COUNT = 4;
const AMPLITUDE = 1.3;
const WAVINESS = 2.0;
const THICKNESS = 0.35;
const GLOW = 2.1;
const TAPER = 0.5;
const SPREAD = 0.7;
const SCALE = 1.5;
const INTENSITY = 0.6;

// ── Strands Canvas Painter ─────────────────────────────────────────────────────
function drawStrands(canvas, time, pulseValue, speed) {
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(cx, cy);

  ctx.clearRect(0, 0, w, h);

  // Clip to circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();

  const tt = time * speed;

  for (let i = 0; i < STRAND_COUNT; i++) {
    const fi = i;
    const ph = fi * 1.7 * SPREAD;
    const freq = (2.0 + fi * 0.35) * WAVINESS;
    const spd = 1.4 + fi * 1.2;
    const color = STRAND_COLORS[i % STRAND_COLORS.length];

    const points = [];
    for (let step = 0; step <= 80; step++) {
      const t = step / 80;
      const uvx = (t - 0.5) / SCALE;
      const envRaw = Math.cos(uvx * Math.PI * 1.3);
      const env = envRaw > 0 ? Math.pow(envRaw, TAPER) : 0;
      const wVal =
        Math.sin(uvx * freq + tt * spd + ph) * 0.6 +
        Math.sin(uvx * freq * 1.1 - tt * spd * 0.7 + ph * 1.7) * 0.4;
      const amp = (0.1 + 0.02 * INTENSITY) * env * AMPLITUDE;
      points.push([t * w, cy + wVal * amp * h * SCALE]);
    }

    const baseStroke = THICKNESS * r * 0.07;
    const pulseBoost = 1.0 + pulseValue * 0.5;

    const drawPath = (alpha, strokeW, blur) => {
      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);
      for (let p = 1; p < points.length; p++) {
        ctx.lineTo(points[p][0], points[p][1]);
      }
      ctx.strokeStyle = hexToRgba(color, alpha);
      ctx.lineWidth = strokeW;
      ctx.lineCap = "round";
      if (blur > 0) {
        ctx.shadowBlur = blur;
        ctx.shadowColor = color;
      } else {
        ctx.shadowBlur = 0;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    // Outer bloom
    drawPath(0.08, baseStroke * 7 * GLOW * pulseBoost, 8);
    // Inner halo
    drawPath(0.28, baseStroke * 2.5, 2);
    // Bright core
    drawPath(0.52, baseStroke, 0);
  }

  ctx.restore();

  // Teal pulse ring
  if (pulseValue > 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, r - 1, 0, Math.PI * 2);
    ctx.strokeStyle = hexToRgba(TEAL, 0.2 + 0.4 * pulseValue);
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 4 + 8 * pulseValue;
    ctx.shadowColor = TEAL;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ── FAB Orb ────────────────────────────────────────────────────────────────────
function StrandsOrb({ size, pulseValue, speed }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = size * window.devicePixelRatio;
    canvas.height = size * window.devicePixelRatio;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    const ctx = canvas.getContext("2d");
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const animate = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = (ts - startRef.current) / 1000;
      drawStrands(canvas, elapsed, pulseValue, speed);
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [size, pulseValue, speed]);

  return <canvas ref={canvasRef} style={{ display: "block" }} />;
}

// ── Bottom Sheet ───────────────────────────────────────────────────────────────
function ChrisSheet({ onClose, onSend }) {
  const [text, setText] = useState("");
  const [voiceActive, setVoiceActive] = useState(false);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const toggleVoice = useCallback(async () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (voiceActive) {
      recognitionRef.current?.stop();
      setVoiceActive(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    recognitionRef.current = rec;

    rec.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join("");
      setText(transcript);
      if (e.results[e.results.length - 1].isFinal && transcript.trim()) {
        setVoiceActive(false);
        rec.stop();
        onSend(transcript.trim());
        onClose();
      }
    };

    rec.onend = () => setVoiceActive(false);
    rec.start();
    setText("");
    setVoiceActive(true);
  }, [voiceActive, onSend, onClose]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    onClose();
  };

  const hasText = text.trim().length > 0;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.sheet} onClick={(e) => e.stopPropagation()}>
        {/* Voice indicator */}
        <div
          style={{
            ...styles.voiceIndicator,
            height: voiceActive ? 48 : 0,
            overflow: "hidden",
            transition: "height 200ms ease",
          }}
        >
          {voiceActive && (
            <div style={styles.voiceRow}>
              <span style={styles.dot} />
              <span style={{ color: hexToRgba(TEAL, 0.85), fontSize: 13, fontWeight: 500 }}>
                Listening…
              </span>
            </div>
          )}
        </div>

        {/* Input row */}
        <div style={styles.inputRow}>
          <div
            style={{
              ...styles.inputWrap,
              borderColor: voiceActive
                ? hexToRgba(TEAL, 0.55)
                : "rgba(255,255,255,0.09)",
            }}
          >
            <textarea
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={voiceActive ? "Speak now…" : "Message Chris…"}
              rows={1}
              style={{
                ...styles.textarea,
                color: "white",
                caretColor: TEAL,
              }}
            />
          </div>

          {/* Mic / Send button */}
          <button
            onClick={hasText ? handleSend : toggleVoice}
            style={{
              ...styles.actionBtn,
              background: hasText
                ? TEAL
                : voiceActive
                ? hexToRgba(TEAL, 0.18)
                : "#1A1A30",
              border: hasText
                ? "none"
                : `1px solid ${voiceActive ? hexToRgba(TEAL, 0.65) : "rgba(255,255,255,0.12)"}`,
              boxShadow: hasText
                ? `0 0 12px 1px ${hexToRgba(TEAL, 0.35)}`
                : "none",
            }}
          >
            {hasText ? (
              <ArrowUpIcon />
            ) : voiceActive ? (
              <MicIcon color={TEAL} />
            ) : (
              <MicIcon color="rgba(255,255,255,0.45)" />
            )}
          </button>
        </div>

        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

// ── Icon helpers ───────────────────────────────────────────────────────────────
function ArrowUpIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
      <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z" />
    </svg>
  );
}

function MicIcon({ color }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={color}>
      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
    </svg>
  );
}

// ── Main FAB ───────────────────────────────────────────────────────────────────
export default function ChrisHomeFab({ size = 56, onSend }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [wakeActive, setWakeActive] = useState(false);
  const [respondingMode, setRespondingMode] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [glowPulse, setGlowPulse] = useState(0);

  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, origX: 0, origY: 0 });
  const recognitionRef = useRef(null);
  const glowRafRef = useRef(null);
  const glowStartRef = useRef(null);

  // Glow pulse animation (mirrors Flutter's AnimationController repeat reverse)
  useEffect(() => {
    if (!wakeActive) {
      setGlowPulse(0);
      cancelAnimationFrame(glowRafRef.current);
      return;
    }
    glowStartRef.current = null;
    const animate = (ts) => {
      if (!glowStartRef.current) glowStartRef.current = ts;
      const elapsed = (ts - glowStartRef.current) / 1200; // 1200ms period
      const t = elapsed % 1;
      // ping-pong: 0→1→0
      const pulse = t < 0.5 ? t * 2 : (1 - t) * 2;
      setGlowPulse(pulse);
      glowRafRef.current = requestAnimationFrame(animate);
    };
    glowRafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(glowRafRef.current);
  }, [wakeActive]);

  // Wake word detection via Web Speech API
  const startWakeWordListening = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    recognitionRef.current = rec;
    let triggered = false;

    rec.onstart = () => setWakeActive(true);

    rec.onresult = (e) => {
      if (triggered) return;
      const words = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join(" ")
        .toLowerCase();
      if (words.includes("hey chris") || (words.startsWith("hey") && words.includes("chris"))) {
        triggered = true;
        rec.stop();
        setRespondingMode(true);
        setSheetOpen(true);
        setTimeout(() => setRespondingMode(false), 3000);
      }
    };

    rec.onend = () => {
      setWakeActive(false);
      setTimeout(startWakeWordListening, 3000);
    };

    rec.onerror = () => {
      setWakeActive(false);
      setTimeout(startWakeWordListening, 5000);
    };

    try {
      rec.start();
    } catch (_) {}
  }, []);

  useEffect(() => {
    startWakeWordListening();
    return () => {
      recognitionRef.current?.stop();
    };
  }, [startWakeWordListening]);

  // Drag logic
  const onPointerDown = (e) => {
    dragRef.current = {
      dragging: true,
      startX: e.clientX,
      startY: e.clientY,
      origX: position.x,
      origY: position.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!dragRef.current.dragging) return;
    setPosition({
      x: dragRef.current.origX + (e.clientX - dragRef.current.startX),
      y: dragRef.current.origY + (e.clientY - dragRef.current.startY),
    });
  };

  const onPointerUp = (e) => {
    const dx = Math.abs(e.clientX - dragRef.current.startX);
    const dy = Math.abs(e.clientY - dragRef.current.startY);
    dragRef.current.dragging = false;
    if (dx < 5 && dy < 5) setSheetOpen(true);
  };

  const handleSend = (text) => {
    if (onSend) onSend(text);
  };

  return (
    <>
      <div
        style={{
          ...styles.fab,
          width: size,
          height: size,
          borderRadius: size / 2,
          transform: `translate(${position.x}px, ${position.y}px)`,
          cursor: "grab",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <StrandsOrb
          size={size}
          pulseValue={wakeActive ? glowPulse : 0}
          speed={respondingMode ? 0.45 : 0.07}
        />
      </div>

      {sheetOpen && (
        <ChrisSheet
          onClose={() => setSheetOpen(false)}
          onSend={handleSend}
        />
      )}
    </>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = {
  fab: {
    overflow: "hidden",
    userSelect: "none",
    touchAction: "none",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    display: "flex",
    alignItems: "flex-end",
  },
  sheet: {
    width: "100%",
    background: SHEET_BG,
    paddingTop: 10,
  },
  voiceIndicator: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  voiceRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: TEAL,
    display: "inline-block",
  },
  inputRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: 8,
    padding: "0 12px 10px",
  },
  inputWrap: {
    flex: 1,
    minHeight: 48,
    background: "#131325",
    borderRadius: 24,
    border: "1px solid",
    display: "flex",
    alignItems: "center",
  },
  textarea: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    resize: "none",
    fontSize: 15,
    lineHeight: 1.4,
    padding: "13px 18px",
    fontFamily: "inherit",
    maxHeight: 120,
    overflowY: "auto",
  },
  actionBtn: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
    transition: "background 180ms ease, box-shadow 180ms ease",
  },
};
