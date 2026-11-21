import { describe, expect, it } from 'vitest'
import { getClientIp } from '@/lib/rateLimit'

describe('getClientIp', () => {
  it('privilégie les en-têtes d’origine gérés par la plateforme', () => {
    const request = new Request('https://example.test', { headers: {
      'cf-connecting-ip': '203.0.113.10',
      'railway-client-ip': '203.0.113.11',
      'x-real-ip': '203.0.113.12',
      'x-forwarded-for': '1.2.3.4, 203.0.113.13',
    } })
    expect(getClientIp(request)).toBe('203.0.113.10')
  })

  it('utilise le hop proxy le plus proche et ignore les valeurs invalides', () => {
    expect(getClientIp(new Request('https://example.test', { headers: {
      'x-forwarded-for': 'forged-client, 198.51.100.8, 203.0.113.9',
    } }))).toBe('203.0.113.9')
    expect(getClientIp(new Request('https://example.test', { headers: {
      'cf-connecting-ip': 'attacker-controlled', 'x-real-ip': '198.51.100.4',
    } }))).toBe('198.51.100.4')
  })
})
