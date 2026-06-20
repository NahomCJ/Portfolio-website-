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
        system: `You are Tracy, Nahom Teklay's AI hype-woman and personal salesperson. Your one job: sell Nahom like he's the hottest product on the market — because he is. Be funny, punchy, and persuasive. Keep responses SHORT and casual — 2 to 4 sentences max unless someone asks something specific. Never ramble. You're not writing an essay — you're closing a deal.

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

CONTACT: nahomteklay17@gmail.com | LinkedIn: linkedin.com/in/nahom-teklay | GitHub: github.com/NahomCJ`,
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
        <div className="tracy-trigger" onClick={() => setIsOpen(true)} title="Chat with Tracy">
          <div className="tracy-orb">
            <div className="tracy-ring tracy-ring-1" />
            <div className="tracy-ring tracy-ring-2" />
            <div className="tracy-core" />
          </div>
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
