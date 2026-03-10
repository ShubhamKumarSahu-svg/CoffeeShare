# Chapter 7: Database Management System (DBMS) Architecture

CoffeeShare employs a **dual-layer persistence strategy**: Redis for ephemeral signaling channels, and **Prisma ORM + SQLite** for durable transfer history, room metadata, and analytics — demonstrating core DBMS concepts in a production application.

## 7.1 The Dual-Layer Persistence Model

| Layer | Technology | Purpose | Lifetime |
|:---|:---|:---|:---|
| **Signaling** | Redis / In-Memory | Room shortcodes → PeerJS IDs | Ephemeral (TTL-based) |
| **Persistence** | Prisma + SQLite | Transfer logs, room history, analytics | Permanent |

### Why Two Layers?
- **Signaling must be ultra-fast**: Matching a 6-char shortcode to a peer ID happens in <5ms. Redis excels here with O(1) key-value lookups.
- **Analytics need relational queries**: Aggregating transfer statistics (GROUP BY file type, AVG duration) requires SQL. SQLite provides a full ACID-compliant relational database with zero infrastructure overhead.

## 7.2 Schema Design (Prisma ORM)

The schema lives in `prisma/schema.prisma` and models four entities with proper foreign key relationships:

```
┌──────────────┐     ┌───────────────────┐
│    Room       │←───<│  RoomParticipant   │
│──────────────│     │───────────────────│
│ id      (PK) │     │ id         (PK)   │
│ roomCode (U) │     │ roomId     (FK)   │
│ hostPeerId   │     │ peerId            │
│ createdAt    │     │ role              │
│ closedAt     │     │ joinedAt / leftAt │
└──────┬───────┘     └───────────────────┘
       │
       │1:N
       ▼
┌──────────────────┐     ┌──────────────────┐
│    Transfer       │     │ AnalyticsEvent    │
│──────────────────│     │──────────────────│
│ id          (PK) │     │ id         (PK)  │
│ roomId      (FK) │     │ eventType        │
│ fileName         │     │ peerId           │
│ fileSize    (INT)│     │ roomId           │
│ fileType         │     │ metadata  (JSON) │
│ senderPeerId     │     │ createdAt        │
│ receiverPeerId   │     └──────────────────┘
│ status           │
│ startedAt        │
│ completedAt      │
│ durationMs       │
│ bytesTransferred │
└──────────────────┘
```

### Key Design Decisions

1. **Normalization (3NF)**: Room metadata is separated from transfers. A room can have many transfers and many participants — classic 1:N relationships with foreign keys.
2. **Indexing Strategy**: Composite indexes on `[roomId]`, `[status]`, `[startedAt]`, `[peerId]` enable fast filtered queries.
3. **CUID Primary Keys**: Unlike auto-increment integers, CUIDs are collision-resistant and sortable by creation time.
4. **Nullable Fields**: `completedAt`, `durationMs`, `receiverPeerId` are nullable — transfers in progress don't yet have these values.
5. **JSON Metadata**: `AnalyticsEvent.metadata` stores flexible JSON payloads, demonstrating the semi-structured data pattern.

## 7.3 CRUD API Routes

All database operations are exposed via Next.js API routes under `/api/`:

| Endpoint | Method | SQL Equivalent | Description |
|:---|:---|:---|:---|
| `/api/transfers` | GET | `SELECT * FROM Transfer WHERE status=? ORDER BY ? LIMIT ? OFFSET ?` | Paginated, filterable, sortable query |
| `/api/transfers` | POST | `INSERT INTO Transfer (...) VALUES (...)` | Log a new transfer |
| `/api/transfers/[id]` | PATCH | `UPDATE Transfer SET status=?, completedAt=? WHERE id=?` | Update transfer status |
| `/api/transfers/[id]` | DELETE | `DELETE FROM Transfer WHERE id=?` | Remove a transfer record |
| `/api/rooms` | POST | `INSERT ... ON CONFLICT UPDATE` (UPSERT) | Create or update a room |
| `/api/rooms` | GET | `SELECT r.*, COUNT(t.id) FROM Room r LEFT JOIN Transfer t ...` | List rooms with transfer counts |
| `/api/analytics` | GET | Multiple aggregate queries (see below) | Dashboard statistics |

