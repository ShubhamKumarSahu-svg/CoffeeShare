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
    <div className="flex flex-col items-center w-full gap-6 select-none mt-4">
      <div className="flex items-center justify-between w-full max-w-[360px] px-2">
        <div className="flex flex-col items-center border-4 border-[var(--border-strong)] bg-bauhaus-red text-white p-2 shadow-[4px_4px_0px_0px_var(--shadow-color)] min-w-[64px]">
          <span className="text-[10px] font-black uppercase tracking-widest border-b-2 border-white pb-1 mb-1 w-full text-center">HOST</span>
          <span className="text-xl font-black">{scores[0]}</span>
        </div>
        <div className={`px-4 py-2 border-4 border-[var(--border-strong)] shadow-[4px_4px_0px_0px_var(--shadow-color)] text-xs font-black uppercase tracking-widest ${
          isMyTurn ? 'bg-bauhaus-yellow text-primary' : 'bg-white text-primary'
        }`}>
          {statusText}
        </div>
        <div className="flex flex-col items-center border-4 border-[var(--border-strong)] bg-bauhaus-yellow text-primary p-2 shadow-[4px_4px_0px_0px_var(--shadow-color)] min-w-[64px]">
          <span className="text-[10px] font-black uppercase tracking-widest border-b-2 border-current pb-1 mb-1 w-full text-center">PEER</span>
          <span className="text-xl font-black">{scores[1]}</span>
        </div>
      </div>

      <div className="p-4 border-4 border-[var(--border-strong)] bg-bauhaus-blue shadow-[8px_8px_0px_0px_var(--shadow-color)]">
        <div className="grid grid-cols-7 gap-2">
          {board.map((row, r) =>
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                onClick={() => dropPiece(c)}
                onMouseEnter={() => setHoverCol(c)}
                onMouseLeave={() => setHoverCol(null)}
                disabled={!isMyTurn || board[0][c] !== EMPTY}
                className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center relative cursor-pointer"
              >
                {/* The "hole" or "piece" */}
                <div className={`w-full h-full rounded-full border-4 border-[var(--border-strong)] transition-all ${
                  cell === P1 ? 'bg-bauhaus-red shadow-[inset_-2px_-2px_0px_0px_rgba(0,0,0,0.3)]' :
                  cell === P2 ? 'bg-bauhaus-yellow shadow-[inset_-2px_-2px_0px_0px_rgba(0,0,0,0.3)]' :
                  'bg-white shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,0.2)]'
                }`} />
                {/* Hover indicator for top row */}
                {isMyTurn && r === 0 && hoverCol === c && board[0][c] === EMPTY && (
                  <div className={`absolute -top-12 w-full h-full rounded-full border-4 border-[var(--border-strong)] ${myPlayer === P1 ? 'bg-bauhaus-red' : 'bg-bauhaus-yellow'} opacity-50`} />
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {(winner || isDraw) && (
        <button onClick={resetGame} className="px-8 py-3 mt-2 bg-white border-4 border-[var(--border-strong)] text-primary font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_var(--shadow-color)] transition-all">
          Play Again
        </button>
      )}
    </div>
  )
}
