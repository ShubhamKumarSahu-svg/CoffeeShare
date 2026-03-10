'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Hand, Scissors, Square, RotateCcw } from 'lucide-react'

type Choice = 'rock' | 'paper' | 'scissors'

const CHOICES: { id: Choice; icon: React.ReactNode; label: string; color: string }[] = [
  { id: 'rock', icon: <Hand className="w-8 h-8" strokeWidth={3} />, label: 'Rock', color: 'bg-bauhaus-red' },
  { id: 'paper', icon: <Square className="w-8 h-8" strokeWidth={3} />, label: 'Paper', color: 'bg-bauhaus-yellow' },
  { id: 'scissors', icon: <Scissors className="w-8 h-8" strokeWidth={3} />, label: 'Scissors', color: 'bg-bauhaus-blue' },
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
    <div className="flex flex-col items-center w-full gap-8 select-none mt-4">
      <div className="flex items-center justify-between w-full max-w-[320px] px-2">
        <div className="flex flex-col items-center border-4 border-[var(--border-strong)] bg-bauhaus-red text-white p-2 shadow-[4px_4px_0px_0px_var(--shadow-color)] min-w-[64px]">
          <span className="text-[10px] font-black uppercase tracking-widest border-b-2 border-white pb-1 mb-1 w-full text-center">YOU</span>
          <span className="text-xl font-black">{scores.me}</span>
        </div>
        <div className="flex flex-col items-center border-4 border-[var(--border-strong)] bg-[var(--bg-card)] text-primary p-2 shadow-[4px_4px_0px_0px_var(--shadow-color)] min-w-[64px]">
          <span className="text-[10px] font-black uppercase tracking-widest border-b-2 border-[var(--border-strong)] pb-1 mb-1 w-full text-center">PEER</span>
          <span className="text-xl font-black">{scores.peer}</span>
        </div>
      </div>

      <div className="w-full flex-1 flex flex-col items-center justify-center p-6 border-4 border-[var(--border-strong)] bg-[var(--bg-card)] shadow-[8px_8px_0px_0px_var(--shadow-color)] min-h-[300px]">
        {phase === 'choosing' && (
          <div className="flex flex-col items-center gap-6">
            <p className="text-primary text-xl font-black uppercase tracking-widest bg-bauhaus-yellow px-4 py-2 border-4 border-[var(--border-strong)] shadow-[4px_4px_0px_0px_var(--shadow-color)]">Pick your weapon</p>
            <div className="flex justify-center gap-4 flex-wrap">
              {CHOICES.map(c => (
                <button
                  key={c.id}
                  onClick={() => selectChoice(c.id)}
                  className={`w-24 h-24 flex flex-col items-center justify-center gap-2 border-4 border-[var(--border-strong)] shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_var(--shadow-color)] transition-all bg-white text-primary hover:${c.color} hover:text-${c.color === 'bg-bauhaus-yellow' ? 'primary' : 'white'}`}
                >
                  {c.icon}
                  <span className="text-[10px] uppercase tracking-widest font-black">{c.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === 'waiting' && (
          <div className="flex flex-col items-center gap-6">
            <div className="w-24 h-24 flex flex-col items-center justify-center bg-white border-4 border-[var(--border-strong)] shadow-[4px_4px_0px_0px_var(--shadow-color)] text-primary opacity-50 scale-95">
              {choiceInfo(myChoice)?.icon}
              <span className="text-[10px] uppercase tracking-widest font-black mt-2">{choiceInfo(myChoice)?.label}</span>
            </div>
            <p className="text-sm font-black uppercase tracking-widest text-primary animate-pulse bg-[var(--bg-elevated)] px-4 py-2 border-4 border-[var(--border-strong)]">Waiting for opponent...</p>
          </div>
        )}

        {phase === 'reveal' && myChoice && peerChoice && (
          <div className="flex flex-col items-center gap-8 w-full">
            <h3 className={`text-3xl font-black uppercase tracking-widest px-6 py-3 border-4 border-[var(--border-strong)] shadow-[4px_4px_0px_0px_var(--shadow-color)] ${
              result === 'win' ? 'bg-bauhaus-yellow text-primary' : result === 'lose' ? 'bg-bauhaus-red text-white' : 'bg-[var(--bg-elevated)] text-primary'
            }`}>
              {result === 'win' ? 'You Win!' : result === 'lose' ? 'You Lose!' : 'Draw!'}
            </h3>
            <div className="flex items-center justify-center gap-6 w-full flex-wrap">
              <div className="flex flex-col items-center gap-3">
                <div className={`w-24 h-24 flex items-center justify-center border-4 border-[var(--border-strong)] shadow-[4px_4px_0px_0px_var(--shadow-color)] ${result === 'win' ? choiceInfo(myChoice)?.color + (choiceInfo(myChoice)?.color === 'bg-bauhaus-yellow' ? ' text-primary' : ' text-white') : 'bg-white text-primary opacity-50'}`}>
                  {choiceInfo(myChoice)?.icon}
                </div>
                <span className="text-xs font-black text-primary uppercase tracking-widest">You</span>
              </div>
              <span className="text-3xl font-black text-primary">VS</span>
              <div className="flex flex-col items-center gap-3">
                <div className={`w-24 h-24 flex items-center justify-center border-4 border-[var(--border-strong)] shadow-[4px_4px_0px_0px_var(--shadow-color)] ${result === 'lose' ? choiceInfo(peerChoice)?.color + (choiceInfo(peerChoice)?.color === 'bg-bauhaus-yellow' ? ' text-primary' : ' text-white') : 'bg-white text-primary opacity-50'}`}>
                  {choiceInfo(peerChoice)?.icon}
                </div>
                <span className="text-xs font-black text-primary uppercase tracking-widest">Opponent</span>
              </div>
            </div>
            <button
              onClick={nextRound}
              className="px-8 py-3 bg-bauhaus-blue border-4 border-[var(--border-strong)] shadow-[4px_4px_0px_0px_var(--shadow-color)] text-white font-black uppercase tracking-widest flex items-center gap-3 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_var(--shadow-color)] transition-all"
            >
              <RotateCcw className="w-5 h-5" strokeWidth={3} /> Next Round
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
