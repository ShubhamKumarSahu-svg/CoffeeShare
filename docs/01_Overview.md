# Chapter 1: Complete Project Overview & Feature Matrix

## 1.1 The Genesis of CoffeeShare
CoffeeShare was built to solve a simple problem: the friction of sharing large files across devices. Traditional cloud services (Google Drive, Dropbox) require uploading files to a central server and then downloading them again. This is slow, restricts file sizes, and exposes data to third-party storage.

CoffeeShare takes a completely serverless, peer-to-peer approach. When User A drops a file, a direct WebRTC tunnel is opened to User B. The file streams directly from device to device.

## 1.2 Comprehensive Feature Matrix
The project is significantly more than just a file transfer utility. It is an interactive, real-time collaboration space with a full DBMS backend.

### Core Networking & Transfer
*   **Infinite File Size**: Files are chunked and streamed. They are never fully loaded into memory.
*   **Direct Peer-to-Peer (WebRTC)**: Data flows from sender to receiver.
*   **Automatic NAT Traversal**: Uses `Metered.ca` TURN servers to bypass strict enterprise firewalls if direct P2P fails.
*   **End-to-End Encryption (E2EE)**: WebRTC data channels are encrypted by default via DTLS/SRTP protocols.
*   **Live Folder Sync**: Ability to transfer entire directory structures recursively (utilizing the File System Access API).
*   **Real-time Progress Tracking**: `useUploaderConnections` and `useDownloader` sync byte-level progress instantly.

### DBMS Backend (Prisma + SQLite)
*   **Transfer History**: Every file transfer is logged to a relational database with full CRUD operations.
*   **Room Management**: Sharing sessions are persisted with participant tracking and lifecycle timestamps.
*   **Analytics Dashboard**: Real-time aggregates (COUNT, SUM, AVG, MIN, MAX, GROUP BY) visualized in a floating dashboard.
*   **Dual Persistence**: Redis for ephemeral signaling (TTL-based), SQLite for durable history.

### Interactive "Wait-Time" Features
While large files transfer, users are kept in an interactive "Lobby".
*   **Real-time Text Chat**: `ChatDrawer.tsx` enables instantaneous messaging over the data channel.
*   **Voice & Video Calls**: `VideoChat.tsx` allows the peers to communicate with cameras and microphones seamlessly, featuring PiP (Picture-in-Picture) and ringing/decline protocols.

### The Game Hub (`GameHub.tsx`)
A suite of latency-immune, synchronized multiplayer games in a monochrome design system:
1.  **Connect Four**: Strategy grid game with white vs stone pieces.
2.  **Tic-Tac-Toe**: Classic 3x3 grid with win-line highlighting.
3.  **Memory Match**: Card flipping and matching with score tracking.
4.  **Typing Race**: Real-time WPM typing competition with 10 random texts.
5.  **Rock-Paper-Scissors**: 3-phase commit reveal protocol with ref-based state.
6.  **Reaction Race**: Latency-compensated reflex testing with round resolution.
7.  **Live Scratchpad**: A shared, synchronized text editor.

### Premium UI/UX Design System
*   **Monochrome Game UI**: All games use pure CSS transitions — zero framer-motion overhead during transfers.
*   **Landing Page Animations**: `Framer Motion` and `AnimeJS` for hero section (`StaggerText.tsx`, `StaggerCards.tsx`).
*   **Glassmorphism**: Backdrop blurs (`backdrop-blur-3xl`) with translucent inner borders.
*   **Dynamic Backgrounds**: `ParticleBackground.tsx` features massive glowing, moving mesh gradients.
*   **Typography**: Highly refined `Inter` fonts with strict tracking and multi-stop text gradients.

## 1.3 Target Architecture
```
[ User A: Uploader ] <======== WEBRTC DATA CHANNEL ========> [ User B: Downloader ]
         |                                                           |
         | (Signaling)                                               | (Signaling)
         v                                                           v
   [ Redis / Memory ]  <-- ephemeral room codes (TTL: 24h) -->  [ Redis / Memory ]
         |                                                           |
         v                                                           v
   [ Prisma + SQLite ]  <-- persistent transfer logs, analytics, room history
```

## 1.4 Technology Stack

| Layer | Technology | Purpose |
|:---|:---|:---|
| Frontend | Next.js 15 + React 19 | SSR, routing, components |
| Styling | Tailwind CSS 4 | Utility-first CSS |
| Real-time | PeerJS + WebRTC | P2P data/media channels |
| ORM | Prisma 7 | Type-safe database queries |
| Database | SQLite (dev) / PostgreSQL (prod) | Persistent storage |
| Cache | Redis / ioredis | Ephemeral signaling channels |
| Validation | Zod 4 | Runtime schema validation |
| Animation | Framer Motion (landing only) | Page transitions |
