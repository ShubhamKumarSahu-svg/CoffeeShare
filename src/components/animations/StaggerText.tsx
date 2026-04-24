'use client'
import React, { useEffect, useRef } from 'react'
import anime from 'animejs'

interface StaggerTextProps {
  text: string
  className?: string
  delay?: number
}

export default function StaggerText({ text, className = '', delay = 0 }: StaggerTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const letters = containerRef.current.querySelectorAll('.stagger-letter')

    anime({
      targets: letters,
      opacity: [0, 1],
      translateY: [20, 0],
      rotateX: [90, 0],
      duration: 800,
      delay: anime.stagger(30, { start: delay }),
      easing: 'easeOutExpo',
    })
  }, [delay])

  return (
    <span ref={containerRef} className={className} aria-label={text}>
      {text.split('').map((char, i) => (
        <span
          key={i}
          className="stagger-letter inline-block"
          style={{ opacity: 0 }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  )
}
