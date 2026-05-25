'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  usePathname,
  // useRouter
} from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'
import {
  LayoutDashboard,
  Truck,
  Users,
  Package,
  MapPin,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronRight,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { Route } from 'next'
// import { DUMMY_USERS, type DummyUser } from '@/mocks'

// ─── Tipe ────────────────────────────────────────────────────────────────────
interface NavItem {
  label: string
  href: Route
  icon: React.ReactNode
}

interface CurrentUser {
  initials: string
  full_name: string
  role: string
}

// ─── Data navigasi ────────────────────────────────────────────────────────────
const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/overview', icon: <LayoutDashboard size={18} /> },
  { label: 'Data Analyst', href: '/chat', icon: <Sparkles size={18} /> },
  { label: 'Fleet', href: '/fleet', icon: <Truck size={18} /> },
  { label: 'Personnel', href: '/drivers', icon: <Users size={18} /> },
  { label: 'Shipments', href: '/shipments', icon: <Package size={18} /> },
  { label: 'Live Routes', href: '/routes', icon: <MapPin size={18} /> },
]

const NavItemsDispatchers: NavItem[] = [
  { label: 'Dashboard', href: '/overview', icon: <LayoutDashboard size={18} /> },
  { label: 'Fleet', href: '/dispatch/fleet', icon: <Truck size={18} /> },
  { label: 'Driver', href: '/dispatch/drivers', icon: <Users size={18} /> },
  { label: 'Shipments', href: '/dispatch/shipments', icon: <Package size={18} /> },
  { label: 'Assign', href: '/dispatch/assign', icon: <ArrowRight size={18} /> },
  { label: 'Live Routes', href: '/routes', icon: <MapPin size={18} /> },
]

const NavItemsDrivers: NavItem[] = [
  { label: 'Dashboard', href: '/overview', icon: <LayoutDashboard size={18} /> },
  // { label: 'Data Analyst', href: '/chat', icon: <Sparkles size={18} /> },
  { label: 'Packages', href: '/packages', icon: <Package size={18} /> },
  { label: 'Vehicles', href: '/vehicles', icon: <Truck size={18} /> },
  { label: 'Maps', href: '/maps', icon: <MapPin size={18} /> },
]

// ─── Get current logged-in user from sessionStorage ───────────────────────────
function getCurrentUser(): CurrentUser {
  if (typeof window === 'undefined') {
    return { initials: 'UU', full_name: 'Unknown User', role: 'Unknown' }
  }

  const sessionData = sessionStorage.getItem('user_session')
  if (sessionData) {
    try {
      const session = JSON.parse(sessionData)
      const user = session.user
      const initials =
        user.short_name?.substring(0, 2).toUpperCase() ||
        user.full_name?.substring(0, 2).toUpperCase() ||
        'UU'
      return {
        initials,
        full_name: user.full_name || 'Unknown User',
        role: user.role || 'Unknown',
      }
    } catch (error) {
      console.error('Failed to parse user session:', error)
    }
  }

  return { initials: 'UU', full_name: 'Unknown User', role: 'Unknown' }
}

// ─── Get navigation items based on user role ──────────────────────────────────
function getNavItemsByRole(role: string): NavItem[] {
  if (role?.toUpperCase() === 'MANAGER') {
    return navItems
  }
  if (role?.toUpperCase() === 'DRIVER') {
    return NavItemsDrivers
  }
  if (role?.toUpperCase() === 'DISPATCHER') {
    return NavItemsDispatchers
  }
  return navItems
}

