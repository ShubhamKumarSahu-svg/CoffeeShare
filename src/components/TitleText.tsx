import React, { JSX } from 'react'

export default function TitleText({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  return (
    <p
      className="text-2xl font-bold text-center text-stone-100 max-w-sm leading-relaxed tracking-tight animate-shine bg-clip-text"
      style={{
        fontFamily: "'Inter', sans-serif",
        backgroundImage:
          'linear-gradient(120deg, rgba(245, 245, 244, 1) 40%, rgba(255, 255, 255, 0.5) 50%, rgba(245, 245, 244, 1) 60%)',
        backgroundSize: '200% 100%',
        WebkitTextFillColor: 'transparent',
        animationDuration: '4s',
      }}
    >
      {children}
    </p>
  )
}
