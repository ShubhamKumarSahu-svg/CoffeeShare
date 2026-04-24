'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Gamepad2, X, Zap, Grid3X3 } from 'lucide-react'
import toast from 'react-hot-toast'
import CoffeePongGame from './games/CoffeePongGame'
import TicTacToe from './games/TicTacToe'
import ReactionRace from './games/ReactionRace'

type GameId = 'pong' | 'tictactoe' | 'reaction'

const GAMES: { id: GameId; name: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'pong', name: 'Coffee Pong', icon: <Gamepad2 className="w-5 h-5" />, desc: 'Classic paddle game' },
  { id: 'tictactoe', name: 'Tic-Tac-Toe', icon: <Grid3X3 className="w-5 h-5" />, desc: 'X vs O strategy' },
  { id: 'reaction', name: 'Reaction Race', icon: <Zap className="w-5 h-5" />, desc: 'Speed test' },
]

export default function GameHub({
  gameState,
  sendGameState,
  currentUserRole,
}: {
  gameState: any
  sendGameState: (state: any) => void
  currentUserRole: 'uploader' | 'downloader'
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeGame, setActiveGame] = useState<GameId | null>(null)

  // Handle game invite toasts
  useEffect(() => {
    if (!gameState) return
    if (gameState.type === 'game-invite' && gameState.from !== currentUserRole) {
      const gameName = GAMES.find(g => g.id === gameState.gameId)?.name || gameState.gameId
      toast((t) => (
        <div className="flex items-center gap-3">
          <Gamepad2 className="w-5 h-5 text-[#f37021] shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-sm">Game invite!</p>
            <p className="text-xs text-stone-400">Play {gameName}?</p>
          </div>
          <button
            onClick={() => {
              setActiveGame(gameState.gameId)
              setIsOpen(true)
              sendGameState({ type: 'game-accept', gameId: gameState.gameId, from: currentUserRole })
              toast.dismiss(t.id)
            }}
            className="px-3 py-1.5 bg-[#f37021] text-white text-xs font-bold rounded-lg hover:bg-[#e0661e]"
          >
            Join
          </button>
          <button onClick={() => toast.dismiss(t.id)} className="text-stone-500 hover:text-stone-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      ), { duration: 15000, style: { background: '#1c1917', border: '1px solid rgba(243,112,33,0.3)', color: '#f5f5f4' } })
    }
    if (gameState.type === 'game-accept' && gameState.from !== currentUserRole) {
      setActiveGame(gameState.gameId)
      setIsOpen(true)
      toast.success(`Opponent joined ${GAMES.find(g => g.id === gameState.gameId)?.name}!`, {
        style: { background: '#1c1917', color: '#f5f5f4', border: '1px solid rgba(255,255,255,0.05)' },
      })
    }
  }, [gameState, currentUserRole, sendGameState])

  const selectGame = useCallback((id: GameId) => {
    setActiveGame(id)
    sendGameState({ type: 'game-invite', gameId: id, from: currentUserRole })
    toast('Invite sent! Waiting for opponent...', {
      icon: '🎮',
      style: { background: '#1c1917', color: '#f5f5f4', border: '1px solid rgba(255,255,255,0.05)' },
    })
  }, [sendGameState, currentUserRole])

  if (typeof document === 'undefined') return null

  return createPortal(
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 p-3.5 bg-gradient-to-br from-[#f37021] to-[#e0661e] text-white rounded-2xl shadow-lg shadow-[#f37021]/20 hover:shadow-[#f37021]/40 transition-shadow z-40 group"
        title="Play games while you wait"
      >
        <Gamepad2 className="w-6 h-6" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-4"
          >
            <div className="surface rounded-3xl p-6 relative max-w-lg w-full flex flex-col items-center max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => { setIsOpen(false); setActiveGame(null) }}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-200 z-10"
              >
                <X className="w-6 h-6" />
              </button>

              {!activeGame ? (
                <>
                  <h2 className="text-xl font-bold text-stone-100 mb-1 flex items-center gap-2">
                    <Gamepad2 className="text-[#f37021] w-5 h-5" />
                    Game Lobby
                  </h2>
                  <p className="text-stone-400 text-sm mb-6">
                    Pick a game to play with your peer via WebRTC
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                    {GAMES.map(g => (
                      <motion.button
                        key={g.id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => selectGame(g.id)}
                        className="flex flex-col items-center gap-2 p-5 rounded-2xl border-2 border-stone-700 bg-stone-800/50 hover:border-[#f37021]/50 hover:bg-[#f37021]/5 transition-all"
                      >
                        <div className="text-[#f37021]">{g.icon}</div>
                        <span className="text-stone-200 font-semibold text-sm">{g.name}</span>
                        <span className="text-stone-500 text-xs">{g.desc}</span>
                      </motion.button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-4 w-full">
                    <button onClick={() => setActiveGame(null)} className="text-stone-400 hover:text-[#f37021] text-sm font-medium">
                      ← Back
                    </button>
                    <h2 className="text-lg font-bold text-stone-100 flex-1 text-center">
                      {GAMES.find(g => g.id === activeGame)?.name}
                    </h2>
                    <div className="w-12" />
                  </div>

                  {activeGame === 'pong' && (
                    <CoffeePongGame gameState={gameState} sendGameState={sendGameState} currentUserRole={currentUserRole} isOpen={isOpen} />
                  )}
                  {activeGame === 'tictactoe' && (
                    <TicTacToe gameState={gameState} sendGameState={sendGameState} currentUserRole={currentUserRole} />
                  )}
                  {activeGame === 'reaction' && (
                    <ReactionRace gameState={gameState} sendGameState={sendGameState} currentUserRole={currentUserRole} />
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>,
    document.body,
  )
}
