import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 5)

export function generateTrackingCode(): string {
  const year = new Date().getFullYear()
  return `ARM-${year}-${nanoid()}`
}
