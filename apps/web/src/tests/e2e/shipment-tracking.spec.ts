/**
 * E2E test — public tracking paket tanpa login.
 *
 * @location apps/web/src/tests/e2e/shipment-tracking.spec.ts
 */
import { test, expect } from '@playwright/test'

test.describe('Public Shipment Tracking', () => {
  test('endpoint tracking publik merespons tanpa auth', async ({ request }) => {
    const res = await request.get('/api/shipments/track/ARM-2024-XXXXX')
    // 404 karena kode tidak ada, bukan 401 (artinya tidak butuh auth)
    expect(res.status()).not.toBe(401)
  })
})
