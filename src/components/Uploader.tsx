'use client'

import React, { JSX, useCallback, useEffect, useState } from 'react'
import { UploadedFile, UploaderConnectionStatus } from '../types'
import { useWebRTCPeer } from './WebRTCProvider'
import QRCode from 'react-qr-code'
import Loading from './Loading'
import StopButton from './StopButton'
import { useUploaderChannel } from '../hooks/useUploaderChannel'
import { useUploaderConnections } from '../hooks/useUploaderConnections'
import { ErrorMessage } from './ErrorMessage'
import { setRotating } from '../hooks/useRotatingSpinner'
import { playDingSound } from '../utils/sound'
import { formatBytes } from '../utils/format'
import { motion } from 'framer-motion'
import {
  Check,
  Copy,
  FileUp,
  Flame,
  Gauge,
  Link2,
  ScanLine,
  Users,
} from 'lucide-react'
import toast from 'react-hot-toast'
import ChatDrawer from './ChatDrawer'
import GameHub from './GameHub'
import VideoChat from './VideoChat'

function CopyButton({ textToCopy }: { textToCopy: string }): JSX.Element {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    toast.success('Link copied! Ready to brew.', {
      icon: '☕',
    })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className={`p-3 rounded-xl transition-all duration-300 flex items-center justify-center ${
        copied
          ? 'bg-green-500/20 text-green-400'
          : 'bg-amber-500 text-stone-950 hover:bg-amber-400'
      }`}
    >
      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
    </button>
  )
}

