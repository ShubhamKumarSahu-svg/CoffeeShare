'use client'
import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Video, VideoOff, PhoneOff, Phone, Maximize2, Minimize2, PhoneCall } from 'lucide-react'
import { useWebRTCPeer } from './WebRTCProvider'
import toast from 'react-hot-toast'

interface VideoChatProps {
  remotePeerId?: string // Provide if downloader calling uploader
  isUploader: boolean
}

type CallState = 'idle' | 'calling' | 'incoming' | 'connected'
type CallType = 'audio' | 'video'

export default function VideoChat({ remotePeerId, isUploader }: VideoChatProps) {
  const { peer } = useWebRTCPeer()
  
  const [callState, setCallState] = useState<CallState>('idle')
  const callStateRef = useRef<CallState>('idle')
  const [callType, setCallType] = useState<CallType>('video')
  
  // Sync state to ref for callbacks
  useEffect(() => {
    callStateRef.current = callState
  }, [callState])

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

  // Listen for incoming calls and connection messages
  useEffect(() => {
    if (!peer) return
    const handleCall = (call: any) => {
      // We got an incoming call
      incomingCallRef.current = call
      setCallState('incoming')
    }
    
    const handleConnection = (conn: any) => {
      conn.on('data', (data: any) => {
        if (data && data.type === 'CALL_DECLINED') {
          if (callStateRef.current === 'calling') {
            toast.error('Call declined by peer', { icon: '📵' })
            endCall()
          }
        }
      })
    }
    
    peer.on('call', handleCall)
    peer.on('connection', handleConnection)
    return () => { 
      peer.off('call', handleCall) 
      peer.off('connection', handleConnection)
    }
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
        call.on('close', () => {
          if (callStateRef.current === 'calling') {
            toast.error('Call declined by peer')
          }
          endCall()
        })
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
      // Send a reliable data message to notify caller
      const conn = peer.connect(incomingCallRef.current.peer)
      conn.on('open', () => {
        conn.send({ type: 'CALL_DECLINED' })
        setTimeout(() => conn.close(), 500)
      })
      
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
      <div className="fixed bottom-[10.5rem] right-6 flex flex-col items-end gap-3 z-40">
        <AnimatePresence>
          {showDialer && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="flex flex-col gap-3 bg-[var(--bg-card)] border-4 border-[var(--border-strong)] p-4 shadow-[8px_8px_0px_0px_var(--shadow-color)] min-w-[240px]"
            >
              <div className="px-2 pt-1 pb-2 border-b-2 border-[var(--border-strong)] text-[10px] font-black uppercase tracking-widest text-muted">
                {isUploader ? 'Host Call Controls' : 'Guest Call Controls'}
              </div>
              <button 
                onClick={() => initiateCall('audio')}
                disabled={!remotePeerId}
                className="flex items-center gap-3 px-4 py-3 bg-[var(--bg-elevated)] border-2 border-[var(--border-strong)] hover:bg-bauhaus-yellow hover:text-primary hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--shadow-color)] disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none text-primary font-bold uppercase tracking-widest text-xs transition-all"
              >
                <div className="bg-bauhaus-blue text-white p-2 border-2 border-current"><Phone className="w-4 h-4" strokeWidth={3} /></div>
                <span>Voice Call</span>
              </button>
              <button 
                onClick={() => initiateCall('video')}
                disabled={!remotePeerId}
                className="flex items-center gap-3 px-4 py-3 bg-[var(--bg-elevated)] border-2 border-[var(--border-strong)] hover:bg-bauhaus-yellow hover:text-primary hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--shadow-color)] disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none text-primary font-bold uppercase tracking-widest text-xs transition-all"
              >
                <div className="bg-bauhaus-red text-white p-2 border-2 border-current"><Video className="w-4 h-4" strokeWidth={3} /></div>
                <span>Video Call</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setShowDialer(!showDialer)}
          className={`p-4 border-4 border-[var(--border-strong)] shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_var(--shadow-color)] transition-all group ${showDialer ? 'bg-[var(--bg-elevated)] text-primary' : 'bg-bauhaus-yellow text-primary'}`}
        >
          <PhoneCall className="w-6 h-6" strokeWidth={3} />
        </button>
      </div>
    )
  }

  // Incoming Call UI
  if (callState === 'incoming') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -50, x: '-50%' }}
        animate={{ opacity: 1, y: 0, x: '-50%' }}
        className="fixed top-10 left-1/2 z-50 bg-[var(--bg-card)] border-4 border-[var(--border-strong)] shadow-[8px_8px_0px_0px_var(--shadow-color)] p-6 flex flex-col items-center gap-4 w-80"
      >
        <div className="w-16 h-16 bg-bauhaus-yellow text-primary border-4 border-[var(--border-strong)] flex items-center justify-center animate-pulse mb-2 shadow-[4px_4px_0px_0px_var(--shadow-color)]">
          <PhoneCall className="w-8 h-8" strokeWidth={3} />
        </div>
        <h3 className="text-2xl font-black uppercase tracking-widest text-primary">Incoming Call</h3>
        <p className="text-muted font-bold text-xs uppercase tracking-widest text-center">Your peer wants to start a call</p>
        <div className="flex gap-3 w-full mt-4">
          <button onClick={() => answerCall('audio')} className="flex-1 flex flex-col items-center gap-2 p-3 bg-bauhaus-blue border-2 border-[var(--border-strong)] hover:-translate-y-1 shadow-[2px_2px_0px_0px_var(--shadow-color)] text-white transition-all">
            <Phone className="w-5 h-5" strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-widest">Voice</span>
          </button>
          <button onClick={() => answerCall('video')} className="flex-1 flex flex-col items-center gap-2 p-3 bg-bauhaus-yellow border-2 border-[var(--border-strong)] hover:-translate-y-1 shadow-[2px_2px_0px_0px_var(--shadow-color)] text-primary transition-all">
            <Video className="w-5 h-5" strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-widest">Video</span>
          </button>
          <button onClick={rejectCall} className="flex-1 flex flex-col items-center gap-2 p-3 bg-bauhaus-red border-2 border-[var(--border-strong)] hover:-translate-y-1 shadow-[2px_2px_0px_0px_var(--shadow-color)] text-white transition-all">
            <PhoneOff className="w-5 h-5" strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-widest">Decline</span>
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
      className="fixed z-50 bg-[var(--bg-card)] border-4 border-[var(--border-strong)] shadow-[8px_8px_0px_0px_var(--shadow-color)] overflow-hidden flex flex-col transition-all duration-300 ease-in-out cursor-move"
      style={isMaximized ? { transform: 'translateX(-50%)' } : {}}
    >
      {/* Header */}
      <div className="bg-[var(--bg-elevated)] p-3 flex justify-between items-center border-b-4 border-[var(--border-strong)] absolute top-0 left-0 right-0 z-20">
        <div className="flex items-center gap-3">
          <div className={`p-1 border-2 border-current ${callType === 'audio' ? 'bg-bauhaus-yellow text-primary' : 'bg-bauhaus-blue text-white'}`}>
            {callType === 'audio' ? <Phone className="w-4 h-4" strokeWidth={3} /> : <Video className="w-4 h-4" strokeWidth={3} />}
          </div>
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">{callType === 'audio' ? 'Voice Call' : 'Video Call'}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsMaximized(!isMaximized)} className="text-primary hover:text-bauhaus-blue p-1 bg-white border-2 border-[var(--border-strong)] hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--shadow-color)] transition-all">
            {isMaximized ? <Minimize2 className="w-4 h-4" strokeWidth={3} /> : <Maximize2 className="w-4 h-4" strokeWidth={3} />}
          </button>
        </div>
      </div>

      <div className="relative flex-1 bg-[var(--bg-card)] flex flex-col w-full h-full pt-[52px]">
        {/* Remote View */}
        {callState === 'connected' && remoteStream ? (
          callType === 'audio' ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-[var(--bg-muted)]">
              <div className="w-32 h-32 bg-bauhaus-yellow border-4 border-[var(--border-strong)] flex items-center justify-center shadow-[4px_4px_0px_0px_var(--shadow-color)] animate-pulse">
                <Phone className="w-12 h-12 text-primary" strokeWidth={3} />
              </div>
              <span className="mt-8 text-primary font-black uppercase tracking-widest bg-white border-2 border-[var(--border-strong)] px-4 py-2 shadow-[2px_2px_0px_0px_var(--shadow-color)]">Connected</span>
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
          <div className="flex-1 flex flex-col items-center justify-center text-primary bg-[var(--bg-muted)]">
            <div className="w-20 h-20 bg-white border-4 border-[var(--border-strong)] flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_var(--shadow-color)] animate-pulse">
              <PhoneCall className="w-8 h-8 text-primary" strokeWidth={3} />
            </div>
            <span className="animate-pulse font-black uppercase tracking-widest text-sm">Calling peer...</span>
            <span className="text-[10px] mt-2 text-muted font-bold uppercase tracking-widest">
              {isUploader ? 'Waiting for receiver' : 'Waiting for sender'}
            </span>
          </div>
        )}

        {/* Local Video PiP (Only if video call) */}
        {callType === 'video' && (
          <div className={`absolute ${isMaximized ? 'bottom-24 right-8 w-64' : 'top-[4.5rem] right-4 w-24'} aspect-video bg-black overflow-hidden border-4 border-[var(--border-strong)] shadow-[4px_4px_0px_0px_var(--shadow-color)] z-10 transition-all duration-300`}>
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
        <div className={`absolute bottom-0 left-0 right-0 p-6 flex justify-center gap-6 z-30 pointer-events-none`}>
          <div className="pointer-events-auto flex items-center gap-4 bg-[var(--bg-elevated)] border-4 border-[var(--border-strong)] p-3 shadow-[8px_8px_0px_0px_var(--shadow-color)]">
            <button 
              onClick={toggleMic} 
              className={`p-3 border-2 border-[var(--border-strong)] transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_var(--shadow-color)] ${micOn ? 'bg-white text-primary' : 'bg-bauhaus-red text-white'}`}
              title={micOn ? "Mute Microphone" : "Unmute Microphone"}
            >
              {micOn ? <Mic className="w-5 h-5" strokeWidth={3} /> : <MicOff className="w-5 h-5" strokeWidth={3} />}
            </button>
            
            <button 
              onClick={endCall} 
              className="p-4 bg-bauhaus-red border-4 border-[var(--border-strong)] text-white shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_var(--shadow-color)] transition-all"
              title="End Call"
            >
              <PhoneOff className="w-6 h-6" strokeWidth={3} />
            </button>

            {callType === 'video' && (
              <button 
                onClick={toggleCam} 
                className={`p-3 border-2 border-[var(--border-strong)] transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_var(--shadow-color)] ${camOn ? 'bg-white text-primary' : 'bg-bauhaus-red text-white'}`}
                title={camOn ? "Turn Off Camera" : "Turn On Camera"}
              >
                {camOn ? <Video className="w-5 h-5" strokeWidth={3} /> : <VideoOff className="w-5 h-5" strokeWidth={3} />}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
// .
// .
// .
// .
// .
