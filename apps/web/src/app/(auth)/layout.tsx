import React from 'react'

/**
 * Layout untuk halaman autentikasi (login, dsb.)
 * Tidak menggunakan sidebar/dashboard shell.
 *
 * @location apps/web/src/app/(auth)/layout.tsx
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main className="flex min-h-screen w-full bg-white">{children}</main>
}
