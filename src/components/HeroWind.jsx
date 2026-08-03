import { useEffect, useRef } from 'react';
import { wavesActive, audioLevel, audioBeat } from '../lib/audioReactivity';

// A stylized "wind in the hair" effect for the hero photo: an SVG
// turbulence/displacement filter warps a duplicate of the photo, faded
// out below the hairline via a CSS mask (see .hero-img-wind), so only
// the hair appears to ripple in a breeze while the face/glasses
// underneath stay perfectly sharp and undistorted. Eases in when the
// chatbot opens and the track starts playing, back to invisible at
// idle, with the gust strength nudged by the music's loudness/beat.
export default function HeroWind({ src }) {
  const imgRef = useRef(null);
  const turbRef = useRef(null);
  const dispRef = useRef(null);

  useEffect(() => {
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
        const freqY = 0.03 + Math.sin(t * 0.6) * 0.008 + level * 0.015 + beat * 0.012;
        const freqX = 0.018 + Math.sin(t * 0.35 + 1.3) * 0.006;
        turbRef.current.setAttribute('baseFrequency', `${freqX.toFixed(4)} ${freqY.toFixed(4)}`);
        const scale = 22 + level * 18 + beat * 14;
        dispRef.current.setAttribute('scale', scale.toFixed(2));
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <filter id="heroWindFilter" x="-30%" y="-30%" width="160%" height="160%">
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
        style={{ filter: 'url(#heroWindFilter)', opacity: 0 }}
      />
    </>
  );
}
