'use client'

import { Search, Package } from 'lucide-react'

type Shipment = {
  id: string
  sender: string
  recipient: string
  weight: string
  volume: string
  status: string
  priority: string
  createdAt: string
  timeline: {
    label: string
    time?: string
    done: boolean
    current?: boolean
  }[]
}

const shipments: Shipment[] = [
  {
    id: 'ARM-2026-03-000123',
    sender: 'PT Maju Jaya',
    recipient: 'CV Sejahtera Abadi',
    weight: '450 kg',
    volume: '2.5 m³',
    status: 'In Transit',
    priority: 'High',
    createdAt: '2026-03-28',
    timeline: [
      { label: 'Pending', time: '2026-03-28 08:00', done: true },
      { label: 'Picked Up', time: '2026-03-28 10:30', done: true },
      { label: 'In Transit', time: '2026-03-28 14:00', done: true },
      { label: 'Out for Delivery', done: false, current: true },
      { label: 'Delivered', done: false },
    ],
  },
]

const StatusBadge = ({ text }: { text: string }) => {
  const color =
    text === 'Delivered'
      ? 'bg-emerald-50 text-emerald-600'
      : text === 'Pending'
        ? 'bg-yellow-50 text-yellow-600'
        : text === 'In Transit'
          ? 'bg-blue-50 text-blue-600'
          : 'bg-slate-100 text-slate-600'

  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>{text}</span>
}

const PriorityBadge = ({ text }: { text: string }) => {
  const color =
    text === 'High'
      ? 'bg-red-50 text-red-600'
      : text === 'Medium'
        ? 'bg-amber-50 text-amber-600'
        : 'bg-green-50 text-green-600'

  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
      {text} Priority
    </span>
  )
}

const TimelineItem = ({ item }: { item: Shipment['timeline'][0] }) => {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`h-4 w-4 rounded-full ${item.done ? 'bg-emerald-500' : 'bg-slate-300'}`} />
        <div className="mt-1 w-[2px] flex-1 bg-slate-200" />
      </div>

      <div>
        <p className="text-sm font-medium text-slate-700">{item.label}</p>
        {item.time && <p className="text-xs text-slate-400">{item.time}</p>}
        {item.current && (
          <span className="mt-1 inline-block rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
            Current Status
          </span>
        )}
      </div>
    </div>
  )
}

const ShipmentCard = ({ shipment }: { shipment: Shipment }) => {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-white">
            <Package size={18} />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-800">{shipment.id}</p>
            <div className="mt-1 flex gap-2">
              <StatusBadge text={shipment.status} />
              <PriorityBadge text={shipment.priority} />
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400">Created: {shipment.createdAt}</p>
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
        <div>
          <p className="text-xs text-slate-400">Sender</p>
          <p className="text-slate-700">{shipment.sender}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Recipient</p>
          <p className="text-slate-700">{shipment.recipient}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Weight</p>
          <p className="text-slate-700">{shipment.weight}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Volume</p>
          <p className="text-slate-700">{shipment.volume}</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-700">Shipment Journey</p>

        <div className="space-y-3">
          {shipment.timeline.map((t, i) => (
            <TimelineItem key={i} item={t} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ShipmentsPage() {
  return (
    <div className="mx-auto max-w-screen-xl space-y-5 p-5 lg:p-7">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 lg:text-3xl">Shipment Logistics</h1>
        <p className="mt-1 text-sm text-slate-500">Track and manage all shipment orders</p>
      </div>

      {/* Search */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search by tracking code, sender, or recipient..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-9 text-sm outline-none focus:ring-2 focus:ring-slate-100"
          />
        </div>

        <button className="rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-600">
          All Status
        </button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {shipments.map((s) => (
          <ShipmentCard key={s.id} shipment={s} />
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 pt-4 md:grid-cols-5">
        {[
          { label: 'Pending', color: 'bg-yellow-50 text-yellow-600', value: 1 },
          { label: 'Picked Up', color: 'bg-blue-50 text-blue-600', value: 1 },
          { label: 'In Transit', color: 'bg-indigo-50 text-indigo-600', value: 1 },
          { label: 'Out for Delivery', color: 'bg-purple-50 text-purple-600', value: 1 },
          { label: 'Delivered', color: 'bg-green-50 text-green-600', value: 1 },
        ].map((item, i) => (
          <div key={i} className={`rounded-xl p-4 ${item.color}`}>
            <p className="text-lg font-bold">{item.value}</p>
            <p className="text-xs">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
