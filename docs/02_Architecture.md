# Chapter 2: WebRTC & Networking Deep Dive

To understand how CoffeeShare operates, you must understand the exact mechanics of establishing a Peer-to-Peer connection across the internet. This chapter breaks down the exact WebRTC lifecycle, from initial signaling to securing the `RTCDataChannel`.

## 2.1 The Connection Lifecycle: Signaling (Offer, Answer, ICE)

WebRTC is purely peer-to-peer, but two computers cannot connect without knowing each other's public IP address, ports, and supported media/data codecs. They need a "Signaling Server" just to pass notes to each other to initiate the connection. In CoffeeShare, we use a **Redis / In-Memory Channel Repository** (`src/channel.ts`) as the signaling backend, with Next.js API routes as the signaling server.

Here is the exact step-by-step lifecycle of a CoffeeShare connection:

1. **Uploader Initialization (The Host)**:
   - The Uploader opens the app. Our `WebRTCProvider` initializes a new `PeerJS` instance.
   - The browser reaches out to the PeerJS signaling server to generate a unique UUID (the `peerId`).
   - The Uploader creates a random 6-character room code (e.g., `A4X9B2`) via the `POST /api/create` route. The backend saves this mapping to Redis (production) or an in-memory Map (development), with a configurable TTL.
   - Simultaneously, the room is persisted to the **Prisma/SQLite database** for transfer history tracking.

2. **Downloader Initialization (The Client)**:
   - The receiver opens the share link, which contains the Base64url-encoded `peerId` in the URL slug.
   - The frontend decodes the slug back to the original `peerId` using `atob()` with URL-safe character reversal (`-` → `+`, `_` → `/`).

3. **The WebRTC Handshake (SDP Exchange)**:
   - **The Offer**: The Downloader's browser creates an `RTCPeerConnection`. It generates a Session Description Protocol (SDP) "Offer". This SDP contains the Downloader's encryption keys, supported codecs, and network configuration.
   - **The Answer**: The Offer is passed through the signaling server to the Uploader. The Uploader processes the Offer, configures its own `RTCPeerConnection`, and replies with an SDP "Answer".
   - *Result*: Both browsers now agree on the cryptographic parameters and how the data will be formatted.

4. **ICE Candidate Gathering (Finding the Route)**:
   - While the SDP is exchanged, both browsers begin gathering ICE (Interactive Connectivity Establishment) candidates. 
   - An ICE candidate is essentially a potential "route" for data to travel (e.g., Local Network IP, Public Router IP, or TURN Relay IP).
   - These candidates are continuously swapped between the peers until a working route is found. Once found, the WebRTC tunnel is open. The signaling server is no longer needed.

## 2.2 Penetrating Firewalls: STUN & TURN (`Metered.ca`)

Most devices sit behind a NAT (Network Address Translation) router. The router gives your device a fake local IP (`192.168.1.5`) and hides it behind a public IP. This makes direct P2P connections mathematically impossible without external help.

1. **STUN (Session Traversal Utilities for NAT)**:
   - If the NAT is simple (Full Cone or Restricted Cone), the browser pings a STUN server (like Google's `stun.l.google.com:19302`). 
   - The STUN server acts as a mirror, replying: *"Your public IP is 203.0.113.5 and port is 45000"*. 
   - The browsers exchange this public IP and perform **UDP Hole Punching** to establish a direct connection.

2. **TURN (Traversal Using Relays around NAT)**:
   - If the user is on a corporate, university, or strict cellular network, they are likely behind a **Symmetric NAT**. UDP Hole Punching is actively blocked by the router's firewall. 
   - In this scenario, WebRTC falls back to a TURN server.
   - **CoffeeShare's Implementation**: We use enterprise-grade TURN servers from `Metered.ca`. However, TURN servers are expensive (they act as a cloud relay where 100% of the encrypted traffic flows through them). You cannot expose your `Metered.ca` API key on the frontend.
   - To solve this, CoffeeShare has a highly secure Next.js backend API route (`src/app/api/ice/route.ts`). When the frontend mounts, it makes a POST request to this route. The backend securely uses the `METERED_TURN_API_KEY` to dynamically generate authenticated, time-limited TURN credentials, passing them safely back to the client's `RTCPeerConnection` configuration.

## 2.3 The WebRTC Data Channel (`RTCDataChannel`)

Once the tunnel is built, how is data actually shared?

- **The Pipe**: CoffeeShare opens an `RTCDataChannel`. This is a native browser API that acts exactly like a WebSocket, but it is peer-to-peer.
- **Protocol**: By default, WebRTC Data Channels use **SCTP (Stream Control Transmission Protocol)** over **DTLS (Datagram Transport Layer Security)**.
- **Security**: Because it relies on DTLS, **100% of the data transferred through CoffeeShare is End-to-End Encrypted (E2EE) by default**. Not even the TURN server, ISP, or router can decrypt the file blobs.
- **Reliability**: We configure the data channel to be `reliable: true` and `ordered: true`. This ensures that file chunks arrive in the exact order they were sent, and if a packet drops, SCTP automatically requests a re-transmission, guaranteeing file integrity.

## 2.4 Application-Layer E2EE (AES-256-GCM via Web Crypto API)

While WebRTC provides transport-layer encryption (DTLS), CoffeeShare adds a **second layer of application-level encryption** using the browser's native `Web Crypto API`.

### Key Generation & Distribution
1. When the Uploader starts sharing, the app calls `window.crypto.subtle.generateKey()` to create a random **256-bit AES-GCM key**.
2. The raw key bytes are exported and converted to a **Base64url string** (URL-safe: `+` → `-`, `/` → `_`, padding stripped).
3. This key string is appended to the share URL as a **hash fragment**: `https://coffeeshare.app/download/<slug>#key=<base64url-key>`.

### The Hash Fragment Security Property
The critical security insight: **browsers never send the hash fragment (`#...`) to the server in any HTTP request.** When the Downloader opens the URL:
- The server receives: `GET /download/<slug>` (no key).
- The browser reads the `#key=...` fragment **client-side only** via `window.location.hash`.
- The key is imported back into a `CryptoKey` object using `crypto.subtle.importKey()`.

### Per-Chunk Encryption Flow
```
Uploader                                    Downloader
─────────                                   ──────────
1. Read 64KB chunk from File.slice()
2. Generate random 12-byte IV
3. AES-GCM encrypt(chunk, key, iv)
4. Prepend IV to ciphertext: [IV(12B) | Ciphertext]
5. Send over RTCDataChannel  ─────────►  6. Extract IV from first 12 bytes
                                          7. AES-GCM decrypt(ciphertext, key, iv)
                                          8. Write plaintext chunk to disk
```

### Why This Matters
- Even if a TURN relay is used (which sees all encrypted WebRTC traffic), the data is **double-encrypted**: once by DTLS (transport) and once by AES-256-GCM (application).
- Even if someone gains access to the CoffeeShare server logs, they have **zero ability** to decrypt any file — the key never touches the server.

See `src/utils/crypto.ts` for the full implementation: `generateCryptoKey()`, `exportKeyToBase64Url()`, `importKeyFromBase64Url()`, `encryptChunk()`, `decryptChunk()`.

In the next chapter, we will explore exactly what is pushed through this encrypted pipe and how we manage memory during a 50GB file transfer.
