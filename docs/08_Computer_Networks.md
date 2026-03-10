# Chapter 8: Computer Networks (CN) Deep Dive

CoffeeShare is fundamentally an application that manipulates low-level networking protocols. This document analyzes the application through the lens of Computer Networks, specifically looking at the OSI Model, Transport Layer protocols, and Network Address Translation (NAT).

## 8.1 The Transport Layer: TCP vs. UDP

The internet primarily relies on two Transport Layer (Layer 4) protocols: TCP and UDP.

*   **TCP (Transmission Control Protocol)**: Used by HTTP/HTTPS. It guarantees delivery and order (Reliability). If a packet drops, TCP pauses everything and requests the missing packet. This causes "Head-of-line blocking."
*   **UDP (User Datagram Protocol)**: Used by live streaming and gaming. It just fires packets blindly. It is blazingly fast but offers zero guarantees that packets will arrive or be in order.

**WebRTC's Transport Protocol**: 
WebRTC is built entirely on top of **UDP**. 
Why? Because for real-time video/voice (like our `VideoChat.tsx`), waiting for a dropped TCP packet from 2 seconds ago is useless—the conversation has already moved on. UDP allows the video feed to stay real-time, even if it drops a frame here and there.

## 8.2 SCTP: Bringing TCP-like Reliability to UDP

If WebRTC is built on UDP, how do we reliably send a 50GB file without it getting corrupted by dropped packets?

WebRTC introduces **SCTP (Stream Control Transmission Protocol)** layered *on top* of UDP. 
When we open the CoffeeShare `RTCDataChannel`, we configure it to be `reliable: true`. 
*   The browser's SCTP stack takes our 64KB file chunks and assigns sequence numbers to them.
*   It fires them over the ultra-fast UDP network.
*   If the receiver's SCTP stack notices a missing sequence number, it sends a negative acknowledgment (NACK) back to the sender to re-transmit *only* that missing chunk, without blocking the rest of the stream (avoiding TCP's head-of-line blocking).
*   *Result*: We get the blazing speed of UDP combined with the perfect data integrity of TCP.

## 8.3 Security: DTLS & SRTP

In the modern web, all traffic must be encrypted. Over TCP, we use TLS (Transport Layer Security - what makes HTTPS work). But since WebRTC uses UDP, TLS won't work (TLS requires reliable packet delivery to perform its cryptographic handshake).

*   **DTLS (Datagram Transport Layer Security)**: CoffeeShare uses DTLS to secure the Data Channel. DTLS is specifically designed to perform secure key exchanges over unreliable UDP networks. 
*   **SRTP (Secure Real-Time Transport Protocol)**: Used to encrypt the Video and Voice streams.
*   Because DTLS keys are generated directly by the two browsers and exchanged via the SDP (Session Description Protocol), the encryption is strictly **End-to-End (E2EE)**. Even if Metered.ca (our TURN server) captures the packets, they are mathematically unable to decrypt the file chunks.

## 8.4 Network Address Translation (NAT) Topologies

IPv4 addresses ran out years ago. To fix this, NAT was invented. A router takes one Public IP (e.g., `203.0.113.1`) and gives all internal devices fake private IPs (e.g., `192.168.1.x`). 
This breaks P2P, because devices don't know their real public addresses.

There are 4 types of NAT, and CoffeeShare must traverse all of them:

1.  **Full Cone NAT**: Very open. Once an internal device opens a port, *anyone* on the internet can send traffic to it. (Easy for WebRTC).
2.  **Restricted Cone NAT**: Only external IPs that the internal device has previously sent packets to can reply.
3.  **Port-Restricted Cone NAT**: Similar to Restricted, but it also validates the specific Port number. 
    *   **The STUN Solution**: For NAT types 1-3, CoffeeShare uses a **STUN Server**. The browser sends a UDP packet to Google's STUN server. Google replies: *"Your Public IP is X, and NAT mapped you to Port Y."* The browser then shares X and Y with the peer, and they perform "UDP Hole Punching" to connect directly.

4.  **Symmetric NAT**: The hardest firewall. Found in corporate networks, universities, and strict 5G cellular towers. The router creates a *completely different, randomized Public Port* for every single external server the device talks to. STUN is completely useless here, because the port Google's STUN server sees will be different from the port the peer sees.
    *   **The TURN Solution**: CoffeeShare intercepts this failure and falls back to our **Metered.ca TURN server**. The TURN server has a static, public IP. Both peers connect to the TURN server, and the TURN server simply relays the encrypted UDP packets between them. This guarantees connectivity.
