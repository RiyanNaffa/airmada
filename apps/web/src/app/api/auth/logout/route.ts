/**
 * API Route: /api/auth/logout
 *
 * @location apps/web/src/app/api/auth/logout/route.ts
 * Handles user logout and session invalidation
 */
import { NextResponse, type NextRequest } from 'next/server'

// TODO: clear underscore req
export async function POST(_req: NextRequest) {
  try {
    // ===== TEMPORARY: Dummy Logout =====
    // Clear session cookie
    const response = NextResponse.json(
      {
        success: true,
        message: 'Logged out successfully',
      },
      { status: 200 }
    )

    // Delete session cookie
    response.cookies.delete('airmada_session')

    return response

    // ===== FUTURE: Supabase Implementation =====
    // const { createClient } = await import('@/lib/supabase/server')
    // const supabase = await createClient()
    //
    // const { error } = await supabase.auth.signOut()
    //
    // if (error) {
    //   return NextResponse.json(
    //     { error: error.message },
    //     { status: 500 }
    //   )
    // }
    //
    // const response = NextResponse.json(
    //   {
    //     success: true,
    //     message: 'Logged out successfully',
    //   },
    //   { status: 200 }
    // )
    //
    // return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
