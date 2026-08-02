/* eslint-disable react/no-unknown-property */
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import {
  DirLight,
  createBeamMaterial,
  createSingleBeamGeometry,
} from './Beams';
import { audioLevel, audioBass, audioTreble, audioBeat, wavesActive, activatedAt } from '../lib/audioReactivity';
import './TendrilSpill.css';

// A handful of independent, curving wave strands that grow slowly out of
// About/Contact into the blank side margins of the sections next to them
// — like tendrils or vines slithering out from different spots along the
// edge, each taking its own curved route, never touching (or even
// converging with) one another. Only the empty gutters outside the
// centered content column are ever affected (the mask below hides the
// column itself); growth is staggered per-strand and eases in/out with
// wall-clock time (not raw frame count) so the pacing stays consistent
// no matter how many WebGL canvases are competing for frame time.
const PHASE_STEP = 2.399963229728653;

const TendrilField = ({ count, directionSign, material, gutterFracRef }) => {
  const refs = useRef([]);
  const growth = useRef([]);
  const delay = useRef([]);
  const lengthFrac = useRef([]);
  const side = useRef([]);
  const spot = useRef([]);
  const rotBase = useRef([]);
  const lastTime = useRef(performance.now());

  const seeds = useMemo(() => Array.from({ length: count }, (_, i) => i), [count]);
  const geometries = useMemo(
    () => seeds.map((i) => createSingleBeamGeometry(0.22, 1, 140, i * PHASE_STEP * 1.7 + directionSign)),
    [seeds, directionSign]
  );

  useEffect(() => {
    growth.current = seeds.map(() => 0);
    delay.current = seeds.map(() => Math.random() * 1.8);
    // Alternate left/right; `spot` (0..1) picks each strand's depth
    // *within its own gutter* — how far in from the outer edge toward
    // the masked content boundary — computed against the real measured
    // gutter width every frame (not a guessed fraction of total canvas
    // width, which varies wildly between a tall-narrow vs short-wide span).
    side.current = seeds.map((_, i) => (i % 2 === 0 ? -1 : 1));
    spot.current = seeds.map(() => 0.15 + Math.random() * 0.6);
    lengthFrac.current = seeds.map(() => 0.45 + Math.random() * 0.45);
    rotBase.current = seeds.map(() => (Math.random() - 0.5) * 0.35);
  }, [seeds]);

  useFrame((state, delta) => {
    const u = material.uniforms;
    const level = audioLevel.current;
    const bass = audioBass.current;
    const treble = audioTreble.current;
    const beat = audioBeat.current;

    u.time.value += 0.1 * delta * (1 + level * 0.7 + beat * 0.35);
    u.uNoiseIntensity.value = material.userData.baseNoise * (1 + level * 0.35 + beat * 0.4);
    u.uScale.value = material.userData.baseScale * (1 + beat * 0.12 - bass * 0.04);
    u.uFlowSkew.value = treble * 0.45 + bass * 0.15;
    u.uDisperse.value = beat * 0.5;
    if (u.opacity) u.opacity.value = 1;

    const now = performance.now();
    const dt = Math.max(0, (now - lastTime.current) / 1000);
    lastTime.current = now;
    const tau = 1.6;

    const { width: vw, height: vh } = state.viewport;
    const anchorY = directionSign > 0 ? -vh / 2 : vh / 2;
    const activeElapsed = wavesActive.current ? (now - activatedAt.current) / 1000 : 0;
    const gutterFrac = gutterFracRef.current;
    // The bend offset is added in the strand's own local X (pre-scale), so
    // it needs to be sized against the actual gutter it has to weave
    // within — not the canvas's full width, most of which is masked-out
    // content the strand should never really cross into (scaling by full
    // canvas width was swinging strands all the way across the gutter and
    // into a dense criss-crossing tangle instead of a gentle weave).
    const gutterWorldWidth = ((gutterFrac.left + gutterFrac.right) / 2) * vw;
    u.uBendAmp.value = gutterWorldWidth * (0.4 + level * 0.18 + beat * 0.14);

    for (let i = 0; i < count; i++) {
      const mesh = refs.current[i];
      if (!mesh) continue;

      const started = wavesActive.current && activeElapsed > delay.current[i];
      const target = started ? 1 : 0;
      growth.current[i] += (target - growth.current[i]) * (1 - Math.exp(-dt / tau));
      const g = Math.max(0, Math.min(1, growth.current[i]));

      const length = vh * lengthFrac.current[i];
      // Anchor within the strand's own gutter — a fraction of the way in
      // from the outer edge toward the (masked) content boundary — using
      // the actual measured gutter width for this viewport rather than a
      // guessed fraction of the canvas's total width, which swings wildly
      // between a tall-narrow span and a short-wide one.
      const s = side.current[i];
      const gf = s < 0 ? gutterFrac.left : gutterFrac.right;
      const outerEdge = s * (vw / 2);
      const innerEdge = s * (vw / 2) * (1 - gf * 2);
      const x = outerEdge + (innerEdge - outerEdge) * spot.current[i];

      mesh.position.x = x;
      mesh.position.y = anchorY + directionSign * (length / 2) * g;
      mesh.rotation.z = rotBase.current[i];
      mesh.scale.set(1, length * g, 1);
    }
  });

  return (
    <>
      {geometries.map((geo, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el; }} geometry={geo} material={material} />
      ))}
    </>
  );
};

