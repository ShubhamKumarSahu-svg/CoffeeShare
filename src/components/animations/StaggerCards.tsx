'use client'
import React, { useEffect, useRef } from 'react'
import anime from 'animejs'

interface StaggerCardsProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export default function StaggerCards({ children, className = '', delay = 600 }: StaggerCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const cards = containerRef.current.children

    anime({
      targets: cards,
      opacity: [0, 1],
      translateY: [30, 0],
      scale: [0.9, 1],
      duration: 600,
      delay: anime.stagger(120, { start: delay }),
      easing: 'easeOutBack',
    })
  }, [delay])

  return (
    <div ref={containerRef} className={className}>
      {React.Children.map(children, (child, i) => (
        <div key={i} style={{ opacity: 0 }}>
          {child}
        </div>
      ))}
    </div>
  )
}
