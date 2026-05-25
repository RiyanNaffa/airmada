/**
 * API Route: /api/ai/chat
 *
 * @location apps/web/src/app/api/ai/chat/route.ts
 * TODO: Chatbot dengan context injection dari DB
 */
import { NextResponse } from 'next/server'

export async function POST(_req: Request) {
  return NextResponse.json({
    message: 'TODO: implement POST /api/ai/chat',
  })
}
