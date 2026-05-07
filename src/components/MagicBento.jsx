import { useRef, useEffect, useCallback, useState } from 'react';
import { gsap } from 'gsap';
import './MagicBento.css';

const DEFAULT_PARTICLE_COUNT = 10;
const DEFAULT_SPOTLIGHT_RADIUS = 480;
const DEFAULT_GLOW_COLOR = '15, 23, 42';

function createParticle(x, y, color) {
  const el = document.createElement('div');
  el.className = 'mb-particle';
  el.style.cssText = `left:${x}px;top:${y}px;background:rgba(${color},0.7);box-shadow:0 0 5px rgba(${color},0.3);`;
  return el;
}

function ParticleCard({ children, className = '', style, particleCount = DEFAULT_PARTICLE_COUNT, glowColor = DEFAULT_GLOW_COLOR, enableTilt = true, clickEffect = true, enableMagnetism = true, disableAnimations = false }) {
  const cardRef = useRef(null);
  const particlesRef = useRef([]);
  const timeoutsRef = useRef([]);
  const isHoveredRef = useRef(false);
  const magRef = useRef(null);

  const clearAll = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    magRef.current?.kill();
    particlesRef.current.forEach(p => {
      gsap.to(p, { scale: 0, opacity: 0, duration: 0.2, onComplete: () => p.remove() });
    });
    particlesRef.current = [];
  }, []);

  const spawnParticles = useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current) return;
    const { width, height } = cardRef.current.getBoundingClientRect();
    for (let i = 0; i < particleCount; i++) {
      const t = setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return;
        const p = createParticle(Math.random() * width, Math.random() * height, glowColor);
        cardRef.current.appendChild(p);
        particlesRef.current.push(p);
        gsap.fromTo(p, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' });
        gsap.to(p, { x: (Math.random()-0.5)*90, y: (Math.random()-0.5)*90, rotation: Math.random()*360, duration: 2+Math.random()*2, ease: 'none', repeat: -1, yoyo: true });
        gsap.to(p, { opacity: 0.15, duration: 1.4, ease: 'power2.inOut', repeat: -1, yoyo: true });
      }, i * 75);
      timeoutsRef.current.push(t);
    }
  }, [particleCount, glowColor]);

  useEffect(() => {
    if (disableAnimations || !cardRef.current) return;
    const el = cardRef.current;

    const onEnter = () => { isHoveredRef.current = true; spawnParticles(); if (enableTilt) gsap.to(el, { rotateX: 4, rotateY: 4, duration: 0.3, ease: 'power2.out', transformPerspective: 1000 }); };
    const onLeave = () => {
      isHoveredRef.current = false; clearAll();
      if (enableTilt) gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.4, ease: 'power2.out' });
      if (enableMagnetism) gsap.to(el, { x: 0, y: 0, duration: 0.4, ease: 'power2.out' });
    };
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      const cx = r.width / 2, cy = r.height / 2;
      if (enableTilt) gsap.to(el, { rotateX: ((y-cy)/cy)*-8, rotateY: ((x-cx)/cx)*8, duration: 0.1, ease: 'power2.out', transformPerspective: 1000 });
      if (enableMagnetism) { magRef.current = gsap.to(el, { x: (x-cx)*0.04, y: (y-cy)*0.04, duration: 0.3, ease: 'power2.out' }); }
    };
    const onClick = (e) => {
      if (!clickEffect) return;
      const r = el.getBoundingClientRect();
      const x = e.clientX-r.left, y = e.clientY-r.top;
      const d = Math.max(Math.hypot(x,y), Math.hypot(x-r.width,y), Math.hypot(x,y-r.height), Math.hypot(x-r.width,y-r.height));
      const rip = document.createElement('div');
      rip.style.cssText = `position:absolute;border-radius:50%;pointer-events:none;z-index:100;width:${d*2}px;height:${d*2}px;left:${x-d}px;top:${y-d}px;background:radial-gradient(circle,rgba(${glowColor},0.15)0%,transparent 70%);`;
      el.appendChild(rip);
      gsap.fromTo(rip, { scale: 0, opacity: 1 }, { scale: 1, opacity: 0, duration: 0.75, ease: 'power2.out', onComplete: () => rip.remove() });
    };

    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    el.addEventListener('mousemove', onMove);
    el.addEventListener('click', onClick);
    return () => {
      isHoveredRef.current = false;
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('click', onClick);
      clearAll();
    };
  }, [spawnParticles, clearAll, disableAnimations, enableTilt, enableMagnetism, clickEffect, glowColor]);

  return (
    <div ref={cardRef} className={className} style={{ ...style, position: 'relative', overflow: 'hidden' }}>
      {children}
    </div>
  );
}

