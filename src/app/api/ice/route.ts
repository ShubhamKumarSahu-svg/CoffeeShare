import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { setTurnCredentials } from '../../../coturn'

const turnHost = process.env.TURN_HOST || '127.0.0.1'
const peerjsHost = process.env.PEERJS_HOST || '0.peerjs.com'
const peerjsPath = process.env.PEERJS_PATH || '/'

// Metered.ca TURN API key (free tier: 20GB/month)
const METERED_API_KEY = process.env.METERED_TURN_API_KEY || ''

export async function POST(): Promise<NextResponse> {
  // Multiple STUN servers for redundancy
  const stunServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ]

  // Try to fetch real TURN credentials from Metered.ca free API
  let meteredServers: Array<{ urls: string | string[]; username?: string; credential?: string }> = []
  if (METERED_API_KEY) {
    try {
      const res = await fetch(
        `https://coffeeshare.metered.live/api/v1/turn/credentials?apiKey=${METERED_API_KEY}`,
        { next: { revalidate: 3600 } } // cache for 1 hour
      )
      if (res.ok) {
        meteredServers = await res.json()
      }
    } catch (e) {
      console.warn('[ICE] Failed to fetch Metered TURN credentials:', e)
    }
  }

  const iceServers = [...stunServers, ...meteredServers]

  if (!process.env.COTURN_ENABLED) {
    return NextResponse.json({
      host: peerjsHost,
      path: peerjsPath,
      iceServers,
    })
  }

  // Generate ephemeral credentials for custom TURN
  const username = crypto.randomBytes(8).toString('hex')
  const password = crypto.randomBytes(8).toString('hex')
  const ttl = 86400 // 24 hours

  // Store credentials in Redis
  await setTurnCredentials(username, password, ttl)

  return NextResponse.json({
    host: peerjsHost,
    path: peerjsPath,
    iceServers: [
      ...iceServers,
      {
        urls: [`turn:${turnHost}:3478`, `turns:${turnHost}:5349`],
        username,
        credential: password,
      },
    ],
  })
}
