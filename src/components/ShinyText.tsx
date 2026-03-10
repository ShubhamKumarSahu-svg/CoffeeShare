'use client'

import React, { JSX } from 'react'

export default function ShinyText({
  text,
  disabled = false,
  speed = 3,
  className = '',
}: {
  text: string
  disabled?: boolean
  speed?: number
  className?: string
}): JSX.Element {
  const animationDuration = `${speed}s`

  return (
    <span
      className={`text-[#a09a90] dark:text-[#6a6660] bg-clip-text inline-block ${
        disabled ? '' : 'animate-shine'
      } ${className}`}
      style={{
        backgroundImage:
          'linear-gradient(120deg, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0) 60%)',
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        animationDuration,
      }}
    >
      {text}
    </span>
  )
}
