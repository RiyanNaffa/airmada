'use client'

import { useState, useEffect } from 'react'
import { Route } from 'next'
import Link from 'next/link'
import { ChevronRight, Search, Filter, MapPin, Clock, AlertCircle } from 'lucide-react'
import { Shipment, ShipmentStatus, ShipmentPriority } from '@/types'
import { useUserProfile } from '@/hooks/useUserProfile'

/**
 * Halaman list paket yang harus dikirim
 * @location apps/web/src/app/(dashboard)/packages/page.tsx
 */

const statusConfig: Record<ShipmentStatus, { color: string; label: string; badge: string }> = {
  PENDING: { color: 'text-gray-700', label: 'Pending', badge: 'bg-gray-100 text-gray-800' },
  ASSIGNED: { color: 'text-blue-700', label: 'Assigned', badge: 'bg-blue-100 text-blue-800' },
  PICKED_UP: {
    color: 'text-yellow-700',
    label: 'Picked Up',
    badge: 'bg-yellow-100 text-yellow-800',
  },
  IN_TRANSIT: {
    color: 'text-orange-700',
    label: 'In Transit',
    badge: 'bg-orange-100 text-orange-800',
  },
  DELIVERED: { color: 'text-green-700', label: 'Delivered', badge: 'bg-green-100 text-green-800' },
  FAILED: { color: 'text-red-700', label: 'Failed', badge: 'bg-red-100 text-red-800' },
  RETURNED: { color: 'text-purple-700', label: 'Returned', badge: 'bg-purple-100 text-purple-800' },
}

const priorityConfig: Record<ShipmentPriority, { color: string; label: string }> = {
  REGULAR: { color: 'text-slate-500', label: 'Regular' },
  EXPRESS: { color: 'text-orange-600', label: 'Express' },
  SAME_DAY: { color: 'text-red-600', label: 'Same Day' },
  CARGO: { color: 'text-indigo-600', label: 'Cargo' },
  ECONOMY: { color: 'text-gray-600', label: 'Economy' },
}

type FilterStatus = ShipmentStatus | 'all'

export default function PackagesPage() {
  const [packages, setPackages] = useState<Shipment[]>([])
  const [filteredPackages, setFilteredPackages] = useState<Shipment[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [loading, setLoading] = useState(false)

  const { user, loading: isProfileLoading } = useUserProfile()

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // JANGAN lakukan fetch jika profil masih loading atau ID user belum tersedia
    if (isProfileLoading || !user?.user?.id) {
      return
    }

    let isMounted = true

    const fetchPackages = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/shipments/drivers/${user.user.id}`)
        if (!response.ok) throw new Error('Failed to fetch packages')

        const data = await response.json()
        if (isMounted) {
          setPackages(data)
        }
      } catch (error) {
        console.error('Error fetching packages:', error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchPackages()

    // Fungsi cleanup untuk mencegah balapan data (race condition)
    return () => {
      isMounted = false
    }
  }, [user?.user?.id, isProfileLoading])

  // Filter packages berdasarkan search dan status
  useEffect(() => {
    let result = packages

    if (searchQuery) {
      result = result.filter(
        (pkg) =>
          pkg.tracking_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pkg.recipient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pkg.recipient_address.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (filterStatus !== 'all') {
      result = result.filter((pkg) => pkg.status === filterStatus)
    }

    setFilteredPackages(result)
  }, [searchQuery, filterStatus, packages])

  const stats = {
    total: packages.length,
    delivered: packages.filter((p) => p.status === 'DELIVERED').length,
    in_transit: packages.filter((p) => p.status === 'IN_TRANSIT').length,
    pending: packages.filter((p) => p.status === 'PENDING').length,
    failed: packages.filter((p) => p.status === 'FAILED').length,
  }

  if (isProfileLoading || loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-orange-400"></div>
          <p className="mt-2 text-sm text-gray-600">Loading packages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Packages</h1>
        <p className="mt-1 text-slate-600">Manage and track your delivery packages</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-xs text-slate-600">Total</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
          <p className="text-xs text-orange-700">In Transit</p>
          <p className="mt-1 text-2xl font-bold text-orange-900">{stats.in_transit}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <p className="text-xs text-gray-700">Pending</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{stats.pending}</p>
        </div>
        <div className="rounded-lg border border-green-200 bg-green-50 p-3">
          <p className="text-xs text-green-700">Delivered</p>
          <p className="mt-1 text-2xl font-bold text-green-900">{stats.delivered}</p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-xs text-red-700">Failed</p>
          <p className="mt-1 text-2xl font-bold text-red-900">{stats.failed}</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search tracking code, recipient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pr-4 pl-10 text-sm transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
            />
          </div>

          {/* Filter Status */}
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="pickup">Pickup</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="failed">Failed</option>
              <option value="returned">Returned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Packages Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">
                Tracking Code
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">
                Recipient
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Priority</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">
                Weight / Volume
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">ETA</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredPackages.map((pkg) => {
              const status = statusConfig[pkg.status]
              const priority = priorityConfig[pkg.priority]
              const isOverdue =
                pkg.estimated_delivery &&
                new Date(pkg.estimated_delivery) < new Date() &&
                pkg.status !== 'DELIVERED' &&
                pkg.status !== 'FAILED'

              return (
                <tr
                  key={pkg.id}
                  className="border-b border-slate-100 transition-colors hover:bg-slate-50"
                >
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-900">{pkg.tracking_code}</p>
                    <p className="mt-1 text-xs text-slate-500">{pkg.id}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-slate-900">{pkg.recipient_name}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin size={12} />
                      {pkg.recipient_address.substring(0, 30)}...
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${status.badge}`}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-xs font-semibold ${priority.color}`}>
                      {priority.label}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-medium text-slate-900">
                      {pkg.weight_kg} kg / {pkg.volume_m3} m³
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      <Clock size={14} className={isOverdue ? 'text-red-500' : 'text-slate-400'} />
                      <span
                        className={`text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-slate-700'}`}
                      >
                        {new Date(pkg.estimated_delivery!).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <Link
                      href={`/packages/${pkg.id}` as Route}
                      className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-orange-600 transition-colors hover:bg-orange-50"
                    >
                      View
                      <ChevronRight size={16} />
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredPackages.length === 0 && (
        <div className="rounded-lg bg-slate-50 p-12 text-center">
          <AlertCircle className="mx-auto text-slate-400" size={32} />
          <p className="mt-3 text-slate-600">No packages found</p>
          {searchQuery && <p className="text-sm text-slate-500">Try a different search term</p>}
        </div>
      )}
    </div>
  )
}
