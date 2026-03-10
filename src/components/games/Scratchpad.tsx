'use client'
import React, { useState, useEffect, useRef } from 'react'

interface ScratchpadProps {
  gameState: any
  sendGameState: (state: any) => void
  currentUserRole: 'uploader' | 'downloader'
}

export default function Scratchpad({ gameState, sendGameState, currentUserRole }: ScratchpadProps) {
  const [text, setText] = useState('')
  const [cursor, setCursor] = useState({ start: 0, end: 0 })
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!gameState || gameState.game !== 'scratchpad') return
    if (gameState.type === 'sync-text') {
      setText(gameState.text)
    }
  }, [gameState])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    setText(newText)
    sendGameState({ game: 'scratchpad', type: 'sync-text', text: newText })
  }

  return (
    <div className="flex flex-col w-full h-[60vh] min-h-[400px] mt-4">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-black text-primary uppercase tracking-widest bg-bauhaus-yellow px-4 py-2 border-4 border-[var(--border-strong)] shadow-[4px_4px_0px_0px_var(--shadow-color)]">
          Live Collaboration Editor
        </span>
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 border-4 border-[var(--border-strong)] shadow-[4px_4px_0px_0px_var(--shadow-color)]">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-bauhaus-blue opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 border-2 border-[var(--border-strong)] bg-bauhaus-blue"></span>
          </span>
          <span className="text-xs font-black uppercase tracking-widest text-primary">Synced</span>
        </div>
      </div>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        placeholder="Type or paste code, links, or notes here. Your peer will see it instantly..."
        className="flex-1 w-full bg-white border-4 border-[var(--border-strong)] p-6 text-primary font-mono text-sm sm:text-base leading-relaxed resize-none focus:outline-none focus:ring-0 shadow-[8px_8px_0px_0px_var(--shadow-color)] placeholder:text-primary/40 transition-all selection:bg-bauhaus-yellow"
        spellCheck={false}
      />
    </div>
  )
}
