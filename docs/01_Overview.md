# Chapter 1: Complete Project Overview & Feature Matrix

## 1.1 The Genesis of CoffeeShare
CoffeeShare was built to solve a simple problem: the friction of sharing large files across devices. Traditional cloud services (Google Drive, Dropbox) require uploading files to a central server and then downloading them again. This is slow, restricts file sizes, and exposes data to third-party storage. 

CoffeeShare takes a completely serverless, peer-to-peer approach. When User A drops a file, a direct WebRTC tunnel is opened to User B. The file streams directly from device to device.

## 1.2 Comprehensive Feature Matrix
The project is significantly more than just a file transfer utility. It is an interactive, real-time collaboration space.

### Core Networking & Transfer
*   **Infinite File Size**: Files are chunked and streamed. They are never fully loaded into memory.
*   **Direct Peer-to-Peer (WebRTC)**: Data flows from sender to receiver.
*   **Automatic NAT Traversal**: Uses `Metered.ca` TURN servers to bypass strict enterprise firewalls if direct P2P fails.
*   **End-to-End Encryption (E2EE)**: WebRTC data channels are encrypted by default via DTLS/SRTP protocols.
*   **Live Folder Sync**: Ability to transfer entire directory structures recursively (utilizing the File System Access API).
*   **Real-time Progress Tracking**: `useUploaderConnections` and `useDownloader` sync byte-level progress instantly.

### Interactive "Wait-Time" Features
While large files transfer, users are kept in an interactive "Lobby".
*   **Real-time Text Chat**: `ChatDrawer.tsx` enables instantaneous messaging over the data channel.
*   **Voice & Video Calls**: `VideoChat.tsx` allows the peers to communicate with cameras and microphones seamlessly, featuring a highly-polished Glassmorphism UI, PiP (Picture-in-Picture), and ringing/decline protocols.

### The Game Hub (`GameHub.tsx`)
A suite of latency-immune, synchronized multiplayer games:
1.  **Connect Four**: Strategy grid game.
2.  **Tic-Tac-Toe**: Classic 3x3 grid.
3.  **Memory Match**: Card flipping and matching.
4.  **Typing Race**: Real-time WPM typing competition.
5.  **Rock-Paper-Scissors**: Blind choice combat.
6.  **Reaction Race**: Latency-compensated reflex testing.
7.  **Live Scratchpad**: A shared, synchronized canvas/text pad.

### Premium UI/UX Design System
*   **Fluid Animations**: Powered by `Framer Motion` and `AnimeJS` (`StaggerText.tsx`, `StaggerCards.tsx`).
*   **Glassmorphism**: Backdrop blurs (`backdrop-blur-3xl`) with translucent inner borders.
*   **Dynamic Backgrounds**: `ParticleBackground.tsx` features massive glowing, moving mesh gradients.
*   **Typography**: Highly refined `Inter` fonts with strict tracking and multi-stop text gradients.

## 1.3 Target Architecture
```
[ User A: Uploader ] <======== WEBRTC DATA CHANNEL ========> [ User B: Downloader ]
         |                                                           |
         | (Signaling only)                                          | (Signaling only)
         v                                                           v
  [ Supabase DB ] <----------------------------------------> [ Supabase DB ]
```
