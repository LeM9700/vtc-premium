import type { AiResponseMetadata, ChatMessage, CollectedState } from '@/lib/eliaTypes'

export const MAX_USER_MESSAGES = 30
export const MAX_MESSAGE_LENGTH = 1000
export const MAX_TOTAL_MESSAGES = MAX_USER_MESSAGES * 2 + 1

const tripTypes = new Set(['airport', 'disposal', 'event', 'distance'])
const allowedOptions = new Set([
  'Grand bagage', 'Siège enfant', 'Accueil personnalisé',
  'Eau & rafraîchissements', 'Discrétion totale',
])
const allowedPayments = new Set(['Carte bancaire', 'Espèces', 'Virement bancaire'])
const metadataPattern = /<\s*(STATE|QUICK_REPLIES|COLLECTED)\s*>[\s\S]*?<\/\s*\1\s*>/gi

function cleanText(value: unknown, maxLength = 200): string | undefined {
  if (typeof value !== 'string') return undefined
  const cleaned = value.trim().replace(/[<>]/g, '')
  return cleaned.length > 0 && cleaned.length <= maxLength ? cleaned : undefined
}

function isRealIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

function parseTagJson(text: string, tag: 'STATE' | 'QUICK_REPLIES' | 'COLLECTED'): unknown {
  const matches = [...text.matchAll(new RegExp(`<\\s*${tag}\\s*>([\\s\\S]*?)<\\/\\s*${tag}\\s*>`, 'gi'))]
  const raw = matches.at(-1)?.[1]
  if (!raw || raw.length > 5000) return undefined
  try {
    return JSON.parse(raw)
  } catch {
    return undefined
  }
}

/** Retire toute clé inconnue et valide chaque valeur produite par le modèle. */
export function sanitizeCollectedState(value: unknown): CollectedState {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const input = value as Record<string, unknown>
  const state: CollectedState = {}
  if (typeof input.type === 'string' && tripTypes.has(input.type)) state.type = input.type as CollectedState['type']

  const departure = cleanText(input.departure)
  const destination = cleanText(input.destination)
  const name = cleanText(input.name, 100)
  if (departure) state.departure = departure
  if (destination) state.destination = destination
  if (name) state.name = name

  if (typeof input.date === 'string' && isRealIsoDate(input.date)) state.date = input.date
  if (typeof input.time === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(input.time)) state.time = input.time
  if (typeof input.passengers === 'string' && /^(?:[1-8])$/.test(input.passengers.trim())) state.passengers = input.passengers.trim()
  if (typeof input.hours === 'number' && Number.isFinite(input.hours) && input.hours >= 0.5 && input.hours <= 24) state.hours = input.hours

  if (Array.isArray(input.options)) {
    state.options = [...new Set(input.options.filter((item): item is string => typeof item === 'string' && allowedOptions.has(item)))]
  }
  if (typeof input.payment === 'string' && allowedPayments.has(input.payment)) state.payment = input.payment
  if (typeof input.phone === 'string' && /^\+?[\d .()-]{8,20}$/.test(input.phone.trim()) && input.phone.replace(/\D/g, '').length >= 8) state.phone = input.phone.trim()
  if (typeof input.email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim()) && input.email.length <= 254) {
    state.email = input.email.trim().toLowerCase()
  }
  return state
}

/** N'autorise que de courts libellés texte, uniques et sans balisage. */
export function validateQuickReplies(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  const replies: string[] = []
  for (const item of value) {
    if (typeof item !== 'string') continue
    const reply = item.trim()
    if (!reply || reply.length > 80 || /[<>]/.test(reply) || replies.includes(reply)) continue
    replies.push(reply)
    if (replies.length === 6) break
  }
  return replies
}

export function isReadyForConfirmation(state: CollectedState): boolean {
  const common = state.type && state.departure && state.date && state.time && state.passengers &&
    state.options && state.payment && state.name && state.phone && state.email
  if (!common) return false
  return state.type === 'disposal' ? typeof state.hours === 'number' : Boolean(state.destination)
}

/** Fusionne uniquement les nouvelles valeurs validées sans effacer l'état acquis. */
export function mergeAiState(previous: CollectedState, next: unknown): CollectedState {
  return { ...previous, ...sanitizeCollectedState(next) }
}

/** Extrait les métadonnées IA non fiables puis renvoie seulement leur version validée. */
export function parseAiResponse(text: string): AiResponseMetadata {
  const partial = sanitizeCollectedState(parseTagJson(text, 'STATE'))
  const completed = sanitizeCollectedState(parseTagJson(text, 'COLLECTED'))
  const candidate = { ...partial, ...completed }
  const readyForConfirmation = isReadyForConfirmation(candidate) && Object.keys(completed).length > 0
  return {
    visibleText: text.replace(metadataPattern, '').trim(),
    collectedState: candidate,
    quickReplies: validateQuickReplies(parseTagJson(text, 'QUICK_REPLIES')),
    readyForConfirmation,
  }
}

export type MessageValidation = { ok: true; messages: ChatMessage[] } | { ok: false; reason: 'shape' | 'sequence' | 'user_limit' | 'total_limit' }

/** Valide taille, rôles, alternance et plafond utilisateur sans faire confiance au client. */
export function validateChatMessages(value: unknown): MessageValidation {
  if (!Array.isArray(value) || value.length === 0) return { ok: false, reason: 'shape' }
  const messages: ChatMessage[] = []
  for (const item of value) {
    if (!item || typeof item !== 'object') return { ok: false, reason: 'shape' }
    const message = item as Record<string, unknown>
    if ((message.role !== 'user' && message.role !== 'assistant') || typeof message.content !== 'string' ||
      message.content.trim().length === 0 || message.content.length > MAX_MESSAGE_LENGTH) {
      return { ok: false, reason: 'shape' }
    }
    messages.push({ role: message.role, content: message.content.trim() })
  }
  if (messages.filter(message => message.role === 'user').length > MAX_USER_MESSAGES) return { ok: false, reason: 'user_limit' }
  if (messages.length > MAX_TOTAL_MESSAGES) return { ok: false, reason: 'total_limit' }
  if (messages.some((message, index) => index > 0 && message.role === messages[index - 1].role)) return { ok: false, reason: 'sequence' }
  if (messages.at(-1)?.role !== 'user') return { ok: false, reason: 'sequence' }
  return { ok: true, messages }
}
