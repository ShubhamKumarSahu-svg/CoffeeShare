'use client'

import dynamic from 'next/dynamic'
import React, { JSX, useCallback, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Flame,
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
      <ParticleBackground />
      <div className="mesh-overlay" />
      <div className="noise-overlay" />
      <header className="sticky top-0 z-40 w-full border-b border-[var(--border-subtle)] bg-[oklch(0.16_0.02_30_/72%)] backdrop-blur-xl">
        <div className="w-full flex items-center justify-between py-4 px-4 md:px-8 max-w-[1240px] mx-auto">
          <Wordmark />
          <nav className="hidden lg:flex items-center gap-2">
            <a href="#hero" className="nav-pill">Overview</a>
            <a href="#demo" className="nav-pill">Live Demo</a>
            <a href="#features" className="nav-pill">Features</a>
            <a href="#security" className="nav-pill">Security</a>
            <a href="#faq" className="nav-pill">FAQ</a>
          </nav>
          <a href="#drop-zone-button" className="btn btn-hero">Start Sharing</a>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center py-10 max-w-6xl w-full mx-auto px-4 md:px-5 relative z-10">
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
    <section id="hero" className="w-full flex flex-col lg:flex-row items-start justify-between gap-10 mt-4 md:mt-10">
      <div className="w-full lg:w-[56%] flex flex-col items-start text-left gap-6 relative z-10 order-2 lg:order-1">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--bg-muted)] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-brand"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Browser-to-browser sharing engine
        </motion.div>

        <h1 className="heading-display text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.03]">
          <StaggerText text="Peer-to-peer" />
          <br />
          <StaggerText
            text="file sharing, refined."
            delay={220}
            className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--brand)] via-[var(--text-primary)] to-[var(--text-secondary)]"
          />
        </h1>
        <p className="text-lg md:text-xl text-secondary font-medium leading-relaxed max-w-2xl">
          Send directly over WebRTC with end-to-end encryption, optional one-time links, password locks, and live collaboration while transfer runs.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="grid grid-cols-3 gap-3 w-full max-w-xl"
        >
          <div className="panel rounded-2xl p-3">
            <div className="inline-flex items-center gap-1.5 text-muted text-[11px] uppercase tracking-wider">
              <Link2 className="w-3.5 h-3.5 text-brand" />
              Link Ready
            </div>
            <p className="text-primary font-bold text-sm mt-1">~2s average</p>
          </div>
          <div className="panel rounded-2xl p-3">
            <div className="inline-flex items-center gap-1.5 text-muted text-[11px] uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5 text-brand" />
              Security
            </div>
            <p className="text-primary font-bold text-sm mt-1">DTLS encrypted</p>
          </div>
          <div className="panel rounded-2xl p-3">
            <div className="inline-flex items-center gap-1.5 text-muted text-[11px] uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-brand" />
              Burn Mode
            </div>
            <p className="text-primary font-bold text-sm mt-1">One-time links</p>
          </div>
        </motion.div>

        <StaggerCards className="flex flex-wrap gap-2.5 w-full mt-1 font-medium" delay={420}>
          {['No cloud staging', 'Password protected', 'Live chat + voice', 'Mobile ready'].map((item) => (
            <span key={item} className="nav-pill">
              {item}
            </span>
          ))}
        </StaggerCards>
      </div>

      <div className="w-full lg:w-[44%] flex justify-center lg:justify-end shrink-0 order-1 lg:order-2 relative" id="demo">
        <div className="w-full max-w-md space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.4 }}
            className="surface rounded-2xl px-4 py-3.5 flex items-center justify-between border border-[var(--border-subtle)]"
          >
            <div>
              <p className="text-[11px] uppercase tracking-wider text-brand font-semibold">Live transfer engine</p>
              <p className="text-sm md:text-base text-primary font-semibold">
                Drop files to launch a live link
              </p>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--brand)] animate-pulse shadow-[0_0_0_4px_var(--brand-soft)]" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="w-full animate-[breathe_4s_ease-in-out_infinite]"
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
    <section className="w-full max-w-3xl surface rounded-3xl p-6 md:p-8">
      <TitleText>
        You are about to share{' '}
        {pluralize(uploadedFiles.length, 'file', 'files')}.{' '}
        <AddFilesButton onAdd={onAddFiles} />
      </TitleText>
      <UploadFileList files={fileListData} onRemove={onRemoveFile} />
      <PasswordField value={password} onChange={onChangePassword} />

      <button
        type="button"
        className="flex items-center space-x-2 w-full justify-center mt-3 cursor-pointer btn btn-ghost"
        onClick={onToggleBurn}
      >
        <Flame className={`w-4 h-4 ${burnAfterReading ? 'text-brand' : 'text-muted'}`} />
        <span className="text-sm font-medium text-secondary">
          Burn after pouring (close link after 1 download)
        </span>
      </button>

      <div className="flex gap-3 justify-center mt-4">
        <CancelButton onClick={onCancel} />
        <StartButton onClick={onStart} />
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
    <section className="w-full max-w-4xl">
      <div className="w-full mb-5 md:mb-6 px-1">
        <h2 className="heading-display text-primary text-3xl md:text-4xl font-bold text-center md:text-left">
          You are sharing {pluralize(uploadedFiles.length, 'file', 'files')}.
        </h2>
        <p className="text-secondary text-sm md:text-base mt-2 text-center md:text-left max-w-2xl">
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
