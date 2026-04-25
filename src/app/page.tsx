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
import ParticleBackground from '../components/animations/ParticleBackground'
import StaggerText from '../components/animations/StaggerText'
import StaggerCards from '../components/animations/StaggerCards'

function PageWrapper({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <div className="flex flex-col min-h-screen relative">
      <ParticleBackground />
      <header className="w-full flex items-center justify-between py-6 px-8 max-w-[1400px] mx-auto relative z-10">
        <div className="flex items-center gap-3">
          <Wordmark />
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center py-14 max-w-6xl w-full mx-auto px-5 relative z-10">
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
    <div className="w-full flex flex-col md:flex-row items-center justify-between gap-16 lg:gap-20 mt-12 md:mt-24">
      {/* Right side: Text and features (Now on the left for better reading flow) */}
      <div className="w-full md:w-1/2 flex flex-col items-start text-left space-y-8 relative z-10 order-2 md:order-1">
        <h1 className="text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter text-white leading-[1.1] drop-shadow-2xl">
          <StaggerText text="Share files" />
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-stone-200 to-stone-500">
            <StaggerText text="directly." delay={300} />
          </span>
        </h1>
        <p className="text-xl text-stone-400 font-medium leading-relaxed max-w-lg tracking-tight">
          Send files of any size directly from your device without ever storing anything online. Fast, secure, and peer-to-peer.
        </p>
        
        <StaggerCards className="flex flex-wrap gap-3 w-full mt-2 font-medium" delay={600}>
          <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-stone-200 shadow-xl shadow-black/20">
             <span className="text-[#f37021]">♾️</span>
             <span className="text-sm">No size limit</span>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-stone-200 shadow-xl shadow-black/20">
             <span className="text-[#f37021]">⚡</span>
             <span className="text-sm">Blazingly fast</span>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-stone-200 shadow-xl shadow-black/20">
             <span className="text-[#f37021]">🔄</span>
             <span className="text-sm">Peer-to-peer</span>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-stone-200 shadow-xl shadow-black/20">
             <span className="text-[#f37021]">🔒</span>
             <span className="text-sm">E2E encrypted</span>
          </div>
        </StaggerCards>
      </div>

      {/* Left side: DropZone (Now on the right) */}
      <div className="w-full md:w-1/2 flex justify-center md:justify-end shrink-0 order-1 md:order-2 relative">
         <div className="absolute inset-0 bg-[#f37021]/20 blur-[100px] rounded-full translate-x-10 translate-y-10 pointer-events-none" />
         <DropZone onDrop={onDrop} />
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
        <section className="mt-32 w-full flex flex-col items-center text-center pb-20 border-t border-white/5 pt-20">
          <h2 className="text-4xl font-black tracking-tight text-white mb-16">How CoffeeShare Works</h2>
          
          <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 w-full max-w-5xl mb-24">
            {/* The Old Way */}
            <div className="flex-1 bg-stone-900/50 backdrop-blur-sm border border-white/5 rounded-3xl p-8 flex flex-col items-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-stone-800 to-stone-600" />
              <div className="text-stone-400 font-bold uppercase tracking-widest text-xs mb-8">The Old Way</div>
              
              <div className="flex flex-col items-center w-full gap-4">
                <div className="flex items-center justify-between w-full px-4">
                  <div className="w-12 h-12 bg-stone-800 rounded-xl flex items-center justify-center border border-white/5">💻</div>
                  <div className="flex-1 h-px bg-stone-800 relative mx-2">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-t border-r border-stone-600 rotate-45"></div>
                  </div>
                  <div className="w-16 h-16 bg-stone-800 rounded-full flex items-center justify-center border border-white/5 shadow-inner text-2xl">☁️</div>
                  <div className="flex-1 h-px bg-stone-800 relative mx-2">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-t border-r border-stone-600 rotate-45"></div>
                  </div>
                  <div className="w-12 h-12 bg-stone-800 rounded-xl flex items-center justify-center border border-white/5">📱</div>
                </div>
                <ul className="text-stone-500 text-sm text-left w-full max-w-[200px] mt-4 space-y-2">
                  <li className="flex items-center gap-2"><span className="text-red-500/70">✗</span> Stored on their servers</li>
                  <li className="flex items-center gap-2"><span className="text-red-500/70">✗</span> Strict file size limits</li>
                  <li className="flex items-center gap-2"><span className="text-red-500/70">✗</span> Slower transfers</li>
                </ul>
              </div>
            </div>
            
            {/* The VS Badge */}
            <div className="hidden md:flex items-center justify-center w-12 z-10 -mx-9">
              <div className="w-10 h-10 bg-black rounded-full border border-white/10 flex items-center justify-center text-stone-500 text-xs font-bold italic shadow-2xl shadow-black">
                VS
              </div>
            </div>

            {/* CoffeeShare Way */}
            <div className="flex-1 bg-gradient-to-b from-[#f37021]/10 to-transparent backdrop-blur-md border border-[#f37021]/30 rounded-3xl p-8 flex flex-col items-center relative overflow-hidden shadow-[0_0_50px_rgba(243,112,33,0.05)]">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#f37021] to-[#ff985c]" />
              <div className="text-[#f37021] font-bold uppercase tracking-widest text-xs mb-8">With CoffeeShare</div>
              
              <div className="flex flex-col items-center w-full gap-4">
                <div className="flex items-center justify-between w-full px-4">
                  <div className="w-12 h-12 bg-[#f37021]/20 rounded-xl flex items-center justify-center border border-[#f37021]/40 text-xl shadow-[0_0_15px_rgba(243,112,33,0.3)]">💻</div>
                  <div className="flex-1 h-0.5 bg-gradient-to-r from-[#f37021]/50 to-[#f37021] relative mx-3">
                    <div className="absolute left-1/2 -top-6 -translate-x-1/2 text-[10px] text-[#f37021] font-mono font-bold whitespace-nowrap">Direct P2P</div>
                    <div className="absolute left-1/2 top-4 -translate-x-1/2 text-[10px] text-[#f37021]/70 font-mono whitespace-nowrap opacity-75 animate-pulse">Encrypted</div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-[#f37021] rotate-45 shadow-[0_0_5px_rgba(243,112,33,0.5)]"></div>
                  </div>
                  <div className="w-12 h-12 bg-[#f37021]/20 rounded-xl flex items-center justify-center border border-[#f37021]/40 text-xl shadow-[0_0_15px_rgba(243,112,33,0.3)]">📱</div>
                </div>
                <ul className="text-stone-300 text-sm text-left w-full max-w-[200px] mt-4 space-y-2">
                  <li className="flex items-center gap-2"><span className="text-green-500">✓</span> No server storage</li>
                  <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Infinite file size</li>
                  <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Lightning fast</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="max-w-3xl text-stone-400 space-y-6 text-lg leading-relaxed font-medium">
            <p>
              We are a <strong className="text-stone-200 font-bold">free and independent</strong> peer-to-peer (P2P) file sharing service that prioritizes your privacy. We store absolutely nothing online. 
            </p>
            <p>
              Simply close your browser to stop sending. Our mission is to put data safely back into your hands, exactly where it belongs.
            </p>
          </div>
        </section>
      )}
    </PageWrapper>
  )
}
