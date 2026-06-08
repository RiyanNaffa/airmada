/**
 * Halaman NewVehicle — Add kendaraan baru ke fleet
 *
 * @location apps/web/src/app/(dashboard)/fleet/new/page.tsx
 */
'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Truck } from 'lucide-react'
import Link from 'next/link'
import { VehicleForm } from '@/components/forms/VehicleForm'

export default function NewVehiclePage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push('/fleet')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link
            href="/fleet"
            className="mb-4 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Fleet
          </Link>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-slate-900">
            <Truck className="h-8 w-8 text-orange-600" />
            Tambah Kendaraan Baru
          </h1>
          <p className="mt-2 text-slate-600">Registrasikan kendaraan baru ke dalam armada</p>
        </div>
      </div>

      {/* Form Container */}
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <VehicleForm onSuccess={handleSuccess} />
        </div>

        {/* Info Box */}
        <div className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
          <p className="font-medium">💡 Tips:</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-blue-800">
            <li>Pastikan nomor plat sudah sesuai dengan surat kendaraan</li>
            <li>Kapasitas diisi sesuai spesifikasi teknis kendaraan</li>
            <li>Tahun produksi diambil dari tahun pembuatan kendaraan</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
