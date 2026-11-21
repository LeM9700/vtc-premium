import { afterEach, describe, expect, it, vi } from 'vitest'
import { POST } from '@/app/api/chat/consent/route'
import { verifyConsentProof } from '@/lib/eliaTokens'

describe('POST /api/chat/consent', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('émet une preuve signée same-origin sans cookie ni PII', async () => {
    vi.stubEnv('DEVIS_SECRET', 'test-secret-at-least-32-characters-long')
    const response = await POST(new Request('https://vtcland.test/api/chat/consent', {
      method: 'POST',
      headers: { origin: 'https://vtcland.test', 'sec-fetch-site': 'same-origin', host: 'vtcland.test' },
    }))
    const body = await response.json() as { consentProof: string }
    expect(response.status).toBe(201)
    expect(response.headers.get('set-cookie')).toBeNull()
    expect(verifyConsentProof(body.consentProof, process.env.DEVIS_SECRET!, Date.now())).not.toBeNull()
  })

  it('refuse une origine tierce et échoue fermé sans secret', async () => {
    vi.stubEnv('DEVIS_SECRET', 'test-secret-at-least-32-characters-long')
    expect((await POST(new Request('https://vtcland.test/api/chat/consent', {
      method: 'POST', headers: { origin: 'https://evil.test', 'sec-fetch-site': 'cross-site' },
    }))).status).toBe(403)
    vi.stubEnv('DEVIS_SECRET', '')
    expect((await POST(new Request('https://vtcland.test/api/chat/consent', {
      method: 'POST', headers: { origin: 'https://vtcland.test' },
    }))).status).toBe(503)
  })

  it('accepte une origine publique même si request.url diffère (proxy inverse type Railway)', async () => {
    vi.stubEnv('DEVIS_SECRET', 'test-secret-at-least-32-characters-long')
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://vtc-premium-web-production.up.railway.app')
    // Comme derrière Railway : request.url interne diffère de l'origine publique réelle.
    const response = await POST(new Request('http://127.0.0.1:8080/api/chat/consent', {
      method: 'POST',
      headers: {
        origin: 'https://vtc-premium-web-production.up.railway.app',
        'sec-fetch-site': 'same-origin',
        host: 'vtc-premium-web-production.up.railway.app',
        'x-forwarded-proto': 'https',
      },
    }))
    expect(response.status).toBe(201)
  })
})
