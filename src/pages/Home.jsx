import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Beams from '../components/Beams';
import TechLoop from '../components/TechLoop';
import Dock from '../components/Dock';
import './Home.css';

// ─── Data ────────────────────────────────────────────────────────────────────

const EXPERIENCE = [
  {
    period: 'Sep 2025 – Present',
    location: 'San Francisco, CA',
    now: true,
    role: 'Founder & CEO',
    company: 'Chronos',
    companyUrl: 'https://chronos-sf.com',
    type: 'Full-time',
    featured: true,
    bullets: [
      'Building an AI Fintech Super App: core banking, AI-Financier, BNPL, and Crypto & NFT marketplace with a live operation system.',
      'Personally driving AI/ML model training & fine-tuning, 30% of the Flutter mobile app, and business & marketing strategy.',
      'Leading a team of 7 engineers and designers.',
    ],
  },
  {
    period: 'Oct 2025 – Present',
    location: 'Genoa, Italy · Hybrid',
    now: true,
    role: 'Founder In Residence',
    company: 'Genoa Entrepreneurship School',
    type: 'Program',
    bullets: [
      'Structured pre-accelerator with mentorship from YC alumni founders, FAANG operators, and investors including Douglas Leone (Sequoia Capital) and leaders from Google, Meta, Stripe, Tesla, Apple, Microsoft, and Rippling.',
      'Focus: customer discovery, product validation, go-to-market strategy, fundraising, and pitch preparation.',
    ],
  },
  {
    period: 'Jun – Dec 2025',
    location: 'Warsaw, Poland',
    role: 'CEO & CTO',
    company: 'Marcus',
    companyUrl: 'https://marcus-ai.eu',
    type: 'Full-time',
    bullets: [
      'Built a full-stack memory-augmented AI assistant with long-term context (ChromaDB + SQLite), real-time web search, image & video generation, voice interaction via Hume EVI, and a built-in coding agent (Sophia).',
      'Architected a FastAPI backend with 15+ REST/SSE endpoints covering chat streaming, semantic memory retrieval, web crawling, media generation, and Stripe billing.',
      'Engineered a three-layer memory system: ChromaDB vector search, Claude-compressed rolling fact sheets (auto-triggered every 20 messages), and live session history injected into every prompt.',
      'Shipped two VS Code extensions (Sophia + Marcus Code) for in-editor AI code assistance connected to the Marcus API.',
    ],
  },
  {
    period: 'Apr – Jul 2025',
    location: 'Warsaw, Poland',
    role: 'Data Science Intern',
    company: 'OESON',
    type: 'Internship',
    bullets: [
      'Analyzed 150,000+ anonymized patient records using Python and SQL to identify migraine and chronic pain patterns.',
      'Built and deployed ML classification models with MLOps pipelines on Google Colab, improved symptom prediction accuracy by 22%.',
      'Engineered data cleaning workflows to handle missing values and normalize time-series records aligned with CMS Modern 2025 QSM performance tracking.',
      'Partnered with healthcare analysts to define KPIs tied to LTSS workflows and RNTS-based alerting, contributing to enhanced intervention timelines.',
      'Delivered dashboards and visual reports in Matplotlib and Seaborn for clinical decision support.',
    ],
  },

  {
    period: 'Aug – Oct 2024',
    location: 'Brooklyn, NYC',
    role: 'AI Engineer Intern',
    company: 'GAOTek Inc.',
    companyUrl: 'https://gaotek.com',
    type: 'Internship',
    bullets: [
      'Developed and fine-tuned LLM models using Python, TensorFlow, and Jupyter for chatbot integration in drone platform diagnostics.',
      'Built and deployed ML models for REID fraud detection and BNPL risk scoring on AWS EC2, 27% improvement in anomaly detection accuracy.',
      'Collaborated with cross-functional teams on LTSS data workflows and real-time RNTS integration for faster alerts.',
      'Contributed to full-stack automation using Git Copilot, increasing lead engagement by 19%.',
    ],
  },
  {
    period: 'Apr – Aug 2024',
    location: 'Addis Ababa · Remote',
    role: 'Software Engineer Intern',
    company: 'Ozone Technologies',
    type: 'Internship',
    bullets: [
      'Contributed to 30% of the Telemed mobile app, a healthcare consultation, appointment booking, and prescription platform.',
      'Integrated RESTful APIs for dynamic product updates and real-time user interactions, improving loading performance by 40%.',
      'Led business negotiations with 3 hospitals and 2 pharmacy partners, establishing a 25% profit margin.',
    ],
  },
  {
    period: 'Feb – Mar 2024',
    location: 'Addis Ababa',
    role: 'Front-End Developer',
    company: 'Kuraz Tech',
    type: 'Internship',
    bullets: [
      'Built responsive UIs for an e-learning platform targeting university and secondary school students, impacting 2,000+ users.',
      'Used Flutter, HTML, CSS, and JavaScript for cross-device functionality; integrated RESTful APIs reducing manual update time by 50%.',
    ],
  },
  {
    period: 'Apr 2022 – Mar 2024',
    location: 'Addis Ababa',
    role: 'Founding Engineer',
    company: 'Janderebaw',
    type: 'Co-founder',
    bullets: [
      'Co-founded a non-profit now serving 300,000+ people, led website and mobile app development as a core engineer.',
      'Personally contributed to 40% of the website codebase and managed the cloud database infrastructure.',
      'Raised $50,000+ through crowdfunding campaigns.',
    ],
  },
  {
    period: '2023 – Aug 2023',
    location: 'Addis Ababa · Part-time',
    role: 'Jr. Front-End Developer & Project Manager',
    company: 'Ozone Technologies',
    type: 'Part-time',
    bullets: [
      "Developed the frontend of AGTA PLC's e-commerce website, contributing to a 28% increase in online sales through improved UX/UI.",
      'Managed digital marketing operations including email automation and social campaigns, generating 20%+ lead growth.',
      'Coordinated IT operations using Trello, Google Docs, and Sheets; maintained 99.9% platform availability post-launch.',
    ],
  },
  {
    period: 'Aug – Oct 2023',
    location: 'Addis Ababa',
    role: 'Network Marketing & Sales Manager',
    company: 'Break Through S.C',
    type: 'On-site',
    bullets: [],
  },
  {
    period: 'Jun – Aug 2023',
    location: 'Addis Ababa',
    role: 'Self Development Trainer',
    company: 'Break Through S.C',
    type: 'On-site',
    bullets: [],
  },
];

