import React, { useRef, useCallback, JSX } from 'react'
import { UploadedFile } from '../types'

export default function AddFilesButton({
  onAdd,
}: {
  onAdd: (files: UploadedFile[]) => void
}): JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        onAdd(Array.from(e.target.files) as UploadedFile[])
        e.target.value = ''
      }
    },
    [onAdd],
  )

  return (
    <>
      <input
        id="add-files-input"
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        onChange={handleChange}
      />
      <button
        id="add-files-button"
        type="button"
        onClick={handleClick}
        className="ml-2 text-primary bg-white hover:bg-bauhaus-blue hover:text-white border-4 border-transparent hover:border-[var(--border-strong)] transition-all duration-200 font-black uppercase tracking-widest text-lg px-2 py-1 shadow-none hover:shadow-[4px_4px_0px_0px_var(--shadow-color)] translate-y-[-2px]"
      >
        + Add more files
      </button>
    </>
  )
}
