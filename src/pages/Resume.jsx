import { useNavigate } from 'react-router-dom';
import DarkVeil from '../components/DarkVeil';
import './Resume.css';

export default function Resume() {
  const navigate = useNavigate();

  return (
    <div className="resume-page">
      <div className="resume-background">
        <DarkVeil speed={1} scanlineFrequency={2.6} warpAmount={1.9} />
      </div>
      <div className="resume-content">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        <div className="resume-box">
          <div className="resume-header">
            <h2>My Resume</h2>
            <a href="/Founder CV.pdf" download className="download-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Download PDF
            </a>
          </div>
          <div className="resume-pdf-container">
            <iframe src="/Founder CV.pdf" title="Resume" />
          </div>
        </div>
      </div>
    </div>
  );
}
