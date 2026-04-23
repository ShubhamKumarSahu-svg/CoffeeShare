import { useQuery, useMutation } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { generateCryptoKey, exportKeyToBase64Url } from '../utils/crypto'

function generateURL(slug: string, secretKey?: string): string {
  const hostPrefix =
    window.location.protocol +
    '//' +
    window.location.hostname +
    (window.location.port ? ':' + window.location.port : '')
  let url = `${hostPrefix}/download/${slug}`
  if (secretKey) {
    url += `#${secretKey}`
  }
  return url
}

/**
 * Encode the peer ID into a short, URL-safe slug.
 */
function peerIdToSlug(peerId: string): string {
  return btoa(peerId).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function useUploaderChannel(
  uploaderPeerID: string,
  renewInterval = 60_000,
): {
  isLoading: boolean
  error: Error | null
  longSlug: string | undefined
  shortSlug: string | undefined
  longURL: string | undefined
  shortURL: string | undefined
  cryptoKey: CryptoKey | null
} {
  const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null)
  const [secretKeyStr, setSecretKeyStr] = useState<string>('')

  // Generate E2EE key once on mount
  useEffect(() => {
    async function initKey() {
      const key = await generateCryptoKey()
      const keyStr = await exportKeyToBase64Url(key)
      setCryptoKey(key)
      setSecretKeyStr(keyStr)
    }
    initKey()
  }, [])

  const { isLoading: queryLoading, error, data } = useQuery({
    queryKey: ['uploaderChannel', uploaderPeerID],
    queryFn: async () => {
      console.log(
        '[UploaderChannel] creating new channel for peer',
        uploaderPeerID,
      )
      const response = await fetch('/api/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploaderPeerID }),
      })
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return await response.json()
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  })

  const secret = data?.secret
  const longSlug = data?.longSlug
  const shortSlug = data?.shortSlug

  const peerSlug = peerIdToSlug(uploaderPeerID)
  // Short URL includes the secret key hash for E2EE
  const shortURL = secretKeyStr ? generateURL(peerSlug, secretKeyStr) : undefined
  const longURL = longSlug && secretKeyStr ? generateURL(longSlug, secretKeyStr) : shortURL

  const renewMutation = useMutation({
    mutationFn: async ({ secret: s }: { secret: string }) => {
      const response = await fetch('/api/renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: shortSlug, secret: s }),
      })
      if (!response.ok) throw new Error('Network response was not ok')
      return await response.json()
    },
  })

  useEffect(() => {
    if (!secret || !shortSlug) return
    let timeout: NodeJS.Timeout | null = null
    const run = (): void => {
      timeout = setTimeout(() => {
        renewMutation.mutate({ secret })
        run()
      }, renewInterval)
    }
    run()
    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [secret, shortSlug, renewMutation, renewInterval])

  useEffect(() => {
    if (!shortSlug || !secret) return
    const handleUnload = (): void => {
      navigator.sendBeacon('/api/destroy', JSON.stringify({ slug: shortSlug }))
    }
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [shortSlug, secret])

  return {
    isLoading: !shortURL, // Wait until key and URL are fully generated
    error,
    longSlug,
    shortSlug: peerSlug,
    longURL,
    shortURL,
    cryptoKey,
  }
}
