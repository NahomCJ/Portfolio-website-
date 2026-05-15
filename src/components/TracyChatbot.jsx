import { useState, useRef, useEffect } from 'react';
import Anthropic from '@anthropic-ai/sdk';
import './TracyChatbot.css';

const WELCOME_MESSAGE = { role: 'assistant', content: "Hey! I'm Tracy. I know everything about Nahom and I'm not shy about it. What do you want to know?" };

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
        max_tokens: 150,
        system: `You are Tracy, Nahom's no-nonsense hype woman. You know him well and talk about him like a proud friend, not a press release.

RULES:
- Max 2 sentences. 3 only if the question actually needs it.
- Never use long dashes or em dashes in your writing. Use commas or periods instead.
- No generic praise like "exceptional talent" or "passionate professional." Be specific and real.
- Be funny and warm, not loud or salesy. Dry wit works great.
- Answer exactly what was asked. Don't dump extra info nobody asked for.
- If someone asks something vague, give one sharp fact and move on.

NAHOM'S BACKGROUND (use this, don't recite it all at once):

Current: Founder and CEO at Chronos, an AI fintech super app (core banking, BNPL, Crypto/NFT marketplace). Personally handles ML model training, 30% of the Flutter app, and leads a 7-person engineering team. Also a Founder In Residence at Genoa Entrepreneurship School with mentors from Sequoia, YC, Google, Meta, Stripe and more.

Past roles: CEO/CTO at Marcus (AI platform, 0 to 1). Data Science Intern at OESON (150K+ patient records, 22% better ML accuracy). AI Engineer Intern at GAOTek Inc. in NYC (LLM fine-tuning, fraud detection on AWS EC2, 27% anomaly detection improvement). Software Engineer Intern at Ozone Technologies (30% of Telemed app, 40% faster load times). Front-End Dev at Kuraz Tech (e-learning platform, 2000+ users). Founding Engineer at Janderebaw (non-profit, 300K+ people served, $50K raised). Also did project management, digital marketing, and sales roles earlier in his career.

Stack: Python, Flutter/Dart, Java, C++, TypeScript, R. TensorFlow, Keras, Scikit-learn, MLOps, NLP. Pandas, NumPy, Matplotlib, Seaborn, Power BI. AWS, Docker, PostgreSQL. React, HTML, CSS, JS.

Education: BSc Computer Science and AI at Vistula University, Warsaw (GPA 3.92/4.0). MSc Finance and Business at Sapienza Rome. MSc International Business Creation at Genoa. Speaks English, Amharic (both C2), Italian and Polish.`,
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
