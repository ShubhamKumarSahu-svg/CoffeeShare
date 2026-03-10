import { useState, useCallback, useRef, useEffect } from 'react'
import { useWebRTCPeer } from '../components/WebRTCProvider'
import { z } from 'zod'
import {
  ChunkMessage,
  decodeMessage,
  Message,
  MessageType,
  ChatMessage,
} from '../messages'
import { DataConnection } from 'peerjs'
import {
  streamDownloadSingleFile,
  streamDownloadMultipleFiles,
  createLivePreviewStream,
  nativeDownloadSingleFile,
  nativeDownloadMultipleFiles,
  supportsFileSystemAccessAPI,
} from '../utils/download'
import {
  browserName,
  browserVersion,
  osName,
  osVersion,
  mobileVendor,
  mobileModel,
} from 'react-device-detect'
import { setRotating } from './useRotatingSpinner'
import { importKeyFromBase64Url, decryptChunk } from '../utils/crypto'

const cleanErrorMessage = (errorMessage: string): string =>
  errorMessage.startsWith('Could not connect to peer')
    ? 'Could not connect to the uploader. Did they close their browser?'
    : errorMessage

const getZipFilename = (): string => `pizzashare-download-${Date.now()}.zip`

export function useDownloader(uploaderPeerID: string): {
  filesInfo: Array<{ fileName: string; size: number; type: string }> | null
  isConnected: boolean
  isPasswordRequired: boolean
  isDownloading: boolean
  isPaused: boolean
  isDone: boolean
  errorMessage: string | null
  submitPassword: (password: string) => void
  startDownload: () => void
  stopDownload: () => void
  pauseDownload: () => void
  resumeDownload: () => void
  totalSize: number
  bytesDownloaded: number
  chatMessages: Array<{
    text: string
    sender: 'uploader' | 'downloader'
    timestamp: number
  }>
  sendChatMessage: (text: string) => void
  gameState: any
  sendGameState: (state: any) => void
  livePreviewUrls: Record<string, string>
} {
  const { peer } = useWebRTCPeer()
  const [dataConnection, setDataConnection] = useState<DataConnection | null>(
    null,
  )
  const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null)
  
  useEffect(() => {
    // Extract key from URL hash (e.g. #abc123key)
    const hash = window.location.hash.substring(1)
    if (hash) {
      importKeyFromBase64Url(hash)
        .then(setCryptoKey)
        .catch((err) => console.error('[Downloader] Failed to import key:', err))
    }
  }, [])

  const [filesInfo, setFilesInfo] = useState<Array<{
    fileName: string
    size: number
    type: string
  }> | null>(null)
  const processChunk = useRef<
    ((message: z.infer<typeof ChunkMessage>) => void) | null
  >(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isPasswordRequired, setIsPasswordRequired] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isDone, setDone] = useState(false)
  const [bytesDownloaded, setBytesDownloaded] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<
    Array<{
      text: string
      sender: 'uploader' | 'downloader'
      timestamp: number
    }>
  >([])
  const [gameState, setGameState] = useState<any>(null)
  
  const previewWritersRef = useRef<Record<string, WritableStreamDefaultWriter<Uint8Array>>>({})
  const [livePreviewUrls, setLivePreviewUrls] = useState<Record<string, string>>({})

  const retryCountRef = useRef(0)
  const MAX_RETRIES = 3
  const CONNECTION_TIMEOUT_MS = 12000

  useEffect(() => {
    if (!peer) return

    let timeoutId: ReturnType<typeof setTimeout> | null = null
    let currentConn: DataConnection | null = null
    let cleaned = false

    const attemptConnection = () => {
      if (cleaned) return
      const attempt = retryCountRef.current + 1
      console.log(`[Downloader] connection attempt ${attempt}/${MAX_RETRIES + 1} to ${uploaderPeerID}`)

      const conn = peer.connect(uploaderPeerID, { reliable: true })
      currentConn = conn
      setDataConnection(conn)

      // Set a timeout: if 'open' doesn't fire, retry
      timeoutId = setTimeout(() => {
        if (!cleaned && !conn.open) {
          console.warn(`[Downloader] connection attempt ${attempt} timed out after ${CONNECTION_TIMEOUT_MS}ms`)
          try { conn.close() } catch {}
          
          if (retryCountRef.current < MAX_RETRIES) {
            retryCountRef.current++
            attemptConnection()
          } else {
            setErrorMessage(
              'Could not connect to the sender after multiple attempts. ' +
              'The sender may have closed their browser, or your network may be blocking P2P connections.'
            )
          }
        }
      }, CONNECTION_TIMEOUT_MS)

      const handleOpen = () => {
        if (timeoutId) clearTimeout(timeoutId)
        console.log('[Downloader] connection opened')
        retryCountRef.current = 0
        setIsConnected(true)
        conn.send({
          type: MessageType.RequestInfo,
          browserName,
          browserVersion,
          osName,
          osVersion,
          mobileVendor,
          mobileModel,
        } as z.infer<typeof Message>)
      }

      const handleData = (data: unknown) => {
        try {
          const message = decodeMessage(data)
          console.log('[Downloader] received message', message.type)
          switch (message.type) {
            case MessageType.PasswordRequired:
              setIsPasswordRequired(true)
              if (message.errorMessage) setErrorMessage(message.errorMessage)
              break
            case MessageType.Info:
              setFilesInfo(message.files)
              setIsPasswordRequired(false)
              break
            case MessageType.Chunk:
              processChunk.current?.(message)
              setRotating(true)
              break
            case MessageType.Error:
              console.error('[Downloader] received error message:', message.error)
              setErrorMessage(message.error)
              conn.close()
              break
            case MessageType.Report:
              console.log('[Downloader] received report message, redirecting')
              window.location.href = '/reported'
              break
            case MessageType.Chat:
              setChatMessages((prev) => [
                ...prev,
                {
                  text: message.text,
                  sender: message.sender,
                  timestamp: message.timestamp,
                },
              ])
              break
            case MessageType.GameState:
              setGameState(message.state)
              break
          }
        } catch (err) {
          console.error('[Downloader] error handling message:', err)
        }
      }

      const handleClose = () => {
        console.log('[Downloader] connection closed')
        setRotating(false)
        setDataConnection(null)
        setIsConnected(false)
        setIsDownloading(false)
      }

      const handleError = (err: Error) => {
        console.error('[Downloader] connection error:', err)
        if (timeoutId) clearTimeout(timeoutId)
        setErrorMessage(cleanErrorMessage(err.message))
        if (conn.open) conn.close()
        else handleClose()
      }

      conn.on('open', handleOpen)
      conn.on('data', handleData)
      conn.on('error', handleError)
      conn.on('close', handleClose)
      peer.on('error', handleError)
    }

    attemptConnection()

    return () => {
      cleaned = true
      if (timeoutId) clearTimeout(timeoutId)
      console.log('[Downloader] cleaning up connection')
      if (currentConn) {
        if (currentConn.open) {
          currentConn.close()
        } else {
          currentConn.once('open', () => {
            currentConn?.close()
          })
        }
      }
    }
  }, [peer])

  const submitPassword = useCallback(
    (pass: string) => {
      if (!dataConnection) return
      console.log('[Downloader] submitting password')
      dataConnection.send({
        type: MessageType.UsePassword,
        password: pass,
      } as z.infer<typeof Message>)
    },
    [dataConnection],
  )

  const sendChatMessage = useCallback(
    (text: string) => {
      if (!dataConnection) return
      const msg = {
        type: MessageType.Chat,
        text,
        sender: 'downloader' as const,
        timestamp: Date.now(),
      }
      dataConnection.send(msg)
      setChatMessages((prev) => [...prev, msg])
    },
    [dataConnection],
  )

  const sendGameState = useCallback(
    (state: any) => {
      if (!dataConnection) return
      dataConnection.send({ type: MessageType.GameState, state })
    },
    [dataConnection],
  )

  const startDownload = useCallback(async (useNativeFS: boolean = false) => {
    if (!filesInfo || !dataConnection) return
    console.log('[Downloader] starting download')
    setIsDownloading(true)
    setIsPaused(false)

    // Pre-create preview streams for media files
    for (const info of filesInfo) {
      if (info.type.startsWith('video/') || info.type.startsWith('audio/')) {
        try {
          const { url, stream } = await createLivePreviewStream(info.fileName, info.type)
          previewWritersRef.current[info.fileName] = stream.getWriter()
          setLivePreviewUrls((prev) => ({ ...prev, [info.fileName]: url }))
          console.log('[Downloader] Created live preview URL for', info.fileName, url)
        } catch (err) {
          console.error('[Downloader] Preview stream creation failed:', err)
        }
      }
    }

    const fileStreamByPath: Record<
      string,
      {
        stream: ReadableStream<Uint8Array>
        enqueue: (chunk: Uint8Array) => void
        close: () => void
      }
    > = {}
    const fileStreams = filesInfo.map((info) => {
      let enqueue: ((chunk: Uint8Array) => void) | null = null
      let close: (() => void) | null = null
      const stream = new ReadableStream<Uint8Array>({
        start(ctrl) {
          enqueue = (chunk: Uint8Array) => ctrl.enqueue(chunk)
          close = () => ctrl.close()
        },
      })
      if (!enqueue || !close)
        throw new Error('Failed to initialize stream controllers')
      fileStreamByPath[info.fileName] = { stream, enqueue, close }
      return stream
    })

    let nextFileIndex = 0
    const startNextFileOrFinish = () => {
      if (nextFileIndex >= filesInfo.length) return
      console.log(
        '[Downloader] starting next file:',
        filesInfo[nextFileIndex].fileName,
      )
      dataConnection.send({
        type: MessageType.Start,
        fileName: filesInfo[nextFileIndex].fileName,
        offset: 0,
      } as z.infer<typeof Message>)
      nextFileIndex++
    }

    let chunkCountByFile: Record<string, number> = {}
    let chunkQueue = Promise.resolve()

    processChunk.current = (message: z.infer<typeof ChunkMessage>) => {
      chunkQueue = chunkQueue.then(async () => {
        const fileStream = fileStreamByPath[message.fileName]
        if (!fileStream) {
          console.error('[Downloader] no stream found for', message.fileName)
          return
        }

        // Track chunks for e2e testing
        if (!chunkCountByFile[message.fileName]) {
          chunkCountByFile[message.fileName] = 0
        }
        chunkCountByFile[message.fileName]++
        
        let chunkBytes = new Uint8Array(message.bytes as ArrayBuffer)
        
        if (cryptoKey) {
          try {
            const decrypted = await decryptChunk(message.bytes as ArrayBuffer, cryptoKey)
            chunkBytes = new Uint8Array(decrypted)
          } catch (e) {
            console.error('[Downloader] failed to decrypt chunk', e)
            return
          }
        }

        const chunkSize = chunkBytes.byteLength
        setBytesDownloaded((bd) => bd + chunkSize)
        
        fileStream.enqueue(chunkBytes)

        const previewWriter = previewWritersRef.current[message.fileName]
        if (previewWriter) {
          // Fire and forget to avoid backpressure stalling the download
          previewWriter.write(chunkBytes).catch((err) => {
            console.error('[Downloader] Failed to write preview chunk:', err)
          })
        }

        // Send acknowledgment to uploader. Note: we ack the unencrypted size to match original file boundaries.
        const ackMessage: Message = {
          type: MessageType.ChunkAck,
          fileName: message.fileName,
          offset: message.offset,
          bytesReceived: chunkSize,
        }
        dataConnection.send(ackMessage)
        console.log(
          `[Downloader] sent ack for chunk ${chunkCountByFile[message.fileName]} (${message.offset}, ${chunkSize} bytes)`,
        )

        if (message.final) {
          console.log(
            `[Downloader] finished receiving ${message.fileName} after ${chunkCountByFile[message.fileName]} chunks`,
          )
          if (previewWriter) {
            previewWriter.close().catch(console.error)
          }
          fileStream.close()
          startNextFileOrFinish()
        }
      })
    }

    const downloads = filesInfo.map((info, i) => ({
      name: info.fileName.replace(/^\//, ''),
      size: info.size,
      stream: () => fileStreams[i],
    }))

    let downloadPromise: Promise<void>
    if (useNativeFS && supportsFileSystemAccessAPI()) {
      downloadPromise = downloads.length > 1
        ? nativeDownloadMultipleFiles(downloads)
        : nativeDownloadSingleFile(downloads[0], downloads[0].name)
    } else {
      downloadPromise = downloads.length > 1
        ? streamDownloadMultipleFiles(downloads, getZipFilename())
        : streamDownloadSingleFile(downloads[0], downloads[0].name)
    }

    downloadPromise
      .then(() => {
        console.log('[Downloader] all files downloaded')
        dataConnection.send({ type: MessageType.Done } as z.infer<
          typeof Message
        >)
        setDone(true)
      })
      .catch((err) => console.error('[Downloader] download error:', err))

    startNextFileOrFinish()
  }, [dataConnection, filesInfo, cryptoKey])

  const stopDownload = useCallback(() => {
    if (dataConnection) {
      console.log('[Downloader] stopping download')
      dataConnection.close()
    }
    setIsDownloading(false)
    setIsPaused(false)
    setDone(false)
    setBytesDownloaded(0)
    setErrorMessage(null)
  }, [dataConnection])

  const pauseDownload = useCallback(() => {
    if (dataConnection && isDownloading && !isPaused) {
      console.log('[Downloader] pausing download')
      dataConnection.send({ type: MessageType.Pause })
      setIsPaused(true)
      setRotating(false)
    }
  }, [dataConnection, isDownloading, isPaused])

  const resumeDownload = useCallback(() => {
    if (dataConnection && isDownloading && isPaused) {
      console.log('[Downloader] resuming download')
      dataConnection.send({ type: MessageType.Resume })
      setIsPaused(false)
      setRotating(true)
    }
  }, [dataConnection, isDownloading, isPaused])

  return {
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
    totalSize: filesInfo?.reduce((acc, info) => acc + info.size, 0) ?? 0,
    bytesDownloaded,
    chatMessages,
    sendChatMessage,
    gameState,
    sendGameState,
    livePreviewUrls,
  }
}
