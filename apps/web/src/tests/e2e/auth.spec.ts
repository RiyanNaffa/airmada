/**
 * E2E test — alur login.
 *
 * @location apps/web/src/tests/e2e/auth.spec.ts
 *
 * Jalankan: npm run test:e2e --workspace=apps/web
 * Butuh: NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY di env
 */
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('halaman login tampil dengan benar', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveTitle(/aiRMADA/)
    await expect(page.locator('h1')).toContainText('aiRMADA')
  })

  test('redirect ke /overview setelah login berhasil', async ({ page: _page }) => {
    // TODO: isi dengan kredensial test dari environment variable
    // await page.goto('/login')
    // await page.fill('[name="email"]', process.env.TEST_EMAIL!)
    // await page.fill('[name="password"]', process.env.TEST_PASSWORD!)
    // await page.click('button[type="submit"]')
    // await expect(page).toHaveURL('/overview')
    test.skip() // hapus skip setelah login form diimplementasi
  })

  test('redirect ke /login jika belum autentikasi', async ({ page }) => {
    await page.goto('/overview')
    await expect(page).toHaveURL(/\/login/)
  })
})
