# CoffeeShare ☕

CoffeeShare is a modern, high-performance web application that enables fast, secure, and direct peer-to-peer (P2P) file sharing directly from your browser. There are no file size limits, no server-side storage, and no sign-ups required.

## 🚀 How It Works (Project Overview)

CoffeeShare operates by establishing a direct connection between the uploader's browser and the downloader's browser. When you drop a file into CoffeeShare, the file is never uploaded to a central server. Instead, CoffeeShare generates a unique secure share link. Once the recipient opens the link, the two browsers connect directly, and the file is streamed across the internet.

### Start-to-End Flow:
1. **Upload Initiation**: A user drags and drops a file (or folder) into the browser.
2. **Signaling & Link Generation**: The application communicates with a PeerJS signaling server to get a unique WebRTC `peerID`. This ID is embedded into a shareable link (e.g., `coffeeshare.app/download/<encoded-peer-id>`).
3. **Sharing**: The uploader shares this link with the recipient. The uploader MUST keep their browser tab open.
4. **Peer Discovery**: The downloader opens the link. The app extracts the uploader's `peerID` and uses the signaling server to initiate a connection to the uploader.
5. **Direct Transfer**: WebRTC establishes a direct connection. The file is read in chunks using the browser's File API and streamed through a WebRTC `RTCDataChannel` to the downloader, where it is dynamically reconstructed and downloaded using `StreamSaver.js`.

---

## 🗄️ Database Management System (DBMS) Integration

While CoffeeShare is fundamentally a serverless P2P app, it relies on database concepts for managing share links (Channels) when configured with a backend.

* **Key-Value Store (Redis)**: CoffeeShare implements a `RedisChannelRepo` using `ioredis`. Redis serves as an extremely fast, in-memory data structure store used to map user-friendly short URLs (e.g., `hxkn68wv`) and long URLs (e.g., `spicy-cheese-pizza`) to WebRTC Peer IDs.
* **Concurrency & Uniqueness**: The backend generates random slugs and verifies their uniqueness in the database before assigning them (`generateShortSlugUntilUnique`).
* **TTL (Time To Live)**: To ensure data doesn't accumulate forever, Redis keys are set with an automatic expiration time (TTL) of 1 hour (`config.channel.ttl`). This automatically cleans up stale channels, acting as an automated garbage collector for the database.
* **In-Memory Fallback**: For environments without Redis (like serverless Vercel deployments), the system seamlessly falls back to either a `MemoryChannelRepo` (using standard JavaScript `Map` structures) or encodes the state directly into the URL (Base64 encoding), completely bypassing the need for database persistence.

---

## 🌐 Computer Networks Concepts

CoffeeShare is heavily built on advanced Computer Networking principles.

### 1. WebRTC (Web Real-Time Communication)
WebRTC is the backbone of CoffeeShare. It allows audio, video, and data to be sent directly across browsers without an intermediary. CoffeeShare utilizes the `RTCDataChannel` API specifically for low-latency, reliable binary file transfers.

### 2. Signaling
Before two peers can connect directly, they need to know how to reach each other. CoffeeShare uses a signaling server (via `PeerJS`) to exchange **SDP (Session Description Protocol)** data. SDP contains information about media formats, protocols, and network routing. Once this handshake is complete, the signaling server steps out of the way.

### 3. NAT Traversal (ICE, STUN, & TURN)
Browsers sit behind routers and NATs (Network Address Translation), meaning they don't usually have public IP addresses.
* **STUN (Session Traversal Utilities for NAT)**: CoffeeShare uses Google's public STUN servers (`stun:stun.l.google.com:19302`) to allow the browser to discover its own public IP address and port mapping.
* **TURN (Traversal Using Relays around NAT)**: In restrictive networks (like corporate firewalls or symmetric NATs) where direct connections fail, CoffeeShare can fall back to a TURN server (`coturn`). The TURN server acts as a relay, forwarding packets between peers when P2P routing is impossible.
* **ICE (Interactive Connectivity Establishment)**: ICE is the framework that automatically tests all possible connection paths (local IP, STUN public IP, TURN relay) and selects the most efficient route for the file transfer.

