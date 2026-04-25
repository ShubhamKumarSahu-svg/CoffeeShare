'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Hand, Scissors, Square, RotateCcw } from 'lucide-react'

type Choice = 'rock' | 'paper' | 'scissors'

const CHOICES: { id: Choice; icon: React.ReactNode; label: string }[] = [
  { id: 'rock', icon: <Hand className="w-8 h-8" />, label: 'Rock' },
  { id: 'paper', icon: <Square className="w-8 h-8" />, label: 'Paper' },
  { id: 'scissors', icon: <Scissors className="w-8 h-8" />, label: 'Scissors' },
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

  const myChoiceRef = useRef<Choice | null>(null)
  const peerReadyRef = useRef(false)
  const revealSentRef = useRef(false)

  const sendReveal = useCallback((choice: Choice) => {
    if (revealSentRef.current) return
    revealSentRef.current = true
    sendGameState({ game: 'rps', type: 'reveal', choice })
  }, [sendGameState])

  useEffect(() => {
    if (!gameState || gameState.game !== 'rps') return

    if (gameState.type === 'choice-made') {
      peerReadyRef.current = true
      if (myChoiceRef.current) sendReveal(myChoiceRef.current)
    } else if (gameState.type === 'reveal') {
      const peer = gameState.choice as Choice
      setPeerChoice(peer)
      setPhase('reveal')
      if (myChoiceRef.current) {
        sendReveal(myChoiceRef.current)
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
    sendGameState({ game: 'rps', type: 'choice-made' })
    if (peerReadyRef.current) sendReveal(c)
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
        <div className="flex flex-col items-center gap-4">
          <p className="text-stone-500 text-sm font-medium">Pick your weapon</p>
          <div className="flex justify-center gap-4">
            {CHOICES.map(c => (
              <button
                key={c.id}
                onClick={() => selectChoice(c.id)}
                className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center gap-1 bg-stone-800 border-2 border-stone-700 text-stone-300 hover:bg-stone-700 hover:border-stone-500 hover:text-white transition-colors"
              >
                {c.icon}
                <span className="text-[10px] uppercase tracking-wider font-semibold">{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 'waiting' && (
        <div className="flex flex-col items-center gap-4 text-stone-400">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-stone-800 border border-stone-700 text-white">
            {choiceInfo(myChoice)?.icon}
          </div>
          <p className="text-sm font-medium text-stone-500 animate-pulse">Waiting for opponent...</p>
        </div>
      )}

      {phase === 'reveal' && myChoice && peerChoice && (
        <div className="flex flex-col items-center gap-6 w-full">
          <h3 className={`text-2xl font-black uppercase tracking-widest ${
            result === 'win' ? 'text-white' : result === 'lose' ? 'text-stone-500' : 'text-stone-400'
          }`}>
            {result === 'win' ? 'You Win!' : result === 'lose' ? 'You Lose!' : 'Draw!'}
          </h3>
          <div className="flex items-center justify-center gap-8 w-full">
            <div className="flex flex-col items-center gap-2">
              <div className="w-24 h-24 rounded-2xl flex items-center justify-center bg-stone-800 border-2 border-stone-600 text-white">
                {choiceInfo(myChoice)?.icon}
              </div>
              <span className="text-xs font-bold text-stone-500 uppercase">You</span>
            </div>
            <span className="text-xl font-bold text-stone-700">VS</span>
            <div className="flex flex-col items-center gap-2">
              <div className="w-24 h-24 rounded-2xl flex items-center justify-center bg-stone-800 border-2 border-stone-600 text-stone-400">
                {choiceInfo(peerChoice)?.icon}
              </div>
              <span className="text-xs font-bold text-stone-500 uppercase">Opponent</span>
            </div>
          </div>
          <button
            onClick={nextRound}
            className="px-6 py-2 mt-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl flex items-center gap-2 border border-white/10 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Next Round
          </button>
        </div>
      )}
    </div>
  )
}
