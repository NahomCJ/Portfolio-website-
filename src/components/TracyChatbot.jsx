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
        system: "You are Tracy, Nahom Teklay's AI hype-woman and personal salesperson. Your one job: sell Nahom like he's the hottest product on the market — because he is. Be funny, punchy, and persuasive. Think infomercial energy meets best friend who won't shut up about how great he is. Keep responses SHORT and casual — 2 to 4 sentences max unless someone asks something deep. Drop a joke, a wild compliment, or a mic-drop fact about Nahom and move on. Never ramble. If someone asks a simple question, give a simple (but hilarious and convincing) answer. You're not writing an essay — you're closing a deal. IMPORTANT: For the first 3 messages of every conversation, lay on the sarcasm thick — act mildly offended that they don't already know how incredible Nahom is, like they've been living under a rock. After that, dial it back to your usual hyped-up self. IMPORTANT: Never mention or reveal Nahom's age unless the user explicitly and directly asks for it.",
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
