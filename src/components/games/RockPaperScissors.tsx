'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Hand, Scissors, Square, RotateCcw } from 'lucide-react'

type Choice = 'rock' | 'paper' | 'scissors'

const CHOICES: { id: Choice; icon: React.ReactNode; color: string }[] = [
  { id: 'rock', icon: <Hand className="w-8 h-8" />, color: 'bg-stone-600' },
  { id: 'paper', icon: <Square className="w-8 h-8" />, color: 'bg-blue-600' },
  { id: 'scissors', icon: <Scissors className="w-8 h-8" />, color: 'bg-[#f37021]' },
]

function getResult(me: Choice, peer: Choice): 'win' | 'lose' | 'draw' {
  if (me === peer) return 'draw'
  const wins: Record<Choice, Choice> = { rock: 'scissors', paper: 'rock', scissors: 'paper' }
  return wins[me] === peer ? 'win' : 'lose'
}

export default function RockPaperScissors({
  gameState,
  sendGameState,
  currentUserRole,
}: {
  gameState: any
  sendGameState: (state: any) => void
  currentUserRole: 'uploader' | 'downloader'
}) {
  const [myChoice, setMyChoice] = useState<Choice | null>(null)
  const [peerChoice, setPeerChoice] = useState<Choice | null>(null)
  const [phase, setPhase] = useState<'choosing' | 'waiting' | 'reveal'>('choosing')
  const [result, setResult] = useState<'win' | 'lose' | 'draw' | null>(null)
  const [scores, setScores] = useState({ me: 0, peer: 0 })

  // Refs to avoid stale closures
  const myChoiceRef = useRef<Choice | null>(null)
  const peerReadyRef = useRef(false)
  const revealSentRef = useRef(false)

  const sendReveal = useCallback((choice: Choice) => {
    if (revealSentRef.current) return
    revealSentRef.current = true
    sendGameState({ game: 'rps', type: 'reveal', choice })
  }, [sendGameState])

  // Receive game state from peer
  useEffect(() => {
    if (!gameState || gameState.game !== 'rps') return

    if (gameState.type === 'choice-made') {
      // Peer locked in their choice (hidden)
      peerReadyRef.current = true
      // If I already chose, both are ready → send my reveal
      if (myChoiceRef.current) {
        sendReveal(myChoiceRef.current)
      }
    } else if (gameState.type === 'reveal') {
      // Peer revealed — show result
      const peer = gameState.choice as Choice
      setPeerChoice(peer)
      setPhase('reveal')
      if (myChoiceRef.current) {
        const res = getResult(myChoiceRef.current, peer)
        setResult(res)
        if (res === 'win') setScores(s => ({ ...s, me: s.me + 1 }))
        else if (res === 'lose') setScores(s => ({ ...s, peer: s.peer + 1 }))
      }
    } else if (gameState.type === 'reset') {
      setMyChoice(null)
      setPeerChoice(null)
      setPhase('choosing')
      setResult(null)
      myChoiceRef.current = null
      peerReadyRef.current = false
      revealSentRef.current = false
    }
  }, [gameState, sendReveal])

  const selectChoice = useCallback((c: Choice) => {
    setMyChoice(c)
    myChoiceRef.current = c
    setPhase('waiting')
    // Tell peer we chose (but not what)
    sendGameState({ game: 'rps', type: 'choice-made' })
    // If peer was already ready, reveal immediately
    if (peerReadyRef.current) {
      sendReveal(c)
    }
  }, [sendGameState, sendReveal])

  const nextRound = useCallback(() => {
    setMyChoice(null)
    setPeerChoice(null)
    setPhase('choosing')
    setResult(null)
    myChoiceRef.current = null
    peerReadyRef.current = false
    revealSentRef.current = false
    sendGameState({ game: 'rps', type: 'reset' })
  }, [sendGameState])

  const choiceInfo = (id: Choice | null) => CHOICES.find(c => c.id === id)

  return (
    <div className="flex flex-col items-center w-full gap-6 select-none">
      <div className="flex justify-between w-full px-4 text-stone-400 font-mono text-sm">
        <span>YOU: {scores.me}</span>
        <span>PEER: {scores.peer}</span>
      </div>

      {phase === 'choosing' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4"
        >
          <p className="text-stone-400 text-sm font-medium">Pick your weapon!</p>
          <div className="flex justify-center gap-4">
            {CHOICES.map(c => (
              <motion.button
                key={c.id}
                whileHover={{ scale: 1.1, y: -5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => selectChoice(c.id)}
                className={`w-20 h-20 rounded-2xl flex items-center justify-center ${c.color} shadow-lg text-white border-2 border-white/10`}
              >
                {c.icon}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {phase === 'waiting' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4 text-stone-300"
        >
          <div className="flex items-center gap-3">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${choiceInfo(myChoice)?.color} shadow-lg text-white`}>
              {choiceInfo(myChoice)?.icon}
            </div>
            <span className="text-stone-500 text-sm">Locked in!</span>
          </div>
          <p className="text-lg font-semibold animate-pulse">Waiting for opponent...</p>
        </motion.div>
      )}

      <AnimatePresence>
        {phase === 'reveal' && myChoice && peerChoice && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.3 }}
            className="flex flex-col items-center gap-6 w-full"
          >
            <h3 className={`text-3xl font-black uppercase tracking-widest ${
              result === 'win' ? 'text-[#f37021]' : result === 'lose' ? 'text-red-400' : 'text-stone-300'
            }`}>
              {result === 'win' ? 'You Win!' : result === 'lose' ? 'You Lose!' : 'Draw!'}
            </h3>
            <div className="flex items-center justify-center gap-8 w-full">
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  initial={{ x: -40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className={`w-24 h-24 rounded-2xl flex items-center justify-center ${choiceInfo(myChoice)?.color} shadow-lg text-white`}
                >
                  {choiceInfo(myChoice)?.icon}
                </motion.div>
                <span className="text-xs font-bold text-stone-400 uppercase">You</span>
              </div>
              <span className="text-2xl font-bold text-stone-600">VS</span>
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  initial={{ x: 40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className={`w-24 h-24 rounded-2xl flex items-center justify-center ${choiceInfo(peerChoice)?.color} shadow-lg text-white`}
                >
                  {choiceInfo(peerChoice)?.icon}
                </motion.div>
                <span className="text-xs font-bold text-stone-400 uppercase">Opponent</span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={nextRound}
              className="px-6 py-2 mt-4 bg-stone-800 hover:bg-stone-700 text-white font-bold rounded-xl flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Next Round
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
