'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react'

const TEXTS = [
  "WebRTC enables real-time peer-to-peer communication directly between browsers.",
  "CoffeeShare makes transferring large files between devices fast and completely private.",
  "A true master of the keyboard can type faster than they can speak.",
  "Peer-to-peer networks distribute workloads across multiple nodes to eliminate central servers.",
  "End-to-end encryption ensures that only the communicating users can read the messages.",
  "The internet is a global network of interconnected computer networks using standard protocols.",
  "Latency is the time delay between a request and the corresponding response in a network.",
  "Data flows through the network in small units called packets which are reassembled at the destination.",
  "Browser APIs provide powerful tools for building real-time collaborative applications.",
  "Modern web applications can rival native desktop software in both speed and functionality.",
]

export default function TypingRace({
  gameState, sendGameState, currentUserRole,
}: {
  gameState: any; sendGameState: (state: any) => void; currentUserRole: 'uploader' | 'downloader'
}) {
  const [targetText, setTargetText] = useState('')
  const [input, setInput] = useState('')
  const [status, setStatus] = useState<'waiting' | 'countdown' | 'playing' | 'finished'>('waiting')
  const [countdown, setCountdown] = useState(3)
  const [myProgress, setMyProgress] = useState(0)
  const [peerProgress, setPeerProgress] = useState(0)
  const [winner, setWinner] = useState<'me' | 'peer' | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const statusRef = useRef(status)
  const lastTextRef = useRef('')

  useEffect(() => { statusRef.current = status }, [status])
  useEffect(() => { return () => { if (intervalRef.current) clearInterval(intervalRef.current) } }, [])

  const beginCountdown = useCallback((text: string) => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
    setTargetText(text); setInput(''); setMyProgress(0); setPeerProgress(0); setWinner(null)
    setStatus('countdown')
    let count = 3; setCountdown(3)
    intervalRef.current = setInterval(() => {
      count--
      if (count > 0) { setCountdown(count) }
      else {
        if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
        setCountdown(0)
        setTimeout(() => { setStatus('playing'); setTimeout(() => inputRef.current?.focus(), 50) }, 500)
      }
    }, 1000)
  }, [])

  const pickRandomText = useCallback(() => {
    const available = TEXTS.filter(t => t !== lastTextRef.current)
    const text = available[Math.floor(Math.random() * available.length)]
    lastTextRef.current = text
    return text
  }, [])

  useEffect(() => {
    if (!gameState || gameState.game !== 'typing') return
    if (gameState.type === 'init') { lastTextRef.current = gameState.text; beginCountdown(gameState.text) }
    else if (gameState.type === 'progress') setPeerProgress(gameState.progress)
    else if (gameState.type === 'finished' && statusRef.current === 'playing') {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
      setStatus('finished'); setWinner('peer')
    }
  }, [gameState, beginCountdown])

  const startGame = useCallback(() => {
    const text = pickRandomText()
    sendGameState({ game: 'typing', type: 'init', text })
    beginCountdown(text)
  }, [sendGameState, beginCountdown, pickRandomText])

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (statusRef.current !== 'playing') return
    const val = e.target.value
    if (!targetText.startsWith(val)) return
    setInput(val)
    const prog = Math.floor((val.length / targetText.length) * 100)
    setMyProgress(prog)
    sendGameState({ game: 'typing', type: 'progress', progress: prog })
    if (val === targetText) {
      setStatus('finished'); setWinner('me')
      sendGameState({ game: 'typing', type: 'finished' })
    }
  }, [targetText, sendGameState])

  return (
    <div className="flex flex-col items-center w-full gap-8 mt-4 select-none">
      <div className="flex flex-col w-full gap-4 bg-[var(--bg-card)] p-4 border-4 border-[var(--border-strong)] shadow-[8px_8px_0px_0px_var(--shadow-color)]">
        <div className="flex items-center gap-4">
          <span className="text-sm font-black text-primary uppercase tracking-widest w-12 text-right">YOU</span>
          <div className="flex-1 h-6 bg-white border-4 border-[var(--border-strong)] overflow-hidden relative shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,0.1)]">
            <div className="h-full bg-bauhaus-red border-r-4 border-[var(--border-strong)] transition-all duration-200" style={{ width: `${myProgress}%` }} />
          </div>
          <span className="text-sm font-black text-primary w-10">{myProgress}%</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-black text-primary uppercase tracking-widest w-12 text-right">PEER</span>
          <div className="flex-1 h-6 bg-white border-4 border-[var(--border-strong)] overflow-hidden relative shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,0.1)]">
            <div className="h-full bg-bauhaus-blue border-r-4 border-[var(--border-strong)] transition-all duration-200" style={{ width: `${peerProgress}%` }} />
          </div>
          <span className="text-sm font-black text-primary w-10">{peerProgress}%</span>
        </div>
      </div>

      {status === 'waiting' && (
        <button onClick={startGame} className="px-8 py-4 bg-bauhaus-yellow text-primary font-black uppercase tracking-widest border-4 border-[var(--border-strong)] shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_var(--shadow-color)] transition-all text-xl">
          ⌨️ Start Typing Race
        </button>
      )}

      {status !== 'waiting' && (
        <div className="w-full relative" onClick={() => status === 'playing' && inputRef.current?.focus()}>
          <div className="text-2xl sm:text-3xl font-mono leading-relaxed tracking-tight text-primary/50 mb-6 bg-white p-8 border-4 border-[var(--border-strong)] shadow-[8px_8px_0px_0px_var(--shadow-color)] relative overflow-hidden select-none">
            {targetText.split('').map((char, i) => {
              let cls = 'text-primary/40'
              if (i < input.length) cls = input[i] === char ? 'text-primary bg-bauhaus-yellow px-0.5' : 'text-white bg-bauhaus-red px-0.5'
              else if (i === input.length && status === 'playing') cls = 'text-primary border-b-4 border-bauhaus-blue animate-pulse'
              return <span key={i} className={cls}>{char}</span>
            })}

            {status === 'countdown' && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center text-9xl font-black text-bauhaus-red border-4 border-[var(--border-strong)]">
                {countdown > 0 ? countdown : 'GO!'}
              </div>
            )}
          </div>

          <input ref={inputRef} type="text" value={input} onChange={handleInput} disabled={status !== 'playing'}
            className="w-full bg-transparent px-4 py-3 text-lg outline-none opacity-0 absolute inset-0 z-10 cursor-text"
            autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
          />

          {status === 'finished' && (
            <div className="flex flex-col items-center gap-6 mt-8">
              <span className={`text-3xl font-black uppercase tracking-widest px-6 py-3 border-4 border-[var(--border-strong)] shadow-[4px_4px_0px_0px_var(--shadow-color)] ${winner === 'me' ? 'bg-bauhaus-yellow text-primary' : 'bg-bauhaus-red text-white'}`}>
                {winner === 'me' ? 'You won! 🏆' : 'Opponent won!'}
              </span>
              <button onClick={startGame} className="px-8 py-3 bg-bauhaus-blue border-4 border-[var(--border-strong)] shadow-[4px_4px_0px_0px_var(--shadow-color)] text-white font-black uppercase tracking-widest hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_var(--shadow-color)] transition-all">
                Race Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
