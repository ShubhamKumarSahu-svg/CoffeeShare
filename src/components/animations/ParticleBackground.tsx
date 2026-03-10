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
      className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#0c0a09]"
      aria-hidden="true"
    >
      {/* Dynamic glowing mesh gradient orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#f37021]/10 blur-[120px] animate-blob" />
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] rounded-full bg-[#e0661e]/10 blur-[140px] animate-blob animation-delay-2000" />
      <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] rounded-full bg-[#f37021]/5 blur-[150px] animate-blob animation-delay-4000" />
      <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] rounded-full bg-stone-500/10 blur-[100px] animate-blob animation-delay-6000" />
      
      {/* Container for animejs particles */}
      <div className="absolute inset-0" />
    </div>
  )
}
