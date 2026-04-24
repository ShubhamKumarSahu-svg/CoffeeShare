import React, { JSX, useState, useCallback, useEffect, useRef } from 'react'
import { extractFileList } from '../fs'
import { motion } from 'framer-motion'
import { FolderSync } from 'lucide-react'
import confetti from 'canvas-confetti'

export default function DropZone({
  onDrop,
}: {
  onDrop: (files: File[]) => void
}): JSX.Element {
  const [isDragging, setIsDragging] = useState(false)
  const [didDrop, setDidDrop] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const celebrateDrop = useCallback((): void => {
    setDidDrop(true)
    confetti({
      particleCount: 28,
      spread: 56,
      scalar: 0.7,
      origin: { y: 0.65 },
    })
    window.setTimeout(() => setDidDrop(false), 700)
  }, [])

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()

    const currentTarget =
      e.currentTarget === window ? window.document : e.currentTarget
    if (
      e.relatedTarget &&
      currentTarget instanceof Node &&
      currentTarget.contains(e.relatedTarget as Node)
    ) {
      return
    }

    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy'
    }
  }, [])

  const handleDrop = useCallback(
    async (e: DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      if (e.dataTransfer) {
        const files = await extractFileList(e)
        onDrop(files)
        celebrateDrop()
      }
    },
    [onDrop, celebrateDrop],
  )

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const files = Array.from(e.target.files)
        onDrop(files)
        celebrateDrop()
      }
    },
    [onDrop, celebrateDrop],
  )

  const handleWormholeClick = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      if (!('showDirectoryPicker' in window)) {
        alert('Your browser does not support Live Folder Sync. Try Chrome or Edge.')
        return
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dirHandle = await (window as any).showDirectoryPicker()
      const files: File[] = []

      const readDirectory = async (dir: FileSystemDirectoryHandle, path: string = '') => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for await (const entry of (dir as any).values()) {
          if (entry.kind === 'file') {
            const fileHandle = entry as FileSystemFileHandle
            const file = await fileHandle.getFile()
            // We can't trivially override the webkitRelativePath, but we can store it or let it just be flat.
            // For now, flat is fine, or we could mutate file name if needed.
            files.push(file)
          } else if (entry.kind === 'directory') {
            const newDirHandle = entry as FileSystemDirectoryHandle
            await readDirectory(newDirHandle, `${path}${entry.name}/`)
          }
        }
      }

      await readDirectory(dirHandle)
      onDrop(files)

      // In a real Wormhole, we would poll this dirHandle.
      // But passing the handle up requires changing the UploadedFile type.
    } catch (err) {
      console.error('Wormhole error:', err)
    }
  }, [onDrop])

  useEffect(() => {
    window.addEventListener('dragenter', handleDragEnter)
    window.addEventListener('dragleave', handleDragLeave)
    window.addEventListener('dragover', handleDragOver)
    window.addEventListener('drop', handleDrop)

    return () => {
      window.removeEventListener('dragenter', handleDragEnter)
      window.removeEventListener('dragleave', handleDragLeave)
      window.removeEventListener('dragover', handleDragOver)
      window.removeEventListener('drop', handleDrop)
    }
  }, [handleDragEnter, handleDragLeave, handleDragOver, handleDrop])

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileInputChange}
        multiple
      />
      <motion.div
        layoutId="upload-container"
        id="drop-zone-button"
        className={`group relative block cursor-pointer w-full p-8 md:p-12 transition-all duration-200 ease-out outline-none border-4 ${
          isDragging
            ? 'border-[var(--border-strong)] bg-bauhaus-red text-white scale-100 translate-y-1 shadow-[4px_4px_0px_0px_var(--shadow-color)]'
            : didDrop
              ? 'border-[var(--border-strong)] bg-bauhaus-blue text-white shadow-[8px_8px_0px_0px_var(--shadow-color)]'
              : 'border-[var(--border-strong)] bg-transparent hover:bg-white/20'
          }`}
        onClick={handleClick}
        whileHover={{ scale: 1 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex flex-col items-center gap-6 relative z-10">
          <motion.div
            animate={{ rotate: isDragging ? 45 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`w-16 h-16 md:w-20 md:h-20 flex items-center justify-center border-4 transition-all duration-200 ${
              isDragging
                ? 'border-white text-white bg-transparent rounded-none'
                : didDrop
                  ? 'border-white text-white bg-transparent rounded-full'
                  : 'border-[var(--border-strong)] text-[var(--border-strong)] bg-[var(--bg-card)] rounded-none group-hover:bg-bauhaus-yellow group-hover:text-black'
              }`}
          >
            <span className="text-4xl font-black leading-none mb-1">{didDrop ? '✓' : '+'}</span>
          </motion.div>
          <div className="text-center space-y-2">
              <span className="block text-2xl font-black uppercase tracking-widest text-primary">
                {isDragging ? 'Drop it' : didDrop ? 'Brewing...' : 'Share files'}
              </span>
              <span className="block text-sm font-bold uppercase tracking-widest text-primary">
                {isDragging ? 'Release to upload' : 'Click or Drag & Drop'}
              </span>
            </div>
            <div className="flex justify-center mt-6 pt-4 border-t-4 border-[var(--border-strong)] w-full relative">
              <button
                onClick={handleWormholeClick}
                className="btn btn-ghost font-black uppercase tracking-widest text-xs z-10 group/btn border-4 border-[var(--border-strong)] bg-[var(--bg-card)] text-primary hover:bg-bauhaus-yellow hover:text-black"
              >
                <FolderSync className="w-4 h-4 text-inherit group-hover/btn:animate-spin-slow" strokeWidth={3} />
                Live Folder Sync
              </button>
            </div>
          </div>
      </motion.div>
    </>
  )
}
// .
// .
