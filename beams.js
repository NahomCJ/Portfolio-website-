// Vanilla Three.js port of the React Bits Beams component
// Requires Three.js to be loaded globally as `THREE`

(function () {
  if (typeof THREE === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* ── GLSL noise (2D random + bilinear + 3D Perlin cnoise) ── */
  const NOISE = `
float random(in vec2 st){return fract(sin(dot(st,vec2(12.9898,78.233)))*43758.5453123);}
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

  /* ── Clone uniforms (compat shim for deprecated UniformsUtils) ── */
  function cloneUniforms(src) {
    if (THREE.UniformsUtils && THREE.UniformsUtils.clone) {
      return THREE.UniformsUtils.clone(src);
    }
    const dst = {};
    for (const k in src) {
      const v = src[k].value;
      dst[k] = { value: v && typeof v.clone === 'function' ? v.clone() : v };
    }
    return dst;
  }

  /* ── Extend THREE.ShaderLib.physical with custom shader chunks ── */
  function extendMaterial(cfg) {
    const phys = THREE.ShaderLib.physical;
    const uniforms = cloneUniforms(phys.uniforms);

    for (const [k, v] of Object.entries(cfg.uniforms || {})) {
      const u = (v && typeof v === 'object' && 'value' in v) ? v : { value: v };
      if (uniforms[k]) {
        uniforms[k].value = u.value;
      } else {
        uniforms[k] = u;
      }
    }

    const H = cfg.header || '', VH = cfg.vertexHeader || '';
    let vert = H + '\n' + VH + '\n' + phys.vertexShader;
    let frag = H + '\n' + phys.fragmentShader;

    for (const [token, code] of Object.entries(cfg.vertex || {})) {
      vert = vert.split(token).join(token + '\n' + code);
    }
    for (const [token, code] of Object.entries(cfg.fragment || {})) {
      frag = frag.split(token).join(token + '\n' + code);
    }

    return new THREE.ShaderMaterial({
      defines: { STANDARD: '', PHYSICAL: '', ...(phys.defines || {}) },
      uniforms,
      vertexShader: vert,
      fragmentShader: frag,
      lights: true,
    });
  }

  /* ── Stacked planes geometry (direct port from React component) ── */
  function stackedPlanesGeo(n, w, h, spacing, segs) {
    const geo = new THREE.BufferGeometry();
    const nV = n * (segs + 1) * 2;
    const pos = new Float32Array(nV * 3);
    const idx = new Uint32Array(n * segs * 6);
    const uvs = new Float32Array(nV * 2);
    let vO = 0, iO = 0, uO = 0;
    const totalW = n * w + (n - 1) * spacing;
    const x0 = -totalW / 2;
    for (let i = 0; i < n; i++) {
      const xOff = x0 + i * (w + spacing);
      const ux = Math.random() * 300, uy = Math.random() * 300;
      for (let j = 0; j <= segs; j++) {
        const y = h * (j / segs - 0.5);
        pos.set([xOff, y, 0, xOff + w, y, 0], vO * 3);
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

  /* ── BeamsEffect class ────────────────────────────────────────── */
  class BeamsEffect {
    constructor(el, opts) {
      this.el = el;
      this.o = Object.assign({
        beamWidth: 2, beamHeight: 15, beamNumber: 12,
        lightColor: '#ffffff', speed: 2, noiseIntensity: 1.75,
        scale: 0.2, rotation: 0
      }, opts);
      this._dead = false;
      this._build();
    }

    _build() {
      const { el, o } = this;
      const w = el.clientWidth || window.innerWidth;
      const h = el.clientHeight || 400;

      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.setSize(w, h);
      Object.assign(this.renderer.domElement.style, {
        position: 'absolute', top: '0', left: '0',
        width: '100%', height: '100%',
        zIndex: '0', pointerEvents: 'none', display: 'block'
      });
      el.insertBefore(this.renderer.domElement, el.firstChild);

      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x000000);

      this.cam = new THREE.PerspectiveCamera(30, w / h, 0.1, 100);
      this.cam.position.set(0, 0, 20);

      this.mat = extendMaterial({
        header: `
          varying vec3 vEye; varying float vNoise;
          varying vec2 vUv; varying vec3 vPosition;
          uniform float time; uniform float uSpeed;
          uniform float uNoiseIntensity; uniform float uScale;
          ${NOISE}`,
        vertexHeader: `
          float getPos(vec3 p){
            return cnoise(vec3(p.x*0.,p.y-uv.y,p.z+time*uSpeed*3.)*uScale);
          }
          vec3 curPos(vec3 p){vec3 np=p;np.z+=getPos(p);return np;}
          vec3 getNorm(vec3 p){
            vec3 cp=curPos(p);
            vec3 nx=curPos(p+vec3(.01,0.,0.));
            vec3 nz=curPos(p+vec3(0.,-.01,0.));
            return normalize(cross(normalize(nz-cp),normalize(nx-cp)));
          }`,
        vertex: {
          '#include <begin_vertex>':      'transformed.z+=getPos(transformed.xyz);',
          '#include <beginnormal_vertex>': 'objectNormal=getNorm(position.xyz);'
        },
        fragment: {
          '#include <dithering_fragment>':
            'gl_FragColor.rgb-=noise(gl_FragCoord.xy)/15.*uNoiseIntensity;'
        },
        uniforms: {
          diffuse:         { value: new THREE.Color(0, 0, 0) },
          time:            { value: 0 },
          roughness:       { value: 0.3 },
          metalness:       { value: 0.3 },
          uSpeed:          { value: o.speed },
          envMapIntensity: { value: 10 },
          uNoiseIntensity: { value: o.noiseIntensity },
          uScale:          { value: o.scale }
        }
      });

      const geo = stackedPlanesGeo(o.beamNumber, o.beamWidth, o.beamHeight, 0, 100);
      const mesh = new THREE.Mesh(geo, this.mat);
      const grp = new THREE.Group();
      grp.rotation.z = THREE.MathUtils.degToRad(o.rotation);
      grp.add(mesh);
      this.scene.add(grp);

      const dl = new THREE.DirectionalLight(o.lightColor, 1);
      dl.position.set(0, 3, 10);
      this.scene.add(dl);
      this.scene.add(new THREE.AmbientLight(0xffffff, 1));

      this.clock = new THREE.Clock();
      this._loop();

      this._ro = new ResizeObserver(() => this._resize());
      this._ro.observe(el);
    }

    _loop() {
      if (this._dead) return;
      const dt = this.clock.getDelta();
      this.mat.uniforms.time.value += 0.1 * dt;
      this.renderer.render(this.scene, this.cam);
      this._raf = requestAnimationFrame(() => this._loop());
    }

    _resize() {
      const w = this.el.clientWidth, h = this.el.clientHeight;
      if (!w || !h) return;
      this.cam.aspect = w / h;
      this.cam.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    }

    destroy() {
      this._dead = true;
      cancelAnimationFrame(this._raf);
      this._ro.disconnect();
      this.renderer.dispose();
      this.renderer.domElement.remove();
    }
  }

  /* ── Bootstrap ────────────────────────────────────────────────── */
  function boot() {
    const hero    = document.getElementById('hero');
    const foot    = document.querySelector('footer');
    const contact = document.getElementById('contact');
    const about   = document.getElementById('about');

    if (hero) {
      new BeamsEffect(hero, {
        beamWidth: 1.9, beamHeight: 15, beamNumber: 12,
        lightColor: '#6699ff', speed: 4.8, noiseIntensity: 1.45,
        scale: 0.2, rotation: 31
      });
    }

    if (foot) {
      new BeamsEffect(foot, {
        beamWidth: 2, beamHeight: 20, beamNumber: 14,
        lightColor: '#8fb3ff', speed: 3.2, noiseIntensity: 1.1,
        scale: 0.18, rotation: 0
      });
    }

    if (contact) {
      new BeamsEffect(contact, {
        beamWidth: 2.2, beamHeight: 20, beamNumber: 14,
        lightColor: '#aac4ff', speed: 2.8, noiseIntensity: 1.2,
        scale: 0.18, rotation: 15
      });
    }

    if (about) {
      new BeamsEffect(about, {
        beamWidth: 2, beamHeight: 18, beamNumber: 11,
        lightColor: '#99aaff', speed: 2.2, noiseIntensity: 1.3,
        scale: 0.2, rotation: -18
      });
    }

  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', boot)
    : boot();
})();
