'use client'
import React, { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Trophy } from 'lucide-react'

interface PongState {
  status: 'waiting' | 'countdown' | 'playing'
  countdown: number | null
  p1Ready: boolean
  p2Ready: boolean
  ball: { x: number; y: number }
  paddle1: number
  paddle2: number
  score: [number, number]
}

// Fixed timestep = 60 physics ticks per second (16.67ms each)
// This ensures the same physics regardless of monitor refresh rate
const PHYSICS_DT = 1000 / 60
const GAME_WIDTH = 400
const GAME_HEIGHT = 300
const PADDLE_HEIGHT = 60
const PADDLE_WIDTH = 10
const BALL_SIZE = 12
const WIN_SCORE = 10
const BASE_SPEED = 240 // pixels per second

export default function CoffeePongGame({
  gameState,
  sendGameState,
  currentUserRole,
  isOpen,
}: {
  gameState: any
  sendGameState: (state: any) => void
  currentUserRole: 'uploader' | 'downloader'
  isOpen: boolean
}) {
  const hostState = useRef<{
    status: 'waiting' | 'countdown' | 'playing'
    countdownValue: number | null
    p1Ready: boolean
    p2Ready: boolean
    ball: { x: number; y: number }
    velocity: { x: number; y: number }
    paddle1: number
    paddle2: number
    score: [number, number]
    lastSyncTime: number
    lastFrameTime: number
    accumulator: number
  }>({
    status: 'waiting',
    countdownValue: null,
    p1Ready: false,
    p2Ready: false,
    ball: { x: GAME_WIDTH / 2 - BALL_SIZE / 2, y: GAME_HEIGHT / 2 - BALL_SIZE / 2 },
    velocity: { x: BASE_SPEED, y: BASE_SPEED * 0.6 },
    paddle1: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    paddle2: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    score: [0, 0],
    lastSyncTime: 0,
    lastFrameTime: 0,
    accumulator: 0,
  })

  const [renderState, setRenderState] = useState<PongState>({
    status: 'waiting',
    countdown: null,
    p1Ready: false,
    p2Ready: false,
    ball: { x: GAME_WIDTH / 2 - BALL_SIZE / 2, y: GAME_HEIGHT / 2 - BALL_SIZE / 2 },
    paddle1: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    paddle2: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    score: [0, 0],
  })

  // Downloader prediction state
  const downloaderState = useRef({
    ball: { x: GAME_WIDTH / 2 - BALL_SIZE / 2, y: GAME_HEIGHT / 2 - BALL_SIZE / 2 },
    velocity: { x: 0, y: 0 }
  })

  const [winner, setWinner] = useState<string | null>(null)

  const startCountdown = useCallback(() => {
    const st = hostState.current
    if (st.status === 'countdown') return
    st.status = 'countdown'
    st.countdownValue = 3
    const tick = () => {
      if (hostState.current.countdownValue === 1) {
        hostState.current.status = 'playing'
        hostState.current.countdownValue = null
        hostState.current.lastFrameTime = performance.now()
        hostState.current.accumulator = 0
      } else if (hostState.current.countdownValue !== null) {
        hostState.current.countdownValue--
        setTimeout(tick, 1000)
      }
    }
    setTimeout(tick, 1000)
  }, [])

  // Handle incoming game state
  useEffect(() => {
    if (!gameState || gameState.game === 'tictactoe' || gameState.game === 'reaction') return
    if (gameState.type === 'game-invite' || gameState.type === 'game-accept') return
    if (currentUserRole === 'downloader') {
      if (gameState.type === 'sync') {
        downloaderState.current.ball = gameState.ball
        downloaderState.current.velocity = gameState.velocity

        setRenderState(prev => ({
          status: gameState.status,
          countdown: gameState.countdown,
          p1Ready: gameState.p1Ready,
          p2Ready: gameState.p2Ready,
          ball: gameState.ball,
          paddle1: gameState.paddle1,
          paddle2: prev.paddle2,
          score: gameState.score,
        }))
        if (gameState.winner) setWinner(gameState.winner)
      }
    } else {
      if (gameState.type === 'paddle') {
        hostState.current.paddle2 = gameState.paddle2
        if (gameState.p2Ready) hostState.current.p2Ready = true
        setRenderState(prev => ({ ...prev, paddle2: gameState.paddle2, p2Ready: hostState.current.p2Ready }))
        if (hostState.current.p1Ready && hostState.current.p2Ready && hostState.current.status === 'waiting') startCountdown()
      } else if (gameState.type === 'ready') {
        hostState.current.p2Ready = true
        setRenderState(prev => ({ ...prev, p2Ready: true }))
        if (hostState.current.p1Ready && hostState.current.status === 'waiting') startCountdown()
      }
    }
  }, [gameState, currentUserRole, startCountdown])

  // Client-side prediction for downloader to eliminate jitter
  useEffect(() => {
    if (currentUserRole !== 'downloader' || !isOpen) return
    let animationFrameId: number
    let lastTime = performance.now()

    const predictLoop = (now: number) => {
      const dt = (now - lastTime) / 1000
      lastTime = now

      if (renderState.status === 'playing') {
        const dState = downloaderState.current
        dState.ball.x += dState.velocity.x * dt
        dState.ball.y += dState.velocity.y * dt

        // Basic boundary prediction (purely visual)
        if (dState.ball.y <= 0 || dState.ball.y >= GAME_HEIGHT - BALL_SIZE) {
          dState.velocity.y *= -1
          dState.ball.y = Math.max(0, Math.min(GAME_HEIGHT - BALL_SIZE, dState.ball.y))
        }

        setRenderState(prev => ({ ...prev, ball: { ...dState.ball } }))
      }

      animationFrameId = requestAnimationFrame(predictLoop)
    }

    animationFrameId = requestAnimationFrame(predictLoop)
    return () => cancelAnimationFrame(animationFrameId)
  }, [currentUserRole, isOpen, renderState.status])

  // Fixed-timestep game loop (eliminates jitter on all refresh rates)
  useEffect(() => {
    if (currentUserRole !== 'uploader' || !isOpen) return
    let animationFrameId: number
    hostState.current.lastFrameTime = performance.now()

    const physicsTick = (dt: number) => {
      const state = hostState.current
      if (state.status !== 'playing') return

      // Convert velocity from px/sec to px/tick
      const dtSec = dt / 1000
      state.ball.x += state.velocity.x * dtSec
      state.ball.y += state.velocity.y * dtSec

      // Wall bounce
      if (state.ball.y <= 0) {
        state.ball.y = 0
        state.velocity.y = Math.abs(state.velocity.y)
      } else if (state.ball.y >= GAME_HEIGHT - BALL_SIZE) {
        state.ball.y = GAME_HEIGHT - BALL_SIZE
        state.velocity.y = -Math.abs(state.velocity.y)
      }

      // Paddle collision
      const hitLeft = state.ball.x <= PADDLE_WIDTH && state.ball.y + BALL_SIZE >= state.paddle1 && state.ball.y <= state.paddle1 + PADDLE_HEIGHT
      const hitRight = state.ball.x >= GAME_WIDTH - PADDLE_WIDTH - BALL_SIZE && state.ball.y + BALL_SIZE >= state.paddle2 && state.ball.y <= state.paddle2 + PADDLE_HEIGHT

      if (hitLeft || hitRight) {
        state.velocity.x *= -1.02 // slight speed up on hit
        const paddleCenter = hitLeft ? state.paddle1 + PADDLE_HEIGHT / 2 : state.paddle2 + PADDLE_HEIGHT / 2
        const diff = (state.ball.y + BALL_SIZE / 2 - paddleCenter) / (PADDLE_HEIGHT / 2)
        state.velocity.y = diff * Math.abs(state.velocity.x) * 0.75
        // Prevent ball from getting stuck inside paddle
        if (hitLeft) state.ball.x = PADDLE_WIDTH + 1
        else state.ball.x = GAME_WIDTH - PADDLE_WIDTH - BALL_SIZE - 1
      }

      // Scoring
      if (state.ball.x <= -BALL_SIZE) {
        state.score[1]++
        resetBall()
      } else if (state.ball.x >= GAME_WIDTH) {
        state.score[0]++
        resetBall()
      }
    }

    const resetBall = () => {
      const state = hostState.current
      state.ball = { x: GAME_WIDTH / 2 - BALL_SIZE / 2, y: GAME_HEIGHT / 2 - BALL_SIZE / 2 }
      const dir = state.velocity.x > 0 ? -1 : 1
      state.velocity = { x: BASE_SPEED * dir, y: (Math.random() - 0.5) * BASE_SPEED * 0.8 }
      if (state.score[0] >= WIN_SCORE || state.score[1] >= WIN_SCORE) {
        state.status = 'waiting'
        const w = state.score[0] >= WIN_SCORE ? 'Host' : 'Peer'
        setWinner(w)
      } else {
        startCountdown()
      }
    }

    const gameLoop = (now: number) => {
      const state = hostState.current
      const frameTime = Math.min(now - state.lastFrameTime, 100) // cap to prevent spiral of death
      state.lastFrameTime = now
      state.accumulator += frameTime

      // Run physics in fixed steps
      while (state.accumulator >= PHYSICS_DT) {
        physicsTick(PHYSICS_DT)
        state.accumulator -= PHYSICS_DT
      }

      // Render
      setRenderState({
        status: state.status,
        countdown: state.countdownValue,
        p1Ready: state.p1Ready,
        p2Ready: state.p2Ready,
        ball: { ...state.ball },
        paddle1: state.paddle1,
        paddle2: state.paddle2,
        score: [...state.score],
      })

      // Network sync at ~30fps
      const syncNow = Date.now()
      if (syncNow - state.lastSyncTime > 33) {
        state.lastSyncTime = syncNow
        sendGameState({
          type: 'sync',
          status: state.status,
          countdown: state.countdownValue,
          p1Ready: state.p1Ready,
          p2Ready: state.p2Ready,
          ball: state.ball,
          velocity: state.velocity,
          paddle1: state.paddle1,
          score: state.score,
          winner: winner,
        })
      }

      animationFrameId = requestAnimationFrame(gameLoop)
    }

    animationFrameId = requestAnimationFrame(gameLoop)
    return () => cancelAnimationFrame(animationFrameId)
  }, [currentUserRole, isOpen, sendGameState, startCountdown, winner])

  const lastMouseSyncTime = useRef(0)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    let relativeY = clientY - rect.top - PADDLE_HEIGHT / 2
    relativeY = Math.max(0, Math.min(GAME_HEIGHT - PADDLE_HEIGHT, relativeY))
    if (currentUserRole === 'uploader') {
      hostState.current.paddle1 = relativeY
      setRenderState(prev => ({ ...prev, paddle1: relativeY }))
    } else {
      setRenderState(prev => {
        const now = Date.now()
        if (now - lastMouseSyncTime.current > 33) {
          lastMouseSyncTime.current = now
          sendGameState({ type: 'paddle', paddle2: relativeY, p2Ready: prev.p2Ready })
        }
        return { ...prev, paddle2: relativeY }
      })
    }
  }, [currentUserRole, sendGameState])

  const handleReady = useCallback(() => {
    setWinner(null)
    if (currentUserRole === 'uploader') {
      hostState.current.p1Ready = true
      hostState.current.score = [0, 0]
      setRenderState(prev => ({ ...prev, p1Ready: true, score: [0, 0] }))
      if (hostState.current.p2Ready && hostState.current.status === 'waiting') startCountdown()
    } else {
      setRenderState(prev => {
        sendGameState({ type: 'paddle', paddle2: prev.paddle2, p2Ready: true })
        return { ...prev, p2Ready: true }
      })
    }
  }, [currentUserRole, sendGameState, startCountdown])

  const isMeReady = currentUserRole === 'uploader' ? renderState.p1Ready : renderState.p2Ready

  // Responsive scaling: scale the fixed-size canvas to fit mobile screens
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [scale, setScale] = React.useState(1)

  React.useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const parentWidth = containerRef.current.parentElement?.clientWidth || GAME_WIDTH
        const maxWidth = Math.min(parentWidth - 16, GAME_WIDTH) // 16px padding
        setScale(maxWidth / GAME_WIDTH)
      }
    }
    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  return (
    <div className="flex flex-col items-center w-full" ref={containerRef}>
      {/* Score Bar */}
      <div className="flex items-center justify-between w-full px-4 mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${currentUserRole === 'uploader' ? 'bg-[#f37021] shadow-[0_0_6px_rgba(243,112,33,0.6)]' : 'bg-stone-600'}`} />
          <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Host</span>
          <span className={`text-2xl font-mono font-black ${currentUserRole === 'uploader' ? 'text-[#f37021]' : 'text-stone-300'}`}>{renderState.score[0]}</span>
        </div>
        <div className="px-3 py-1 rounded-full bg-stone-800/60 border border-stone-700/50">
          <span className="text-xs font-mono text-stone-500">FIRST TO {WIN_SCORE}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-2xl font-mono font-black ${currentUserRole === 'downloader' ? 'text-[#f37021]' : 'text-stone-300'}`}>{renderState.score[1]}</span>
          <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Peer</span>
          <div className={`w-3 h-3 rounded-full ${currentUserRole === 'downloader' ? 'bg-[#f37021] shadow-[0_0_6px_rgba(243,112,33,0.6)]' : 'bg-stone-600'}`} />
        </div>
      </div>

      {/* Game Canvas - scales down on mobile */}
      <div
        className="relative rounded-2xl overflow-hidden cursor-none touch-none shadow-[0_0_30px_rgba(0,0,0,0.4)] border border-stone-800/80"
        style={{
          width: GAME_WIDTH,
          height: GAME_HEIGHT,
          background: 'linear-gradient(135deg, #0c0a09, #1c1917)',
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          marginBottom: scale < 1 ? -(GAME_HEIGHT * (1 - scale)) : 0,
        }}
        onMouseMove={handleMouseMove}
        onTouchMove={handleMouseMove}
      >
        {/* Court Lines */}
        <div className="absolute top-0 bottom-0 left-1/2 w-px" style={{ background: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 8px, rgba(255,255,255,0.08) 8px, rgba(255,255,255,0.08) 16px)' }} />
        <div className="absolute top-1/2 left-1/2 w-16 h-16 -ml-8 -mt-8 rounded-full border border-stone-800/40" />

        {/* Paddles - wider and brighter for visibility */}
        <div
          className={`absolute left-0 rounded-r-lg ${currentUserRole === 'uploader' ? 'bg-[#f37021] shadow-[0_0_16px_rgba(243,112,33,0.6)]' : 'bg-stone-400'}`}
          style={{
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT,
            top: renderState.paddle1,
          }}
        />
        <div
          className={`absolute right-0 rounded-l-lg ${currentUserRole === 'downloader' ? 'bg-[#f37021] shadow-[0_0_16px_rgba(243,112,33,0.6)]' : 'bg-stone-400'}`}
          style={{
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT,
            top: renderState.paddle2,
          }}
        />

        {/* Ball */}
        {(renderState.status === 'playing' || renderState.status === 'waiting') && (
          <div
            className="absolute rounded-full"
            style={{
              width: BALL_SIZE,
              height: BALL_SIZE,
              left: renderState.ball.x,
              top: renderState.ball.y,
              background: 'radial-gradient(circle at 30% 30%, #fff, #ccc)',
              boxShadow: '0 0 8px rgba(255,255,255,0.4), 0 0 20px rgba(243,112,33,0.15)',
              transition: currentUserRole === 'downloader' ? 'left 40ms linear, top 40ms linear' : 'none',
            }}
          />
        )}

        {/* Waiting Overlay */}
        <AnimatePresence>
          {renderState.status === 'waiting' && !winner && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-950/70 backdrop-blur-[2px] flex items-center justify-center flex-col gap-4"
            >
              <p className="text-stone-200 font-semibold text-lg">Coffee Pong</p>
              <div className="flex gap-3">
                <div className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${renderState.p1Ready ? 'bg-[#f37021]/20 text-[#f37021] border border-[#f37021]/40 shadow-[0_0_8px_rgba(243,112,33,0.2)]' : 'bg-stone-800/80 text-stone-500 border border-stone-700/50'}`}>
                  Host {renderState.p1Ready ? '✓' : '...'}
                </div>
                <div className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${renderState.p2Ready ? 'bg-[#f37021]/20 text-[#f37021] border border-[#f37021]/40 shadow-[0_0_8px_rgba(243,112,33,0.2)]' : 'bg-stone-800/80 text-stone-500 border border-stone-700/50'}`}>
                  Peer {renderState.p2Ready ? '✓' : '...'}
                </div>
              </div>
              {!isMeReady && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReady}
                  className="mt-1 px-8 py-2.5 bg-gradient-to-r from-[#f37021] to-[#e0661e] hover:from-[#ff8033] hover:to-[#f37021] text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-[#f37021]/20"
                >
                  <Play className="w-4 h-4" /> Ready Up
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Winner Overlay */}
        <AnimatePresence>
          {winner && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center flex-col gap-3"
            >
              <Trophy className="w-10 h-10 text-[#f37021]" />
              <p className="text-2xl font-black text-white">{winner} Wins!</p>
              <p className="text-stone-400 text-sm font-mono">{renderState.score[0]} — {renderState.score[1]}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReady}
                className="mt-2 px-8 py-2.5 bg-gradient-to-r from-[#f37021] to-[#e0661e] text-white font-bold rounded-xl shadow-lg shadow-[#f37021]/20"
              >
                Play Again
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Countdown */}
        <AnimatePresence>
          {renderState.status === 'countdown' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-950/40 flex items-center justify-center"
            >
              <motion.div
                key={renderState.countdown}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1.5, opacity: 1 }}
                exit={{ scale: 3, opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="text-7xl font-black text-[#f37021] drop-shadow-[0_0_20px_rgba(243,112,33,0.6)]"
              >
                {renderState.countdown}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
