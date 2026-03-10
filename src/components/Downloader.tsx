'use client'

import React, { JSX, useState, useCallback, useEffect } from 'react'
import { useDownloader } from '../hooks/useDownloader'
import confetti from 'canvas-confetti'
import PasswordField from './PasswordField'
import UnlockButton from './UnlockButton'
import Loading from './Loading'
import UploadFileList from './UploadFileList'
import DownloadButton from './DownloadButton'
import { supportsFileSystemAccessAPI } from '../utils/download'

import ProgressBar from './ProgressBar'
import TitleText from './TitleText'
import ReturnHome from './ReturnHome'
import { Pause, Play, Square } from 'lucide-react'
import { pluralize } from '../utils/pluralize'
import { formatBytes } from '../utils/format'
import { playDingSound } from '../utils/sound'
import { ErrorMessage } from './ErrorMessage'
import Spinner from './Spinner'
import ChatDrawer from './ChatDrawer'
import GameHub from './GameHub'
import VideoChat from './VideoChat'

interface FileInfo {
  fileName: string
  size: number
  type: string
}

export function ConnectingToUploader({
  showTroubleshootingAfter = 3000,
}: {
  showTroubleshootingAfter?: number
}): JSX.Element {
  const [showTroubleshooting, setShowTroubleshooting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTroubleshooting(true)
    }, showTroubleshootingAfter)
    return () => clearTimeout(timer)
  }, [showTroubleshootingAfter])

  if (!showTroubleshooting) {
    return <Loading text="Connecting to sender..." />
  }

  return (
    <>
      <Loading text="Connecting to sender..." />

      <div className="surface rounded-2xl p-7 max-w-md w-full animate-slide-up">
        <h2 className="text-lg font-bold mb-3 text-[#2c2c2c] dark:text-[#e0ddd8]">
          Having trouble connecting?
        </h2>

        <div className="space-y-3 text-[#5a5550] dark:text-[#9a9690]">
          <p className="text-sm">
            CoffeeShare uses direct peer-to-peer connections, but sometimes the
            connection can get stuck.
          </p>

          <ul className="list-none space-y-2">
            <li className="flex items-start gap-3 px-4 py-3 rounded-xl bg-[#f7f5f2] dark:bg-[#1e1e1c] text-sm">
              <span>🚪</span>
              <span>
                The sender may have closed their browser or stopped sharing.
                CoffeeShare requires the sender to stay online.
              </span>
            </li>
            <li className="flex items-start gap-3 px-4 py-3 rounded-xl bg-[#f7f5f2] dark:bg-[#1e1e1c] text-sm">
              <span>🔒</span>
              <span>
                Your network might have strict firewalls or NAT settings
              </span>
            </li>
            <li className="flex items-start gap-3 px-4 py-3 rounded-xl bg-[#f7f5f2] dark:bg-[#1e1e1c] text-sm">
              <span>🌐</span>
              <span>
                Some corporate or school networks block P2P connections
              </span>
            </li>
          </ul>
        </div>
      </div>
      <ReturnHome />
    </>
  )
}

export function DownloadComplete({
  filesInfo,
  bytesDownloaded,
  totalSize,
}: {
  filesInfo: FileInfo[]
  bytesDownloaded: number
  totalSize: number
}): JSX.Element {
  useEffect(() => {
    playDingSound()
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D2B48C', '#8B4513', '#6F4E37', '#A9A9A9'],
    })
  }, [])

  return (
    <>
      <TitleText>
        You downloaded {pluralize(filesInfo.length, 'file', 'files')}.
      </TitleText>
      <div className="flex flex-col space-y-5 w-full animate-slide-up">
        <UploadFileList files={filesInfo} />
        <div className="w-full">
          <ProgressBar value={bytesDownloaded} max={totalSize} />
        </div>
        <ReturnHome />
      </div>
    </>
  )
}

