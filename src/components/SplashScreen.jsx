import { useEffect, useState } from 'react';
import MagicRings from './MagicRings';
import './SplashScreen.css';

export default function SplashScreen({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Show splash for 2.5 seconds, then fade out over 0.5 seconds
    const timer1 = setTimeout(() => {
      setIsFading(true);
    }, 2500);

    const timer2 = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className={`splash-screen ${isFading ? 'fade-out' : ''}`}>
      <div className="splash-rings-wrap">
        <MagicRings
          color="#fffefe"
          colorTwo="#ffffff"
          ringCount={3}
          speed={0.9}
          attenuation={7}
          lineThickness={1.5}
          baseRadius={0.29}
          radiusStep={0.13}
          scaleRate={0.1}
          opacity={0.55}
          blur={0}
          noiseAmount={0}
          rotation={0}
          ringGap={1.2}
          fadeIn={1}
          fadeOut={0.5}
          followMouse={false}
          mouseInfluence={0.2}
          hoverScale={1.45}
          parallax={0.04}
          clickBurst={false}
        />
      </div>
    </div>
  );
}
