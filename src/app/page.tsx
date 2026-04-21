'use client'

import dynamic from 'next/dynamic'
import React, { JSX, useCallback, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Flame,
  Home,
  Link2,
  Shield,
  Sparkles
} from 'lucide-react'
import AddFilesButton from '../components/AddFilesButton'
import CancelButton from '../components/CancelButton'
import DropZone from '../components/DropZone'
import PasswordField from '../components/PasswordField'
import ParticleBackground from '../components/animations/ParticleBackground'
import StaggerCards from '../components/animations/StaggerCards'
import StaggerText from '../components/animations/StaggerText'
import StartButton from '../components/StartButton'
import SubtitleText from '../components/SubtitleText'
import TitleText from '../components/TitleText'
import UploadFileList from '../components/UploadFileList'
import Uploader from '../components/Uploader'
import TransferHistory from '../components/TransferHistory'
import WebRTCPeerProvider from '../components/WebRTCProvider'
import Wordmark from '../components/Wordmark'
import { getFileName } from '../fs'
import { UploadedFile } from '../types'
import { pluralize } from '../utils/pluralize'

const MarketingSections = dynamic(
  () => import('../components/landing/MarketingSections'),
  { loading: () => <div className="w-full h-24" /> },
)

function PageWrapper({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      <header className="sticky top-0 z-40 w-full border-b-4 border-[var(--border-strong)] bg-[var(--bg-app)]">
        <div className="w-full flex items-center justify-between py-4 px-4 md:px-8 max-w-[1240px] mx-auto">
          <Wordmark />
          <nav className="flex items-center gap-3 md:gap-6">
            <a href="/" className="flex items-center gap-2 font-black uppercase tracking-widest text-xs md:text-sm hover:text-brand transition-colors bg-[var(--bg-elevated)] px-3 md:px-4 py-1.5 md:py-2 border-4 border-[var(--border-strong)] shadow-[2px_2px_0px_0px_var(--shadow-color)] group">
              <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Home</span>
            </a>
            <div className="hidden lg:flex items-center gap-6">
              <a href="#hero" className="font-bold uppercase tracking-widest text-sm hover:text-brand transition-colors">Overview</a>
              <a href="#demo" className="font-bold uppercase tracking-widest text-sm hover:text-brand transition-colors">Live Demo</a>
              <a href="#features" className="font-bold uppercase tracking-widest text-sm hover:text-brand transition-colors">Features</a>
              <a href="#security" className="font-bold uppercase tracking-widest text-sm hover:text-brand transition-colors">Security</a>
              <a href="#faq" className="font-bold uppercase tracking-widest text-sm hover:text-brand transition-colors">FAQ</a>
            </div>
          </nav>
          <a href="#drop-zone-button" className="btn btn-hero hidden sm:flex">Start Sharing</a>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center py-10 max-w-7xl w-full mx-auto px-4 md:px-6 relative z-10">
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
    <section id="hero" className="w-full flex flex-col lg:flex-row items-stretch justify-between gap-10 mt-4 md:mt-10 mb-16 relative">
      <div className="w-full lg:w-[56%] flex flex-col items-start text-left gap-8 relative z-10 order-2 lg:order-1 pt-4">
        
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="inline-flex items-center gap-2 rounded-none border-4 border-[var(--border-strong)] bg-bauhaus-yellow px-4 py-2 shadow-[4px_4px_0px_0px_var(--shadow-color)]"
        >
          <Sparkles className="w-4 h-4 text-primary" strokeWidth={3} />
          <span className="text-xs font-black uppercase tracking-widest text-primary">Browser-to-browser engine</span>
        </motion.div>

        <h1 className="heading-display text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter uppercase break-words w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>Peer-to-peer</motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="text-brand">file sharing,</motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>refined.</motion.div>
        </h1>
        <p className="text-lg md:text-xl text-primary font-bold leading-relaxed max-w-2xl border-l-4 border-brand pl-4 py-1">
          Send directly over WebRTC with end-to-end encryption, optional one-time links, password locks, and live collaboration.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-xl"
        >
          <div className="bg-white border-4 border-[var(--border-strong)] shadow-[4px_4px_0px_0px_var(--shadow-color)] p-4 flex flex-col items-center justify-center text-center gap-2 transform hover:-translate-y-1 transition-transform">
            <Link2 className="w-6 h-6 text-bauhaus-red" strokeWidth={3} />
            <div className="font-bold uppercase text-xs tracking-widest text-primary">Link Ready</div>
            <p className="text-primary font-black text-lg">~2s avg</p>
          </div>
          <div className="bg-white border-4 border-[var(--border-strong)] shadow-[4px_4px_0px_0px_var(--shadow-color)] p-4 flex flex-col items-center justify-center text-center gap-2 transform hover:-translate-y-1 transition-transform">
            <Shield className="w-6 h-6 text-bauhaus-blue" strokeWidth={3} />
            <div className="font-bold uppercase text-xs tracking-widest text-primary">Security</div>
            <p className="text-primary font-black text-lg">DTLS Encrypted</p>
          </div>
          <div className="bg-white border-4 border-[var(--border-strong)] shadow-[4px_4px_0px_0px_var(--shadow-color)] p-4 flex flex-col items-center justify-center text-center gap-2 transform hover:-translate-y-1 transition-transform">
            <Flame className="w-6 h-6 text-bauhaus-yellow" strokeWidth={3} />
            <div className="font-bold uppercase text-xs tracking-widest text-primary">Burn Mode</div>
            <p className="text-primary font-black text-lg">One-time links</p>
          </div>
        </motion.div>
      </div>

      <div className="w-full lg:w-[44%] flex justify-center lg:justify-end shrink-0 order-1 lg:order-2 relative" id="demo">
        {/* Geometric Composition Background */}
        <div className="absolute inset-0 z-0 pointer-events-none hidden lg:block">
          <div className="absolute top-10 right-10 w-64 h-64 bg-bauhaus-blue rounded-full border-4 border-strong shadow-[8px_8px_0px_0px_var(--shadow-color)] opacity-20 transform translate-x-10 -translate-y-10" />
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-bauhaus-yellow border-4 border-strong shadow-[8px_8px_0px_0px_var(--shadow-color)] opacity-20 transform -rotate-12" />
          <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-bauhaus-red border-4 border-strong shadow-[8px_8px_0px_0px_var(--shadow-color)] opacity-20 transform rotate-45" />
        </div>

        <div className="w-full max-w-md space-y-4 relative z-10 mt-8 lg:mt-0">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
            className="surface px-4 py-3.5 flex items-center justify-between bg-white"
          >
            <div>
              <p className="text-[11px] uppercase tracking-widest text-brand font-black">Live transfer engine</p>
              <p className="text-sm md:text-base text-primary font-bold">
                Drop files to launch a live link
              </p>
            </div>
            <div className="w-3 h-3 rounded-none bg-[var(--bauhaus-red)] shadow-[2px_2px_0px_0px_var(--shadow-color)] border-2 border-[var(--border-strong)]" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4, ease: "easeOut" }}
            className="w-full panel bg-bauhaus-yellow text-black"
          >
            <DropZone onDrop={onDrop} />
          </motion.div>
        </div>
      </div>
    </section>
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
    <section className="w-full max-w-3xl border-4 border-[var(--border-strong)] bg-white shadow-[8px_8px_0px_0px_var(--shadow-color)] p-8 md:p-12 flex flex-col items-center mt-8">
      <div className="flex flex-col items-center gap-6 mb-8 w-full">
        <TitleText>
          You are about to share{' '}
          {pluralize(uploadedFiles.length, 'file', 'files')}.
        </TitleText>
        <AddFilesButton onAdd={onAddFiles} />
      </div>

      <div className="w-full space-y-6">
        <UploadFileList files={fileListData} onRemove={onRemoveFile} />
        <PasswordField value={password} onChange={onChangePassword} />

        <button
          type="button"
          className="flex items-center space-x-3 w-full justify-center py-4 cursor-pointer btn btn-ghost border-4 border-transparent hover:border-[var(--border-strong)] transition-all bg-[var(--bg-elevated)] hover:bg-bauhaus-yellow group"
          onClick={onToggleBurn}
        >
          <Flame className={`w-5 h-5 ${burnAfterReading ? 'text-bauhaus-red' : 'text-primary'}`} strokeWidth={3} />
          <span className="text-sm font-black uppercase tracking-widest text-primary">
            Burn after pouring (close link after 1 download)
          </span>
        </button>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 w-full border-t-4 border-[var(--border-strong)] pt-8">
          <CancelButton onClick={onCancel} />
          <StartButton onClick={onStart} />
        </div>
      </div>
    </section>
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
    <section className="w-full max-w-4xl flex flex-col items-center">
      <div className="w-full mb-8 flex flex-col items-center mt-4">
        <h2 className="heading-display text-primary text-3xl md:text-5xl font-black text-center bg-bauhaus-yellow px-6 py-3 border-4 border-[var(--border-strong)] shadow-[4px_4px_0px_0px_var(--shadow-color)]">
          You are sharing {pluralize(uploadedFiles.length, 'file', 'files')}.
        </h2>
        <p className="text-primary text-sm md:text-base font-bold tracking-widest uppercase mt-6 text-center max-w-2xl bg-white border-4 border-[var(--border-strong)] px-4 py-2">
          Keep this tab open. CoffeeShare transfers files directly - nothing is stored.
        </p>
      </div>
      <WebRTCPeerProvider>
        <Uploader
          files={uploadedFiles}
          password={password}
          burnAfterReading={burnAfterReading}
          onStop={onStop}
        />
      </WebRTCPeerProvider>
    </section>
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
            <MarketingSections />
          </motion.div>
        ) : !uploading ? (
          <motion.div
            key="confirm"
            className="flex flex-col items-center w-full space-y-6 pt-4"
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
      <TransferHistory />
    </PageWrapper>
  )
}
// .
