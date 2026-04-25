'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Hand, Scissors, Square, RotateCcw } from 'lucide-react'

type Choice = 'rock' | 'paper' | 'scissors'

const CHOICES = [
  { id: 'rock', icon: <Hand className="w-8 h-8" />, color: 'bg-stone-600' },
  { id: 'paper', icon: <Square className="w-8 h-8" />, color: 'bg-blue-600' },
  { id: 'scissors', icon: <Scissors className="w-8 h-8" />, color: 'bg-[#f37021]' },
]

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
  const [peerReady, setPeerReady] = useState(false)
  const [scores, setScores] = useState({ me: 0, peer: 0 })

  useEffect(() => {
    if (!gameState || gameState.game !== 'rps') return
    if (gameState.type === 'ready') setPeerReady(true)
    if (gameState.type === 'reveal') setPeerChoice(gameState.choice)
    if (gameState.type === 'reset') {
      setMyChoice(null)
      setPeerChoice(null)
      setPeerReady(false)
    }
  }, [gameState])

  // When both are ready, automatically reveal
  useEffect(() => {
    if (myChoice && peerReady && !peerChoice) {
      sendGameState({ game: 'rps', type: 'reveal', choice: myChoice })
    }
  }, [myChoice, peerReady, peerChoice, sendGameState])

  useEffect(() => {
    if (myChoice && peerChoice) {
      // Calculate winner
      if (myChoice === peerChoice) return // tie
      const winMap = { rock: 'scissors', paper: 'rock', scissors: 'paper' }
      if (winMap[myChoice] === peerChoice) setScores(s => ({ ...s, me: s.me + 1 }))
      else setScores(s => ({ ...s, peer: s.peer + 1 }))
    }
  }, [myChoice, peerChoice])

  const selectChoice = (c: Choice) => {
    setMyChoice(c)
    sendGameState({ game: 'rps', type: 'ready' })
  }

  const getResult = () => {
    if (myChoice === peerChoice) return 'Draw!'
    const winMap = { rock: 'scissors', paper: 'rock', scissors: 'paper' }
    return winMap[myChoice!] === peerChoice ? 'You Win!' : 'You Lose!'
  }

  return (
    <div className="flex flex-col items-center w-full gap-6 select-none">
      <div className="flex justify-between w-full px-4 text-stone-400 font-mono text-sm">
        <span>YOU: {scores.me}</span>
        <span>PEER: {scores.peer}</span>
      </div>

      {!myChoice && (
        <div className="flex justify-center gap-4">
          {CHOICES.map(c => (
            <motion.button
              key={c.id}
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => selectChoice(c.id as Choice)}
              className={`w-20 h-20 rounded-2xl flex items-center justify-center ${c.color} shadow-lg text-white border-2 border-white/10`}
            >
              {c.icon}
            </motion.button>
          ))}
        </div>
      )}

      {myChoice && !peerChoice && (
        <div className="flex flex-col items-center gap-4 text-stone-300 animate-pulse">
          <p className="text-lg font-semibold">Waiting for opponent...</p>
        </div>
      )}

      <AnimatePresence>
        {myChoice && peerChoice && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-6 w-full">
            <h3 className={`text-3xl font-black uppercase tracking-widest ${getResult() === 'You Win!' ? 'text-[#f37021]' : 'text-stone-300'}`}>
              {getResult()}
            </h3>
            <div className="flex items-center justify-center gap-8 w-full">
              <div className="flex flex-col items-center gap-2">
                <div className={`w-24 h-24 rounded-2xl flex items-center justify-center ${CHOICES.find(c => c.id === myChoice)?.color} shadow-lg text-white`}>
                  {CHOICES.find(c => c.id === myChoice)?.icon}
                </div>
                <span className="text-xs font-bold text-stone-400 uppercase">You</span>
              </div>
              <span className="text-2xl font-bold text-stone-600">VS</span>
              <div className="flex flex-col items-center gap-2">
                <div className={`w-24 h-24 rounded-2xl flex items-center justify-center ${CHOICES.find(c => c.id === peerChoice)?.color} shadow-lg text-white`}>
                  {CHOICES.find(c => c.id === peerChoice)?.icon}
                </div>
                <span className="text-xs font-bold text-stone-400 uppercase">Opponent</span>
              </div>
            </div>
            <motion.button onClick={() => {
              setMyChoice(null)
              setPeerChoice(null)
              setPeerReady(false)
              sendGameState({ game: 'rps', type: 'reset' })
            }} className="px-6 py-2 mt-4 bg-stone-800 hover:bg-stone-700 text-white font-bold rounded-xl flex items-center gap-2">
              <RotateCcw className="w-4 h-4" /> Next Round
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
