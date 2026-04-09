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
      {/* Cup outline */}
      <path
        d="M25 75C25 80.5 30 85 35 85H65C70 85 75 80.5 75 75V40H25V75Z"
        fill="#FAF8F5"
        stroke="#8B4513"
        strokeWidth="3"
      />
      <path
        d="M75 50H85C88 50 90 52 90 55C90 58 88 60 85 60H75"
        fill="none"
        stroke="#8B4513"
        strokeWidth="3"
      />

      {/* Def clip path for cup interior */}
      <defs>
        <clipPath id="cup-clip">
          <path d="M26.5 75C26.5 80.5 30 83.5 35 83.5H65C70 83.5 73.5 80.5 73.5 75V40H26.5V75Z" />
        </clipPath>
      </defs>

      {/* Liquid Fill - dynamically based on progress */}
      {progress >= 0 ? (
        <g clipPath="url(#cup-clip)">
          <rect
            x="25"
            y={85 - 45 * (fillHeight / 100)}
            width="50"
            height={45 * (fillHeight / 100)}
            fill="#6F4E37"
            className="transition-all duration-500 ease-out"
          />
          {/* Top surface ellipse */}
          {fillHeight > 0 && (
            <ellipse
              cx="50"
              cy={85 - 45 * (fillHeight / 100)}
              rx="23"
              ry="4"
              fill="#523624"
              className="transition-all duration-500 ease-out"
            />
          )}
        </g>
      ) : (
        // Indeterminate loading - full cup but animating color/opacity
        <g clipPath="url(#cup-clip)" className="animate-pulse">
          <rect
            x="25"
            y="40"
            width="50"
            height="45"
            fill="#6F4E37"
            opacity="0.8"
          />
          <ellipse
            cx="50"
            cy="40"
            rx="23"
            ry="4"
            fill="#523624"
            opacity="0.8"
          />
        </g>
      )}

      {/* Steam lines when brewing or done */}
      {(progress < 0 || isDone || progress > 0.8) && (
        <>
          <path
            d="M40 30C40 20 50 25 50 15"
            stroke="#A9A9A9"
            strokeWidth="2"
            strokeLinecap="round"
            className="animate-[float_2s_ease-in-out_infinite]"
          />
          <path
            d="M60 35C60 25 70 30 70 20"
            stroke="#A9A9A9"
            strokeWidth="2"
            strokeLinecap="round"
            className="animate-[float_2.5s_ease-in-out_infinite_0.5s]"
          />
          <path
            d="M30 35C30 25 40 30 40 20"
            stroke="#A9A9A9"
            strokeWidth="2"
            strokeLinecap="round"
            className="animate-[float_3s_ease-in-out_infinite_1s]"
          />
        </>
      )}
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
