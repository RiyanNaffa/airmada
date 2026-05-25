/**
 * API Route: /api/ai/analyst/chat
 *
 * @location apps/web/src/app/api/ai/analyst/chat/route.ts
 * Endpoint untuk streaming chat dengan aiRMADA Data Analyst
 */
import { NextRequest, NextResponse } from 'next/server'
import { chatWithAnalyst } from '@/lib/openrouter'

interface ChatRequest {
  messages: Array<{
    role: 'user' | 'assistant' | 'system'
    content: string
  }>
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()

    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 })
    }

    if (body.messages.length === 0) {
      return NextResponse.json({ error: 'Messages array cannot be empty' }, { status: 400 })
    }

    // Get response from OpenRouter
    const response = await chatWithAnalyst(body.messages)

    return NextResponse.json({
      success: true,
      message: response,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}
