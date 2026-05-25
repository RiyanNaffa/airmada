'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Plus,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  Truck,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Fuel,
  CalendarDays,
  CheckCircle2,
  Wrench,
  Clock,
  MoreVertical,
  Pencil,
  Trash2,
  Info,
  AlertTriangle,
} from 'lucide-react'
import type { Vehicle, VehicleType, VehicleStatus } from '@/types'
import { DUMMY_VEHICLES } from '@/mocks'
import { useAnomalyDetection } from '@/hooks/useAnomalyDetection'
import { AnomalyAlerts } from '@/components/dashboard/AnomalyAlerts'
import { AnomalyResult } from '@/lib/ai-client'

/**
 * Halaman Fleet
 *
 * @location apps/web/src/app/(dashboard)/fleet/page.tsx
 * TODO: Tabel list kendaraan dengan filter
 */
// =============================================================================
// TYPES
// =============================================================================

type SortDir = 'asc' | 'desc' | null
type ColumnKey = keyof Omit<Vehicle, 'id'>

// =============================================================================
// COLUMN DEFINITIONS
// =============================================================================

const ALL_COLUMNS: { key: ColumnKey; label: string; hideable: boolean }[] = [
  { key: 'plate_number', label: 'Plate Number', hideable: false },
  { key: 'type', label: 'Type', hideable: true },
  { key: 'capacity_kg', label: 'Capacity', hideable: true },
  { key: 'fuel_type', label: 'Fuel Type', hideable: true },
  { key: 'year', label: 'Year', hideable: true },
  { key: 'status', label: 'Status', hideable: true },
  { key: 'last_maintenance', label: 'Last Maintenance', hideable: true },
  { key: 'notes', label: 'Notes', hideable: true },
]

// =============================================================================
// HELPERS
// =============================================================================

const STATUS_STYLE: Record<VehicleStatus, { badge: string; icon: React.ReactNode }> = {
  ACTIVE: {
    badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    icon: <CheckCircle2 size={11} />,
  },
  IDLE: {
    badge: 'bg-slate-100  text-slate-600   ring-1 ring-slate-200',
    icon: <Clock size={11} />,
  },
  BROKEN_EN_ROUTE: {
    badge: 'bg-amber-50   text-amber-700   ring-1 ring-amber-200',
    icon: <Wrench size={11} />,
  },
  MAINTENANCE: {
    badge: 'bg-amber-50   text-amber-700   ring-1 ring-amber-200',
    icon: <Wrench size={11} />,
  },
  OFFLINE: { badge: 'bg-red-50     text-red-600     ring-1 ring-red-200', icon: <X size={11} /> },
}

const TYPE_ICON_BG: Record<VehicleType, string> = {
  LARGE_TRUCK: 'bg-slate-900',
  SMALL_TRUCK: 'bg-slate-800',
  VAN: 'bg-slate-700',
  PICKUP: 'bg-slate-600',
  MOTOR: 'bg-slate-500',
}

function StatusBadge({ status }: { status: VehicleStatus }) {
  const { badge, icon } = STATUS_STYLE[status]
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge}`}
    >
      {icon}
      {status}
    </span>
  )
}

function PlateIcon({ type }: { type: VehicleType }) {
  return (
    <div
      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${TYPE_ICON_BG[type]}`}
    >
      <Truck size={16} className="text-white" />
    </div>
  )
}

// =============================================================================
// COLUMN VISIBILITY PANEL
// =============================================================================

