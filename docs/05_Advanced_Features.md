# Chapter 5: Advanced Features (Games & Chat)

While files transfer, users are placed into a shared interactive lobby. This turns a boring waiting room into a collaborative space.

## 5.1 The Multiplayer Game Architecture
CoffeeShare features 7 fully synchronized multiplayer mini-games (`src/components/games/`).

**The Latency Problem:**
If a user is maxing out their bandwidth transferring a 10GB file, their "ping" (latency) will spike. If we implemented a real-time physics game (like Pong or a Shooter), the game would lag, stutter, and rubber-band, creating a terrible UX.

**The Asynchronous Solution:**
We intentionally designed the game suite to be latency-immune:
*   **Turn-Based Strategy**: *Connect Four* and *Tic-Tac-Toe*. A 500ms delay to see the opponent's move doesn't break the game.
*   **Asynchronous Solo-Racing**: *Typing Race* and *Memory Match*. The player plays locally, and only their score/progress is transmitted to the opponent.

**State Synchronization (Zero Server Logic):**
1.  **Local Reducer**: Each game has a local state (e.g., `board: [null, 'X', 'O']`).
2.  **Broadcast**: When Player A moves, the exact move payload is stringified and sent over the WebRTC Data Channel.
3.  **Receive**: Player B's `useDownloader`/`useUploaderConnections` hook receives the packet, parses it, and feeds it into their local React state.

## 5.2 The Chat Drawer (`ChatDrawer.tsx`)
A sleek, sliding chat interface exists on the side of the screen.
*   **Implementation**: It's a `framer-motion` sliding drawer.
*   **Data Flow**: Just like games, text strings are sent via WebRTC.
*   **Notifications**: We integrated `react-hot-toast` and audio chimes (`playDingSound`) to alert the user if they receive a message while the drawer is closed.

## 5.3 Live Scratchpad (`Scratchpad.tsx`)
A shared, real-time synchronized textarea. 
*   This demonstrates basic Operational Transformation (OT) concepts. As one user types, the entire state (or diff) is broadcasted. 
*   It's perfect for quickly sharing links, passwords, or notes securely (since the entire WebRTC channel is end-to-end encrypted).