### 4. Application-Layer Protocols
* **WebSockets**: Used by the signaling server to maintain a persistent connection for instant messaging and connection handshakes.
* **Stream Chunking**: Large files cannot be sent in a single burst. The file is divided into `256 KB` chunks at the application layer. Each chunk is sent sequentially, acknowledged (`ChunkAck`), and reassembled at the destination.

---

## 🔒 Zero-Knowledge End-to-End Encryption (E2EE)
CoffeeShare now features true zero-knowledge encryption using the browser's native Web Crypto API.
1. **Key Generation**: When you select a file, your browser generates a highly secure 256-bit `AES-GCM` encryption key.
2. **URL Hash Storage**: This key is appended to the share link as a URL fragment (e.g., `#<key>`). By design, browsers **never** send the `#hash` portion of a URL to any server. Vercel, the TURN relays, and your ISP cannot see this key.
3. **On-the-fly Encryption**: Before any 256KB chunk is sent through WebRTC, it is dynamically encrypted.
4. **Decryption**: The downloader extracts the key from the URL hash and dynamically decrypts incoming chunks before reconstructing the file.
This means even if a server intercepts your packets, they will only see AES-encrypted gibberish!

---

## 🚀 Advanced P2P Features

CoffeeShare goes beyond simple file transfers by utilizing the WebRTC connection for incredible secondary features:

### 🎙️ Direct Voice & Video Chat
You can start a secure, peer-to-peer video call with the person downloading your file!
* **How it works:** CoffeeShare leverages `navigator.mediaDevices` to capture your local webcam and microphone stream. This `MediaStream` is then directly attached to the existing `PeerJS` connection via `peer.call(remoteId, stream)`.
* **Zero Servers:** Because it piggybacks on the existing STUN/TURN WebRTC connection, the video stream goes directly from your browser to theirs with zero intermediaries and zero latency.

### 📝 Real-Time Collaborative Scratchpad
Need to share an API key, code snippet, or text notes while the file transfers?
* **How it works:** Alongside the games (Coffee Pong, Tic-Tac-Toe), CoffeeShare includes a live collaborative text editor. It uses the `RTCDataChannel` to sync keystrokes instantly between both browsers. Because it uses the UDP-based Data Channel, it feels exactly like typing on the same physical keyboard.

### 📂 Native Folder Syncing (File System Access API)
Instead of forcing users to download `.zip` files for large folder structures, CoffeeShare uses modern web standards.
* **How it works:** When a downloader receives a folder structure, CoffeeShare utilizes the modern **File System Access API** (`window.showDirectoryPicker()`). 
* **Native Extraction:** The browser asks the user to pick a local folder on their hard drive. As the chunks stream in over WebRTC, the application automatically constructs the exact subdirectories and writes the binary chunks directly to the user's hard drive! 

---

## 🛠️ Technology Stack
* **Frontend Framework**: Next.js 15 (React 19)
* **Styling**: TailwindCSS & Framer Motion
* **Networking**: WebRTC & PeerJS
* **File Handling**: StreamSaver.js (Service Workers)
* **Storage (Optional)**: Redis

## 🎨 Theme Tokens (Design System)

CoffeeShare uses centralized semantic tokens in `src/styles.css`.

### Typography Tokens
- `--font-display`: Space Grotesk
- `--font-body`: Manrope
- `--font-mono`: JetBrains Mono

### Core Color Tokens (OKLCH)
- `--bg-app`, `--bg-elevated`, `--bg-card`, `--bg-muted`, `--bg-overlay`
- `--text-primary`, `--text-secondary`, `--text-muted`, `--text-inverse`
- `--brand`, `--brand-strong`, `--brand-soft`
- `--success`, `--danger`
- `--border-subtle`, `--border-strong`, `--ring`

### Motion Tokens
- `--ease-standard`
- `--dur-fast`, `--dur-med`, `--dur-slow`

### Radius Tokens
- `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-2xl`, `--radius-pill`

### Component Utility Classes
- Buttons: `.btn`, `.btn-hero`, `.btn-ghost`, `.btn-ember`
- Surfaces: `.surface`, `.panel`, `.bg-card`, `.bg-elevated`
- Text semantics: `.text-primary`, `.text-secondary`, `.text-muted`, `.text-brand`
- Layout accents: `.nav-pill`, `.mesh-overlay`, `.noise-overlay`

## 📝 License
BSD-3-Clause License
