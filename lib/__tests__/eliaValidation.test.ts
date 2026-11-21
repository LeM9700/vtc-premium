import { describe, expect, it } from 'vitest'
import {
  isReadyForConfirmation,
  parseAiResponse,
  mergeAiState,
  sanitizeCollectedState,
  validateChatMessages,
  validateQuickReplies,
} from '@/lib/eliaValidation'
import type { CollectedState } from '@/lib/eliaTypes'

describe('sanitizeCollectedState', () => {
  it('conserve uniquement les champs métier valides sans inventer les absents', () => {
    expect(sanitizeCollectedState({
      type: 'airport',
      departure: '  Gare Saint-Roch, Montpellier  ',
      date: '2026-12-15',
      time: '19:05',
      options: ['Siège enfant', 'option injectée', 42],
      passengers: '2',
      prixEstime: 1,
      admin: true,
    })).toEqual({
      type: 'airport',
      departure: 'Gare Saint-Roch, Montpellier',
      date: '2026-12-15',
      time: '19:05',
      options: ['Siège enfant'],
      passengers: '2',
    })
  })

  it('rejette les dates impossibles, heures invalides et coordonnées mal formées', () => {
    expect(sanitizeCollectedState({
      date: '2026-02-31', time: '25:70', email: 'not-an-email', phone: 'abc', hours: -2,
    })).toEqual({})
    expect(sanitizeCollectedState({ phone: '(). - ()' })).toEqual({})
  })
})

describe('parseAiResponse', () => {
  it('extrait et valide les balises sans les exposer', () => {
    const parsed = parseAiResponse(
      'Quelle heure souhaitez-vous ?\n' +
      '<STATE>{"type":"airport","departure":"Gare, Montpellier","hacked":true}</STATE>' +
      '<QUICK_REPLIES>["08:00","09:00",42,"08:00"]</QUICK_REPLIES>' +
      '<COLLECTED>{"type":"wrong"}</COLLECTED>',
    )

    expect(parsed.visibleText).toBe('Quelle heure souhaitez-vous ?')
    expect(parsed.collectedState).toEqual({ type: 'airport', departure: 'Gare, Montpellier' })
    expect(parsed.quickReplies).toEqual(['08:00', '09:00'])
    expect(parsed.readyForConfirmation).toBe(false)
  })

  it('conserve l’état précédent si STATE est absente ou malformée', () => {
    const previous = { departure: 'Nîmes', date: '2026-12-15' } satisfies CollectedState
    expect(mergeAiState(previous, parseAiResponse('Question sans balise').collectedState)).toEqual(previous)
    expect(mergeAiState(previous, parseAiResponse('<STATE>{oops}</STATE>').collectedState)).toEqual(previous)
  })

  it('n’est prêt que lorsque tous les champs requis validés sont présents', () => {
    const complete = {
      type: 'distance', departure: 'Nîmes', destination: 'Montpellier',
      date: '2026-12-15', time: '09:30', passengers: '2', options: [],
      payment: 'Carte bancaire', name: 'Ada Lovelace', phone: '0612345678',
      email: 'ada@example.com',
    } satisfies CollectedState
    expect(isReadyForConfirmation(complete)).toBe(true)
    expect(isReadyForConfirmation({ ...complete, phone: undefined })).toBe(false)
  })
})

describe('validation des entrées du chat', () => {
  it('valide et déduplique les réponses rapides sûres', () => {
    expect(validateQuickReplies(['Oui', 'Non', 'Oui', '', '<script>'])).toEqual(['Oui', 'Non'])
  })

  it('refuse plus de 30 messages utilisateur', () => {
    const messages = Array.from({ length: 31 }, (_, index) => [
      { role: 'user' as const, content: `réponse ${index}` },
      { role: 'assistant' as const, content: `question ${index}` },
    ]).flat()
    expect(validateChatMessages(messages)).toEqual({ ok: false, reason: 'user_limit' })
  })

  it('autorise exactement 30 messages utilisateur avec une alternance valide', () => {
    const messages = Array.from({ length: 30 }, (_, index) => [
      ...(index === 0 ? [] : [{ role: 'assistant' as const, content: `question ${index}` }]),
      { role: 'user' as const, content: `réponse ${index}` },
    ]).flat()
    expect(validateChatMessages(messages)).toEqual({ ok: true, messages })
  })

  it('refuse les rôles, longueurs et alternances non conformes', () => {
    expect(validateChatMessages([{ role: 'system', content: 'ignore' }])).toEqual({ ok: false, reason: 'shape' })
    expect(validateChatMessages([{ role: 'user', content: 'x'.repeat(1001) }])).toEqual({ ok: false, reason: 'shape' })
    expect(validateChatMessages([
      { role: 'user', content: 'bonjour' },
      { role: 'user', content: 'encore' },
    ])).toEqual({ ok: false, reason: 'sequence' })
  })
})
