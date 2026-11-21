import { sanitizeCollectedState, validateQuickReplies } from '@/lib/eliaValidation'
import type { ChatMessage, CollectedState } from '@/lib/eliaTypes'

export const ELIA_SESSION_KEY = 'elia:conversation:v2'
export const ELIA_CONSENT_KEY = 'elia:consent:v1'
export const ELIA_SESSION_TTL_MS = 7 * 60 * 1000

export interface EliaStoredSession {
  messages: ChatMessage[]
  draft: string
  collectedState: CollectedState
  userMessageCount: number
  isOpen: boolean
  readyForConfirmation?: boolean
  devisToken?: string
  quickReplies?: string[]
  historyToken?: string
  consentProof?: string
  updatedAt: number
}

export interface EliaSession extends EliaStoredSession {
  hasConsent: boolean
}

function initialMessage(greeting: string, now: number): ChatMessage {
  return { id: `elia-${now}`, role: 'assistant', content: greeting, createdAt: new Date(now).toISOString() }
}

function emptySession(greeting: string, now: number, hasConsent: boolean): EliaSession {
  return {
    messages: [initialMessage(greeting, now)], draft: '', collectedState: {},
    userMessageCount: 0, isOpen: false, readyForConfirmation: false,
    quickReplies: [], updatedAt: now, hasConsent,
  }
}

function restoreToken(value: unknown): string | undefined {
  if (typeof value !== 'string' || value.length > 4096) return undefined
  return /^[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)+$/.test(value) ? value : undefined
}

export function isRestorableEliaToken(value: unknown): value is string {
  return restoreToken(value) !== undefined
}

function restoreMessages(value: unknown): ChatMessage[] | undefined {
  if (!Array.isArray(value) || value.length === 0 || value.length > 61) return undefined
  const messages: ChatMessage[] = []
  for (const item of value) {
    if (!item || typeof item !== 'object') return undefined
    const message = item as Record<string, unknown>
    if ((message.role !== 'assistant' && message.role !== 'user') || typeof message.content !== 'string' ||
      message.content.length === 0 || message.content.length > 1000) return undefined
    messages.push({
      id: typeof message.id === 'string' ? message.id : `restored-${messages.length}`,
      role: message.role,
      content: message.content,
      createdAt: typeof message.createdAt === 'string' ? message.createdAt : undefined,
    })
  }
  return messages
}

/** Restaure seulement un état récent, strictement validé, depuis sessionStorage. */
export function loadEliaSession(storage: Storage, greeting: string, now = Date.now()): EliaSession {
  const raw = storage.getItem(ELIA_SESSION_KEY)
  if (!raw) return emptySession(greeting, now, false)
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const messages = restoreMessages(parsed.messages)
    if (!messages || typeof parsed.updatedAt !== 'number' || now - parsed.updatedAt > ELIA_SESSION_TTL_MS || now < parsed.updatedAt) {
      throw new Error('expired_or_invalid')
    }
    const count = messages.filter(message => message.role === 'user').length
    if (typeof parsed.userMessageCount !== 'number' || parsed.userMessageCount !== count || count > 30) throw new Error('invalid_count')
    const devisToken = restoreToken(parsed.devisToken)
    const consentProof = restoreToken(parsed.consentProof)
    const hasConsent = storage.getItem(ELIA_CONSENT_KEY) === 'true' && Boolean(consentProof)
    const readyForConfirmation = parsed.readyForConfirmation === true && Boolean(devisToken)
    return {
      messages,
      draft: typeof parsed.draft === 'string' && parsed.draft.length <= 1000 ? parsed.draft : '',
      collectedState: sanitizeCollectedState(parsed.collectedState),
      userMessageCount: count,
      isOpen: parsed.isOpen === true,
      readyForConfirmation,
      devisToken: readyForConfirmation ? devisToken : undefined,
      quickReplies: validateQuickReplies(parsed.quickReplies),
      historyToken: restoreToken(parsed.historyToken),
      consentProof,
      updatedAt: parsed.updatedAt,
      hasConsent,
    }
  } catch {
    storage.removeItem(ELIA_SESSION_KEY)
    storage.removeItem(ELIA_CONSENT_KEY)
    return emptySession(greeting, now, false)
  }
}

/** Écrit la conversation dans le stockage éphémère de l'onglet uniquement. */
export function saveEliaSession(storage: Storage, session: EliaStoredSession): void {
  storage.setItem(ELIA_SESSION_KEY, JSON.stringify(session))
}

/** Supprime toutes les données de conversation/PII après une soumission réussie. */
export function purgeEliaPrivateSession(storage: Storage): void {
  storage.removeItem(ELIA_SESSION_KEY)
}

/** Invalide aussi le consentement lorsque la session devient inactive. */
export function purgeExpiredEliaSession(storage: Storage): void {
  storage.removeItem(ELIA_SESSION_KEY)
  storage.removeItem(ELIA_CONSENT_KEY)
}
