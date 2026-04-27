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
      className={`p-3 transition-all duration-200 flex items-center justify-center border-4 border-[var(--border-strong)] shadow-[4px_4px_0px_0px_var(--shadow-color)] ${
        copied
          ? 'bg-bauhaus-blue text-white translate-y-1 shadow-none'
          : 'bg-bauhaus-yellow text-primary hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_var(--shadow-color)]'
      }`}
    >
      {copied ? <Check className="w-6 h-6" strokeWidth={3} /> : <Copy className="w-6 h-6" strokeWidth={3} />}
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

  const overallProgress = Math.min(1,
    connections.length > 0
      ? connections.reduce(
          (acc, conn) =>
            acc +
            Math.min(1, (conn.completedFiles + conn.currentFileProgress) /
              Math.max(1, conn.totalFiles)),
          0,
        ) / connections.length
      : 0
  )

  const totalSize = files.reduce((acc, f) => acc + f.size, 0)
  const completedPeers = connections.filter(
    (conn) => conn.status === UploaderConnectionStatus.Done,
  ).length

  return (
    <motion.div
      layoutId="upload-container"
      className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-4"
    >
      {/* Tile 1: File Status (col-span-2) */}
      <motion.div
        whileHover={{ y: -4 }}
        className="surface col-span-1 md:col-span-2 p-8 relative flex flex-col justify-between"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-bauhaus-red border-b-4 border-[var(--border-strong)]" />
        <div className="flex items-center gap-6 mt-2">
          {files.length === 1 && files[0].type.startsWith('image/') ? (
            <div 
              className="w-16 h-16 bg-white border-4 border-[var(--border-strong)] flex items-center justify-center text-primary overflow-hidden shadow-[4px_4px_0px_0px_var(--shadow-color)]"
              style={{
                backgroundImage: `url(${URL.createObjectURL(files[0])})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          ) : files.length === 1 && files[0].type.startsWith('video/') ? (
            <div className="w-16 h-16 bg-white border-4 border-[var(--border-strong)] flex items-center justify-center text-primary overflow-hidden shadow-[4px_4px_0px_0px_var(--shadow-color)] relative">
              <video 
                src={URL.createObjectURL(files[0])} 
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              />
              <FileUp className="w-8 h-8 relative z-10 text-primary drop-shadow-md" strokeWidth={3} />
            </div>
          ) : (
            <div className="w-16 h-16 bg-bauhaus-yellow border-4 border-[var(--border-strong)] flex items-center justify-center text-primary shadow-[4px_4px_0px_0px_var(--shadow-color)]">
              <FileUp className="w-8 h-8" strokeWidth={3} />
            </div>
          )}
          <div className="flex-1 overflow-hidden z-10">
            <h3 className="text-primary font-black uppercase tracking-widest truncate text-xl">
              {files[0].name}{' '}
              {files.length > 1 ? `+${files.length - 1} more` : ''}
            </h3>
            <p className="text-muted font-bold text-sm mt-1">
              {formatBytes(totalSize)}
            </p>
          </div>
        </div>
        <div className="mt-8 flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-primary">
          {activeDownloaders > 0 ? (
            <>
              <span className="w-4 h-4 bg-bauhaus-red border-2 border-[var(--border-strong)] animate-pulse"></span>
              <span>
                Transferring to {activeDownloaders} peer{activeDownloaders !== 1 ? 's' : ''}...
              </span>
            </>
          ) : (
            <>
              <span className="w-4 h-4 bg-bauhaus-yellow border-2 border-[var(--border-strong)]"></span>
              <span>Waiting for Peer...</span>
            </>
          )}
        </div>
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="border-4 border-[var(--border-strong)] bg-white p-3 shadow-[4px_4px_0px_0px_var(--shadow-color)]">
            <div className="text-[10px] text-bauhaus-blue font-black uppercase tracking-widest border-b-2 border-bauhaus-blue inline-block pb-1">Peers</div>
            <div className="text-primary font-black text-2xl mt-2">
              {connections.length || 0}
            </div>
          </div>
          <div className="border-4 border-[var(--border-strong)] bg-white p-3 shadow-[4px_4px_0px_0px_var(--shadow-color)]">
            <div className="text-[10px] text-bauhaus-red font-black uppercase tracking-widest border-b-2 border-bauhaus-red inline-block pb-1">Done</div>
            <div className="text-primary font-black text-2xl mt-2">
              {completedPeers}
            </div>
          </div>
          <div className="border-4 border-[var(--border-strong)] bg-bauhaus-yellow p-3 shadow-[4px_4px_0px_0px_var(--shadow-color)]">
            <div className="text-[10px] text-primary font-black uppercase tracking-widest border-b-2 border-[var(--border-strong)] inline-block pb-1">Progress</div>
            <div className="text-primary font-black text-2xl mt-2">
              {Math.round(overallProgress * 100)}%
            </div>
          </div>
        </div>
        {/* Progress bar anchoring */}
        {activeDownloaders > 0 && (
          <div className="absolute bottom-0 left-0 h-4 bg-[var(--bg-elevated)] w-full border-t-4 border-[var(--border-strong)]">
            <div
              className="h-full bg-bauhaus-blue border-r-4 border-[var(--border-strong)] transition-all duration-300 ease-out"
              style={{ width: `${Math.min(100, overallProgress * 100)}%` }}
            ></div>
          </div>
        )}
      </motion.div>

      {/* Tile 2: QR Code (col-span-1) */}
      <motion.div
        whileHover={{ y: -4 }}
        className="surface col-span-1 p-8 flex flex-col items-center justify-center gap-4 relative group"
      >
        <div className="absolute top-4 left-4 bg-bauhaus-yellow text-primary border-2 border-[var(--border-strong)] px-2 py-1 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-[2px_2px_0px_0px_var(--shadow-color)]">
          <ScanLine className="w-3 h-3" strokeWidth={3} />
          Quick Join
        </div>
        <div className="bg-white border-4 border-[var(--border-strong)] p-4 shadow-[4px_4px_0px_0px_var(--shadow-color)] transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-[8px_8px_0px_0px_var(--shadow-color)]">
          <QRCode
            value={shortURL}
            size={120}
            bgColor="#FFFFFF"
            fgColor="#121212"
          />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-muted opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute bottom-4">
          Scan to connect
        </span>
      </motion.div>

      {/* Tile 3: Link Action Card (col-span-3) */}
      <motion.div
        whileHover={{ y: -2 }}
        className="surface col-span-1 md:col-span-3 p-4 flex flex-col sm:flex-row items-stretch gap-4"
      >
        <div className="flex-1 bg-[var(--bg-elevated)] border-4 border-[var(--border-strong)] px-5 py-4 truncate font-mono text-primary font-bold text-sm flex items-center shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,0.1)]">
          {shortURL}
        </div>
        <CopyButton textToCopy={shortURL} />
      </motion.div>

      <motion.div
        whileHover={{ y: -2 }}
        className="col-span-1 md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6 mt-2"
      >
        <div className="bg-white border-4 border-[var(--border-strong)] shadow-[4px_4px_0px_0px_var(--shadow-color)] p-6">
          <div className="inline-flex items-center gap-3 text-primary text-sm font-black uppercase tracking-widest mb-3 border-b-2 border-[var(--border-strong)] pb-1">
            <Gauge className="w-5 h-5 text-bauhaus-red" strokeWidth={3} />
            Transfer Engine
          </div>
          <p className="text-xs text-primary font-bold">
            Keep this tab open for maximum throughput and low disconnect risk.
          </p>
        </div>
        <div className="bg-white border-4 border-[var(--border-strong)] shadow-[4px_4px_0px_0px_var(--shadow-color)] p-6">
          <div className="inline-flex items-center gap-3 text-primary text-sm font-black uppercase tracking-widest mb-3 border-b-2 border-[var(--border-strong)] pb-1">
            <Users className="w-5 h-5 text-bauhaus-blue" strokeWidth={3} />
            Live Peers
          </div>
          <p className="text-xs text-primary font-bold">
            {connections.length > 0
              ? `${connections.length} peer session(s) connected.`
              : 'Waiting for first peer to connect.'}
          </p>
        </div>
        <div className="bg-white border-4 border-[var(--border-strong)] shadow-[4px_4px_0px_0px_var(--shadow-color)] p-6">
          <div className="inline-flex items-center gap-3 text-primary text-sm font-black uppercase tracking-widest mb-3 border-b-2 border-[var(--border-strong)] pb-1">
            <Flame className="w-5 h-5 text-bauhaus-yellow" strokeWidth={3} />
            Burn Mode
          </div>
          <p className="text-xs text-primary font-bold">
            {burnAfterReading
              ? 'Enabled: share closes after the first successful download.'
              : 'Disabled: link stays active until you manually stop sharing.'}
          </p>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="col-span-1 md:col-span-3 w-full flex justify-end mt-4 border-t-4 border-[var(--border-strong)] pt-6">
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
// .
// .
// .
