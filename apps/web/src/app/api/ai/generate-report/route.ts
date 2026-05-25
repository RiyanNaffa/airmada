/**
 * API Route: /api/ai/generate-report
 *
 * @location apps/web/src/app/api/ai/generate-report/route.ts
 * TODO: Generate narasi laporan via Gemini/Groq
 */
import { NextResponse } from 'next/server'

export async function POST(_req: Request) {
  return NextResponse.json({
    message: 'TODO: implement POST /api/ai/generate-report',
  })
}
