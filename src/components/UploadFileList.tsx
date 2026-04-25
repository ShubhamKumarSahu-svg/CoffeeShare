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
      className="w-full border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-muted)] transition-colors duration-150"
    >
      <div className="flex justify-between items-center py-3 pl-4 pr-3">
        <p className="truncate text-sm font-medium text-[var(--text-secondary)] mono">
          {f.fileName}
        </p>
        <div className="flex items-center gap-2">
          <TypeBadge type={f.type} />
          {onRemove && (
            <button
              onClick={() => onRemove?.(i)}
              className="text-[var(--text-muted)] hover:text-[var(--danger)] focus:outline-none px-1 transition-colors duration-200"
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
