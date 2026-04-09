import React, { JSX } from 'react'

function getTypeColor(fileType: string): string {
  if (fileType.startsWith('image/'))
    return 'bg-[#dbeafe] dark:bg-[#1e293b] text-[#3b82f6] dark:text-[#60a5fa]'
  if (fileType.startsWith('text/'))
    return 'bg-[#dcfce7] dark:bg-[#14291c] text-[#22c55e] dark:text-[#4ade80]'
  if (fileType.startsWith('audio/'))
    return 'bg-[#f3e8ff] dark:bg-[#1e1530] text-[#a855f7] dark:text-[#c084fc]'
  if (fileType.startsWith('video/'))
    return 'bg-[#fee2e2] dark:bg-[#2a1515] text-[#ef4444] dark:text-[#f87171]'
  return 'bg-[#f0ece6] dark:bg-[#252522] text-[#8a8580] dark:text-[#7a7670]'
}

export default function TypeBadge({ type }: { type: string }): JSX.Element {
  return (
    <div
      className={`px-2 py-0.5 mono text-[9px] font-semibold rounded-md ${getTypeColor(type)} transition-all duration-200`}
    >
      {type}
    </div>
  )
}