// ─── Sidebar Item ─────────────────────────────────────────────────────────────
function NavLink({
  item,
  active,
  onClick,
}: {
  item: NavItem
  active: boolean
  onClick: () => void
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={[
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
        'group transition-all duration-150',
        active ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white',
      ].join(' ')}
    >
      <span
        className={[
          'shrink-0 transition-colors duration-150',
          active ? 'text-orange-400' : 'text-slate-500 group-hover:text-slate-300',
        ].join(' ')}
      >
        {item.icon}
      </span>
      {item.label}
      {active && <ChevronRight size={14} className="ml-auto text-orange-400" />}
    </Link>
  )
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function Sidebar({
  open,
  onClose,
  currentUser,
  onLogout,
}: {
  open: boolean
  onClose: () => void
  currentUser: CurrentUser
  onLogout: () => void
}) {
  const pathname = usePathname()
  // TODO: uncomment router once used
  // const router = useRouter()

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-30 flex w-60 flex-col',
          'border-r border-white/5 bg-[#0f172a]',
          'transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full',
          'lg:relative lg:translate-x-0',
        ].join(' ')}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/5 px-4">
          {/* TODO: Ganti <div> ini dengan <Image> dari /public/icons/logo.png */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-500/30">
            <Truck size={18} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold tracking-wide text-white">aiRMADA</p>
            <p className="text-[10px] leading-tight text-slate-500">Fleet Management System</p>
          </div>
          {/* Close button mobile */}
          <button
            onClick={onClose}
            className="ml-auto text-slate-500 transition-colors hover:text-white lg:hidden"
            aria-label="Tutup sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {getNavItemsByRole(currentUser.role).map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={pathname.startsWith(item.href)}
              onClick={() => {
                if (window.innerWidth < 1024) onClose()
              }}
            />
          ))}
        </nav>

        {/* User + Logout */}
        <div className="space-y-1 border-t border-white/5 px-3 pt-4 pb-4">
          <Link
            href="/profile"
            className={[
              'group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors',
              pathname === '/profile'
                ? 'bg-white/10 text-white'
                : 'text-slate-400 hover:bg-white/5 hover:text-white',
            ].join(' ')}
          >
            {/* TODO: Ganti <div> ini dengan <Image> dari avatar_url user */}
            <div
              // className={[
              //   'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-orange-400 to-orange-600 text-xs font-bold text-white shadow-md',
              //   pathname === '/profile'
              //     ? 'ring-2 ring-orange-400'
              //     : 'group-hover:ring-2 group-hover:ring-orange-400',
              // ].join(' ')}
              className="flex flex-col items-start gap-6 sm:flex-row sm:items-center"
            >
              {/* {currentUser.initials} */}
              <Image
                src="/dummy/doctor.jpg"
                alt={currentUser.full_name}
                width={80}
                height={80}
                className="h-8 w-8 shrink-0 rounded-full object-cover shadow-lg"
              />
            </div>
            <div className="min-w-0">
              <p
                className={[
                  'truncate text-xs font-semibold',
                  pathname === '/profile' ? 'text-white' : 'text-white group-hover:text-orange-400',
                ].join(' ')}
              >
                {currentUser.full_name}
              </p>
              <p
                className={[
                  'text-[10px]',
                  pathname === '/profile' ? 'text-orange-400' : 'text-slate-500',
                ].join(' ')}
              >
                {currentUser.role}
              </p>
            </div>
            {pathname === '/profile' && (
              <ChevronRight size={14} className="ml-auto text-orange-400" />
            )}
          </Link>
          <button
            className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-all duration-150 hover:bg-white/5 hover:text-red-400"
            onClick={() => {
              onLogout()
            }}
          >
            <LogOut size={16} className="shrink-0 transition-colors group-hover:text-red-400" />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}

// ─── Topbar ───────────────────────────────────────────────────────────────────

function Topbar({
  onMenuClick,
  pageTitle,
  currentUser,
}: {
  onMenuClick: () => void
  pageTitle: string
  currentUser: CurrentUser
}) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 lg:hidden"
          aria-label="Buka menu"
        >
          <Menu size={20} />
        </button>
        <span className="text-sm font-semibold text-slate-700 lg:hidden">{pageTitle}</span>
      </div>

      <div className="flex items-center gap-2">
        {/* TODO: Hubungkan ke useNotificationStore dan tampilkan unread_count */}
        <button className="relative rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700">
          <Bell size={18} />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-orange-500" />
        </button>
        {/* Current user avatar */}
        {/* TODO: Jika klik avatar, tampilkan current user card, ada ref ke /profile */}
        <div
          // className="flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-br from-orange-400 to-orange-600 text-xs font-bold text-white"
          className="flex flex-col items-start gap-6 sm:flex-row sm:items-center"
        >
          {/* {currentUser.initials} */}
          <Image
            src="/dummy/doctor.jpg"
            alt={currentUser.full_name}
            width={80}
            height={80}
            className="h-7 w-7 shrink-0 rounded-full object-cover shadow-lg"
          />
        </div>
      </div>
    </header>
  )
}

// ─── Layout utama ─────────────────────────────────────────────────────────────

/**
 * Layout utama dashboard — shell dengan Sidebar + Topbar.
 *
 * @location apps/web/src/app/(dashboard)/layout.tsx
 * TODO: Tambahkan <Sidebar /> dan <Topbar /> dari components/layout
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<CurrentUser>({
    initials: 'AN',
    full_name: 'Andi Wijaya',
    role: 'Manager',
  })
  const pathname = usePathname()
  const { logout, isLoading } = useAuth()

  // Get current user on mount
  useEffect(() => {
    setCurrentUser(getCurrentUser())
  }, [])

  // Tutup sidebar saat navigasi (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  // Tutup sidebar saat resize ke desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Periksa session di level layout (double check)
  const [hasValidSession, setHasValidSession] = useState(false)

  useEffect(() => {
    const userSession = sessionStorage.getItem('user_session')
    setHasValidSession(!!userSession)
  }, [])

  // Tampilkan loading state saat memeriksa autentikasi
  // Jangan render dashboard children sampai auth verification selesai
  if (isLoading || !hasValidSession) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-orange-400"></div>
          <p className="mt-4 text-gray-600">Memverifikasi akses Anda...</p>
        </div>
      </div>
    )
  }

  const navItemsByRole = getNavItemsByRole(currentUser.role)
  const currentPage = navItemsByRole.find((item) => pathname.startsWith(item.href))
  const pageTitle = currentPage?.label ?? 'Dashboard'

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentUser={currentUser}
        onLogout={logout}
      />

      {/* Konten utama */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          pageTitle={pageTitle}
          currentUser={currentUser}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
