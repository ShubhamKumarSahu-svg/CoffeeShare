# Chapter 3: The Transfer Engine (Files & Memory Management)

Transferring a 50GB 4K video file via a browser is incredibly difficult. If you load it into an `ArrayBuffer`, the browser tab will crash due to an OOM (Out of Memory) error. 

## 3.1 The Uploader Strategy (`useUploaderConnections.ts`)
The Uploader does not load the file into memory. It relies on HTML5 `File` objects, which act as pointers to the file on disk.

1.  **Chunking**: `chunkSize` is set (e.g., 64KB - 256KB). We use `file.slice(offset, offset + chunkSize)` to read a tiny piece of the file from the disk into an `ArrayBuffer`.
2.  **Backpressure Mechanism**: WebRTC Data Channels have a `bufferedAmount` property. If we push chunks faster than the network can send them, the internal buffer swells and drops packets. CoffeeShare implements a `drain` listener or a `bufferedAmount` threshold. If the buffer is over 1MB, we pause slicing the file until it drains.
3.  **Serialization**: The chunk is sent as pure binary. We prefix it or send a metadata JSON packet beforehand to identify which file the chunk belongs to.

## 3.2 The Downloader Strategy (`useDownloader.ts`)
The receiver must reconstruct the file without blowing up their RAM.

### Strategy A: File System Access API (The Modern Way)
If the browser supports it (Chrome, Edge, Opera), we use `window.showSaveFilePicker()` or `window.showDirectoryPicker()`.
*   This grants the browser a handle directly to the user's hard drive.
*   We create a `FileSystemWritableFileStream`.
*   As each 64KB WebRTC chunk arrives, we instantly `.write(chunk)` to the disk and garbage collect the chunk from RAM. Memory usage stays flat at ~0MB.

### Strategy B: Blob Fallback (The Legacy Way)
If the browser is Safari or Firefox (which lack full File System Access), we push chunks into a Javascript `Array`.
*   Once all chunks arrive, we combine them: `new Blob(chunks)`.
*   We create an Object URL: `URL.createObjectURL(blob)` and trigger an invisible `<a>` tag click to force a download.
*   *Limitation*: This limits the file size to the available RAM of the receiver.

## 3.3 State Synchronization
Both `useUploaderConnections` and `useDownloader` maintain massive state objects:
*   `totalFiles`, `completedFiles`
*   `bytesDownloaded`, `totalSize`
These states are bound to the React UI (`ProgressBar.tsx`) via Framer Motion to create silky-smooth progress bars.
