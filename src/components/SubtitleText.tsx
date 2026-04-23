import React, { JSX } from 'react'

export default function SubtitleText({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  return (
    <p
      className="text-base text-center text-primary font-bold uppercase tracking-widest mt-6 max-w-lg leading-relaxed"
    >
      {children}
    </p>
  )
}
// .
