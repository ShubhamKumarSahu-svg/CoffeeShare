'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Symbol = 'X' | 'O' | null

export default function TicTacToe({
  gameState,
  sendGameState,
  currentUserRole,
}: {
  gameState: any
  sendGameState: (state: any) => void
  currentUserRole: 'uploader' | 'downloader'
}) {
  const [board, setBoard] = useState<Symbol[]>(Array(9).fill(null))
  const [turn, setTurn] = useState<'X' | 'O'>('X')
  const [winner, setWinner] = useState<Symbol>(null)
  const [winLine, setWinLine] = useState<number[] | null>(null)
  const [scores, setScores] = useState({ X: 0, O: 0 })

  // Uploader = X, Downloader = O
  const mySymbol: 'X' | 'O' = currentUserRole === 'uploader' ? 'X' : 'O'
  const isMyTurn = turn === mySymbol && !winner

  const checkWinner = useCallback((b: Symbol[]): { winner: Symbol; line: number[] | null } => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ]
    for (const [a, b2, c] of lines) {
      if (b[a] && b[a] === b[b2] && b[a] === b[c]) {
        return { winner: b[a], line: [a, b2, c] }
      }
    }
    return { winner: null, line: null }
  }, [])

  // Handle incoming game state
  useEffect(() => {
    if (!gameState || gameState.game !== 'tictactoe') return

    if (gameState.type === 'move') {
      setBoard(gameState.board)
      setTurn(gameState.turn)
      const { winner: w, line } = checkWinner(gameState.board)
      if (w) {
        setWinner(w)
        setWinLine(line)
        setScores(prev => ({ ...prev, [w]: prev[w] + 1 }))
      }
    } else if (gameState.type === 'reset') {
      setBoard(Array(9).fill(null))
      setTurn('X')
      setWinner(null)
      setWinLine(null)
    }
  }, [gameState, checkWinner])

  const handleClick = useCallback((i: number) => {
    if (board[i] || winner || turn !== mySymbol) return

    const newBoard = [...board]
    newBoard[i] = mySymbol
    const nextTurn = mySymbol === 'X' ? 'O' : 'X'

    setBoard(newBoard)
    setTurn(nextTurn)

    const { winner: w, line } = checkWinner(newBoard)
    if (w) {
      setWinner(w)
      setWinLine(line)
      setScores(prev => ({ ...prev, [w]: prev[w] + 1 }))
    }

    sendGameState({ game: 'tictactoe', type: 'move', board: newBoard, turn: nextTurn })
  }, [board, winner, turn, mySymbol, checkWinner, sendGameState])

  const handleReset = useCallback(() => {
    setBoard(Array(9).fill(null))
    setTurn('X')
    setWinner(null)
    setWinLine(null)
    sendGameState({ game: 'tictactoe', type: 'reset' })
  }, [sendGameState])

  const isDraw = !winner && board.every(cell => cell !== null)

  const statusText = winner
    ? winner === mySymbol ? 'You win! 🎉' : 'Opponent wins!'
    : isDraw
    ? "It's a draw! 🤝"
    : isMyTurn
    ? 'Your turn'
    : "Opponent's turn..."

  return (
    <div className="flex flex-col items-center gap-4 w-full select-none">
      {/* Score */}
      <div className="flex items-center justify-between w-full px-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">X (Host)</span>
          <span className={`text-xl font-mono font-black ${mySymbol === 'X' ? 'text-[#f37021]' : 'text-stone-300'}`}>{scores.X}</span>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
          isMyTurn ? 'bg-[#f37021]/15 text-[#f37021] border border-[#f37021]/30' : 'bg-stone-800/60 text-stone-500 border border-stone-700/50'
        }`}>
          {statusText}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xl font-mono font-black ${mySymbol === 'O' ? 'text-blue-400' : 'text-stone-300'}`}>{scores.O}</span>
          <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">O (Peer)</span>
        </div>
      </div>

      {/* Board */}
      <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-stone-900/50 border border-stone-800">
        {board.map((cell, i) => {
          const isWinCell = winLine?.includes(i)
          return (
            <motion.button
              key={i}
              whileHover={!cell && !winner && turn === mySymbol ? { scale: 1.05 } : {}}
              whileTap={!cell && !winner && turn === mySymbol ? { scale: 0.95 } : {}}
              onClick={() => handleClick(i)}
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl text-4xl sm:text-5xl font-black flex items-center justify-center transition-all duration-300 border-2 ${
                cell === 'X' ? `text-[#f37021] border-[#f37021]/50 bg-[#f37021]/15 ${isWinCell ? 'shadow-[0_0_20px_rgba(243,112,33,0.5)] scale-105' : 'shadow-[0_0_15px_rgba(243,112,33,0.3)]'}`
                : cell === 'O' ? `text-blue-400 border-blue-400/50 bg-blue-400/15 ${isWinCell ? 'shadow-[0_0_20px_rgba(96,165,250,0.5)] scale-105' : 'shadow-[0_0_15px_rgba(96,165,250,0.3)]'}`
                : turn === mySymbol && !winner ? 'border-stone-700/50 bg-stone-800/30 hover:bg-stone-700/40 hover:border-stone-600/80 cursor-pointer shadow-inner'
                : 'border-stone-800/30 bg-stone-900/30 cursor-not-allowed opacity-70'
              }`}
            >
              <AnimatePresence>
                {cell && (
                  <motion.span
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', bounce: 0.4 }}
                  >
                    {cell}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )
        })}
      </div>

      {/* Reset */}
      <AnimatePresence>
        {(winner || isDraw) && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleReset}
            className="px-8 py-3 mt-2 bg-[#f37021] hover:bg-[#e0661e] text-white font-bold rounded-xl shadow-lg shadow-[#f37021]/20 transition-all"
          >
            Play Again
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
