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
      className="btn btn-ghost px-5"
    >
      {text || 'Cancel'}
    </button>
  )
}