function ColumnTogglePanel({
  visible,
  onChange,
  onClose,
}: {
  visible: Set<ColumnKey>
  onChange: (key: ColumnKey, show: boolean) => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute top-10 right-0 z-30 w-52 rounded-xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-200/60"
    >
      <p className="mb-2 px-1 text-xs font-semibold tracking-wider text-slate-400 uppercase">
        Tampilkan kolom
      </p>
      <div className="space-y-0.5">
        {ALL_COLUMNS.map((col) => (
          <label
            key={col.key}
            className={[
              'flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors',
              col.hideable ? 'cursor-pointer hover:bg-slate-50' : 'cursor-not-allowed opacity-50',
            ].join(' ')}
          >
            <input
              type="checkbox"
              checked={visible.has(col.key)}
              disabled={!col.hideable}
              onChange={(e) => col.hideable && onChange(col.key, e.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-300 text-slate-800 focus:ring-slate-800"
            />
            <span className={visible.has(col.key) ? 'text-slate-700' : 'text-slate-400'}>
              {col.label}
            </span>
            {!col.hideable && <span className="ml-auto text-[10px] text-slate-300">selalu</span>}
          </label>
        ))}
      </div>
    </div>
  )
}

// =============================================================================
// COLUMN FILTER DROPDOWN
// =============================================================================

function ColumnFilterChip({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const active = value !== ''

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={[
          'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-all',
          active
            ? 'border-slate-800 bg-slate-800 text-white shadow-sm'
            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50',
        ].join(' ')}
      >
        {active && (
          <span
            onClick={(e) => {
              e.stopPropagation()
              onChange('')
            }}
            className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white/20 hover:bg-white/30"
          >
            <X size={9} className="text-white" />
          </span>
        )}
        <Filter size={13} className={active ? 'text-white' : 'text-slate-400'} />
        {label}
        {active && <span className="font-semibold">: {value}</span>}
        <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-10 left-0 z-30 min-w-[140px] rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl shadow-slate-200/60">
          <button
            onClick={() => {
              onChange('')
              setOpen(false)
            }}
            className={`block w-full px-3 py-1.5 text-left text-sm ${value === '' ? 'font-semibold text-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            All {label}
          </button>
          <div className="my-1 border-t border-slate-100" />
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onChange(opt)
                setOpen(false)
              }}
              className={[
                'flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors',
                value === opt ? 'font-semibold text-slate-800' : 'text-slate-600 hover:bg-slate-50',
              ].join(' ')}
            >
              {value === opt && <CheckCircle2 size={13} className="text-emerald-500" />}
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// =============================================================================
// ACTION MENU (tiap baris tabel) - UPDATED WITH ANOMALY DETECTION
// =============================================================================

function RowActions({
  vehicleId,
  onCheckAnomalies,
}: {
  vehicleId: string
  onCheckAnomalies: () => void
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
        aria-label="Aksi"
      >
        <MoreVertical size={15} />
      </button>

      {open && (
        <div className="absolute top-8 right-0 z-30 w-40 rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl shadow-slate-200/60">
          {/* Check Anomalies - NEW */}
          <button
            onClick={() => {
              onCheckAnomalies()
              setOpen(false)
            }}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-orange-600 transition-colors hover:bg-orange-50"
          >
            <AlertTriangle size={14} />
            Check Anomalies
          </button>

          {/* View Details */}
          <button
            onClick={() => router.push(`/fleet/${vehicleId}`)}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50"
          >
            <Info size={14} className="text-slate-400" />
            View Details
          </button>

          {/* Edit */}
          <button
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50"
          >
            <Pencil size={14} className="text-slate-400" />
            Edit
          </button>

          <div className="my-1 border-t border-slate-100" />

          {/* Delete */}
          <button
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-red-500 transition-colors hover:bg-red-50"
          >
            <Trash2 size={14} />
            Hapus
          </button>
        </div>
      )}
    </div>
  )
}

// =============================================================================
// SUMMARY CARDS
// =============================================================================

function SummaryCards({ vehicles }: { vehicles: Vehicle[] }) {
  const active = vehicles.filter((v) => v.status === 'ACTIVE').length
  const idle = vehicles.filter((v) => v.status === 'IDLE').length
  const repair = vehicles.filter(
    (v) => v.status === 'BROKEN_EN_ROUTE' || v.status === 'MAINTENANCE'
  ).length
  const total = vehicles.length

  const cards = [
    {
      value: active,
      label: 'Active Vehicles',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
    },
    {
      value: idle,
      label: 'Idle Vehicles',
      color: 'text-slate-600',
      bg: 'bg-slate-50',
      border: 'border-slate-200',
    },
    {
      value: repair,
      label: 'In Repair',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
    },
    {
      value: total,
      label: 'Total Fleet',
      color: 'text-slate-800',
      bg: 'bg-white',
      border: 'border-slate-200',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className={`rounded-2xl border ${c.border} ${c.bg} p-5`}>
          <p className={`text-3xl font-bold ${c.color}`}>{c.value}</p>
          <p className={`mt-1 text-sm font-medium ${c.color}`}>{c.label}</p>
        </div>
      ))}
    </div>
  )
}

// =============================================================================
// PAGE UTAMA
// =============================================================================

export default function FleetPage() {
  const router = useRouter()
  const { detect, loading, error } = useAnomalyDetection()

  // ── State ──────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterYear, setFilterYear] = useState('')
  const [filterFuel, setFilterFuel] = useState('')

  const [sortKey, setSortKey] = useState<ColumnKey | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>(null)

  const [visibleCols, setVisibleCols] = useState<Set<ColumnKey>>(
    new Set(ALL_COLUMNS.map((c) => c.key))
  )
  const [showColPanel, setShowColPanel] = useState(false)

  // ── Anomaly Detection State - NEW ─────────────────────────────────────────
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null)
  const [anomalies, setAnomalies] = useState<AnomalyResult[] | null>(null)

  // ── Derived filter options ──────────────────────────────────────────────────
  const years = useMemo(
    () => [...new Set(DUMMY_VEHICLES.map((v) => String(v.year)))].sort((a, b) => +b - +a),
    []
  )
  const types = useMemo(() => [...new Set(DUMMY_VEHICLES.map((v) => v.type))].sort(), [])
  const fuels = useMemo(() => [...new Set(DUMMY_VEHICLES.map((v) => v.fuel_type))].sort(), [])
  const statuses: VehicleStatus[] = ['ACTIVE', 'IDLE', 'BROKEN_EN_ROUTE', 'MAINTENANCE', 'OFFLINE']

  // ── Filtered + sorted data ─────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let data = [...DUMMY_VEHICLES]

    if (search)
      data = data.filter(
        (v) =>
          v.plate_number.toLowerCase().includes(search.toLowerCase()) ||
          v.type.toLowerCase().includes(search.toLowerCase())
      )
    if (filterStatus) data = data.filter((v) => v.status === filterStatus)
    if (filterType) data = data.filter((v) => v.type === filterType)
    if (filterYear) data = data.filter((v) => String(v.year) === filterYear)
    if (filterFuel) data = data.filter((v) => v.fuel_type === filterFuel)

    if (sortKey && sortDir) {
      data.sort((a, b) => {
        const av = a[sortKey]
        const bv = b[sortKey]
        const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true })
        return sortDir === 'asc' ? cmp : -cmp
      })
    }

    return data
  }, [search, filterStatus, filterType, filterYear, filterFuel, sortKey, sortDir])

  // ── Sort toggle ─────────────────────────────────────────────────────────────
  const handleSort = (key: ColumnKey) => {
    if (sortKey !== key) {
      setSortKey(key)
      setSortDir('asc')
    } else if (sortDir === 'asc') setSortDir('desc')
    else if (sortDir === 'desc') {
      setSortKey(null)
      setSortDir(null)
    }
  }

  const SortIcon = ({ col }: { col: ColumnKey }) => {
    if (sortKey !== col) return <ArrowUpDown size={13} className="text-slate-300" />
    if (sortDir === 'asc') return <ArrowUp size={13} className="text-slate-700" />
    return <ArrowDown size={13} className="text-slate-700" />
  }

  // ── Column toggle ───────────────────────────────────────────────────────────
  const toggleCol = (key: ColumnKey, show: boolean) => {
    setVisibleCols((prev) => {
      const next = new Set(prev)
      if (show) {
        next.add(key)
      } else {
        next.delete(key)
      }
      return next
    })
  }

  const hiddenCount = ALL_COLUMNS.filter((c) => c.hideable && !visibleCols.has(c.key)).length

  // ── Active filters count ────────────────────────────────────────────────────
  const activeFilterCount = [filterStatus, filterType, filterYear, filterFuel].filter(
    Boolean
  ).length

  // ── Anomaly Detection Handler - NEW ─────────────────────────────────────────
  const handleCheckAnomalies = async (vehicleId: string) => {
    setSelectedVehicleId(vehicleId)
    const result = await detect(vehicleId, 15) // Check last 15 minutes
    setAnomalies(result)
  }

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-screen-xl space-y-5 p-5 lg:p-7">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 lg:text-3xl">
            Fleet Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">Manage and monitor your vehicle fleet</p>
        </div>
        {/* TODO: Hubungkan ke modal Add Vehicle atau router.push('/fleet/new') */}
        <button className="flex flex-shrink-0 items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-700 active:scale-[0.98]">
          <Plus size={16} />
          <span className="hidden sm:inline">Add Vehicle</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* ── Search + Filters ─────────────────────────────────────────────── */}
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {/* Row 1: Search + Column toggle */}
        <div className="flex gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by plate number or type..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-9 text-sm text-slate-700 transition-all placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-100 focus:outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Column visibility toggle */}
          <div className="relative">
            <button
              onClick={() => setShowColPanel((o) => !o)}
              className={[
                'flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all',
                showColPanel || hiddenCount > 0
                  ? 'border-slate-800 bg-slate-800 text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white',
              ].join(' ')}
            >
              <SlidersHorizontal size={14} />
              <span className="hidden sm:inline">Columns</span>
              {hiddenCount > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold">
                  {hiddenCount}
                </span>
              )}
            </button>

            {showColPanel && (
              <ColumnTogglePanel
                visible={visibleCols}
                onChange={toggleCol}
                onClose={() => setShowColPanel(false)}
              />
            )}
          </div>
        </div>

        {/* Row 2: Per-column filter chips */}
        <div className="flex flex-wrap gap-2">
          <ColumnFilterChip
            label="Status"
            value={filterStatus}
            options={statuses}
            onChange={setFilterStatus}
          />
          <ColumnFilterChip
            label="Type"
            value={filterType}
            options={types}
            onChange={setFilterType}
          />
          <ColumnFilterChip
            label="Year"
            value={filterYear}
            options={years}
            onChange={setFilterYear}
          />
          <ColumnFilterChip
            label="Fuel"
            value={filterFuel}
            options={fuels}
            onChange={setFilterFuel}
          />

          {/* Clear all */}
          {activeFilterCount > 0 && (
            <button
              onClick={() => {
                setFilterStatus('')
                setFilterType('')
                setFilterYear('')
                setFilterFuel('')
              }}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:text-slate-600"
            >
              <X size={13} />
              Clear all ({activeFilterCount})
            </button>
          )}
        </div>

        {/* Result count */}
        <p className="text-xs text-slate-400">
          {filtered.length} dari {DUMMY_VEHICLES.length} kendaraan
          {(search || activeFilterCount > 0) && ' (difilter)'}
        </p>
      </div>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                {/* Plate Number — selalu tampil */}
                <th
                  className="group cursor-pointer px-5 py-3.5 text-left"
                  onClick={() => handleSort('plate_number')}
                >
                  <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-slate-500 uppercase transition-colors group-hover:text-slate-700">
                    Plate Number <SortIcon col="plate_number" />
                  </div>
                </th>

                {/* Kolom yang bisa di-toggle */}
                {ALL_COLUMNS.slice(1).map((col) =>
                  !visibleCols.has(col.key) ? null : (
                    <th
                      key={col.key}
                      className="group cursor-pointer px-5 py-3.5 text-left"
                      onClick={() => handleSort(col.key)}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase transition-colors group-hover:text-slate-700">
                        {col.label} <SortIcon col={col.key} />
                      </div>
                    </th>
                  )
                )}

                {/* Actions — selalu tampil */}
                <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={visibleCols.size + 2}
                    className="px-5 py-16 text-center text-sm text-slate-400"
                  >
                    <Truck size={32} className="mx-auto mb-3 text-slate-200" />
                    Tidak ada kendaraan yang cocok dengan filter saat ini.
                    <br />
                    <button
                      onClick={() => {
                        setSearch('')
                        setFilterStatus('')
                        setFilterType('')
                        setFilterYear('')
                        setFilterFuel('')
                      }}
                      className="mt-2 font-medium text-slate-600 hover:underline"
                    >
                      Reset semua filter
                    </button>
                  </td>
                </tr>
              ) : (
                filtered.map((vehicle, i) => (
                  <tr
                    key={vehicle.id}
                    className="group transition-colors duration-100 hover:bg-slate-50/70"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    {/* Plate Number */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <PlateIcon type={vehicle.type} />
                        <span className="text-sm leading-tight font-bold tracking-wide text-slate-800">
                          {vehicle.plate_number.split(' ').map((part, idx) => (
                            <span key={idx} className="block">
                              {part}
                            </span>
                          ))}
                        </span>
                      </div>
                    </td>

                    {/* Type */}
                    {visibleCols.has('type') && (
                      <td className="px-5 py-4 text-sm text-slate-600">{vehicle.type}</td>
                    )}

                    {/* Capacity */}
                    {visibleCols.has('capacity_kg') && (
                      <td className="px-5 py-4">
                        <div className="text-sm font-medium text-slate-700">
                          {vehicle.capacity_kg.toLocaleString()} kg
                        </div>
                        <div className="text-xs text-slate-400">
                          {vehicle.capacity_m3.toLocaleString()} m³
                        </div>
                      </td>
                    )}

                    {/* Fuel Type */}
                    {visibleCols.has('fuel_type') && (
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <Fuel size={13} className="flex-shrink-0 text-slate-400" />
                          {vehicle.fuel_type}
                        </div>
                      </td>
                    )}

                    {/* Year */}
                    {visibleCols.has('year') && (
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <CalendarDays size={13} className="flex-shrink-0 text-slate-400" />
                          {vehicle.year}
                        </div>
                      </td>
                    )}

                    {/* Status */}
                    {visibleCols.has('status') && (
                      <td className="px-5 py-4">
                        <StatusBadge status={vehicle.status} />
                      </td>
                    )}

                    {/* Last Maintenance */}
                    {visibleCols.has('last_maintenance') && (
                      <td className="px-5 py-4 text-sm text-slate-500 tabular-nums">
                        {vehicle.last_maintenance}
                      </td>
                    )}

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        {/* TODO: Hubungkan ke router.push(`/fleet/${vehicle.id}`) */}
                        <button
                          onClick={() => router.push(`/fleet/${vehicle.id}`)}
                          className="rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-800"
                        >
                          View Details
                        </button>
                        <RowActions
                          vehicleId={vehicle.id}
                          onCheckAnomalies={() => handleCheckAnomalies(vehicle.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
            <p className="text-xs text-slate-400">
              Menampilkan <span className="font-semibold text-slate-600">{filtered.length}</span>{' '}
              kendaraan
            </p>
            {/* TODO: Implementasi pagination saat data dari API */}
            <p className="text-xs text-slate-300">Halaman 1 dari 1</p>
          </div>
        )}
      </div>

      {/* ── Summary Cards ────────────────────────────────────────────────── */}
      <SummaryCards vehicles={DUMMY_VEHICLES} />

      {/* ── AI Anomaly Detection Panel - NEW ────────────────────────────── */}
      {selectedVehicleId && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
                <AlertTriangle size={20} className="text-orange-500" />
                Anomaly Detection Results
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Vehicle: {DUMMY_VEHICLES.find((v) => v.id === selectedVehicleId)?.plate_number}
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedVehicleId(null)
                setAnomalies(null)
              }}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={20} />
            </button>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
                <p className="text-sm text-slate-500">Analyzing vehicle anomalies...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {anomalies && !loading && (
            <AnomalyAlerts vehicleId={selectedVehicleId} lastGpsMinutesAgo={15} />
          )}
        </div>
      )}
    </div>
  )
}
