'use client'

import { useState } from 'react'
import { Route } from 'next'
import Link from 'next/link'
import { Truck, AlertTriangle, Wrench, Zap, Gauge, ChevronRight, Search } from 'lucide-react'
import { Vehicle, VehicleStatus } from '@/types'

// Mock data untuk kendaraan
const mockVehicles: Record<string, Vehicle> = {
  '1': {
    id: '1',
    plate_number: 'B 1234 ABC',
    type: 'VAN',
    status: 'ACTIVE',
    fuel_type: 'DIESEL',
    capacity_kg: 2000,
    capacity_m3: 15,
    last_maintenance: '2026-02-15',
    // driver_id: 'driver-1',
    year: 2022,
    created_at: '2025-06-01',
    updated_at: '2025-12-01',
  },
  '2': {
    id: '2',
    plate_number: 'B 5678 DEF',
    type: 'PICKUP',
    status: 'IDLE',
    fuel_type: 'GAS',
    capacity_kg: 1500,
    capacity_m3: 10,
    last_maintenance: '2026-03-20',
    // driver_id: 'driver-1',
    year: 2021,
    created_at: '2024-10-15',
    updated_at: '2025-11-20',
  },
  '3': {
    id: '3',
    plate_number: 'B 9012 GHI',
    type: 'MOTOR',
    status: 'MAINTENANCE',
    fuel_type: 'GAS',
    capacity_kg: 200,
    capacity_m3: 0.5,
    last_maintenance: '2026-01-10',
    // driver_id: 'driver-1',
    year: 2020,
    created_at: '2023-12-01',
    updated_at: '2025-12-10',
  },
}

// Status color mapping
function getStatusConfig(status: VehicleStatus) {
  const config: Record<VehicleStatus, { bg: string; text: string; label: string }> = {
    ACTIVE: { bg: 'bg-green-50', text: 'text-green-700', label: 'Aktif' },
    IDLE: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Idle' },
    MAINTENANCE: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Perawatan' },
    BROKEN_EN_ROUTE: { bg: 'bg-red-50', text: 'text-red-700', label: 'Rusak' },
    OFFLINE: { bg: 'bg-gray-50', text: 'text-gray-700', label: 'Offline' },
  }
  return config[status]
}

// Vehicle type icon
// function getVehicleIcon(type: VehicleType) {
//   const iconClass = 'w-5 h-5'
//   const iconProps = { size: 20 }
//   switch (type) {
//     case 'VAN':
//       return <Truck {...iconProps} />
//     case 'PICKUP':
//       return <Truck {...iconProps} />
//     case 'MOTOR':
//       return <Truck {...iconProps} />
//     default:
//       return <Truck {...iconProps} />
//   }
// }

