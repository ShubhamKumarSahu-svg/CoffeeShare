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
      className="w-full border-b-4 border-[var(--border-strong)] last:border-b-0 hover:bg-bauhaus-yellow transition-colors duration-150 group"
    >
      <div className="flex justify-between items-center py-4 pl-5 pr-4">
        <p className="truncate text-base font-black text-primary font-mono group-hover:text-primary">
          {f.fileName}
        </p>
        <div className="flex items-center gap-4">
          <TypeBadge type={f.type} />
          {onRemove && (
            <button
              onClick={() => onRemove?.(i)}
              className="text-primary hover:text-white hover:bg-bauhaus-red border-2 border-transparent hover:border-[var(--border-strong)] font-black w-8 h-8 flex items-center justify-center transition-all duration-200"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  ))

  return (
    <div className="w-full bg-white border-4 border-[var(--border-strong)] shadow-[4px_4px_0px_0px_var(--shadow-color)] max-h-[320px] overflow-y-auto custom-scrollbar">
      {items}
    </div>
  )
}
// .
// .
