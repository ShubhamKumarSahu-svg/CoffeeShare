import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

// POST /api/rooms — create a room
export async function POST(request: Request) {
  const body = await request.json()
  const { roomCode, hostPeerId } = body

  if (!roomCode || !hostPeerId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Upsert: if room exists, return it; otherwise create
  const room = await prisma.room.upsert({
    where: { roomCode },
    update: { hostPeerId },
    create: { roomCode, hostPeerId },
  })

  // Add host as participant
  await prisma.roomParticipant.create({
    data: { roomId: room.id, peerId: hostPeerId, role: 'uploader' },
  })

  // Log event
  await prisma.analyticsEvent.create({
    data: { eventType: 'room_created', peerId: hostPeerId, roomId: room.id },
  })

  return NextResponse.json(room, { status: 201 })
}

// GET /api/rooms — list rooms with participants
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '20')

  const rooms = await prisma.room.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      participants: true,
      _count: { select: { transfers: true } },
    },
  })

  return NextResponse.json(rooms)
}
