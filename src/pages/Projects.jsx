import { useNavigate } from 'react-router-dom';
import MagicBento from '../components/MagicBento';
import Dock from '../components/Dock';
import './Projects.css';

// ─── Icons ───────────────────────────────────────────────────────────────────

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

const IconBack = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

const IconGH = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
);

const IconArrow = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="7" y1="17" x2="17" y2="7"/>
    <polyline points="7 7 17 7 17 17"/>
  </svg>
);

// ─── Project card content helpers ────────────────────────────────────────────

function ProjectCard({ label, live, ghUrl, title, desc, tags }) {
  return (
    <>
      <div className="mb-top">
        <span className={`mb-label${live ? ' mb-label--live' : ''}`}>{label}</span>
        {ghUrl && (
          <a href={ghUrl} target="_blank" rel="noopener" className="mb-gh" aria-label="View on GitHub">
            <IconGH />
          </a>
        )}
      </div>
      <div className="mb-bottom">
        <h2 className="mb-title">{title}</h2>
        <p className="mb-desc">{desc}</p>
        <div className="mb-tags">
          {tags.map(t => <span key={t}>{t}</span>)}
        </div>
      </div>
    </>
  );
}

// ─── Bento items ─────────────────────────────────────────────────────────────

const DARK = '#0a0a0a';

const ITEMS = [
  {
    featured: true,
    bg: DARK,
    content: (
      <ProjectCard
        label="Live"
        live
        ghUrl="https://github.com/nahomteklay"
        title="Chronos"
        desc="AI fintech super app: core banking, AI-powered financial advisory, BNPL, and a Crypto & NFT marketplace. Leading ML engineering, Flutter mobile development, and company strategy."
        tags={['Flutter', 'Python', 'TensorFlow', 'AWS', 'Fintech']}
      />
    ),
  },
  {
    featured: true,
    bg: DARK,
    content: (
      <ProjectCard
        label="Founder & CTO"
        live
        ghUrl="https://github.com/NahomCJ/Marcus-"
        title="Marcus"
        desc="AI-powered software platform built 0→1 in Warsaw. Sole architect and engineer — designed the full system, built the backend with FastAPI, integrated vector search via ChromaDB, and shipped the product end-to-end. Led architecture, engineering, product, and go-to-market as CEO & CTO."
        tags={['Python', 'FastAPI', 'ChromaDB', 'AI', 'React', 'Fullstack']}
      />
    ),
  },
  {
    bg: DARK,
    content: (
      <ProjectCard
        label="Active"
        live
        title="Janderebaw"
        desc="Non-profit platform co-founded in 2022, now serving 300,000+ people across Ethiopia. Led full-stack development and raised $50K+ through crowdfunding."
        tags={['Web', 'Mobile', 'Non-profit', 'Social Impact']}
      />
    ),
  },
  {
    bg: DARK,
    content: (
      <ProjectCard
        label="Healthcare"
        title="Telemed"
        desc="Healthcare appointment & prescription booking Android app. Contributed 30% of the codebase and led hospital & pharmacy partnerships, 25% profit margin."
        tags={['Android', 'Flutter', 'Partnerships']}
      />
    ),
  },
  {
    bg: DARK,
    content: (
      <ProjectCard
        label="ML"
        title="Fraud Detection"
        desc="ML models for REID fraud detection and BNPL risk scoring on AWS EC2, 27% improvement in anomaly detection accuracy using TensorFlow and Python."
        tags={['Python', 'TensorFlow', 'AWS EC2', 'MLOps']}
      />
    ),
  },
  {
    bg: DARK,
    content: (
      <ProjectCard
        label="Healthcare AI"
        title="Clinical AI"
        desc="Analyzed 150,000+ anonymized patient records to identify migraine & chronic pain patterns at OESON. 22% improvement in symptom prediction accuracy."
        tags={['Python', 'Scikit-learn', 'Pandas', 'Healthcare']}
      />
    ),
  },
  {
    cta: true,
    content: (
      <>
        <div className="mb-bottom">
          <h2 className="mb-title">More on GitHub</h2>
          <p className="mb-desc">Open-source contributions, experiments, and side projects.</p>
        </div>
        <a
          href="https://github.com/nahomteklay"
          target="_blank"
          rel="noopener"
          className="mb-cta-link"
        >
          <IconGH /> github.com/nahomteklay <IconArrow />
        </a>
      </>
    ),
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Projects() {
  const navigate = useNavigate();

  const dockItems = [
    {
      label: 'Home',
      icon: <IconHome />,
      onClick: () => navigate('/'),
    },
    {
      label: 'About',
      icon: <IconUser />,
      onClick: () => navigate('/#about'),
    },
    {
      label: 'Projects',
      icon: <IconGrid />,
      className: 'active',
    },
    {
      label: 'Resume',
      icon: <IconDoc />,
      onClick: () => window.open('/Nahom_Teklay_FlowCV_Resume_2026-05-15.pdf', '_blank'),
    },
    {
      label: 'Blogs',
      icon: <IconPen />,
      className: 'disabled',
    },
  ];

  return (
    <>
      <header className="proj-header">
        <div className="container">
          <button className="proj-back" onClick={() => navigate('/')}>
            <IconBack /> Back
          </button>
          <span className="sec-label">Work</span>
          <h1 className="proj-heading">Featured Projects</h1>
          <p className="proj-sub">
            Things I&apos;ve built, from AI systems to non-profits serving hundreds of thousands.
          </p>
        </div>
      </header>

      <main className="proj-main">
        <div className="container">
          <MagicBento items={ITEMS} glowColor="109, 40, 217" />
        </div>
      </main>

      <footer className="proj-footer">
        <div className="container proj-footer-inner">
          <p>© 2026 Nahom Teklay</p>
          <p>Warsaw, Poland</p>
        </div>
      </footer>

      <Dock items={dockItems} />
    </>
  );
}
