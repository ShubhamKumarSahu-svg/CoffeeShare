import React, { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Gamepad2, X, Play } from 'lucide-react'

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

export default function CoffeePong({
  gameState,
  sendGameState,
  currentUserRole,
}: {
  gameState: any
  sendGameState: (state: any) => void
  currentUserRole: 'uploader' | 'downloader'
}) {
  const [isOpen, setIsOpen] = useState(false)

  const GAME_WIDTH = 400
  const GAME_HEIGHT = 300
  const PADDLE_HEIGHT = 60
  const PADDLE_WIDTH = 10
  const BALL_SIZE = 12

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
  }>({
    status: 'waiting',
    countdownValue: null,
    p1Ready: false,
    p2Ready: false,
    ball: {
      x: GAME_WIDTH / 2 - BALL_SIZE / 2,
      y: GAME_HEIGHT / 2 - BALL_SIZE / 2,
    },
    velocity: { x: 5, y: 3 },
    paddle1: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    paddle2: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    score: [0, 0],
  })

  const [renderState, setRenderState] = useState<PongState>({
    status: 'waiting',
    countdown: null,
    p1Ready: false,
    p2Ready: false,
    ball: {
      x: GAME_WIDTH / 2 - BALL_SIZE / 2,
      y: GAME_HEIGHT / 2 - BALL_SIZE / 2,
    },
    paddle1: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    paddle2: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    score: [0, 0],
  })

  // Start countdown sequence
  const startCountdown = () => {
    const st = hostState.current
    if (st.status === 'countdown') return
    st.status = 'countdown'
    st.countdownValue = 3

    const tick = () => {
      if (hostState.current.countdownValue === 1) {
        hostState.current.status = 'playing'
        hostState.current.countdownValue = null
      } else if (hostState.current.countdownValue !== null) {
        hostState.current.countdownValue--
        setTimeout(tick, 1000)
      }
    }
    setTimeout(tick, 1000)
  }

  // Handle incoming game state from peers
  useEffect(() => {
    if (!gameState) return
    if (currentUserRole === 'downloader') {
      if (gameState.type === 'sync') {
        setRenderState((prev) => ({
          status: gameState.status,
          countdown: gameState.countdown,
          p1Ready: gameState.p1Ready,
          p2Ready: gameState.p2Ready,
          ball: gameState.ball,
          paddle1: gameState.paddle1,
          paddle2: prev.paddle2, // keep local paddle smooth
          score: gameState.score,
        }))
      }
    } else {
      // Uploader receiving from downloader
      if (gameState.type === 'paddle') {
        hostState.current.paddle2 = gameState.paddle2
        if (gameState.p2Ready) hostState.current.p2Ready = true
        
        setRenderState((prev) => ({ 
          ...prev, 
          paddle2: gameState.paddle2, 
          p2Ready: hostState.current.p2Ready 
        }))

        if (
          hostState.current.p1Ready &&
          hostState.current.p2Ready &&
          hostState.current.status === 'waiting'
        ) {
          startCountdown()
        }
      } else if (gameState.type === 'ready') {
        hostState.current.p2Ready = true
        setRenderState((prev) => ({ ...prev, p2Ready: true }))
        if (
          hostState.current.p1Ready &&
          hostState.current.status === 'waiting'
        ) {
          startCountdown()
        }
      }
    }
  }, [gameState, currentUserRole])

  // Host Game Loop
  useEffect(() => {
    if (currentUserRole !== 'uploader' || !isOpen) return

    let animationFrameId: number

    const gameLoop = () => {
      const state = hostState.current

      if (state.status === 'playing') {
        state.ball.x += state.velocity.x
        state.ball.y += state.velocity.y

        if (state.ball.y <= 0 || state.ball.y >= GAME_HEIGHT - BALL_SIZE) {
          state.velocity.y *= -1
          // prevent getting stuck
          state.ball.y = Math.max(
            0,
            Math.min(GAME_HEIGHT - BALL_SIZE, state.ball.y),
          )
        }

        const hitLeft =
          state.ball.x <= PADDLE_WIDTH &&
          state.ball.y + BALL_SIZE >= state.paddle1 &&
          state.ball.y <= state.paddle1 + PADDLE_HEIGHT
        const hitRight =
          state.ball.x >= GAME_WIDTH - PADDLE_WIDTH - BALL_SIZE &&
          state.ball.y + BALL_SIZE >= state.paddle2 &&
          state.ball.y <= state.paddle2 + PADDLE_HEIGHT

        if (hitLeft || hitRight) {
          state.velocity.x *= -1.05 // speed up slightly
          const paddleCenter = hitLeft
            ? state.paddle1 + PADDLE_HEIGHT / 2
            : state.paddle2 + PADDLE_HEIGHT / 2
          const diff = state.ball.y + BALL_SIZE / 2 - paddleCenter
          state.velocity.y = diff * 0.2
        }

        if (state.ball.x <= -BALL_SIZE) {
          state.score[1]++
          handleScore()
        } else if (state.ball.x >= GAME_WIDTH) {
          state.score[0]++
          handleScore()
        }
      }

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

      sendGameState({
        type: 'sync',
        status: state.status,
        countdown: state.countdownValue,
        p1Ready: state.p1Ready,
        p2Ready: state.p2Ready,
        ball: state.ball,
        paddle1: state.paddle1,
        score: state.score,
      })

      animationFrameId = requestAnimationFrame(gameLoop)
    }

    const handleScore = () => {
      const state = hostState.current
      state.ball = {
        x: GAME_WIDTH / 2 - BALL_SIZE / 2,
        y: GAME_HEIGHT / 2 - BALL_SIZE / 2,
      }
      state.velocity = {
        x: state.velocity.x > 0 ? -5 : 5,
        y: (Math.random() - 0.5) * 6,
      }
      startCountdown()
    }

    animationFrameId = requestAnimationFrame(gameLoop)
    return () => cancelAnimationFrame(animationFrameId)
  }, [currentUserRole, isOpen, sendGameState])

  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
  ) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    let relativeY = clientY - rect.top - PADDLE_HEIGHT / 2
    relativeY = Math.max(0, Math.min(GAME_HEIGHT - PADDLE_HEIGHT, relativeY))

    if (currentUserRole === 'uploader') {
      hostState.current.paddle1 = relativeY
      setRenderState((prev) => ({ ...prev, paddle1: relativeY }))
    } else {
      setRenderState((prev) => {
        sendGameState({ type: 'paddle', paddle2: relativeY, p2Ready: prev.p2Ready })
        return { ...prev, paddle2: relativeY }
      })
    }
  }

  const handleReady = () => {
    if (currentUserRole === 'uploader') {
      hostState.current.p1Ready = true
      setRenderState((prev) => ({ ...prev, p1Ready: true }))
      if (hostState.current.p2Ready && hostState.current.status === 'waiting') {
        startCountdown()
      }
    } else {
      setRenderState((prev) => {
        sendGameState({ type: 'paddle', paddle2: prev.paddle2, p2Ready: true })
        return { ...prev, p2Ready: true }
      })
    }
  }

  const isMeReady =
    currentUserRole === 'uploader' ? renderState.p1Ready : renderState.p2Ready

  if (typeof document === 'undefined') return null

  return createPortal(
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 p-4 bg-stone-800 text-stone-100 border border-stone-700 rounded-full shadow-lg hover:bg-stone-700 hover:border-amber-500 transition-colors z-40 group flex items-center gap-2"
        title="Play Pong while you wait"
      >
        <Gamepad2 className="w-6 h-6 group-hover:text-amber-500 transition-colors" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-4"
          >
            <div className="surface rounded-3xl p-6 relative max-w-lg w-full flex flex-col items-center">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-200"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-xl font-bold text-stone-100 mb-2 flex items-center gap-2">
                <Gamepad2 className="text-amber-500 w-5 h-5" />
                Coffee Pong
              </h2>
              <p className="text-stone-400 text-sm mb-6">
                First to 10 wins. Game is synced via WebRTC.
              </p>

              <div className="flex justify-between w-full px-8 mb-4">
                <div
                  className={`text-3xl font-mono font-bold ${currentUserRole === 'uploader' ? 'text-amber-500' : 'text-stone-500'}`}
                >
                  {renderState.score[0]}
                </div>
                <div
                  className={`text-3xl font-mono font-bold ${currentUserRole === 'downloader' ? 'text-amber-500' : 'text-stone-500'}`}
                >
                  {renderState.score[1]}
                </div>
              </div>

              <div
                className="relative bg-stone-950 border-2 border-stone-800 rounded-xl overflow-hidden shadow-inner cursor-none touch-none"
                style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
                onMouseMove={handleMouseMove}
                onTouchMove={handleMouseMove}
              >
                {/* Center Line */}
                <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-stone-800 border-dashed" />

                {/* Uploader Paddle (Left) */}
                <div
                  className={`absolute left-0 w-2.5 rounded-r-sm ${currentUserRole === 'uploader' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-stone-600'}`}
                  style={{ height: PADDLE_HEIGHT, top: renderState.paddle1 }}
                />

                {/* Downloader Paddle (Right) */}
                <div
                  className={`absolute right-0 w-2.5 rounded-l-sm ${currentUserRole === 'downloader' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-stone-600'}`}
                  style={{ height: PADDLE_HEIGHT, top: renderState.paddle2 }}
                />

                {/* Ball */}
                {(renderState.status === 'playing' ||
                  renderState.status === 'waiting') && (
                  <div
                    className="absolute bg-stone-100 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                    style={{
                      width: BALL_SIZE,
                      height: BALL_SIZE,
                      left: renderState.ball.x,
                      top: renderState.ball.y,
                    }}
                  />
                )}

                {/* Overlays */}
                {renderState.status === 'waiting' && (
                  <div className="absolute inset-0 bg-stone-950/60 flex items-center justify-center flex-col gap-4">
                    <p className="text-stone-300 font-medium">
                      Waiting for both players...
                    </p>
                    <div className="flex gap-4">
                      <div
                        className={`px-3 py-1 rounded text-sm ${renderState.p1Ready ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'bg-stone-800 text-stone-400'}`}
                      >
                        Host {renderState.p1Ready ? 'Ready' : '...'}
                      </div>
                      <div
                        className={`px-3 py-1 rounded text-sm ${renderState.p2Ready ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'bg-stone-800 text-stone-400'}`}
                      >
                        Peer {renderState.p2Ready ? 'Ready' : '...'}
                      </div>
                    </div>
                    {!isMeReady && (
                      <button
                        onClick={handleReady}
                        className="mt-2 px-6 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl flex items-center gap-2 transition-transform active:scale-95"
                      >
                        <Play className="w-4 h-4" /> Ready Up
                      </button>
                    )}
                  </div>
                )}

                {renderState.status === 'countdown' && (
                  <div className="absolute inset-0 bg-stone-950/40 flex items-center justify-center">
                    <motion.div
                      key={renderState.countdown}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1.5, opacity: 1 }}
                      exit={{ scale: 2, opacity: 0 }}
                      className="text-6xl font-black text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                    >
                      {renderState.countdown}
                    </motion.div>
                  </div>
                )}
              </div>

              <p className="mt-4 text-xs text-stone-500 font-medium flex gap-4">
                <span className="flex items-center gap-1">
                  <span
                    className={`w-2 h-2 rounded-full ${currentUserRole === 'uploader' ? 'bg-amber-500' : 'bg-stone-600'}`}
                  ></span>
                  Host (Left)
                </span>
                <span className="flex items-center gap-1">
                  <span
                    className={`w-2 h-2 rounded-full ${currentUserRole === 'downloader' ? 'bg-amber-500' : 'bg-stone-600'}`}
                  ></span>
                  Peer (Right)
                </span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>,
    document.body,
  )
}
