# Chapter 1: Project Overview

## 1.1 What is CoffeeShare?
CoffeeShare is a production-grade, highly optimized Peer-to-Peer (P2P) file sharing application. It enables users to transfer files of **infinite size** directly from their browser to another device, entirely bypassing third-party servers.

It embraces a pure serverless ideology: 
1. **Zero Data Retention**: Files never touch a central server.
2. **Infinite Scale**: Because servers aren't processing the file blobs, there are no bandwidth choke points.
3. **End-to-End Encryption**: Data channels are encrypted by default via WebRTC standards.

## 1.2 Technology Stack
The application is built on a modern, high-performance web stack:
- **Frontend Framework**: Next.js 14 (App Router) + React 18
- **Language**: TypeScript for strict type-safety and robust refactoring.
- **Styling**: Tailwind CSS combined with Framer Motion for high-end "Apple-like" fluid animations and Glassmorphism.
- **P2P Networking**: WebRTC (via PeerJS) for Data, Audio, and Video channels.
- **Signaling Server**: Supabase (PostgreSQL Realtime) for exchanging WebRTC SDP (Session Description Protocol) tokens.
- **NAT Traversal**: Metered.ca TURN/STUN servers to pierce strict firewalls and corporate networks.

## 1.3 Why WebRTC?
WebRTC (Web Real-Time Communication) is an open framework that enables Real-Time Communications in the browser via simple APIs. For CoffeeShare, WebRTC provides three crucial APIs:
- `RTCDataChannel`: Used to send file chunks, game states, and text chat.
- `RTCPeerConnection`: Handles the complex network traversal (ICE, STUN, TURN) to connect two NAT-hidden devices.
- `MediaStream`: Used to capture and transmit the webcam/microphone for the integrated Voice & Video calling feature.

## 1.4 The "Coffee" Philosophy
The brand implies a quick, temporary interaction. "Grabbing a coffee." You open the app, generate a room, share the file quickly, play a mini-game, and then the room closes forever. No accounts, no subscriptions, no traces left behind.