// Days since maintenance
function getDaysSince(dateString: string): number {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

// Vehicle card component
function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const statusConfig = getStatusConfig(vehicle.status)
  const maintenanceDate = vehicle.last_maintenance ? new Date(vehicle.last_maintenance) : new Date()
  const daysSinceMaintenance = getDaysSince(maintenanceDate.toISOString().split('T')[0])
  const needsMaintenance = daysSinceMaintenance > 60

  return (
    <Link href={`/vehicles/${vehicle.id}` as Route}>
      <div className="group h-full rounded-lg border border-gray-200 bg-white p-6 transition-all duration-300 hover:border-orange-300 hover:shadow-lg">
        {/* Header dengan plate dan status */}
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900">{vehicle.plate_number}</p>
            <p className="text-sm text-gray-500">{vehicle.type}</p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}
          >
            <span className="h-2 w-2 rounded-full bg-current" />
            {statusConfig.label}
          </span>
        </div>

        {/* Alert jika butuh maintenance */}
        {needsMaintenance && (
          <div className="mb-4 flex items-center gap-2 rounded-md bg-yellow-50 px-3 py-2">
            <AlertTriangle size={16} className="text-yellow-600" />
            <span className="text-xs text-yellow-700">Perawatan diperlukan</span>
          </div>
        )}

        {/* Stats grid */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          {/* Fuel type */}
          <div className="rounded-lg bg-gray-50 p-3">
            <div className="mb-1 flex items-center gap-2">
              <Zap size={14} className="text-gray-500" />
              <span className="text-xs text-gray-500">Bahan Bakar</span>
            </div>
            <p className="text-sm font-semibold text-gray-900">{vehicle.fuel_type}</p>
          </div>

          {/* Capacity */}
          <div className="rounded-lg bg-gray-50 p-3">
            <div className="mb-1 flex items-center gap-2">
              <Gauge size={14} className="text-gray-500" />
              <span className="text-xs text-gray-500">Kapasitas</span>
            </div>
            <p className="text-sm font-semibold text-gray-900">
              {vehicle.capacity_kg.toLocaleString()} kg
            </p>
          </div>

          {/* Maintenance */}
          <div className="rounded-lg bg-gray-50 p-3">
            <div className="mb-1 flex items-center gap-2">
              <Wrench size={14} className="text-gray-500" />
              <span className="text-xs text-gray-500">Perawatan</span>
            </div>
            <p className="text-sm font-semibold text-gray-900">{daysSinceMaintenance} hari lalu</p>
          </div>
        </div>

        {/* Footer dengan view button */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <span className="text-xs text-gray-500">
            Ditambahkan {new Date(vehicle.created_at).toLocaleDateString('id-ID')}
          </span>
          <ChevronRight
            size={16}
            className="text-orange-500 transition-transform group-hover:translate-x-1"
          />
        </div>
      </div>
    </Link>
  )
}

export default function VehiclesPage() {
  const [vehicles, _setVehicles] = useState<Record<string, Vehicle>>(mockVehicles)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | 'all'>('all')

  // Filter vehicles
  const filteredVehicles = Object.values(vehicles).filter((vehicle) => {
    const matchesSearch =
      vehicle.plate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Stats
  const activeCount = Object.values(vehicles).filter((v) => v.status === 'ACTIVE').length
  //   const maintenanceCount = Object.values(vehicles).filter((v) => v.status === 'MAINTENANCE').length
  const totalCapacity = Object.values(vehicles).reduce((sum, v) => sum + v.capacity_kg, 0)

  return (
    <div className="space-y-6 bg-white p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kendaraan</h1>
          <p className="mt-1 text-sm text-gray-500">Kelola armada kendaraan Anda</p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-blue-100/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Kendaraan</p>
              <p className="text-2xl font-bold text-gray-900">{Object.keys(vehicles).length}</p>
            </div>
            <Truck className="text-blue-600" size={32} />
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-green-50 to-green-100/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Kendaraan Aktif</p>
              <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600/20">
              <span className="h-2 w-2 rounded-full bg-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-orange-50 to-orange-100/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Kapasitas Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalCapacity.toLocaleString()} kg
              </p>
            </div>
            <Gauge className="text-orange-600" size={32} />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-2">
        <div className="relative flex-1">
          <Search size={18} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari plat nomor atau tipe kendaraan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2.5 pr-4 pl-10 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as VehicleStatus | 'all')}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
        >
          <option value="all">Semua Status</option>
          <option value="ACTIVE">Aktif</option>
          <option value="IDLE">Idle</option>
          <option value="MAINTENANCE">Perawatan</option>
          <option value="BROKEN_EN_ROUTE">Rusak</option>
          <option value="OFFLINE">Offline</option>
        </select>
      </div>

      {/* Vehicle cards grid */}
      {filteredVehicles.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredVehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
          <Truck size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">Tidak ada kendaraan ditemukan</h3>
          <p className="text-sm text-gray-600">Coba ubah filter atau cari dengan kata kunci lain</p>
        </div>
      )}
    </div>
  )
}