function GlobalSpotlight({ gridRef, enabled, spotlightRadius, glowColor }) {
  useEffect(() => {
    if (!enabled || !gridRef?.current) return;
    const spot = document.createElement('div');
    spot.style.cssText = `position:fixed;width:700px;height:700px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,rgba(${glowColor},0.07)0%,rgba(${glowColor},0.03)30%,transparent 68%);z-index:200;opacity:0;transform:translate(-50%,-50%);transition:opacity 0.3s;`;
    document.body.appendChild(spot);

    const proximity = spotlightRadius * 0.5;
    const fadeDist = spotlightRadius * 0.75;

    const onMove = (e) => {
      const section = gridRef.current?.closest('.mb-section');
      const gr = section?.getBoundingClientRect();
      const inside = gr && e.clientX >= gr.left && e.clientX <= gr.right && e.clientY >= gr.top && e.clientY <= gr.bottom;
      spot.style.left = e.clientX + 'px';
      spot.style.top = e.clientY + 'px';
      spot.style.opacity = inside ? '1' : '0';

      gridRef.current?.querySelectorAll('.mb-card').forEach(card => {
        const cr = card.getBoundingClientRect();
        const relX = ((e.clientX - cr.left) / cr.width) * 100;
        const relY = ((e.clientY - cr.top) / cr.height) * 100;
        const dist = Math.max(0, Math.hypot(e.clientX - (cr.left+cr.width/2), e.clientY - (cr.top+cr.height/2)) - Math.max(cr.width,cr.height)/2);
        const glow = dist <= proximity ? 1 : dist <= fadeDist ? (fadeDist-dist)/(fadeDist-proximity) : 0;
        card.style.setProperty('--glow-x', relX + '%');
        card.style.setProperty('--glow-y', relY + '%');
        card.style.setProperty('--glow-intensity', glow.toFixed(3));
        card.style.setProperty('--glow-radius', spotlightRadius + 'px');
      });
    };
    const onLeave = () => { spot.style.opacity = '0'; };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      spot.remove();
    };
  }, [gridRef, enabled, spotlightRadius, glowColor]);
  return null;
}

export default function MagicBento({
  items = [],
  glowColor = DEFAULT_GLOW_COLOR,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  particleCount = DEFAULT_PARTICLE_COUNT,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  enableTilt = true,
  enableMagnetism = true,
  clickEffect = true,
  disableAnimations = false,
}) {
  const gridRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  const noAnim = disableAnimations || isMobile;

  return (
    <div className="mb-section">
      {enableSpotlight && <GlobalSpotlight gridRef={gridRef} enabled={!noAnim} spotlightRadius={spotlightRadius} glowColor={glowColor} />}
      <div className="mb-grid" ref={gridRef}>
        {items.map((item, i) => {
          const cardClass = `mb-card${enableBorderGlow ? ' mb-card--glow' : ''}${item.featured ? ' mb-card--featured' : ''}${item.cta ? ' mb-card--cta' : ''}`;
          const cardStyle = { '--glow-color': glowColor, '--glow-x': '50%', '--glow-y': '50%', '--glow-intensity': '0', '--glow-radius': spotlightRadius + 'px', background: item.bg || '#fff', borderColor: item.borderColor || undefined };
          if (enableStars && !noAnim) {
            return (
              <ParticleCard key={i} className={cardClass} style={cardStyle} particleCount={particleCount} glowColor={glowColor} enableTilt={enableTilt} clickEffect={clickEffect} enableMagnetism={enableMagnetism} disableAnimations={noAnim}>
                {item.content}
              </ParticleCard>
            );
          }
          return <div key={i} className={cardClass} style={cardStyle}>{item.content}</div>;
        })}
      </div>
    </div>
  );
}
