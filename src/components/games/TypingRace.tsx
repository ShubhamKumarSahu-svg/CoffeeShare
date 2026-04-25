'use client'
import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Keyboard, RotateCcw } from 'lucide-react'

const TEXTS = [
  "WebRTC enables real-time peer-to-peer communication directly between browsers.",
  "CoffeeShare makes transferring large files between devices fast and completely private.",
  "A true master of the keyboard can type faster than they can speak.",
  "Peer-to-peer networks distribute workloads across multiple nodes to eliminate central servers.",
]

export default function TypingRace({
  gameState,
  sendGameState,
  currentUserRole,
}: {
  gameState: any
  sendGameState: (state: any) => void
  currentUserRole: 'uploader' | 'downloader'
}) {
  const [targetText, setTargetText] = useState('')
  const [input, setInput] = useState('')
  const [status, setStatus] = useState<'waiting' | 'countdown' | 'playing' | 'finished'>('waiting')
  const [countdown, setCountdown] = useState(3)
  const [myProgress, setMyProgress] = useState(0)
  const [peerProgress, setPeerProgress] = useState(0)
  const [winner, setWinner] = useState<'me' | 'peer' | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!gameState || gameState.game !== 'typing') return

    if (gameState.type === 'init') {
      setTargetText(gameState.text)
      setInput('')
      setMyProgress(0)
      setPeerProgress(0)
      setWinner(null)
      setStatus('countdown')
      setCountdown(3)
    } else if (gameState.type === 'progress') {
      setPeerProgress(gameState.progress)
    } else if (gameState.type === 'finished') {
      if (status === 'playing') {
        setStatus('finished')
        setWinner('peer')
      }
    }
  }, [gameState, status])

  useEffect(() => {
    if (status === 'countdown') {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
        return () => clearTimeout(timer)
      } else {
        setStatus('playing')
        setTimeout(() => inputRef.current?.focus(), 100)
      }
    }
  }, [status, countdown])

  const startGame = () => {
    const randomText = TEXTS[Math.floor(Math.random() * TEXTS.length)]
    sendGameState({ game: 'typing', type: 'init', text: randomText })
    setTargetText(randomText)
    setInput('')
    setMyProgress(0)
    setPeerProgress(0)
    setWinner(null)
    setStatus('countdown')
    setCountdown(3)
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (status !== 'playing') return
    const val = e.target.value
    
    // Only allow typing if it matches the start of target
    if (targetText.startsWith(val)) {
      setInput(val)
      const prog = Math.floor((val.length / targetText.length) * 100)
      setMyProgress(prog)
      sendGameState({ game: 'typing', type: 'progress', progress: prog })

      if (val === targetText) {
        setStatus('finished')
        setWinner('me')
        sendGameState({ game: 'typing', type: 'finished' })
      }
    }
  }

  return (
    <div className="flex flex-col items-center w-full gap-6">
      <div className="flex flex-col w-full gap-3 bg-stone-900/60 p-4 rounded-2xl border border-stone-800">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-stone-500 uppercase w-12">You</span>
          <div className="flex-1 h-3 bg-stone-800 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-[#f37021]"
              animate={{ width: `${myProgress}%` }}
              transition={{ type: 'spring', bounce: 0, duration: 0.2 }}
            />
          </div>
          <span className="text-xs font-mono text-stone-400 w-8">{myProgress}%</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-stone-500 uppercase w-12">Peer</span>
          <div className="flex-1 h-3 bg-stone-800 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-[#3b82f6]"
              animate={{ width: `${peerProgress}%` }}
              transition={{ type: 'spring', bounce: 0, duration: 0.2 }}
            />
          </div>
          <span className="text-xs font-mono text-stone-400 w-8">{peerProgress}%</span>
        </div>
      </div>

      {status === 'waiting' && (
        <button onClick={startGame} className="px-8 py-3 bg-[#f37021] hover:bg-[#e0661e] text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-[#f37021]/20">
          <Keyboard className="w-5 h-5" /> Start Typing Race
        </button>
      )}

      {(status === 'countdown' || status === 'playing' || status === 'finished') && (
        <div className="w-full relative">
          <div className="text-xl sm:text-2xl font-mono leading-relaxed tracking-wide text-stone-500 mb-6 bg-stone-950 p-6 rounded-2xl border-2 border-stone-800/50 relative overflow-hidden">
            {targetText.split('').map((char, i) => {
              let color = 'text-stone-600'
              if (i < input.length) {
                color = input[i] === char ? 'text-white' : 'text-red-500 bg-red-500/20'
              } else if (i === input.length && status === 'playing') {
                color = 'text-stone-300 bg-stone-800/80 animate-pulse border-b-2 border-[#f37021]'
              }
              return <span key={i} className={color}>{char}</span>
            })}
            
            <AnimatePresence>
              {status === 'countdown' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 2 }}
                  className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center text-7xl font-black text-[#f37021]"
                >
                  {countdown > 0 ? countdown : 'GO!'}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInput}
            disabled={status !== 'playing'}
            className="w-full bg-stone-900 border-2 border-stone-700 focus:border-[#f37021] rounded-xl px-4 py-3 text-lg text-white outline-none opacity-0 absolute inset-0 z-10 cursor-text"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />

          <AnimatePresence>
            {status === 'finished' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-4 mt-6">
                <div className="flex items-center gap-3">
                  <Trophy className={`w-8 h-8 ${winner === 'me' ? 'text-[#f37021]' : 'text-stone-400'}`} />
                  <span className="text-2xl font-black text-white">
                    {winner === 'me' ? 'You won!' : 'Opponent won!'}
                  </span>
                </div>
                <button onClick={startGame} className="px-6 py-2 bg-stone-800 hover:bg-stone-700 text-white font-bold rounded-xl flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" /> Race Again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
