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
        className={`group relative block cursor-pointer w-full max-w-sm py-16 px-8 rounded-[2rem] transition-all duration-500 ease-out outline-none border-[2px] backdrop-blur-2xl shadow-2xl ${isDragging
          ? 'border-[#f37021] bg-[#f37021]/10 shadow-[0_0_50px_rgba(243,112,33,0.3)] scale-105'
          : 'border-stone-500/30 bg-stone-900/60 hover:bg-stone-800/80 hover:border-stone-400/50 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]'
          }`}
        onClick={handleClick}
        whileHover={{ scale: 1.03, y: -5 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Subtle inner glowing border effect on hover */}
        <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        <div className="flex flex-col items-center gap-6 relative z-10">
          <motion.div
            animate={{ scale: isDragging ? 1.2 : 1, rotate: isDragging ? 90 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`w-20 h-20 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isDragging
              ? 'border-[#f37021] text-[#f37021] bg-[#f37021]/20 shadow-[0_0_30px_rgba(243,112,33,0.5)]'
              : 'border-stone-500/50 text-stone-300 bg-stone-800/50 group-hover:border-[#f37021] group-hover:text-[#f37021] group-hover:bg-[#f37021]/10 group-hover:shadow-[0_0_20px_rgba(243,112,33,0.3)]'
              }`}
          >
            <span className="text-4xl font-light leading-none mb-1 group-hover:animate-pulse">+</span>
          </motion.div>
          <div className="text-center space-y-3">
              <span className="block text-xl font-semibold text-white tracking-tight drop-shadow-md">
                {isDragging ? 'Drop to start sharing' : 'Share Files Instantly'}
              </span>
              <span className="block text-sm text-stone-400 font-medium">
                {isDragging ? 'Drop files here' : 'Click to browse or drag & drop'}
              </span>
            </div>
            <div className="flex justify-center mt-8 pt-4 border-t border-stone-700/50 w-full relative">
              <button
                onClick={handleWormholeClick}
                className="flex items-center gap-2 px-5 py-2.5 bg-stone-800/80 hover:bg-stone-700/80 border border-stone-600 hover:border-[#f37021]/50 rounded-xl text-stone-200 transition-all text-sm font-bold z-10 hover:shadow-[0_0_15px_rgba(243,112,33,0.2)] group/btn"
              >
                <FolderSync className="w-4 h-4 text-[#f37021] group-hover/btn:animate-spin-slow" />
                Live Folder Sync
              </button>
            </div>
          </div>
      </motion.div>
    </>
  )
}
