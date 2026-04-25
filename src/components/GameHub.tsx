'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Gamepad2, Grid3X3, Sparkles, Trophy, X, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import ConnectFour from './games/ConnectFour'
import TicTacToe from './games/TicTacToe'
import ReactionRace from './games/ReactionRace'
import Scratchpad from './games/Scratchpad'
import MemoryMatch from './games/MemoryMatch'
import RockPaperScissors from './games/RockPaperScissors'
import TypingRace from './games/TypingRace'

type GameId = 'connect4' | 'tictactoe' | 'reaction' | 'memory' | 'rps' | 'typing' | 'scratchpad'

const GAMES: { id: GameId; name: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'connect4', name: 'Connect Four', icon: <Gamepad2 className="w-5 h-5" />, desc: 'Drop 4 in a row' },
  { id: 'tictactoe', name: 'Tic-Tac-Toe', icon: <Grid3X3 className="w-5 h-5" />, desc: 'X vs O strategy' },
  { id: 'memory', name: 'Memory Match', icon: <span className="text-xl">🎴</span>, desc: 'Find the pairs' },
  { id: 'typing', name: 'Typing Race', icon: <span className="text-xl">⌨️</span>, desc: 'Speed typing' },
  { id: 'rps', name: 'R-P-S', icon: <span className="text-xl">✌️</span>, desc: 'Rock Paper Scissors' },
  { id: 'reaction', name: 'Reaction Race', icon: <Zap className="w-5 h-5" />, desc: 'Speed test' },
  { id: 'scratchpad', name: 'Scratchpad', icon: <span className="text-xl">📝</span>, desc: 'Real-time editor' },
]

export default function GameHub({
  gameState,
  sendGameState,
  currentUserRole,
}: {
  gameState: any
  sendGameState: (state: any) => void
  currentUserRole: 'uploader' | 'downloader'
}): React.ReactElement | null {
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
  }, [gameState, currentUserRole])

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
        className="fixed bottom-24 right-6 p-3.5 bg-[#f37021] text-white rounded-2xl shadow-lg shadow-[#f37021]/20 hover:bg-[#e0661e] hover:shadow-[#f37021]/40 transition-all z-40 group"
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
            <div className="surface rounded-3xl p-6 relative max-w-4xl w-full flex flex-col items-center max-h-[90vh] overflow-y-auto border border-[#f37021]/20">
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(243,112,33,0.16),transparent_50%)]" />
              <button
                onClick={() => { setIsOpen(false); setActiveGame(null) }}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-200 z-10"
              >
                <X className="w-6 h-6" />
              </button>

              {!activeGame ? (
                <>
                  <h2 className="text-3xl md:text-4xl font-black text-white mb-2 flex items-center gap-3 z-10">
                    <span className="p-2 bg-[#f37021]/20 text-[#f37021] rounded-xl">
                      <Gamepad2 className="w-6 h-6" />
                    </span>
                    Game Lobby
                  </h2>
                  <p className="text-stone-300 text-sm md:text-base mb-4 text-center z-10">
                    Bored waiting for the transfer? Challenge your peer to a quick match!
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full mb-6 z-10">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-left">
                      <div className="inline-flex items-center gap-2 text-sm font-semibold text-stone-100">
                        <Sparkles className="w-4 h-4 text-[#f37021]" />
                        Instant Match
                      </div>
                      <p className="text-xs text-stone-400 mt-2">
                        Send an invite and start as soon as your peer accepts.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-left">
                      <div className="inline-flex items-center gap-2 text-sm font-semibold text-stone-100">
                        <Trophy className="w-4 h-4 text-[#f37021]" />
                        Keep It Competitive
                      </div>
                      <p className="text-xs text-stone-400 mt-2">
                        Play while files transfer, no extra setup needed.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-left">
                      <div className="inline-flex items-center gap-2 text-sm font-semibold text-stone-100">
                        <Zap className="w-4 h-4 text-[#f37021]" />
                        Real-time Sync
                      </div>
                      <p className="text-xs text-stone-400 mt-2">
                        Moves are synced over your active peer connection.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 w-full mb-4 z-10">
                    {GAMES.map(g => (
                      <motion.button
                        key={g.id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => selectGame(g.id)}
                        className="flex flex-col items-center gap-2 p-5 rounded-2xl border border-white/10 bg-stone-900/60 hover:border-[#f37021]/40 hover:bg-stone-800/80 hover:shadow-[0_20px_50px_-30px_rgba(243,112,33,0.9)] transition-all"
                      >
                        <div className="text-[#f37021]">{g.icon}</div>
                        <span className="text-stone-100 font-semibold text-sm text-center">{g.name}</span>
                        <span className="text-stone-400 text-xs text-center">{g.desc}</span>
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

                  {activeGame === 'connect4' && (
                    <ConnectFour gameState={gameState} sendGameState={sendGameState} currentUserRole={currentUserRole} />
                  )}
                  {activeGame === 'tictactoe' && (
                    <TicTacToe gameState={gameState} sendGameState={sendGameState} currentUserRole={currentUserRole} />
                  )}
                  {activeGame === 'reaction' && (
                    <ReactionRace gameState={gameState} sendGameState={sendGameState} currentUserRole={currentUserRole} />
                  )}
                  {activeGame === 'memory' && (
                    <MemoryMatch gameState={gameState} sendGameState={sendGameState} currentUserRole={currentUserRole} />
                  )}
                  {activeGame === 'rps' && (
                    <RockPaperScissors gameState={gameState} sendGameState={sendGameState} currentUserRole={currentUserRole} />
                  )}
                  {activeGame === 'typing' && (
                    <TypingRace gameState={gameState} sendGameState={sendGameState} currentUserRole={currentUserRole} />
                  )}
                  {activeGame === 'scratchpad' && (
                    <Scratchpad gameState={gameState} sendGameState={sendGameState} currentUserRole={currentUserRole} />
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
