/**
 * API Route: /api/ai/analyst/upload
 *
 * @location apps/web/src/app/api/ai/analyst/upload/route.ts
 * Endpoint untuk upload file CSV/Excel dan initial analysis
 */
import { NextRequest, NextResponse } from 'next/server'
import { analyzeFleetData } from '@/lib/openrouter'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only CSV and Excel files are supported' }, { status: 400 })
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 })
    }

    // Read file content
    const fileBuffer = await file.arrayBuffer()
    const fileContent = Buffer.from(fileBuffer).toString('utf-8')

    // Analyze the fleet data
    const analysis = await analyzeFleetData(fileContent, file.name)

    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileSize: file.size,
      analysis,
      sessionId: `session_${Date.now()}`,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}
