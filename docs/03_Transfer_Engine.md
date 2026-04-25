# Chapter 3: The Data Transfer Engine & Memory Architecture

Sending a 2MB image is easy. Sending a 50GB 4K Video file through a browser tab without crashing it requires complex memory management and chunking algorithms. This chapter breaks down exactly how data is serialized, shared, and reconstructed over the WebRTC Data Channel.

## 3.1 The "Out of Memory" Problem
JavaScript runs in a single-threaded environment with strict memory limitations (often capping out around 2GB-4GB per tab). If CoffeeShare tried to read a 10GB `.mp4` file using `FileReader.readAsArrayBuffer()`, the entire file would be loaded into RAM, and the browser tab would instantly crash with an Out-of-Memory (OOM) exception.

To solve this, CoffeeShare utilizes a **Chunked Streaming Architecture**.

## 3.2 The Uploader: Streaming from Disk
The Uploader (Sender) never loads the file into memory.

1. **The HTML5 `File` Object**: When a user selects a file, the browser creates a `File` object. This is NOT the file itself; it is merely a lightweight pointer to the file's location on the physical hard drive.
2. **Chunking via `File.slice()`**: Instead of reading the whole file, we use `file.slice(offset, offset + chunkSize)`. We typically set `chunkSize` to 64KB or 256KB. We read only this tiny sliver of the file into an `ArrayBuffer`.
3. **Transmission**: The `ArrayBuffer` chunk is pushed into the `RTCDataChannel`.
4. **Offset Increment**: We update the `offset` state by `chunkSize` and loop back to step 2 until the entire file is sent.

### Network Backpressure Management
WebRTC Data Channels have an internal buffer. If the user's hard drive reads the file faster than their WiFi can upload it, the internal WebRTC buffer will swell. If it hits 16MB, the channel will crash.
*   **The Solution**: CoffeeShare aggressively monitors the `channel.bufferedAmount` property.
*   If `bufferedAmount` exceeds a safe threshold (e.g., 1MB), we **pause** the file slicing loop. We wait for the buffer to drain, and only then do we resume reading from the disk. This creates a perfect equilibrium between disk-read speed and network-upload speed.

## 3.3 The Downloader: Reconstructing the Stream
The receiver faces the exact same memory problem. If they receive 10GB of chunks and push them all into a JavaScript `Array` in RAM, their browser will crash before the download finishes.

CoffeeShare dynamically chooses between two reconstruction strategies depending on the user's browser capabilities.

### Strategy A: File System Access API (The Modern, Zero-RAM Approach)
If the user is on a modern Chromium browser (Chrome, Edge, Opera), CoffeeShare uses the cutting-edge File System Access API.
1. Before the download starts, the browser prompts the user: *"Where do you want to save this file?"*
2. The user selects a folder, and the browser grants CoffeeShare a `FileSystemWritableFileStream`.
3. As the Uploader sends the 64KB chunks over WebRTC, the Downloader's `useDownloader.ts` hook receives them.
4. **Instantly**, the chunk is written to the hard drive via `stream.write(chunk)`.
5. The chunk is then garbage-collected from RAM. 
*Result*: Memory usage remains perfectly flat at ~5MB, allowing infinite file size transfers.

### Strategy B: The Blob Fallback (The Legacy Approach)
If the user is on Safari or Firefox (which have restricted the File System API for security reasons), CoffeeShare falls back to the Blob method.
1. As 64KB chunks arrive, they are pushed into a JavaScript Array in memory.
2. Once the final chunk arrives, the Array is concatenated into a massive binary object: `new Blob(chunks)`.
3. An Object URL is created (`URL.createObjectURL(blob)`), and an invisible `<a>` tag is clicked programmatically to trigger the browser's native download manager.
*Limitation*: This restricts the maximum file size to the amount of available RAM on the receiver's device.

## 3.4 Data Serialization (Multiplexing)
Because CoffeeShare sends multiple things over the exact same WebRTC Data Channel (Files, Chat Messages, and Game State), the receiver needs to know what to do with incoming packets.

*   **JSON Payloads**: If a user sends a chat message or plays a move in Tic-Tac-Toe, the data is serialized into a JSON string (e.g., `{"type": "CHAT", "payload": "Hello!"}`). The receiver parses this and updates the React State.
*   **Binary Payloads**: If the incoming packet is an `ArrayBuffer`, the receiver knows it is a piece of the file being transferred, and routes it directly to the File System stream. 

This efficient multiplexing ensures that chat and games can run smoothly and simultaneously without corrupting the file transfer stream.
