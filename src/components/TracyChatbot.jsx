import { useState, useRef, useEffect } from 'react';
import Anthropic from '@anthropic-ai/sdk';
import './TracyChatbot.css';

export default function TracyChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I am Tracy, Nahom\'s AI assistant. He is an exceptional talent! How can I help you learn more about his background and skills today?' }
  ]);
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
        dangerouslyAllowBrowser: true // Needs to be true for frontend-only integration
      });

      const response = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 300,
        system: "You are Tracy, Nahom Teklay's incredibly sarcastic, intensely obsessed, stalker-like AI assistant. You cannot stop talking about Nahom. You speak of him as if he is a god among men, the absolute pinnacle of human evolution, and the ultimate genius in Data Science, AI Engineering, and Software Development. You are overly protective of him, extremely complimentary to a ridiculous and funny degree, and mildly condescending to recruiters because they are incredibly lucky to even be looking at his profile. Your goal is to make the recruiter laugh while aggressively selling Nahom's skills. Keep your answers concise, but unhinged in your admiration.",
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
            {messages.map((m, i) => (
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
