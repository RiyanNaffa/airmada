/**
 * Legacy AI Chat Page (Redirect to /chat)
 *
 * @location apps/web/src/app/(dashboard)/ai-chat/page.tsx
 * This page is kept for backward compatibility
 * Main Data Analyst page is now at /chat
 */
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AiChatPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to new chat route
    router.replace('/chat')
  }, [router])

  return (
    <div className="flex items-center justify-center p-4">
      <div className="text-center">
        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-orange-400"></div>
        <p className="text-gray-600">Redirecting to Data Analyst...</p>
      </div>
    </div>
  )
}
