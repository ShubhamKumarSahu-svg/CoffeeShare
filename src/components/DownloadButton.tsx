import React, { JSX } from 'react'

export default function DownloadButton({
  onClick,
}: {
  onClick?: React.MouseEventHandler
}): JSX.Element {
  return (
    <button
      id="download-button"
      onClick={onClick}
      className="h-12 px-6 accent-bg text-white rounded-xl hover:bg-[#268080] dark:hover:bg-[#34a0a1] transition-all duration-200 font-semibold text-sm hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
    >
      <svg
        className="w-4.5 h-4.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      Download
    </button>
  )
}
