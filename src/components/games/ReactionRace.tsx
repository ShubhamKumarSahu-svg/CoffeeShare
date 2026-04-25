'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react'

type Phase = 'idle' | 'waiting' | 'go' | 'result' | 'too-early'

export default function ReactionRace({
  gameState, sendGameState, currentUserRole,
}: {
  gameState: any; sendGameState: (state: any) => void; currentUserRole: 'uploader' | 'downloader'
}) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [myTime, setMyTime] = useState<number | null>(null)
  const [opponentTime, setOpponentTime] = useState<number | null>(null)
  const [scores, setScores] = useState<[number, number]>([0, 0])
  const [round, setRound] = useState(0)
  const [roundResult, setRoundResult] = useState<'win' | 'lose' | 'draw' | 'pending' | null>(null)

  const goTimestamp = useRef(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const phaseRef = useRef<Phase>('idle')
  const myTimeRef = useRef<number | null>(null)

  useEffect(() => { phaseRef.current = phase }, [phase])
  useEffect(() => { return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) } }, [])

  const resolveRound = useCallback((me: number, them: number) => {
    const myIdx = currentUserRole === 'uploader' ? 0 : 1
    if (me >= 9999 && them >= 9999) setRoundResult('draw')
    else if (me >= 9999) { setRoundResult('lose'); setScores(s => { const n: [number, number] = [...s]; n[myIdx === 0 ? 1 : 0]++; return n }) }
    else if (them >= 9999) { setRoundResult('win'); setScores(s => { const n: [number, number] = [...s]; n[myIdx]++; return n }) }
    else if (me < them) { setRoundResult('win'); setScores(s => { const n: [number, number] = [...s]; n[myIdx]++; return n }) }
    else if (them < me) { setRoundResult('lose'); setScores(s => { const n: [number, number] = [...s]; n[myIdx === 0 ? 1 : 0]++; return n }) }
    else setRoundResult('draw')
  }, [currentUserRole])

  useEffect(() => {
    if (!gameState || gameState.game !== 'reaction') return
    if (gameState.type === 'start-round') {
      setPhase('waiting'); setMyTime(null); setOpponentTime(null); setRoundResult(null); setRound(gameState.round)
      myTimeRef.current = null
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => { goTimestamp.current = Date.now(); setPhase('go') }, gameState.delay)
    } else if (gameState.type === 'result') {
      const them = gameState.time as number
      setOpponentTime(them)
      if (myTimeRef.current !== null) resolveRound(myTimeRef.current, them)
    }
  }, [gameState, resolveRound])

  const startRound = useCallback(() => {
    const delay = 2000 + Math.random() * 3000
    const newRound = round + 1
    setRound(newRound); setPhase('waiting'); setMyTime(null); setOpponentTime(null); setRoundResult(null)
    myTimeRef.current = null
    sendGameState({ game: 'reaction', type: 'start-round', round: newRound, delay })
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => { goTimestamp.current = Date.now(); setPhase('go') }, delay)
  }, [round, sendGameState])

  const handleTap = useCallback(() => {
    if (phaseRef.current === 'waiting') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      setPhase('too-early'); setMyTime(9999); myTimeRef.current = 9999
      sendGameState({ game: 'reaction', type: 'result', time: 9999 })
      setTimeout(() => setPhase('result'), 1200)
      return
    }
    if (phaseRef.current === 'go') {
      const reaction = Date.now() - goTimestamp.current
      setMyTime(reaction); myTimeRef.current = reaction; setPhase('result'); setRoundResult('pending')
      sendGameState({ game: 'reaction', type: 'result', time: reaction })
      setOpponentTime(prev => { if (prev !== null) resolveRound(reaction, prev); return prev })
    }
  }, [sendGameState, resolveRound])

  const myIdx = currentUserRole === 'uploader' ? 0 : 1

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm">
      <div className="flex justify-between items-center w-full px-4 mb-2">
        <div className="flex flex-col items-center">
          <span className="text-xs font-semibold text-stone-500 mb-1">YOU</span>
          <div className="text-3xl font-mono font-black text-white">{scores[myIdx]}</div>
        </div>
        <div className="px-4 py-1.5 rounded-full bg-stone-800/50 border border-stone-700">
          <span className="text-xs font-mono font-bold text-stone-400 tracking-wider">ROUND {round || '—'}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs font-semibold text-stone-500 mb-1">THEM</span>
          <div className="text-3xl font-mono font-black text-stone-500">{scores[myIdx === 0 ? 1 : 0]}</div>
        </div>
      </div>

      <button
        onClick={phase === 'idle' || (phase === 'result' && roundResult !== 'pending') ? startRound : handleTap}
        className={`w-full h-56 rounded-3xl border-2 flex flex-col items-center justify-center gap-3 transition-all duration-300 cursor-pointer select-none ${
          phase === 'waiting' ? 'bg-red-500/10 border-red-500/30'
          : phase === 'go' ? 'bg-green-500/10 border-green-500/30'
          : phase === 'too-early' ? 'bg-yellow-500/10 border-yellow-500/30'
          : 'bg-stone-800/50 border-stone-700/80'
        }`}
      >
        {phase === 'idle' && (
          <>
            <span className="text-4xl">⚡</span>
            <span className="text-stone-200 font-bold text-lg">Tap to Start</span>
            <span className="text-stone-500 text-xs">Best of 5 · Fastest reaction wins</span>
          </>
        )}
        {phase === 'waiting' && (
          <>
            <span className="text-5xl animate-pulse">🔴</span>
            <span className="text-red-300 font-bold text-lg">Wait for green...</span>
          </>
        )}
        {phase === 'go' && (
          <>
            <span className="text-5xl">🟢</span>
            <span className="text-green-300 font-bold text-xl">TAP NOW!</span>
          </>
        )}
        {phase === 'too-early' && (
          <>
            <span className="text-5xl">😬</span>
            <span className="text-yellow-300 font-bold text-lg">Too early!</span>
          </>
        )}
        {phase === 'result' && (
          <>
            <span className="text-4xl">
              {roundResult === 'win' ? '🏆' : roundResult === 'lose' ? '😅' : roundResult === 'draw' ? '🤝' : '⏱️'}
            </span>
            <span className="text-white font-bold text-2xl font-mono">
              {myTime !== null ? (myTime >= 9999 ? 'Too early!' : `${myTime}ms`) : '—'}
            </span>
            {opponentTime !== null && (
              <span className="text-stone-500 text-sm">
                Opponent: {opponentTime >= 9999 ? 'Too early!' : `${opponentTime}ms`}
              </span>
            )}
            {roundResult && roundResult !== 'pending' && <span className="text-stone-600 text-xs mt-1">Tap to play next round</span>}
            {roundResult === 'pending' && <span className="text-stone-500 text-xs mt-1 animate-pulse">Waiting for opponent...</span>}
          </>
        )}
      </button>
    </div>
  )
}
