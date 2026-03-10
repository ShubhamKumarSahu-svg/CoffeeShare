'use client'
import React, { useState, useEffect, useCallback } from 'react'

const CARDS = ['☕', '🍪', '🍩', '🍰', '🥐', '🧊', '🍯', '🍫']

export default function MemoryMatch({
  gameState, sendGameState, currentUserRole,
}: {
  gameState: any; sendGameState: (state: any) => void; currentUserRole: 'uploader' | 'downloader'
}) {
  const [board, setBoard] = useState<string[]>([])
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState<number[]>([])
  const [currentTurn, setCurrentTurn] = useState<'uploader' | 'downloader'>('uploader')
  const [scores, setScores] = useState({ uploader: 0, downloader: 0 })
  const [isLocked, setIsLocked] = useState(false)
  const isMyTurn = currentTurn === currentUserRole

  const initializeGame = useCallback(() => {
    const shuffled = [...CARDS, ...CARDS].sort(() => Math.random() - 0.5)
    setBoard(shuffled); setFlipped([]); setMatched([]); setScores({ uploader: 0, downloader: 0 })
    setCurrentTurn('uploader'); setIsLocked(false)
    if (currentUserRole === 'uploader') sendGameState({ game: 'memory', type: 'init', board: shuffled })
  }, [currentUserRole, sendGameState])

  useEffect(() => {
    if (currentUserRole === 'uploader' && board.length === 0) initializeGame()
  }, [currentUserRole, board.length, initializeGame])

  useEffect(() => {
    if (!gameState || gameState.game !== 'memory') return
    if (gameState.type === 'init' || gameState.type === 'reset') {
      setBoard(gameState.board); setFlipped([]); setMatched([])
      setScores({ uploader: 0, downloader: 0 }); setCurrentTurn('uploader'); setIsLocked(false)
    } else if (gameState.type === 'flip') {
      setFlipped(gameState.flipped)
    } else if (gameState.type === 'match') {
      setMatched(gameState.matched); setScores(gameState.scores); setFlipped([]); setCurrentTurn(gameState.nextTurn); setIsLocked(false)
    } else if (gameState.type === 'nomatch') {
      setFlipped(gameState.flipped); setIsLocked(true)
      setTimeout(() => { setFlipped([]); setCurrentTurn(gameState.nextTurn); setIsLocked(false) }, 1200)
    }
  }, [gameState])

  const handleCardClick = useCallback((index: number) => {
    if (!isMyTurn || isLocked || flipped.includes(index) || matched.includes(index)) return
    const newFlipped = [...flipped, index]
    setFlipped(newFlipped)
    sendGameState({ game: 'memory', type: 'flip', flipped: newFlipped })
    if (newFlipped.length === 2) {
      setIsLocked(true)
      const [first, second] = newFlipped
      if (board[first] === board[second]) {
        setTimeout(() => {
          const newMatched = [...matched, first, second]
          const newScores = { ...scores, [currentUserRole]: scores[currentUserRole] + 1 }
          setMatched(newMatched); setScores(newScores); setFlipped([]); setIsLocked(false)
          sendGameState({ game: 'memory', type: 'match', matched: newMatched, scores: newScores, nextTurn: currentUserRole })
        }, 600)
      } else {
        const nextTurn = currentUserRole === 'uploader' ? 'downloader' : 'uploader'
        sendGameState({ game: 'memory', type: 'nomatch', flipped: newFlipped, nextTurn })
        setTimeout(() => { setFlipped([]); setCurrentTurn(nextTurn); setIsLocked(false) }, 1200)
      }
    }
  }, [isMyTurn, isLocked, flipped, matched, board, scores, currentUserRole, sendGameState])

  const isGameOver = board.length > 0 && matched.length === board.length
  const winner = scores.uploader > scores.downloader ? 'uploader' : scores.downloader > scores.uploader ? 'downloader' : 'tie'

  return (
    <div className="flex flex-col items-center w-full gap-6 select-none mt-4">
      <div className="flex items-center justify-between w-full max-w-[320px] px-2">
        <div className="flex flex-col items-center border-4 border-[var(--border-strong)] bg-bauhaus-red text-white p-2 shadow-[4px_4px_0px_0px_var(--shadow-color)] min-w-[64px]">
          <span className="text-[10px] font-black uppercase tracking-widest border-b-2 border-white pb-1 mb-1 w-full text-center">HOST</span>
          <span className="text-xl font-black">{scores.uploader}</span>
        </div>
        <div className={`px-4 py-2 border-4 border-[var(--border-strong)] shadow-[4px_4px_0px_0px_var(--shadow-color)] text-xs font-black uppercase tracking-widest ${
          isMyTurn && !isGameOver ? 'bg-bauhaus-yellow text-primary' : 'bg-white text-primary'
        }`}>
          {isGameOver ? 'Game Over!' : isMyTurn ? 'Your Turn' : "Wait..."}
        </div>
        <div className="flex flex-col items-center border-4 border-[var(--border-strong)] bg-bauhaus-blue text-white p-2 shadow-[4px_4px_0px_0px_var(--shadow-color)] min-w-[64px]">
          <span className="text-[10px] font-black uppercase tracking-widest border-b-2 border-white pb-1 mb-1 w-full text-center">PEER</span>
          <span className="text-xl font-black">{scores.downloader}</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 sm:gap-4 p-4 border-4 border-[var(--border-strong)] bg-[var(--bg-card)] shadow-[8px_8px_0px_0px_var(--shadow-color)]">
        {board.map((card, idx) => {
          const isFlipped = flipped.includes(idx) || matched.includes(idx)
          const isMatched = matched.includes(idx)
          return (
            <button
              key={idx}
              onClick={() => handleCardClick(idx)}
              disabled={isFlipped || isLocked || !isMyTurn}
              className={`w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center text-2xl sm:text-3xl transition-all duration-300 border-4 border-[var(--border-strong)] ${
                isMatched ? 'bg-[var(--bg-elevated)] opacity-40 shadow-[inset_2px_2px_0px_0px_rgba(0,0,0,0.1)]'
                : isFlipped ? 'bg-white shadow-[4px_4px_0px_0px_var(--shadow-color)] scale-105 z-10'
                : isMyTurn && !isLocked ? 'bg-bauhaus-yellow text-primary hover:bg-white hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_var(--shadow-color)] cursor-pointer'
                : 'bg-[var(--bg-muted)] opacity-80 shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,0.1)]'
              }`}
            >
              {isFlipped ? card : <span className="text-xl font-black opacity-40">?</span>}
            </button>
          )
        })}
      </div>

      {isGameOver && (
        <div className="flex flex-col items-center gap-4 mt-2">
          <span className="text-xl font-black text-primary uppercase tracking-widest bg-bauhaus-yellow px-4 py-2 border-4 border-[var(--border-strong)] shadow-[4px_4px_0px_0px_var(--shadow-color)]">
            {winner === currentUserRole ? 'You win! 🏆' : winner === 'tie' ? "It's a tie!" : 'Opponent wins!'}
          </span>
          <button onClick={() => {
            const shuffled = [...CARDS, ...CARDS].sort(() => Math.random() - 0.5)
            sendGameState({ game: 'memory', type: 'reset', board: shuffled })
            setBoard(shuffled); setFlipped([]); setMatched([])
            setScores({ uploader: 0, downloader: 0 }); setCurrentTurn('uploader'); setIsLocked(false)
          }} className="px-8 py-3 bg-bauhaus-blue border-4 border-[var(--border-strong)] shadow-[4px_4px_0px_0px_var(--shadow-color)] text-white font-black uppercase tracking-widest hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_var(--shadow-color)] transition-all">
            Play Again
          </button>
        </div>
      )}
    </div>
  )
}
