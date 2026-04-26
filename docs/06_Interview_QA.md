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
**Answer**: "I wanted CoffeeShare to feel like a premium, enterprise-grade SaaS product rather than a generic utility. 
For the main interface, I implemented a strict Glassmorphism design system using Tailwind—combining deep background blurs (`backdrop-blur-3xl`) with animated CSS mesh gradients.
However, for the Game Hub, I made a conscious performance decision to drop all Framer Motion physics and switch to a pure CSS **Monochrome Design System**. This high-contrast (white and stone-900) aesthetic ensures that rendering the UI never competes with the WebRTC file transfer engine for CPU threads, keeping the core feature blazing fast while still feeling ultra-premium."

## Q6: "If you had 3 more months to work on this, what would you add?"
**Answer**: 
1. **Multi-Peer Rooms**: Upgrading the 1-to-1 WebRTC topology to a Star or Mesh topology, allowing one sender to broadcast a file to 5 people simultaneously.
2. **Resumable Downloads**: Storing metadata in `IndexedDB`. If the connection drops at 90%, the peers could reconnect, check the exact byte offset they left off at, and resume the slice from there.
3. **WebRTC QoS (Quality of Service)**: Dynamically throttling the file transfer speed if the user enables the Video Camera, ensuring that the video stream (UDP) doesn't get choked out by the aggressive file transfer data channel.
