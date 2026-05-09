// Tech Loop — logos only, no text labels
(function initTechLoop() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const techItems = [
    { cls: 'devicon-python-original colored' },
    { cls: 'devicon-tensorflow-original colored' },
    { cls: 'devicon-flutter-original colored' },
    { cls: 'devicon-typescript-original colored' },
    { cls: 'devicon-amazonwebservices-plain colored' },
    { cls: 'devicon-docker-original colored' },
    { cls: 'devicon-pandas-original colored' },
    { cls: 'devicon-keras-original colored' },
    { cls: 'devicon-numpy-original colored' },
    { cls: 'devicon-java-original colored' },
    { cls: 'devicon-postgresql-original colored' },
    { cls: 'devicon-matplotlib-plain colored' },
    { cls: 'devicon-scikitlearn-plain colored' },
    { cls: 'devicon-dart-plain colored' },
  ];

  const track = document.getElementById('techTrack');
  const container = document.getElementById('techLoop');
  if (!track || !container) return;

  const SPEED = 80;
  const SMOOTH_TAU = 0.25;

  function createList(ariaHidden) {
    const ul = document.createElement('ul');
    ul.className = 'tech-loop__list';
    if (ariaHidden) ul.setAttribute('aria-hidden', 'true');
    techItems.forEach(item => {
      const li = document.createElement('li');
      li.className = 'tech-loop__item';
      const div = document.createElement('div');
      div.className = 'tech-pill';
      const icon = document.createElement('i');
      icon.className = item.cls;
      div.appendChild(icon);
      li.appendChild(div);
      ul.appendChild(li);
    });
    return ul;
  }

  let offset = 0;
  let velocity = 0;
  let lastTimestamp = null;
  let isHovered = false;
  let seqWidth = 0;

  function setup() {
    track.innerHTML = '';
    const first = createList(false);
    track.appendChild(first);
    requestAnimationFrame(() => {
      seqWidth = Math.ceil(first.getBoundingClientRect().width);
      const copies = Math.max(2, Math.ceil(container.clientWidth / seqWidth) + 2);
      for (let i = 1; i < copies; i++) track.appendChild(createList(true));
    });
  }

  function animate(ts) {
    if (lastTimestamp === null) lastTimestamp = ts;
    const dt = Math.max(0, ts - lastTimestamp) / 1000;
    lastTimestamp = ts;
    const target = isHovered ? 0 : SPEED;
    velocity += (target - velocity) * (1 - Math.exp(-dt / SMOOTH_TAU));
    if (seqWidth > 0) {
      offset = ((offset + velocity * dt) % seqWidth + seqWidth) % seqWidth;
      track.style.transform = `translate3d(${-offset}px, 0, 0)`;
    }
    requestAnimationFrame(animate);
  }

  container.addEventListener('mouseenter', () => { isHovered = true; });
  container.addEventListener('mouseleave', () => { isHovered = false; });

  setup();
  requestAnimationFrame(animate);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { lastTimestamp = null; offset = 0; velocity = 0; setup(); }, 150);
  });
})();

// Dock magnification effect
(function initDock() {
  const panel = document.querySelector('.dock-panel');
  const items = document.querySelectorAll('.dock-item');
  if (!panel || !items.length) return;

  const BASE = 50;
  const MAX = 78;
  const DISTANCE = 130;

  function updateSizes(mouseX) {
    items.forEach(item => {
      const rect = item.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const dist = Math.abs(mouseX - center);
      const size = dist < DISTANCE
        ? BASE + (MAX - BASE) * Math.cos((dist / DISTANCE) * (Math.PI / 2))
        : BASE;
      item.style.width = size + 'px';
      item.style.height = size + 'px';
    });
  }

  panel.addEventListener('mousemove', e => updateSizes(e.clientX));
  panel.addEventListener('mouseleave', () => {
    items.forEach(item => {
      item.style.width = BASE + 'px';
      item.style.height = BASE + 'px';
    });
  });
})();

// Scroll fade-in
const fadeEls = document.querySelectorAll('.exp-row, .edu-card, .skill-group, .cert-item, .project-card, .highlight-card');

const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

fadeEls.forEach((el, i) => {
  el.classList.add('fade-up');
  el.style.transitionDelay = `${(i % 4) * 55}ms`;
  io.observe(el);
});
