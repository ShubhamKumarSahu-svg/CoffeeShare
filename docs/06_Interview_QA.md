# Chapter 6: Interview Preparation & Deep Technical Analysis

This document is the ultimate cheat sheet for a technical interview regarding CoffeeShare. It provides articulate, senior-level responses to architectural questions.

## Q1: "Explain the architecture of your application. Why didn't you just use an S3 bucket?"
**Answer**: "CoffeeShare was built to solve the privacy and bottleneck issues of centralized storage. If I used S3, the user would have to upload the file to AWS (Upload Bandwidth), wait, and then the receiver would download it (Download Bandwidth). Furthermore, it requires storing user data on a third-party server, raising privacy concerns and incurring massive AWS egress costs for me.

Instead, I built a pure Serverless WebRTC architecture. I only use a fast Key-Value store (Redis or In-Memory Maps) for the initial 5-second signaling handshake to exchange SDP tokens. Once connected, a secure, end-to-end encrypted tunnel opens directly between the two browsers. The file streams directly from Device A to Device B. Zero storage costs, zero privacy risks, and infinite scalability."

## Q2: "How did you handle NAT Traversal and firewalls?"
**Answer**: "WebRTC relies on the ICE protocol. Most consumer networks work fine with a simple STUN server (which just echoes back the user's public IP for UDP hole punching). However, for corporate networks with Symmetric NATs, hole punching fails. 

To solve this, I integrated a TURN server relay via Metered.ca. Because TURN bandwidth costs money, I couldn't expose the API key on the frontend. I built a Next.js serverless route (`/api/ice`) that securely communicates with Metered's API to generate time-limited, authenticated TURN credentials and serves them dynamically to the frontend `PeerJS` instance on mount. This ensures a 99.9% connection success rate on any network."

## Q3: "How do you transfer a 50GB file in a browser without it crashing?"
**Answer**: "A browser will instantly hit an Out-Of-Memory (OOM) exception if you try to load 50GB into RAM. I solved this by treating the file as a stream rather than a static Blob.

On the sender side, I use the native HTML5 `File` object as a pointer to the disk. I slice it into small 64KB ArrayBuffer chunks and transmit them sequentially. I also monitor the WebRTC Data Channel's `bufferedAmount` to create network backpressure—if the buffer hits 1MB, I pause reading from the disk until it drains.

On the receiver side, I leverage the modern `FileSystem Access API`. I prompt the user for a save location, open a `FileSystemWritableFileStream`, and instantly `.write()` each 64KB chunk directly to their hard drive as it arrives over the network. This keeps RAM usage practically flat at zero, allowing infinite file size transfers."

## Q4: "You have multiplayer games and video chat. How do you deal with latency when a massive file transfer is saturating the user's bandwidth?"
**Answer**: "You can't magically create more bandwidth, so I designed the UX to be latency-immune. I intentionally chose asynchronous or turn-based games (like Memory Match, Tic-Tac-Toe, or Typing Race) instead of real-time physics games (like Pong). In a turn-based game, a 500ms lag spike doesn't ruin the experience. Furthermore, because all game state and chat messages are sent over the exact same WebRTC Data Channel as the file chunks, I didn't have to manage separate WebSocket connections or incur any extra server latency. It's completely decentralized."

## Q5: "Walk me through your UI/UX philosophy for this project."
**Answer**: "I designed CoffeeShare using a custom **Bauhaus-inspired design system** — inspired by the 1920s German art school that championed 'Form follows Function.' The entire UI is built around three primary colors (Red, Blue, Yellow) on a light background, with thick 4px borders and hard, geometric shadows instead of soft blurs or glassmorphism.

The key design decisions were:
1. **Solid containers over transparency**: Every panel is opaque white with crisp black borders. No backdrop-blur, no transparency. This ensures maximum readability and a distinctive, industrial aesthetic.
2. **Mechanical hover physics**: Buttons lift on hover and press flat on click by manipulating `translateY` and `box-shadow` — simulating physical button presses.
3. **Custom SVG branding**: The logo is a geometric coffee cup built from three Bauhaus primitives (red square, yellow circle, blue triangle). The download spinner is a full 3D SVG cup that fills with blue 'liquid' in real-time based on transfer progress.
4. **Performance-conscious animation**: Framer Motion is restricted to the landing page only. All in-app interactions use pure CSS transitions to avoid CPU competition with the WebRTC transfer engine.

