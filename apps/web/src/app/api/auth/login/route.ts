/**
 * API Route: /api/auth/login
 *
 * @location apps/web/src/app/api/auth/login/route.ts
 * Handles user authentication and session creation
 * Supports: Supabase Auth (primary) + Dummy Auth (testing/tour)
 */
import { NextResponse, type NextRequest } from 'next/server'
import type { User } from '@airmada/types'
import { DUMMY_USERS } from '@airmada/mocks'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    let userProfile: User | null = null
    const authEmail = email
    const loginTime = new Date().toISOString()

    // ===== TRY: Supabase Authentication =====
    try {
      const supabase = await createClient()
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        // Check for specific errors that should NOT fall back to dummy auth
        if (authError.message?.includes('Email not confirmed')) {
          return NextResponse.json(
            { error: 'Please confirm your email address before logging in' },
            { status: 403 }
          )
        }
        if (authError.message?.includes('Invalid login credentials')) {
          // Fall through to dummy auth for this specific error
          throw new Error(authError.message)
        }
        // For other errors, also try dummy auth
        throw new Error(authError.message || 'Supabase auth failed')
      }

      if (!authData.user) {
        throw new Error('Authentication failed - no user data')
      }

      // Fetch user profile from database
      let profile
      const { data: fetchedProfile, error: profileError } = await supabase
        .from('users')
        .select('id, full_name, short_name, role, cell_phone, warehouse_id')
        .eq('id', authData.user.id)
        .single()
      profile = fetchedProfile

      // If profile doesn't exist, auto-create it
      if (profileError) {
        console.warn('Profile not found, auto-creating...', profileError)
        const fullName =
          authData.user.user_metadata?.full_name || authData.user.email?.split('@')[0] || 'User'
        const shortName = fullName.split(' ')[0]
        const warehouseId = authData.user.user_metadata?.warehouse_id || null

        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert([
            {
              id: authData.user.id,
              full_name: fullName,
              short_name: shortName,
              role: 'DRIVER',
              cell_phone: authData.user.user_metadata?.cell_phone || null,
              warehouse_id: warehouseId,
            },
          ])
          .select('id, full_name, short_name, role, cell_phone, warehouse_id')
          .single()

        if (createError || !newProfile) {
          throw new Error(
            'Failed to create user profile: ' + (createError?.message || 'Unknown error')
          )
        }
        profile = newProfile
      }

      if (!profile) {
        throw new Error('User profile not found')
      }

      userProfile = {
        id: profile.id,
        full_name: profile.full_name,
        short_name: profile.short_name,
        role: profile.role,
        cell_phone: profile.cell_phone,
        avatar_url: '/dummy/doctor.jpg',
        warehouse_id: profile.warehouse_id,
      } as User
    } catch (supabaseError) {
      console.warn('Supabase auth failed, attempting dummy auth:', supabaseError)

      // ===== FALLBACK: Dummy Authentication (for testing/tour) =====
      const dummyUser = DUMMY_USERS.find((u) => u.email === email)

      if (!dummyUser) {
        return NextResponse.json({ error: 'Email address not found' }, { status: 401 })
      }

      if (dummyUser.password !== password) {
        return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
      }

      const { password: _, ...profile } = dummyUser
      userProfile = {
        ...profile,
        avatar_url: '/dummy/doctor.jpg',
      } as User
    }

    if (!userProfile) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }

    // Create session object
    const sessionData = {
      user: userProfile,
      email: authEmail,
      loginTime,
    }

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        ...sessionData,
      },
      { status: 200 }
    )

    // Set session cookies
    response.cookies.set('airmada_session', 'authenticated', {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 86400, // 24 hours
    })

    response.cookies.set('user_session', JSON.stringify(sessionData), {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 86400, // 24 hours
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
