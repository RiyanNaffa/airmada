'use client'

import React from 'react'
import { Search, Star, Calendar, CreditCard, AlertCircle } from 'lucide-react'

const driversData = [
  {
    id: '1',
    initials: 'AN',
    name: 'Andi Wijaya',
    code: 'ANDI',
    status: 'On Duty',
    deliveries: 234,
    rating: 4.8,
    license: {
      number: 'SIM-1234-5678-9012',
      type: 'SIM B2',
      expiry: '2027-06-15',
    },
    warning: null,
  },
  {
    id: '2',
    initials: 'SI',
    name: 'Siti Aminah',
    code: 'SITI',
    status: 'Available',
    deliveries: 189,
    rating: 4.9,
    license: {
      number: 'SIM-2345-6789-0123',
      type: 'SIM B1',
      expiry: '2026-09-20',
    },
    warning: null,
  },
  {
    id: '3',
    initials: 'BU',
    name: 'Budi Hartono',
    code: 'BUDI H',
    status: 'On Duty',
    deliveries: 312,
    rating: 4.7,
    license: {
      number: 'SIM-3456-7890-1234',
      type: 'SIM B2',
      expiry: '2026-04-30',
    },
    warning: {
      title: 'Expires Soon',
      message: 'License renewal required within 90 days',
    },
  },
]

const StatusBadge = ({ status }: { status: string }) => {
  const isAvailable = status === 'Available'

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        isAvailable
          ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-100'
          : 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100'
      }`}
    >
      {status}
    </span>
  )
}

const DriverCard = ({ driver }: { driver: (typeof driversData)[0] }) => {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* HEADER */}
      <div className="relative bg-slate-800 p-6 text-white">
        <div className="absolute top-4 right-4">
          <StatusBadge status={driver.status} />
        </div>

        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-lg font-semibold">
          {driver.initials}
        </div>

        <h3 className="text-base font-semibold">{driver.name}</h3>
        <p className="mt-1 text-xs tracking-wider text-slate-300 uppercase">{driver.code}</p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 border-b border-slate-100 p-5">
        <div>
          <h4 className="text-xl font-bold text-slate-800">{driver.deliveries}</h4>
          <p className="mt-1 text-xs text-slate-400">Total Deliveries</p>
        </div>

        <div>
          <div className="flex items-center gap-1">
            <h4 className="text-xl font-bold text-slate-800">{driver.rating}</h4>
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          </div>

          <p className="mt-1 text-xs text-slate-400">Rating</p>

          <div className="mt-1 flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.floor(driver.rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-slate-200 text-slate-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* LICENSE */}
      <div className="flex-1 bg-slate-50/50 p-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
          <CreditCard className="h-4 w-4" />
          License Information
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-3 text-sm">
          <div className="text-slate-400">License Number</div>
          <div className="font-mono font-medium text-slate-700">{driver.license.number}</div>

          <div className="text-slate-400">Type</div>
          <div className="rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600">
            {driver.license.type}
          </div>

          <div className="text-slate-400">Expiry Date</div>
          <div className="flex items-center gap-1 font-medium text-slate-700">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            {driver.license.expiry}
          </div>
        </div>

        {driver.warning && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 p-3">
            <AlertCircle className="mt-0.5 h-4 w-4 text-red-500" />
            <div>
              <p className="text-xs font-semibold text-red-700">{driver.warning.title}</p>
              <p className="mt-0.5 text-xs text-red-600">{driver.warning.message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function DriversPage() {
  return (
    <div className="mx-auto max-w-screen-xl space-y-5 p-5 lg:p-7">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 lg:text-3xl">Driver Management</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your driver personnel and licenses</p>
      </div>

      {/* SEARCH + FILTER */}
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search drivers by name..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-9 text-sm text-slate-700 outline-none focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-100"
            />
          </div>

          <div className="flex gap-2">
            <button className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white">
              All
            </button>
            <button className="rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-600 hover:bg-slate-200">
              Available
            </button>
            <button className="rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-600 hover:bg-slate-200">
              On Duty
            </button>
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {driversData.map((driver) => (
          <DriverCard key={driver.id} driver={driver} />
        ))}
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
          <p className="text-3xl font-bold text-emerald-600">3</p>
          <p className="mt-1 text-sm font-medium text-emerald-600">Drivers On Duty</p>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <p className="text-3xl font-bold text-blue-600">2</p>
          <p className="mt-1 text-sm font-medium text-blue-600">Available Drivers</p>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
          <p className="text-3xl font-bold text-amber-600">1092</p>
          <p className="mt-1 text-sm font-medium text-amber-600">Total Deliveries</p>
        </div>
      </div>
    </div>
  )
}
