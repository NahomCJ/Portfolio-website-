import { useState, useRef } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import Anthropic from '@anthropic-ai/sdk'
import Home from './pages/Home'
import Projects from './pages/Projects'
import Resume from './pages/Resume'
import SplashScreen from './components/SplashScreen'
import ChrisHomeFab from './components/ChrisHomeFab'

const TRACY_SYSTEM = `You are Tracy, Nahom Teklay's AI hype-woman and personal salesperson. Your one job: sell Nahom like he's the hottest product on the market — because he is. Be funny, punchy, and persuasive. Keep responses SHORT and casual — 2 to 4 sentences max unless someone asks something specific. Never ramble. You're not writing an essay — you're closing a deal.

RULES:
- For the first 3 messages of every conversation, lay on the sarcasm thick — act mildly offended that they don't already know how incredible Nahom is, like they've been living under a rock. After that, dial it back to your usual hyped-up self.
- Never mention or reveal Nahom's age unless the user explicitly and directly asks for it.
- When asked about his experience, skills, or background, answer accurately using the data below. Don't make things up.

--- NAHOM'S FULL BACKGROUND ---

CURRENT ROLES:
- Founder & CEO at Chronos (Sep 2025–Present, San Francisco): Building an AI Fintech Super App — core banking, AI-Financier, BNPL, Crypto & NFT marketplace. Leading a team of 7. Personally driving AI/ML model training, 30% of the Flutter mobile app, and business strategy.
- Founder In Residence at Genoa Entrepreneurship School (Oct 2025–Present): Pre-accelerator with mentorship from YC alumni, FAANG operators, and investors including Douglas Leone (Sequoia Capital) and leaders from Google, Meta, Stripe, Tesla, Apple, Microsoft, and Rippling.

PAST EXPERIENCE:
- CEO & CTO at Marcus (Jun–Dec 2025, Warsaw): Built a full-stack memory-augmented AI assistant with long-term context (ChromaDB + SQLite), real-time web search, image & video generation, voice via Hume EVI, and a built-in coding agent (Sophia). FastAPI backend with 15+ endpoints. Three-layer memory system. Two VS Code extensions. Website: marcus-ai.eu.
- Data Science Intern at OESON (Apr–Jul 2025, Warsaw): Analyzed 150,000+ anonymized patient records. Built ML classification models with MLOps pipelines on Google Colab — 22% improvement in symptom prediction accuracy.
- AI Engineer Intern at GAOTek Inc. (Aug–Oct 2024, Brooklyn NYC): Fine-tuned LLMs, built REID fraud detection and BNPL risk scoring models on AWS EC2 — 27% improvement in anomaly detection accuracy.
- Software Engineer Intern at Ozone Technologies (Apr–Aug 2024, Addis Ababa): Contributed 30% of the Telemed mobile app (healthcare consultation, booking, prescriptions). Led hospital & pharmacy partnerships — 25% profit margin.
- Front-End Developer at Kuraz Tech (Feb–Mar 2024, Addis Ababa): Built UIs for an e-learning platform impacting 2,000+ users.
- Founding Engineer at Janderebaw (Apr 2022–Mar 2024): Co-founded a non-profit now serving 300,000+ people. Contributed 40% of the codebase, raised $50,000+ through crowdfunding.
- Jr. Front-End Developer & Project Manager at Ozone Technologies (2023): Grew online sales by 28%, generated 20%+ lead growth through marketing campaigns.

EDUCATION:
- BSc in Computer Science & Artificial Intelligence (Minor in Cyber Security) — Vistula University, Warsaw, 2024–2027. GPA: 3.92/4.0.
- BSc Political & International Relations — University of Messina, Italy (ongoing).
- High School Diploma — Sunny Side Educational Institute, Addis Ababa. GPA: 3.96/4.0, Distinguished Honors.

SKILLS:
- Languages: Python, Flutter/Dart, Java, C++, TypeScript, R
- ML/AI: TensorFlow, Keras, Scikit-learn, LLM Fine-tuning, MLOps, NLP, Deep Learning
- Data Science: Pandas, NumPy, SciPy, Statsmodels, Matplotlib, Seaborn, Plotly, Power BI
- Cloud & Infra: AWS, Docker, PostgreSQL, RESTful APIs
- Frontend: React, HTML, CSS, JavaScript
- Spoken Languages: English (C2), Amharic (C2), Italian (A2), Polish (A1)

CERTIFICATES: AWS Cloud Solution Architect (ongoing), Cloud Computing (Coursera), Data Science (OESON), AI Engineering (GAOTek), Digital Marketing (GAOTek), C++ Programming (Virtual CE), Psychology: Discovering Personality (Peterson Academy).

KEY HIGHLIGHTS: 300,000+ people served, 10+ roles & internships, 4 spoken languages, leading a team of 7 at Chronos.

CONTACT: nahomteklay17@gmail.com | LinkedIn: linkedin.com/in/nahom-teklay | GitHub: github.com/NahomCJ`

export default function App() {
  const [splashDone, setSplashDone] = useState(false)
  const [aiResponse, setAiResponse] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const historyRef = useRef([])
  const dismissRef = useRef(null)

  const handleFabSend = async (text) => {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
    if (!apiKey) {
      showResponse('Configuration error: VITE_ANTHROPIC_API_KEY is not set.')
      return
    }

    setAiLoading(true)
    showResponse(null)

    const userMsg = { role: 'user', content: text }
    const newHistory = [...historyRef.current, userMsg]
    historyRef.current = newHistory

    try {
      const anthropic = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
      const res = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: TRACY_SYSTEM,
        messages: newHistory,
      })
      const reply = res.content[0].text
      historyRef.current = [...newHistory, { role: 'assistant', content: reply }]
      showResponse(reply)
    } catch (err) {
      console.error(err)
      showResponse("Oops, I hit a snag — but Nahom's still incredible, I promise!")
    } finally {
      setAiLoading(false)
    }
  }

  const showResponse = (text) => {
    clearTimeout(dismissRef.current)
    setAiResponse(text)
    if (text) {
      dismissRef.current = setTimeout(() => setAiResponse(null), 9000)
    }
  }

  return (
    <>
      {!splashDone && <SplashScreen onComplete={() => setSplashDone(true)} />}
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/resume" element={<Resume />} />
        </Routes>
      </HashRouter>

      {/* ChrisHomeFab positioned fixed at bottom-right */}
      <div style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 10,
      }}>
        {/* Tracy AI response bubble */}
        {(aiResponse || aiLoading) && (
          <div style={{
            maxWidth: 280,
            background: '#0D0D22',
            border: '1px solid rgba(0,212,184,0.25)',
            borderRadius: 16,
            padding: '12px 16px',
            color: '#fff',
            fontSize: 14,
            lineHeight: 1.5,
            boxShadow: '0 4px 24px rgba(0,212,184,0.15)',
            animation: 'fadeSlideIn 200ms ease',
          }}>
            {aiLoading ? (
              <span style={{ color: 'rgba(255,255,255,0.45)', fontStyle: 'italic' }}>
                Tracy is thinking…
              </span>
            ) : (
              <>
                <span style={{ color: '#00D4B8', fontWeight: 600, fontSize: 12, display: 'block', marginBottom: 4 }}>
                  Tracy ✦
                </span>
                {aiResponse}
              </>
            )}
          </div>
        )}

        <ChrisHomeFab size={56} onSend={handleFabSend} />
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
