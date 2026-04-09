# ☕ CoffeeShare

> **High-Performance Peer-to-Peer File Sharing & Live Media Sync for the Modern Web**

CoffeeShare is a lightning-fast, highly secure, and beautifully designed file-sharing application that utilizes WebRTC to send files directly from one browser to another. By eliminating the need for intermediate storage servers, CoffeeShare offers infinite file size limits, robust end-to-end encryption, and unparalleled privacy.

Whether you're sharing a quick PDF, syncing a massive project directory, or streaming live media across the globe, CoffeeShare handles it directly, securely, and seamlessly.

---

## ✨ Comprehensive Feature Set

### 🚀 Core Architecture
- **True Peer-to-Peer (P2P)**: Files are transferred directly between the sender and receiver using WebRTC. Your data never touches a centralized server, ensuring absolute privacy.
- **Infinite File Limits**: Since no server storage is required, you are only limited by your local machine's capabilities. Effortlessly transfer 5GB, 10GB, or even larger files.
- **End-to-End Encryption**: Every transfer is automatically secured using WebRTC's Datagram Transport Layer Security (DTLS) protocol.
- **Streaming Downloads**: Powered by advanced Service Workers (`sw.js`) and the Web Streams API. Large files stream directly to the recipient's disk instead of bloating the browser's RAM, preventing crashes on massive transfers.

### 📁 Advanced Functionality
- **Live Folder Sync (Wormhole)**: Don't just share individual files—drag and drop entire directories. CoffeeShare will recursively parse and sync the entire folder structure to the receiver.
- **Live Media Streaming**: Send a video or audio file and allow the receiver to stream and preview it dynamically in real-time as it transfers.
- **Multi-File Batching**: Upload multiple disparate files at once; the recipient receives them cleanly packaged.
- **Secure Password Protection**: For highly sensitive transfers, add an optional cryptographically verified password that the receiver must input before the connection can be established.
- **QR Code Connectivity**: Easily bridge the gap between desktop and mobile. Instantly share your unique download URL via dynamically generated QR codes.

### 🎨 Premium UI & User Experience
- **Dark Mode & Glassmorphism**: Designed with a sleek, premium, dark-native aesthetic utilizing modern glassmorphism transparency, vivid accent colors, and custom typography.
- **Framer Motion Micro-Animations**: Fluid transitions, hover effects, and spring animations provide an interactive and deeply satisfying user experience.
- **Real-Time Telemetry**: Monitor your network performance with live transfer speeds (MB/s), percentage tracking, and detailed progress bars.
- **Interactive Mini-games (CoffeePong)**: Transferring a massive file? Keep yourself entertained by playing a fully synchronized game of multiplayer Ping-Pong directly against the person you're sharing the file with while you wait!
- **P2P Chat**: A built-in real-time chat drawer allows the sender and receiver to communicate directly over the WebRTC data channel.

---

## 🛠 Technology Stack

CoffeeShare is built on the bleeding edge of modern web development:

| Technology | Purpose |
|---|---|
| **Next.js 15 (App Router)** | Full-stack React framework providing a robust architectural backbone. |
| **React 19** | Modern UI component rendering and concurrent features. |
| **Tailwind CSS v4** | Utility-first styling engine, heavily customized for our glassmorphism design system. |
| **TypeScript** | Strict type safety, ensuring robust and error-free code at scale. |
| **PeerJS / WebRTC** | Abstraction layer over raw WebRTC, handling ICE negotiations and data channels. |
| **Framer Motion** | Physics-based animation library driving all UI transitions and micro-interactions. |
| **Service Workers** | Background scripts intercepting network requests to enable infinite streaming downloads. |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0 or higher
- npm, pnpm, or yarn

### Installation & Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ShubhamKumarSahu-svg/CoffeeShare.git
   cd coffeeshare
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to `http://localhost:3000` to start sharing!

### Building for Production

To create an optimized production build:
```bash
npm run build
npm start
```

---

## ⚙️ Configuration & Environment Variables

CoffeeShare works perfectly out-of-the-box, but can be configured for custom deployments:

| Variable | Description | Default |
|---|---|---|
| `REDIS_URL` | Redis connection string for persistent channel metadata (Optional) | In-memory fallback |
| `COTURN_ENABLED` | Enable custom TURN server support for strict NAT traversal | `false` |
| `TURN_HOST` | Custom TURN server hostname | `127.0.0.1` |
| `TURN_REALM` | Custom TURN credential realm | `file.pizza` |
| `STUN_SERVER` | Custom STUN server URL for peer discovery | `stun:stun.l.google.com:19302` |

---

## ❓ Frequently Asked Questions

**How does CoffeeShare achieve infinite file sizes?**
Because CoffeeShare uses a P2P data channel, the file is never fully loaded into a server's memory or database. We utilize the Web Streams API combined with a Service Worker to read the file in small chunks from the sender's disk, send it over the network, and immediately write it to the receiver's disk.

**What happens if I close my browser tab during a transfer?**
Since the connection is directly between your browser and the recipient's browser, closing the tab will immediately sever the WebRTC connection and halt the transfer. You must keep the tab open until the transfer reaches 100%.

**Can multiple people download my file at the same time?**
Yes! WebRTC supports a mesh topology. You can share your unique URL with multiple people, and your browser will initiate separate P2P connections to stream the file to all of them simultaneously (bounded by your local upload bandwidth).

**Why does my connection sometimes fail?**
While STUN servers successfully connect peers ~86% of the time, highly restrictive corporate or school firewalls (Symmetric NATs) may block direct P2P connections. In these rare edge cases, a TURN server (relay server) is required.

---

## 👨‍💻 Core Team & Contributors

- **ShubhamKumarSahu-svg** - Full-Stack Lead
- **Adiii-0909** - Frontend Developer
- **Chahat Kumar** - Backend/WebRTC Developer
- **Divyansh9369** - UI/UX Designer
- **KUSHALKHATRI4691** - QA Engineer

---

## 📄 License

This project is licensed under the [BSD 3-Clause License](LICENSE).

---

<div align="center">
  <b>Share files instantly. Share files securely.</b><br>
  <i>Enjoy your CoffeeShare. ☕</i>
</div>
