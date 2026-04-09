import React, { JSX } from 'react'

export default function Loading({ text }: { text: string }): JSX.Element {
  return (
    <div className="flex flex-col items-center gap-3 animate-fade-in">
      <div className="flex gap-1.5">
        <div
          className="w-1.5 h-1.5 rounded-full bg-[#2d9596] animate-bounce"
          style={{ animationDelay: '0ms' }}
        />
        <div
          className="w-1.5 h-1.5 rounded-full bg-[#2d9596] opacity-70 animate-bounce"
          style={{ animationDelay: '150ms' }}
        />
        <div
          className="w-1.5 h-1.5 rounded-full bg-[#2d9596] opacity-40 animate-bounce"
          style={{ animationDelay: '300ms' }}
        />
      </div>
      <p className="text-sm text-[#8a8580] dark:text-[#7a7670]">{text}</p>
    </div>
  )
}
