'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, Trophy } from 'lucide-react'

const ROWS = 6
const COLS = 7
const EMPTY = 0
const P1 = 1 // Host (uploader)
const P2 = 2 // Peer (downloader)

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
  gameState,
  sendGameState,
  currentUserRole,
}: {
  gameState: any
  sendGameState: (state: any) => void
  currentUserRole: 'uploader' | 'downloader'
}) {
  const [board, setBoard] = useState<Board>(createEmptyBoard())
  const [currentTurn, setCurrentTurn] = useState<number>(P1)
  const [winner, setWinner] = useState<number | null>(null)
  const [isDraw, setIsDraw] = useState(false)
  const [lastDrop, setLastDrop] = useState<{ row: number; col: number } | null>(null)
  const [hoverCol, setHoverCol] = useState<number | null>(null)
  const [scores, setScores] = useState<[number, number]>([0, 0])

  const myPlayer = currentUserRole === 'uploader' ? P1 : P2
  const isMyTurn = currentTurn === myPlayer && !winner && !isDraw

  // Apply a move to the board (used for both local and remote moves)
  const applyMove = useCallback((col: number, player: number, isRemote: boolean) => {
    const newBoard = board.map(r => [...r])
    const row = findDropRow(newBoard, col)
    if (row === -1) return // column full

    newBoard[row][col] = player
    setBoard(newBoard)
    setLastDrop(isRemote ? null : { row, col }) // only animate local drops
    setCurrentTurn(player === P1 ? P2 : P1)

    const w = checkWinner(newBoard)
    if (w) {
      setWinner(w)
      setScores(prev => {
        const s: [number, number] = [...prev]
        s[w - 1]++
        return s
      })
    } else if (isBoardFull(newBoard)) {
      setIsDraw(true)
    }
  }, [board])

  // Handle incoming game state from opponent
  useEffect(() => {
    if (!gameState || gameState.game !== 'connect4') return

    if (gameState.type === 'move') {
      applyMove(gameState.col, gameState.player, true)
    } else if (gameState.type === 'reset') {
      setBoard(createEmptyBoard())
      setCurrentTurn(P1)
      setWinner(null)
      setIsDraw(false)
      setLastDrop(null)
    }
  }, [gameState]) // intentionally excluding applyMove to prevent re-processing

  const dropPiece = useCallback((col: number) => {
    if (!isMyTurn || board[0][col] !== EMPTY) return
    applyMove(col, myPlayer, false)
    sendGameState({ game: 'connect4', type: 'move', col, player: myPlayer })
  }, [board, isMyTurn, myPlayer, applyMove, sendGameState])

  const resetGame = useCallback(() => {
    setBoard(createEmptyBoard())
    setCurrentTurn(P1)
    setWinner(null)
    setIsDraw(false)
    setLastDrop(null)
    sendGameState({ game: 'connect4', type: 'reset' })
  }, [sendGameState])

  const getStatusText = () => {
    if (winner) return winner === myPlayer ? 'You win!' : 'Opponent wins!'
    if (isDraw) return "It's a draw!"
    return isMyTurn ? 'Your turn — drop a piece!' : "Opponent's turn..."
  }

  const getPreviewRow = (col: number): number | null => {
    const row = findDropRow(board, col)
    return row >= 0 ? row : null
  }

  return (
    <div className="flex flex-col items-center w-full gap-3">
      {/* Score Bar */}
      <div className="flex items-center justify-between w-full px-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#f37021] shadow-[0_0_8px_rgba(243,112,33,0.5)]" />
          <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Host</span>
          <span className={`text-xl font-mono font-black ${currentUserRole === 'uploader' ? 'text-[#f37021]' : 'text-stone-300'}`}>{scores[0]}</span>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
          isMyTurn
            ? 'bg-[#f37021]/15 text-[#f37021] border border-[#f37021]/30'
            : 'bg-stone-800/60 text-stone-500 border border-stone-700/50'
        }`}>
          {getStatusText()}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xl font-mono font-black ${currentUserRole === 'downloader' ? 'text-[#3b82f6]' : 'text-stone-300'}`}>{scores[1]}</span>
          <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Peer</span>
          <div className="w-5 h-5 rounded-full bg-[#3b82f6] shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
        </div>
      </div>

      {/* Board */}
      <div
        className="relative rounded-2xl p-2 shadow-[0_0_30px_rgba(0,0,0,0.4)] bg-[#1a365d]"
      >
        {/* Column hover indicators */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {Array.from({ length: COLS }).map((_, col) => (
            <div key={`indicator-${col}`} className="flex justify-center h-6">
              {hoverCol === col && isMyTurn && board[0][col] === EMPTY && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 0.7, y: 0 }}
                  className={`w-8 h-8 rounded-full -mt-1 ${myPlayer === P1 ? 'bg-[#f37021]' : 'bg-[#3b82f6]'}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-1">
          {board.map((row, r) =>
            row.map((cell, c) => {
              const isLastDrop = lastDrop?.row === r && lastDrop?.col === c
              const isPreview = hoverCol === c && cell === EMPTY && getPreviewRow(c) === r && isMyTurn

              return (
                <motion.button
                  key={`${r}-${c}`}
                  onClick={() => dropPiece(c)}
                  onMouseEnter={() => setHoverCol(c)}
                  onMouseLeave={() => setHoverCol(null)}
                  disabled={!isMyTurn || board[0][c] !== EMPTY}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full relative flex items-center justify-center bg-[#0f2847] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
                  whileHover={isMyTurn && cell === EMPTY ? { scale: 1.05 } : {}}
                  whileTap={isMyTurn && cell === EMPTY ? { scale: 0.95 } : {}}
                >
                  <AnimatePresence>
                    {cell !== EMPTY && (
                      <motion.div
                        initial={isLastDrop ? { y: -(r + 1) * 48, opacity: 0 } : { opacity: 1 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={isLastDrop ? { type: 'spring', bounce: 0.4, duration: 0.6 } : { duration: 0 }}
                        className={`absolute inset-1 rounded-full ${
                          cell === P1
                            ? 'bg-[#f37021] shadow-[0_2px_8px_rgba(243,112,33,0.4)]'
                            : 'bg-[#3b82f6] shadow-[0_2px_8px_rgba(59,130,246,0.4)]'
                        }`}
                      />
                    )}
                    {isPreview && cell === EMPTY && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.2 }}
                        exit={{ opacity: 0 }}
                        className={`absolute inset-1 rounded-full ${myPlayer === P1 ? 'bg-[#f37021]' : 'bg-[#3b82f6]'}`}
                      />
                    )}
                  </AnimatePresence>
                </motion.button>
              )
            })
          )}
        </div>
      </div>

      {/* Winner / Draw Actions */}
      <AnimatePresence>
        {(winner || isDraw) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-2"
          >
            {winner && (
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#f37021]" />
                <span className="text-lg font-black text-white">
                  {winner === myPlayer ? 'You win! 🎉' : 'Opponent wins!'}
                </span>
              </div>
            )}
            {isDraw && (
              <span className="text-lg font-bold text-stone-400">Draw! 🤝</span>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetGame}
              className="px-6 py-2 bg-[#f37021] hover:bg-[#e0661e] text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-[#f37021]/20"
            >
              <RotateCcw className="w-4 h-4" /> Play Again
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
