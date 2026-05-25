'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, MapPin, User, AlertCircle, CheckCircle, Truck, Package } from 'lucide-react'
import { Route } from 'next'
import type { Shipment } from '@/types'
import { useUserProfile } from '@/hooks/useUserProfile'

const statusSteps = ['pending', 'assigned', 'pickup', 'in_transit', 'delivered'] as const

export default function PackageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)

  const { user, loading: isProfileLoading } = useUserProfile()
  const [pkg, setPkg] = useState<Shipment | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isProfileLoading || !user?.user?.id) {
      return
    }

    let isMounted = true

    const fetchPackageDetail = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/shipments/drivers/${user.user.id}`)
        if (!response.ok) throw new Error('Failed to fetch shipments')

        const shipments: Shipment[] = await response.json()
        if (isMounted) {
          const foundPkg = shipments.find((shipment) => shipment.id === id)
          setPkg(foundPkg)
        }
      } catch (error) {
        console.error('Error fetching package detail:', error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchPackageDetail()

    return () => {
      isMounted = false
    }
  }, [user?.user?.id, isProfileLoading, id])

  if (isProfileLoading || loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-orange-400"></div>
          <p className="mt-2 text-sm text-gray-600">Loading package details...</p>
        </div>
      </div>
    )
  }

  if (!pkg) {
    return (
      <div className="space-y-4 p-4 lg:p-6">
        <Link
          href={'/packages' as Route}
          className="inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700"
        >
          <ChevronLeft size={18} />
          Back to Packages
        </Link>
        <div className="rounded-lg bg-red-50 p-12 text-center">
          <AlertCircle className="mx-auto text-red-400" size={32} />
          <p className="mt-3 font-semibold text-red-900">Package not found</p>
          <p className="mt-1 text-sm text-red-700">The package you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  const statusIndex = statusSteps.indexOf(pkg.status as (typeof statusSteps)[number])
  const isDelivered = pkg.status === 'DELIVERED'
  const isFailed = pkg.status === 'FAILED'

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <Link
        href={'/packages' as Route}
        className="inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700"
      >
        <ChevronLeft size={18} />
        Back to Packages
      </Link>

      {/* Header */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{pkg.tracking_code}</h1>
            <p className="mt-1 text-slate-600">Package ID: {pkg.id}</p>
          </div>
          <span
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
              pkg.status === 'DELIVERED'
                ? 'bg-green-100 text-green-800'
                : pkg.status === 'IN_TRANSIT'
                  ? 'bg-orange-100 text-orange-800'
                  : pkg.status === 'FAILED'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
            }`}
          >
            {pkg.status === 'IN_TRANSIT' && <Truck size={18} />}
            {pkg.status === 'DELIVERED' && <CheckCircle size={18} />}
            {pkg.status === 'FAILED' && <AlertCircle size={18} />}
            {pkg.status === 'PENDING' && <Package size={18} />}
            {pkg.status.charAt(0).toUpperCase() + pkg.status.slice(1).replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Timeline */}
      {!isFailed && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-6 text-lg font-bold text-slate-900">Delivery Status</h2>
          <div className="space-y-4">
            {statusSteps.map((step, idx) => {
              const isCompleted = idx < statusIndex || (idx === statusIndex && isDelivered)
              const isCurrent = idx === statusIndex && !isDelivered

              return (
                <div key={step} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                        isCompleted
                          ? 'border-green-500 bg-green-500 text-white'
                          : isCurrent
                            ? 'border-orange-500 bg-orange-50 text-orange-600'
                            : 'border-slate-300 bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isCompleted && <CheckCircle size={20} />}
                      {isCurrent && <Truck size={20} />}
                      {!isCompleted && !isCurrent && <Package size={20} />}
                    </div>
                    {idx < statusSteps.length - 1 && (
                      <div
                        className={`mt-2 h-12 w-1 ${isCompleted || isCurrent ? 'bg-orange-500' : 'bg-slate-300'}`}
                      />
                    )}
                  </div>
                  <div className="pt-1">
                    <p
                      className={`font-semibold capitalize ${isCompleted || isCurrent ? 'text-slate-900' : 'text-slate-500'}`}
                    >
                      {step.replace('_', ' ')}
                    </p>
                    <p className="text-sm text-slate-600">
                      {step === 'pending' && 'Package awaiting pickup'}
                      {step === 'assigned' && 'Assigned to driver'}
                      {step === 'pickup' && 'Driver picking up from warehouse'}
                      {step === 'in_transit' && 'On the way to recipient'}
                      {step === 'delivered' && 'Delivered to recipient'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Info Boxes */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
            <User size={20} className="text-blue-600" /> Sender Information
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-600">Name</p>
              <p className="font-semibold text-slate-900">{pkg.sender_name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600">Address</p>
              <p className="text-slate-900">{pkg.sender_address}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
            <MapPin size={20} className="text-orange-600" /> Recipient Information
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-600">Name</p>
              <p className="font-semibold text-slate-900">{pkg.recipient_name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600">Address</p>
              <p className="text-slate-900">{pkg.recipient_address}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-bold text-slate-900">Package Details</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="flex items-center gap-2 text-sm text-blue-700">
              <Package size={18} /> Weight
            </p>
            <p className="mt-2 text-2xl font-bold text-blue-900">{pkg.weight_kg} kg</p>
          </div>
          <div className="rounded-lg bg-purple-50 p-4">
            <p className="flex items-center gap-2 text-sm text-purple-700">
              <Package size={18} /> Volume
            </p>
            <p className="mt-2 text-2xl font-bold text-purple-900">{pkg.volume_m3} m³</p>
          </div>
          <div className="rounded-lg bg-orange-50 p-4">
            <p className="flex items-center gap-2 text-sm text-orange-700">
              <AlertCircle size={18} /> Priority
            </p>
            <p className="mt-2 text-2xl font-bold text-orange-900 capitalize">
              {pkg.priority.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
