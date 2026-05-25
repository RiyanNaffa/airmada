import { NextRequest, NextResponse } from 'next/server'
import { DUMMY_USERS } from '@airmada/mocks'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/auth/register
 * Register a new user account
 * Supports: Supabase Auth (primary) + Dummy Auth (testing/tour)
 *
 * @location apps/web/src/app/api/auth/register/route.ts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fullName, email, password, confirmPassword, cellPhone } = body

    // Validation
    if (!fullName || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ success: false, error: 'Passwords do not match' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if email already exists in dummy users (for testing)
    const existingDummyUser = DUMMY_USERS.find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    )

    if (existingDummyUser) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 409 }
      )
    }

    let newUser: Record<string, unknown> | null = null
    let sessionData: Record<string, unknown> | null = null
    let _requiresEmailConfirmation = false

    // ===== TRY: Supabase Registration =====
    try {
      const supabase = await createClient()

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            cell_phone: cellPhone || null,
          },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
        },
      })

      if (authError || !authData.user) {
        throw new Error(authError?.message || 'Supabase registration failed')
      }

      // Check if email confirmation is required
      // user.confirmed_at will be null if email confirmation is required
      _requiresEmailConfirmation = !authData.user.confirmed_at

      // Create user profile in database
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            full_name: fullName,
            short_name: fullName.split(' ')[0],
            cell_phone: cellPhone || null,
            role: 'DRIVER', // Default role
            warehouse_id: authData.user.user_metadata?.warehouse_id || null,
          },
        ])
        .select()
        .single()

      if (profileError || !profile) {
        throw new Error('Failed to create user profile')
      }

      newUser = {
        id: profile.id,
        full_name: profile.full_name,
        short_name: profile.short_name,
        role: profile.role,
        cell_phone: profile.cell_phone,
        avatar_url: '/dummy/doctor.jpg',
        warehouse_id: profile.warehouse_id,
      }

      sessionData = {
        user: newUser,
        email,
        loginTime: new Date().toISOString(),
      }
    } catch (supabaseError) {
      console.warn('Supabase registration failed, creating dummy user:', supabaseError)

      // ===== FALLBACK: Dummy User Creation (for testing/tour) =====
      newUser = {
        id: `user_${Date.now()}`,
        full_name: fullName,
        short_name: fullName.split(' ')[0],
        cell_phone: cellPhone || null,
        role: 'DRIVER',
        avatar_url: '/dummy/doctor.jpg',
      }

      sessionData = {
        user: newUser,
        email,
        loginTime: new Date().toISOString(),
      }
    }

    if (!newUser) {
      return NextResponse.json({ success: false, error: 'Registration failed' }, { status: 500 })
    }

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        ...sessionData,
      },
      { status: 201 }
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
    console.error('Register error:', error)
    return NextResponse.json(
      { success: false, error: 'An error occurred during registration' },
      { status: 500 }
    )
  }
}
