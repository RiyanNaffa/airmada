'use client'

import { Route } from 'next'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { EmailConfirmationModal } from '@/components/auth/EmailConfirmationModal'

/**
 * Halaman Register
 *
 * @location apps/web/src/app/(auth)/register/page.tsx
 * Implementasi form register dengan Supabase Auth dan email confirmation
 */
function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    cellPhone: '',
  })
  const [error, setError] = useState(searchParams.get('error') || '')
  const [isLoading, setIsLoading] = useState(false)
  const [showEmailConfirmationModal, setShowEmailConfirmationModal] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Call register API endpoint
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          cellPhone: formData.cellPhone,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Registration failed')
        setIsLoading(false)
        return
      }

      // Check if email confirmation is required
      if (data.requiresEmailConfirmation) {
        // Show email confirmation modal
        setRegisteredEmail(data.email)
        setShowEmailConfirmationModal(true)
        setIsLoading(false)
        return
      }

      // Store user session in sessionStorage (if no confirmation required)
      sessionStorage.setItem(
        'user_session',
        JSON.stringify({
          user: data.user,
          email: data.email,
          registeredAt: data.registeredAt,
        })
      )

      // Redirect to overview after brief delay (if no confirmation required)
      setTimeout(() => {
        router.push('/overview')
      }, 500)
    } catch (err) {
      console.error('Register error:', err)
      setError('An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* KIRI: Hero Section (Disembunyikan di layar kecil) */}
      <div className="relative hidden flex-col justify-center overflow-hidden px-16 py-12 text-white lg:flex lg:w-1/2">
        {/* DUMMY BACKGROUND */}
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
            Join Our Fleet,
            <br />
            Grow Your Business
          </h2>

          <p className="mb-10 max-w-md text-lg leading-relaxed text-gray-300">
            Get started with aiRMADA and unlock advanced fleet management capabilities for your
            logistics operations.
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
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Secure & Reliable</span>
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
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <span>Easy Setup</span>
            </div>
          </div>
        </div>
      </div>

      {/* KANAN: Form Register */}
      <div className="flex w-full items-center justify-center bg-white p-8 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="mb-2 text-3xl font-bold text-gray-900">Create Account</h2>
            <p className="text-gray-500">Sign up to get started with aiRMADA</p>
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

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full Name Field */}
            <div className="space-y-2">
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-gray-900 transition-colors focus:border-transparent focus:ring-2 focus:ring-[#1e293b] focus:outline-none"
                required
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@airmada.id"
                className="w-full rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-gray-900 transition-colors focus:border-transparent focus:ring-2 focus:ring-[#1e293b] focus:outline-none"
                required
              />
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <label htmlFor="cellPhone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                id="cellPhone"
                name="cellPhone"
                type="tel"
                value={formData.cellPhone}
                onChange={handleChange}
                placeholder="+62 812 3456 7890"
                className="w-full rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-gray-900 transition-colors focus:border-transparent focus:ring-2 focus:ring-[#1e293b] focus:outline-none"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-gray-900 transition-colors focus:border-transparent focus:ring-2 focus:ring-[#1e293b] focus:outline-none"
                required
              />
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-gray-900 transition-colors focus:border-transparent focus:ring-2 focus:ring-[#1e293b] focus:outline-none"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 w-full rounded-lg bg-[#1e293b] py-3 font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                href={'/login' as Route}
                className="font-semibold text-[#1e293b] hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>

          {/* Terms */}
          <div className="mt-6 text-center text-xs text-gray-500">
            <p>
              By creating an account, you agree to our{' '}
              <Link href="/" className="hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/" className="hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Email Confirmation Modal */}
      <EmailConfirmationModal
        isOpen={showEmailConfirmationModal}
        email={registeredEmail}
        onClose={() => {
          setShowEmailConfirmationModal(false)
          router.push('/login')
        }}
      />
    </div>
  )
}

export default function RegisterPage() {
  return (
    // Fallback UI (kosong juga boleh, atau spinner sederhana)
    <Suspense fallback={<div>Loading form...</div>}>
      <RegisterContent />
    </Suspense>
  )
}
