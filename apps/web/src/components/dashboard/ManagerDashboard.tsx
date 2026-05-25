'use client'

import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { Truck, Users, Package, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'

// =============================================================================
// DUMMY DATA
// =============================================================================

const DUMMY_KPI = [
  {
    label: 'Active Vehicles',
    value: 12,
    delta: '+8%',
    deltaLabel: 'vs last week',
    positive: true,
    icon: <Truck size={20} className="text-white" />,
    iconBg: 'bg-emerald-500',
    shadowColor: 'shadow-emerald-100',
  },
  {
    label: 'On-Duty Drivers',
    value: 8,
    delta: '+12%',
    deltaLabel: 'vs last week',
    positive: true,
    icon: <Users size={20} className="text-white" />,
    iconBg: 'bg-sky-500',
    shadowColor: 'shadow-sky-100',
  },
  {
    label: 'Pending Shipments',
    value: 15,
    delta: '-5%',
    deltaLabel: 'vs last week',
    positive: false,
    icon: <Package size={20} className="text-white" />,
    iconBg: 'bg-violet-500',
    shadowColor: 'shadow-violet-100',
  },
  {
    label: 'Critical Warnings',
    value: 3,
    delta: '+2',
    deltaLabel: 'vs last week',
    positive: false,
    icon: <AlertTriangle size={20} className="text-white" />,
    iconBg: 'bg-orange-500',
    shadowColor: 'shadow-orange-100',
  },
]

const DUMMY_TREND = [
  { date: '23/3', deliveries: 32 },
  { date: '24/3', deliveries: 38 },
  { date: '25/3', deliveries: 44 },
  { date: '26/3', deliveries: 61 },
  { date: '27/3', deliveries: 55 },
  { date: '28/3', deliveries: 58 },
  { date: '29/3', deliveries: 41 },
]

const DUMMY_VEHICLE_STATUS = [
  { name: 'Active', value: 12, color: '#10b981' },
  { name: 'Idle', value: 5, color: '#64748b' },
  { name: 'Repair', value: 3, color: '#f97316' },
]

type ShipmentPriority = 'High' | 'Medium' | 'Low'
type ShipmentStatus = 'In Transit' | 'Delivered' | 'Pending' | 'Picked Up' | 'Out for Delivery'

interface DummyShipment {
  tracking_code: string
  sender: string
  recipient: string
  weight: string
  priority: ShipmentPriority
  status: ShipmentStatus
  date: string
}

const DUMMY_SHIPMENTS: DummyShipment[] = [
  {
    tracking_code: 'ARM-2026-03-000123',
    sender: 'PT Maju Jaya',
    recipient: 'CV Sejahtera Abadi',
    weight: '450 kg',
    priority: 'High',
    status: 'In Transit',
    date: '2026-03-28',
  },
  {
    tracking_code: 'ARM-2026-03-000124',
    sender: 'Toko Elektronik Jaya',
    recipient: 'Ibu Siti Rahayu',
    weight: '25 kg',
    priority: 'Medium',
    status: 'Delivered',
    date: '2026-03-27',
  },
  {
    tracking_code: 'ARM-2026-03-000125',
    sender: 'Distributor Farmasi Indo',
    recipient: 'Apotek Sehat Sentosa',
    weight: '120 kg',
    priority: 'High',
    status: 'Pending',
    date: '2026-03-29',
  },
  {
    tracking_code: 'ARM-2026-03-000126',
    sender: 'PT Garmen Tekstil',
    recipient: 'Toko Fashion Plaza',
    weight: '850 kg',
    priority: 'Low',
    status: 'Picked Up',
    date: '2026-03-28',
  },
  {
    tracking_code: 'ARM-2026-03-000127',
    sender: 'Supplier Komputer Mega',
    recipient: 'PT Digital Indonesia',
    weight: '320 kg',
    priority: 'Medium',
    status: 'Out for Delivery',
    date: '2026-03-27',
  },
]

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  delta,
  deltaLabel,
  positive,
  icon,
  iconBg,
  shadowColor,
  index,
}: {
  label: string
  value: number
  delta: string
  deltaLabel: string
  positive: boolean
  icon: React.ReactNode
  iconBg: string
  shadowColor: string
  index: number
}) {
  const [displayed, setDisplayed] = useState(0)

  // Animasi counter saat mount
  useEffect(() => {
    const duration = 800
    const steps = 40
    const step = value / steps
    let current = 0
    const delay = index * 80

    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        current += step
        if (current >= value) {
          setDisplayed(value)
          clearInterval(interval)
        } else {
          setDisplayed(Math.floor(current))
        }
      }, duration / steps)
      return () => clearInterval(interval)
    }, delay)

    return () => clearTimeout(timeout)
  }, [value, index])

  return (
    <div
      className={[
        'group relative overflow-hidden rounded-2xl bg-white p-5',
        'border border-slate-100 shadow-sm hover:shadow-md',
        `hover:${shadowColor}`,
        'transition-all duration-300 hover:-translate-y-0.5',
      ].join(' ')}
    >
      {/* Decorative background circle */}
      <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-current opacity-5 transition-all duration-300 group-hover:opacity-10" />

      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1 pr-2">
          <p className="truncate text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-bold text-slate-800 tabular-nums">{displayed}</p>
          <div className="mt-2 flex items-center gap-1.5">
            {positive ? (
              <TrendingUp size={13} className="shrink-0 text-emerald-500" />
            ) : (
              <TrendingDown size={13} className="shrink-0 text-rose-500" />
            )}
            <span
              className={[
                'text-xs font-semibold',
                positive ? 'text-emerald-600' : 'text-rose-500',
              ].join(' ')}
            >
              {delta}
            </span>
            <span className="text-xs text-slate-400">{deltaLabel}</span>
          </div>
        </div>

        <div
          className={[
            'flex h-11 w-11 shrink-0 items-center justify-center',
            'rounded-xl shadow-lg',
            iconBg,
          ].join(' ')}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}

