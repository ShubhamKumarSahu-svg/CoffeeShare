import React, { JSX } from 'react'
import useClipboard from '../hooks/useClipboard'
import InputLabel from './InputLabel'

export function CopyableInput({
  label,
  value,
}: {
  label: string
  value: string
}): JSX.Element {
  const { hasCopied, onCopy } = useClipboard(value)

  return (
    <div className="flex flex-col w-full">
      <InputLabel>{label}</InputLabel>
      <div className="flex w-full">
        <input
          id={`copyable-input-${label.toLowerCase().replace(/\s+/g, '-')}`}
          className="grow px-3 py-2 mono text-xs border border-r-0 rounded-l-lg text-[#3a3a36] dark:text-[#c0bdb8] bg-[#fffdf9] dark:bg-[#1a1a18] border-[#e8e4dd] dark:border-[#2a2a27]"
          value={value}
          readOnly
        />
        <button
          className="px-4 py-2 text-xs font-medium accent-text bg-[#f0ece6] dark:bg-[#252522] hover:bg-[#e6e1d9] dark:hover:bg-[#302f2c] rounded-r-lg border border-l-0 border-[#e8e4dd] dark:border-[#2a2a27] transition-all duration-200 mono"
          onClick={onCopy}
        >
          {hasCopied ? '✓ copied' : 'copy'}
        </button>
      </div>
    </div>
  )
}
