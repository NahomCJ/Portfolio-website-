import { useState, useRef } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Projects from './pages/Projects'
import Resume from './pages/Resume'
import SplashScreen from './components/SplashScreen'
import ChrisHomeFab from './components/ChrisHomeFab'
import TracyGlassChat from './components/TracyGlassChat'
import { connectAudioReactivity } from './lib/audioReactivity'

export default function App() {
  const [splashDone, setSplashDone] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesRef = useRef([])
  const audioRef = useRef(null)

  const openChat = () => {
    setChatOpen(true)
    if (audioRef.current) {
      audioRef.current.volume = 0.14
      connectAudioReactivity(audioRef.current)
      audioRef.current.play().catch(() => {})
    }
  }

  const closeChat = () => {
    setChatOpen(false)
    if (audioRef.current) {
      // Pause in place (don't reset currentTime) so reopening the chat
      // resumes the track from where it left off instead of restarting.
      audioRef.current.pause()
    }
  }

  const toggleChat = () => {
    if (chatOpen) {
      closeChat()
    } else {
      openChat()
    }
  }

  const handleSend = async (text) => {
    const userMsg = { role: 'user', content: text }
    const newMessages = [...messagesRef.current, userMsg]
    messagesRef.current = newMessages
    setMessages(newMessages)
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      const data = await res.json()
      const reply = { role: 'assistant', content: data.content }
      messagesRef.current = [...newMessages, reply]
      setMessages(messagesRef.current)
    } catch (err) {
      console.error(err)
      const fallback = { role: 'assistant', content: "Oops, hit a snag — but Nahom's still incredible, I promise!" }
      messagesRef.current = [...newMessages, fallback]
      setMessages(messagesRef.current)
    } finally {
      setIsLoading(false)
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

      <audio ref={audioRef} src="/the-weeknd-timeless-instrumental.mp3" loop />

      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 10000 }}>
        <ChrisHomeFab size={56} onOpen={toggleChat} />
      </div>

      {chatOpen && (
        <TracyGlassChat
          onClose={closeChat}
          messages={messages}
          isLoading={isLoading}
          onSend={handleSend}
        />
      )}
    </>
  )
}
