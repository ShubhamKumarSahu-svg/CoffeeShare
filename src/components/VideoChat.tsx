'use client'
import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Video, VideoOff, PhoneOff, Phone, Maximize2, Minimize2, PhoneCall } from 'lucide-react'
import { useWebRTCPeer } from './WebRTCProvider'

interface VideoChatProps {
  remotePeerId?: string // Provide if downloader calling uploader
  isUploader: boolean
}

type CallState = 'idle' | 'calling' | 'incoming' | 'connected'
type CallType = 'audio' | 'video'

export default function VideoChat({ remotePeerId, isUploader }: VideoChatProps) {
  const { peer } = useWebRTCPeer()
  
  const [callState, setCallState] = useState<CallState>('idle')
  const [callType, setCallType] = useState<CallType>('video')
  const [showDialer, setShowDialer] = useState(false)
  
  const [isMaximized, setIsMaximized] = useState(false)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const activeCallRef = useRef<any>(null)
  const incomingCallRef = useRef<any>(null)

  // Listen for incoming calls
  useEffect(() => {
    if (!peer) return
    const handleCall = (call: any) => {
      // We got an incoming call
      incomingCallRef.current = call
      setCallState('incoming')
      // Try to determine if it's audio or video based on metadata or just assume video.
      // We'll prompt the user to answer with Audio or Video.
    }
    peer.on('call', handleCall)
    return () => { peer.off('call', handleCall) }
  }, [peer])

  // Bind video elements
  useEffect(() => {
    if (localVideoRef.current && localStream) localVideoRef.current.srcObject = localStream
    if (remoteVideoRef.current && remoteStream) remoteVideoRef.current.srcObject = remoteStream
  }, [localStream, remoteStream, callState, isMaximized])

  const initiateCall = (type: CallType) => {
    if (!remotePeerId) return
    setCallType(type)
    setCallState('calling')
    setShowDialer(false)
    setCamOn(type === 'video')
    
    navigator.mediaDevices.getUserMedia({ video: type === 'video', audio: true })
      .then(stream => {
        setLocalStream(stream)
        const call = peer.call(remotePeerId, stream)
        activeCallRef.current = call
        
        call.on('stream', (userVideoStream: MediaStream) => {
          setRemoteStream(userVideoStream)
          setCallState('connected')
        })
        call.on('close', () => endCall())
      })
      .catch(err => {
        console.error("Failed to get local stream", err)
        setCallState('idle')
      })
  }

  const answerCall = (type: CallType) => {
    if (!incomingCallRef.current) return
    setCallType(type)
    setCamOn(type === 'video')
    
    navigator.mediaDevices.getUserMedia({ video: type === 'video', audio: true })
      .then(stream => {
        setLocalStream(stream)
        incomingCallRef.current.answer(stream)
        activeCallRef.current = incomingCallRef.current
        
        incomingCallRef.current.on('stream', (userVideoStream: MediaStream) => {
          setRemoteStream(userVideoStream)
          setCallState('connected')
        })
        incomingCallRef.current.on('close', () => endCall())
      })
      .catch(err => {
        console.error("Failed to answer call", err)
        setCallState('idle')
      })
  }

  const rejectCall = () => {
    if (incomingCallRef.current) {
      incomingCallRef.current.close()
      incomingCallRef.current = null
    }
    setCallState('idle')
  }

  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => track.enabled = !micOn)
      setMicOn(!micOn)
    }
  }

  const toggleCam = () => {
    if (localStream) {
      // If we started as audio-only, we might not have a video track to toggle
      const videoTracks = localStream.getVideoTracks()
      if (videoTracks.length > 0) {
        videoTracks.forEach(track => track.enabled = !camOn)
        setCamOn(!camOn)
      } else {
        // Would need to renegotiate stream to add video, for now just ignore
        console.warn("No video track to enable")
      }
    }
  }

  const endCall = () => {
    if (activeCallRef.current) activeCallRef.current.close()
    if (incomingCallRef.current) incomingCallRef.current.close()
    if (localStream) localStream.getTracks().forEach(track => track.stop())
    activeCallRef.current = null
    incomingCallRef.current = null
    setLocalStream(null)
    setRemoteStream(null)
    setCallState('idle')
    setIsMaximized(false)
  }

  // Dialer UI (when idle)
  if (callState === 'idle') {
    return (
      <div className="fixed bottom-40 right-6 flex flex-col items-end gap-3 z-40">
        <AnimatePresence>
          {showDialer && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="flex flex-col gap-2 bg-stone-900 border border-stone-700 p-2 rounded-2xl shadow-2xl backdrop-blur-xl"
            >
              <button 
                onClick={() => initiateCall('audio')}
                disabled={!remotePeerId}
                className="flex items-center gap-3 px-4 py-3 bg-stone-800 hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-stone-200 transition-colors"
              >
                <div className="bg-[#3b82f6]/20 text-[#3b82f6] p-2 rounded-lg"><Phone className="w-4 h-4" /></div>
                <span className="text-sm font-semibold">Voice Call</span>
              </button>
              <button 
                onClick={() => initiateCall('video')}
                disabled={!remotePeerId}
                className="flex items-center gap-3 px-4 py-3 bg-stone-800 hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-stone-200 transition-colors"
              >
                <div className="bg-[#f37021]/20 text-[#f37021] p-2 rounded-lg"><Video className="w-4 h-4" /></div>
                <span className="text-sm font-semibold">Video Call</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowDialer(!showDialer)}
          className={`p-4 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.3)] transition-colors flex items-center justify-center border ${showDialer ? 'bg-stone-700 border-stone-500 text-white' : 'bg-[#f37021] border-[#ff985c] text-white hover:bg-[#e0661e]'}`}
        >
          <PhoneCall className="w-6 h-6" />
        </motion.button>
      </div>
    )
  }

  // Incoming Call UI
  if (callState === 'incoming') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -50, x: '-50%' }}
        animate={{ opacity: 1, y: 0, x: '-50%' }}
        className="fixed top-10 left-1/2 z-50 bg-stone-900/95 border border-stone-700 shadow-2xl rounded-3xl p-6 flex flex-col items-center gap-4 backdrop-blur-xl w-80"
      >
        <div className="w-16 h-16 bg-[#f37021]/20 rounded-full flex items-center justify-center animate-pulse mb-2">
          <PhoneCall className="w-8 h-8 text-[#f37021]" />
        </div>
        <h3 className="text-xl font-bold text-white">Incoming Call</h3>
        <p className="text-stone-400 text-sm text-center">Your peer wants to start a call</p>
        <div className="flex gap-3 w-full mt-4">
          <button onClick={() => answerCall('audio')} className="flex-1 flex flex-col items-center gap-1 p-3 bg-stone-800 hover:bg-stone-700 rounded-xl text-green-400 transition-colors">
            <Phone className="w-5 h-5" />
            <span className="text-xs font-semibold">Voice</span>
          </button>
          <button onClick={() => answerCall('video')} className="flex-1 flex flex-col items-center gap-1 p-3 bg-stone-800 hover:bg-stone-700 rounded-xl text-blue-400 transition-colors">
            <Video className="w-5 h-5" />
            <span className="text-xs font-semibold">Video</span>
          </button>
          <button onClick={rejectCall} className="flex-1 flex flex-col items-center gap-1 p-3 bg-red-500/20 hover:bg-red-500/40 rounded-xl text-red-500 transition-colors">
            <PhoneOff className="w-5 h-5" />
            <span className="text-xs font-semibold">Decline</span>
          </button>
        </div>
      </motion.div>
    )
  }

  // Calling & Connected UI
  return (
    <motion.div
      drag={!isMaximized}
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.8, y: 100 }}
      animate={isMaximized ? {
        opacity: 1, scale: 1, y: 0, x: '-50%', left: '50%', top: '5vh', width: '90vw', height: '90vh', bottom: 'auto', right: 'auto'
      } : { 
        opacity: 1, scale: 1, y: 0, x: 0, width: '320px', height: 'auto', left: 'auto', top: 'auto', bottom: '120px', right: '24px'
      }}
      className={`fixed z-50 bg-stone-900 border border-stone-700 shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ease-in-out ${isMaximized ? 'rounded-3xl' : 'rounded-2xl cursor-move'}`}
      style={isMaximized ? { transform: 'translateX(-50%)' } : {}}
    >
      {/* Header */}
      <div className="bg-stone-950/80 backdrop-blur-md p-3 flex justify-between items-center border-b border-stone-800 absolute top-0 left-0 right-0 z-20">
        <div className="flex items-center gap-2">
          {callType === 'audio' ? <Phone className="w-4 h-4 text-[#f37021]" /> : <Video className="w-4 h-4 text-[#3b82f6]" />}
          <span className="text-xs font-bold text-stone-200 uppercase tracking-wider">{callType === 'audio' ? 'Voice Call' : 'Video Call'}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsMaximized(!isMaximized)} className="text-stone-400 hover:text-white p-1 bg-stone-800 rounded-md">
            {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="relative flex-1 bg-[#0c0a09] flex flex-col w-full h-full pt-[45px]">
        {/* Remote View */}
        {callState === 'connected' && remoteStream ? (
          callType === 'audio' ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-stone-800 to-stone-900 border-4 border-stone-800 flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.05)] animate-pulse">
                <Phone className="w-12 h-12 text-stone-500" />
              </div>
              <span className="mt-6 text-stone-400 font-medium">Connected</span>
              <audio ref={remoteVideoRef as any} autoPlay className="hidden" />
            </div>
          ) : (
            <video 
              ref={remoteVideoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover" 
            />
          )
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-stone-500">
            <div className="w-16 h-16 rounded-full bg-stone-800/50 flex items-center justify-center mb-4 animate-pulse">
              <PhoneCall className="w-6 h-6 text-stone-400" />
            </div>
            <span className="animate-pulse font-medium">Calling peer...</span>
          </div>
        )}

        {/* Local Video PiP (Only if video call) */}
        {callType === 'video' && (
          <div className={`absolute ${isMaximized ? 'bottom-24 right-8 w-64' : 'top-16 right-4 w-24'} aspect-video bg-stone-800 rounded-xl overflow-hidden border-2 border-stone-700 shadow-2xl z-10 transition-all duration-300`}>
            <video 
              ref={localVideoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover mirror" 
              style={{ transform: 'scaleX(-1)' }}
            />
          </div>
        )}

        {/* Local Audio Only (Hidden, just for capturing) */}
        {callType === 'audio' && (
          <audio ref={localVideoRef as any} autoPlay muted className="hidden" />
        )}

        {/* Controls - Fixed at bottom of container with High Z-Index */}
        <div className={`absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex justify-center gap-6 z-30 pointer-events-none`}>
          <div className="pointer-events-auto flex items-center gap-4 bg-stone-900/80 backdrop-blur-xl border border-stone-700/50 p-2 rounded-full shadow-2xl">
            <button 
              onClick={toggleMic} 
              className={`p-4 rounded-full transition-all duration-300 ${micOn ? 'bg-stone-800 text-white hover:bg-stone-700' : 'bg-red-500 text-white hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.5)]'}`}
              title={micOn ? "Mute Microphone" : "Unmute Microphone"}
            >
              {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
            
            <button 
              onClick={endCall} 
              className="p-4 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all duration-300 hover:scale-110"
              title="End Call"
            >
              <PhoneOff className="w-6 h-6" />
            </button>

            {callType === 'video' && (
              <button 
                onClick={toggleCam} 
                className={`p-4 rounded-full transition-all duration-300 ${camOn ? 'bg-stone-800 text-white hover:bg-stone-700' : 'bg-red-500 text-white hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.5)]'}`}
                title={camOn ? "Turn Off Camera" : "Turn On Camera"}
              >
                {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
