# Chapter 3: Interactive Features (Games & Calls)

While waiting for large files to transfer, CoffeeShare provides an interactive lobby. Because we already have an active WebRTC Data Channel, adding multiplayer features incurs **zero server cost** and operates with near-zero latency.

## 3.1 Real-Time Multiplayer Games
CoffeeShare features several built-in mini-games to keep users engaged.

**State Synchronization Pattern:**
1. **Local State**: When Player A makes a move (e.g., clicking a Tic-Tac-Toe cell), the local React state updates immediately.
2. **Network Broadcast**: The move data is serialized into JSON (`{ type: 'GAME_MOVE', payload: ... }`) and sent over the Data Channel.
3. **Remote Application**: Player B's browser receives the packet, deserializes it, and applies it to their React state.

**Latency-Immune Design**:
We replaced latency-sensitive games (like Pong) with turn-based or asynchronous games (Memory Match, Tic-Tac-Toe, Rock-Paper-Scissors) to ensure a flawless experience even if the file transfer is saturating the bandwidth.

## 3.2 Live Video & Voice Calling
CoffeeShare integrates a fully functional, premium Video/Voice call system.

**Implementation Details:**
- **MediaStream API**: `navigator.mediaDevices.getUserMedia()` prompts the user for camera and microphone permissions.
- **PeerJS Call Routing**: Instead of `.connect()` (for data), we use `peer.call(remotePeerId, localStream)`.
- **Custom Signaling**: To achieve a native "Incoming Call..." UI instead of an abrupt auto-answer, we implemented a custom `CALL_DECLINED` control protocol over the Data Channel. If a user hits decline, it instantly notifies the caller to stop ringing and reset their UI.
- **UI Architecture**: Features a floating Draggable PiP (Picture-in-Picture) window, Glassmorphism controls, and z-index isolation to ensure controls are never hidden by the video feed.
