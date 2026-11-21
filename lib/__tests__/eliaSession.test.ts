import { beforeEach, describe, expect, it } from 'vitest'
import {
  ELIA_CONSENT_KEY,
  ELIA_SESSION_KEY,
  loadEliaSession,
  purgeEliaPrivateSession,
  saveEliaSession,
} from '@/lib/eliaSession'

const greeting = 'Bonjour, je suis Élia.'

describe('session Élia', () => {
  beforeEach(() => sessionStorage.clear())

  it('sauvegarde et restaure messages, brouillon, état, compteur et ouverture', () => {
    saveEliaSession(sessionStorage, {
      messages: [
        { id: 'a', role: 'assistant', content: greeting, createdAt: '2026-11-21T08:00:00.000Z' },
        { id: 'u', role: 'user', content: 'Un transfert', createdAt: '2026-11-21T08:01:00.000Z' },
      ],
      draft: 'demain matin',
      collectedState: { type: 'airport' },
      userMessageCount: 1,
      isOpen: true,
      readyForConfirmation: true,
      devisToken: 'history.payload.signature',
      quickReplies: ['Oui', 'Non'],
      historyToken: 'history-token.payload.signature',
      consentProof: 'consent-token.payload.signature',
      updatedAt: 1_000,
    })
    sessionStorage.setItem(ELIA_CONSENT_KEY, 'true')

    expect(loadEliaSession(sessionStorage, greeting, 2_000)).toMatchObject({
      draft: 'demain matin',
      collectedState: { type: 'airport' },
      userMessageCount: 1,
      isOpen: true,
      readyForConfirmation: true,
      devisToken: 'history.payload.signature',
      quickReplies: ['Oui', 'Non'],
      historyToken: 'history-token.payload.signature',
      consentProof: 'consent-token.payload.signature',
      hasConsent: true,
    })
    expect(loadEliaSession(sessionStorage, greeting, 2_000).messages).toHaveLength(2)
  })

  it('valide strictement les valeurs de confirmation restaurées', () => {
    saveEliaSession(sessionStorage, {
      messages: [{ id: 'a', role: 'assistant', content: greeting }],
      draft: '', collectedState: {}, userMessageCount: 0, isOpen: false,
      readyForConfirmation: 'yes' as never,
      devisToken: '<script>' as never,
      quickReplies: ['Oui', '<b>Non</b>', 42] as never,
      historyToken: 'not a token' as never,
      consentProof: 'also invalid' as never,
      updatedAt: 1_000,
    })

    expect(loadEliaSession(sessionStorage, greeting, 2_000)).toMatchObject({
      readyForConfirmation: false,
      devisToken: undefined,
      quickReplies: ['Oui'],
      historyToken: undefined,
      consentProof: undefined,
    })
  })

  it('ne restaure jamais le consentement sans preuve restaurable dans l’état', () => {
    saveEliaSession(sessionStorage, {
      messages: [{ id: 'a', role: 'assistant', content: greeting }],
      draft: '', collectedState: {}, userMessageCount: 0, isOpen: false,
      consentProof: 'preuve.valide', updatedAt: 1_000,
    })
    expect(loadEliaSession(sessionStorage, greeting, 2_000).hasConsent).toBe(false)

    sessionStorage.setItem(ELIA_CONSENT_KEY, 'true')
    saveEliaSession(sessionStorage, {
      messages: [{ id: 'a', role: 'assistant', content: greeting }],
      draft: '', collectedState: {}, userMessageCount: 0, isOpen: false,
      consentProof: 'preuve invalide', updatedAt: 1_000,
    })

    expect(loadEliaSession(sessionStorage, greeting, 2_000)).toMatchObject({
      hasConsent: false,
      consentProof: undefined,
    })
  })

  it('ne restaure jamais un état prêt sans token devis valide', () => {
    saveEliaSession(sessionStorage, {
      messages: [{ id: 'a', role: 'assistant', content: greeting }],
      draft: '', collectedState: {}, userMessageCount: 0, isOpen: false,
      readyForConfirmation: true, devisToken: 'token invalide', updatedAt: 1_000,
    })
    expect(loadEliaSession(sessionStorage, greeting, 2_000)).toMatchObject({
      readyForConfirmation: false, devisToken: undefined,
    })
  })

  it('écarte un état expiré ou corrompu et repart sans données personnelles', () => {
    sessionStorage.setItem(ELIA_SESSION_KEY, JSON.stringify({
      messages: [{ role: 'user', content: 'secret' }],
      updatedAt: 1,
      draft: 'secret',
    }))
    sessionStorage.setItem(ELIA_CONSENT_KEY, 'true')

    const restored = loadEliaSession(sessionStorage, greeting, 8 * 60 * 1000)
    expect(restored.messages).toEqual([expect.objectContaining({ role: 'assistant', content: greeting })])
    expect(restored.draft).toBe('')
    expect(restored.hasConsent).toBe(false)
    expect(sessionStorage.getItem(ELIA_SESSION_KEY)).toBeNull()
    expect(sessionStorage.getItem(ELIA_CONSENT_KEY)).toBeNull()
  })

  it('purge immédiatement messages, brouillon et données personnelles après succès', () => {
    sessionStorage.setItem(ELIA_SESSION_KEY, '{"private":true}')
    sessionStorage.setItem(ELIA_CONSENT_KEY, 'true')
    purgeEliaPrivateSession(sessionStorage)
    expect(sessionStorage.getItem(ELIA_SESSION_KEY)).toBeNull()
    expect(sessionStorage.getItem(ELIA_CONSENT_KEY)).toBe('true')
  })
})
