import React, { JSX, useState, useCallback, useEffect, useRef } from 'react'
import { extractFileList } from '../fs'
import { motion } from 'framer-motion'
import { FolderSync } from 'lucide-react'

export default function DropZone({
  onDrop,
}: {
  onDrop: (files: File[]) => void
}): JSX.Element {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      }
    },
    [onDrop],
  )

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const files = Array.from(e.target.files)
        onDrop(files)
      }
    },
    [onDrop],
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
        className={`group relative block cursor-pointer w-full max-w-sm py-16 px-8 rounded-3xl transition-colors duration-300 ease-out outline-none border-[3px] ${isDragging
          ? 'border-[#f37021] bg-[#f37021]/10'
          : 'border-dotted border-stone-500/50 bg-[#32323e] hover:bg-[#383846] hover:border-stone-500/80'
          }`}
        onClick={handleClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex flex-col items-center gap-6">
          <motion.div
            animate={{ scale: isDragging ? 1.1 : 1 }}
            className={`w-16 h-16 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${isDragging
              ? 'border-[#f37021] text-[#f37021] bg-[#f37021]/20'
              : 'border-[#f37021] text-[#f37021] bg-transparent group-hover:bg-[#f37021]/10'
              }`}
          >
            <span className="text-3xl font-light leading-none mb-1">+</span>
          </motion.div>
          <div className="text-center space-y-2">
            <span className="block text-[1.1rem] font-medium text-stone-200 leading-snug">
              {isDragging ? (
                'Drop to start sharing'
              ) : (
                <>
                  Click to browse or drag files<br/>here to start sharing
                </>
              )}
            </span>
            <div className="flex justify-center mt-6 pt-4">
              <button
                onClick={handleWormholeClick}
                className="flex items-center gap-2 px-4 py-2 bg-stone-800/80 hover:bg-stone-700/80 border border-stone-600 rounded-xl text-stone-300 transition-colors text-sm font-semibold z-10"
              >
                <FolderSync className="w-4 h-4 text-[#f37021]" />
                Live Folder Sync
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}
