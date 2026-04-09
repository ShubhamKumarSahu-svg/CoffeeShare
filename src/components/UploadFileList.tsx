import React, { JSX } from 'react'
import TypeBadge from './TypeBadge'

type UploadedFileLike = {
  fileName?: string
  type: string
}

export default function UploadFileList({
  files,
  onRemove,
}: {
  files: UploadedFileLike[]
  onRemove?: (index: number) => void
}): JSX.Element {
  const items = files.map((f: UploadedFileLike, i: number) => (
    <div
      key={f.fileName}
      className="w-full border-b border-[#e8e4dd] dark:border-[#2a2a27] last:border-0 hover:bg-[#faf8f4] dark:hover:bg-[#1e1e1c] transition-colors duration-150"
    >
      <div className="flex justify-between items-center py-3 pl-4 pr-3">
        <p className="truncate text-sm font-medium text-[#3a3a36] dark:text-[#c0bdb8] mono">
          {f.fileName}
        </p>
        <div className="flex items-center gap-2">
          <TypeBadge type={f.type} />
          {onRemove && (
            <button
              onClick={() => onRemove?.(i)}
              className="text-[#c0bbb3] hover:text-[#e05a4f] dark:text-[#4a4a44] dark:hover:text-[#e05a4f] focus:outline-none px-1 transition-colors duration-200"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  ))

  return (
    <div className="w-full surface rounded-xl overflow-hidden">{items}</div>
  )
}
