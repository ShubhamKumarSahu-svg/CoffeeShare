'use client'

import React, { JSX, useCallback, useState } from 'react'
import WebRTCPeerProvider from '../components/WebRTCProvider'
import DropZone from '../components/DropZone'
import UploadFileList from '../components/UploadFileList'
import Uploader from '../components/Uploader'
import PasswordField from '../components/PasswordField'
import StartButton from '../components/StartButton'
import { UploadedFile } from '../types'
import Wordmark from '../components/Wordmark'
import CancelButton from '../components/CancelButton'
import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getFileName } from '../fs'
import TitleText from '../components/TitleText'
import SubtitleText from '../components/SubtitleText'
import { pluralize } from '../utils/pluralize'
import AddFilesButton from '../components/AddFilesButton'

function PageWrapper({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="w-full flex items-center justify-between py-6 px-8 max-w-[1400px] mx-auto">
        <div className="flex items-center gap-3">
          <Wordmark />
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-300">
          <a href="#" className="hover:text-white transition-colors">Contact</a>
          <a href="#" className="hover:text-white transition-colors">About</a>
          <a href="#" className="hover:text-white transition-colors">Blog</a>
          <a href="#" className="hover:text-white transition-colors">FAQ</a>
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <button className="bg-[#f37021] hover:bg-[#e0661e] text-white px-5 py-2 rounded-full font-semibold transition-colors">
            Download
          </button>
        </nav>
      </header>
      <main className="flex-1 flex flex-col items-center py-14 max-w-6xl w-full mx-auto px-5 animate-fade-in">
        {children}
      </main>
    </div>
  )
}

