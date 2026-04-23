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
        className="fixed bottom-6 right-6 p-4 bg-amber-500 text-stone-950 rounded-full shadow-lg hover:bg-amber-400 transition-colors z-40 group flex items-center gap-2"
      >
        <MessageSquare className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-stone-950">
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
            className="fixed bottom-24 right-6 w-80 h-96 surface rounded-2xl flex flex-col z-50 overflow-hidden shadow-2xl border border-stone-800"
          >
            {/* Header */}
            <div className="bg-stone-900/80 p-4 border-b border-stone-800 flex justify-between items-center">
              <h3 className="font-bold text-stone-100 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-500" />
                Coffeehouse Chat
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-stone-400 hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-950/50">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-stone-500 text-sm">
                  <span>No messages yet.</span>
                  <span>Say hello! 👋</span>
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
                        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                          isMe
                            ? 'bg-amber-500 text-stone-950 rounded-tr-sm'
                            : 'bg-stone-800 text-stone-100 rounded-tl-sm'
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
              className="p-3 bg-stone-900/80 border-t border-stone-800 flex gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2 bg-amber-500 text-stone-950 rounded-xl hover:bg-amber-400 disabled:opacity-50 disabled:hover:bg-amber-500 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>,
    document.body,
  )
}