export function DownloadInProgress({
  filesInfo,
  bytesDownloaded,
  totalSize,
  isPaused,
  onStop,
  onPause,
  onResume,
  livePreviewUrls,
}: {
  filesInfo: FileInfo[]
  bytesDownloaded: number
  totalSize: number
  isPaused: boolean
  onStop: () => void
  onPause: () => void
  onResume: () => void
  livePreviewUrls: Record<string, string>
}): JSX.Element {
  const [speed, setSpeed] = useState(0)
  const [activePreview, setActivePreview] = useState<string | null>(null)

  useEffect(() => {
    let lastBytes = bytesDownloaded
    const interval = setInterval(() => {
      setSpeed(bytesDownloaded - lastBytes)
      lastBytes = bytesDownloaded
    }, 1000)
    return () => clearInterval(interval)
  }, [bytesDownloaded])

  return (
    <>
      <TitleText>
        {isPaused ? 'Download paused.' : `You are downloading ${pluralize(filesInfo.length, 'file', 'files')}.`}
      </TitleText>

      {/* Live Preview Player */}
      {activePreview && (
        <div className="w-full bg-black rounded-2xl overflow-hidden shadow-2xl relative animate-scale-in aspect-video mb-4">
          <video
            src={activePreview}
            controls
            autoPlay
            className="w-full h-full object-contain"
            onError={(e) => console.error("Video playback error", e)}
          />
          <button
            onClick={() => setActivePreview(null)}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition-colors"
          >
            <Square className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col space-y-5 w-full">
        {/* File List with Preview Buttons */}
        <div className="flex flex-col gap-2 w-full">
          {filesInfo.map((file, i) => {
            const previewUrl = livePreviewUrls[file.fileName]
            return (
              <div key={i} className="flex items-center justify-between p-3 surface rounded-xl">
                <div className="flex flex-col truncate pr-4">
                  <span className="font-medium text-stone-200 truncate">{file.fileName}</span>
                  <span className="text-xs text-stone-500">{formatBytes(file.size)}</span>
                </div>
                {previewUrl && activePreview !== previewUrl && (
                  <button
                    onClick={() => setActivePreview(previewUrl)}
                    className="shrink-0 px-3 py-1.5 bg-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-stone-950 transition-colors text-xs font-bold rounded-lg flex items-center gap-1"
                  >
                    <Play className="w-3 h-3" /> Watch Live
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <div className="w-full">
          <div className="flex justify-between items-center mb-1 text-xs text-[#8a8580] dark:text-[#6a6660] mono">
            <span>{Math.round((bytesDownloaded / totalSize) * 100)}%</span>
            <span>{formatBytes(speed)}/s</span>
          </div>
          <ProgressBar value={bytesDownloaded} max={totalSize} />
        </div>
        <div className="flex justify-center w-full gap-4">
          {!isPaused ? (
            <button
              onClick={onPause}
              className="flex items-center gap-2 px-6 py-3 bg-stone-800 text-stone-100 rounded-xl hover:bg-stone-700 hover:text-amber-500 transition-colors font-bold group"
            >
              <Pause className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Pause
            </button>
          ) : (
            <button
              onClick={onResume}
              className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-stone-950 rounded-xl hover:bg-amber-400 transition-colors font-bold shadow-lg shadow-amber-500/20 group animate-pulse"
            >
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Resume
            </button>
          )}
          <button
            onClick={onStop}
            className="flex items-center gap-2 px-6 py-3 bg-stone-800 text-stone-100 rounded-xl hover:bg-red-500/20 hover:text-red-500 transition-colors font-bold group"
          >
            <Square className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Stop
          </button>
        </div>
      </div>
    </>
  )
}

export function ReadyToDownload({
  filesInfo,
  onStart,
}: {
  filesInfo: FileInfo[]
  onStart: (useNativeFS: boolean) => void
}): JSX.Element {
  return (
    <>
      <TitleText>
        You are about to download {pluralize(filesInfo.length, 'file', 'files')}
        .
      </TitleText>
      <div className="flex flex-col space-y-5 w-full animate-scale-in">
        <UploadFileList files={filesInfo} />
        
        {filesInfo.length > 1 && supportsFileSystemAccessAPI() ? (
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onStart(false)}
              className="flex-1 px-5 py-3.5 rounded-2xl bg-stone-800 text-stone-100 font-bold hover:bg-stone-700 transition-colors border border-stone-700 shadow-md text-sm"
            >
              Download as .zip
            </button>
            <button
              onClick={() => onStart(true)}
              className="flex-1 px-5 py-3.5 rounded-2xl bg-[#f37021] hover:bg-[#e0661e] text-white font-bold transition-all shadow-lg shadow-[#f37021]/20 flex items-center justify-center gap-2 text-sm"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              Save as Folder
            </button>
          </div>
        ) : (
          <DownloadButton onClick={() => onStart(false)} />
        )}
      </div>
    </>
  )
}

export function PasswordEntry({
  onSubmit,
  errorMessage,
}: {
  onSubmit: (password: string) => void
  errorMessage: string | null
}): JSX.Element {
  const [password, setPassword] = useState('')
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      onSubmit(password)
    },
    [onSubmit, password],
  )

  return (
    <>
      <TitleText>This download requires a password.</TitleText>
      <div className="flex flex-col space-y-5 w-full">
        <form
          action="#"
          method="post"
          onSubmit={handleSubmit}
          className="w-full"
        >
          <div className="flex flex-col space-y-5 w-full">
            <PasswordField
              value={password}
              onChange={setPassword}
              isRequired
              isInvalid={Boolean(errorMessage)}
            />
            <UnlockButton />
          </div>
        </form>
      </div>
      {errorMessage && <ErrorMessage message={errorMessage} />}
    </>
  )
}

export default function Downloader({
  uploaderPeerID,
}: {
  uploaderPeerID: string
}): JSX.Element {
  const {
    filesInfo,
    isConnected,
    isPasswordRequired,
    isDownloading,
    isPaused,
    isDone,
    errorMessage,
    submitPassword,
    startDownload,
    stopDownload,
    pauseDownload,
    resumeDownload,
    totalSize,
    bytesDownloaded,
    chatMessages,
    sendChatMessage,
    gameState,
    sendGameState,
    livePreviewUrls,
  } = useDownloader(uploaderPeerID)

  let content: JSX.Element | null = null

  if (isDone && filesInfo) {
    content = (
      <DownloadComplete
        filesInfo={filesInfo}
        bytesDownloaded={bytesDownloaded}
        totalSize={totalSize}
      />
    )
  } else if (isPasswordRequired) {
    content = (
      <PasswordEntry errorMessage={errorMessage} onSubmit={submitPassword} />
    )
  } else if (errorMessage) {
    content = (
      <>
        <ErrorMessage message={errorMessage} />
        <ReturnHome />
      </>
    )
  } else if (isDownloading && filesInfo) {
    content = (
      <DownloadInProgress
        filesInfo={filesInfo}
        bytesDownloaded={bytesDownloaded}
        totalSize={totalSize}
        isPaused={isPaused}
        onStop={stopDownload}
        onPause={pauseDownload}
        onResume={resumeDownload}
        livePreviewUrls={livePreviewUrls}
      />
    )
  } else if (filesInfo) {
    content = <ReadyToDownload filesInfo={filesInfo} onStart={startDownload} />
  } else if (!isConnected) {
    content = <ConnectingToUploader />
  } else {
    content = <Loading text="Uh oh... Something went wrong." />
  }

  const progress = isDownloading ? bytesDownloaded / totalSize : -1

  return (
    <>
      <Spinner progress={progress} isDone={isDone} />
      {content}
      {(isDownloading || isDone || filesInfo) && (
        <>
          <GameHub
            gameState={gameState}
            sendGameState={sendGameState}
            currentUserRole="downloader"
          />
          <ChatDrawer
            messages={chatMessages}
            onSendMessage={sendChatMessage}
            currentUserRole="downloader"
          />
          <VideoChat isUploader={false} remotePeerId={uploaderPeerID} />
        </>
      )}
    </>
  )
}
