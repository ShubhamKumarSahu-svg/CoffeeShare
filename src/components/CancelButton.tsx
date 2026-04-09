import React from 'react'

export default function CancelButton({
  text,
  onClick,
}: {
  text?: string
  onClick: React.MouseEventHandler<HTMLButtonElement>
}): React.ReactElement {
  return (
    <button
      onClick={onClick}
      className="px-5 py-2.5 bg-[#f0ece6] dark:bg-[#252522] text-[#5a5550] dark:text-[#9a9690] rounded-xl hover:bg-[#e6e1d9] dark:hover:bg-[#302f2c] transition-all duration-200 font-medium text-sm"
    >
      {text || 'Cancel'}
    </button>
  )
}