const TendrilCanvas = ({ direction, count, lightColor, gutterFracRef }) => {
  const material = useMemo(() => {
    const m = createBeamMaterial({ speed: 2, noiseIntensity: 1.1, scale: 0.2 });
    // The shared beam material's diffuse defaults to black — right for the
    // hero/About/Contact fields, which sit on a black section background
    // and rely on directional-light glints for their only visible color.
    // These strands sit on a white section background instead, so a black
    // base would read as a dark smear rather than a colored thread —
    // give them the accent color as their own base tint.
    m.uniforms.diffuse.value = new THREE.Color(lightColor);
    m.uniforms.roughness.value = 0.45;
    m.uniforms.metalness.value = 0.15;
    // Smooth single-curve bend (see getBend in Beams.jsx) instead of the
    // busier multi-frequency weave used for the hero's sunburst — a calm
    // flowing ribbon rather than a jagged zigzag.
    m.uniforms.uBendMode.value = 1;
    return m;
  }, [lightColor]);
  const directionSign = direction === 'up' ? 1 : -1;

  return (
    // No scene background here (unlike Beams' opaque black) — this canvas
    // needs to stay transparent so the section's own white/light
    // background shows through everywhere except the strands themselves.
    <Canvas dpr={[1, 2]} frameloop="always" className="beams-container" gl={{ alpha: true }}>
      <TendrilField count={count} directionSign={directionSign} material={material} gutterFracRef={gutterFracRef} />
      <DirLight color={lightColor} position={[0, 3, 10]} />
      <DirLight color={lightColor} position={[6, -4, 8]} />
      <ambientLight intensity={1.8} />
      <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={30} />
    </Canvas>
  );
};

// Positions/sizes the tendril canvas over a measured DOM span (kept in
// sync on resize) and masks out the centered content column, so the
// canvas can be permanently "on" while the tendrils themselves handle
// growing in and retracting.
export default function TendrilSpill({
  direction, // 'down': anchored at spanStartSelector's top; 'up': anchored at spanEndSelector's bottom
  spanStartSelector,
  spanEndSelector,
  containerSelector = '.container',
  count = 5,
  lightColor = '#6D28D9',
}) {
  const wrapRef = useRef(null);
  // Read every frame inside the Three.js scene (via TendrilField) to place
  // strands within the real gutter width — a mutable ref rather than
  // React state so resize updates don't need to flow through re-renders.
  const gutterFracRef = useRef({ left: 0.15, right: 0.15 });

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
      gutterFracRef.current = {
        left: gutterLeft / window.innerWidth,
        right: gutterRight / window.innerWidth,
      };
      const mask = `linear-gradient(90deg, black 0, black ${gutterLeft}px, transparent ${gutterLeft}px, transparent calc(100% - ${gutterRight}px), black calc(100% - ${gutterRight}px), black 100%)`;
      wrap.style.maskImage = mask;
      wrap.style.webkitMaskImage = mask;
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    const ro = new ResizeObserver(updateLayout);
    ro.observe(document.body);
    return () => {
      window.removeEventListener('resize', updateLayout);
      ro.disconnect();
    };
  }, [spanStartSelector, spanEndSelector, containerSelector]);

  return (
    <div ref={wrapRef} className="tendril-spill" aria-hidden="true">
      <TendrilCanvas direction={direction} count={count} lightColor={lightColor} gutterFracRef={gutterFracRef} />
    </div>
  );
}
