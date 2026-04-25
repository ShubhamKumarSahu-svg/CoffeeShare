'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, RotateCcw } from 'lucide-react'

const CARDS = ['☕', '🍪', '🍩', '🍰', '🥐', '🧊', '🍯', '🍫']

export default function MemoryMatch({
  gameState,
  sendGameState,
  currentUserRole,
}: {
  gameState: any
  sendGameState: (state: any) => void
  currentUserRole: 'uploader' | 'downloader'
}) {
  const [board, setBoard] = useState<string[]>([])
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState<number[]>([])
  const [currentTurn, setCurrentTurn] = useState<'uploader' | 'downloader'>('uploader')
  const [scores, setScores] = useState({ uploader: 0, downloader: 0 })
  const [isLocked, setIsLocked] = useState(false)

  const isMyTurn = currentTurn === currentUserRole

  // Uploader initializes the board on first mount
  const initializeGame = useCallback(() => {
    const shuffled = [...CARDS, ...CARDS].sort(() => Math.random() - 0.5)
    setBoard(shuffled)
    setFlipped([])
    setMatched([])
    setScores({ uploader: 0, downloader: 0 })
    setCurrentTurn('uploader')
    setIsLocked(false)
    if (currentUserRole === 'uploader') {
      sendGameState({ game: 'memory', type: 'init', board: shuffled })
    }
  }, [currentUserRole, sendGameState])

  useEffect(() => {
    if (currentUserRole === 'uploader' && board.length === 0) {
      initializeGame()
    }
  }, [currentUserRole, board.length, initializeGame])

  // Handle incoming game state
  useEffect(() => {
    if (!gameState || gameState.game !== 'memory') return

    if (gameState.type === 'init') {
      setBoard(gameState.board)
      setFlipped([])
      setMatched([])
      setScores({ uploader: 0, downloader: 0 })
      setCurrentTurn('uploader')
      setIsLocked(false)
    } else if (gameState.type === 'flip') {
      setFlipped(gameState.flipped)
    } else if (gameState.type === 'match') {
      setMatched(gameState.matched)
      setScores(gameState.scores)
      setFlipped([])
      setCurrentTurn(gameState.nextTurn)
      setIsLocked(false)
    } else if (gameState.type === 'nomatch') {
      setFlipped(gameState.flipped)
      setIsLocked(true)
      setTimeout(() => {
        setFlipped([])
        setCurrentTurn(gameState.nextTurn)
        setIsLocked(false)
      }, 1200)
    } else if (gameState.type === 'reset') {
      setBoard(gameState.board)
      setFlipped([])
      setMatched([])
      setScores({ uploader: 0, downloader: 0 })
      setCurrentTurn('uploader')
      setIsLocked(false)
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
        // Match found — keep turn
        setTimeout(() => {
          const newMatched = [...matched, first, second]
          const newScores = { ...scores, [currentUserRole]: scores[currentUserRole] + 1 }
          setMatched(newMatched)
          setScores(newScores)
          setFlipped([])
          setIsLocked(false)
          sendGameState({ game: 'memory', type: 'match', matched: newMatched, scores: newScores, nextTurn: currentUserRole })
        }, 600)
      } else {
        // No match — switch turn
        const nextTurn = currentUserRole === 'uploader' ? 'downloader' : 'uploader'
        sendGameState({ game: 'memory', type: 'nomatch', flipped: newFlipped, nextTurn })
        setTimeout(() => {
          setFlipped([])
          setCurrentTurn(nextTurn)
          setIsLocked(false)
        }, 1200)
      }
    }
  }, [isMyTurn, isLocked, flipped, matched, board, scores, currentUserRole, sendGameState])

  const isGameOver = board.length > 0 && matched.length === board.length
  const winner = scores.uploader > scores.downloader ? 'uploader' : scores.downloader > scores.uploader ? 'downloader' : 'tie'

  return (
    <div className="flex flex-col items-center w-full gap-4 select-none">
      {/* Score bar */}
      <div className="flex items-center justify-between w-full px-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Host</span>
          <span className={`text-xl font-mono font-black ${currentUserRole === 'uploader' ? 'text-[#f37021]' : 'text-stone-300'}`}>{scores.uploader}</span>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${isMyTurn && !isGameOver ? 'bg-[#f37021]/15 text-[#f37021] border border-[#f37021]/30' : 'bg-stone-800/60 text-stone-500 border border-stone-700/50'}`}>
          {isGameOver ? 'Game Over!' : isMyTurn ? 'Your Turn' : "Opponent's Turn"}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xl font-mono font-black ${currentUserRole === 'downloader' ? 'text-[#3b82f6]' : 'text-stone-300'}`}>{scores.downloader}</span>
          <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Peer</span>
        </div>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3 p-3 rounded-2xl bg-stone-900/50 border border-stone-800 shadow-inner">
        {board.map((card, idx) => {
          const isFlipped = flipped.includes(idx) || matched.includes(idx)
          const isMatched = matched.includes(idx)
          return (
            <motion.button
              key={idx}
              onClick={() => handleCardClick(idx)}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl relative overflow-hidden transition-all duration-300 ${
                isMatched ? 'opacity-40' : isFlipped ? 'ring-2 ring-[#f37021]/40' : ''
              }`}
              whileHover={!isFlipped && isMyTurn && !isLocked ? { scale: 1.05 } : {}}
              whileTap={!isFlipped && isMyTurn && !isLocked ? { scale: 0.95 } : {}}
              disabled={isFlipped || isLocked || !isMyTurn}
            >
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full relative"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Back (face down) */}
                <div
                  className="absolute inset-0 bg-[#f37021] rounded-xl flex items-center justify-center shadow-md"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <span className="text-white/30 text-2xl font-bold">?</span>
                </div>
                {/* Front (face up) */}
                <div
                  className="absolute inset-0 bg-stone-800 border-2 border-stone-700 rounded-xl flex items-center justify-center shadow-md"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <span className="text-2xl sm:text-3xl">{card}</span>
                </div>
              </motion.div>
            </motion.button>
          )
        })}
      </div>

      {/* Game over */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-2 mt-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#f37021]" />
              <span className="text-lg font-black text-white">
                {winner === currentUserRole ? 'You win! 🎉' : winner === 'tie' ? "It's a tie!" : 'Opponent wins!'}
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const shuffled = [...CARDS, ...CARDS].sort(() => Math.random() - 0.5)
                sendGameState({ game: 'memory', type: 'reset', board: shuffled })
                setBoard(shuffled)
                setFlipped([])
                setMatched([])
                setScores({ uploader: 0, downloader: 0 })
                setCurrentTurn('uploader')
                setIsLocked(false)
              }}
              className="px-6 py-2 bg-stone-800 hover:bg-stone-700 text-white font-bold rounded-xl flex items-center gap-2 border border-stone-700"
            >
              <RotateCcw className="w-4 h-4" /> Play Again
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
