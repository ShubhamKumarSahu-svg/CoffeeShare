'use client'
import React, { useState, useEffect, useCallback } from 'react'

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
    ? winner === mySymbol ? 'You win!' : 'Opponent wins!'
    : isDraw ? "Draw!" : isMyTurn ? 'Your turn' : "Opponent's turn..."

  return (
    <div className="flex flex-col items-center gap-4 w-full select-none">
      <div className="flex items-center justify-between w-full px-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">X</span>
          <span className={`text-xl font-mono font-black ${mySymbol === 'X' ? 'text-white' : 'text-stone-500'}`}>{scores.X}</span>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
          isMyTurn ? 'bg-white/10 text-white border border-white/20' : 'bg-stone-800/60 text-stone-500 border border-stone-700/50'
        }`}>
          {statusText}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xl font-mono font-black ${mySymbol === 'O' ? 'text-white' : 'text-stone-500'}`}>{scores.O}</span>
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">O</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-stone-900/50 border border-stone-800">
        {board.map((cell, i) => {
          const isWinCell = winLine?.includes(i)
          return (
            <button
              key={i}
              onClick={() => handleClick(i)}
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl text-4xl sm:text-5xl font-black flex items-center justify-center transition-colors duration-150 border-2 ${
                cell === 'X' ? `text-white border-stone-600 bg-stone-800 ${isWinCell ? 'ring-2 ring-white/40' : ''}`
                : cell === 'O' ? `text-stone-400 border-stone-600 bg-stone-800 ${isWinCell ? 'ring-2 ring-white/40' : ''}`
                : turn === mySymbol && !winner ? 'border-stone-700/50 bg-stone-800/30 hover:bg-stone-700/40 hover:border-stone-600/80 cursor-pointer'
                : 'border-stone-800/30 bg-stone-900/30 cursor-not-allowed opacity-50'
              }`}
            >
              {cell}
            </button>
          )
        })}
      </div>

      {(winner || isDraw) && (
        <button
          onClick={handleReset}
          className="px-8 py-3 mt-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/10 transition-colors"
        >
          Play Again
        </button>
      )}
    </div>
  )
}
