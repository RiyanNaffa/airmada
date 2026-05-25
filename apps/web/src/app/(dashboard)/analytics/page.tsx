'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
} from 'recharts'

interface KPIMetrics {
  activeVehicles: number
  onDutyDrivers: number
  pendingShipments: number
  criticalWarnings: number
  totalDistance: number
  averageFuelConsumption: number
  onTimeDeliveryRate: number
  averageDeliveryTime: number
}

interface TrendData {
  date: string
  deliveries: number
}

interface VehicleStatus {
  name: string
  value: number
  color: string
}

interface RecentShipment {
  trackingCode: string
  sender: string
  recipient: string
  weight: string
  priority: string
  status: string
  date: string
}

export default function AnalyticsPage() {
  const [kpiMetrics, setKpiMetrics] = useState<KPIMetrics | null>(null)
  const [trendData, setTrendData] = useState<TrendData[]>([])
  const [vehicleStatus, setVehicleStatus] = useState<VehicleStatus[]>([])
  const [recentShipments, setRecentShipments] = useState<RecentShipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true)
        // Fetch KPI metrics
        const kpiResponse = await fetch('/api/analytics/kpi')
        if (!kpiResponse.ok) throw new Error('Failed to fetch KPI metrics')
        const kpiData = await kpiResponse.json()
        setKpiMetrics(kpiData)

        // Fetch trend data
        const trendResponse = await fetch('/api/analytics/trends?period=7days')
        if (!trendResponse.ok) throw new Error('Failed to fetch trend data')
        const trends = await trendResponse.json()
        setTrendData(trends)

        // Fetch vehicle status
        const vehicleResponse = await fetch('/api/analytics/vehicle-status')
        if (!vehicleResponse.ok) throw new Error('Failed to fetch vehicle status')
        const vehicleData = await vehicleResponse.json()
        setVehicleStatus(vehicleData)

        // Fetch recent shipments
        const shipmentsResponse = await fetch('/api/analytics/recent-shipments')
        if (!shipmentsResponse.ok) throw new Error('Failed to fetch recent shipments')
        const shipmentsData = await shipmentsResponse.json()
        setRecentShipments(shipmentsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="mb-4 text-2xl font-bold">Analytics</h1>
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">Loading analytics data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="mb-4 text-2xl font-bold">Analytics</h1>
        <Card className="border-red-500 bg-red-50 dark:bg-red-900/20">
          <CardContent className="pt-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Welcome back! Here's what's happening with your fleet today.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiMetrics && (
          <>
            <KPICard
              title="Active Vehicles"
              value={kpiMetrics.activeVehicles}
              trend="+8%"
              trendLabel="vs last week"
              icon="🚛"
              color="bg-green-50 dark:bg-green-950"
              borderColor="border-l-4 border-green-500"
            />
            <KPICard
              title="On-Duty Drivers"
              value={kpiMetrics.onDutyDrivers}
              trend="+12%"
              trendLabel="vs last week"
              icon="👤"
              color="bg-blue-50 dark:bg-blue-950"
              borderColor="border-l-4 border-blue-500"
            />
            <KPICard
              title="Pending Shipments"
              value={kpiMetrics.pendingShipments}
              trend="-2%"
              trendLabel="vs last week"
              icon="📦"
              color="bg-purple-50 dark:bg-purple-950"
              borderColor="border-l-4 border-purple-500"
            />
            <KPICard
              title="Critical Warnings"
              value={kpiMetrics.criticalWarnings}
              trend="-2"
              trendLabel="vs last week"
              icon="⚠️"
              color="bg-orange-50 dark:bg-orange-950"
              borderColor="border-l-4 border-orange-500"
            />
          </>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Daily Delivery Trends */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Daily Delivery Trends</CardTitle>
            <CardDescription>Last 7 days performance</CardDescription>
          </CardHeader>
          <CardContent>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trendData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="deliveries"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ fill: '#2563eb', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-8 text-center text-gray-500">Tidak ada data tersedia</p>
            )}
          </CardContent>
        </Card>

        {/* Vehicle Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vehicle Status</CardTitle>
            <CardDescription>Current fleet distribution</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {vehicleStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={vehicleStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {vehicleStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-8 text-center text-gray-500">Tidak ada data</p>
            )}
            <div className="space-y-2">
              {vehicleStatus.map((status, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: status.color }} />
                  <span className="text-gray-700 dark:text-gray-300">{status.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Shipments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Shipments</CardTitle>
          <CardDescription>Latest 5 shipment orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                    Tracking Code
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                    Sender
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                    Recipient
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                    Weight
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentShipments.length > 0 ? (
                  recentShipments.map((shipment, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900/50"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-gray-900 dark:text-white">
                        {shipment.trackingCode}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {shipment.sender}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {shipment.recipient}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {shipment.weight}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded px-2 py-1 text-xs font-medium ${
                            shipment.priority === 'High'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              : shipment.priority === 'Medium'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          }`}
                        >
                          {shipment.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded px-2 py-1 text-xs font-medium ${
                            shipment.status === 'Delivered'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : shipment.status === 'In Transit'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                : shipment.status === 'Pending'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                          }`}
                        >
                          {shipment.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700 dark:text-gray-300">
                        {shipment.date}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      Tidak ada data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// KPI Card Component
interface KPICardProps {
  title: string
  value: number | string
  trend: string
  trendLabel: string
  icon: string
  color: string
  borderColor: string
}

function KPICard({ title, value, trend, trendLabel, icon, color, borderColor }: KPICardProps) {
  return (
    <Card className={`${color} ${borderColor}`}>
      <CardContent className="pt-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          </div>
          <span className="text-3xl">{icon}</span>
        </div>
        <p className="text-xs font-medium text-green-600 dark:text-green-400">
          {trend} <span className="text-gray-600 dark:text-gray-400">{trendLabel}</span>
        </p>
      </CardContent>
    </Card>
  )
}
