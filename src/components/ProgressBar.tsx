import React, { JSX } from 'react'

export default function ProgressBar({
  value,
  max,
}: {
  value: number
  max: number
}): JSX.Element {
  const percentage = (value / max) * 100
  const isComplete = value === max

  return (
    <div
      id="progress-bar"
      className="w-full h-10 bg-[#f0ece6] dark:bg-[#252522] rounded-xl overflow-hidden relative"
    >
      <div
        id="progress-bar-fill"
        className={`h-full ${
          isComplete
            ? 'bg-[#5a9e6f] dark:bg-[#4d8a5f]'
            : 'bg-[#2d9596] dark:bg-[#3aacad]'
        } transition-all duration-500 ease-out`}
        style={{ width: `${percentage}%` }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          id="progress-percentage"
          className={`mono text-xs font-semibold ${percentage > 45 ? 'text-white' : 'text-[#5a5550] dark:text-[#9a9690]'}`}
        >
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  )
}
