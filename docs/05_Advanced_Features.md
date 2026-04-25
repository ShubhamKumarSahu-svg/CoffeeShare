# Chapter 5: Advanced Features (Games & Chat)

While files transfer, users are placed into a shared interactive lobby. This turns a boring waiting room into a collaborative space.

## 5.1 The Multiplayer Game Architecture
CoffeeShare features 7 fully synchronized multiplayer mini-games (`src/components/games/`).

**The Latency Problem:**
If a user is maxing out their bandwidth transferring a 10GB file, their "ping" (latency) will spike. Implementing a real-time physics game normally results in a terrible UX with lag and rubber-banding.

**The Solutions:**
1.  **Turn-Based Strategy**: *Connect Four* and *Tic-Tac-Toe*. A 500ms delay to see the opponent's move doesn't break the game.
2.  **Asynchronous Solo-Racing**: *Typing Race* and *Memory Match*. The player plays locally, and only their score/progress is transmitted to the opponent.
3.  **Fixed-Timestep & Prediction**: *Coffee Pong*. To implement real-time physics without relying on low latency, we use a fixed-timestep physics engine (60 ticks per second) ensuring deterministic gameplay across different monitor refresh rates. The host runs the authoritative simulation and broadcasts state, while the peer runs client-side prediction to visually extrapolate the ball's trajectory, eliminating jitter even during massive file transfers.

**State Synchronization (Zero Server Logic):**
1.  **Local Reducer**: Each game has a local state (e.g., `board: [null, 'X', 'O']`).
2.  **Broadcast**: When Player A moves, the exact move payload is stringified and sent over the WebRTC Data Channel.
3.  **Receive**: Player B's `useDownloader`/`useUploaderConnections` hook receives the packet, parses it, and feeds it into their local React state.

## 5.2 End-to-End Encrypted Voice & Video Calling (`VideoChat.tsx`)
CoffeeShare allows users to seamlessly start a voice or video call while files are transferring.
*   **Implementation**: Utilizes `navigator.mediaDevices.getUserMedia` to capture local audio/video streams.
*   **Data Flow**: Instead of the WebRTC `DataChannel` used for files, the media is piped through WebRTC `MediaStream` tracks (`peer.call()`).
*   **Features**: Includes inline call controls (Mute, Video Toggle), picture-in-picture mode, call decline signaling, and drag-and-drop window positioning using `framer-motion`. All media is peer-to-peer and heavily encrypted by DTLS/SRTP protocols standard in WebRTC.

## 5.3 The Chat Drawer (`ChatDrawer.tsx`)
A sleek, sliding chat interface exists on the side of the screen.
*   **Implementation**: It's a `framer-motion` sliding drawer.
*   **Data Flow**: Just like games, text strings are sent via WebRTC Data Channels.
*   **Notifications**: We integrated `react-hot-toast` and audio chimes (`playDingSound`) to alert the user if they receive a message while the drawer is closed.

## 5.4 Live Scratchpad (`Scratchpad.tsx`)
A shared, real-time synchronized textarea. 
*   This demonstrates basic Operational Transformation (OT) concepts. As one user types, the entire state (or diff) is broadcasted. 
*   It's perfect for quickly sharing links, passwords, or notes securely (since the entire WebRTC channel is end-to-end encrypted).
