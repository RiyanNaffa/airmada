import { describe, it, expect } from 'vitest'
import { generateTrackingCode } from '@/lib/utils/tracking-code'

describe('generateTrackingCode', () => {
  it('menghasilkan format ARM-YYYY-XXXXX', () => {
    const code = generateTrackingCode()
    expect(code).toMatch(/^ARM-\d{4}-[A-Z0-9]{5}$/)
  })

  it('setiap kode unik', () => {
    const codes = new Set(Array.from({ length: 10 }, generateTrackingCode))
    expect(codes.size).toBe(10)
  })
})
