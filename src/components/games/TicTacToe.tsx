'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'

interface TicTacToeProps {
  gameState: any
  sendGameState: (state: any) => void
  currentUserRole: 'uploader' | 'downloader'
}

const WINNING_COMBOS = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
]

function checkWinner(board: string[]): string | null {
  for (const [a,b,c] of WINNING_COMBOS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a]
  }
  return board.every(c => c) ? 'draw' : null
}

export default function TicTacToe({ gameState, sendGameState, currentUserRole }: TicTacToeProps) {
  const [board, setBoard] = useState<string[]>(Array(9).fill(''))
  const [turn, setTurn] = useState<'X' | 'O'>('X')
  const [winner, setWinner] = useState<string | null>(null)
  const [scores, setScores] = useState<[number, number]>([0, 0])

  const mySymbol = currentUserRole === 'uploader' ? 'X' : 'O'

  useEffect(() => {
    if (!gameState || gameState.game !== 'tictactoe') return
    if (gameState.type === 'move') {
      setBoard(gameState.board)
      setTurn(gameState.turn)
      const w = checkWinner(gameState.board)
      if (w) {
        setWinner(w)
        if (w === 'X') setScores(prev => [prev[0]+1, prev[1]])
        else if (w === 'O') setScores(prev => [prev[0], prev[1]+1])
      }
    } else if (gameState.type === 'reset') {
      setBoard(Array(9).fill(''))
      setTurn('X')
      setWinner(null)
    }
  }, [gameState])

  const handleClick = useCallback((i: number) => {
    if (board[i] || winner || turn !== mySymbol) return
    const newBoard = [...board]
    newBoard[i] = mySymbol
    const nextTurn = mySymbol === 'X' ? 'O' : 'X'
    setBoard(newBoard)
    setTurn(nextTurn)
    const w = checkWinner(newBoard)
    if (w) {
      setWinner(w)
      if (w === 'X') setScores(prev => [prev[0]+1, prev[1]])
      else if (w === 'O') setScores(prev => [prev[0], prev[1]+1])
    }
    sendGameState({ game: 'tictactoe', type: 'move', board: newBoard, turn: nextTurn })
  }, [board, winner, turn, mySymbol, sendGameState])

  const handleReset = () => {
    setBoard(Array(9).fill(''))
    setTurn('X')
    setWinner(null)
    sendGameState({ game: 'tictactoe', type: 'reset' })
  }

  const statusText = winner
    ? winner === 'draw' ? "It's a draw!" : winner === mySymbol ? 'You win! 🎉' : 'You lost!'
    : turn === mySymbol ? 'Your turn' : "Opponent's turn"

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex justify-between items-center w-full px-2 mb-4">
        <div className="flex flex-col items-center">
          <span className="text-xs font-semibold text-stone-500 mb-1">HOST</span>
          <div className={`text-2xl font-mono font-black ${mySymbol === 'X' ? 'text-[#f37021] drop-shadow-[0_0_8px_rgba(243,112,33,0.5)]' : 'text-stone-300'}`}>
            X: {scores[0]}
          </div>
        </div>
        
        <div className={`text-sm font-bold px-4 py-1.5 rounded-full shadow-inner border ${turn === mySymbol ? 'bg-[#f37021]/10 text-[#f37021] border-[#f37021]/30' : 'bg-stone-800/50 text-stone-400 border-stone-700'}`}>
          {statusText}
        </div>

        <div className="flex flex-col items-center">
          <span className="text-xs font-semibold text-stone-500 mb-1">PEER</span>
          <div className={`text-2xl font-mono font-black ${mySymbol === 'O' ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]' : 'text-stone-300'}`}>
            O: {scores[1]}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 p-4 bg-stone-900/60 rounded-3xl border border-stone-800 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-sm">
        {board.map((cell, i) => (
          <motion.button
            key={i}
            whileHover={!cell && !winner && turn === mySymbol ? { scale: 1.05 } : {}}
            whileTap={!cell && !winner && turn === mySymbol ? { scale: 0.95 } : {}}
            onClick={() => handleClick(i)}
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl text-4xl sm:text-5xl font-black flex items-center justify-center transition-all duration-300 border-2 ${
              cell === 'X' ? 'text-[#f37021] border-[#f37021]/50 bg-gradient-to-br from-[#f37021]/20 to-[#f37021]/5 shadow-[0_0_15px_rgba(243,112,33,0.3)]'
              : cell === 'O' ? 'text-blue-400 border-blue-400/50 bg-gradient-to-br from-blue-400/20 to-blue-400/5 shadow-[0_0_15px_rgba(96,165,250,0.3)]'
              : turn === mySymbol && !winner ? 'border-stone-700/50 bg-stone-800/30 hover:bg-stone-700/40 hover:border-stone-600/80 cursor-pointer shadow-inner'
              : 'border-stone-800/30 bg-stone-900/30 cursor-not-allowed opacity-70'
            }`}
          >
            {cell && (
              <motion.span initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 300 }}>
                {cell}
              </motion.span>
            )}
          </motion.button>
        ))}
      </div>

      {winner && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleReset}
          className="px-8 py-3 mt-2 bg-gradient-to-r from-[#f37021] to-[#e0661e] hover:from-[#ff8033] hover:to-[#f37021] text-white font-bold rounded-xl shadow-lg shadow-[#f37021]/20 transition-all"
        >
          Play Again
        </motion.button>
      )}
    </div>
  )
}
