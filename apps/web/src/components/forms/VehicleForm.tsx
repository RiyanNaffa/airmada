/**
 * Form VehicleForm — validasi dengan Zod + react-hook-form.
 *
 * @location apps/web/src/components/forms/VehicleForm.tsx
 */
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateVehicleSchema, type CreateVehicleInput } from '@/lib/validators/vehicle.schema'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

interface VehicleFormProps {
  onSuccess?: () => void
}

export function VehicleForm({ onSuccess }: VehicleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateVehicleInput>({
    resolver: zodResolver(CreateVehicleSchema),
  })

  const onSubmit = async (data: CreateVehicleInput) => {
    try {
      setIsSubmitting(true)
      setErrorMessage(null)
      setSuccessMessage(null)

      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Gagal menambah kendaraan')
      }

      const result = await response.json()
      setSuccessMessage(`Kendaraan ${data.plate_number} berhasil ditambahkan`)
      reset()

      setTimeout(() => {
        onSuccess?.()
      }, 1500)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
      {/* Alert Messages */}
      {successMessage && (
        <div className="flex gap-3 rounded-lg bg-green-50 p-4 text-sm text-green-800">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <p>{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="flex gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Plate Number */}
      <div>
        <label className="block text-sm font-medium text-slate-900">Nomor Plat</label>
        <p className="mb-2 text-xs text-slate-500">Format: B 1234 ABC</p>
        <input
          {...register('plate_number')}
          type="text"
          placeholder="B 1234 ABC"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
        />
        {errors.plate_number && (
          <p className="mt-1 text-xs text-red-600">{errors.plate_number.message}</p>
        )}
      </div>

      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-slate-900">Tipe Kendaraan</label>
        <select
          {...register('type')}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
        >
          <option value="">Pilih tipe kendaraan</option>
          <option value="MOTOR">Motor</option>
          <option value="PICKUP">Pickup</option>
          <option value="VAN">Van</option>
          <option value="SMALL_TRUCK">Small Truck</option>
          <option value="LARGE_TRUCK">Large Truck</option>
        </select>
        {errors.type && <p className="mt-1 text-xs text-red-600">{errors.type.message}</p>}
      </div>

      {/* Capacity Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-900">Kapasitas (kg)</label>
          <input
            {...register('capacity_kg', { valueAsNumber: true })}
            type="number"
            placeholder="1000"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
          />
          {errors.capacity_kg && (
            <p className="mt-1 text-xs text-red-600">{errors.capacity_kg.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-900">Kapasitas Volume (m³)</label>
          <input
            {...register('capacity_volume_m3', { valueAsNumber: true })}
            type="number"
            placeholder="5.5"
            step="0.1"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
          />
          {errors.capacity_volume_m3 && (
            <p className="mt-1 text-xs text-red-600">{errors.capacity_volume_m3.message}</p>
          )}
        </div>
      </div>

      {/* Fuel Type */}
      <div>
        <label className="block text-sm font-medium text-slate-900">Jenis Bahan Bakar</label>
        <select
          {...register('fuel_type')}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
        >
          <option value="">Pilih jenis bahan bakar</option>
          <option value="GAS">Bensin</option>
          <option value="DIESEL">Solar</option>
          <option value="HYBRID">Hybrid</option>
          <option value="ELECTRIC">Listrik</option>
        </select>
        {errors.fuel_type && (
          <p className="mt-1 text-xs text-red-600">{errors.fuel_type.message}</p>
        )}
      </div>

      {/* Year */}
      <div>
        <label className="block text-sm font-medium text-slate-900">Tahun Produksi</label>
        <input
          {...register('year', { valueAsNumber: true })}
          type="number"
          placeholder={new Date().getFullYear().toString()}
          min="2000"
          max={new Date().getFullYear()}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
        />
        {errors.year && <p className="mt-1 text-xs text-red-600">{errors.year.message}</p>}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-slate-900">Catatan</label>
        <textarea
          {...register('notes')}
          placeholder="Contoh: Kondisi prima, baru dari service..."
          rows={3}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 py-2 font-medium text-white transition-colors hover:bg-orange-700 disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Menyimpan...
          </>
        ) : (
          'Tambah Kendaraan'
        )}
      </button>
    </form>
  )
}
