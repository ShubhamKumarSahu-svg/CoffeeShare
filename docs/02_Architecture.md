# Chapter 2: WebRTC & Networking Deep Dive

To understand how CoffeeShare operates, you must understand the exact mechanics of establishing a Peer-to-Peer connection across the internet. This chapter breaks down the exact WebRTC lifecycle, from initial signaling to securing the `RTCDataChannel`.

## 2.1 The Connection Lifecycle: Signaling (Offer, Answer, ICE)

WebRTC is purely peer-to-peer, but two computers cannot connect without knowing each other's public IP address, ports, and supported media/data codecs. They need a "Signaling Server" just to pass notes to each other to initiate the connection. In CoffeeShare, we use a **Redis / In-Memory Channel Repository** (`src/channel.ts`) as the signaling backend, with Next.js API routes as the signaling server.

Here is the exact step-by-step lifecycle of a CoffeeShare connection:

1. **Uploader Initialization (The Host)**:
   - The Uploader opens the app. Our `WebRTCProvider` initializes a new `PeerJS` instance.
   - The browser reaches out to the PeerJS signaling server to generate a unique UUID (the `peerId`).
   - The Uploader creates a random 6-character room code (e.g., `A4X9B2`) via the `POST /api/create` route. The backend saves this mapping to Redis (production) or an in-memory Map (development), with a configurable TTL.
   - Simultaneously, the room is persisted to the **Prisma/SQLite database** for transfer history tracking.

2. **Downloader Initialization (The Client)**:
   - The receiver enters the short code `A4X9B2`.
   - The frontend queries Supabase and retrieves the Uploader's `peerId`.

3. **The WebRTC Handshake (SDP Exchange)**:
   - **The Offer**: The Downloader's browser creates an `RTCPeerConnection`. It generates a Session Description Protocol (SDP) "Offer". This SDP contains the Downloader's encryption keys, supported codecs, and network configuration.
   - **The Answer**: The Offer is passed through the signaling server to the Uploader. The Uploader processes the Offer, configures its own `RTCPeerConnection`, and replies with an SDP "Answer".
   - *Result*: Both browsers now agree on the cryptographic parameters and how the data will be formatted.

4. **ICE Candidate Gathering (Finding the Route)**:
   - While the SDP is exchanged, both browsers begin gathering ICE (Interactive Connectivity Establishment) candidates. 
   - An ICE candidate is essentially a potential "route" for data to travel (e.g., Local Network IP, Public Router IP, or TURN Relay IP).
   - These candidates are continuously swapped between the peers until a working route is found. Once found, the WebRTC tunnel is open. Supabase is no longer needed.

## 2.2 Penetrating Firewalls: STUN & TURN (`Metered.ca`)

Most devices sit behind a NAT (Network Address Translation) router. The router gives your device a fake local IP (`192.168.1.5`) and hides it behind a public IP. This makes direct P2P connections mathematically impossible without external help.

1. **STUN (Session Traversal Utilities for NAT)**:
   - If the NAT is simple (Full Cone or Restricted Cone), the browser pings a STUN server (like Google's `stun.l.google.com:19302`). 
   - The STUN server acts as a mirror, replying: *"Your public IP is 203.0.113.5 and port is 45000"*. 
   - The browsers exchange this public IP and perform **UDP Hole Punching** to establish a direct connection.

2. **TURN (Traversal Using Relays around NAT)**:
   - If the user is on a corporate, university, or strict cellular network, they are likely behind a **Symmetric NAT**. UDP Hole Punching is actively blocked by the router's firewall. 
   - In this scenario, WebRTC falls back to a TURN server.
   - **CoffeeShare's Implementation**: We use enterprise-grade TURN servers from `Metered.ca`. However, TURN servers are expensive (they act as a cloud relay where 100% of the encrypted traffic flows through them). You cannot expose your `Metered.ca` API key on the frontend.
   - To solve this, CoffeeShare has a highly secure Next.js backend API route (`src/app/api/ice/route.ts`). When the frontend mounts, it makes a POST request to this route. The backend securely uses the `METERED_TURN_API_KEY` to dynamically generate authenticated, time-limited TURN credentials, passing them safely back to the client's `RTCPeerConnection` configuration.

## 2.3 The WebRTC Data Channel (`RTCDataChannel`)

Once the tunnel is built, how is data actually shared?

- **The Pipe**: CoffeeShare opens an `RTCDataChannel`. This is a native browser API that acts exactly like a WebSocket, but it is peer-to-peer.
- **Protocol**: By default, WebRTC Data Channels use **SCTP (Stream Control Transmission Protocol)** over **DTLS (Datagram Transport Layer Security)**.
- **Security**: Because it relies on DTLS, **100% of the data transferred through CoffeeShare is End-to-End Encrypted (E2EE) by default**. Not even the TURN server, ISP, or router can decrypt the file blobs.
- **Reliability**: We configure the data channel to be `reliable: true` and `ordered: true`. This ensures that file chunks arrive in the exact order they were sent, and if a packet drops, SCTP automatically requests a re-transmission, guaranteeing file integrity.

In the next chapter, we will explore exactly what is pushed through this encrypted pipe and how we manage memory during a 50GB file transfer.
