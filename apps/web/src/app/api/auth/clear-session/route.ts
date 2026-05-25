import { NextResponse, type NextRequest } from 'next/server'

/**
 * POST /api/auth/clear-session
 * Development endpoint to clear all session data
 *
 * @location apps/web/src/app/api/auth/clear-session/route.ts
 */
export async function POST(_req: NextRequest) {
  const response = NextResponse.json(
    {
      success: true,
      message: 'Session cleared. Redirecting to login...',
    },
    { status: 200 }
  )

  // Delete all session-related cookies
  response.cookies.delete('airmada_session')
  response.cookies.delete('next-auth.session-token')
  response.cookies.delete('next-auth.callback-url')

  return response
}