const SKILLS = [
  { cat: 'Languages',        items: ['Python', 'Flutter / Dart', 'Java', 'C++', 'TypeScript', 'R'] },
  { cat: 'ML / AI',          items: ['TensorFlow', 'Keras', 'Scikit-learn', 'LLM Fine-tuning', 'MLOps', 'NLP', 'Deep Learning'] },
  { cat: 'Data Science',     items: ['Pandas', 'NumPy', 'SciPy', 'Statsmodels', 'Matplotlib', 'Seaborn', 'Plotly', 'Power BI'] },
  { cat: 'Cloud & Infra',    items: ['AWS', 'Docker', 'PostgreSQL', 'RESTful APIs'] },
  { cat: 'Frontend',         items: ['React', 'HTML', 'CSS', 'JavaScript'] },
  { cat: 'Spoken Languages', items: ['English: C2', 'Amharic: C2', 'Italian: A2', 'Polish: A1'] },
];

const EDUCATION = [
  {
    year: '2024 – 2027',
    degree: 'BSc in Computer Science & Artificial Intelligence - Minor in Cyber Security',
    school: 'Vistula University',
    location: 'Warsaw, Poland',
    gpa: 'GPA 3.92 / 4.0',
  },
  {
    year: '2021 –',
    degree: 'BSc Political & International Relations',
    school: 'University of Messina',
    location: 'Messina, Italy',
  },
  {
    year: '2016 – 2020',
    degree: 'High School Diploma',
    school: 'Sunny Side Educational Institute',
    location: 'Addis Ababa, Ethiopia',
    gpa: 'GPA 3.96 / 4.0 · Distinguished Honors',
  },
];

const CERTS = [
  { name: 'AWS Cloud Solution Architect',        from: 'Amazon Web Services · Ongoing', url: '#' },
  { name: 'Cloud Computing',                     from: 'Coursera',                      url: 'https://drive.google.com/file/d/1DuWQYN_jQm9_zdUrp_En-QQDf3_KepDv/view?usp=drivesdk' },
  { name: 'Data Science',                        from: 'OESON',                         url: 'https://drive.google.com/file/d/1GR1piHmJOVWFwQ0xvZ6fDnNV3jJLfvD-/view?usp=drivesdk' },
  { name: 'AI Engineering',                      from: 'GAOTek Inc.',                   url: 'https://drive.google.com/file/d/1JL2NJNz6VeBcewUySCOZ61FeU22-OXyS/view?usp=drivesdk' },
  { name: 'Digital Marketing',                   from: 'GAOTek Inc.',                   url: 'https://drive.google.com/file/d/15cs1SZnHGahFYqKWbGmgBZAF0t2h2w9D/view?usp=drivesdk' },
  { name: 'C++ Programming',                     from: 'Virtual CE',                    url: 'https://drive.google.com/file/d/1KcAOlLrUOsdVYuO60ChGEXXLh-29E2NS/view?usp=drivesdk' },
  { name: 'Psychology: Discovering Personality', from: 'Peterson Academy',              url: 'https://drive.google.com/file/d/1_h3wU81n5UCfKuOBMlM-_FpJYLfGKjO4/view?usp=drivesdk' },
];

