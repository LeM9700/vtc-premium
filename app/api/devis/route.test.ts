import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }))
vi.mock('@/lib/devisToken', () => ({ consumeDevisToken: vi.fn(() => true) }))

import { parisLocalToIso, POST } from '@/app/api/devis/route'

describe('formats de date du devis', () => {
  it.each([
    ['2026-12-15', '19:00'],
    ['15/12/2026', '19h00'],
    ['15 décembre 2026', 'à 19h'],
    ['le 1er décembre 2026', '9:05'],
  ])('conserve le support de %s %s', (date, time) => {
    expect(parisLocalToIso(date, time)).toMatch(/^2026-12-(?:15|01)T/)
  })
})

describe('anti-abus /api/devis', () => {
  beforeEach(() => vi.stubGlobal('fetch', vi.fn()))

  it('bloque le honeypot avant l’API métier', async () => {
    const response = await POST(new Request('http://localhost/api/devis', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '198.51.100.7' },
      body: JSON.stringify({ token: 'valid', message2: 'bot' }),
    }) as never)
    expect(response.status).toBe(400)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('refuse un body surdimensionné et un payload métier invalide avant transmission', async () => {
    const tooLarge = await POST(new Request('http://localhost/api/devis', {
      method: 'POST', headers: { 'x-forwarded-for': '198.51.100.8' }, body: JSON.stringify({ padding: 'x'.repeat(20_000) }),
    }) as never)
    expect(tooLarge.status).toBe(413)

    const invalid = await POST(new Request('http://localhost/api/devis', {
      method: 'POST', headers: { 'x-forwarded-for': '198.51.100.9' },
      body: JSON.stringify({ token: 'valid', type: 'distance', departure: 'Nîmes', phone: '....' }),
    }) as never)
    expect(invalid.status).toBe(400)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('ne propage jamais le message brut de l’API métier', async () => {
    vi.stubEnv('VTCLAND_API_URL', 'https://api.example.test')
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ message: 'SQL customer email ada@example.com' }), { status: 422 }))
    const response = await POST(new Request('http://localhost/api/devis', {
      method: 'POST', headers: { 'x-real-ip': '198.51.100.77' },
      body: JSON.stringify({
        token: 'valid', type: 'distance', departure: 'Nîmes', destination: 'Montpellier',
        date: '2026-12-15', time: '09:30', passengers: '2', options: [], payment: 'Carte bancaire',
        name: 'Ada Lovelace', phone: '0612345678', email: 'ada@example.com',
      }),
    }) as never)
    expect(response.status).toBe(422)
    expect(await response.json()).toEqual({ error: 'La demande n’a pas pu être transmise.' })
  })

  it('filtre aussi le message distant sur un succès', async () => {
    vi.stubEnv('VTCLAND_API_URL', 'https://api.example.test')
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({
      message: 'Email interne ada@example.com', reference: 'DEV-42', priceEur: 120,
    }), { status: 201 }))
    const response = await POST(new Request('http://localhost/api/devis', {
      method: 'POST', headers: { 'x-real-ip': '198.51.100.78' },
      body: JSON.stringify({
        token: 'valid', type: 'distance', departure: 'Nîmes', destination: 'Montpellier',
        date: '2026-12-15', time: '09:30', passengers: '2', options: [], payment: 'Carte bancaire',
        name: 'Ada Lovelace', phone: '0612345678', email: 'ada@example.com',
      }),
    }) as never)
    expect(await response.json()).toEqual({ reference: 'DEV-42', priceEur: 120 })
  })

  it('envoie une idempotency-key dérivée courte même pour un token HMAC long', async () => {
    vi.stubEnv('VTCLAND_API_URL', 'https://api.example.test')
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({
      reference: 'DEV-99', priceEur: 50,
    }), { status: 201 }))
    // Le vrai token signé HMAC (lib/devisToken.ts) dépasse largement 128 caractères ;
    // l'API métier centrale rejette toute idempotency-key de plus de 128 caractères
    // (zod .max(128) côté api-vtcland/src/routes/bookings.ts).
    const longToken = 'a'.repeat(40) + '.' + '1'.repeat(13) + '.' + '1'.repeat(13) + '.' + 'b'.repeat(64) + '.' + 'c'.repeat(64)
    expect(longToken.length).toBeGreaterThan(128)
    await POST(new Request('http://localhost/api/devis', {
      method: 'POST', headers: { 'x-real-ip': '198.51.100.79' },
      body: JSON.stringify({
        token: longToken, type: 'distance', departure: 'Nîmes', destination: 'Montpellier',
        date: '2026-12-15', time: '09:30', passengers: '2', options: [], payment: 'Carte bancaire',
        name: 'Ada Lovelace', phone: '0612345678', email: 'ada@example.com',
      }),
    }) as never)
    const sentHeaders = vi.mocked(fetch).mock.calls[0][1] as RequestInit
    const sentKey = (sentHeaders.headers as Record<string, string>)['idempotency-key']
    expect(sentKey.length).toBeLessThanOrEqual(128)
    expect(sentKey.length).toBeGreaterThanOrEqual(16)
    expect(sentKey).toMatch(/^elia:[A-Za-z0-9._:-]+$/)
  })
})
