# Chapter 2: WebRTC & Signaling Deep Dive

## 2.1 The Supabase Signaling Layer
WebRTC cannot connect two peers without them first discovering each other's IP addresses and media capabilities. This initial introduction is called "Signaling".

In CoffeeShare, we use **Supabase (PostgreSQL Realtime)**.
*   **`useUploaderChannel.ts`**: When a user drops a file, we generate a random 6-character room code (e.g., `A4X9B2`) and save it to the `channels` table in Supabase, along with their `PeerJS` ID.
*   **`useDownloader.ts`**: The receiver enters `A4X9B2`, queries Supabase, retrieves the Uploader's `PeerJS` ID, and initiates the WebRTC handshake.
*   Once connected, Supabase is entirely out of the loop.

## 2.2 NAT Traversal: ICE, STUN, and TURN
Most internet users sit behind a NAT (Network Address Translation) router, meaning their devices have local IPs (like `192.168.1.5`) rather than public IPs.

1.  **Direct Connection Attempt**: WebRTC tries to connect locally.
2.  **STUN Fallback**: If not on the same network, the browser pings a STUN server (like Google's public STUN). The server replies with the router's public IP. The browser then attempts "UDP Hole Punching".
3.  **TURN Fallback (`Metered.ca`)**: If the router uses Symmetric NAT (common in schools and corporations), UDP hole punching fails. The connection routes through a TURN server.
    *   **Implementation**: Look at `src/app/api/ice/route.ts`. Because TURN servers cost money, they require authentication. Our Next.js backend securely fetches time-limited credentials from Metered.ca using our secret API key (`METERED_TURN_API_KEY`) and passes them securely to the frontend `PeerJS` configuration.

## 2.3 The `PeerJS` Wrapper
CoffeeShare abstracts WebRTC complexities via `PeerJS`.
*   **`WebRTCProvider.tsx`**: A React Context provider that initializes the `Peer` instance and fetches the ICE servers from our API route on mount.
*   **Data Channels (`peer.connect`)**: Used for files, chat, and game state.
*   **Media Channels (`peer.call`)**: Used specifically for the VideoChat component.

## 2.4 The Custom Decline Protocol
WebRTC doesn't have a native "Ringing / Decline" event bus. 
*   In `VideoChat.tsx`, when a peer receives a call, they don't immediately answer. They show an "Incoming Call" modal.
*   If they hit **Decline**, they open a quick `peer.connect()` data channel, send `{ type: 'CALL_DECLINED' }`, and instantly close it. The caller's `on('data')` listener intercepts this and terminates the "Calling..." UI with a toast notification.