The result is a UI that is instantly recognizable, highly readable, and performant under heavy data transfer load."

## Q6: "Explain your End-to-End Encryption architecture in detail."
**Answer**: "CoffeeShare implements **dual-layer E2EE**:

**Layer 1 — Transport (DTLS)**: WebRTC encrypts all data channel traffic using DTLS by default. The two browsers perform a Diffie-Hellman key exchange during the SDP handshake, so even the signaling server cannot decrypt the traffic.

**Layer 2 — Application (AES-256-GCM)**: On top of DTLS, I added application-layer encryption using the browser's native Web Crypto API. When the Uploader starts sharing, I generate a random 256-bit AES-GCM key via `crypto.subtle.generateKey()`. Each 64KB file chunk is encrypted with a unique 12-byte IV (Initialization Vector) before entering the WebRTC pipe.

**Key Distribution**: The decryption key is embedded in the share URL as a **hash fragment** (`#key=<base64url>`). This is the critical security property — browsers strip the hash fragment from HTTP requests, so the key **never touches the server**. The Downloader reads it client-side from `window.location.hash`, imports it back into a CryptoKey, and decrypts each chunk as it arrives.

This means even if a TURN relay is used (where encrypted traffic passes through a third-party server), the data is double-encrypted — DTLS plus AES-256-GCM — making it mathematically impossible for anyone except the two peers to read the file."

## Q7: "How does the share URL system work?"
**Answer**: "When the Uploader starts, PeerJS assigns a UUID-based peer ID. I encode this into a URL-safe Base64 string (replacing `+` with `-`, `/` with `_`, stripping `=` padding) and use it as the URL path slug: `/download/<base64url-encoded-peerId>`. 

The AES-256-GCM decryption key is appended as a hash fragment: `#key=<base64url-key>`. On the download page, the frontend decodes the slug back to the original peer ID using `atob()` with character reversal, extracts the key from the hash, and establishes the WebRTC connection. The server only ever sees the slug — never the peer ID in plaintext and never the encryption key."

## Q8: "How does the voice/video call system work alongside file transfers?"
**Answer**: "The call system uses WebRTC's `MediaStream` API separately from the DataChannel. When a user clicks 'Voice Call' or 'Video Call', the app calls `navigator.mediaDevices.getUserMedia()` to capture the local audio/video stream. Then it uses PeerJS's `peer.call(remotePeerId, stream)` to open a separate media connection.

The call lifecycle is managed through a state machine with four states: `idle`, `calling`, `incoming`, and `connected`. Incoming calls trigger a dedicated UI panel with three options — Accept as Voice, Accept as Video, or Decline. Call decline signaling is handled reliably by opening a temporary PeerJS DataConnection to send a `CALL_DECLINED` message, ensuring the caller always gets feedback even if the media connection is rejected.

The audio/video streams are encrypted via SRTP (Secure Real-time Transport Protocol), which is the media equivalent of DTLS. This means voice and video calls are also fully End-to-End Encrypted."

## Q9: "If you had 3 more months to work on this, what would you add?"
**Answer**: 
1. **Multi-Peer Rooms**: Upgrading the 1-to-1 WebRTC topology to a Star or Mesh topology, allowing one sender to broadcast a file to 5 people simultaneously.
2. **Resumable Downloads**: Storing metadata in `IndexedDB`. If the connection drops at 90%, the peers could reconnect, check the exact byte offset they left off at, and resume the slice from there.
3. **WebRTC QoS (Quality of Service)**: Dynamically throttling the file transfer speed if the user enables the Video Camera, ensuring that the video stream (UDP) doesn't get choked out by the aggressive file transfer data channel.
4. **Progressive Web App (PWA)**: Adding a service worker and manifest for offline-capable access and "Install to Home Screen" functionality.
<!-- . -->
<!-- . -->
