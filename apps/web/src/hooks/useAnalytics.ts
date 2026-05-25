/**
 * Hook untuk fetch data analytics dashboard dengan SWR-like pattern.
 *
 * @location apps/web/src/hooks/useAnalytics.ts
 * TODO: Fetch GET /api/analytics/dashboard, cache dengan React Query atau SWR
 */
// import { useState, useEffect } from 'react'
// import type { DashboardKpi } from '@airmada/types'

// export function useAnalytics(date?: string) {
//   const [data, setData] = useState<DashboardKpi | null>(null)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)

//   useEffect(() => {
//     const params = date ? `?date=${date}` : ''
//     fetch(`/api/analytics/dashboard${params}`)
//       .then((r) => r.json())
//       .then(setData)
//       .catch((e) => setError(e.message))
//       .finally(() => setLoading(false))
//   }, [date])

//   return { data, loading, error }
// }
