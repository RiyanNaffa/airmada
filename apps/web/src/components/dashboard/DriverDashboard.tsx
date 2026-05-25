import { MapPin, Clock, AlertCircle, Navigation } from 'lucide-react'

export function DriverDashboard() {
  return (
    <div className="space-y-6">
      {/* Driver Status Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DriverStatusCard
          label="Active Shipments"
          value={3}
          icon={<Navigation size={20} className="text-white" />}
          iconBg="bg-blue-500"
          subtitle="In transit"
        />
        <DriverStatusCard
          label="Total Earnings"
          value="485.5k"
          icon={<MapPin size={20} className="text-white" />}
          iconBg="bg-emerald-500"
          subtitle="This week"
        />
        <DriverStatusCard
          label="On-Time Rate"
          value={96}
          unit="%"
          icon={<Clock size={20} className="text-white" />}
          iconBg="bg-violet-500"
          subtitle="Last 30 days"
        />
        <DriverStatusCard
          label="Safety Rating"
          value={4.8}
          unit="/5"
          icon={<AlertCircle size={20} className="text-white" />}
          iconBg="bg-orange-500"
          subtitle="Excellent"
        />
      </div>

      {/* Current Delivery & Performance */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Current Delivery */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-2">
          <h3 className="font-semibold text-slate-800">Current Delivery</h3>
          <p className="mt-1 text-xs text-slate-400">Next shipment in route</p>

          <div className="mt-4 space-y-4">
            <div className="rounded-lg border-2 border-sky-200 bg-sky-50 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-800">ARM-2026-03-000123</p>
                  <p className="mt-1 text-xs text-slate-600">PT Maju Jaya → CV Sejahtera Abadi</p>
                  <div className="mt-3 flex items-center gap-4">
                    <div>
                      <p className="text-xs text-slate-500">DISTANCE</p>
                      <p className="text-sm font-bold text-slate-700">12.5 km</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">ETA</p>
                      <p className="text-sm font-bold text-slate-700">14:30</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">WEIGHT</p>
                      <p className="text-sm font-bold text-slate-700">450 kg</p>
                    </div>
                  </div>
                </div>
                <span className="inline-block rounded-full bg-sky-500 px-3 py-1 text-xs font-bold text-white">
                  In Transit
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <p className="text-xs text-slate-600">Picked up at 13:45</p>
              </div>
              <div className="ml-0.5 h-6 border-l-2 border-dashed border-slate-300" />
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-sky-300" />
                <p className="text-xs text-slate-600">Delivering to recipient...</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800">Quick Actions</h3>
          <p className="mt-1 text-xs text-slate-400">Manage your deliveries</p>

          <div className="mt-4 space-y-2">
            <button className="w-full rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200">
              📍 View GPS Location
            </button>
            <button className="w-full rounded-lg bg-sky-100 px-4 py-2.5 text-sm font-medium text-sky-700 transition-colors hover:bg-sky-200">
              📞 Contact Customer
            </button>
            <button className="w-full rounded-lg bg-emerald-100 px-4 py-2.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-200">
              ✓ Mark Delivered
            </button>
            <button className="w-full rounded-lg bg-orange-100 px-4 py-2.5 text-sm font-medium text-orange-700 transition-colors hover:bg-orange-200">
              ⚠️ Report Issue
            </button>
          </div>
        </div>
      </div>

      {/* Earnings & Statistics */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800">This Week's Earnings</h3>
          <p className="mt-1 text-xs text-slate-400">Delivery statistics</p>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
              <span className="text-sm text-slate-600">Completed Deliveries</span>
              <span className="font-bold text-slate-700">23</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
              <span className="text-sm text-slate-600">Successful Rate</span>
              <span className="font-bold text-emerald-600">100%</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-emerald-50 p-3">
              <span className="text-sm font-medium text-emerald-700">Total Earnings</span>
              <span className="text-lg font-bold text-emerald-700">485.5k IDR</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800">Performance Insights</h3>
          <p className="mt-1 text-xs text-slate-400">Your metrics & goals</p>

          <div className="mt-4 space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">On-Time Delivery</span>
                <span className="text-xs font-bold text-slate-700">96%</span>
              </div>
              <div className="mt-1.5 h-2 rounded-full bg-slate-100">
                <div className="h-full w-[96%] rounded-full bg-emerald-500" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Customer Rating</span>
                <span className="text-xs font-bold text-slate-700">4.8/5.0</span>
              </div>
              <div className="mt-1.5 h-2 rounded-full bg-slate-100">
                <div className="h-full w-[96%] rounded-full bg-sky-500" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Safety Score</span>
                <span className="text-xs font-bold text-slate-700">94%</span>
              </div>
              <div className="mt-1.5 h-2 rounded-full bg-slate-100">
                <div className="h-full w-[94%] rounded-full bg-violet-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DriverStatusCard({
  label,
  value,
  unit,
  icon,
  iconBg,
  subtitle,
}: {
  label: string
  value: string | number
  unit?: string
  icon: React.ReactNode
  iconBg: string
  subtitle: string
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-current opacity-5 transition-all duration-300 group-hover:opacity-10" />
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <div className="mt-1 flex items-baseline gap-1">
            <p className="text-3xl font-bold text-slate-800">{value}</p>
            {unit && <p className="text-sm text-slate-500">{unit}</p>}
          </div>
          <p className="mt-2 text-xs text-slate-500">{subtitle}</p>
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-lg ${iconBg}`}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}
