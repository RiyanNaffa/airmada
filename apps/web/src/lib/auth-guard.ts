import { createClient } from './supabase/server'
import { NextResponse } from 'next/server'

type Role = 'manager' | 'dispatcher' | 'driver'

export async function withAuth(
  handler: (req: Request, userId: string, role: Role) => Promise<Response>,
  allowedRoles: Role[]
) {
  return async (req: Request) => {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()

    if (!profile || !allowedRoles.includes(profile.role as Role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return handler(req, user.id, profile.role as Role)
  }
}
