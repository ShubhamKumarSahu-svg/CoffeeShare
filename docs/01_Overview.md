# Chapter 1: Complete Project Overview & Feature Matrix

## 1.1 The Genesis of CoffeeShare
CoffeeShare was built to solve a simple problem: the friction of sharing large files across devices. Traditional cloud services (Google Drive, Dropbox) require uploading files to a central server and then downloading them again. This is slow, restricts file sizes, and exposes data to third-party storage.

CoffeeShare takes a completely serverless, peer-to-peer approach. When User A drops a file, a direct WebRTC tunnel is opened to User B. The file streams directly from device to device.

## 1.2 Comprehensive Feature Matrix
The project is significantly more than just a file transfer utility. It is an interactive, real-time collaboration space with a full DBMS backend and application-layer End-to-End Encryption.

### Core Networking & Transfer
*   **Infinite File Size**: Files are chunked and streamed. They are never fully loaded into memory.
*   **Direct Peer-to-Peer (WebRTC)**: Data flows from sender to receiver.
*   **Automatic NAT Traversal**: Uses `Metered.ca` TURN servers to bypass strict enterprise firewalls if direct P2P fails.
*   **Dual-Layer End-to-End Encryption (E2EE)**:
    *   **Transport Layer**: WebRTC data channels are encrypted by default via DTLS/SRTP protocols.
    *   **Application Layer (AES-256-GCM)**: CoffeeShare generates a 256-bit AES-GCM key using the Web Crypto API. Each file chunk is encrypted before entering the WebRTC pipe. The decryption key is embedded in the URL hash fragment (`#key=...`), which is **never sent to the server** (browsers strip the hash from HTTP requests).
*   **Live Folder Sync**: Ability to transfer entire directory structures recursively (utilizing the File System Access API).
*   **Real-time Progress Tracking**: `useUploaderConnections` and `useDownloader` sync byte-level progress instantly.
*   **Base64url Share Links**: Peer IDs are encoded into URL-safe Base64 slugs (`/download/<base64url-encoded-peerId>`) for clean, shareable URLs without exposing raw UUIDs.

### DBMS Backend (Prisma + SQLite)
*   **Transfer History**: Every file transfer is logged to a relational database with full CRUD operations.
*   **Room Management**: Sharing sessions are persisted with participant tracking and lifecycle timestamps.
*   **Analytics Dashboard**: Real-time aggregates (COUNT, SUM, AVG, MIN, MAX, GROUP BY) visualized in a floating dashboard styled with the Bauhaus design system.
*   **Dual Persistence**: Redis for ephemeral signaling (TTL-based), SQLite for durable history.

### Interactive "Wait-Time" Features
While large files transfer, users are kept in an interactive "Lobby."
*   **Real-time Text Chat**: `ChatDrawer.tsx` enables instantaneous messaging over the data channel.
*   **Voice & Video Calls**: `VideoChat.tsx` allows the peers to communicate with cameras and microphones, featuring:
    *   **Dual Call Modes**: Audio-only or full Video calling.
    *   **Incoming Call UI**: A dedicated ringing panel with Accept (Voice), Accept (Video), and Decline buttons.
    *   **Call Decline Signaling**: Uses a separate PeerJS DataConnection to reliably send `CALL_DECLINED` messages back to the caller.
    *   **Picture-in-Picture (PiP)**: Local video feed is shown as a draggable mini-preview overlaid on the remote feed.
    *   **Maximize/Minimize**: Toggle between a compact floating widget and a full-screen immersive view.
    *   **In-Call Controls**: Mute Microphone, Toggle Camera, and End Call with Bauhaus-styled control bar.

### The Game Hub (`GameHub.tsx`)
A suite of latency-immune, synchronized multiplayer games:
1.  **Connect Four**: Strategy grid game with synchronized board state.
2.  **Tic-Tac-Toe**: Classic 3x3 grid with win-line highlighting.
3.  **Memory Match**: Card flipping and matching with score tracking.
4.  **Typing Race**: Real-time WPM typing competition with 10 random texts.
5.  **Rock-Paper-Scissors**: 3-phase commit reveal protocol with ref-based state.
6.  **Reaction Race**: Latency-compensated reflex testing with round resolution.
7.  **Live Scratchpad**: A shared, synchronized text editor.

### Bauhaus Design System
CoffeeShare uses a custom **Bauhaus-inspired design language** — a high-contrast, geometric aesthetic built around three primary colors and rigid, mechanical containers.

