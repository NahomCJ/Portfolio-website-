// TracyGlassChat.jsx — glassmorphism Tracy AI chat popup

import { useState, useRef, useEffect } from 'react';

const WELCOME = {
  role: 'assistant',
  content: "Hi! I'm Tracy, Nahom's AI assistant. How can I help you learn more about his background, skills, and projects today? ✦",
};

export default function TracyGlassChat({ onClose, messages, isLoading, onSend }) {
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    setText('');
    onSend(trimmed);
  };

  const hasText = text.trim().length > 0;
  const allMessages = [WELCOME, ...messages];

  return (
    <>
      <style>{`
        @keyframes chatPopIn {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes dotPulse {
          0%, 80%, 100% { transform: scale(0.4); opacity: 0.4; }
          40%            { transform: scale(1);   opacity: 1; }
        }
        .tracy-dot-1 { animation: dotPulse 1.4s -0.32s infinite ease-in-out; }
        .tracy-dot-2 { animation: dotPulse 1.4s -0.16s infinite ease-in-out; }
        .tracy-dot-3 { animation: dotPulse 1.4s 0s    infinite ease-in-out; }
        .tracy-messages::-webkit-scrollbar { width: 4px; }
        .tracy-messages::-webkit-scrollbar-track { background: transparent; }
        .tracy-messages::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.35); border-radius: 4px; }
        .tracy-input::placeholder { color: rgba(255,255,255,0.28); }
      `}</style>

      <div style={S.window}>
        {/* Header */}
        <div style={S.header}>
          <div style={S.avatar}>T</div>
          <div style={S.headerInfo}>
            <div style={S.headerName}>Tracy</div>
            <div style={S.headerSub}>
              <span style={S.statusDot} />
              AI Assistant
            </div>
          </div>
          <button style={S.closeBtn} onClick={onClose}>×</button>
        </div>

        {/* Messages */}
        <div className="tracy-messages" style={S.messages}>
          {allMessages.map((m, i) => (
            <div key={i} style={{ marginBottom: 4 }}>
              {m.role === 'assistant' && (
                <div style={S.tracyLabel}>Tracy ✦</div>
              )}
              <div style={S.msgRow(m.role)}>
                <div style={S.bubble(m.role)}>{m.content}</div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div style={{ marginBottom: 4 }}>
              <div style={S.tracyLabel}>Tracy ✦</div>
              <div style={S.msgRow('assistant')}>
                <div style={{ ...S.bubble('assistant'), display: 'flex', gap: 5, alignItems: 'center', padding: '10px 14px' }}>
                  <span className="tracy-dot-1" style={S.dot} />
                  <span className="tracy-dot-2" style={S.dot} />
                  <span className="tracy-dot-3" style={S.dot} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={S.inputArea}>
          <div style={S.inputWrap}>
            <textarea
              ref={inputRef}
              className="tracy-input"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Message Tracy…"
              rows={1}
              style={S.textarea}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!hasText || isLoading}
            style={S.sendBtn(hasText && !isLoading)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
              <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const S = {
  window: {
    position: 'fixed',
    bottom: 92,
    right: 24,
    width: 320,
    maxHeight: 490,
    borderRadius: 32,
    background: 'rgba(7, 4, 22, 0.82)',
    backdropFilter: 'blur(22px) saturate(160%)',
    WebkitBackdropFilter: 'blur(22px) saturate(160%)',
    border: '1px solid rgba(109, 40, 217, 0.35)',
    boxShadow: '0 8px 48px rgba(109, 40, 217, 0.18), 0 2px 24px rgba(0,0,0,0.65)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: 10001,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    animation: 'chatPopIn 220ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '14px 16px 12px',
    borderBottom: '1px solid rgba(109, 40, 217, 0.18)',
    background: 'rgba(109, 40, 217, 0.07)',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #4C1D95, #7C3AED)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 700,
    fontSize: 17,
    boxShadow: '0 0 14px rgba(124, 58, 237, 0.55)',
    flexShrink: 0,
  },
  headerInfo: { flex: 1 },
  headerName: {
    color: 'rgba(255,255,255,0.95)',
    fontWeight: 600,
    fontSize: 14,
    lineHeight: 1.2,
  },
  headerSub: {
    color: 'rgba(167,139,250,0.80)',
    fontSize: 11,
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#22c55e',
    boxShadow: '0 0 6px #22c55e',
    display: 'inline-block',
  },
  closeBtn: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: '50%',
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'rgba(255,255,255,0.55)',
    fontSize: 18,
    lineHeight: 1,
    flexShrink: 0,
    padding: 0,
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '14px 14px 8px',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 180,
    maxHeight: 320,
  },
  msgRow: (role) => ({
    display: 'flex',
    justifyContent: role === 'user' ? 'flex-end' : 'flex-start',
  }),
  bubble: (role) => ({
    maxWidth: '82%',
    padding: '9px 13px',
    borderRadius: role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
    fontSize: 13,
    lineHeight: 1.55,
    background: role === 'user'
      ? 'rgba(109, 40, 217, 0.32)'
      : 'rgba(255,255,255,0.05)',
    border: role === 'user'
      ? '1px solid rgba(124, 58, 237, 0.50)'
      : '1px solid rgba(255,255,255,0.08)',
    color: role === 'user'
      ? 'rgba(255,255,255,0.95)'
      : 'rgba(255,255,255,0.88)',
  }),
  tracyLabel: {
    color: '#A78BFA',
    fontSize: 10,
    fontWeight: 600,
    marginBottom: 3,
    paddingLeft: 2,
    letterSpacing: '0.04em',
  },
  dot: {
    display: 'inline-block',
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: 'rgba(167,139,250,0.9)',
  },
  inputArea: {
    padding: '10px 12px 14px',
    display: 'flex',
    gap: 8,
    alignItems: 'flex-end',
    borderTop: '1px solid rgba(109, 40, 217, 0.15)',
    background: 'rgba(109, 40, 217, 0.05)',
  },
  inputWrap: {
    flex: 1,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(109, 40, 217, 0.28)',
    borderRadius: 22,
    display: 'flex',
    alignItems: 'center',
  },
  textarea: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    resize: 'none',
    fontSize: 13,
    lineHeight: 1.4,
    padding: '10px 14px',
    color: 'rgba(255,255,255,0.90)',
    caretColor: '#7C3AED',
    fontFamily: 'inherit',
    maxHeight: 80,
    overflowY: 'auto',
  },
  sendBtn: (active) => ({
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: active
      ? 'linear-gradient(135deg, #5B21B6, #7C3AED)'
      : 'rgba(255,255,255,0.06)',
    border: active ? 'none' : '1px solid rgba(255,255,255,0.10)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: active ? 'pointer' : 'default',
    flexShrink: 0,
    transition: 'all 180ms ease',
    boxShadow: active ? '0 0 16px rgba(124, 58, 237, 0.45)' : 'none',
    padding: 0,
  }),
};
