import { useEffect, useId, useRef } from 'react';
import { wavesActive, audioLevel, audioBeat } from '../lib/audioReactivity';

// Pixel size the ripple strength/frequency below were tuned against (the
// 460px hero photo). Reused at other sizes (e.g. the resume avatar), the
// raw pixel values are rescaled against the element's actual rendered
// size so the ripple stays proportionate instead of overwhelming a small
// photo or barely registering on a large one.
const REF_SIZE = 458;

// A stylized "wind in the hair" effect for a circular profile photo: an
// SVG turbulence/displacement filter warps a duplicate of the photo,
// faded out below the hairline via a CSS mask (see .hero-img-wind), so
// only the hair appears to ripple in a breeze while the face/glasses
// underneath stay perfectly sharp and undistorted. Eases in when the
// chatbot opens and the track starts playing, back to invisible at
// idle, with the gust strength nudged by the music's loudness/beat.
export default function HeroWind({ src }) {
  const filterId = useId();
  const imgRef = useRef(null);
  const turbRef = useRef(null);
  const dispRef = useRef(null);
  const sizeRef = useRef(REF_SIZE);

  useEffect(() => {
    const measure = () => {
      const w = imgRef.current?.getBoundingClientRect().width;
      if (w) sizeRef.current = w;
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (imgRef.current) ro.observe(imgRef.current);

    let raf;
    let opacity = 0;
    let lastTime = performance.now();
    const tau = 1.2;
    let t = 0;

    const tick = (now) => {
      const dt = Math.max(0, (now - lastTime) / 1000);
      lastTime = now;
      t += dt;

      const target = wavesActive.current ? 1 : 0;
      opacity += (target - opacity) * (1 - Math.exp(-dt / tau));
      if (imgRef.current) imgRef.current.style.opacity = String(opacity);

      if (opacity > 0.01 && turbRef.current && dispRef.current) {
        const level = audioLevel.current;
        const beat = audioBeat.current;
        // k > 1 for smaller-than-reference photos: more noise cycles per
        // pixel (so the same number of ripples fit the smaller image) and
        // a proportionally smaller displacement in raw pixels.
        const k = REF_SIZE / sizeRef.current;
        const freqY = (0.03 + Math.sin(t * 0.6) * 0.008 + level * 0.015 + beat * 0.012) * k;
        const freqX = (0.018 + Math.sin(t * 0.35 + 1.3) * 0.006) * k;
        turbRef.current.setAttribute('baseFrequency', `${freqX.toFixed(4)} ${freqY.toFixed(4)}`);
        const scale = (22 + level * 18 + beat * 14) / k;
        dispRef.current.setAttribute('scale', scale.toFixed(2));
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence
            ref={turbRef}
            type="fractalNoise"
            baseFrequency="0.01 0.016"
            numOctaves="2"
            seed="4"
            result="turb"
          />
          <feDisplacementMap
            ref={dispRef}
            in="SourceGraphic"
            in2="turb"
            scale="6"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
      <img
        ref={imgRef}
        src={src}
        alt=""
        aria-hidden="true"
        className="hero-img-wind"
        style={{ filter: `url(#${filterId})`, opacity: 0 }}
      />
    </>
  );
}
