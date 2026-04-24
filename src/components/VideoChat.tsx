'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Video, VideoOff, PhoneOff, Maximize2, Minimize2 } from 'lucide-react'
import { useWebRTCPeer } from './WebRTCProvider'

interface VideoChatProps {
  remotePeerId?: string // Provide if downloader calling uploader
  isUploader: boolean
}

export default function VideoChat({ remotePeerId, isUploader }: VideoChatProps) {
  const { peer } = useWebRTCPeer()
  const [isOpen, setIsOpen] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const activeCallRef = useRef<any>(null)

  // Start local stream when opened
  useEffect(() => {
    if (isOpen && !localStream) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          stream.getAudioTracks().forEach(track => track.enabled = micOn)
          stream.getVideoTracks().forEach(track => track.enabled = camOn)
          setLocalStream(stream)
          if (localVideoRef.current) localVideoRef.current.srcObject = stream
          
          // If I'm the downloader and I have the uploader's ID, call them!
          if (!isUploader && remotePeerId) {
            const call = peer.call(remotePeerId, stream)
            activeCallRef.current = call
            call.on('stream', (userVideoStream: MediaStream) => {
              setRemoteStream(userVideoStream)
            })
          }
        })
        .catch(err => console.error("Failed to get local stream", err))
    }
  }, [isOpen, localStream, peer, remotePeerId, isUploader, micOn, camOn])

  // Answer incoming calls
  useEffect(() => {
    if (!peer) return
    const handleCall = (call: any) => {
      // Auto-answer if opened, or prompt? Let's just auto-answer if they click "Join"
      setIsOpen(true)
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          stream.getAudioTracks().forEach(track => track.enabled = micOn)
          stream.getVideoTracks().forEach(track => track.enabled = camOn)
          setLocalStream(stream)
          if (localVideoRef.current) localVideoRef.current.srcObject = stream
          call.answer(stream)
          activeCallRef.current = call
          call.on('stream', (userVideoStream: MediaStream) => {
            setRemoteStream(userVideoStream)
          })
        })
    }
    peer.on('call', handleCall)
    return () => { peer.off('call', handleCall) }
  }, [peer])

  // Bind video elements
  useEffect(() => {
    if (localVideoRef.current && localStream) localVideoRef.current.srcObject = localStream
    if (remoteVideoRef.current && remoteStream) remoteVideoRef.current.srcObject = remoteStream
  }, [localStream, remoteStream])

  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => track.enabled = !micOn)
      setMicOn(!micOn)
    }
  }

  const toggleCam = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => track.enabled = !camOn)
      setCamOn(!camOn)
    }
  }

  const endCall = () => {
    if (activeCallRef.current) activeCallRef.current.close()
    if (localStream) localStream.getTracks().forEach(track => track.stop())
    setLocalStream(null)
    setRemoteStream(null)
    setIsOpen(false)
  }

  if (!isOpen) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-40 right-6 p-4 bg-stone-800 text-stone-100 border border-stone-700 rounded-full shadow-lg hover:bg-stone-700 hover:border-blue-500 transition-colors z-40 group flex items-center gap-2"
        title="Start Coffee Chat"
      >
        <Video className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
      </motion.button>
    )
  }

  return (
    <motion.div
      drag={!isMaximized}
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.8, y: 100 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: 0,
        width: isMaximized ? '90vw' : '320px',
        height: isMaximized ? '80vh' : 'auto',
        left: isMaximized ? '5vw' : 'auto',
        top: isMaximized ? '10vh' : 'auto',
        bottom: isMaximized ? 'auto' : '120px',
        right: isMaximized ? 'auto' : '24px'
      }}
      className={`fixed z-50 bg-stone-900 border border-stone-700 shadow-2xl rounded-2xl overflow-hidden flex flex-col ${isMaximized ? '' : 'cursor-move'}`}
    >
      <div className="bg-stone-950 p-2 flex justify-between items-center border-b border-stone-800">
        <span className="text-xs font-semibold text-stone-300 ml-2">🎙️ Coffee Chat</span>
        <div className="flex gap-2">
          <button onClick={() => setIsMaximized(!isMaximized)} className="text-stone-400 hover:text-white">
            {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="relative flex-1 bg-black flex flex-col">
        {/* Remote Video (Main) */}
        {remoteStream ? (
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="w-full aspect-video flex flex-col items-center justify-center text-stone-500">
            <span className="animate-pulse">Calling peer...</span>
          </div>
        )}

        {/* Local Video (PiP) */}
        <div className="absolute top-4 right-4 w-1/3 aspect-video bg-stone-800 rounded-lg overflow-hidden border-2 border-stone-700 shadow-lg">
          <video 
            ref={localVideoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover mirror" 
            style={{ transform: 'scaleX(-1)' }}
          />
        </div>

        {/* Controls */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
          <button 
            onClick={toggleMic} 
            className={`p-3 rounded-full shadow-lg backdrop-blur-md ${micOn ? 'bg-stone-800/80 text-white hover:bg-stone-700' : 'bg-red-500/90 text-white hover:bg-red-600'}`}
          >
            {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
          
          <button 
            onClick={endCall} 
            className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30"
          >
            <PhoneOff className="w-5 h-5" />
          </button>

          <button 
            onClick={toggleCam} 
            className={`p-3 rounded-full shadow-lg backdrop-blur-md ${camOn ? 'bg-stone-800/80 text-white hover:bg-stone-700' : 'bg-red-500/90 text-white hover:bg-red-600'}`}
          >
            {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
