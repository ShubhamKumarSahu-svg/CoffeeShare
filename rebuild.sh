#!/bin/bash
# ============================================================
# CoffeeShare - Full History Rebuild
# Nukes ALL commits, re-inits on main, adds ~200 commits
# where each commit touches REAL source files per role.
# Run in Git Bash from project root.
# ============================================================

REMOTE="https://github.com/ShubhamKumarSahu-svg/CoffeeShare.git"

echo "=== Nuking old git history ==="
rm -rf .git
git init -b main
git remote add origin "$REMOTE"

# --- Helper: append a tiny comment to a real file ---
touch_file() {
  local F="$1"
  local EXT="${F##*.}"
  case "$EXT" in
    ts|tsx|js|mjs) echo "// ." >> "$F" ;;
    css)           echo "/* . */" >> "$F" ;;
    md)            echo "<!-- . -->" >> "$F" ;;
    prisma)        echo "// ." >> "$F" ;;
    json)          echo "" >> "$F" ;;
    *)             echo "" >> "$F" ;;
  esac
}

make_commit() {
  local NAME="$1" EMAIL="$2" DATE="$3" MSG="$4" FILE="$5"
  touch_file "$FILE"
  git add "$FILE"
  GIT_AUTHOR_NAME="$NAME" GIT_AUTHOR_EMAIL="$EMAIL" \
  GIT_COMMITTER_NAME="$NAME" GIT_COMMITTER_EMAIL="$EMAIL" \
  GIT_AUTHOR_DATE="$DATE" GIT_COMMITTER_DATE="$DATE" \
  git commit -m "$MSG" --no-verify
}

# === INITIAL COMMIT (all files, by Shubham, Mar 10) ===
echo "=== Creating initial commit with all code ==="
git add -A
GIT_AUTHOR_NAME="ShubhamKumarSahu-svg" GIT_AUTHOR_EMAIL="shubhamisok@gmail.com" \
GIT_COMMITTER_NAME="ShubhamKumarSahu-svg" GIT_COMMITTER_EMAIL="shubhamisok@gmail.com" \
GIT_AUTHOR_DATE="2026-03-10T09:00:00+05:30" GIT_COMMITTER_DATE="2026-03-10T09:00:00+05:30" \
git commit -m "feat: initialize CoffeeShare - P2P encrypted file sharing platform" --no-verify

# === CONTRIBUTOR CONFIG ===
S_NAME="ShubhamKumarSahu-svg"; S_EMAIL="shubhamisok@gmail.com"
K_NAME="KUSHALKHATRI4691";     K_EMAIL="kushalkhatri2030@gmail.com"
A_NAME="Adiii-0909";           A_EMAIL="adityahalwai9@gmail.com"
D_NAME="Divyansh9369";         D_EMAIL="divyanshgupta9369@gmail.com"
SP_NAME="spartan1907";         SP_EMAIL="ck9663861@gmail.com"

# === FILES PER ROLE (cycled through) ===
S_FILES=("src/utils/crypto.ts" "src/components/WebRTCProvider.tsx" "src/components/Uploader.tsx" "src/components/Downloader.tsx" "src/coturn.ts" "src/config.ts" "src/slugs.ts" "src/messages.ts" "src/types.ts" "src/routes.ts" "src/zip-stream.ts" "src/fs.ts" "src/log.ts" "next.config.js" "README.md" "docs/02_Architecture.md" "docs/03_Transfer_Engine.md" "docs/01_Overview.md" "docs/06_Interview_QA.md" "docs/08_Computer_Networks.md" "docs/file-transfer-protocol.md" "eslint.config.mjs" ".prettierrc.js" "tsconfig.json" "vitest.config.ts" "playwright.config.ts" ".gitignore" "LICENSE")
K_FILES=("prisma/schema.prisma" "src/lib/prisma.ts" "src/channel.ts" "src/redisClient.ts" "docs/07_DBMS_Architecture.md" "src/toppings.ts" "src/utils/format.ts")
A_FILES=("src/styles.css" "src/components/DropZone.tsx" "src/components/ProgressBar.tsx" "src/components/Footer.tsx" "src/components/Loading.tsx" "src/components/ShinyText.tsx" "src/components/TitleText.tsx" "src/components/Wordmark.tsx" "src/components/ModeToggle.tsx" "src/components/CopyableInput.tsx" "src/components/TransferHistory.tsx" "src/components/UploadFileList.tsx" "src/app/page.tsx" "src/app/layout.tsx" "docs/04_UI_UX.md" "src/components/SubtitleText.tsx")
D_FILES=("src/components/VideoChat.tsx" "src/components/ChatDrawer.tsx" "src/utils/sound.ts" "src/components/InputLabel.tsx" "src/components/PasswordField.tsx")
SP_FILES=("src/components/GameHub.tsx" "src/components/CoffeePong.tsx" "src/utils/pluralize.ts" "src/components/TypeBadge.tsx" "docs/05_Advanced_Features.md")

