/* eslint-disable react/no-unknown-property */
import { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { degToRad } from 'three/src/math/MathUtils.js';
import { audioLevel, audioBass, audioTreble, audioBeat, wavesActive, activatedAt } from '../lib/audioReactivity';
import { heroFocus } from '../lib/heroFocus';
import './Beams.css';

function extendMaterial(BaseMaterial, cfg) {
  const physical = THREE.ShaderLib.physical;
  const { vertexShader: baseVert, fragmentShader: baseFrag, uniforms: baseUniforms } = physical;
  const baseDefines = physical.defines ?? {};

  const uniforms = THREE.UniformsUtils.clone(baseUniforms);

  const defaults = new BaseMaterial(cfg.material || {});

  if (defaults.color) uniforms.diffuse.value = defaults.color;
  if ('roughness' in defaults) uniforms.roughness.value = defaults.roughness;
  if ('metalness' in defaults) uniforms.metalness.value = defaults.metalness;
  if ('envMapIntensity' in defaults) uniforms.envMapIntensity.value = defaults.envMapIntensity;

  Object.entries(cfg.uniforms ?? {}).forEach(([key, u]) => {
    uniforms[key] = u !== null && typeof u === 'object' && 'value' in u ? u : { value: u };
  });

  let vert = `${cfg.header}\n${cfg.vertexHeader ?? ''}\n${baseVert}`;
  let frag = `${cfg.header}\n${cfg.fragmentHeader ?? ''}\n${baseFrag}`;

  for (const [inc, code] of Object.entries(cfg.vertex ?? {})) {
    vert = vert.replace(inc, `${inc}\n${code}`);
  }
  for (const [inc, code] of Object.entries(cfg.fragment ?? {})) {
    frag = frag.replace(inc, `${inc}\n${code}`);
  }

  return new THREE.ShaderMaterial({
    defines: { ...baseDefines },
    uniforms,
    vertexShader: vert,
    fragmentShader: frag,
    lights: true,
    fog: !!cfg.material?.fog,
  });
}

export const CanvasWrapper = ({ children }) => (
  <Canvas dpr={[1, 2]} frameloop="always" className="beams-container">
    {children}
  </Canvas>
);

const hexToNormalizedRGB = hex => {
  const clean = hex.replace('#', '');
  return [
    parseInt(clean.substring(0, 2), 16) / 255,
    parseInt(clean.substring(2, 4), 16) / 255,
    parseInt(clean.substring(4, 6), 16) / 255,
  ];
};

const noise = `
float random (in vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}
float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}
float cnoise(vec3 P){
  vec3 Pi0 = floor(P); vec3 Pi1 = Pi0 + vec3(1.0);
  Pi0 = mod(Pi0, 289.0); Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P); vec3 Pf1 = Pf0 - vec3(1.0);
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz; vec4 iz1 = Pi1.zzzz;
  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0); vec4 ixy1 = permute(ixy + iz1);
  vec4 gx0 = ixy0 / 7.0; vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5; gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0); vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5); gy0 -= sz0 * (step(0.0, gy0) - 0.5);
  vec4 gx1 = ixy1 / 7.0; vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5; gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1); vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5); gy1 -= sz1 * (step(0.0, gy1) - 0.5);
  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x); vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z); vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x); vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z); vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
  vec4 norm0 = taylorInvSqrt(vec4(dot(g000,g000),dot(g010,g010),dot(g100,g100),dot(g110,g110)));
  g000 *= norm0.x; g010 *= norm0.y; g100 *= norm0.z; g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001,g001),dot(g011,g011),dot(g101,g101),dot(g111,g111)));
  g001 *= norm1.x; g011 *= norm1.y; g101 *= norm1.z; g111 *= norm1.w;
  float n000 = dot(g000, Pf0); float n100 = dot(g100, vec3(Pf1.x,Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x,Pf1.y,Pf0.z)); float n110 = dot(g110, vec3(Pf1.xy,Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy,Pf1.z)); float n101 = dot(g101, vec3(Pf1.x,Pf0.y,Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x,Pf1.yz)); float n111 = dot(g111, Pf1);
  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000,n100,n010,n110),vec4(n001,n101,n011,n111),fade_xyz.z);
  vec2 n_yz = mix(n_z.xy,n_z.zw,fade_xyz.y);
  return 2.2 * mix(n_yz.x,n_yz.y,fade_xyz.x);
}
`;

// A single beam's plane geometry — its own random UV offset keeps its
// noise pattern out of sync with its neighbors, now that each beam is an
// independent object rather than a strip baked into one shared mesh.
// `aBendSeed` is a constant-per-geometry attribute (same value on every
// vertex of one beam, different per beam) so the shared material's bend
// shader can curve each beam along its own distinct phase instead of
// every beam bowing in perfect unison. Exported so other wave-effect
// components (e.g. the tendrils spilling out of About/Contact) can build
// on the same geometry/shader instead of duplicating it.
export function createSingleBeamGeometry(width, height, heightSegments, bendSeed) {
  const geometry = new THREE.BufferGeometry();
  const numVertices = (heightSegments + 1) * 2;
  const numFaces = heightSegments * 2;
  const positions = new Float32Array(numVertices * 3);
  const indices = new Uint32Array(numFaces * 3);
  const uvs = new Float32Array(numVertices * 2);
  const bendSeeds = new Float32Array(numVertices);
  // Clean 0..1 fraction along the strand's length — kept separate from
  // `uv`, whose Y already carries a large per-beam random offset used to
  // desync the noise pattern, which would otherwise throw off the bend
  // shape's "zero at both ends" assumption.
  const lenUs = new Float32Array(numVertices);
  const uvXOffset = Math.random() * 300;
  const uvYOffset = Math.random() * 300;
  let vertexOffset = 0, indexOffset = 0, uvOffset = 0;
  for (let j = 0; j <= heightSegments; j++) {
    const y = height * (j / heightSegments - 0.5);
    positions.set([-width / 2, y, 0, width / 2, y, 0], vertexOffset * 3);
    const uvY = j / heightSegments;
    uvs.set([uvXOffset, uvY + uvYOffset, uvXOffset + 1, uvY + uvYOffset], uvOffset);
    bendSeeds[vertexOffset] = bendSeed;
    bendSeeds[vertexOffset + 1] = bendSeed;
    lenUs[vertexOffset] = uvY;
    lenUs[vertexOffset + 1] = uvY;
    if (j < heightSegments) {
      const a = vertexOffset, b = vertexOffset + 1, c = vertexOffset + 2, d = vertexOffset + 3;
      indices.set([a, b, c, c, b, d], indexOffset);
      indexOffset += 6;
    }
    vertexOffset += 2;
    uvOffset += 4;
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.setAttribute('aBendSeed', new THREE.BufferAttribute(bendSeeds, 1));
  geometry.setAttribute('aLenU', new THREE.BufferAttribute(lenUs, 1));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.computeVertexNormals();
  return geometry;
}

const TWO_PI = Math.PI * 2;
function shortestAngleLerp(from, to, t) {
  let delta = (to - from) % TWO_PI;
  if (delta > Math.PI) delta -= TWO_PI;
  if (delta < -Math.PI) delta += TWO_PI;
  return from + delta * t;
}

// Golden-angle-ish per-beam phase offset so the length-pulse animation
// below doesn't line every beam up in lockstep like piano keys — each
// one breathes slightly out of sync with its neighbors.
const PHASE_STEP = 2.399963229728653;

// Idle: every beam sits back-to-back in its original stacked line, at a
// single fixed angle, with just the shader's own gentle up/down noise
// motion — the exact original look. Active (chat open, `reactive` only):
// the beams un-stack — each one eases away from its neighbors out onto
// its own spot on a circle around the center, spinning slowly, and
// individually growing/shrinking in length on a music-driven pulse (so
// they read as loose reeds swaying with the track rather than rigid
// piano keys), so they periodically drift apart into a full sunburst and
// gather back together into the original line before spreading out
// again. A small fixed gap around the center keeps the beams from
// bunching into a cluttered knot where they'd otherwise all converge.
// Easing back to the stacked idle line when the chat closes. Non-reactive
// instances (about/footer) ignore all of this and just hold the original
// static idle look permanently.
const BeamsField = ({ baseRotation, beamWidth, beamNumber, beamHeight, material, reactive }) => {
  const refs = useRef([]);
  const ambientRef = useRef(null);
  const appliedSpread = useRef(0);

  const idleXOffsets = useMemo(() => {
    const totalWidth = beamNumber * beamWidth;
    const xOffsetBase = -totalWidth / 2 + beamWidth / 2;
    return Array.from({ length: beamNumber }, (_, i) => xOffsetBase + i * beamWidth);
  }, [beamNumber, beamWidth]);

  const ringPhase = useMemo(
    () => Array.from({ length: beamNumber }, (_, i) => (i / beamNumber) * TWO_PI),
    [beamNumber]
  );

  const geometries = useMemo(
    () => idleXOffsets.map((_, i) => createSingleBeamGeometry(beamWidth, beamHeight, 100, i * PHASE_STEP)),
    [idleXOffsets, beamWidth, beamHeight]
  );

  useFrame((state, delta) => {
    const u = material.uniforms;

    if (!reactive) {
      // The original, pre-music-reactive look: constant speed, constant
      // noise/scale, dead-ahead flow, fully opaque, beams permanently in
      // their packed idle line.
      u.time.value += 0.1 * delta;
      u.uNoiseIntensity.value = material.userData.baseNoise;
      u.uScale.value = material.userData.baseScale;
      u.uFlowSkew.value = 0;
      u.uDisperse.value = 0;
      u.uBendAmp.value = 0;
      if (u.opacity) u.opacity.value = 1;

      const baseRad = degToRad(baseRotation);
      const cosB = Math.cos(baseRad);
      const sinB = Math.sin(baseRad);
      for (let i = 0; i < beamNumber; i++) {
        const mesh = refs.current[i];
        if (!mesh) continue;
        const ix = idleXOffsets[i];
        mesh.position.x = ix * cosB;
        mesh.position.y = ix * sinB;
        mesh.rotation.z = baseRad;
        mesh.scale.y = 1;
      }
      return;
    }

    const level = audioLevel.current;
    const bass = audioBass.current;
    const treble = audioTreble.current;
    const beat = audioBeat.current;

    // Shared shader uniforms — one update drives every beam, since they
    // all reference the same material, so they stay visually "together"
    // even while spread apart in space.
    u.time.value += 0.1 * delta * (1 + level * 0.7 + beat * 0.35);
    u.uNoiseIntensity.value = material.userData.baseNoise * (1 + level * 0.35 + beat * 0.4);
    u.uScale.value = material.userData.baseScale * (1 + beat * 0.12 - bass * 0.04);
    u.uFlowSkew.value = treble * 0.45 + bass * 0.15;
    u.uDisperse.value = beat * 0.5;

    let opacity = 1;
    let spreadTarget = 0;
    if (wavesActive.current) {
      const elapsed = performance.now() - activatedAt.current;
      // Briefly dip opacity right as the chat opens, so the ripple burst
      // shows through the beams like a raindrop hitting water.
      const x = elapsed / 900;
      const impulse = x * Math.exp(1 - x);
      opacity = 1 - impulse * 0.75;

      // Ease the un-stacking outward, then keep breathing between a wide
      // sunburst and (almost) back together, on a slow, music-nudged cycle.
      const easeIn = Math.min(1, elapsed / 2500);
      const breatheElapsed = Math.max(0, elapsed - 2500);
      const breathe = 0.5 + 0.5 * Math.sin(breatheElapsed * 0.00035 + bass * 0.6);
      spreadTarget = easeIn * (0.4 + 0.6 * breathe);
    }
    if (u.opacity) u.opacity.value = opacity;

    appliedSpread.current += (spreadTarget - appliedSpread.current) * 0.02;
    const spread = appliedSpread.current;

    // Curve each strand along its own length once it un-stacks — an
    // ocean-wave bend rather than a rigid rotating rod — growing bolder
    // with the music and easing back to perfectly straight at idle.
    u.uBendAmp.value = spread * (0.9 + level * 1.6 + beat * 1.2);

    // Once the beams un-stack they scatter across many different facing
    // angles, so a mostly-directional lighting setup that reads fine on
    // one packed, fixed-angle line would leave a lot of them nearly
    // invisible. Lift the ambient floor while spread out so every beam
    // stays visible regardless of which way it's facing.
    if (ambientRef.current) ambientRef.current.intensity = 1 + spread * 1.6;

    const baseRad = degToRad(baseRotation);
    const cosB = Math.cos(baseRad);
    const sinB = Math.sin(baseRad);

    const { width, height } = state.viewport;
    const viewportHalfDiag = Math.sqrt((width / 2) ** 2 + (height / 2) ** 2);
    // A small fixed core radius every beam's inner tip anchors to, so
    // spreading beams radiate cleanly outward from a tidy empty center
    // instead of piling up into a cluttered knot in the middle.
    const innerRadius = viewportHalfDiag * 0.14;
    // Center the circle formation behind the profile photo rather than
    // at the raw canvas center, so the spread reads as radiating out
    // from behind it instead of sitting in empty space next to it.
    const focusX = (heroFocus.x - 0.5) * width;
    const focusY = (0.5 - heroFocus.y) * height;

    const t = performance.now();
    const spin = t * 0.00006;

    for (let i = 0; i < beamNumber; i++) {
      const mesh = refs.current[i];
      if (!mesh) continue;

      const ix = idleXOffsets[i];
      const idleX = ix * cosB;
      const idleY = ix * sinB;

      // Each beam grows and shrinks independently — driven mostly by the
      // music (loudness/beat/treble) with a per-beam phase so they don't
      // all pulse in unison — instead of holding one rigid length.
      const wobble = 0.5 + 0.5 * Math.sin(t * 0.0016 + i * PHASE_STEP);
      const musicPulse = level * 0.55 + beat * 0.75 + treble * 0.25;
      const lengthScale = Math.min(1.6, Math.max(0.4, 0.55 + wobble * 0.3 + musicPulse * 0.55));

      const angle = ringPhase[i] + spin + (treble - bass) * 0.15;
      const beamHalfLen = (beamHeight * lengthScale) / 2;
      const centerDist = innerRadius + beamHalfLen;
      const circleX = focusX + Math.cos(angle) * centerDist;
      const circleY = focusY + Math.sin(angle) * centerDist;
      const circleRot = angle - Math.PI / 2;

      mesh.position.x = idleX + (circleX - idleX) * spread;
      mesh.position.y = idleY + (circleY - idleY) * spread;
      mesh.rotation.z = shortestAngleLerp(baseRad, circleRot, spread);
      mesh.scale.y = 1 + (lengthScale - 1) * spread;
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={1} />
      {geometries.map((geo, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el; }} geometry={geo} material={material} />
      ))}
    </>
  );
};

// A ring of light that breathes outward from a point that itself drifts
// left/right over time — the "water ripple / bubble" layer behind the
// beams. Two overlapping ambient wave fronts give it an organic, layered
// ripple texture, and on top of that, the moment the chat opens fires a
// single clean ring that expands outward from center like a raindrop
// hitting still water — decelerating as it spreads, brightest just after
// it starts, fading away as the beams' own swinging motion takes over.
// Everything here eases to zero when idle, so idle stays exactly the
// original plain look.
const rippleVertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const rippleFragmentShader = `
varying vec2 vUv;
uniform float uTime;
uniform float uBeat;
uniform float uBass;
uniform float uCenterX;
uniform float uActiveFade;
uniform float uBurstElapsed;
uniform vec3 uColor;
void main() {
  vec2 center = vec2(uCenterX, 0.5);
  float dist = distance(vUv, center);

  float speed = 0.4 + uBass * 0.6;
  float wave1 = 0.5 + 0.5 * sin(dist * 16.0 - uTime * speed);
  float wave2 = 0.5 + 0.5 * sin(dist * 27.0 - uTime * speed * 1.4 + 1.2);
  float ambientGlow = pow(wave1, 5.0) * 0.7 + pow(wave2, 6.0) * 0.5;
  float fade = smoothstep(0.95, 0.05, dist);
  float ambientAmp = (0.12 + uBeat * 0.45) * fade;

  float t = uBurstElapsed;
  float x = t / 900.0;
  float impulse = x * exp(1.0 - x);
  float burstRadius = 0.95 * (1.0 - exp(-t / 700.0));
  float ringWidth = 0.05 + 0.03 * impulse;
  float burstRing = exp(-pow((dist - burstRadius) / ringWidth, 2.0)) * impulse;

  float total = (ambientGlow * ambientAmp + burstRing * 0.9) * uActiveFade;
  gl_FragColor = vec4(uColor, total);
}`;

const RippleField = ({ color }) => {
  const rgb = useMemo(() => hexToNormalizedRGB(color), [color]);
  const materialRef = useRef(null);
  const activeFade = useRef(0);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uBeat: { value: 0 },
      uBass: { value: 0 },
      uCenterX: { value: 0.5 },
      uActiveFade: { value: 0 },
      uBurstElapsed: { value: 0 },
      uColor: { value: new THREE.Color(rgb[0], rgb[1], rgb[2]) },
    }),
    [rgb]
  );

  useFrame((_, delta) => {
    if (!materialRef.current) return;
    const u = materialRef.current.uniforms;
    u.uTime.value += delta;
    u.uBeat.value = audioBeat.current;
    u.uBass.value = audioBass.current;
    u.uCenterX.value = 0.5 + Math.sin(performance.now() * 0.00005 + 0.6) * 0.32;
    u.uBurstElapsed.value = wavesActive.current ? performance.now() - activatedAt.current : 1e9;
    const target = wavesActive.current ? 1 : 0;
    activeFade.current += (target - activeFade.current) * 0.03;
    u.uActiveFade.value = activeFade.current;
  });

  return (
    <mesh position={[0, 0, -9]}>
      <planeGeometry args={[110, 80]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={rippleVertexShader}
        fragmentShader={rippleFragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
};

export const DirLight = ({ position, color }) => {
  const dir = useRef(null);
  useEffect(() => {
    if (!dir.current) return;
    const cam = dir.current.shadow.camera;
    if (!cam) return;
    cam.top = 24; cam.bottom = -24;
    cam.left = -24; cam.right = 24;
    cam.far = 64;
    dir.current.shadow.bias = -0.004;
  }, []);
  return <directionalLight ref={dir} color={color} intensity={1} position={position} />;
};

// Builds the shared beam shader material (bendable, noise-displaced,
// music-reactive-ready) — pulled out of the Beams component so other
// wave-effect components (e.g. the About/Contact tendrils) can build
// meshes using the exact same look without duplicating the shader.
export function createBeamMaterial({ speed, noiseIntensity, scale }) {
  const material = extendMaterial(THREE.MeshStandardMaterial, {
    header: `
  varying vec3 vEye;
  varying float vNoise;
  varying vec2 vUv;
  varying vec3 vPosition;
  uniform float time;
  uniform float uSpeed;
  uniform float uNoiseIntensity;
  uniform float uScale;
  uniform float uFlowSkew;
  uniform float uDisperse;
  uniform float uBendAmp;
  uniform float uBendMode;
  ${noise}`,
    vertexHeader: `
  attribute float aBendSeed;
  attribute float aLenU;
  // Bends the strand along its own length instead of leaving it a rigid
  // rod — an arch toward the middle plus a slower undulation, phased
  // per-beam via aBendSeed so a whole spread field curves like loose
  // ocean-wave strands rather than a fan of straight sticks. aLenU is a
  // clean 0..1 fraction along the strand (unlike uv.y, which carries a
  // large per-beam random offset for noise variety).
  float getBend(vec3 pos) {
    float u = aLenU;
    // Tendril mode: one graceful, single-frequency arc per strand — a
    // smooth flowing curve rather than the busier multi-frequency weave
    // below (which suits the hero's wide, chaotic sunburst but reads as
    // jagged on a long, isolated strand meant to look like a calm ribbon).
    if (uBendMode > 0.5) {
      return sin(u * 3.14159265 * 1.3 + aBendSeed) * uBendAmp;
    }
    float arch = sin(u * 3.14159265) * 0.6;
    float wave = sin(u * 3.0 + aBendSeed + time * 0.6) * 0.5
               + sin(u * 5.0 - aBendSeed * 1.7 + time * 0.35) * 0.35;
    return (arch + wave) * uBendAmp;
  }
  float getPos(vec3 pos) {
    vec3 noisePos = vec3(pos.x * uFlowSkew, pos.y - uv.y, pos.z + time * uSpeed * 3.) * uScale;
    return cnoise(noisePos) * (1.0 + uDisperse * 0.6);
  }
  vec3 getCurrentPos(vec3 pos) {
    vec3 newpos = pos;
    newpos.x += getBend(pos);
    newpos.z += getPos(newpos);
    return newpos;
  }
  vec3 getNormal(vec3 pos) {
    vec3 curpos = getCurrentPos(pos);
    vec3 nextposX = getCurrentPos(pos + vec3(0.01, 0.0, 0.0));
    vec3 nextposZ = getCurrentPos(pos + vec3(0.0, -0.01, 0.0));
    vec3 tangentX = normalize(nextposX - curpos);
    vec3 tangentZ = normalize(nextposZ - curpos);
    return normalize(cross(tangentZ, tangentX));
  }`,
    fragmentHeader: '',
    vertex: {
      '#include <begin_vertex>': `
    transformed.x += getBend(transformed.xyz);
    transformed.z += getPos(transformed.xyz);`,
      '#include <beginnormal_vertex>': `objectNormal = getNormal(position.xyz);`,
    },
    fragment: {
      '#include <dithering_fragment>': `
    float randomNoise = noise(gl_FragCoord.xy);
    gl_FragColor.rgb -= randomNoise / 15. * uNoiseIntensity;`,
    },
    material: { fog: true },
    uniforms: {
      diffuse: new THREE.Color(...hexToNormalizedRGB('#000000')),
      time: { value: 0 },
      roughness: 0.3,
      metalness: 0.3,
      uSpeed: { value: speed },
      envMapIntensity: 10,
      uNoiseIntensity: noiseIntensity,
      uScale: scale,
      uFlowSkew: 0,
      uDisperse: 0,
      uBendAmp: 0,
      uBendMode: 0,
    },
  });
  material.transparent = true;
  material.userData.baseNoise = noiseIntensity;
  material.userData.baseScale = scale;
  return material;
}

export default function Beams({
  beamWidth = 2,
  beamHeight = 15,
  beamNumber = 12,
  lightColor = '#ffffff',
  speed = 2,
  noiseIntensity = 1.75,
  scale = 0.2,
  rotation = 0,
  reactive = false,
}) {
  const beamMaterial = useMemo(
    () => createBeamMaterial({ speed, noiseIntensity, scale }),
    [speed, noiseIntensity, scale]
  );

  return (
    <CanvasWrapper>
      {reactive && <RippleField color={lightColor} />}
      <BeamsField
        baseRotation={rotation}
        beamWidth={beamWidth}
        beamNumber={beamNumber}
        beamHeight={beamHeight}
        material={beamMaterial}
        reactive={reactive}
      />
      <DirLight color={lightColor} position={[0, 3, 10]} />
      <DirLight color={lightColor} position={[6, -4, 8]} />
      <color attach="background" args={['#000000']} />
      <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={30} />
    </CanvasWrapper>
  );
}
