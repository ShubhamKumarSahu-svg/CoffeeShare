import { NextResponse } from 'next/server'
import { getOrCreateChannelRepo } from '../../../channel'

export async function POST(request: Request): Promise<NextResponse> {
  let body: any = {}
  try {
    body = await request.json()
  } catch (e) {
    // Ignore JSON parse error for empty body
  }
  const { uploaderPeerID } = body
  if (!uploaderPeerID) {
    return NextResponse.json(
      { error: 'Uploader peer ID is required' },
      { status: 400 },
    )
  }

  const channel = await getOrCreateChannelRepo().createChannel(uploaderPeerID)
  return NextResponse.json(channel)
}
