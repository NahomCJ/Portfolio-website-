import { useEffect, useRef } from 'react';
import Beams from './Beams';
import { wavesActive } from '../lib/audioReactivity';
import './GutterSpillWaves.css';

// Extends a dark, wave-backed section's look into the blank side gutters
// of the plain sections next to it — the empty margins outside the
// centered content column, never the column itself — revealing slowly
// when the chatbot opens and retracting when it closes. Positioned and
// sized from measured DOM rects (kept in sync on resize) rather than
// fixed pixel values, so it tracks the real layout at any viewport size.
export default function GutterSpillWaves({
  direction, // 'down': reveals top-to-bottom; 'up': reveals bottom-to-top
  spanStartSelector,
  spanEndSelector,
  containerSelector = '.container',
  rotation = 180,
  lightColor = '#6D28D9',
}) {
  const wrapRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return undefined;

    const updateLayout = () => {
      const startEl = document.querySelector(spanStartSelector);
      const endEl = document.querySelector(spanEndSelector);
      const containerEl = document.querySelector(containerSelector);
      if (!startEl || !endEl || !containerEl) return;

      const startRect = startEl.getBoundingClientRect();
      const endRect = endEl.getBoundingClientRect();
      const containerRect = containerEl.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset;

      const top = startRect.top + scrollY;
      const height = endRect.bottom + scrollY - top;
      wrap.style.top = `${top}px`;
      wrap.style.height = `${Math.max(0, height)}px`;

      const gutterLeft = Math.max(0, containerRect.left);
      const gutterRight = Math.max(0, window.innerWidth - containerRect.right);
      const mask = `linear-gradient(90deg, black 0, black ${gutterLeft}px, transparent ${gutterLeft}px, transparent calc(100% - ${gutterRight}px), black calc(100% - ${gutterRight}px), black 100%)`;
      wrap.style.maskImage = mask;
      wrap.style.webkitMaskImage = mask;
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    const ro = new ResizeObserver(updateLayout);
    ro.observe(document.body);

    let raf;
    let reveal = 0;
    let lastTime = performance.now();
    // Framerate-independent easing: a fixed per-frame factor (as used
    // elsewhere for cheaper effects) converges in wildly different real
    // time depending on how often rAF actually fires, which collapses
    // under heavy load (this page can have several WebGL canvases
    // running at once). Time-constant-based exponential smoothing keeps
    // the "slowly come down/up" pacing consistent regardless of frame rate.
    const tau = 1.4;
    const tick = (now) => {
      const dt = Math.max(0, (now - lastTime) / 1000);
      lastTime = now;
      const target = wavesActive.current ? 1 : 0;
      reveal += (target - reveal) * (1 - Math.exp(-dt / tau));
      const pct = Math.max(0, Math.min(1, reveal)) * 100;
      wrap.style.clipPath =
        direction === 'down' ? `inset(0 0 ${100 - pct}% 0)` : `inset(${100 - pct}% 0 0 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', updateLayout);
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [direction, spanStartSelector, spanEndSelector, containerSelector]);

  return (
    <div ref={wrapRef} className="gutter-spill" aria-hidden="true">
      <Beams
        beamWidth={1.5}
        beamHeight={20}
        beamNumber={15}
        lightColor={lightColor}
        speed={2}
        noiseIntensity={1.05}
        scale={0.2}
        rotation={rotation}
      />
    </div>
  );
}
