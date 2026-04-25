# Chapter 5: Interview Preparation & Deep Analysis

This document outlines potential technical interview questions and comprehensive answers based specifically on the architecture of CoffeeShare.

## Q1: How did you handle NAT traversal for Peer-to-Peer connections in CoffeeShare?
**Answer**: WebRTC inherently struggles with strict firewalls (like Symmetric NATs found in corporate environments). To solve this, I implemented an ICE (Interactive Connectivity Establishment) framework. 
1. The app first attempts a direct connection.
2. If it fails, it queries a public STUN server (like Google's) to discover its public IP.
3. If the network is still too restrictive, it falls back to a TURN server (Metered.ca). I built a secure Next.js API route (`/api/ice`) that generates authenticated, time-limited TURN credentials on the fly, ensuring we don't expose our API keys to the client while guaranteeing a 99.9% connection success rate.

## Q2: How do you transfer a 10GB file without crashing the browser's memory?
**Answer**: Browsers will crash if you try to load a 10GB Blob into RAM. I solved this using a chunked streaming architecture.
- On the sender side, I use the `File.slice()` API to read the file in small 64KB chunks and send them over the `RTCDataChannel`.
- On the receiver side, I utilize the modern HTML5 **File System Access API**. Instead of storing the chunks in an ArrayBuffer in memory, I open a `FileSystemWritableFileStream` directly to the user's hard drive and `.write()` each chunk as it arrives. This keeps RAM usage practically at zero regardless of the file size.
- To prevent buffer overflow on the network layer, I actively monitor `channel.bufferedAmount` and pause the file reader if it exceeds a threshold (e.g., 1MB), creating a robust backpressure mechanism.

## Q3: You have multiplayer games and video chat running simultaneously with a massive file transfer. How do you prevent latency?
**Answer**: I designed the system to be latency-immune rather than fighting bandwidth starvation. 
- For the games, I replaced real-time physics games (like Pong) with asynchronous, turn-based games (Memory Match, Tic-Tac-Toe, Typing Race). Because state updates only happen intermittently, they require negligible bandwidth and aren't affected by a 500ms ping spike caused by the file transfer.
- The state updates are sent as lightweight JSON strings over the exact same WebRTC Data Channel used for the files, meaning I didn't have to manage multiple connections or WebSockets.

## Q4: Can you explain the UI/UX decisions behind the landing page?
**Answer**: I wanted the application to feel like a premium, enterprise-grade product. 
- I implemented a "Glassmorphism" design system using Tailwind CSS (`backdrop-blur-md`, subtle translucent borders, and inner shadows).
- I used Framer Motion for physics-based spring animations to give interactions weight and tactile feedback.
- I structured the layout logically based on the "F-pattern" reading flow: striking typography and features on the left, and the primary interactive element (the DropZone) on the right, surrounded by an ambient, animated mesh gradient background to create depth.

## Q5: How do you handle a declined video call gracefully?
**Answer**: Initially, WebRTC `close` events can be unreliable or delayed when dropping connections. To provide instant feedback, I implemented a custom signaling protocol over our existing data connection. When the receiver clicks "Decline", the client instantly opens a quick connection to the caller, transmits a `CALL_DECLINED` JSON payload, and then shuts down. The caller's component listens for this specific payload, immediately kills the local camera/mic stream, resets the UI state, and fires a React Hot Toast notification. This results in a snappy, native-feeling user experience.
