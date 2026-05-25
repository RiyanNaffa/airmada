/**
 * MSW (Mock Service Worker) request handlers untuk unit test.
 * Handler di sini mencegah test melakukan HTTP request nyata.
 *
 * @location apps/web/src/tests/mocks/handlers.ts
 *
 * Cara pakai: di-load otomatis oleh src/tests/mocks/server.ts
 */
import { http, HttpResponse } from 'msw'

export const handlers = [
  // Auth
  http.post('/api/auth/login', () => {
    return HttpResponse.json({
      access_token: 'mock-jwt-token',
      user: {
        id: 'user-001',
        email: 'manager@airmada.com',
        full_name: 'Manager Test',
        role: 'manager',
        phone: null,
        avatar_url: null,
        is_active: true,
        created_at: new Date().toISOString(),
      },
    })
  }),

  // Analytics dashboard
  http.get('/api/analytics/dashboard', () => {
    return HttpResponse.json({
      total_shipments: 42,
      delivered: 35,
      failed: 3,
      in_transit: 4,
      pending: 0,
      active_vehicles: 5,
      success_rate: 83.3,
      on_time_rate: 80.0,
      avg_delivery_time_min: 95,
    })
  }),

  // Shipments list
  http.get('/api/shipments', () => {
    return HttpResponse.json({
      data: [],
      total: 0,
      page: 1,
      limit: 20,
    })
  }),

  // AI chat
  http.post('/api/ai/chat', () => {
    return HttpResponse.json({
      reply: 'Ini adalah balasan mock dari AI.',
      sources: [],
    })
  }),
]