const HIGHLIGHTS = [
  { num: '300K+', label: 'People Served' },
  { num: '10+',   label: 'Roles & Internships' },
  { num: '4',     label: 'Spoken Languages' },
  { num: '7',     label: 'Team at Chronos' },
];

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const IconHome = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const IconUser = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconGrid = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);

const IconDoc = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

const IconPen = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const IconMail = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,12 2,6"/>
  </svg>
);

const IconLinkedIn = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const IconGithub = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
);

const IconInstagram = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm3.98-10.834a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" />
  </svg>
);

// ─── Component ────────────────────────────────────────────────────────────────

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const els = document.querySelectorAll('.js-fade');
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });
    els.forEach((el, i) => {
      el.classList.add('fade-up');
      el.style.transitionDelay = `${(i % 4) * 55}ms`;
      io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const dockItems = [
    {
      label: 'Home',
      icon: <IconHome />,
      onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
    },
    {
      label: 'About',
      icon: <IconUser />,
      onClick: () => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      label: 'Projects',
      icon: <IconGrid />,
      onClick: () => navigate('/projects'),
    },
    {
      label: 'Resume',
      icon: <IconDoc />,
      onClick: () => navigate('/resume'),
    },
    {
      label: 'Blogs',
      icon: <IconPen />,
      className: 'disabled',
    },
  ];

  const scrollTo = (id) => (e) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* ── HERO ── */}
      <section id="hero">
        <Beams beamWidth={1.5} beamHeight={20} beamNumber={15} lightColor="#7186c4" speed={2} noiseIntensity={1.05} scale={0.2} rotation={136} />
        <div className="container">
          <div className="hero-inner">
            <div className="hero-text">
              <h1 className="hero-name">Nahom Teklay</h1>
              <p className="hero-role">Data Scientist · AI Engineer · Software Developer</p>
              <p className="hero-bio">
                Experienced in <strong>ML pipelines</strong>, mobile development, and cloud deployment,
                building production systems across healthcare, fintech, and enterprise software.
              </p>
              <div className="hero-actions">
                <a href="https://linkedin.com/in/nahom-teklay" target="_blank" rel="noopener" className="hero-social-btn" aria-label="LinkedIn">
                  <IconLinkedIn />
                </a>
                <a href="https://github.com/nahomteklay" target="_blank" rel="noopener" className="hero-social-btn" aria-label="GitHub">
                  <IconGithub />
                </a>
                <a href="https://www.instagram.com/_nahom.teklay?igsh=ZWNiOGVycmR2dW1o&utm_source=qr" target="_blank" rel="noopener" className="hero-social-btn" aria-label="Instagram">
                  <IconInstagram />
                </a>
              </div>
            </div>
            <div className="hero-img-wrap">
              <img src="/photo.jpg" alt="Nahom Teklay" />
            </div>
          </div>
        </div>
      </section>

      {/* ── TECH LOOP ── */}
      <TechLoop />

      {/* ── ABOUT ── */}
      <section id="about">
        <Beams />
        <div className="container">
          <div className="sec-head">
            <span className="sec-label">About</span>
            <h2>About Me</h2>
          </div>
          <div className="about-inner">
            <div className="about-body">
              <p className="about-lead">I&apos;m a data scientist and AI engineer with hands-on experience building ML systems, mobile applications, and full-stack platforms.</p>
              <p>
                I work across the full ML lifecycle, from data engineering and feature extraction to model training,
                MLOps pipelines, and cloud deployment on AWS. My primary stack is <strong>Python</strong> and{' '}
                <strong>Dart (Flutter)</strong>, with experience across TensorFlow, Scikit-learn, Keras, and RESTful
                API integration. I&apos;ve shipped production models and contributed to multi-platform mobile apps
                serving real users.
              </p>
              <p>
                Recent technical work includes building ML classification pipelines on 150,000+ anonymized patient
                records at <strong>OESON</strong>, fine-tuning LLMs and deploying fraud detection models on AWS EC2
                at <strong>GAOTek Inc.</strong>, and contributing to Flutter and Android mobile apps at{' '}
                <strong>Ozone Technologies</strong>. Currently pursuing a BSc in Computer Science &amp; Artificial Intelligence (Minor in Cyber Security) at Vistula
                University.
              </p>
            </div>
            <div className="about-highlights">
              {HIGHLIGHTS.map(h => (
                <div key={h.label} className="highlight-card js-fade">
                  <span className="highlight-num">{h.num}</span>
                  <span className="highlight-label">{h.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── EXPERIENCE ── */}
      <section id="experience">
        <div className="container">
          <div className="sec-head">
            <span className="sec-label">Experience</span>
            <h2>Where I&apos;ve worked</h2>
          </div>
          <div className="exp-list">
            {EXPERIENCE.map((exp, i) => (
              <div
                key={i}
                className={`exp-row js-fade${exp.featured ? ' exp-featured' : ''}${!exp.bullets?.length ? ' exp-compact' : ''}`}
              >
                <div className="exp-aside">
                  <span className="exp-period">{exp.period}</span>
                  <span className="exp-where">{exp.location}</span>
                  {exp.now && <span className="now-badge">Now</span>}
                </div>
                <div>
                  <div className="exp-top">
                    <span className="exp-role">{exp.role}</span>
                    {exp.companyUrl ? (
                      <a href={exp.companyUrl} target="_blank" rel="noopener" className="exp-co">
                        {exp.company}
                      </a>
                    ) : (
                      <span className="exp-co">{exp.company}</span>
                    )}
                    <span className="exp-type">{exp.type}</span>
                  </div>
                  {exp.bullets?.length > 0 && (
                    <ul className="exp-ul">
                      {exp.bullets.map((b, j) => <li key={j}>{b}</li>)}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SKILLS ── */}
      <section id="skills">
        <div className="container">
          <div className="sec-head">
            <span className="sec-label">Skills</span>
            <h2>What I work with</h2>
          </div>
          <div className="skills-wrap">
            {SKILLS.map(s => (
              <div key={s.cat} className="skill-group js-fade">
                <p className="skill-cat">{s.cat}</p>
                <div className="pills">
                  {s.items.map(item => <span key={item}>{item}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EDUCATION ── */}
      <section id="education">
        <div className="container">
          <div className="sec-head">
            <span className="sec-label">Education</span>
            <h2>Where I&apos;ve studied</h2>
          </div>
          <div className="edu-grid">
            {EDUCATION.map((edu, i) => (
              <div key={i} className="edu-card js-fade">
                <p className="edu-year">{edu.year}</p>
                <h3>{edu.degree}</h3>
                <p className="edu-school">{edu.school}</p>
                <p className="edu-loc">{edu.location}</p>
                {edu.gpa && <span className="edu-gpa">{edu.gpa}</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CERTIFICATES ── */}
      <section id="certificates">
        <div className="container">
          <div className="sec-head">
            <span className="sec-label">Credentials</span>
            <h2>Certificates</h2>
          </div>
          <div className="cert-list">
            {CERTS.map((c, i) => (
              <a key={i} href={c.url} className="cert-item cert-item--link js-fade" target="_blank" rel="noopener">
                <span className="cert-name">{c.name}</span>
                <span className="cert-from">{c.from}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact">
        <Beams beamWidth={1.5} beamHeight={20} beamNumber={15} lightColor="#7186c4" speed={2} noiseIntensity={1.05} scale={0.2} rotation={181} />
        <div className="container">
          <div className="contact-wrap">
            <h2>Let&apos;s get in touch.</h2>
            <p>
              Open to engineering roles, collaborations, and anything at the intersection of
              AI, data, and mobile development.
            </p>
            <a href="mailto:nahomteklay17@gmail.com" className="btn btn-white btn-lg">
              <IconMail /> nahomteklay17@gmail.com
            </a>
            <div className="contact-links">
              <a
                href="https://linkedin.com/in/nahom-teklay"
                target="_blank"
                rel="noopener"
                className="contact-link-item"
              >
                <IconLinkedIn /> LinkedIn
              </a>
              <a
                href="https://github.com/NahomCJ"
                target="_blank"
                rel="noopener"
                className="contact-link-item"
              >
                <IconGithub /> GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <div className="container footer-inner">
          <p>© 2026 Nahom Teklay</p>
          <p>Warsaw, Poland</p>
        </div>
      </footer>

      <Dock items={dockItems} />
    </>
  );
}
