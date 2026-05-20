/* eslint-disable react/no-unknown-property */
import { forwardRef, useImperativeHandle, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import './Beams.css';

function cloneUniforms(src) {
  if (THREE.UniformsUtils && THREE.UniformsUtils.clone) {
    return THREE.UniformsUtils.clone(src);
  }
  const dst = {};
  for (const k in src) {
    const u = src[k];
    if (u && typeof u === 'object' && 'value' in u) {
      const v = u.value;
      dst[k] = { value: v && typeof v.clone === 'function' ? v.clone() : v };
    } else {
      dst[k] = { value: u };
    }
  }
  return dst;
}

function extendMaterial(BaseMaterial, cfg) {
  const physical = THREE.ShaderLib.physical;
  const { vertexShader: baseVert, fragmentShader: baseFrag, uniforms: baseUniforms } = physical;
  const baseDefines = physical.defines ?? {};
  const uniforms = cloneUniforms(baseUniforms);

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

const CanvasWrapper = ({ children }) => (
  <div className="beams-container">
    <Canvas dpr={[1, 2]} frameloop="always" style={{ width: '100%', height: '100%' }}>
      {children}
    </Canvas>
  </div>
);

const hexToNormalizedRGB = (hex) => {
  const clean = hex.replace('#', '');
  return [
    parseInt(clean.substring(0, 2), 16) / 255,
    parseInt(clean.substring(2, 4), 16) / 255,
    parseInt(clean.substring(4, 6), 16) / 255,
  ];
};

const NOISE = `
float random(in vec2 st){return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);}
float noise(in vec2 st){
  vec2 i=floor(st),f=fract(st);
  float a=random(i),b=random(i+vec2(1.,0.)),c=random(i+vec2(0.,1.)),d=random(i+vec2(1.,1.));
  vec2 u=f*f*(3.-2.*f);
  return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y;
}
vec4 permute(vec4 x){return mod(((x*34.)+1.)*x,289.);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
vec3 fade(vec3 t){return t*t*t*(t*(t*6.-15.)+10.);}
float cnoise(vec3 P){
  vec3 Pi0=floor(P),Pi1=Pi0+vec3(1.);
  Pi0=mod(Pi0,289.);Pi1=mod(Pi1,289.);
  vec3 Pf0=fract(P),Pf1=Pf0-vec3(1.);
  vec4 ix=vec4(Pi0.x,Pi1.x,Pi0.x,Pi1.x);
  vec4 iy=vec4(Pi0.yy,Pi1.yy),iz0=Pi0.zzzz,iz1=Pi1.zzzz;
  vec4 ixy=permute(permute(ix)+iy);
  vec4 ixy0=permute(ixy+iz0),ixy1=permute(ixy+iz1);
  vec4 gx0=ixy0/7.,gy0=fract(floor(gx0)/7.)-.5;gx0=fract(gx0);
  vec4 gz0=vec4(.5)-abs(gx0)-abs(gy0),sz0=step(gz0,vec4(0.));
  gx0-=sz0*(step(0.,gx0)-.5);gy0-=sz0*(step(0.,gy0)-.5);
  vec4 gx1=ixy1/7.,gy1=fract(floor(gx1)/7.)-.5;gx1=fract(gx1);
  vec4 gz1=vec4(.5)-abs(gx1)-abs(gy1),sz1=step(gz1,vec4(0.));
  gx1-=sz1*(step(0.,gx1)-.5);gy1-=sz1*(step(0.,gy1)-.5);
  vec3 g000=vec3(gx0.x,gy0.x,gz0.x),g100=vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010=vec3(gx0.z,gy0.z,gz0.z),g110=vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001=vec3(gx1.x,gy1.x,gz1.x),g101=vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011=vec3(gx1.z,gy1.z,gz1.z),g111=vec3(gx1.w,gy1.w,gz1.w);
  vec4 n0=taylorInvSqrt(vec4(dot(g000,g000),dot(g010,g010),dot(g100,g100),dot(g110,g110)));
  g000*=n0.x;g010*=n0.y;g100*=n0.z;g110*=n0.w;
  vec4 n1=taylorInvSqrt(vec4(dot(g001,g001),dot(g011,g011),dot(g101,g101),dot(g111,g111)));
  g001*=n1.x;g011*=n1.y;g101*=n1.z;g111*=n1.w;
  float n000=dot(g000,Pf0),n100=dot(g100,vec3(Pf1.x,Pf0.yz));
  float n010=dot(g010,vec3(Pf0.x,Pf1.y,Pf0.z)),n110=dot(g110,vec3(Pf1.xy,Pf0.z));
  float n001=dot(g001,vec3(Pf0.xy,Pf1.z)),n101=dot(g101,vec3(Pf1.x,Pf0.y,Pf1.z));
  float n011=dot(g011,vec3(Pf0.x,Pf1.yz)),n111=dot(g111,Pf1);
  vec3 fxyz=fade(Pf0);
  vec4 nz=mix(vec4(n000,n100,n010,n110),vec4(n001,n101,n011,n111),fxyz.z);
  vec2 nyz=mix(nz.xy,nz.zw,fxyz.y);
  return 2.2*mix(nyz.x,nyz.y,fxyz.x);
}`;

function createStackedPlanesGeometry(n, width, height, spacing, segs) {
  const geo = new THREE.BufferGeometry();
  const nV = n * (segs + 1) * 2;
  const pos = new Float32Array(nV * 3);
  const idx = new Uint32Array(n * segs * 6);
  const uvs = new Float32Array(nV * 2);
  let vO = 0, iO = 0, uO = 0;
  const totalW = n * width + (n - 1) * spacing;
  const x0 = -totalW / 2;
  for (let i = 0; i < n; i++) {
    const xOff = x0 + i * (width + spacing);
    const ux = Math.random() * 300, uy = Math.random() * 300;
    for (let j = 0; j <= segs; j++) {
      const y = height * (j / segs - 0.5);
      pos.set([xOff, y, 0, xOff + width, y, 0], vO * 3);
      uvs.set([ux, j / segs + uy, ux + 1, j / segs + uy], uO);
      if (j < segs) {
        const a = vO, b = vO + 1, c = vO + 2, d = vO + 3;
        idx.set([a, b, c, c, b, d], iO); iO += 6;
      }
      vO += 2; uO += 4;
    }
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geo.setIndex(new THREE.BufferAttribute(idx, 1));
  geo.computeVertexNormals();
  return geo;
}

const MergedPlanes = forwardRef(({ material, width, count, height }, ref) => {
  const mesh = useRef(null);
  useImperativeHandle(ref, () => mesh.current);
  const geometry = useMemo(
    () => createStackedPlanesGeometry(count, width, height, 0, 100),
    [count, width, height]
  );
  useFrame((_, delta) => {
    if (mesh.current) mesh.current.material.uniforms.time.value += 0.1 * delta;
  });
  return <mesh ref={mesh} geometry={geometry} material={material} />;
});
MergedPlanes.displayName = 'MergedPlanes';

const DirLight = ({ position, color }) => {
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

export default function Beams({
  beamWidth = 2,
  beamHeight = 15,
  beamNumber = 12,
  lightColor = '#ffffff',
  speed = 2,
  noiseIntensity = 1.75,
  scale = 0.2,
  rotation = 0,
}) {
  const beamMaterial = useMemo(() =>
    extendMaterial(THREE.MeshStandardMaterial, {
      header: `
        varying vec3 vEye; varying float vNoise;
        varying vec2 vUv; varying vec3 vPosition;
        uniform float time; uniform float uSpeed;
        uniform float uNoiseIntensity; uniform float uScale;
        ${NOISE}`,
      vertexHeader: `
        float getPos(vec3 pos){
          vec3 noisePos=vec3(pos.x*0.,pos.y-uv.y,pos.z+time*uSpeed*3.)*uScale;
          return cnoise(noisePos);
        }
        vec3 getCurrentPos(vec3 pos){vec3 np=pos;np.z+=getPos(pos);return np;}
        vec3 getNormal(vec3 pos){
          vec3 cp=getCurrentPos(pos);
          vec3 nx=getCurrentPos(pos+vec3(.01,0.,0.));
          vec3 nz=getCurrentPos(pos+vec3(0.,-.01,0.));
          return normalize(cross(normalize(nz-cp),normalize(nx-cp)));
        }`,
      vertex: {
        '#include <begin_vertex>': 'transformed.z+=getPos(transformed.xyz);',
        '#include <beginnormal_vertex>': 'objectNormal=getNormal(position.xyz);',
      },
      fragment: {
        '#include <dithering_fragment>':
          'float rn=noise(gl_FragCoord.xy);gl_FragColor.rgb-=rn/15.*uNoiseIntensity;',
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
      },
    }),
    [speed, noiseIntensity, scale]
  );

  const rotRad = (rotation * Math.PI) / 180;

  return (
    <CanvasWrapper>
      <group rotation={[0, 0, rotRad]}>
        <MergedPlanes material={beamMaterial} count={beamNumber} width={beamWidth} height={beamHeight} />
        <DirLight color={lightColor} position={[0, 3, 10]} />
      </group>
      <ambientLight intensity={1} />
      <color attach="background" args={['#000000']} />
      <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={30} />
    </CanvasWrapper>
  );
}