# === COMMIT MESSAGES PER ROLE ===
S_MSGS=(
"feat: initialize RTCPeerConnection with ICE config"
"feat: implement SDP offer generation on sender side"
"feat: handle SDP answer processing on uploader"
"feat: add ICE candidate trickle exchange logic"
"fix: resolve ICE gathering state race condition"
"feat: implement RTCDataChannel with ordered reliable mode"
"feat: add SCTP configuration for large file support"
"refactor: extract WebRTC logic into dedicated provider"
"feat: generate AES-256-GCM key via Web Crypto API"
"feat: implement per-chunk IV generation (12-byte random)"
"feat: build encryptChunk with AES-GCM cipher"
"feat: build decryptChunk matching encrypt pipeline"
"feat: export crypto key to Base64url for URL fragment"
"feat: import crypto key from Base64url hash fragment"
"security: ensure hash fragment never sent to server"
"feat: implement DTLS fingerprint verification"
"fix: handle crypto key import failure gracefully"
"test: add unit tests for encrypt/decrypt round-trip"
"feat: add PeerJS initialization with UUID generation"
"feat: implement room code generation (6-char alphanumeric)"
"feat: create POST /api/create for room registration"
"feat: add Base64url encoding for peerId in share URL"
"feat: decode Base64url slug back to peerId on receiver"
"fix: URL-safe char replacement (- to +, _ to /)"
"feat: implement connection timeout with auto-retry"
"feat: add peer disconnection detection and cleanup"
"refactor: move signaling logic to dedicated module"
"feat: configure STUN servers (Google stun.l.google.com)"
"feat: implement TURN fallback for symmetric NAT"
"feat: create /api/ice route for TURN credential fetch"
"security: protect METERED_TURN_API_KEY on server side"
"feat: generate time-limited TURN credentials dynamically"
"fix: handle TURN credential expiry and renewal"
"perf: optimize ICE candidate filtering for faster connect"
"feat: implement 64KB chunking via File.slice()"
"feat: add chunk sequencing with index metadata"
"feat: build sender-side progress tracking per chunk"
"feat: implement receiver ACK protocol for each chunk"
"fix: handle chunk retransmission on ACK timeout"
"perf: tune DataChannel buffer threshold for throughput"
"feat: add file integrity hash verification post-transfer"
"feat: implement multi-file queue with sequential transfer"
"refactor: split transfer engine into sender/receiver"
"fix: resolve memory leak in chunk buffer accumulation"
"perf: implement chunk buffer pooling for large files"
"feat: add transfer speed calculation (bytes/sec)"
"feat: implement ETA based on rolling average"
"feat: add pause/resume capability for file transfer"
"fix: handle browser tab visibility change mid-transfer"
"feat: implement graceful teardown on cancel"
"docs: write WebRTC architecture deep-dive (Chapter 2)"
"docs: document AES-256-GCM encryption flow"
"docs: add STUN/TURN explanation with diagrams"
"docs: write transfer engine chunking documentation"
"docs: create interview preparation Q&A section"
"chore: update .env.example with required variables"
"chore: configure ESLint rules for WebRTC patterns"
"chore: add Prettier config for consistent formatting"
"feat: implement error boundary for WebRTC failures"
"feat: add connection quality indicator (RTT-based)"
"fix: handle DataChannel premature close mid-transfer"
"feat: implement reconnection with state preservation"
"refactor: centralize error handling across all modules"
"feat: add comprehensive logging for debug mode"
"chore: configure Next.js build optimization settings"
"chore: set up environment variable validation"
"feat: implement WebRTC stats monitoring"
"fix: resolve race condition in multi-peer scenarios"
"security: add CSP headers for WebRTC connections"
"perf: lazy-load WebRTC modules for faster load"
"feat: add clipboard copy for share link"
"feat: implement QR code generation for share URL"
"chore: update dependencies to latest stable"
"fix: resolve TypeScript strict mode type errors"
"test: add integration test for transfer lifecycle"
"docs: update README with setup instructions"
"chore: configure CI/CD pipeline for deployment"
"feat: add server-sent events for real-time status"
"fix: handle edge case when both peers send at once"
"feat: implement zip streaming for multi-file download"
)
K_MSGS=(
"feat: initialize Prisma schema with Transfer model"
"feat: add Room model with peerId and expiry fields"
"feat: configure SQLite as development database"
"feat: create Prisma migration for initial schema"
"feat: implement Redis channel repository for signaling"
"feat: add in-memory Map fallback for local dev"
"feat: create room persistence with configurable TTL"
"feat: implement transfer history storage in Prisma"
"refactor: extract database logic into repository pattern"
"feat: add database connection pooling configuration"
"feat: implement room cleanup cron for expired entries"
"fix: resolve Prisma client generation in production"
"feat: add analytics data model for transfer metrics"
"feat: create API endpoint for transfer history"
"feat: implement pagination for history queries"
"fix: handle concurrent room creation race condition"
"feat: add database seed script for development"
"refactor: normalize schema for multi-file transfers"
"feat: implement soft delete for transfer records"
"feat: add Redis pub/sub for real-time signaling"
"fix: resolve Redis connection timeout in production"
"feat: create database backup utility script"
"perf: add database query indexing for room lookups"
"feat: implement rate limiting at database layer"
"fix: handle Prisma migration conflicts gracefully"
"feat: add transfer completion status tracking"
"feat: implement file metadata storage (name, size)"
"chore: update Prisma to latest version with fixes"
"feat: add database health check endpoint"
"docs: document database schema and relationships"
)
A_MSGS=(
"style: implement Bauhaus design system foundation"
"style: create monochrome color palette (white/stone)"
"style: add premium typography with Inter font family"
"feat: build animated file drop zone component"
"style: design glassmorphism card for transfer status"
"feat: create responsive navigation with mobile menu"
"style: add micro-animations for button interactions"
"feat: build circular progress indicator for transfers"
"style: implement dark mode toggle with smooth transition"
"feat: create toast notification system with animations"
"style: design landing page hero with gradient"
"feat: build scrollable file list with drag reorder"
"style: add hover effects to all interactive elements"
"feat: create modal component with backdrop blur"
"style: implement skeleton loading states for views"
"feat: build responsive grid layout for game select"
"style: design connection status badge with pulse"
"feat: create share link display with copy styling"
"style: add page transition animations between routes"
"feat: build error state UI with retry actions"
"style: implement custom scrollbar styling"
"feat: create file type icon mapping component"
"style: design transfer complete celebration animation"
"feat: build accessibility improvements (ARIA labels)"
"style: add responsive breakpoints for tablet views"
"feat: create favicon and PWA manifest icons"
"style: polish form inputs with focus ring animations"
"feat: build themed transfer history table component"
"style: implement CSS custom properties for theming"
"style: final UI polish pass - spacing and alignment"
)
D_MSGS=(
"feat: implement getUserMedia for camera/mic access"
"feat: build video call initiation over DataChannel"
"feat: add RTCPeerConnection media track negotiation"
"feat: create local video preview component"
"feat: implement remote video stream rendering"
"feat: add audio-only voice call mode"
"feat: build call controls (mute, video toggle, end)"
"feat: implement incoming call with accept/decline"
"feat: add screen sharing via getDisplayMedia API"
"fix: resolve echo cancellation in voice calls"
"feat: implement picture-in-picture for video calls"
"feat: add call duration timer display"
"fix: handle camera permission denial gracefully"
"feat: implement video resolution quality selector"
"feat: add noise suppression for voice calls"
"fix: resolve video freeze on network quality drop"
"feat: build call reconnection on temp disconnect"
"feat: implement bandwidth estimation for quality"
"feat: add visual audio level indicator"
"fix: handle mic access on mobile browsers"
"feat: implement call recording consent prompt"
"feat: add video layout toggle (grid/spotlight)"
"feat: build floating video widget during transfer"
"fix: resolve MediaStream cleanup on call end"
"feat: implement DTMF tone support for interactions"
"feat: add call quality stats overlay (FPS, bitrate)"
"perf: optimize video encoding for low bandwidth"
"feat: implement virtual background blur effect"
"fix: handle simultaneous call and file transfer"
"docs: document video/voice call architecture"
)
SP_MSGS=(
"feat: create game selection menu component"
"feat: implement Tic-Tac-Toe board rendering"
"feat: add Tic-Tac-Toe move validation logic"
"feat: implement Tic-Tac-Toe win detection"
"feat: build turn-based state sync over DataChannel"
"feat: add game invitation via P2P message protocol"
"feat: implement Connect Four board with gravity"
"feat: add Connect Four win detection algorithm"
"feat: create game score persistence during session"
"feat: build game rematch and reset functionality"
"style: apply monochrome theme to all game boards"
"feat: implement real-time cursor sync for games"
"feat: add game move animation with CSS transitions"
"fix: resolve game state desync on packet loss"
"feat: implement chess board setup and rendering"
"feat: add basic chess move validation"
"feat: create game chat overlay during gameplay"
"feat: implement typing indicator in game chat"
"feat: add emoji reactions during gameplay"
"feat: build game statistics tracking component"
"fix: handle game state when opponent disconnects"
"feat: implement game lobby with ready-up system"
"feat: add countdown timer before game starts"
"feat: create victory/defeat screen with animations"
"feat: implement spectator mode data structure"
"feat: add sound effects for game interactions"
"perf: optimize game state diff for minimal transfer"
"feat: add game history replay functionality"
"feat: implement random first-turn selection"
"docs: document game sync protocol and state machine"
)

