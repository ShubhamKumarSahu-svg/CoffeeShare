'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

interface ReactionRaceProps {
  gameState: any
  sendGameState: (state: any) => void
  currentUserRole: 'uploader' | 'downloader'
}

type Phase = 'idle' | 'waiting' | 'go' | 'result' | 'too-early'

export default function ReactionRace({ gameState, sendGameState, currentUserRole }: ReactionRaceProps) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [myTime, setMyTime] = useState<number | null>(null)
  const [opponentTime, setOpponentTime] = useState<number | null>(null)
  const [scores, setScores] = useState<[number, number]>([0, 0])
  const [round, setRound] = useState(0)
  const goTimestamp = useRef<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!gameState || gameState.game !== 'reaction') return
    if (gameState.type === 'start-round') {
      setPhase('waiting')
      setMyTime(null)
      setOpponentTime(null)
      setRound(gameState.round)
      const delay = gameState.delay
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        goTimestamp.current = Date.now()
        setPhase('go')
      }, delay)
    } else if (gameState.type === 'opponent-result') {
      setOpponentTime(gameState.time)
    } else if (gameState.type === 'score-update') {
      setScores(gameState.scores)
    }
  }, [gameState])

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }
  }, [])

  const startRound = useCallback(() => {
    const delay = 2000 + Math.random() * 3000
    const newRound = round + 1
    setRound(newRound)
    setPhase('waiting')
    setMyTime(null)
    setOpponentTime(null)
    sendGameState({ game: 'reaction', type: 'start-round', round: newRound, delay })
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      goTimestamp.current = Date.now()
      setPhase('go')
    }, delay)
  }, [round, sendGameState])

  const handleTap = useCallback(() => {
    if (phase === 'waiting') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      setPhase('too-early')
      sendGameState({ game: 'reaction', type: 'opponent-result', time: 9999 })
      setTimeout(() => setPhase('idle'), 1500)
      return
    }
    if (phase === 'go') {
      const reaction = Date.now() - goTimestamp.current
      setMyTime(reaction)
      setPhase('result')
      sendGameState({ game: 'reaction', type: 'opponent-result', time: reaction })

      // Score: if both times are in, check winner
      setTimeout(() => {
        setOpponentTime(prev => {
          if (prev !== null && reaction < prev) {
            const idx = currentUserRole === 'uploader' ? 0 : 1
            setScores(s => {
              const ns: [number, number] = [...s]
              ns[idx]++
              sendGameState({ game: 'reaction', type: 'score-update', scores: ns })
              return ns
            })
          }
          return prev
        })
      }, 500)
    }
  }, [phase, currentUserRole, sendGameState])

  const bgColor = phase === 'waiting' ? 'bg-red-500/20 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]'
    : phase === 'go' ? 'bg-green-500/20 border-green-500/50 shadow-[0_0_40px_rgba(34,197,94,0.4)]'
    : phase === 'too-early' ? 'bg-yellow-500/20 border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.2)]'
    : 'bg-stone-800/50 border-stone-700/80 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]'

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm">
      <div className="flex justify-between items-center w-full px-4 mb-2">
        <div className="flex flex-col items-center">
          <span className="text-xs font-semibold text-stone-500 mb-1">YOU</span>
          <div className="text-3xl font-mono font-black text-[#f37021] drop-shadow-[0_0_8px_rgba(243,112,33,0.5)]">
            {scores[currentUserRole === 'uploader' ? 0 : 1]}
          </div>
        </div>
        <div className="px-4 py-1.5 rounded-full bg-stone-800/50 border border-stone-700">
          <span className="text-xs font-mono font-bold text-stone-400 tracking-wider">ROUND {round || '—'}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs font-semibold text-stone-500 mb-1">THEM</span>
          <div className="text-3xl font-mono font-black text-stone-300">
            {scores[currentUserRole === 'uploader' ? 1 : 0]}
          </div>
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={phase === 'idle' || phase === 'result' ? startRound : handleTap}
        className={`w-full h-56 rounded-3xl border-2 flex flex-col items-center justify-center gap-3 transition-all duration-300 cursor-pointer select-none overflow-hidden ${bgColor}`}
      >
        {phase === 'idle' && (
          <>
            <span className="text-4xl">⚡</span>
            <span className="text-stone-200 font-bold text-lg">Tap to Start</span>
            <span className="text-stone-500 text-xs">Best of 5 • Fastest reaction wins</span>
          </>
        )}
        {phase === 'waiting' && (
          <>
            <span className="text-5xl animate-pulse">🔴</span>
            <span className="text-red-400 font-bold text-lg">Wait for green...</span>
          </>
        )}
        {phase === 'go' && (
          <>
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-5xl">🟢</motion.span>
            <span className="text-green-400 font-bold text-xl">TAP NOW!</span>
          </>
        )}
        {phase === 'too-early' && (
          <>
            <span className="text-5xl">😬</span>
            <span className="text-yellow-400 font-bold text-lg">Too early!</span>
          </>
        )}
        {phase === 'result' && (
          <>
            <span className="text-4xl">{myTime && opponentTime ? (myTime < opponentTime ? '🏆' : '😅') : '⏱️'}</span>
            <span className="text-stone-200 font-bold text-2xl font-mono">{myTime}ms</span>
            {opponentTime !== null && (
              <span className="text-stone-500 text-sm">Opponent: {opponentTime === 9999 ? 'Too early!' : `${opponentTime}ms`}</span>
            )}
            <span className="text-stone-600 text-xs mt-1">Tap to play next round</span>
          </>
        )}
      </motion.button>
    </div>
  )
}
