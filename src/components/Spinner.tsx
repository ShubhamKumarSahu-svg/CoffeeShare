'use client'

import React, { JSX } from 'react'

export function CoffeeCup({
  progress = -1, // -1 means indeterminate (brewing)
  isDone = false,
}: {
  progress?: number
  isDone?: boolean
}): JSX.Element {
  const fillHeight =
    progress >= 0 ? Math.max(0, Math.min(100, progress * 100)) : 0

  return (
    <svg
      width="200"
      height="200"
      viewBox="0 0 100 100"
      fill="none"
      className={
        isDone ? 'animate-bounce' : progress < 0 ? 'animate-pulse' : ''
      }
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Coffee cup"
    >
      <defs>
        {/* Clip path for the full interior volume of the cylinder */}
        <clipPath id="bauhaus-cup-clip">
          <path d="M 25 40 L 25 80 A 25 10 0 0 0 75 80 L 75 40 A 25 10 0 0 0 25 40 Z" />
        </clipPath>
      </defs>

      {/* Steam lines when brewing or done */}
      {(progress < 0 || isDone || progress > 0.8) && (
        <>
          <path
            d="M 38 30 C 32 20, 44 14, 38 4"
            fill="none"
            stroke="var(--border-strong)"
            strokeWidth="4"
            strokeLinecap="round"
            className="animate-[float_2s_ease-in-out_infinite]"
          />
          <path
            d="M 50 26 C 44 16, 56 10, 50 0"
            fill="none"
            stroke="var(--border-strong)"
            strokeWidth="4"
            strokeLinecap="round"
            className="animate-[float_2.5s_ease-in-out_infinite_0.5s]"
          />
          <path
            d="M 62 30 C 56 20, 68 14, 62 4"
            fill="none"
            stroke="var(--border-strong)"
            strokeWidth="4"
            strokeLinecap="round"
            className="animate-[float_3s_ease-in-out_infinite_1s]"
          />
        </>
      )}

      {/* Handle */}
      <path 
        d="M 70 50 C 100 50, 100 80, 70 80 Z" 
        fill="var(--bauhaus-yellow)" 
        stroke="var(--border-strong)" 
        strokeWidth="4" 
      />

      {/* Cup Body Background */}
      <path 
        d="M 25 40 L 25 80 A 25 10 0 0 0 75 80 L 75 40 Z" 
        fill="var(--bauhaus-red)" 
      />

      {/* Top Rim Background (Empty inside) */}
      <ellipse 
        cx="50" cy="40" rx="25" ry="10" 
        fill="var(--bg-app)" 
      />

      {/* Liquid Fill */}
      {progress >= 0 ? (
        <g clipPath="url(#bauhaus-cup-clip)">
          <rect
            x="20"
            y={90 - 50 * (fillHeight / 100)}
            width="60"
            height={50 * (fillHeight / 100) + 10}
            fill="var(--bauhaus-blue)"
            className="transition-all duration-500 ease-out"
          />
          {fillHeight > 0 && (
            <ellipse
              cx="50"
              cy={90 - 50 * (fillHeight / 100)}
              rx="25"
              ry="10"
              fill="var(--bauhaus-blue)"
              stroke="var(--border-strong)"
              strokeWidth="4"
              className="transition-all duration-500 ease-out"
            />
          )}
        </g>
      ) : (
        // Indeterminate loading
        <g clipPath="url(#bauhaus-cup-clip)" className="animate-pulse">
          <rect
            x="20"
            y="40"
            width="60"
            height="60"
            fill="var(--bauhaus-blue)"
            opacity="0.8"
          />
          <ellipse
            cx="50"
            cy="40"
            rx="25"
            ry="10"
            fill="var(--bauhaus-blue)"
            stroke="var(--border-strong)"
            strokeWidth="4"
          />
        </g>
      )}

      {/* Foreground Strokes (Drawn last for crisp borders) */}
      <path 
        d="M 25 40 L 25 80 A 25 10 0 0 0 75 80 L 75 40" 
        fill="none"
        stroke="var(--border-strong)" 
        strokeWidth="4" 
      />
      <ellipse 
        cx="50" cy="40" rx="25" ry="10" 
        fill="none"
        stroke="var(--border-strong)" 
        strokeWidth="4" 
      />
    </svg>
  )
}

export default function Spinner({
  progress,
  isDone,
}: {
  progress?: number
  isDone?: boolean
}): JSX.Element {
  return (
    <div className="relative flex items-center justify-center w-64 h-64 mb-8">
      <CoffeeCup progress={progress} isDone={isDone} />
    </div>
  )
}
