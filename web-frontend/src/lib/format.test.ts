import { describe, expect, it } from 'vitest'
import { formatCountdown, formatCurrency } from './format'

describe('format helpers', () => {
  it('formats Brazilian ticket prices', () => {
    expect(formatCurrency(42)).toBe('R$ 42')
  })

  it('renders the backend expiration timestamp as a countdown', () => {
    const now = Date.parse('2026-10-18T20:00:00.000Z')
    const expiresAt = new Date(now + 8 * 60 * 1000 + 12_000).toISOString()
    expect(formatCountdown(expiresAt, now)).toBe('08:12')
  })
})