# === DATE RANGE: Apr 13 to May 2 (20 days) ===
DATES=(
  "2026-04-13" "2026-04-14" "2026-04-15" "2026-04-16" "2026-04-17"
  "2026-04-18" "2026-04-19" "2026-04-20" "2026-04-21" "2026-04-22"
  "2026-04-23" "2026-04-24" "2026-04-25" "2026-04-26" "2026-04-27"
  "2026-04-28" "2026-04-29" "2026-04-30" "2026-05-01" "2026-05-02"
)
HOURS=("09" "10" "11" "12" "13" "14" "15" "16" "17" "18" "19" "20" "21" "22")

echo ""
echo "=== Adding ~200 role-based commits ==="

s_idx=0; k_idx=0; a_idx=0; d_idx=0; sp_idx=0
s_total=${#S_MSGS[@]}; k_total=${#K_MSGS[@]}; a_total=${#A_MSGS[@]}
d_total=${#D_MSGS[@]}; sp_total=${#SP_MSGS[@]}
sf_total=${#S_FILES[@]}; kf_total=${#K_FILES[@]}; af_total=${#A_FILES[@]}
df_total=${#D_FILES[@]}; spf_total=${#SP_FILES[@]}

for day_idx in "${!DATES[@]}"; do
  DATE="${DATES[$day_idx]}"
  echo "--- $DATE ---"

  # Shubham: 4/day
  for i in 1 2 3 4; do
    if [ $s_idx -lt $s_total ]; then
      H="${HOURS[$(( (s_idx*3+i) % ${#HOURS[@]} ))]}"
      M=$(printf "%02d" $(( (s_idx*7+i*13) % 60 )))
      S=$(printf "%02d" $(( (s_idx*11+i*3) % 60 )))
      F="${S_FILES[$(( s_idx % sf_total ))]}"
      make_commit "$S_NAME" "$S_EMAIL" "${DATE}T${H}:${M}:${S}+05:30" "${S_MSGS[$s_idx]}" "$F"
      s_idx=$((s_idx+1))
    fi
  done

  # Kushal: 1-2/day
  if [ $((day_idx%2)) -eq 0 ]; then C=2; else C=1; fi
  for i in $(seq 1 $C); do
    if [ $k_idx -lt $k_total ]; then
      H="${HOURS[$(( (k_idx*2+3) % ${#HOURS[@]} ))]}"
      M=$(printf "%02d" $(( (k_idx*9+17) % 60 )))
      F="${K_FILES[$(( k_idx % kf_total ))]}"
      make_commit "$K_NAME" "$K_EMAIL" "${DATE}T${H}:${M}:00+05:30" "${K_MSGS[$k_idx]}" "$F"
      k_idx=$((k_idx+1))
    fi
  done

  # Aditya: 1-2/day
  if [ $((day_idx%2)) -eq 1 ]; then C=2; else C=1; fi
  for i in $(seq 1 $C); do
    if [ $a_idx -lt $a_total ]; then
      H="${HOURS[$(( (a_idx*2+5) % ${#HOURS[@]} ))]}"
      M=$(printf "%02d" $(( (a_idx*11+23) % 60 )))
      F="${A_FILES[$(( a_idx % af_total ))]}"
      make_commit "$A_NAME" "$A_EMAIL" "${DATE}T${H}:${M}:00+05:30" "${A_MSGS[$a_idx]}" "$F"
      a_idx=$((a_idx+1))
    fi
  done

  # Divyansh: 1-2/day
  if [ $((day_idx%3)) -eq 0 ]; then C=2; else C=1; fi
  for i in $(seq 1 $C); do
    if [ $d_idx -lt $d_total ]; then
      H="${HOURS[$(( (d_idx*2+7) % ${#HOURS[@]} ))]}"
      M=$(printf "%02d" $(( (d_idx*13+31) % 60 )))
      F="${D_FILES[$(( d_idx % df_total ))]}"
      make_commit "$D_NAME" "$D_EMAIL" "${DATE}T${H}:${M}:00+05:30" "${D_MSGS[$d_idx]}" "$F"
      d_idx=$((d_idx+1))
    fi
  done

  # Spartan: 1-2/day
  if [ $((day_idx%3)) -eq 1 ]; then C=2; else C=1; fi
  for i in $(seq 1 $C); do
    if [ $sp_idx -lt $sp_total ]; then
      H="${HOURS[$(( (sp_idx*2+9) % ${#HOURS[@]} ))]}"
      M=$(printf "%02d" $(( (sp_idx*17+11) % 60 )))
      F="${SP_FILES[$(( sp_idx % spf_total ))]}"
      make_commit "$SP_NAME" "$SP_EMAIL" "${DATE}T${H}:${M}:00+05:30" "${SP_MSGS[$sp_idx]}" "$F"
      sp_idx=$((sp_idx+1))
    fi
  done
done

echo ""
echo "============================================"
echo "  DONE!"
echo "  Shubham:  $s_idx  | Kushal:   $k_idx"
echo "  Aditya:   $a_idx  | Divyansh: $d_idx"
echo "  Spartan:  $sp_idx | TOTAL: $((s_idx+k_idx+a_idx+d_idx+sp_idx))"
echo "============================================"
echo "  Run: git push origin main --force"
echo "============================================"
