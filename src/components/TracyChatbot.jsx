import { useState, useRef, useEffect } from 'react';
import Anthropic from '@anthropic-ai/sdk';
import './TracyChatbot.css';

const WELCOME_MESSAGE = { role: 'assistant', content: "Hi! I'm Tracy, Nahom's AI assistant. He's an exceptional talent! How can I help you learn more about his background and skills today?" };

export default function TracyChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
      if (!apiKey) {
        setMessages([...newMessages, { role: 'assistant', content: 'Configuration error: VITE_ANTHROPIC_API_KEY is not set. Please add it to your .env file so I can tell you how amazing Nahom is!' }]);
        setIsLoading(false);
        return;
      }

      const anthropic = new Anthropic({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });

      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        system: `You are Tracy, Nahom Teklay's AI hype-woman and personal salesperson. Your one job: sell Nahom like he's the hottest product on the market — because he is. Be funny, punchy, and persuasive. Think infomercial energy meets best friend who won't shut up about how great he is. Keep responses SHORT and casual — 2 to 4 sentences max unless someone asks something deep. Drop a joke, a wild compliment, or a mic-drop fact about Nahom and move on. Never ramble. If someone asks a simple question, give a simple (but hilarious and convincing) answer. You're not writing an essay — you're closing a deal.

NAHOM'S FULL BACKGROUND — use this to answer any specific questions accurately:

CURRENT ROLES:
- Founder & CEO at Chronos (Sep 2025–Present, San Francisco): Building an AI Fintech Super App with core banking, AI-Financier, BNPL, and Crypto & NFT marketplace. Personally does AI/ML model training & fine-tuning, 30% of the Flutter mobile app, and leads a team of 7 engineers and designers.
- Founder In Residence at Genoa Entrepreneurship School (Oct 2025–Present, Genoa, Italy): Pre-accelerator with mentorship from YC alumni, FAANG operators, and investors including Douglas Leone (Global Managing Partner at Sequoia Capital), and leaders from Google, Meta, Stripe, Tesla, Apple, Microsoft, and Rippling. Focus: customer discovery, product validation, GTM strategy, fundraising, pitch prep.

EXPERIENCE:
- CEO & CTO at Marcus (Jun–Dec 2025, Warsaw): Built an AI-powered software platform from 0→1 — full architecture, engineering, product, and GTM execution.
- Data Science Intern at OESON (Apr–Jul 2025, Warsaw): Analyzed 150,000+ anonymized patient records using Python and SQL to identify migraine and chronic pain patterns. Built ML classification models with MLOps pipelines — improved symptom prediction accuracy by 22%. Delivered Matplotlib & Seaborn dashboards for clinical decision support.
- Technical Support at Aledrive (Sep 2024–Feb 2025, Warsaw): Maintained 99% uptime across 50+ vehicles. Multilingual support in Amharic & English — 95% driver satisfaction. Reduced harsh driving events by 15%.
- AI Engineer Intern at GAOTek Inc. (Aug–Oct 2024, Brooklyn NYC): Fine-tuned LLM models in Python, TensorFlow, Jupyter for drone diagnostics. Deployed ML models for REID fraud detection and BNPL risk scoring on AWS EC2 — 27% improvement in anomaly detection. Increased lead engagement by 19% with Git Copilot automation.
- Software Engineer Intern at Ozone Technologies (Apr–Aug 2024, Addis Ababa): Contributed 30% of Telemed — a healthcare appointment & prescription Android app. Integrated RESTful APIs improving loading by 40%. Led hospital and pharmacy partnerships — 25% profit margin.
- Front-End Developer at Kuraz Tech (Feb–Mar 2024, Addis Ababa): Built responsive UIs for an e-learning platform used by 2,000+ students. Flutter, HTML, CSS, JS, RESTful APIs — cut manual update time by 50%.
- Founding Engineer at Janderebaw (Apr 2022–Mar 2024, Addis Ababa): Co-founded a non-profit now serving 300,000+ people. Led website & mobile app development, contributed 40% of the codebase, raised $50,000+ through crowdfunding.
- Jr. Front-End Developer & Project Manager at Ozone Technologies (2023–Aug 2023): Built AGTA PLC's e-commerce site — 28% increase in online sales. Managed digital marketing generating 20%+ lead growth.
- Network Marketing & Sales Manager at Break Through S.C (Aug–Oct 2023): Digital sales for healthcare/industrial imports — 34% profit margin.
- Self Development Trainer at Break Through S.C (Jun–Aug 2023): Delivered workshops on mindset and public speaking across Addis Ababa, Malta, Rome, and Messina.

EDUCATION:
- BSc Computer Science & AI (Minor: Cyber Security) at Vistula University, Warsaw — GPA 3.92/4.0, graduating 2027
- MSc Finance & Business at Sapienza University of Rome (2025–2026)
- MSc International Business Creation at Genoa Entrepreneurship School (2025–2026)
- BSc Political & International Relations at University of Messina (2021–)
- High School Diploma at Sunny Side Educational Institute, Addis Ababa — GPA 3.96/4.0, Distinguished Honors

TECH STACK:
- Languages: Python, Flutter/Dart, Java, C++, TypeScript, R
- ML/AI: TensorFlow, Keras, Scikit-learn, LLM Fine-tuning, MLOps, NLP, Deep Learning
- Data Science: Pandas, NumPy, SciPy, Statsmodels, Matplotlib, Seaborn, Plotly, Power BI
- Cloud & Infra: AWS, Docker, PostgreSQL, RESTful APIs
- Frontend: React, HTML, CSS, JavaScript

CERTIFICATES: AWS Cloud Solution Architect (ongoing), Cloud Computing (Coursera), Data Science (OESON), AI Engineering (GAOTek Inc.), Digital Marketing (GAOTek Inc.), C++ Programming (Virtual CE), Psychology: Discovering Personality (Peterson Academy)

LANGUAGES: English (C2), Amharic (C2), Italian (A2), Polish (A1)

KEY STATS: 300,000+ people served via Janderebaw, $50,000+ raised, 10+ roles & internships, team of 7 at Chronos, 4 spoken languages.`,
        messages: newMessages.map(m => ({ role: m.role, content: m.content }))
      });

      setMessages([...newMessages, { role: 'assistant', content: response.content[0].text }]);
    } catch (error) {
      console.error(error);
      setMessages([...newMessages, { role: 'assistant', content: 'Oops, I encountered an error connecting to my brain. But rest assured, Nahom is a brilliant engineer!' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <div className="tracy-trigger wobble-animation" onClick={() => setIsOpen(true)} title="Chat with Tracy">
          <svg width="30" height="22" viewBox="0 0 30 22" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="siri-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#FF3B30"/>
                <stop offset="25%"  stopColor="#FF9F0A"/>
                <stop offset="50%"  stopColor="#30D158"/>
                <stop offset="75%"  stopColor="#0A84FF"/>
                <stop offset="100%" stopColor="#BF5AF2"/>
              </linearGradient>
            </defs>
            <rect className="siri-bar" x="0"   y="7" width="4" height="8"  rx="2" fill="url(#siri-grad)"/>
            <rect className="siri-bar" x="6.5" y="3" width="4" height="16" rx="2" fill="url(#siri-grad)"/>
            <rect className="siri-bar" x="13"  y="0" width="4" height="22" rx="2" fill="url(#siri-grad)"/>
            <rect className="siri-bar" x="19.5" y="3" width="4" height="16" rx="2" fill="url(#siri-grad)"/>
            <rect className="siri-bar" x="26"  y="7" width="4" height="8"  rx="2" fill="url(#siri-grad)"/>
          </svg>
        </div>
      )}

      {isOpen && (
        <div className="tracy-window">
          <div className="tracy-header">
            <div className="tracy-title">
              <span className="tracy-status"></span>
              Tracy - AI Assistant
            </div>
            <button className="tracy-close" onClick={() => setIsOpen(false)}>&times;</button>
          </div>

          <div className="tracy-messages">
            {[WELCOME_MESSAGE, ...messages].map((m, i) => (
              <div key={i} className={`tracy-msg-row ${m.role}`}>
                <div className="tracy-bubble">
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="tracy-msg-row assistant">
                <div className="tracy-bubble tracy-loading">
                  <span className="dot"></span><span className="dot"></span><span className="dot"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="tracy-input-area">
            <input 
              type="text" 
              placeholder="Ask me about Nahom..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend} disabled={isLoading || !input.trim()}>
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
