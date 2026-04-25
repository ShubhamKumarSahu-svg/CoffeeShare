'use client'
import React, { useState, useEffect, useCallback } from 'react'

const ROWS = 6
const COLS = 7
const EMPTY = 0
const P1 = 1
const P2 = 2
type Board = number[][]

function createEmptyBoard(): Board {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY))
}

function findDropRow(board: Board, col: number): number {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][col] === EMPTY) return row
  }
  return -1
}

function checkWinner(board: Board): number | null {
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c <= COLS - 4; c++) {
      const v = board[r][c]
      if (v !== EMPTY && v === board[r][c+1] && v === board[r][c+2] && v === board[r][c+3]) return v
    }
  for (let r = 0; r <= ROWS - 4; r++)
    for (let c = 0; c < COLS; c++) {
      const v = board[r][c]
      if (v !== EMPTY && v === board[r+1][c] && v === board[r+2][c] && v === board[r+3][c]) return v
    }
  for (let r = 0; r <= ROWS - 4; r++)
    for (let c = 0; c <= COLS - 4; c++) {
      const v = board[r][c]
      if (v !== EMPTY && v === board[r+1][c+1] && v === board[r+2][c+2] && v === board[r+3][c+3]) return v
    }
  for (let r = 0; r <= ROWS - 4; r++)
    for (let c = 3; c < COLS; c++) {
      const v = board[r][c]
      if (v !== EMPTY && v === board[r+1][c-1] && v === board[r+2][c-2] && v === board[r+3][c-3]) return v
    }
  return null
}

function isBoardFull(board: Board): boolean {
  return board[0].every(cell => cell !== EMPTY)
}

export default function ConnectFour({
  gameState, sendGameState, currentUserRole,
}: {
  gameState: any; sendGameState: (state: any) => void; currentUserRole: 'uploader' | 'downloader'
}) {
  const [board, setBoard] = useState<Board>(createEmptyBoard())
  const [currentTurn, setCurrentTurn] = useState(P1)
  const [winner, setWinner] = useState<number | null>(null)
  const [isDraw, setIsDraw] = useState(false)
  const [hoverCol, setHoverCol] = useState<number | null>(null)
  const [scores, setScores] = useState<[number, number]>([0, 0])

  const myPlayer = currentUserRole === 'uploader' ? P1 : P2
  const isMyTurn = currentTurn === myPlayer && !winner && !isDraw

  const applyMove = useCallback((col: number, player: number) => {
    const newBoard = board.map(r => [...r])
    const row = findDropRow(newBoard, col)
    if (row === -1) return
    newBoard[row][col] = player
    setBoard(newBoard)
    setCurrentTurn(player === P1 ? P2 : P1)
    const w = checkWinner(newBoard)
    if (w) {
      setWinner(w)
      setScores(prev => { const s: [number, number] = [...prev]; s[w - 1]++; return s })
    } else if (isBoardFull(newBoard)) {
      setIsDraw(true)
    }
  }, [board])

  useEffect(() => {
    if (!gameState || gameState.game !== 'connect4') return
    if (gameState.type === 'move') applyMove(gameState.col, gameState.player)
    else if (gameState.type === 'reset') {
      setBoard(createEmptyBoard()); setCurrentTurn(P1); setWinner(null); setIsDraw(false)
    }
  }, [gameState])

  const dropPiece = useCallback((col: number) => {
    if (!isMyTurn || board[0][col] !== EMPTY) return
    applyMove(col, myPlayer)
    sendGameState({ game: 'connect4', type: 'move', col, player: myPlayer })
  }, [board, isMyTurn, myPlayer, applyMove, sendGameState])

  const resetGame = useCallback(() => {
    setBoard(createEmptyBoard()); setCurrentTurn(P1); setWinner(null); setIsDraw(false)
    sendGameState({ game: 'connect4', type: 'reset' })
  }, [sendGameState])

  const statusText = winner
    ? winner === myPlayer ? 'You win!' : 'Opponent wins!'
    : isDraw ? 'Draw!' : isMyTurn ? 'Your turn' : "Opponent's turn..."

  return (
    <div className="flex flex-col items-center w-full gap-3">
      <div className="flex items-center justify-between w-full px-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-white" />
          <span className="text-xs font-semibold text-stone-500 uppercase">Host</span>
          <span className={`text-xl font-mono font-black ${currentUserRole === 'uploader' ? 'text-white' : 'text-stone-500'}`}>{scores[0]}</span>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
          isMyTurn ? 'bg-white/10 text-white border border-white/20' : 'bg-stone-800/60 text-stone-500 border border-stone-700/50'
        }`}>
          {statusText}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xl font-mono font-black ${currentUserRole === 'downloader' ? 'text-white' : 'text-stone-500'}`}>{scores[1]}</span>
          <span className="text-xs font-semibold text-stone-500 uppercase">Peer</span>
          <div className="w-4 h-4 rounded-full bg-stone-500" />
        </div>
      </div>

      <div className="rounded-2xl p-2 bg-stone-800 border border-stone-700">
        <div className="grid grid-cols-7 gap-1">
          {board.map((row, r) =>
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                onClick={() => dropPiece(c)}
                onMouseEnter={() => setHoverCol(c)}
                onMouseLeave={() => setHoverCol(null)}
                disabled={!isMyTurn || board[0][c] !== EMPTY}
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-colors bg-stone-900 ${
                  isMyTurn && cell === EMPTY && hoverCol === c ? 'ring-2 ring-white/20' : ''
                }`}
              >
                {cell === P1 && <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.2)]" />}
                {cell === P2 && <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-stone-500 shadow-[0_0_8px_rgba(120,113,108,0.3)]" />}
              </button>
            ))
          )}
        </div>
      </div>

      {(winner || isDraw) && (
        <button onClick={resetGame} className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl flex items-center gap-2 border border-white/10 transition-colors">
          Play Again
        </button>
      )}
    </div>
  )
}
