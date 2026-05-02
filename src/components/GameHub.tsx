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

const GAMES: { id: GameId; name: string; icon: React.ReactNode; desc: string; color: string }[] = [
  { id: 'connect4', name: 'Connect Four', icon: <Gamepad2 className="w-6 h-6" strokeWidth={3} />, desc: 'Drop 4 in a row', color: 'bg-bauhaus-red' },
  { id: 'tictactoe', name: 'Tic-Tac-Toe', icon: <Grid3X3 className="w-6 h-6" strokeWidth={3} />, desc: 'X vs O strategy', color: 'bg-bauhaus-blue' },
  { id: 'memory', name: 'Memory Match', icon: <span className="text-2xl">🎴</span>, desc: 'Find the pairs', color: 'bg-bauhaus-yellow text-primary' },
  { id: 'typing', name: 'Typing Race', icon: <span className="text-2xl">⌨️</span>, desc: 'Speed typing', color: 'bg-white text-primary' },
  { id: 'rps', name: 'R-P-S', icon: <span className="text-2xl">✌️</span>, desc: 'Rock Paper Scissors', color: 'bg-bauhaus-red' },
  { id: 'reaction', name: 'Reaction Race', icon: <Zap className="w-6 h-6" strokeWidth={3} />, desc: 'Speed test', color: 'bg-bauhaus-yellow text-primary' },
  { id: 'scratchpad', name: 'Scratchpad', icon: <span className="text-2xl">📝</span>, desc: 'Real-time editor', color: 'bg-bauhaus-blue' },
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

  useEffect(() => {
    if (!gameState) return

    if (gameState.type === 'game-invite' && gameState.from !== currentUserRole) {
      const gameName = GAMES.find(g => g.id === gameState.gameId)?.name || gameState.gameId

      if (activeGame && isOpen) {
        sendGameState({ type: 'game-busy', gameId: gameState.gameId, from: currentUserRole })
        toast(`Declined invite to ${gameName} — already in a game`, {
          icon: '🎮',
          style: { background: 'var(--bg-card)', color: 'var(--primary)', border: '4px solid var(--border-strong)', borderRadius: '0', boxShadow: '4px 4px 0px 0px var(--shadow-color)' },
        })
        return
      }

      toast((t) => (
        <div className="flex items-center gap-3">
          <Gamepad2 className="w-6 h-6 text-bauhaus-blue shrink-0" strokeWidth={3} />
          <div className="flex-1">
            <p className="font-black uppercase tracking-widest text-sm">Game invite!</p>
            <p className="text-xs font-bold uppercase tracking-widest text-muted">Play {gameName}?</p>
          </div>
          <button
            onClick={() => {
              setActiveGame(gameState.gameId)
              setIsOpen(true)
              sendGameState({ type: 'game-accept', gameId: gameState.gameId, from: currentUserRole })
              toast.dismiss(t.id)
            }}
            className="px-4 py-2 bg-bauhaus-yellow border-2 border-[var(--border-strong)] text-primary text-xs font-black uppercase tracking-widest hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--shadow-color)] transition-all"
          >
            Join
          </button>
          <button onClick={() => {
            sendGameState({ type: 'game-busy', gameId: gameState.gameId, from: currentUserRole })
            toast.dismiss(t.id)
          }} className="text-muted hover:text-primary transition-colors">
            <X className="w-5 h-5" strokeWidth={3} />
          </button>
        </div>
      ), { duration: 15000, style: { background: 'var(--bg-card)', border: '4px solid var(--border-strong)', color: 'var(--primary)', borderRadius: '0', boxShadow: '8px 8px 0px 0px var(--shadow-color)' } })
    }

    if (gameState.type === 'game-accept' && gameState.from !== currentUserRole) {
      setActiveGame(gameState.gameId)
      setIsOpen(true)
      toast.success(`Opponent joined ${GAMES.find(g => g.id === gameState.gameId)?.name}!`, {
        style: { background: 'var(--bg-card)', color: 'var(--primary)', border: '4px solid var(--border-strong)', borderRadius: '0', boxShadow: '4px 4px 0px 0px var(--shadow-color)' },
      })
    }

    if (gameState.type === 'game-busy' && gameState.from !== currentUserRole) {
      const gameName = GAMES.find(g => g.id === gameState.gameId)?.name || gameState.gameId
      toast.error(`Opponent is busy — can't join ${gameName}`, {
        icon: '🚫',
        style: { background: 'var(--bg-card)', color: 'var(--primary)', border: '4px solid var(--border-strong)', borderRadius: '0', boxShadow: '4px 4px 0px 0px var(--shadow-color)' },
      })
    }
  }, [gameState, currentUserRole, activeGame, isOpen])

  const selectGame = useCallback((id: GameId) => {
    setActiveGame(id)
    sendGameState({ type: 'game-invite', gameId: id, from: currentUserRole })
    toast('Invite sent! Waiting for opponent...', {
      icon: '🎮',
      style: { background: 'var(--bg-card)', color: 'var(--primary)', border: '4px solid var(--border-strong)', borderRadius: '0', boxShadow: '4px 4px 0px 0px var(--shadow-color)' },
    })
  }, [sendGameState, currentUserRole])

  if (typeof document === 'undefined') return null

  return createPortal(
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 p-4 bg-bauhaus-blue border-4 border-[var(--border-strong)] text-white shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_var(--shadow-color)] transition-all z-40 group flex items-center gap-2"
        title="Play games while you wait"
      >
        <Gamepad2 className="w-6 h-6" strokeWidth={3} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-muted)]/80 backdrop-blur-sm p-4"
          >
            <div className="bg-[var(--bg-card)] border-4 border-[var(--border-strong)] shadow-[8px_8px_0px_0px_var(--shadow-color)] p-6 md:p-8 max-w-4xl w-full flex flex-col max-h-[90vh] overflow-y-auto relative">
              <button
                onClick={() => { setIsOpen(false); setActiveGame(null) }}
                className="absolute top-6 right-6 text-primary hover:scale-110 transition-transform z-10"
              >
                <X className="w-8 h-8" strokeWidth={3} />
              </button>

              {!activeGame ? (
                <>
                  <div className="flex items-center gap-4 mb-6 border-b-4 border-[var(--border-strong)] pb-4">
                    <div className="p-3 bg-bauhaus-blue border-4 border-[var(--border-strong)] text-white shadow-[4px_4px_0px_0px_var(--shadow-color)]">
                      <Gamepad2 className="w-8 h-8" strokeWidth={3} />
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-widest text-primary">
                      Game Lobby
                    </h2>
                  </div>
                  <p className="text-muted font-bold text-sm uppercase tracking-widest mb-6">
                    Bored waiting for the transfer? Challenge your peer to a quick match!
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-8">
                    <div className="border-4 border-[var(--border-strong)] bg-bauhaus-yellow p-4 shadow-[4px_4px_0px_0px_var(--shadow-color)] text-primary">
                      <div className="inline-flex items-center gap-3 font-black uppercase tracking-widest border-b-2 border-[var(--border-strong)] pb-1 mb-2">
                        <Sparkles className="w-5 h-5" strokeWidth={3} />
                        Instant Match
                      </div>
                      <p className="text-xs font-bold uppercase tracking-widest">
                        Send an invite and start as soon as your peer accepts.
                      </p>
                    </div>
                    <div className="border-4 border-[var(--border-strong)] bg-[var(--bg-elevated)] p-4 shadow-[4px_4px_0px_0px_var(--shadow-color)] text-primary">
                      <div className="inline-flex items-center gap-3 font-black uppercase tracking-widest border-b-2 border-primary pb-1 mb-2">
                        <Trophy className="w-5 h-5" strokeWidth={3} />
                        Keep It Competitive
                      </div>
                      <p className="text-xs font-bold uppercase tracking-widest">
                        Play while files transfer, no extra setup needed.
                      </p>
                    </div>
                    <div className="border-4 border-[var(--border-strong)] bg-bauhaus-red p-4 shadow-[4px_4px_0px_0px_var(--shadow-color)] text-white">
                      <div className="inline-flex items-center gap-3 font-black uppercase tracking-widest border-b-2 border-white pb-1 mb-2">
                        <Zap className="w-5 h-5" strokeWidth={3} />
                        Real-time Sync
                      </div>
                      <p className="text-xs font-bold uppercase tracking-widest">
                        Moves are synced over your active peer connection.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
                    {GAMES.map(g => (
                      <button
                        key={g.id}
                        onClick={() => selectGame(g.id)}
                        className={`flex flex-col items-center gap-3 p-6 border-4 border-[var(--border-strong)] shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_var(--shadow-color)] transition-all ${g.color} ${!g.color.includes('text-') ? 'text-white' : ''}`}
                      >
                        <div className="mb-2 bg-white/20 p-3 border-2 border-current rounded-full">{g.icon}</div>
                        <span className="font-black text-sm text-center uppercase tracking-widest">{g.name}</span>
                        <span className="font-bold text-xs text-center opacity-80 uppercase">{g.desc}</span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-4 mb-6 w-full border-b-4 border-[var(--border-strong)] pb-4">
                    <button onClick={() => setActiveGame(null)} className="btn btn-ghost font-black uppercase tracking-widest text-xs border-2 border-[var(--border-strong)] bg-bauhaus-yellow text-primary hover:-translate-y-0.5 shadow-[2px_2px_0px_0px_var(--shadow-color)]">
                      ← Back
                    </button>
                    <h2 className="text-2xl font-black uppercase tracking-widest text-primary flex-1 text-center pr-16">
                      {GAMES.find(g => g.id === activeGame)?.name}
                    </h2>
                  </div>

                  <div className="flex-1 w-full bg-[var(--bg-elevated)] border-4 border-[var(--border-strong)] p-4 shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col min-h-[500px]">
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
                  </div>
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
// .
// .
// .
// .
// .
// .
