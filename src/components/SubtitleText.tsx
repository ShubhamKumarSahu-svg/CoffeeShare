import React, { JSX } from 'react'

export default function SubtitleText({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  return (
    <p
      className="text-sm text-center text-stone-400 font-medium max-w-sm leading-relaxed"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {children}
    </p>
  )
}
