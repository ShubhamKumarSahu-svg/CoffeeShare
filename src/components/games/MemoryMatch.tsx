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
    <div className="flex flex-col items-center w-full gap-4 select-none">
      <div className="flex items-center justify-between w-full px-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-stone-500 uppercase">Host</span>
          <span className={`text-xl font-mono font-black ${currentUserRole === 'uploader' ? 'text-white' : 'text-stone-500'}`}>{scores.uploader}</span>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
          isMyTurn && !isGameOver ? 'bg-white/10 text-white border border-white/20' : 'bg-stone-800/60 text-stone-500 border border-stone-700/50'
        }`}>
          {isGameOver ? 'Game Over!' : isMyTurn ? 'Your Turn' : "Opponent's Turn"}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xl font-mono font-black ${currentUserRole === 'downloader' ? 'text-white' : 'text-stone-500'}`}>{scores.downloader}</span>
          <span className="text-xs font-semibold text-stone-500 uppercase">Peer</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-3 p-3 rounded-2xl bg-stone-900/50 border border-stone-800">
        {board.map((card, idx) => {
          const isFlipped = flipped.includes(idx) || matched.includes(idx)
          const isMatched = matched.includes(idx)
          return (
            <button
              key={idx}
              onClick={() => handleCardClick(idx)}
              disabled={isFlipped || isLocked || !isMyTurn}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center text-2xl sm:text-3xl transition-all duration-300 border-2 ${
                isMatched ? 'bg-stone-800 border-stone-700 opacity-40'
                : isFlipped ? 'bg-stone-800 border-stone-600'
                : isMyTurn && !isLocked ? 'bg-stone-700 border-stone-600 hover:bg-stone-600 hover:border-stone-500 cursor-pointer'
                : 'bg-stone-700 border-stone-600 opacity-70'
              }`}
            >
              {isFlipped ? card : <span className="text-stone-500 text-lg font-bold">?</span>}
            </button>
          )
        })}
      </div>

      {isGameOver && (
        <div className="flex flex-col items-center gap-2 mt-2">
          <span className="text-lg font-black text-white">
            {winner === currentUserRole ? 'You win! 🏆' : winner === 'tie' ? "It's a tie!" : 'Opponent wins!'}
          </span>
          <button onClick={() => {
            const shuffled = [...CARDS, ...CARDS].sort(() => Math.random() - 0.5)
            sendGameState({ game: 'memory', type: 'reset', board: shuffled })
            setBoard(shuffled); setFlipped([]); setMatched([])
            setScores({ uploader: 0, downloader: 0 }); setCurrentTurn('uploader'); setIsLocked(false)
          }} className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/10 transition-colors">
            Play Again
          </button>
        </div>
      )}
    </div>
  )
}
