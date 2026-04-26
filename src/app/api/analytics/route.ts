import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

// GET /api/analytics — aggregate statistics
export async function GET() {
  const [
    totalTransfers,
    completedTransfers,
    totalRooms,
    totalParticipants,
    transfersByStatus,
    recentTransfers,
    topFileTypes,
    totalBytesResult,
    avgDurationResult,
  ] = await Promise.all([
    // Count all transfers
    prisma.transfer.count(),

    // Count completed transfers
    prisma.transfer.count({ where: { status: 'completed' } }),

    // Count all rooms
    prisma.room.count(),

    // Count unique participants
    prisma.roomParticipant.count(),

    // Group by status (demonstrates GROUP BY)
    prisma.transfer.groupBy({
      by: ['status'],
      _count: { id: true },
    }),

    // Recent 10 transfers with room info (demonstrates JOIN + ORDER BY + LIMIT)
    prisma.transfer.findMany({
      orderBy: { startedAt: 'desc' },
      take: 10,
      include: { room: { select: { roomCode: true } } },
    }),

    // Top file types (demonstrates GROUP BY + ORDER BY aggregate)
    prisma.transfer.groupBy({
      by: ['fileType'],
      _count: { id: true },
      _sum: { fileSize: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    }),

    // Total bytes transferred (demonstrates SUM aggregate)
    prisma.transfer.aggregate({
      _sum: { bytesTransferred: true, fileSize: true },
    }),

    // Average duration of completed transfers (demonstrates AVG aggregate)
    prisma.transfer.aggregate({
      where: { status: 'completed', durationMs: { not: null } },
      _avg: { durationMs: true },
      _min: { durationMs: true },
      _max: { durationMs: true },
    }),
  ])

  return NextResponse.json({
    overview: {
      totalTransfers,
      completedTransfers,
      totalRooms,
      totalParticipants,
      totalBytesTransferred: totalBytesResult._sum.bytesTransferred || 0,
      totalFileSize: totalBytesResult._sum.fileSize || 0,
    },
    transfersByStatus: transfersByStatus.map(s => ({
      status: s.status,
      count: s._count.id,
    })),
    avgDuration: {
      avg: Math.round(avgDurationResult._avg.durationMs || 0),
      min: avgDurationResult._min.durationMs || 0,
      max: avgDurationResult._max.durationMs || 0,
    },
    topFileTypes: topFileTypes.map(t => ({
      type: t.fileType,
      count: t._count.id,
      totalSize: t._sum.fileSize || 0,
    })),
    recentTransfers,
  })
}
