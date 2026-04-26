import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'

// PATCH /api/transfers/[id] — update transfer status
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { status, bytesTransferred } = body

  const data: any = {}
  if (status) data.status = status
  if (bytesTransferred !== undefined) data.bytesTransferred = bytesTransferred
  if (status === 'completed') {
    data.completedAt = new Date()
    // Calculate duration from startedAt
    const transfer = await prisma.transfer.findUnique({ where: { id } })
    if (transfer) {
      data.durationMs = Date.now() - transfer.startedAt.getTime()

      // Log analytics event
      await prisma.analyticsEvent.create({
        data: {
          eventType: 'transfer_complete',
          peerId: transfer.senderPeerId,
          roomId: transfer.roomId,
          metadata: JSON.stringify({
            transferId: id,
            fileName: transfer.fileName,
            fileSize: transfer.fileSize,
            durationMs: data.durationMs,
          }),
        },
      })
    }
  }

  const updated = await prisma.transfer.update({ where: { id }, data })
  return NextResponse.json(updated)
}

// DELETE /api/transfers/[id] — delete a transfer record
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.transfer.delete({ where: { id } })
  return NextResponse.json({ deleted: true })
}
