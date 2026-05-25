'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

/**
 * Email Confirmation Callback Page
 * Menggunakan Vanilla JS URLSearchParams untuk mem-bypass error prerender Next.js
 *
 * @location apps/web/src/app/(auth)/auth/callback/page.tsx
 */
export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState('Confirming your email...')

  useEffect(() => {
    // Guard clause agar kode ini TIDAK dijalankan saat proses build Vercel (SSR)
    if (typeof window === 'undefined') return

    // BACA URL SECARA MANUAL
    // Ini mengelabui Next.js compiler agar tidak error saat prerendering
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const error = params.get('error')
    const errorDescription = params.get('error_description')

    const verifyEmail = async () => {
      // Handle error case
      if (error || errorDescription) {
        console.error('Email confirmation error:', error, errorDescription)
        router.push(
          `/register?error=${encodeURIComponent(errorDescription || error || 'Confirmation failed')}`
        )
        return
      }

      // Handle success case
      if (code) {
        setStatus('Securing your session...')
        try {
          const supabase = createClient()
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

          if (exchangeError) {
            console.error('Error exchanging code:', exchangeError)
            router.push(`/register?error=${encodeURIComponent(exchangeError.message)}`)
            return
          }

          // Sukses - arahkan ke overview
          router.push('/overview')
        } catch (err) {
          console.error('Callback error:', err)
          router.push('/register?error=An error occurred during confirmation')
        }
      } else {
        router.push('/register?error=No confirmation code provided')
      }
    }

    verifyEmail()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-100 to-slate-200">
      <div className="text-center">
        <div className="mb-4 inline-block">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600"></div>
        </div>
        <p className="text-lg font-semibold text-slate-700">{status}</p>
        <p className="mt-2 text-sm text-slate-600">Please wait while we redirect you.</p>
      </div>
    </div>
  )
}
