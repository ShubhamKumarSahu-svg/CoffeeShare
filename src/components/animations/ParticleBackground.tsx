'use client'
import React, { useEffect, useRef } from 'react'
import anime from 'animejs'

export default function ParticleBackground() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const PARTICLE_COUNT = 30
    const particles: HTMLDivElement[] = []

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const dot = document.createElement('div')
      const size = Math.random() * 4 + 2
      dot.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: ${Math.random() > 0.5 ? 'rgba(243, 112, 33, 0.15)' : 'rgba(255, 255, 255, 0.06)'};
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        pointer-events: none;
      `
      container.appendChild(dot)
      particles.push(dot)
    }

    const anim = anime({
      targets: particles,
      translateX: () => anime.random(-80, 80),
      translateY: () => anime.random(-80, 80),
      scale: () => anime.random(8, 14) / 10,
      opacity: () => anime.random(3, 8) / 10,
      duration: () => anime.random(4000, 8000),
      delay: () => anime.random(0, 2000),
      direction: 'alternate',
      loop: true,
      easing: 'easeInOutSine',
    })

    return () => {
      anim.pause()
      particles.forEach(p => p.remove())
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden pointer-events-none z-0"
      aria-hidden="true"
    />
  )
}