function InitialState({
  onDrop,
}: {
  onDrop: (files: UploadedFile[]) => void
}): JSX.Element {
  return (
    <div className="w-full flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-24 mt-10 md:mt-20">
      {/* Left side: DropZone */}
      <div className="w-full md:w-5/12 flex justify-center md:justify-end shrink-0">
         <DropZone onDrop={onDrop} />
      </div>
      
      {/* Right side: Text and features */}
      <div className="w-full md:w-7/12 flex flex-col items-start text-left space-y-6">
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.15]">
          Share files directly from your device to anywhere
        </h1>
        <p className="text-lg text-stone-300 leading-relaxed max-w-xl">
          Send files of any size directly from your device without ever storing anything online.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 w-full mt-4 font-medium">
          <div className="flex items-center space-x-3 text-stone-200">
             <span className="text-[#f37021] text-lg">♾️</span>
             <span>No file size limit</span>
          </div>
          <div className="flex items-center space-x-3 text-stone-200">
             <span className="text-[#f37021] text-lg">⚡</span>
             <span>Blazingly fast</span>
          </div>
          <div className="flex items-center space-x-3 text-stone-200">
             <span className="text-[#f37021] text-lg">🔄</span>
             <span>Peer-to-peer</span>
          </div>
          <div className="flex items-center space-x-3 text-stone-200">
             <span className="text-[#f37021] text-lg">🔒</span>
             <span>End-to-end encrypted</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function useUploaderFileListData(uploadedFiles: UploadedFile[]) {
  return useMemo(() => {
    return uploadedFiles.map((item) => ({
      fileName: getFileName(item),
      type: item.type,
    }))
  }, [uploadedFiles])
}

function ConfirmUploadState({
  uploadedFiles,
  password,
  onChangePassword,
  onCancel,
  onStart,
  onRemoveFile,
  onAddFiles,
  burnAfterReading,
  onToggleBurn,
}: {
  uploadedFiles: UploadedFile[]
  password: string
  onChangePassword: (pw: string) => void
  onCancel: () => void
  onStart: () => void
  onRemoveFile: (index: number) => void
  onAddFiles: (files: UploadedFile[]) => void
  burnAfterReading: boolean
  onToggleBurn: () => void
}): JSX.Element {
  const fileListData = useUploaderFileListData(uploadedFiles)
  return (
    <>
      <TitleText>
        You are about to share{' '}
        {pluralize(uploadedFiles.length, 'file', 'files')}.{' '}
        <AddFilesButton onAdd={onAddFiles} />
      </TitleText>
      <UploadFileList files={fileListData} onRemove={onRemoveFile} />
      <PasswordField value={password} onChange={onChangePassword} />

      <div
        className="flex items-center space-x-2 w-full justify-center mt-2 cursor-pointer"
        onClick={onToggleBurn}
      >
        <input
          type="checkbox"
          checked={burnAfterReading}
          readOnly
          className="w-4 h-4 text-[#F59E0B] bg-transparent border-stone-700 rounded focus:ring-[#F59E0B]"
        />
        <label className="text-sm font-medium text-stone-400 cursor-pointer select-none">
          Burn after pouring (Close link after 1 download)
        </label>
      </div>

      <div className="flex gap-3">
        <CancelButton onClick={onCancel} />
        <StartButton onClick={onStart} />
      </div>
    </>
  )
}

function UploadingState({
  uploadedFiles,
  password,
  burnAfterReading,
  onStop,
}: {
  uploadedFiles: UploadedFile[]
  password: string
  burnAfterReading: boolean
  onStop: () => void
}): JSX.Element {
  return (
    <>
      <TitleText>
        You are sharing {pluralize(uploadedFiles.length, 'file', 'files')}.
      </TitleText>
      <SubtitleText>
        Keep this tab open. CoffeeShare transfers files directly — nothing is
        stored.
      </SubtitleText>
      <WebRTCPeerProvider>
        <Uploader
          files={uploadedFiles}
          password={password}
          burnAfterReading={burnAfterReading}
          onStop={onStop}
        />
      </WebRTCPeerProvider>
    </>
  )
}

export default function UploadPage(): JSX.Element {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [password, setPassword] = useState('')
  const [uploading, setUploading] = useState(false)
  const [burnAfterReading, setBurnAfterReading] = useState(false)

  const handleDrop = useCallback((files: UploadedFile[]): void => {
    setUploadedFiles(files)
  }, [])

  const handleChangePassword = useCallback((pw: string) => {
    setPassword(pw)
  }, [])

  const handleStart = useCallback(() => {
    setUploading(true)
  }, [])

  const handleToggleBurn = useCallback(() => {
    setBurnAfterReading((b) => !b)
  }, [])

  const handleStop = useCallback(() => {
    setUploading(false)
  }, [])

  const handleCancel = useCallback(() => {
    setUploadedFiles([])
    setUploading(false)
  }, [])

  const handleRemoveFile = useCallback((index: number) => {
    setUploadedFiles((fs) => fs.filter((_, i) => i !== index))
  }, [])

  const handleAddFiles = useCallback((files: UploadedFile[]) => {
    setUploadedFiles((fs) => [...fs, ...files])
  }, [])

  return (
    <PageWrapper>
      <AnimatePresence mode="popLayout">
        {!uploadedFiles.length ? (
          <motion.div
            key="initial"
            className="flex flex-col items-center w-full space-y-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
          >
            <InitialState onDrop={handleDrop} />
          </motion.div>
        ) : !uploading ? (
          <motion.div
            key="confirm"
            className="flex flex-col items-center w-full space-y-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
          >
            <ConfirmUploadState
              uploadedFiles={uploadedFiles}
              password={password}
              onChangePassword={handleChangePassword}
              onCancel={handleCancel}
              onStart={handleStart}
              onRemoveFile={handleRemoveFile}
              onAddFiles={handleAddFiles}
              burnAfterReading={burnAfterReading}
              onToggleBurn={handleToggleBurn}
            />
          </motion.div>
        ) : (
          <motion.div
            key="uploading"
            className="flex flex-col items-center w-full space-y-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
          >
            <UploadingState
              uploadedFiles={uploadedFiles}
              password={password}
              burnAfterReading={burnAfterReading}
              onStop={handleStop}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {!uploadedFiles.length && (
        <section className="mt-24 w-full flex flex-col items-center text-center pb-20 border-t border-stone-800 pt-16">
          <h2 className="text-3xl font-bold text-white mb-10">What is CoffeeShare?</h2>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 w-full max-w-4xl opacity-80 mb-16">
            <div className="flex flex-col items-center">
              <div className="text-stone-400 text-sm mb-2 font-medium">Upload to server</div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-12 border-2 border-stone-600 rounded-lg flex items-center justify-center">
                   <div className="w-8 h-8 rounded-full border-2 border-[#f37021] text-[#f37021] flex items-center justify-center text-xl">↑</div>
                </div>
                <div className="w-24 h-[2px] bg-stone-600 relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-stone-600 rotate-45"></div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-stone-800 rounded-full flex items-center justify-center">☁️</div>
                  <div className="text-stone-500 text-xs mt-2 text-center">Third Party<br/>Max file size (2GB)<br/>Your files on their servers</div>
                </div>
              </div>
            </div>
            
            <div className="hidden md:block w-[2px] h-32 bg-stone-800"></div>

            <div className="flex flex-col items-center">
              <div className="text-[#f37021] text-lg font-bold mb-2">CoffeeShare</div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-12 border-2 border-[#f37021] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(243,112,33,0.3)]">
                   <div className="w-8 h-8 rounded-full border-2 border-[#f37021] text-[#f37021] flex items-center justify-center text-xl">↑</div>
                </div>
                <div className="w-32 h-[2px] bg-[#f37021] relative flex flex-col items-center justify-center">
                   <div className="absolute top-1 text-[10px] text-stone-400 w-max">Speed & Data size</div>
                   <div className="absolute -bottom-4 text-[10px] text-stone-400 w-max">Direct & safe connection</div>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-[#f37021] rotate-45"></div>
                </div>
                <div className="w-16 h-12 border-2 border-[#f37021] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(243,112,33,0.3)]">
                   <div className="w-8 h-8 rounded-full border-2 border-[#f37021] text-[#f37021] flex items-center justify-center text-xl">↓</div>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-2xl text-stone-300 space-y-6 italic leading-relaxed">
            <p>
              We are a free and independent peer-to-peer (P2P) file sharing service that prioritizes your privacy and keeps your data safe. We store nothing online: simply close your browser to stop sending.
            </p>
            <p>
              Our mission is to make sure people keep their data safely into their own hands, as it should be.
            </p>
          </div>
        </section>
      )}
    </PageWrapper>
  )
}
