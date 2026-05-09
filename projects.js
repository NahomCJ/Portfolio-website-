(function () {
  'use strict';

  // Glow color = site's dark text: rgb(15,23,42)
  var GLOW = '15, 23, 42';
  var PARTICLE_COUNT = 9;
  var SPOTLIGHT_R = 480;

  var GITHUB_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>';
  var ARROW_SVG  = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>';

  var PROJECTS = [
    {
      title: 'Chronos',
      description: 'AI fintech super app — core banking, AI-powered financial advisory, BNPL, and a Crypto & NFT marketplace. Leading ML engineering, Flutter mobile development, and company strategy.',
      label: 'Live',
      status: 'live',
      tags: ['Flutter', 'Python', 'TensorFlow', 'AWS', 'Fintech'],
      link: 'https://github.com/nahomteklay',
      featured: true
    },
    {
      title: 'Marcus',
      description: 'An AI-powered software platform built from 0→1 in Warsaw. Full product lifecycle as CEO & CTO — architecture, engineering, product, and go-to-market execution.',
      label: 'Founder',
      tags: ['AI', 'Fullstack', 'Product'],
      link: 'https://github.com/NahomCJ/Marcus-'
    },
    {
      title: 'Janderebaw',
      description: 'Non-profit platform co-founded in 2022, now serving 300,000+ people across Ethiopia. Led full-stack development and raised $50K+ through crowdfunding.',
      label: 'Active',
      status: 'live',
      tags: ['Web', 'Mobile', 'Non-profit', 'Social Impact']
    },
    {
      title: 'Telemed',
      description: 'Healthcare appointment & prescription booking Android app. Contributed 30% of the codebase and led hospital & pharmacy partnerships — 25% profit margin.',
      label: 'Healthcare',
      tags: ['Android', 'Flutter', 'Partnerships']
    },
    {
      title: 'Fraud Detection',
      description: 'ML models for REID fraud detection and BNPL risk scoring on AWS EC2 — 27% improvement in anomaly detection accuracy using TensorFlow and Python.',
      label: 'ML',
      tags: ['Python', 'TensorFlow', 'AWS EC2', 'MLOps']
    },
    {
      title: 'Clinical AI',
      description: 'Analyzed 150,000+ anonymized patient records to identify migraine & chronic pain patterns at OESON. 22% improvement in symptom prediction accuracy.',
      label: 'Healthcare AI',
      tags: ['Python', 'Scikit-learn', 'Pandas', 'Healthcare']
    }
  ];

  // ── Build cards ─────────────────────────────────────────────────────────
  function buildGrid() {
    var grid = document.getElementById('bentoGrid');
    if (!grid) return;

    PROJECTS.forEach(function (project) {
      var card = document.createElement('div');
      var cls = 'bento-card';
      if (project.featured) cls += ' bento-card--featured';
      card.className = cls;
      card.style.cssText = '--glow-x:50%;--glow-y:50%;--glow-intensity:0;--glow-radius:' + SPOTLIGHT_R + 'px;';

      var labelCls = 'bento-card__label' + (project.status === 'live' ? ' bento-card__label--live' : '');
      var ghLink = project.link
        ? '<a href="' + project.link + '" target="_blank" rel="noopener" class="bento-card__gh" aria-label="View on GitHub">' + GITHUB_SVG + '</a>'
        : '';

      var tagsHtml = project.tags.map(function (t) { return '<span>' + t + '</span>'; }).join('');

      card.innerHTML =
        '<div class="bento-card__top">' +
          '<span class="' + labelCls + '">' + project.label + '</span>' +
          ghLink +
        '</div>' +
        '<div class="bento-card__bottom">' +
          '<h2 class="bento-card__title">' + project.title + '</h2>' +
          '<p class="bento-card__desc">' + project.description + '</p>' +
          '<div class="bento-card__tags">' + tagsHtml + '</div>' +
        '</div>';

      grid.appendChild(card);
    });

    // GitHub CTA card
    var cta = document.createElement('div');
    cta.className = 'bento-card bento-card--cta';
    cta.innerHTML =
      '<div class="bento-card__bottom">' +
        '<h2 class="bento-card__title">More on GitHub</h2>' +
        '<p class="bento-card__desc">Open-source contributions, experiments, and side projects.</p>' +
      '</div>' +
      '<a href="https://github.com/nahomteklay" target="_blank" rel="noopener" class="bento-card__cta-link">' +
        GITHUB_SVG + ' github.com/nahomteklay ' + ARROW_SVG +
      '</a>';
    grid.appendChild(cta);
  }

  // ── Spotlight ────────────────────────────────────────────────────────────
  var spotlight = null;

  function createSpotlight() {
    spotlight = document.createElement('div');
    spotlight.style.cssText =
      'position:fixed;width:720px;height:720px;border-radius:50%;pointer-events:none;' +
      'background:radial-gradient(circle,rgba(' + GLOW + ',0.055)0%,rgba(' + GLOW + ',0.025)30%,transparent 68%);' +
      'z-index:500;opacity:0;transform:translate(-50%,-50%);transition:opacity 0.3s ease;will-change:transform;';
    document.body.appendChild(spotlight);
  }

  function updateSpotlight(e) {
    if (!spotlight) return;
    var grid = document.getElementById('bentoGrid');
    if (!grid) return;

    var gr = grid.getBoundingClientRect();
    var inside = e.clientX >= gr.left && e.clientX <= gr.right &&
                 e.clientY >= gr.top  && e.clientY <= gr.bottom;

    spotlight.style.left = e.clientX + 'px';
    spotlight.style.top  = e.clientY + 'px';
    spotlight.style.opacity = inside ? '1' : '0';

    var proximity  = SPOTLIGHT_R * 0.5;
    var fadeDist   = SPOTLIGHT_R * 0.75;

    document.querySelectorAll('.bento-card').forEach(function (card) {
      var cr = card.getBoundingClientRect();
      var relX = ((e.clientX - cr.left) / cr.width)  * 100;
      var relY = ((e.clientY - cr.top)  / cr.height) * 100;
      var cx   = cr.left + cr.width  / 2;
      var cy   = cr.top  + cr.height / 2;
      var dist = Math.hypot(e.clientX - cx, e.clientY - cy) - Math.max(cr.width, cr.height) / 2;
      var eff  = Math.max(0, dist);
      var glow = 0;
      if (eff <= proximity) glow = 1;
      else if (eff <= fadeDist) glow = (fadeDist - eff) / (fadeDist - proximity);

      card.style.setProperty('--glow-x', relX + '%');
      card.style.setProperty('--glow-y', relY + '%');
      card.style.setProperty('--glow-intensity', glow.toFixed(3));
    });
  }

  // ── Particles ────────────────────────────────────────────────────────────
  function initParticles(card) {
    var particles = [];
    var timeouts  = [];
    var active    = false;

    function spawn() {
      if (!active) return;
      var bnd = card.getBoundingClientRect();

      for (var i = 0; i < PARTICLE_COUNT; i++) {
        (function (delay) {
          var t = setTimeout(function () {
            if (!active) return;
            var p = document.createElement('div');
            p.style.cssText =
              'position:absolute;width:3px;height:3px;border-radius:50%;pointer-events:none;z-index:10;' +
              'background:rgba(' + GLOW + ',0.65);box-shadow:0 0 5px rgba(' + GLOW + ',0.3);' +
              'left:' + (Math.random() * bnd.width) + 'px;top:' + (Math.random() * bnd.height) + 'px;';
            card.appendChild(p);
            particles.push(p);

            gsap.fromTo(p, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' });
            gsap.to(p, {
              x: (Math.random() - 0.5) * 90,
              y: (Math.random() - 0.5) * 90,
              rotation: Math.random() * 360,
              duration: 2 + Math.random() * 2,
              ease: 'none', repeat: -1, yoyo: true
            });
            gsap.to(p, { opacity: 0.15, duration: 1.4, ease: 'power2.inOut', repeat: -1, yoyo: true });
          }, delay);
          timeouts.push(t);
        })(i * 75);
      }
    }

    function clear() {
      timeouts.forEach(clearTimeout);
      timeouts = [];
      particles.forEach(function (p) {
        gsap.to(p, { scale: 0, opacity: 0, duration: 0.2, onComplete: function () { if (p.parentNode) p.parentNode.removeChild(p); } });
      });
      particles = [];
    }

    card.addEventListener('mouseenter', function () { active = true;  spawn(); });
    card.addEventListener('mouseleave', function () { active = false; clear(); });
  }

  // ── Tilt + Magnetism ─────────────────────────────────────────────────────
  function initMotion(card) {
    card.addEventListener('mousemove', function (e) {
      var r  = card.getBoundingClientRect();
      var x  = e.clientX - r.left;
      var y  = e.clientY - r.top;
      var cx = r.width  / 2;
      var cy = r.height / 2;
      gsap.to(card, {
        rotateX: ((y - cy) / cy) * -7,
        rotateY: ((x - cx) / cx) * 7,
        x: (x - cx) * 0.035,
        y: (y - cy) * 0.035,
        duration: 0.15,
        ease: 'power2.out',
        transformPerspective: 900
      });
    });

    card.addEventListener('mouseleave', function () {
      gsap.to(card, { rotateX: 0, rotateY: 0, x: 0, y: 0, duration: 0.5, ease: 'power3.out' });
    });
  }

  // ── Click ripple ─────────────────────────────────────────────────────────
  function initRipple(card) {
    card.addEventListener('click', function (e) {
      var r  = card.getBoundingClientRect();
      var x  = e.clientX - r.left;
      var y  = e.clientY - r.top;
      var d  = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - r.width, y),
        Math.hypot(x, y - r.height),
        Math.hypot(x - r.width, y - r.height)
      );
      var rip = document.createElement('div');
      rip.style.cssText =
        'position:absolute;border-radius:50%;pointer-events:none;z-index:100;' +
        'width:' + (d * 2) + 'px;height:' + (d * 2) + 'px;' +
        'left:' + (x - d) + 'px;top:' + (y - d) + 'px;' +
        'background:radial-gradient(circle,rgba(' + GLOW + ',0.1)0%,rgba(' + GLOW + ',0.04)40%,transparent 70%);';
      card.appendChild(rip);
      gsap.fromTo(rip,
        { scale: 0, opacity: 1 },
        { scale: 1, opacity: 0, duration: 0.75, ease: 'power2.out', onComplete: function () { if (rip.parentNode) rip.parentNode.removeChild(rip); } }
      );
    });
  }

  // ── Init ─────────────────────────────────────────────────────────────────
  function init() {
    buildGrid();
    createSpotlight();

    document.querySelectorAll('.bento-card').forEach(function (card) {
      initParticles(card);
      initMotion(card);
      initRipple(card);
    });

    document.addEventListener('mousemove', updateSpotlight);

    // Scroll fade-in for cards
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08 });

    document.querySelectorAll('.bento-card').forEach(function (el, i) {
      el.classList.add('fade-up');
      el.style.transitionDelay = (i % 3) * 60 + 'ms';
      io.observe(el);
    });
  }

  // Wait for both DOM and GSAP
  function tryInit() {
    if (typeof gsap === 'undefined') {
      setTimeout(tryInit, 50);
      return;
    }
    init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInit);
  } else {
    tryInit();
  }
})();
