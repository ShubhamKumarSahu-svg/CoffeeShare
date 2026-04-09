import React from 'react'

export default function StartButton({
  onClick,
}: {
  onClick: React.MouseEventHandler<HTMLButtonElement>
}): React.ReactElement {
  return (
    <button
      id="start-button"
      onClick={onClick}
      className="px-6 py-2.5 accent-bg text-white rounded-xl hover:bg-[#268080] dark:hover:bg-[#34a0a1] transition-all duration-200 font-semibold text-sm hover:shadow-md active:scale-[0.98]"
    >
      Start Sharing
    </button>
  )
}
