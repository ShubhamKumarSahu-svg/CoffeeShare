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

function checkWinner(board: Board): number | null {
  // Horizontal
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const v = board[r][c]
      if (v !== EMPTY && v === board[r][c+1] && v === board[r][c+2] && v === board[r][c+3]) return v
    }
  }
  // Vertical
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 0; c < COLS; c++) {
      const v = board[r][c]
      if (v !== EMPTY && v === board[r+1][c] && v === board[r+2][c] && v === board[r+3][c]) return v
    }
  }
  // Diagonal ↘
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const v = board[r][c]
      if (v !== EMPTY && v === board[r+1][c+1] && v === board[r+2][c+2] && v === board[r+3][c+3]) return v
    }
  }
  // Diagonal ↙
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 3; c < COLS; c++) {
      const v = board[r][c]
      if (v !== EMPTY && v === board[r+1][c-1] && v === board[r+2][c-2] && v === board[r+3][c-3]) return v
    }
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
  const [currentTurn, setCurrentTurn] = useState<number>(P1) // P1 goes first
  const [winner, setWinner] = useState<number | null>(null)
  const [isDraw, setIsDraw] = useState(false)
  const [lastDrop, setLastDrop] = useState<{ row: number; col: number } | null>(null)
  const [hoverCol, setHoverCol] = useState<number | null>(null)
  const [scores, setScores] = useState<[number, number]>([0, 0])

  const myPlayer = currentUserRole === 'uploader' ? P1 : P2
  const isMyTurn = currentTurn === myPlayer && !winner && !isDraw

  // Handle incoming game state from opponent
  useEffect(() => {
    if (!gameState) return
    if (gameState.game !== 'connect4') return

    if (gameState.type === 'move') {
      const { col, player } = gameState
      setBoard(prev => {
        const newBoard = prev.map(r => [...r])
        for (let row = ROWS - 1; row >= 0; row--) {
          if (newBoard[row][col] === EMPTY) {
            newBoard[row][col] = player
            setLastDrop({ row, col })
            
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
            break
          }
        }
        setCurrentTurn(player === P1 ? P2 : P1)
        return newBoard
      })
    } else if (gameState.type === 'reset') {
      setBoard(createEmptyBoard())
      setCurrentTurn(P1)
      setWinner(null)
      setIsDraw(false)
      setLastDrop(null)
    }
  }, [gameState])

  const dropPiece = useCallback((col: number) => {
    if (!isMyTurn) return
    if (board[0][col] !== EMPTY) return // Column full

    const newBoard = board.map(r => [...r])
    for (let row = ROWS - 1; row >= 0; row--) {
      if (newBoard[row][col] === EMPTY) {
        newBoard[row][col] = myPlayer
        setLastDrop({ row, col })

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
        break
      }
    }

    setBoard(newBoard)
    setCurrentTurn(myPlayer === P1 ? P2 : P1)
    sendGameState({ game: 'connect4', type: 'move', col, player: myPlayer })
  }, [board, isMyTurn, myPlayer, sendGameState])

  const resetGame = useCallback(() => {
    setBoard(createEmptyBoard())
    setCurrentTurn(P1)
    setWinner(null)
    setIsDraw(false)
    setLastDrop(null)
    sendGameState({ game: 'connect4', type: 'reset' })
  }, [sendGameState])

  const getStatusText = () => {
    if (winner) {
      const name = winner === myPlayer ? 'You win!' : 'Opponent wins!'
      return name
    }
    if (isDraw) return "It's a draw!"
    return isMyTurn ? 'Your turn — drop a piece!' : "Opponent's turn..."
  }

  const getPreviewRow = (col: number): number | null => {
    for (let row = ROWS - 1; row >= 0; row--) {
      if (board[row][col] === EMPTY) return row
    }
    return null
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
        className="relative rounded-2xl p-2 shadow-[0_0_30px_rgba(0,0,0,0.4)]"
        style={{ background: 'linear-gradient(135deg, #1e3a5f, #1a365d)' }}
      >
        {/* Column hover indicators */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {Array.from({ length: COLS }).map((_, col) => (
            <div key={`indicator-${col}`} className="flex justify-center h-6">
              {hoverCol === col && isMyTurn && board[0][col] === EMPTY && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 0.7, y: 0 }}
                  className="w-8 h-8 rounded-full -mt-1"
                  style={{
                    background: myPlayer === P1
                      ? 'radial-gradient(circle at 35% 35%, #ff8c42, #f37021)'
                      : 'radial-gradient(circle at 35% 35%, #60a5fa, #3b82f6)',
                  }}
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
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full relative flex items-center justify-center transition-transform"
                  style={{
                    background: 'radial-gradient(circle at 45% 45%, #0f2847, #0a1929)',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5), inset 0 -1px 2px rgba(255,255,255,0.05)',
                  }}
                  whileHover={isMyTurn && cell === EMPTY ? { scale: 1.05 } : {}}
                  whileTap={isMyTurn && cell === EMPTY ? { scale: 0.95 } : {}}
                >
                  <AnimatePresence>
                    {cell !== EMPTY && (
                      <motion.div
                        initial={isLastDrop ? { y: -(r + 1) * 48, opacity: 0 } : { opacity: 1 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={isLastDrop ? { type: 'spring', bounce: 0.4, duration: 0.6 } : { duration: 0 }}
                        className="absolute inset-1 rounded-full"
                        style={{
                          background: cell === P1
                            ? 'radial-gradient(circle at 35% 35%, #ff8c42, #f37021, #c2540a)'
                            : 'radial-gradient(circle at 35% 35%, #60a5fa, #3b82f6, #1d4ed8)',
                          boxShadow: cell === P1
                            ? '0 2px 8px rgba(243,112,33,0.4), inset 0 1px 2px rgba(255,255,255,0.3)'
                            : '0 2px 8px rgba(59,130,246,0.4), inset 0 1px 2px rgba(255,255,255,0.3)',
                        }}
                      />
                    )}
                    {isPreview && cell === EMPTY && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.2 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-1 rounded-full"
                        style={{
                          background: myPlayer === P1
                            ? 'radial-gradient(circle at 35% 35%, #ff8c42, #f37021)'
                            : 'radial-gradient(circle at 35% 35%, #60a5fa, #3b82f6)',
                        }}
                      />
                    )}
                  </AnimatePresence>
                </motion.button>
              )
            })
          )}
        </div>
      </div>

      {/* Winner / Draw Overlay Actions */}
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
              className="px-6 py-2 bg-gradient-to-r from-[#f37021] to-[#e0661e] text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-[#f37021]/20"
            >
              <RotateCcw className="w-4 h-4" /> Play Again
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
