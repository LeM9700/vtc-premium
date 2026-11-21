import { describe, expect, it } from 'vitest'
import { scrubSentryEvent, scrubSentryTransaction } from '@/lib/sentryPrivacy'

describe('scrubSentryEvent', () => {
  it('retire requête, utilisateur, breadcrumbs et extras susceptibles de contenir des PII', () => {
    expect(scrubSentryEvent({
      request: { data: { email: 'ada@example.com' }, headers: { authorization: 'secret' } },
      user: { email: 'ada@example.com' }, breadcrumbs: [{ message: 'adresse client' }],
      extra: { history: 'texte utilisateur' }, message: 'Erreur générique',
    } as never)).toEqual({ message: 'Erreur générique' })
  })
})

describe('scrubSentryTransaction', () => {
  it('écarte entièrement le tracing des routes Élia', () => {
    expect(scrubSentryTransaction({ transaction: 'POST /api/chat', request: { url: '/api/chat?message=secret' } } as never)).toBeNull()
    expect(scrubSentryTransaction({ transaction: 'POST /api/devis', request: { data: 'PII' } } as never)).toBeNull()
  })

  it('retire URL, requête, utilisateur et données annexes des autres transactions', () => {
    expect(scrubSentryTransaction({ transaction: 'GET /', request: { url: '/?email=a@b.test' }, user: { email: 'a@b.test' }, extra: { body: 'secret' } } as never))
      .toEqual({ transaction: 'GET /' })
  })
})
