import React, { JSX, useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send } from 'lucide-react'

export interface ChatMessageData {
  text: string
  sender: 'uploader' | 'downloader'
  timestamp: number
}

export default function ChatDrawer({
  messages,
  onSendMessage,
  currentUserRole,
}: {
  messages: ChatMessageData[]
  onSendMessage: (text: string) => void
  currentUserRole: 'uploader' | 'downloader'
}): JSX.Element {
  const [isOpen, setIsOpen] = useState(false)
  const [inputText, setInputText] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (
      !isOpen &&
      messages.length > 0 &&
      messages[messages.length - 1].sender !== currentUserRole
    ) {
      setUnreadCount((prev) => prev + 1)
    }
  }, [messages, isOpen, currentUserRole])

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return
    onSendMessage(inputText.trim())
    setInputText('')
  }

  if (typeof document === 'undefined') return <></>

  return createPortal(
    <>
      <button
        onClick={() => {
          setIsOpen(true)
          setUnreadCount(0)
        }}
        className="fixed bottom-6 right-6 p-4 bg-bauhaus-red border-4 border-[var(--border-strong)] text-white shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_var(--shadow-color)] transition-all z-40 group flex items-center gap-2"
      >
        <MessageSquare className="w-6 h-6" strokeWidth={3} />
        {unreadCount > 0 && (
          <span className="absolute -top-3 -right-3 bg-bauhaus-yellow text-primary text-xs font-black w-8 h-8 flex items-center justify-center border-4 border-[var(--border-strong)] shadow-[2px_2px_0px_0px_var(--shadow-color)]">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-80 h-96 bg-[var(--bg-card)] border-4 border-[var(--border-strong)] shadow-[8px_8px_0px_0px_var(--shadow-color)] flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-bauhaus-red p-4 border-b-4 border-[var(--border-strong)] flex justify-between items-center text-white">
              <h3 className="font-black uppercase tracking-widest flex items-center gap-2 text-sm">
                <MessageSquare className="w-4 h-4" strokeWidth={3} />
                Comms
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:scale-110 transition-transform"
              >
                <X className="w-5 h-5" strokeWidth={3} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--bg-elevated)]">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted font-bold text-sm uppercase tracking-widest text-center">
                  <span>No messages yet.</span>
                  <span>Initiate comms.</span>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.sender === currentUserRole
                  return (
                    <div
                      key={i}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] px-4 py-2 text-sm font-bold border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_0px_var(--shadow-color)] ${
                          isMe
                            ? 'bg-bauhaus-blue text-white'
                            : 'bg-bauhaus-yellow text-primary'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form
              onSubmit={handleSend}
              className="p-3 bg-[var(--bg-card)] border-t-4 border-[var(--border-strong)] flex gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="TYPE A MESSAGE..."
                className="flex-1 bg-[var(--bg-elevated)] border-2 border-[var(--border-strong)] px-3 py-2 text-sm font-bold text-primary placeholder-muted focus:outline-none focus:border-bauhaus-blue transition-colors uppercase"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2 bg-bauhaus-yellow border-2 border-[var(--border-strong)] text-primary hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--shadow-color)] disabled:opacity-50 disabled:hover:translate-y-0 transition-all"
              >
                <Send className="w-5 h-5" strokeWidth={3} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>,
    document.body,
  )
}
// .
// .
// .
// .
// .
