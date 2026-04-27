# Chapter 5: Advanced Features (Games, Chat & DBMS)

While files transfer, users are placed into a shared interactive lobby with multiplayer games, voice/video chat, a collaborative scratchpad, and a persistent transfer history dashboard.

## 5.1 The Multiplayer Game Architecture

CoffeeShare features **7 fully synchronized multiplayer mini-games** (`src/components/games/`), all rendered in a monochrome design system with zero animation dependencies.

### Design Principles
- **No Animation Libraries**: All games use pure CSS transitions (`transition-colors duration-150`) — zero framer-motion dependency for maximum performance during heavy file transfers.
- **Monochrome Palette**: White/stone color system. Your pieces = `white`, opponent = `stone-500`. Active states use `bg-white/10` glass effect.
- **Ref-Based State**: Critical game logic uses `useRef` to avoid React's stale closure problem in callbacks and timers.

### Game Categories by Latency Strategy

| Strategy | Games | How It Works |
|:---|:---|:---|
| **Turn-Based** | Connect Four, Tic-Tac-Toe, Memory Match | 500ms delay is invisible. State syncs on each move. |
| **Asynchronous Racing** | Typing Race, Reaction Race | Players play locally; only progress/results are transmitted. |
| **Simultaneous Reveal** | Rock-Paper-Scissors | Uses a 3-phase commit: `choice-made` → `reveal` → `result`. |
| **Real-Time Physics** | Coffee Pong | Fixed-timestep engine (60 tps) with client-side prediction. |
| **Collaborative** | Scratchpad | Full text state broadcast on every keystroke. |

### State Synchronization Protocol

```
Player A (sender)                         Player B (receiver)
─────────────────                         ──────────────────
1. User makes move
2. Update LOCAL state (board, turn)
3. sendGameState({game, type, ...})  ───►  4. useEffect([gameState]) fires
                                           5. Filter: gameState.game === 'xyz'
                                           6. Update LOCAL state from payload
```

**Critical Design Decision**: `sendGameState()` only sends over the wire — it does NOT update the sender's own `gameState` prop. This prevents the "double-processing" bug where the sender's game component would re-process its own move as an incoming opponent move.

### RPS Reveal Protocol (Handling React Batching)

Rock-Paper-Scissors uses refs to handle a subtle React 18 batching issue:

```
Problem: If Player A sends both 'choice-made' and 'reveal' synchronously,
React batches the receiver's state updates — 'choice-made' is skipped.
The receiver never sends their own reveal back.

Solution: The 'reveal' handler also calls sendReveal() if not already sent.
Three refs guard the protocol:
  - myChoiceRef: tracks current choice without stale closures
  - peerReadyRef: tracks whether peer has committed
  - revealSentRef: prevents duplicate reveal sends
```

### Typing Race Timer Architecture

```
Problem: useEffect-based countdown with [status, countdown] dependencies
causes re-trigger loops when gameState changes during countdown.

Solution: setInterval stored in a ref (intervalRef). The countdown runs
entirely outside React's render cycle. statusRef prevents stale closures
in the handleInput callback. pickRandomText() guarantees a different
text each round via lastTextRef.
```

## 5.2 GameHub Invite System (`GameHub.tsx`)

The invite flow handles three scenarios:

| Scenario | Behavior |
|:---|:---|
| Player is free | Toast with Join/Decline buttons |
| Player is in a game | Auto-sends `game-busy`, shows "Declined — already in a game" |
| Player manually declines | Sends `game-busy`, inviter sees "Opponent is busy" toast |

Message types: `game-invite`, `game-accept`, `game-busy`

## 5.3 Voice & Video Call Architecture (`VideoChat.tsx`)

The call system operates independently of the DataChannel (file/game/chat) using WebRTC's `MediaStream` API.

### Call State Machine
The component manages a 4-state lifecycle:

```
  idle ──► calling ──► connected
   ▲          │              │
   │          ▼              │
   └── incoming ◄────────────┘
            │                │
            ▼                ▼
         (reject)          endCall()
```

| State | Trigger | UI |
|:---|:---|:---|
| `idle` | Default | FAB dialer button (bottom-right) |
| `calling` | User clicks "Voice Call" or "Video Call" | Pulsing "Calling peer..." animation |
| `incoming` | `peer.on('call', ...)` fires | Ringing panel: Accept (Voice/Video) or Decline |
| `connected` | Remote stream received via `call.on('stream')` | Live video/audio with controls |

### Media Capture & Transport
1. **Capture**: `navigator.mediaDevices.getUserMedia({ video: boolean, audio: true })` — video flag depends on call type.
2. **Initiate**: `peer.call(remotePeerId, localStream)` opens a PeerJS media connection (separate from the DataChannel).
3. **Answer**: `incomingCallRef.current.answer(localStream)` sends the local stream back.
4. **Encryption**: All audio/video is encrypted via **SRTP (Secure Real-time Transport Protocol)**.

### Call Decline Signaling
When the receiver declines:
1. A new PeerJS DataConnection is opened: `peer.connect(callerPeerId)`.
2. A `{ type: 'CALL_DECLINED' }` message is sent over this connection.
3. The caller's `handleConnection` listener receives it and calls `endCall()` + shows a toast.
4. The DataConnection is closed after 500ms.

**Why a separate DataConnection?** The `call.close()` method doesn't provide a "reason" — the caller can't distinguish between "declined" and "network error." The explicit message solves this.

### In-Call Controls
- **Mute**: `localStream.getAudioTracks().forEach(t => t.enabled = !micOn)`
- **Camera Toggle**: `localStream.getVideoTracks().forEach(t => t.enabled = !camOn)`
- **Maximize**: Toggles between floating widget (320px) and full-screen (90vw×90vh)
- **PiP**: Local video shown as a small bordered preview overlaid on remote feed
- **End Call**: Stops all tracks, closes connections, resets refs

### Ref-Based State Pattern
The component uses `callStateRef` (synced via `useEffect`) alongside `callState` to avoid React's stale closure problem in PeerJS event callbacks. Without this, the `handleConnection` callback would see the initial `callState` value instead of the current one.

## 5.4 The Chat Drawer (`ChatDrawer.tsx`)

- Sliding drawer interface for text messaging
- Messages sent via WebRTC DataChannels (same pipe as game state)
- `react-hot-toast` + audio chime notifications when drawer is closed

## 5.5 Live Scratchpad (`Scratchpad.tsx`)

A shared real-time textarea for quick link/password/note sharing. Full text state is broadcast on every keystroke over the encrypted WebRTC channel.

## 5.6 Transfer History Dashboard (`TransferHistory.tsx`)

A persistent DBMS-powered dashboard accessible via a floating Database icon (bottom-left):

**History Tab** — Full CRUD interface:
- Sortable columns (click to toggle ASC/DESC)
- Filterable by transfer status (All / Pending / Active / Completed / Failed)
- Inline DELETE per record
- File type and duration display

**Analytics Tab** — Aggregate queries visualized:
- Overview cards: COUNT(*), SUM(fileSize), COUNT(rooms)
- Duration stats: AVG, MIN, MAX of completed transfer durations
- Status breakdown: GROUP BY status with horizontal bar chart
- Top file types: GROUP BY fileType with SUM(fileSize)

See [Chapter 7: DBMS Architecture](./07_DBMS_Architecture.md) for the full schema and SQL equivalents.
<!-- . -->
<!-- . -->
<!-- . -->
<!-- . -->
