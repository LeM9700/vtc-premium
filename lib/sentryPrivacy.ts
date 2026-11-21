import type { ErrorEvent } from '@sentry/nextjs'
import type { TransactionEvent } from '@sentry/core'

/** Supprime les emplacements Sentry susceptibles de contenir du texte ou des PII utilisateur. */
export function scrubSentryEvent(event: ErrorEvent): ErrorEvent {
  const safeEvent = { ...event }
  delete safeEvent.request
  delete safeEvent.user
  delete safeEvent.breadcrumbs
  delete safeEvent.extra
  return safeEvent
}

/** Désactive les traces Élia et retire les champs susceptibles de porter des PII ailleurs. */
export function scrubSentryTransaction(event: TransactionEvent): TransactionEvent | null {
  if (/\/api\/(?:chat|devis)(?:\b|\/)/.test(event.transaction ?? '')) return null
  const safeEvent = { ...event }
  delete safeEvent.request
  delete safeEvent.user
  delete safeEvent.breadcrumbs
  delete safeEvent.extra
  return safeEvent
}
