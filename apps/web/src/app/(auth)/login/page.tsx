'use client'

import { Route } from 'next'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { User } from '@airmada/types'
import { DUMMY_USERS, type DummyUser } from '@airmada/mocks'

/**
 * Halaman Login
 *
 * @location apps/web/src/app/(auth)/login/page.tsx
 * TODO: Implementasi form login dengan Supabase Auth
 */
export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')

  // Auto-fill email jika "Remember Me" pernah diklik sebelumnya
  useEffect(() => {
    const savedEmail = localStorage.getItem('remembered_email')
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [])

  const handleQuickLogin = (user: DummyUser) => {
    setEmail(user.email)
    setPassword(user.password)
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    try {
      // Call API endpoint untuk login
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Login failed. Please try again.')
        return
      }

      // Simpan session data ke sessionStorage
      const sessionData = JSON.stringify({
        user: data.user as User,
        email: data.email,
        loginTime: data.loginTime,
      })
      sessionStorage.setItem('user_session', sessionData)

      // Tangani Remember Me
      if (rememberMe) {
        localStorage.setItem('remembered_email', email)
      } else {
        localStorage.removeItem('remembered_email')
      }

      // Arahkan ke Dashboard dengan delay kecil untuk memastikan session sudah tersimpan
      setTimeout(() => {
        router.push('/overview')
      }, 100)
    } catch (err) {
      console.error('Login error:', err)
      setError('An error occurred. Please try again.')
    }
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* KIRI: Hero Section (Disembunyikan di layar kecil) */}
      <div className="relative hidden flex-col justify-center overflow-hidden px-16 py-12 text-white lg:flex lg:w-1/2">
        {/* DUMMY BACKGROUND: Ganti src ini nantinya */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/login/image_logistics.png"
            alt="Logistics Background"
            fill
            className="object-cover"
            priority
          />
          {/* Overlay biru gelap untuk kontras teks */}
          <div className="absolute inset-0 bg-[#1e293b]/80 mix-blend-multiply"></div>
        </div>

        {/* Konten Kiri */}
        <div className="relative z-10 max-w-lg">
          {/* Logo Brand */}
          <div className="mb-12 flex items-center gap-3">
            <div className="rounded-xl bg-[#f97316] p-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">aiRMADA</h1>
              <p className="text-xs font-medium text-gray-300">AI-Powered Fleet Management</p>
            </div>
          </div>

          <h2 className="mb-6 text-5xl leading-tight font-bold">
            Smart Logistics,
            <br />
            Smarter Routes
          </h2>

          <p className="mb-10 max-w-md text-lg leading-relaxed text-gray-300">
            Optimize your fleet operations with AI-driven route planning, real-time tracking, and
            comprehensive analytics.
          </p>

          {/* Badges */}
          <div className="flex items-center gap-6 text-sm font-medium">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#f97316"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="16" height="16" x="4" y="4" rx="2" />
                <rect width="6" height="6" x="9" y="9" rx="1" />
                <path d="M15 2v2" />
                <path d="M15 20v2" />
                <path d="M2 15h2" />
                <path d="M2 9h2" />
                <path d="M20 15h2" />
                <path d="M20 9h2" />
                <path d="M9 2v2" />
                <path d="M9 20v2" />
              </svg>
              <span>500+ Vehicles Managed</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#f97316"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v8" />
                <path d="m4.93 10.93 1.41 1.41" />
                <path d="M2 18h2" />
                <path d="M20 18h2" />
                <path d="m19.07 10.93-1.41 1.41" />
                <path d="M22 22H2" />
                <path d="m16 6-4 4-4-4" />
              </svg>
              <span>AI-Optimized Routes</span>
            </div>
          </div>
        </div>
      </div>

      {/* KANAN: Form Login */}
      <div className="flex w-full items-center justify-center bg-white p-8 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="mb-2 text-3xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-500">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-3 border-l-4 border-red-500 bg-red-50 p-4 text-red-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@airmada.id"
                className="w-full rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-gray-900 transition-colors focus:border-transparent focus:ring-2 focus:ring-[#1e293b] focus:outline-none"
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-gray-900 transition-colors focus:border-transparent focus:ring-2 focus:ring-[#1e293b] focus:outline-none"
                required
              />
            </div>

            {/* Options */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[#1e293b] focus:ring-[#1e293b]"
                />
                <span className="font-medium text-gray-600">Remember me</span>
              </label>
              <Link
                href={'/forgot-password' as Route}
                className="font-semibold text-[#1e293b] hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="mt-2 w-full rounded-lg bg-[#1e293b] py-3 font-medium text-white transition-colors hover:bg-slate-800"
            >
              Sign In
            </button>
          </form>

          {/* Demo Credentials Box */}
          <div className="mt-8 rounded-xl border border-gray-100 bg-gray-50 p-5">
            <p className="mb-3 text-sm font-semibold tracking-wider text-gray-700 uppercase">
              Quick Demo Access:
            </p>
            <div className="grid gap-2">
              {DUMMY_USERS.map((user) => {
                const getRoleBadgeStyle = (role: string) => {
                  switch (role) {
                    case 'MANAGER':
                      return 'bg-purple-100 text-purple-700'
                    case 'DRIVER':
                      return 'bg-blue-100 text-blue-700'
                    case 'DISPATCHER':
                      return 'bg-orange-100 text-orange-700'
                    default:
                      return 'bg-slate-100 text-slate-600'
                  }
                }

                const getRoleIcon = (role: string) => {
                  switch (role) {
                    case 'MANAGER':
                      return '📊'
                    case 'DRIVER':
                      return '🚚'
                    case 'DISPATCHER':
                      return '📡'
                    default:
                      return '👤'
                  }
                }

                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleQuickLogin(user)}
                    className="group flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 text-left transition-all hover:-translate-y-0.5 hover:border-[#1e293b] hover:shadow-md"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900">{user.short_name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <span
                      className={`ml-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${getRoleBadgeStyle(
                        user.role
                      )}`}
                    >
                      <span>{getRoleIcon(user.role)}</span>
                      <span>{user.role}</span>
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Role Information */}
            {/* <div className="mt-4 space-y-2 border-t border-gray-200 pt-4">
              <p className="text-xs font-semibold text-gray-600">Role Descriptions:</p>
              <div className="grid gap-2">
                <div className="flex gap-2">
                  <span className="text-xs">📊</span>
                  <span className="text-xs text-gray-600">
                    <strong>Manager:</strong> Fleet management & financial overview
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs">🚚</span>
                  <span className="text-xs text-gray-600">
                    <strong>Driver:</strong> Active deliveries & earnings tracking
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs">📡</span>
                  <span className="text-xs text-gray-600">
                    <strong>Dispatcher:</strong> Route optimization & dispatch management
                  </span>
                </div>
              </div>
            </div> */}
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                href={'/register' as Route}
                className="font-semibold text-[#1e293b] hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
