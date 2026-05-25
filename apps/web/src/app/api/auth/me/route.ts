/**
 * API Route: /api/auth/me
 *
 * @location apps/web/src/app/api/auth/me/route.ts
 * Handles fetching and updating current user profile
 */
import { NextResponse, NextRequest } from 'next/server'
import type { UserSession } from '@airmada/types'

interface UpdateUserPayload {
  full_name?: string
  short_name?: string
  cell_phone?: string
  role?: string
}

/**
 * GET /api/auth/me
 * Fetches the current authenticated user's profile
 * Supports session from cookies or Authorization header (base64 encoded JSON)
 */
export async function GET(req: NextRequest) {
  try {
    let userSession: UserSession | null = null

    // Try to get session from cookie first
    const sessionCookie = req.cookies.get('user_session')
    if (sessionCookie) {
      try {
        userSession = JSON.parse(sessionCookie.value)
        // console.log(`User: ${userSession?.user.full_name}, Warehouse ID: ${userSession?.user.warehouse_id}`)
      } catch (parseError) {
        console.error('Failed to parse session cookie:', parseError)
      }
    }

    // Fallback: Try to get session from Authorization header
    // Format: "Bearer base64(sessionJSON)"
    if (!userSession) {
      const authHeader = req.headers.get('Authorization')
      if (authHeader?.startsWith('Bearer ')) {
        try {
          const encodedSession = authHeader.slice(7) // Remove 'Bearer ' prefix
          const decodedSession = Buffer.from(encodedSession, 'base64').toString('utf-8')
          userSession = JSON.parse(decodedSession)
        } catch (headerError) {
          console.error('Failed to parse Authorization header:', headerError)
        }
      }
    }

    if (!userSession) {
      return NextResponse.json({ error: 'Unauthorized - No session found' }, { status: 401 })
    }

    return NextResponse.json(userSession, { status: 200 })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 })
  }
}

/**
 * PATCH /api/auth/me
 * Updates the current authenticated user's profile
 */
export async function PATCH(req: NextRequest) {
  try {
    // Get user session from cookies
    const sessionCookie = req.cookies.get('user_session')

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized - No session found' }, { status: 401 })
    }

    // Parse existing session
    let userSession: UserSession
    try {
      userSession = JSON.parse(sessionCookie.value)
    } catch (parseError) {
      return NextResponse.json({ error: `Invalid session data: ${parseError}` }, { status: 401 })
    }

    // Get update payload from request body
    const payload: UpdateUserPayload = await req.json()

    // Validate and update user data
    const updatedUser = {
      ...userSession.user,
      ...(payload.full_name && { full_name: payload.full_name }),
      ...(payload.short_name && { short_name: payload.short_name }),
      ...(payload.cell_phone && { cell_phone: payload.cell_phone }),
      ...(payload.role && { role: payload.role }),
    }

    // Create updated session
    const updatedSession: UserSession = {
      ...userSession,
      user: updatedUser,
    }

    // TODO: Persist changes to database (Supabase)
    // UPDATE users SET full_name = $1, short_name = $2, cell_phone = $3, role = $4 WHERE id = $5

    // Update session cookie
    const response = NextResponse.json(updatedSession, { status: 200 })
    response.cookies.set('user_session', JSON.stringify(updatedSession), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 })
  }
}