// ─── Priority Badge ───────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: ShipmentPriority }) {
  const styles: Record<ShipmentPriority, string> = {
    High: 'bg-red-50   text-red-600   ring-1 ring-red-200',
    Medium: 'bg-amber-50 text-amber-600 ring-1 ring-amber-200',
    Low: 'bg-green-50 text-green-600 ring-1 ring-green-200',
  }
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[priority]}`}
    >
      {priority}
    </span>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ShipmentStatus }) {
  const styles: Record<ShipmentStatus, string> = {
    'In Transit': 'bg-blue-50   text-blue-700   ring-1 ring-blue-200',
    Delivered: 'bg-green-50  text-green-700  ring-1 ring-green-200',
    Pending: 'bg-amber-50  text-amber-700  ring-1 ring-amber-200',
    'Picked Up': 'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
    'Out for Delivery': 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
  }
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${styles[status]}`}
    >
      {status}
    </span>
  )
}

// ─── Custom Tooltip untuk Recharts ────────────────────────────────────────────

function TrendTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-slate-100 bg-white px-3 py-2 shadow-lg">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-bold text-slate-800">{payload[0].value} deliveries</p>
    </div>
  )
}

// ─── Custom Legend untuk PieChart ─────────────────────────────────────────────

function VehicleLegend({ payload }: { payload?: Array<{ color: string; value: string }> }) {
  if (!payload) return null
  return (
    <div className="mt-2 flex items-center justify-center gap-4">
      {payload.map((entry) => (
        <div key={entry.value} className="flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-slate-600">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="text-base font-bold text-slate-800">{title}</h2>
      <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>
    </div>
  )
}

// =============================================================================
// MANAGER DASHBOARD
// =============================================================================

export function ManagerDashboard() {
  return (
    <div className="space-y-6">
      {/* ── KPI Cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {DUMMY_KPI.map((kpi, i) => (
          <KpiCard key={kpi.label} {...kpi} index={i} />
        ))}
      </div>

      {/* ── Charts ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Trend chart — 2/3 width on desktop */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-2">
          <SectionHeader title="Daily Delivery Trends" subtitle="Last 7 days performance" />
          <div className="mt-4 h-52 sm:h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={DUMMY_TREND} margin={{ top: 4, right: 12, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<TrendTooltip />} />
                <Line
                  type="monotone"
                  dataKey="deliveries"
                  stroke="#1e3a5f"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#1e3a5f', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#f97316', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vehicle Status donut — 1/3 width on desktop */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <SectionHeader title="Vehicle Status" subtitle="Current fleet distribution" />
          <div className="mt-2 h-52 sm:h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={DUMMY_VEHICLE_STATUS}
                  cx="50%"
                  cy="45%"
                  innerRadius="50%"
                  outerRadius="75%"
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {DUMMY_VEHICLE_STATUS.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Legend content={<VehicleLegend />} verticalAlign="bottom" />
                <Tooltip
                  formatter={(value, name) => [value, name]}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #f1f5f9',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* TODO: add shipments summary pakai ThreeDPieChart */}

      {/* ── Recent Shipments ─────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <SectionHeader title="Recent Shipments" subtitle="Latest 5 shipment orders" />
        </div>

        {/* Scrollable pada layar kecil */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                {[
                  'Tracking Code',
                  'Sender',
                  'Recipient',
                  'Weight',
                  'Priority',
                  'Status',
                  'Date',
                ].map((col) => (
                  <th
                    key={col}
                    className="px-5 py-3 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {DUMMY_SHIPMENTS.map((row, i) => (
                <tr
                  key={row.tracking_code}
                  className="cursor-pointer transition-colors duration-100 hover:bg-slate-50/70"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs font-semibold text-slate-700">
                      {row.tracking_code}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm whitespace-nowrap text-slate-600">
                    {row.sender}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{row.recipient}</td>
                  <td className="px-5 py-3.5 text-sm whitespace-nowrap text-slate-600 tabular-nums">
                    {row.weight}
                  </td>
                  <td className="px-5 py-3.5">
                    <PriorityBadge priority={row.priority} />
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-5 py-3.5 text-sm whitespace-nowrap text-slate-500 tabular-nums">
                    {row.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer tabel */}
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
          <p className="text-xs text-slate-400">Menampilkan 5 dari total shipment</p>
          <button className="text-xs font-semibold text-orange-500 transition-colors hover:text-orange-600 hover:underline">
            Lihat semua →
          </button>
        </div>
      </div>
    </div>
  )
}
