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
    <div className="flex flex-col w-full h-[60vh] min-h-[400px]">
      <div className="flex justify-between items-center mb-2 px-1">
        <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
          Live Collaboration Editor
        </span>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-xs text-stone-500">Synced</span>
        </div>
      </div>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        placeholder="Type or paste code, links, or notes here. Your peer will see it instantly..."
        className="flex-1 w-full bg-stone-900/60 border border-stone-800 rounded-xl p-4 text-stone-200 font-mono text-sm leading-relaxed resize-none focus:outline-none focus:border-[#f37021]/50 focus:ring-1 focus:ring-[#f37021]/50 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] placeholder:text-stone-700 transition-all"
        spellCheck={false}
      />
    </div>
  )
}
