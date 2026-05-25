'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Truck,
  AlertTriangle,
  Wrench,
  Zap,
  Calendar,
  Gauge,
  MapPin,
  MoreVertical,
  Edit,
  Trash2,
  PrinterIcon,
} from 'lucide-react'
import { Vehicle, VehicleStatus } from '@/types'

// Mock vehicle details
const mockVehicleDetails: Record<string, Vehicle> = {
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

// Status config
function getStatusConfig(status: VehicleStatus) {
  const config: Record<VehicleStatus, { bg: string; text: string; label: string; icon: string }> = {
    ACTIVE: { bg: 'bg-green-50', text: 'text-green-700', label: 'Aktif', icon: '✓' },
    IDLE: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Idle', icon: '◯' },
    MAINTENANCE: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Perawatan', icon: '⚙' },
    BROKEN_EN_ROUTE: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      label: 'Rusak',
      icon: '⚠',
    },
    OFFLINE: { bg: 'bg-gray-50', text: 'text-gray-700', label: 'Offline', icon: '○' },
  }
  return config[status]
}

// Get days since date
function getDaysSince(dateString: string): number {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export default function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [showMenu, setShowMenu] = useState(false)
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)

  // Simulate fetching vehicle data
  useEffect(() => {
    const id = params.then((p) => p.id)
    id.then((vehicleId) => {
      const vehicleData = mockVehicleDetails[vehicleId]
      if (vehicleData) {
        setVehicle(vehicleData)
      }
      setLoading(false)
    })
  }, [params])

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-orange-400"></div>
          <p className="mt-4 text-gray-600">Memuat data kendaraan...</p>
        </div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="space-y-4 p-6">
        <Link
          href="/vehicles"
          className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700"
        >
          <ArrowLeft size={18} />
          Kembali ke Kendaraan
        </Link>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
          <Truck size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">Kendaraan tidak ditemukan</h3>
          <p className="mt-2 text-sm text-gray-600">
            Kendaraan yang Anda cari tidak ada dalam sistem
          </p>
        </div>
      </div>
    )
  }

  const statusConfig = getStatusConfig(vehicle.status)
  //   TODO: handle unknown date
  const maintenanceDate = vehicle.last_maintenance ? new Date(vehicle.last_maintenance) : new Date()
  const daysSinceMaintenance = getDaysSince(maintenanceDate.toISOString().split('T')[0])
  const needsMaintenance = daysSinceMaintenance > 60

  return (
    <div className="space-y-6 bg-white p-4 sm:p-6 lg:p-8">
      {/* Back button */}
      <Link
        href="/vehicles"
        className="inline-flex items-center gap-2 font-medium text-orange-600 transition-colors hover:text-orange-700"
      >
        <ArrowLeft size={18} />
        Kembali ke Kendaraan
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{vehicle.plate_number}</h1>
          <p className="mt-1 text-sm text-gray-500">{vehicle.type}</p>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <MoreVertical size={20} />
          </button>

          {showMenu && (
            <div className="absolute right-0 z-10 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg">
              <button className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                <Edit size={16} />
                Edit Kendaraan
              </button>
              <button className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                <PrinterIcon size={16} />
                Cetak Detail
              </button>
              <button className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50">
                <Trash2 size={16} />
                Hapus Kendaraan
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Status dan Alert */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Status card */}
        <div className={`rounded-lg ${statusConfig.bg} border border-gray-200 p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm text-gray-600">Status Kendaraan</p>
              <p className={`text-2xl font-bold ${statusConfig.text}`}>{statusConfig.label}</p>
            </div>
            <div className={`text-4xl ${statusConfig.text}`}>{statusConfig.icon}</div>
          </div>
        </div>

        {/* Maintenance alert */}
        {needsMaintenance ? (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-1 shrink-0 text-yellow-600" size={20} />
              <div>
                <p className="font-semibold text-yellow-900">Perawatan Diperlukan</p>
                <p className="mt-1 text-sm text-yellow-700">
                  Kendaraan ini tidak melakukan perawatan selama {daysSinceMaintenance} hari. Segera
                  jadwalkan perawatan.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-green-200 bg-green-50 p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
                ✓
              </div>
              <div>
                <p className="font-semibold text-green-900">Kondisi Baik</p>
                <p className="mt-1 text-sm text-green-700">
                  Perawatan terakhir {daysSinceMaintenance} hari lalu ({vehicle.last_maintenance})
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Specs grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Zap size={16} className="text-gray-500" />
            <span className="text-xs font-medium text-gray-600">Bahan Bakar</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{vehicle.fuel_type}</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Gauge size={16} className="text-gray-500" />
            <span className="text-xs font-medium text-gray-600">Kapasitas Berat</span>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {vehicle.capacity_kg.toLocaleString()} kg
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <MapPin size={16} className="text-gray-500" />
            <span className="text-xs font-medium text-gray-600">Kapasitas Volume</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{vehicle.capacity_m3} m³</p>
        </div>
      </div>

      {/* Maintenance info */}
      <div className="rounded-lg border border-gray-200 p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Informasi Perawatan</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-sm text-gray-600">Tanggal Perawatan Terakhir</p>
            <p className="text-lg font-semibold text-gray-900">
              {maintenanceDate.toLocaleDateString('id-ID')}
            </p>
            <p className="mt-1 text-xs text-gray-500">{daysSinceMaintenance} hari yang lalu</p>
          </div>
          <div>
            <p className="mb-1 text-sm text-gray-600">Jadwal Perawatan Berikutnya</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(
                new Date(maintenanceDate).getTime() + 90 * 24 * 60 * 60 * 1000
              ).toLocaleDateString('id-ID')}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Dalam {Math.max(0, 90 - daysSinceMaintenance)} hari
            </p>
          </div>
        </div>
      </div>

      {/* Vehicle history */}
      <div className="rounded-lg border border-gray-200 p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Riwayat Kendaraan</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <p className="font-medium text-gray-900">Ditambahkan ke sistem</p>
              <p className="text-sm text-gray-600">
                {new Date(vehicle.created_at).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <Calendar size={18} className="text-gray-400" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Perawatan terakhir</p>
              <p className="text-sm text-gray-600">
                {maintenanceDate.toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <Wrench size={18} className="text-gray-400" />
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button className="flex-1 rounded-lg bg-orange-600 px-6 py-3 font-medium text-white transition-colors hover:bg-orange-700">
          Jadwalkan Perawatan
        </button>
        <button className="flex-1 rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50">
          Lihat Rute
        </button>
      </div>
    </div>
  )
}
