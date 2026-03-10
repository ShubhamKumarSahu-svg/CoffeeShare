// E2EE Web Crypto API Utilities

/**
 * Generate a random 256-bit AES-GCM key.
 */
export async function generateCryptoKey(): Promise<CryptoKey> {
  return await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true, // extractable
    ['encrypt', 'decrypt'],
  )
}

/**
 * Export the CryptoKey to a base64url string so it can be placed in the URL hash.
 */
export async function exportKeyToBase64Url(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey('raw', key)
  const uint8Array = new Uint8Array(exported)
  const binaryString = String.fromCharCode(...uint8Array)
  return btoa(binaryString).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * Import a base64url string back into a CryptoKey.
 */
export async function importKeyFromBase64Url(base64Url: string): Promise<CryptoKey> {
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4 !== 0) {
    base64 += '='
  }
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return await window.crypto.subtle.importKey(
    'raw',
    bytes,
    'AES-GCM',
    true,
    ['encrypt', 'decrypt'],
  )
}

/**
 * Encrypt a chunk of data. Prepend the 12-byte IV to the encrypted ciphertext.
 */
export async function encryptChunk(chunk: ArrayBuffer, key: CryptoKey): Promise<ArrayBuffer> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12))
  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    chunk,
  )
  
  // Combine IV (12 bytes) and Ciphertext
  const combined = new Uint8Array(12 + ciphertext.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(ciphertext), 12)
  return combined.buffer
}

/**
 * Decrypt a chunk of data. Extracts the 12-byte IV from the beginning.
 */
export async function decryptChunk(encryptedData: ArrayBuffer, key: CryptoKey): Promise<ArrayBuffer> {
  const iv = encryptedData.slice(0, 12)
  const ciphertext = encryptedData.slice(12)
  
  return await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: new Uint8Array(iv),
    },
    key,
    ciphertext,
  )
}
