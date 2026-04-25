# Chapter 2: System Architecture & WebRTC

## 2.1 The Connection Lifecycle (Signaling)
WebRTC requires a "Signaling Server" just to introduce the two peers. Once introduced, the server steps away. In CoffeeShare, we use **Supabase** for signaling.

**The Handshake Process:**
1. **Host Initializes**: The Uploader navigates to the app. A PeerJS instance generates a unique `peerId`.
2. **Channel Creation**: The Uploader creates a Supabase database entry mapping a short 6-digit code (or UUID) to their `peerId`.
3. **Peer Joins**: The Downloader enters the short code. The frontend queries Supabase to fetch the Uploader's `peerId`.
4. **SDP Exchange**: PeerJS uses this ID to exchange Session Description Protocol (SDP) packets (which contain IP addresses and media capabilities).
5. **Direct Connection**: A secure P2P `RTCDataChannel` is established. Supabase is no longer needed.

## 2.2 NAT Traversal (STUN & TURN)
Most devices sit behind a router (NAT - Network Address Translation) and don't know their own public IP address.
- **STUN Server**: A simple echo server. The device asks "What is my public IP?", the STUN server replies. This works for ~80% of consumer networks.
- **TURN Server (Metered.ca)**: If the network has strict corporate firewalls (Symmetric NAT), P2P fails. A TURN server acts as an encrypted cloud relay. The data is still E2E encrypted, but the TURN server bounces the packets between peers. CoffeeShare uses a secure `/api/ice` Next.js route to dynamically fetch authenticated TURN credentials from Metered.ca, ensuring robust connectivity on *any* network.

## 2.3 The Chunking Engine (Data Transfer)
Browsers cannot load a 50GB file into RAM. CoffeeShare utilizes a highly optimized streaming architecture.
1. **File Blob Slicing**: Using the native HTML5 `File.slice()` API, the file is read in small chunks (e.g., 64KB).
2. **ArrayBuffer Transmission**: Chunks are sent sequentially over the `RTCDataChannel` as raw binary `ArrayBuffers`.
3. **Reconstruction**: The Downloader receives chunks. Instead of holding them in RAM, they are streamed directly to the hard drive using the powerful **File System Access API** (if supported) or accumulated into a `Blob` and downloaded via an Object URL fallback.

## 2.4 Reliability Layer
WebRTC Data Channels can drop packets if the buffer overflows.
- CoffeeShare uses `channel.bufferedAmount` to pause reading the file from the disk if the network buffer gets too full.
- It includes a heartbeat mechanism to detect disconnections.