export default function Uploader({
  files,
  password,
  burnAfterReading,
  onStop,
}: {
  files: UploadedFile[]
  password: string
  burnAfterReading?: boolean
  onStop: () => void
}): JSX.Element {
  const { peer, stop } = useWebRTCPeer()
  const { isLoading, error, shortURL, cryptoKey } = useUploaderChannel(peer.id)
  const {
    connections,
    chatMessages,
    sendChatMessage,
    gameState,
    sendGameState,
  } = useUploaderConnections(peer, files, password, cryptoKey)

  const handleStop = useCallback(() => {
    stop()
    onStop()
  }, [stop, onStop])

  const activeDownloaders = connections.filter(
    (conn) => conn.status === UploaderConnectionStatus.Uploading,
  ).length

  useEffect(() => {
    setRotating(activeDownloaders > 0)
  }, [activeDownloaders])

  useEffect(() => {
    const hasCompleted = connections.some(
      (c) => c.status === UploaderConnectionStatus.Done,
    )
    if (hasCompleted) {
      playDingSound()
      if (burnAfterReading) {
        handleStop()
      }
    }
  }, [connections, burnAfterReading, handleStop])

  if (isLoading || !shortURL) {
    return <Loading text="Creating share link..." />
  }

  if (error) {
    return <ErrorMessage message={error.message} />
  }

  const overallProgress =
    connections.length > 0
      ? connections.reduce(
          (acc, conn) =>
            acc +
            (conn.completedFiles + conn.currentFileProgress) /
              Math.max(1, conn.totalFiles),
          0,
        ) / connections.length
      : 0

  const totalSize = files.reduce((acc, f) => acc + f.size, 0)
  const completedPeers = connections.filter(
    (conn) => conn.status === UploaderConnectionStatus.Done,
  ).length

  return (
    <motion.div
      layoutId="upload-container"
      className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mt-4"
    >
      {/* Tile 1: File Status (col-span-2) */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="surface col-span-1 md:col-span-2 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#f37021] via-[#ff985c] to-transparent" />
        <div className="flex items-center gap-4">
          {files.length === 1 && files[0].type.startsWith('image/') ? (
            <div 
              className="w-14 h-14 rounded-2xl bg-stone-800 flex items-center justify-center text-stone-300 overflow-hidden shadow-inner border border-stone-700/50"
              style={{
                backgroundImage: `url(${URL.createObjectURL(files[0])})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          ) : files.length === 1 && files[0].type.startsWith('video/') ? (
            <div className="w-14 h-14 rounded-2xl bg-stone-800 flex items-center justify-center text-stone-300 overflow-hidden shadow-inner border border-stone-700/50 relative">
              <video 
                src={URL.createObjectURL(files[0])} 
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              />
              <FileUp className="w-6 h-6 relative z-10 text-white drop-shadow-md" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-stone-800 flex items-center justify-center text-stone-300">
              <FileUp className="w-7 h-7" />
            </div>
          )}
          <div className="flex-1 overflow-hidden z-10">
            <h3 className="text-stone-100 font-bold truncate text-lg">
              {files[0].name}{' '}
              {files.length > 1 ? `+${files.length - 1} more` : ''}
            </h3>
            <p className="text-stone-400 font-medium text-sm">
              {formatBytes(totalSize)}
            </p>
          </div>
        </div>
        <div className="mt-8 flex items-center gap-2 text-sm font-medium">
          {activeDownloaders > 0 ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]"></span>
              <span className="text-amber-500">
                Transferring to {activeDownloaders} peer
                {activeDownloaders !== 1 ? 's' : ''}...
              </span>
            </>
          ) : (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-stone-600"></span>
              <span className="text-stone-400">Waiting for Peer...</span>
            </>
          )}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
            <div className="text-[11px] text-stone-500 uppercase tracking-wider">Peers</div>
            <div className="text-stone-100 font-semibold text-sm mt-1">
              {connections.length || 0}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
            <div className="text-[11px] text-stone-500 uppercase tracking-wider">Done</div>
            <div className="text-stone-100 font-semibold text-sm mt-1">
              {completedPeers}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
            <div className="text-[11px] text-stone-500 uppercase tracking-wider">Progress</div>
            <div className="text-stone-100 font-semibold text-sm mt-1">
              {Math.round(overallProgress * 100)}%
            </div>
          </div>
        </div>
        {/* Progress bar anchoring */}
        {activeDownloaders > 0 && (
          <div className="absolute bottom-0 left-0 h-1.5 bg-stone-800 w-full">
            <div
              className="h-full bg-amber-500 transition-all duration-300 ease-out"
              style={{ width: `${overallProgress * 100}%` }}
            ></div>
          </div>
        )}
      </motion.div>

      {/* Tile 2: QR Code (col-span-1) */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="surface col-span-1 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 relative group"
      >
        <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-wider text-stone-400">
          <ScanLine className="w-3 h-3" />
          Quick Join
        </div>
        <div className="bg-[#FAFAF9] p-3 rounded-2xl transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-[0_10px_20px_-10px_rgba(245,158,11,0.3)]">
          <QRCode
            value={shortURL}
            size={100}
            bgColor="#FAFAF9"
            fgColor="#1C1917"
          />
        </div>
        <span className="text-xs font-semibold text-stone-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute bottom-3">
          Scan to connect
        </span>
      </motion.div>

      {/* Tile 3: Link Action Card (col-span-3) */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="surface col-span-1 md:col-span-3 rounded-3xl p-3 flex items-center gap-3"
      >
        <div className="flex-1 bg-[#0C0A09] rounded-2xl px-5 py-4 truncate font-mono text-stone-300 text-sm border border-stone-800 shadow-inner">
          <div className="text-[10px] text-stone-500 uppercase tracking-wider mb-1 inline-flex items-center gap-1">
            <Link2 className="w-3 h-3" />
            Share Link
          </div>
          {shortURL}
        </div>
        <CopyButton textToCopy={shortURL} />
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.01 }}
        className="surface col-span-1 md:col-span-3 rounded-3xl p-5"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="inline-flex items-center gap-2 text-stone-300 text-sm font-semibold">
              <Gauge className="w-4 h-4 text-[#f37021]" />
              Transfer Engine
            </div>
            <p className="text-xs text-stone-400 mt-2">
              Keep this tab open for maximum throughput and low disconnect risk.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="inline-flex items-center gap-2 text-stone-300 text-sm font-semibold">
              <Users className="w-4 h-4 text-[#f37021]" />
              Live Peers
            </div>
            <p className="text-xs text-stone-400 mt-2">
              {connections.length > 0
                ? `${connections.length} peer session(s) connected.`
                : 'Waiting for first peer to connect.'}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="inline-flex items-center gap-2 text-stone-300 text-sm font-semibold">
              <Flame className="w-4 h-4 text-[#f37021]" />
              Burn Mode
            </div>
            <p className="text-xs text-stone-400 mt-2">
              {burnAfterReading
                ? 'Enabled: share closes after the first successful download.'
                : 'Disabled: link stays active until you manually stop sharing.'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="col-span-1 md:col-span-3 w-full flex justify-end mt-2">
        <StopButton onClick={handleStop} />
      </div>

      <ChatDrawer
        messages={chatMessages}
        onSendMessage={sendChatMessage}
        currentUserRole="uploader"
      />
      <GameHub 
        gameState={gameState} 
        sendGameState={sendGameState} 
        currentUserRole="uploader" 
      />
      <VideoChat 
        isUploader={true} 
        remotePeerId={connections.length > 0 ? connections[0].dataConnection.peer : undefined} 
      />
    </motion.div>
  )
}
