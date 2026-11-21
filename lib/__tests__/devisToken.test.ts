import { afterEach, describe, expect, it, vi } from 'vitest'

describe('token de devis anti-bot', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('refuse une soumission irréaliste puis autorise le même token après le délai minimal', async () => {
    vi.stubEnv('DEVIS_SECRET', 'secret-de-test-suffisamment-long')
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-21T08:00:00Z'))
    const { consumeDevisToken, issueDevisToken } = await import('@/lib/devisToken')
    const confirmed = { type: 'distance', departure: 'Nîmes' }
    const token = issueDevisToken(confirmed)
    expect(consumeDevisToken(token, confirmed, 1_000)).toBe(false)
    vi.advanceTimersByTime(1_000)
    expect(consumeDevisToken(token, { ...confirmed, departure: 'Paris' }, 1_000)).toBe(false)
    expect(consumeDevisToken(token, confirmed, 1_000)).toBe(true)
    expect(consumeDevisToken(token, confirmed, 1_000)).toBe(false)
  })

  it('échoue fermé en production quand DEVIS_SECRET est absent', async () => {
    vi.stubEnv('DEVIS_SECRET', '')
    vi.stubEnv('NODE_ENV', 'production')
    const { issueDevisToken } = await import('@/lib/devisToken')
    expect(() => issueDevisToken({ type: 'distance' })).toThrow(/DEVIS_SECRET/)
  })
})
