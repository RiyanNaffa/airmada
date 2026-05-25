'use client'

import React, { useState, useEffect } from 'react'
import { Search, AlertCircle, CheckCircle, Loader2, Package, Truck, ArrowRight } from 'lucide-react'

// Menyesuaikan interface dengan response dari API Supabase
interface Shipment {
  id: string
  tracking_code: string
  recipient_name: string
  weight_kg: number
  volume_m3?: number
  priority: string
  status: string
}

interface Driver {
  id: string
  status: string
  users: {
    full_name: string
  }
}

export default function AssignPage() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])

  // State untuk melacak pilihan dropdown di setiap baris tabel (shipment_id -> driver_id)
  const [selections, setSelections] = useState<Record<string, string>>({})

  // State untuk melacak jumlah paket yang sudah di-assign ke masing-masing driver di sesi ini (Max 5)
  const [driverLoads, setDriverLoads] = useState<Record<string, number>>({})

  const [loading, setLoading] = useState(true)
  const [assigningId, setAssigningId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // 1. FETCH DATA DARI API GET
  useEffect(() => {
    const fetchDispatchData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/dispatch/assign')
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch dispatch data')
        }

        setShipments(result.data.shipments)
        setDrivers(result.data.drivers)

        // Inisialisasi beban driver menjadi 0
        const initialLoads: Record<string, number> = {}
        result.data.drivers.forEach((d: Driver) => {
          initialLoads[d.id] = 0
        })
        setDriverLoads(initialLoads)
      } catch (error) {
        setMessage({
          type: 'error',
          text: error instanceof Error ? error.message : 'Error loading dispatch data',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDispatchData()
  }, [])

  // Handler saat dropdown driver dipilih
  const handleSelectDriver = (shipmentId: string, driverId: string) => {
    setSelections((prev) => ({ ...prev, [shipmentId]: driverId }))
  }

  // 2. POST ASSIGNMENT KE API
  const handleAssign = async (shipmentId: string) => {
    const driverId = selections[shipmentId]
    if (!driverId) return

    setAssigningId(shipmentId)
    setMessage(null)

    try {
      const response = await fetch('/api/dispatch/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipment_id: shipmentId,
          driver_id: driverId,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to assign shipment')
      }

      // Berhasil: Hapus shipment dari list pending
      setShipments((prev) => prev.filter((s) => s.id !== shipmentId))

      // Tambah beban ke driver (untuk logic max 5)
      setDriverLoads((prev) => ({
        ...prev,
        [driverId]: (prev[driverId] || 0) + 1,
      }))

      setMessage({ type: 'success', text: result.message })

      // Bersihkan notifikasi setelah 3 detik
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to assign shipment',
      })
    } finally {
      setAssigningId(null)
    }
  }

  const filteredShipments = shipments.filter(
    (s) =>
      s.tracking_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.recipient_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
          <p className="text-sm font-medium text-slate-600">Menyiapkan data logistik...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 lg:p-6">
      {/* Header & Stats */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dispatch Hub</h1>
          <p className="mt-1 text-slate-600">Alokasikan paket ke pengemudi yang tersedia</p>
        </div>

        <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex items-center gap-2 border-r border-slate-200 pr-4">
            <Package className="text-orange-500" size={20} />
            <div>
              <p className="text-xs text-slate-500">Pending</p>
              <p className="font-bold text-slate-900">{shipments.length} Paket</p>
            </div>
          </div>
          <div className="flex items-center gap-2 pl-2">
            <Truck className="text-blue-500" size={20} />
            <div>
              <p className="text-xs text-slate-500">Standby</p>
              <p className="font-bold text-slate-900">{drivers.length} Driver</p>
            </div>
          </div>
        </div>
      </div>

      {/* Global Alert */}
      {message && (
        <div
          className={`flex items-center gap-3 rounded-lg p-4 transition-all ${
            message.type === 'success'
              ? 'border border-green-200 bg-green-50 text-green-800'
              : 'border border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      {/* Main Content Area */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Search Bar */}
        <div className="border-b border-slate-200 p-4">
          <div className="relative max-w-md">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari resi atau nama penerima..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pr-4 pl-10 text-sm transition-colors focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Tabel Data */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
              <tr>
                <th className="px-6 py-4 font-semibold">Resi & ID</th>
                <th className="px-6 py-4 font-semibold">Tujuan</th>
                <th className="px-6 py-4 font-semibold">Beban</th>
                <th className="px-6 py-4 font-semibold">Prioritas</th>
                <th className="px-6 py-4 font-semibold">Assign Driver</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <CheckCircle className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                    <p className="text-base font-medium text-slate-900">
                      Semua paket sudah teralokasi
                    </p>
                    <p className="mt-1 text-sm">Tidak ada pengiriman berstatus pending saat ini.</p>
                  </td>
                </tr>
              ) : (
                filteredShipments.map((shipment) => {
                  const isProcessing = assigningId === shipment.id
                  const selectedDriver = selections[shipment.id] || ''

                  return (
                    <tr key={shipment.id} className="transition-colors hover:bg-slate-50">
                      {/* Resi */}
                      <td className="px-6 py-4">
                        <span className="block font-semibold text-slate-900">
                          {shipment.tracking_code}
                        </span>
                        {/* <span className="text-xs text-slate-400 font-mono">{shipment.id.substring(0,8)}...</span> */}
                      </td>

                      {/* Tujuan */}
                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-700">
                          {shipment.recipient_name}
                        </span>
                      </td>

                      {/* Beban */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <Package size={14} className="text-slate-400" />
                          <span>{shipment.weight_kg} kg</span>
                        </div>
                      </td>

                      {/* Prioritas */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            shipment.priority === 'express' || shipment.priority === 'same_day'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {shipment.priority}
                        </span>
                      </td>

                      {/* Dropdown & Action */}
                      <td className="px-6 py-4">
                        <div className="flex max-w-[320px] items-center gap-2">
                          <select
                            value={selectedDriver}
                            onChange={(e) => handleSelectDriver(shipment.id, e.target.value)}
                            disabled={isProcessing}
                            className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none disabled:bg-slate-100"
                          >
                            <option value="" disabled>
                              -- Pilih Pengemudi --
                            </option>
                            {drivers.map((driver) => {
                              const currentLoad = driverLoads[driver.id] || 0
                              const isFull = currentLoad >= 5

                              return (
                                <option key={driver.id} value={driver.id} disabled={isFull}>
                                  {driver.users?.full_name}{' '}
                                  {isFull ? '(Max Limit 5)' : `(${currentLoad}/5 paket)`}
                                </option>
                              )
                            })}
                          </select>

                          <button
                            onClick={() => handleAssign(shipment.id)}
                            disabled={!selectedDriver || isProcessing}
                            className={`flex shrink-0 items-center justify-center rounded-md p-1.5 text-white transition-all ${
                              selectedDriver && !isProcessing
                                ? 'bg-orange-500 hover:bg-orange-600 active:scale-95'
                                : 'cursor-not-allowed bg-slate-300'
                            }`}
                            title="Konfirmasi Assign"
                          >
                            {isProcessing ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              <ArrowRight size={18} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