*   **Color Palette**: Bauhaus Red (`#D02020`), Blue (`#1040C0`), Yellow (`#F0C020`) on a light neutral background (`#F0F0F0`).
*   **Geometric Containers**: All UI panels use solid white backgrounds with thick `4px` black borders and hard-edge `box-shadow: 4px 4px 0px 0px` (no blur, no rounded corners).
*   **Typography**: `Outfit` font family with `font-weight: 900`, `text-transform: uppercase`, and aggressive `letter-spacing` for a bold, industrial feel.
*   **Dot Grid Background**: A CSS `radial-gradient` dot pattern (`24px × 24px` grid) applied to the `<body>` for an engineering-blueprint texture.
*   **Hover Physics**: Elements lift on hover (`translateY(-4px)`) with expanding shadows, and press down on click (`translate(2px, 2px)`) with shadows collapsing to zero — simulating mechanical button presses.
*   **Custom SVG Wordmark**: The logo is a geometric pour-over coffee cup constructed from three Bauhaus primitives: a red rectangle (mug body), a yellow circle (handle), and a blue triangle (pour-over cone), with interactive hover animations.
*   **Dynamic Spinner**: The download progress indicator is a full 3D Bauhaus coffee cup SVG that fills with blue "liquid" in real-time based on actual transfer progress, with animated steam lines.

## 1.3 Target Architecture
```
[ User A: Uploader ] <======== WEBRTC DATA CHANNEL ========> [ User B: Downloader ]
         |                     (AES-256-GCM + DTLS)                    |
         | (Signaling)                                                 | (Signaling)
         v                                                             v
   [ Redis / Memory ]  <-- ephemeral room codes (TTL: 24h) -->  [ Redis / Memory ]
         |                                                             |
         v                                                             v
   [ Prisma + SQLite ]  <-- persistent transfer logs, analytics, room history
```

## 1.4 Technology Stack

| Layer | Technology | Purpose |
|:---|:---|:---|
| Frontend | Next.js 15 + React 19 | SSR, routing, components |
| Styling | Tailwind CSS 4 + Bauhaus Design System | Utility-first CSS with custom geometric theme |
| Real-time | PeerJS + WebRTC | P2P data/media channels |
| Encryption | Web Crypto API (AES-256-GCM) | Application-layer E2EE |
| ORM | Prisma 7 | Type-safe database queries |
| Database | SQLite (dev) / PostgreSQL (prod) | Persistent storage |
| Cache | Redis / ioredis | Ephemeral signaling channels |
| Validation | Zod 4 | Runtime schema validation |
| Animation | Framer Motion (landing only) | Page transitions |
| Typography | Google Fonts (Outfit) | Display & body typeface |

## 1.5 URL Architecture & Share Link Design

CoffeeShare uses a **Base64url slug system** for generating clean, shareable download URLs:

1. When an Uploader starts sharing, PeerJS assigns a UUID-based `peerId` (e.g., `550e8400-e29b-41d4-a716-446655440000`).
2. The application **Base64url-encodes** this peerId: replacing `+` with `-`, `/` with `_`, and stripping padding `=`.
3. The resulting slug becomes the download URL path: `/download/NTUwZTg0MDAtZTI5Yi00MWQ0LWE3MTYtNDQ2NjU1NDQwMDAw`.
4. The **AES-256-GCM decryption key** is appended as a URL hash fragment: `#key=<base64url-encoded-key>`.

**Security Property**: The hash fragment (`#key=...`) is **never transmitted to the server** in any HTTP request. It exists only in the browser's address bar and is read client-side by the Downloader to decrypt incoming chunks. This means even if someone intercepts the server traffic, they cannot decrypt the file.

## 1.6 File Structure (Key Components)

| Path | Purpose |
|:---|:---|
| `src/app/page.tsx` | Main landing page, upload confirmation, sharing state machine |
| `src/app/download/[...slug]/page.tsx` | Download page with Base64url slug decoding |
| `src/components/Uploader.tsx` | WebRTC host: manages connections, QR code, share link |
| `src/components/Downloader.tsx` | WebRTC client: receives chunks, writes to disk |
| `src/components/VideoChat.tsx` | Voice/Video call system with full call lifecycle |
| `src/components/ChatDrawer.tsx` | Real-time text messaging over DataChannel |
| `src/components/GameHub.tsx` | Multiplayer game launcher with invite system |
| `src/components/TransferHistory.tsx` | DBMS dashboard (History + Analytics tabs) |
| `src/components/Spinner.tsx` | Animated Bauhaus coffee cup progress indicator |
| `src/components/Wordmark.tsx` | SVG logo linking to home |
| `src/utils/crypto.ts` | AES-256-GCM key generation, export, encrypt/decrypt |
| `src/channel.ts` | Signaling backend (Redis / In-Memory strategy pattern) |
| `prisma/schema.prisma` | Database schema (Room, RoomParticipant, Transfer, AnalyticsEvent) |
