import React from 'react'

export default function StopButton({
  isDownloading,
  onClick,
}: {
  onClick: React.MouseEventHandler<HTMLButtonElement>
  isDownloading?: boolean
}): React.ReactElement {
  return (
    <button
      className="px-3 py-1.5 text-xs text-[#e05a4f] bg-transparent hover:bg-[#fef2f2] dark:hover:bg-[#2a1515] rounded-lg transition-all duration-200 flex items-center font-medium mono"
      onClick={onClick}
    >
      <svg
        className="w-3 h-3 mr-1.5"
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="5" y="5" width="14" height="14" rx="2" />
      </svg>
      {isDownloading ? 'stop download' : 'stop sharing'}
    </button>
  )
}
