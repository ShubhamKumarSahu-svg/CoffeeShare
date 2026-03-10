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
    <div className="flex flex-col items-center gap-6 w-full max-w-sm select-none mt-4">
      <div className="flex justify-between items-center w-full px-2">
        <div className="flex flex-col items-center border-4 border-[var(--border-strong)] bg-bauhaus-red text-white p-2 shadow-[4px_4px_0px_0px_var(--shadow-color)] min-w-[64px]">
          <span className="text-[10px] font-black uppercase tracking-widest border-b-2 border-white pb-1 mb-1 w-full text-center">YOU</span>
          <div className="text-xl font-black">{scores[myIdx]}</div>
        </div>
        <div className="px-4 py-2 border-4 border-[var(--border-strong)] bg-white shadow-[4px_4px_0px_0px_var(--shadow-color)]">
          <span className="text-xs font-black text-primary tracking-widest uppercase">ROUND {round || '—'}</span>
        </div>
        <div className="flex flex-col items-center border-4 border-[var(--border-strong)] bg-[var(--bg-elevated)] text-primary p-2 shadow-[4px_4px_0px_0px_var(--shadow-color)] min-w-[64px]">
          <span className="text-[10px] font-black uppercase tracking-widest border-b-2 border-[var(--border-strong)] pb-1 mb-1 w-full text-center">THEM</span>
          <div className="text-xl font-black">{scores[myIdx === 0 ? 1 : 0]}</div>
        </div>
      </div>

      <button
        onClick={phase === 'idle' || (phase === 'result' && roundResult !== 'pending') ? startRound : handleTap}
        className={`w-full h-64 border-4 border-[var(--border-strong)] flex flex-col items-center justify-center gap-4 transition-all duration-300 cursor-pointer shadow-[8px_8px_0px_0px_var(--shadow-color)] hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_var(--shadow-color)] ${
          phase === 'waiting' ? 'bg-bauhaus-red text-white'
          : phase === 'go' ? 'bg-bauhaus-blue text-white'
          : phase === 'too-early' ? 'bg-bauhaus-yellow text-primary'
          : 'bg-white text-primary'
        }`}
      >
        {phase === 'idle' && (
          <>
            <span className="text-5xl">⚡</span>
            <span className="font-black text-2xl uppercase tracking-widest">Tap to Start</span>
            <span className="font-bold text-xs uppercase opacity-70">Fastest reaction wins</span>
          </>
        )}
        {phase === 'waiting' && (
          <>
            <span className="text-6xl animate-pulse">🔴</span>
            <span className="font-black text-2xl uppercase tracking-widest">Wait for blue...</span>
          </>
        )}
        {phase === 'go' && (
          <>
            <span className="text-6xl">🔵</span>
            <span className="font-black text-3xl uppercase tracking-widest">TAP NOW!</span>
          </>
        )}
        {phase === 'too-early' && (
          <>
            <span className="text-6xl">😬</span>
            <span className="font-black text-2xl uppercase tracking-widest">Too early!</span>
          </>
        )}
        {phase === 'result' && (
          <>
            <span className="text-5xl">
              {roundResult === 'win' ? '🏆' : roundResult === 'lose' ? '😅' : roundResult === 'draw' ? '🤝' : '⏱️'}
            </span>
            <span className="font-black text-4xl">
              {myTime !== null ? (myTime >= 9999 ? 'Early!' : `${myTime}ms`) : '—'}
            </span>
            {opponentTime !== null && (
              <span className="font-bold text-sm opacity-70 uppercase tracking-widest mt-2 border-t-2 border-[var(--border-strong)] pt-2">
                Opponent: {opponentTime >= 9999 ? 'Early!' : `${opponentTime}ms`}
              </span>
            )}
            {roundResult && roundResult !== 'pending' && <span className="font-black text-xs uppercase tracking-widest mt-2 bg-bauhaus-yellow px-4 py-2 border-2 border-[var(--border-strong)]">Tap to play next round</span>}
            {roundResult === 'pending' && <span className="font-black text-xs uppercase tracking-widest mt-2 opacity-70 animate-pulse">Waiting for opponent...</span>}
          </>
        )}
      </button>
    </div>
  )
}
