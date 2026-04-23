'use client'

import { JSX, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Wordmark from '../../../components/Wordmark'
import Downloader from '../../../components/Downloader'
import WebRTCPeerProvider from '../../../components/WebRTCProvider'
import Spinner from '../../../components/Spinner'

/**
 * Decode a base64url-encoded slug back to the original PeerJS peer ID.
 */
function slugToPeerId(slug: string): string | null {
  try {
    // Reverse the URL-safe base64 encoding
    let base64 = slug.replace(/-/g, '+').replace(/_/g, '/')
    // Add back padding
    while (base64.length % 4 !== 0) {
      base64 += '='
    }
    return atob(base64)
  } catch {
    return null
  }
}

export default function DownloadPage(): JSX.Element {
  const params = useParams()
  const slugRaw = params.slug

  const uploaderPeerID = useMemo(() => {
    const slug = Array.isArray(slugRaw) ? slugRaw.join('/') : slugRaw
    if (!slug) return null

    // Try to decode peer ID from the slug (new base64url format)
    const decoded = slugToPeerId(slug)
    if (decoded && decoded.length > 0) {
      return decoded
    }

    return null
  }, [slugRaw])

  if (!uploaderPeerID) {
    return (
      <div className="flex flex-col items-center space-y-6 py-14 max-w-xl mx-auto animate-fade-in">
        <Spinner />
        <Wordmark />
        <div className="text-center space-y-2">
          <h2 className="text-lg font-bold text-[#2c2c2c] dark:text-[#e0ddd8]">
            404 — This share link doesn&apos;t exist or has expired.
          </h2>
          <a
            href="/"
            className="text-amber-500 hover:text-amber-400 font-semibold text-sm transition-colors"
          >
            Share another file →
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center space-y-6 py-14 max-w-xl mx-auto animate-fade-in">
      <Wordmark />
      <WebRTCPeerProvider>
        <Downloader uploaderPeerID={uploaderPeerID} />
      </WebRTCPeerProvider>
    </div>
  )
}
