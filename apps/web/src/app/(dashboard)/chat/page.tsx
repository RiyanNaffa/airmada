/**
 * Data Analyst Chat Page
 *
 * @location apps/web/src/app/(dashboard)/chat/page.tsx
 * Halaman Data Analyst dengan modal layout.
 */
'use client'

import { DataAnalystChat } from '@/components/ai/DataAnalystChat'

export default function ChatPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900/50 p-4">
      <DataAnalystChat />
    </div>
  )
}
