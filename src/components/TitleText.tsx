import React, { JSX } from 'react'

export default function TitleText({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  return (
    <h2
      className="text-3xl md:text-5xl font-black text-center text-primary uppercase tracking-widest leading-none bg-bauhaus-yellow inline-block px-4 py-2 border-4 border-[var(--border-strong)] shadow-[4px_4px_0px_0px_var(--shadow-color)]"
    >
      {children}
    </h2>
  )
}
// .
// .
