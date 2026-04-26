import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

// GET /api/transfers — list transfers with filters
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const roomId = searchParams.get('roomId')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')
  const sortBy = searchParams.get('sortBy') || 'startedAt'
  const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'

  const where: any = {}
  if (status) where.status = status
  if (roomId) where.roomId = roomId

  const [transfers, total] = await Promise.all([
    prisma.transfer.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      take: limit,
      skip: offset,
      include: { room: { select: { roomCode: true } } },
    }),
    prisma.transfer.count({ where }),
  ])

  return NextResponse.json({ transfers, total, limit, offset })
}

// POST /api/transfers — log a new transfer
export async function POST(request: Request) {
  const body = await request.json()
  const { roomId, fileName, fileSize, fileType, senderPeerId, receiverPeerId } = body

  if (!roomId || !fileName || !senderPeerId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const transfer = await prisma.transfer.create({
    data: {
      roomId,
      fileName,
      fileSize: fileSize || 0,
      fileType: fileType || 'application/octet-stream',
      senderPeerId,
      receiverPeerId: receiverPeerId || null,
      status: 'active',
    },
  })

  // Log analytics event
  await prisma.analyticsEvent.create({
    data: {
      eventType: 'transfer_start',
      peerId: senderPeerId,
      roomId,
      metadata: JSON.stringify({ transferId: transfer.id, fileName, fileSize }),
    },
  })

  return NextResponse.json(transfer, { status: 201 })
}
