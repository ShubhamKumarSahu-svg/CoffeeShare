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
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      letters.forEach((letter) => {
        ;(letter as HTMLElement).style.opacity = '1'
        ;(letter as HTMLElement).style.transform = 'none'
      })
      return
    }

    letters.forEach((letter) => {
      ;(letter as HTMLElement).style.opacity = '0'
      ;(letter as HTMLElement).style.transform = 'translateY(20px) rotateX(90deg)'
    })

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
      {text.split(' ').map((word, wordIdx, arr) => (
        <span key={wordIdx} className="inline-block whitespace-nowrap">
          {word.split('').map((char, charIdx) => (
            <span
              key={`${wordIdx}-${charIdx}`}
              className="stagger-letter inline-block"
              style={{ opacity: 1 }}
            >
              {char}
            </span>
          ))}
          {/* Add a non-breaking space after the word, except for the last word */}
          {wordIdx < arr.length - 1 && (
            <span className="stagger-letter inline-block" style={{ opacity: 1 }}>
              &nbsp;
            </span>
          )}
        </span>
      ))}
    </span>
  )
}
