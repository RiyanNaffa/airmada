'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Edit3, Camera, Truck } from 'lucide-react'
import type { Vehicle } from '@/types'
import { DUMMY_VEHICLES } from '@/mocks'

/**
 * Halaman detail kendaraan.
 *
 * @location apps/web/src/app/(dashboard)/vehicles/[id]/page.tsx
 * TODO: Fetch data kendaraan berdasarkan params.id, tampilkan detail + riwayat rute
 */
export default function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const id = resolvedParams.id

  // Simulasi fetch data dari ID (menggunakan array pertama sebagai default jika ID tidak match untuk demo)
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)

  useEffect(() => {
    // Di aplikasi asli, lakukan fetch ke API GET /api/vehicles/[id]
    const found = DUMMY_VEHICLES.find((v) => v.id === id) || DUMMY_VEHICLES[0]
    setVehicle(found)
  }, [id])

  if (!vehicle) {
    return (
      <div className="animate-pulse p-10 text-center text-slate-500">Loading vehicle data...</div>
    )
  }

  return (
    <div className="mx-auto max-w-screen-xl space-y-6 p-5 lg:p-7">
      {/* ── Breadcrumb & Header ────────────────────────────────────────── */}
      <div>
        <Link
          href="/fleet"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
        >
          <ArrowLeft size={16} />
          Back to Fleet
        </Link>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-slate-800">
              {vehicle.plate_number}
              <span
                className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                  vehicle.status === 'ACTIVE'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : vehicle.status === 'MAINTENANCE'
                      ? 'border-orange-200 bg-orange-50 text-orange-700'
                      : 'border-slate-200 bg-slate-100 text-slate-700'
                }`}
              >
                {vehicle.status}
              </span>
            </h1>
            <p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-500">
              <Truck size={16} className="text-slate-400" />
              {vehicle.type.replace('_', ' ')}
            </p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg bg-[#1e293b] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800">
            <Edit3 size={16} />
            Edit Vehicle
          </button>
        </div>
      </div>

      {/* ── Main Content Grid ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        {/* Kolom Kiri: Galeri Gambar (4 Kolom pada Desktop) */}
        <div className="space-y-4 lg:col-span-5">
          {/* Gambar Utama (Perspective) */}
          <div className="group relative flex aspect-[4/3] w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 text-slate-400">
            {/* Ganti div di bawah dengan <Image src="/vehicles/placeholder-perspective.jpg" fill className="object-cover" /> */}
            <Camera
              size={32}
              className="mb-2 opacity-50 transition-transform group-hover:scale-110"
            />
            <span className="text-sm font-medium">Perspective View</span>
          </div>

          {/* Thumbnail Gambar (Side, Front, Back) */}
          <div className="grid grid-cols-3 gap-4">
            <div className="group relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 text-slate-400">
              {/* <Image src="/vehicles/placeholder-side.jpg" fill className="object-cover" /> */}
              <Camera
                size={20}
                className="mb-1 opacity-50 transition-transform group-hover:scale-110"
              />
              <span className="text-[10px] font-medium tracking-wider uppercase">Side</span>
            </div>
            <div className="group relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 text-slate-400">
              {/* <Image src="/vehicles/placeholder-front.jpg" fill className="object-cover" /> */}
              <Camera
                size={20}
                className="mb-1 opacity-50 transition-transform group-hover:scale-110"
              />
              <span className="text-[10px] font-medium tracking-wider uppercase">Front</span>
            </div>
            <div className="group relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 text-slate-400">
              {/* <Image src="/vehicles/placeholder-back.jpg" fill className="object-cover" /> */}
              <Camera
                size={20}
                className="mb-1 opacity-50 transition-transform group-hover:scale-110"
              />
              <span className="text-[10px] font-medium tracking-wider uppercase">Back</span>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Detail Spesifikasi (7 Kolom pada Desktop) */}
        <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-7 lg:p-8">
          <div className="mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-800">Vehicle Configuration</h2>
            <p className="mt-1 text-xs text-slate-500">
              Detailed specifications and physical attributes.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2">
            {/* Kategori: GENERAL */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                  General
                </h3>
                <button className="text-blue-500 transition-colors hover:text-blue-700">
                  <Edit3 size={14} />
                </button>
              </div>
              <div className="space-y-3">
                <DetailRow label="Vehicle Type" value={vehicle.type.replace('_', ' ')} />
                <DetailRow label="Manufacture Year" value={vehicle.year.toString()} />
                <DetailRow label="Fuel Type" value={vehicle.fuel_type} />
              </div>
            </div>

            {/* Kategori: CAPACITIES */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                  Capacities
                </h3>
                <button className="text-blue-500 transition-colors hover:text-blue-700">
                  <Edit3 size={14} />
                </button>
              </div>
              <div className="space-y-3">
                <DetailRow
                  label="Max Payload"
                  value={`${vehicle.capacity_kg.toLocaleString('id-ID')} kg`}
                />
                <DetailRow label="Cargo Volume" value={`${vehicle.capacity_m3} m³`} />
              </div>
            </div>

            {/* Kategori: NOTES & SYSTEM */}
            <div className="border-t border-slate-50 pt-6 md:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                  Additional Details
                </h3>
                <button className="text-blue-500 transition-colors hover:text-blue-700">
                  <Edit3 size={14} />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                  <span className="w-1/3 text-sm text-slate-500">Notes</span>
                  <span className="w-2/3 text-sm font-medium text-slate-800 sm:text-right">
                    {vehicle.notes || '-'}
                  </span>
                </div>
                <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                  <span className="w-1/3 text-sm text-slate-500">Registered On</span>
                  <span className="w-2/3 text-sm font-medium text-slate-800 sm:text-right">
                    {new Date(vehicle.created_at).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Helper Component: Detail Row ─────────────────────────────────────────
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="group flex items-center justify-between border-b border-slate-50 pb-2 last:border-0 last:pb-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-800">{value}</span>
    </div>
  )
}
