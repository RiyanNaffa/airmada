/**
 * Membangun context string dari data DB untuk dikirim ke AI.
 * Context disesuaikan per role agar AI tidak menjawab di luar data nyata.
 *
 * @location apps/web/src/lib/ai/context-builder.ts
 *
 * Pattern: fetch data relevan → format JSON compact → inject ke system prompt
 *
 * TODO: Implementasi tiap builder sesuai kebutuhan chatbot
 */
import type { UserRole } from '@airmada/types'

export interface AiContext {
  role: UserRole
  date: string
  data: Record<string, unknown>
}

/**
 * Build context untuk manager — semua data + analytics ringkas.
 * TODO: Query Supabase untuk KPI hari ini, kendaraan aktif, paket pending
 */
export async function buildManagerContext(_userId: string): Promise<AiContext> {
  return {
    role: 'MANAGER',
    date: new Date().toISOString().split('T')[0],
    data: {
      // TODO: { kpi, active_vehicles, pending_shipments, top_anomalies }
    },
  }
}

/**
 * Build context untuk dispatcher — shipments + drivers aktif hari ini.
 * TODO: Query shipments in_transit + available drivers
 */
export async function buildDispatcherContext(_userId: string): Promise<AiContext> {
  return {
    role: 'DISPATCHER',
    date: new Date().toISOString().split('T')[0],
    data: {
      // TODO: { today_shipments, active_drivers, pending_assignments }
    },
  }
}

/**
 * Build context untuk driver — hanya data miliknya sendiri.
 * TODO: Query shipments WHERE driver_id = userId AND date = today
 */
export async function buildDriverContext(userId: string): Promise<AiContext> {
  return {
    role: 'DRIVER',
    date: new Date().toISOString().split('T')[0],
    data: {
      driver_id: userId,
      // TODO: { today_shipments, route, completed_count }
    },
  }
}

export function formatContextForPrompt(ctx: AiContext): string {
  return [
    `Tanggal: ${ctx.date}`,
    `Role pengguna: ${ctx.role}`,
    `Data sistem saat ini:`,
    JSON.stringify(ctx.data, null, 2),
  ].join('\n')
}