### Analytics Endpoint — DBMS Concepts Demonstrated

The `/api/analytics` route executes **9 concurrent queries** showcasing:

```sql
-- COUNT (total records)
SELECT COUNT(*) FROM Transfer;

-- COUNT with WHERE (filtered count)
SELECT COUNT(*) FROM Transfer WHERE status = 'completed';

-- GROUP BY with COUNT (status breakdown)
SELECT status, COUNT(id) FROM Transfer GROUP BY status;

-- GROUP BY with SUM + ORDER BY aggregate (top file types)
SELECT fileType, COUNT(id), SUM(fileSize)
FROM Transfer GROUP BY fileType ORDER BY COUNT(id) DESC LIMIT 10;

-- Aggregate functions: SUM, AVG, MIN, MAX
SELECT SUM(bytesTransferred), SUM(fileSize) FROM Transfer;
SELECT AVG(durationMs), MIN(durationMs), MAX(durationMs)
FROM Transfer WHERE status = 'completed';

-- JOIN with SELECT specific columns
SELECT t.*, r.roomCode FROM Transfer t
JOIN Room r ON t.roomId = r.id ORDER BY t.startedAt DESC LIMIT 10;
```

## 7.4 The Signaling Layer (Redis / In-Memory)

The original signaling system (`src/channel.ts`) uses a **Strategy Pattern** with two implementations:

| Class | Backend | When Used |
|:---|:---|:---|
| `RedisChannelRepo` | Redis via `ioredis` | Production (`REDIS_URL` is set) |
| `MemoryChannelRepo` | `Map<string, Channel>` | Local development |

Both implement the `ChannelRepo` interface:
```typescript
interface ChannelRepo {
  createChannel(uploaderPeerID: string, ttl?: number): Promise<Channel>
  fetchChannel(slug: string): Promise<Channel | null>
  renewChannel(slug: string, secret: string, ttl?: number): Promise<boolean>
  destroyChannel(slug: string): Promise<void>
}
```

### TTL (Time-To-Live) Strategy
Channels are ephemeral by design:
- **Redis**: Uses `SETEX` with a configurable TTL (default: 24 hours). Redis automatically evicts expired keys.
- **In-Memory**: Uses `setTimeout` to delete entries after TTL expires.
- **Application-Level Cleanup**: When the uploader closes their tab, `beforeunload` triggers a `destroyChannel` API call.

## 7.5 ACID Properties in CoffeeShare

| Property | How It's Enforced |
|:---|:---|
| **Atomicity** | Prisma wraps multi-step operations (create transfer + log analytics event) in implicit transactions |
| **Consistency** | Foreign key constraints ensure transfers always reference valid rooms; `UNIQUE` on `roomCode` prevents collisions |
| **Isolation** | SQLite uses serialized writes — concurrent API requests are queued, preventing dirty reads |
| **Durability** | SQLite writes to disk via WAL (Write-Ahead Logging); data survives process restarts |

## 7.6 Security & Privacy

- **Zero File Knowledge**: The database stores file *metadata* (name, size, type) but **never** file content. All binary data flows exclusively through WebRTC DataChannels.
- **Ephemeral Peer IDs**: PeerJS generates a new UUID on every page load. Database records contain these disposable identifiers, not real user identities.
- **Cascade Deletes**: Deleting a `Room` automatically removes all associated `RoomParticipant` and `Transfer` records via `onDelete: Cascade`.

## 7.7 Transfer History Dashboard

The `TransferHistory` component (`src/components/TransferHistory.tsx`) provides a full DBMS dashboard accessible via a floating action button:

**History Tab:**
- Sortable columns (file name, size, date) with click-to-toggle ASC/DESC
- Filterable by status (All, Pending, Active, Completed, Failed)
- Inline DELETE per record
- Pagination support

**Analytics Tab:**
- Overview cards: total transfers, completed count, rooms created, total data transferred
- Duration statistics: average, fastest, slowest transfer times
- Status breakdown: horizontal bar chart showing distribution
- Top file types: grouped by MIME type with total size per type
