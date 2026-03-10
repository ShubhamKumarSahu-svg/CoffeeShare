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
    <div className="flex flex-col items-center gap-6 w-full select-none mt-4">
      <div className="flex items-center justify-between w-full max-w-sm px-2">
        <div className="flex flex-col items-center border-4 border-[var(--border-strong)] bg-bauhaus-red text-white p-2 shadow-[4px_4px_0px_0px_var(--shadow-color)]">
          <span className="text-[10px] font-black uppercase tracking-widest border-b-2 border-white pb-1 mb-1 w-full text-center">X</span>
          <span className="text-xl font-black">{scores.X}</span>
        </div>
        <div className={`px-4 py-2 border-4 border-[var(--border-strong)] shadow-[4px_4px_0px_0px_var(--shadow-color)] text-xs font-black uppercase tracking-widest ${
          isMyTurn ? 'bg-bauhaus-yellow text-primary' : 'bg-white text-primary'
        }`}>
          {statusText}
        </div>
        <div className="flex flex-col items-center border-4 border-[var(--border-strong)] bg-bauhaus-blue text-white p-2 shadow-[4px_4px_0px_0px_var(--shadow-color)]">
          <span className="text-[10px] font-black uppercase tracking-widest border-b-2 border-white pb-1 mb-1 w-full text-center">O</span>
          <span className="text-xl font-black">{scores.O}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 p-4 border-4 border-[var(--border-strong)] bg-[var(--bg-card)] shadow-[8px_8px_0px_0px_var(--shadow-color)]">
        {board.map((cell, i) => {
          const isWinCell = winLine?.includes(i)
          return (
            <button
              key={i}
              onClick={() => handleClick(i)}
              className={`w-20 h-20 sm:w-24 sm:h-24 text-4xl sm:text-5xl font-black flex items-center justify-center transition-all duration-150 border-4 border-[var(--border-strong)] ${
                cell === 'X' ? `bg-bauhaus-red text-white ${isWinCell ? 'scale-110 shadow-[4px_4px_0px_0px_var(--shadow-color)] z-10' : ''}`
                : cell === 'O' ? `bg-bauhaus-blue text-white ${isWinCell ? 'scale-110 shadow-[4px_4px_0px_0px_var(--shadow-color)] z-10' : ''}`
                : turn === mySymbol && !winner ? 'bg-[var(--bg-elevated)] hover:bg-bauhaus-yellow cursor-pointer shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,0.1)]'
                : 'bg-[var(--bg-muted)] cursor-not-allowed opacity-50 shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,0.1)]'
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
          className="px-8 py-3 mt-4 bg-bauhaus-yellow border-4 border-[var(--border-strong)] shadow-[4px_4px_0px_0px_var(--shadow-color)] text-primary font-black uppercase tracking-widest hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_var(--shadow-color)] transition-all"
        >
          Play Again
        </button>
      )}
    </div>
  )
}
