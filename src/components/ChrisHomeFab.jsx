// ChrisHomeFab.jsx — animated strands orb FAB (no built-in sheet)
// Calls onOpen() on tap or wake word "Hey Chris"

import { useEffect, useRef, useState, useCallback } from "react";

// ── Constants ──────────────────────────────────────────────────────────────────
const TEAL = "#00D4B8";
const STRAND_COLORS = ["#3B82F6", "#7C3AED", "#100820"];
const STRAND_COUNT = 4;
const AMPLITUDE = 1.3;
const WAVINESS = 2.0;
const THICKNESS = 0.7;
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

    drawPath(0.20, baseStroke * 7 * GLOW * pulseBoost, 8);
    drawPath(0.55, baseStroke * 2.5, 2);
    drawPath(0.88, baseStroke, 0);
  }

  ctx.restore();

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

// ── Orb ───────────────────────────────────────────────────────────────────────
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

// ── Main FAB ───────────────────────────────────────────────────────────────────
export default function ChrisHomeFab({ size = 56, onOpen }) {
  const [wakeActive, setWakeActive] = useState(false);
  const [respondingMode, setRespondingMode] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [glowPulse, setGlowPulse] = useState(0);

  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, origX: 0, origY: 0 });
  const recognitionRef = useRef(null);
  const glowRafRef = useRef(null);
  const glowStartRef = useRef(null);

  useEffect(() => {
    if (!wakeActive) {
      setGlowPulse(0);
      cancelAnimationFrame(glowRafRef.current);
      return;
    }
    glowStartRef.current = null;
    const animate = (ts) => {
      if (!glowStartRef.current) glowStartRef.current = ts;
      const elapsed = (ts - glowStartRef.current) / 1200;
      const t = elapsed % 1;
      const pulse = t < 0.5 ? t * 2 : (1 - t) * 2;
      setGlowPulse(pulse);
      glowRafRef.current = requestAnimationFrame(animate);
    };
    glowRafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(glowRafRef.current);
  }, [wakeActive]);

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
        onOpen?.();
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

    try { rec.start(); } catch (_) {}
  }, [onOpen]);

  useEffect(() => {
    startWakeWordListening();
    return () => recognitionRef.current?.stop();
  }, [startWakeWordListening]);

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
    if (dx < 5 && dy < 5) onOpen?.();
  };

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: "hidden",
        userSelect: "none",
        touchAction: "none",
        cursor: "grab",
        transform: `translate(${position.x}px, ${position.y}px)`,
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
  );
}
