// TODO: uncomment once used
// import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Rute publik yang tidak memerlukan autentikasi
const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/',
  '/api/shipments/track',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/invite',
]

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request })

  // ===== TEMPORARY: Dummy Session Check (using cookies) =====
  // TODO: Replace with Supabase auth when ready
  const sessionCookie = request.cookies.get('airmada_session')
  const isPublicPath = PUBLIC_PATHS.some((p) => request.nextUrl.pathname.startsWith(p))
  const isLoginPage = request.nextUrl.pathname === '/login'

  // Temporary: Check if session exists
  const hasSession = !!sessionCookie

  // Redirect unauthenticated users from protected routes to login
  if (!hasSession && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect authenticated users away from login page to dashboard
  if (hasSession && isLoginPage) {
    return NextResponse.redirect(new URL('/overview', request.url))
  }

  // ===== FUTURE: Uncomment when Supabase is implemented =====
  // const supabase = createServerClient(
  //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //   process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  //   {
  //     cookies: {
  //       getAll() {
  //         return request.cookies.getAll()
  //       },
  //       setAll(cookiesToSet) {
  //         cookiesToSet.forEach(({ name, value, options }) =>
  //           response.cookies.set(name, value, options)
  //         )
  //       },
  //     },
  //   }
  // )
  //
  // const {
  //   data: { user },
  // } = await supabase.auth.getUser()
  //
  // if (!user && !isPublicPath) {
  //   return NextResponse.redirect(new URL('/login', request.url))
  // }
  // if (user && isLoginPage) {
  //   return NextResponse.redirect(new URL('/overview', request.url))
  // }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
