'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { track } from '@/lib/analytics'
import {
  ELIA_CONSENT_KEY,
  ELIA_SESSION_TTL_MS,
  isRestorableEliaToken,
  loadEliaSession,
  purgeExpiredEliaSession,
  purgeEliaPrivateSession,
  saveEliaSession,
} from '@/lib/eliaSession'
import { MAX_USER_MESSAGES, mergeAiState } from '@/lib/eliaValidation'
import type { ChatMessage, CollectedField, CollectedState } from '@/lib/eliaTypes'
import type { ContextKey } from '@/lib/systemPrompt'
import { detectSensitiveData, SENSITIVE_DATA_REPLY } from '@/lib/sensitiveData'

interface EliaMessengerProps {
  greeting: string
  contextKey?: ContextKey
}

interface ChatOutcome {
  text: string
  collectedState: CollectedState
  quickReplies: string[]
  readyForConfirmation: boolean
  devisToken?: string
  rateLimited: boolean
  errored: boolean
  preserveState?: boolean
  historyToken?: string
  consentProof?: string
  retryAfterMs?: number
}

interface SuccessResult {
  reference: string
  priceEur: number
}

const SESSION_SAVE_DEBOUNCE_MS = 150
const DRAFT_ACTIVITY_THROTTLE_MS = 1_000

const fieldLabels: Record<CollectedField, string> = {
  type: 'Type de trajet', departure: 'Départ', destination: 'Destination',
  date: 'Date', time: 'Heure', passengers: 'Passagers', hours: 'Durée',
  options: 'Options', payment: 'Paiement', name: 'Nom', phone: 'Téléphone', email: 'Email',
}

const correctionLabels: Record<CollectedField, string> = {
  type: 'le type de trajet', departure: 'le départ', destination: 'la destination',
  date: 'la date', time: 'l’heure', passengers: 'le nombre de passagers', hours: 'la durée',
  options: 'les options', payment: 'le paiement', name: 'le nom', phone: 'le téléphone', email: 'l’email',
}

function messageId(role: ChatMessage['role']): string {
  return `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function displayValue(value: CollectedState[CollectedField]): string {
  if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : 'Aucune'
  return String(value)
}

function messageTime(message: ChatMessage): string {
  if (!message.createdAt) return ''
  const date = new Date(message.createdAt)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(date)
}

/** Lit le protocole SSE du chat sans jamais interpréter les balises IA côté client. */
async function readChatResponse(response: Response, onDelta: (text: string) => void): Promise<ChatOutcome> {
  if (response.status === 429) {
    const retrySeconds = Number(response.headers.get('retry-after'))
    return {
      text: '', collectedState: {}, quickReplies: [], readyForConfirmation: false, rateLimited: true, errored: false,
      retryAfterMs: Number.isFinite(retrySeconds) && retrySeconds > 0 ? Math.min(retrySeconds * 1000, 60_000) : 10_000,
    }
  }
  if (!response.ok || !response.body) {
    return { text: '', collectedState: {}, quickReplies: [], readyForConfirmation: false, rateLimited: false, errored: true }
  }
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let text = ''
  let outcome: ChatOutcome = {
    text: '', collectedState: {}, quickReplies: [], readyForConfirmation: false, rateLimited: false, errored: false,
  }
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const frames = buffer.split('\n\n')
    buffer = frames.pop() ?? ''
    for (const frame of frames) {
      const line = frame.trim()
      if (!line.startsWith('data: ')) continue
      try {
        const event = JSON.parse(line.slice(6)) as Record<string, unknown>
        if (event.type === 'delta' && typeof event.text === 'string') {
          text += event.text
          onDelta(text)
        } else if (event.type === 'done') {
          outcome = {
            text,
            collectedState: (event.collectedState ?? {}) as CollectedState,
            quickReplies: Array.isArray(event.quickReplies) ? event.quickReplies as string[] : [],
            readyForConfirmation: event.readyForConfirmation === true,
            devisToken: typeof event.devisToken === 'string' ? event.devisToken : undefined,
            historyToken: typeof event.historyToken === 'string' ? event.historyToken : undefined,
            consentProof: isRestorableEliaToken(event.consentProof) ? event.consentProof : undefined,
            preserveState: event.preserveState === true,
            rateLimited: false,
            errored: false,
          }
        } else if (event.type === 'error') {
          outcome.errored = true
        }
      } catch {
        // Une frame incomplète ou invalide est ignorée sans casser le dialogue.
      }
    }
  }
  return { ...outcome, text }
}

function CollectedPanel({ state, onCorrect }: { state: CollectedState; onCorrect: (field: CollectedField) => void }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const entries = Object.entries(state).filter((entry): entry is [CollectedField, CollectedState[CollectedField]] => entry[1] !== undefined)
  return (
    <section className="border-b border-[#C9A96E]/15 bg-[#15130f] px-4 py-2">
      <button type="button" aria-expanded={isExpanded} onClick={() => setIsExpanded(value => !value)} className="w-full text-left text-xs font-medium tracking-wide text-[#E4C995]">
        Informations recueillies{entries.length ? ` · ${entries.length}` : ''}
      </button>
      {isExpanded && entries.length > 0 ? (
        <dl className="mt-3 grid gap-2 pb-2 sm:grid-cols-2">
          {entries.map(([field, value]) => (
            <div key={field} className="rounded-xl bg-black/20 px-3 py-2">
              <dt className="text-[10px] uppercase tracking-wider text-[#F5F0E8]/45">{fieldLabels[field]}</dt>
              <dd className="mt-0.5 flex items-start justify-between gap-2 text-xs text-[#F5F0E8]/85">
                <span className="break-words">{displayValue(value)}</span>
                <button type="button" onClick={() => onCorrect(field)} className="shrink-0 text-[#C9A96E] underline underline-offset-2" aria-label={`Corriger ${correctionLabels[field]}`}>
                  Corriger
                </button>
              </dd>
            </div>
          ))}
        </dl>
      ) : isExpanded ? <p className="py-2 text-xs text-[#F5F0E8]/50">Aucune information confirmée pour le moment.</p> : null}
    </section>
  )
}

function Summary({ state, onConfirm, onCorrect, submitting }: {
  state: CollectedState
  onConfirm: () => void
  onCorrect: (field: CollectedField) => void
  submitting: boolean
}) {
  const [choosingField, setChoosingField] = useState(false)
  const fields = Object.entries(state).filter((entry): entry is [CollectedField, CollectedState[CollectedField]] => entry[1] !== undefined)
  return (
    <section aria-labelledby="elia-summary-title" className="rounded-2xl border border-[#C9A96E]/35 bg-[#C9A96E]/10 p-4 text-sm text-[#F5F0E8]">
      <h3 id="elia-summary-title" className="font-medium text-[#E4C995]">Récapitulatif à confirmer</h3>
      <p className="mt-1 text-xs text-[#F5F0E8]/65">Vérifiez les informations recueillies avant l’envoi de votre demande.</p>
      <dl className="mt-3 grid gap-1 text-xs">
        {fields.map(([field, value]) => (
          <div key={field} className="flex justify-between gap-4"><dt className="text-white/50">{fieldLabels[field]}</dt><dd className="text-right">{displayValue(value)}</dd></div>
        ))}
      </dl>
      <div className="mt-4 flex gap-2">
        <button type="button" onClick={onConfirm} disabled={submitting} className="rounded-full bg-[#C9A96E] px-4 py-2 font-medium text-[#0A0A0A] disabled:opacity-50">Confirmer</button>
        <button type="button" onClick={() => setChoosingField(value => !value)} className="rounded-full border border-[#C9A96E]/50 px-4 py-2 text-[#E4C995]">Corriger</button>
      </div>
      {choosingField && (
        <div role="group" aria-label="Champ à corriger" className="mt-3 flex flex-wrap gap-2">
          {fields.map(([field]) => (
            <button key={field} type="button" onClick={() => onCorrect(field)} className="rounded-full border border-white/20 px-3 py-1.5 text-xs">
              Corriger {correctionLabels[field]}
            </button>
          ))}
        </div>
      )}
    </section>
  )
}

export default function EliaMessenger({ greeting, contextKey }: EliaMessengerProps) {
  const titleId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const lastTriggerRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const logRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const rateLimitTimerRef = useRef<number>(undefined)
  const sessionSaveTimerRef = useRef<number>(undefined)
  const draftActivityTimerRef = useRef<number>(undefined)
  const lastDraftActivityRef = useRef(0)
  const sessionExpiredRef = useRef(false)
  const [hydrated, setHydrated] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [hasPassedCta, setHasPassedCta] = useState(false)
  const [hasConsent, setHasConsent] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [collectedState, setCollectedState] = useState<CollectedState>({})
  const [userMessageCount, setUserMessageCount] = useState(0)
  const [quickReplies, setQuickReplies] = useState<string[]>([])
  const [streamingText, setStreamingText] = useState('')
  const [loading, setLoading] = useState(false)
  const [rateLimited, setRateLimited] = useState(false)
  const [readyForConfirmation, setReadyForConfirmation] = useState(false)
  const [devisToken, setDevisToken] = useState<string>()
  const [historyToken, setHistoryToken] = useState<string>()
  const [consentProof, setConsentProof] = useState<string>()
  const [localWarning, setLocalWarning] = useState<string>()
  const [consentError, setConsentError] = useState(false)
  const [lastActivityAt, setLastActivityAt] = useState(() => Date.now())
  const [success, setSuccess] = useState<SuccessResult>()
  const [submissionError, setSubmissionError] = useState(false)
  const [honeypot, setHoneypot] = useState('')

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const restored = loadEliaSession(sessionStorage, greeting)
      sessionExpiredRef.current = false
      setMessages(restored.messages)
      setDraft(restored.draft)
      setCollectedState(restored.collectedState)
      setUserMessageCount(restored.userMessageCount)
      setIsOpen(restored.isOpen)
      setHasConsent(restored.hasConsent)
      setReadyForConfirmation(restored.readyForConfirmation === true)
      setDevisToken(restored.devisToken)
      setQuickReplies(restored.quickReplies ?? [])
      setHistoryToken(restored.historyToken)
      setConsentProof(restored.consentProof)
      setLastActivityAt(restored.updatedAt)
      lastDraftActivityRef.current = restored.updatedAt
      setHydrated(true)
    }, 0)
    return () => window.clearTimeout(timeout)
  }, [greeting])

  useEffect(() => {
    if (!hydrated || success || sessionExpiredRef.current) return
    window.clearTimeout(sessionSaveTimerRef.current)
    sessionSaveTimerRef.current = window.setTimeout(() => {
      if (sessionExpiredRef.current) return
      saveEliaSession(sessionStorage, {
        messages, draft, collectedState, userMessageCount, isOpen, readyForConfirmation,
        devisToken, quickReplies, historyToken, consentProof, updatedAt: lastActivityAt,
      })
    }, SESSION_SAVE_DEBOUNCE_MS)
    return () => window.clearTimeout(sessionSaveTimerRef.current)
  }, [hydrated, messages, draft, collectedState, userMessageCount, isOpen, readyForConfirmation, devisToken, quickReplies, historyToken, consentProof, lastActivityAt, success])

  useEffect(() => {
    if (!hydrated || success) return
    const remaining = Math.max(0, ELIA_SESSION_TTL_MS - (Date.now() - lastActivityAt))
    const timer = window.setTimeout(() => {
      sessionExpiredRef.current = true
      purgeExpiredEliaSession(sessionStorage)
      setMessages([{ id: messageId('assistant'), role: 'assistant', content: greeting, createdAt: new Date().toISOString() }])
      setDraft('')
      setCollectedState({})
      setUserMessageCount(0)
      setQuickReplies([])
      setReadyForConfirmation(false)
      setDevisToken(undefined)
      setHistoryToken(undefined)
      setConsentProof(undefined)
      setHasConsent(false)
      setIsOpen(false)
    }, remaining)
    return () => window.clearTimeout(timer)
  }, [greeting, hydrated, lastActivityAt, success])

  useEffect(() => {
    const target = ctaRef.current?.closest('#contact') ?? ctaRef.current
    if (!target || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(([entry]) => {
      setHasPassedCta(!entry.isIntersecting && entry.boundingClientRect.bottom < 0)
    })
    observer.observe(target)
    return () => observer.disconnect()
  }, [])

  const closeDialog = useCallback(() => {
    dialogRef.current?.close()
    setIsOpen(false)
    ;(lastTriggerRef.current ?? triggerRef.current)?.focus()
  }, [])

  const markDraftActivity = useCallback(() => {
    sessionExpiredRef.current = false
    const now = Date.now()
    const elapsed = now - lastDraftActivityRef.current
    if (elapsed >= DRAFT_ACTIVITY_THROTTLE_MS) {
      window.clearTimeout(draftActivityTimerRef.current)
      lastDraftActivityRef.current = now
      setLastActivityAt(now)
      return
    }
    window.clearTimeout(draftActivityTimerRef.current)
    draftActivityTimerRef.current = window.setTimeout(() => {
      const activityAt = Date.now()
      lastDraftActivityRef.current = activityAt
      setLastActivityAt(activityAt)
    }, DRAFT_ACTIVITY_THROTTLE_MS - elapsed)
  }, [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || !hydrated) return
    if (isOpen && !dialog.open) dialog.showModal()
    if (!isOpen && dialog.open) dialog.close()
    const updateViewport = () => {
      const height = window.visualViewport?.height ?? window.innerHeight
      const offset = window.visualViewport?.offsetTop ?? 0
      dialog.style.setProperty('--elia-viewport-height', `${height}px`)
      dialog.style.setProperty('--elia-viewport-offset', `${offset}px`)
      dialog.style.top = `${offset}px`
      window.requestAnimationFrame(() => {
        const log = logRef.current
        if (log) log.scrollTop = log.scrollHeight
      })
    }
    if (isOpen) {
      const previousBody = {
        overflow: document.body.style.overflow,
        position: document.body.style.position,
        top: document.body.style.top,
        width: document.body.style.width,
      }
      const scrollY = window.scrollY
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      updateViewport()
      window.visualViewport?.addEventListener('resize', updateViewport)
      window.visualViewport?.addEventListener('scroll', updateViewport)
      window.setTimeout(() => inputRef.current?.focus(), 0)
      return () => {
        window.visualViewport?.removeEventListener('resize', updateViewport)
        window.visualViewport?.removeEventListener('scroll', updateViewport)
        document.body.style.overflow = previousBody.overflow
        document.body.style.position = previousBody.position
        document.body.style.top = previousBody.top
        document.body.style.width = previousBody.width
        window.scrollTo(0, scrollY)
      }
    }
  }, [hydrated, isOpen])

  useEffect(() => {
    const log = logRef.current
    if (log) log.scrollTop = log.scrollHeight
  }, [messages, streamingText, loading, readyForConfirmation])

  const openDialog = (event: React.MouseEvent<HTMLButtonElement>) => {
    lastTriggerRef.current = event.currentTarget
    setIsOpen(true)
  }

  const acceptConsent = async () => {
    setConsentError(false)
    try {
      const response = await fetch('/api/chat/consent', { method: 'POST' })
      const result = await response.json() as { consentProof?: unknown }
      if (!response.ok || typeof result.consentProof !== 'string' || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(result.consentProof)) {
        throw new Error('invalid_consent')
      }
      sessionStorage.setItem(ELIA_CONSENT_KEY, 'true')
      sessionExpiredRef.current = false
      setConsentProof(result.consentProof)
      setHasConsent(true)
      setLastActivityAt(Date.now())
      window.setTimeout(() => inputRef.current?.focus(), 0)
    } catch {
      setConsentError(true)
    }
  }

  const sendText = useCallback(async (rawText: string, allowDuringConfirmation = false) => {
    const text = rawText.trim()
    if (!text || loading || (readyForConfirmation && !allowDuringConfirmation) || success || honeypot || userMessageCount >= MAX_USER_MESSAGES) return
    if (detectSensitiveData(text)) {
      sessionExpiredRef.current = false
      setDraft('')
      setLocalWarning(SENSITIVE_DATA_REPLY)
      setLastActivityAt(Date.now())
      return
    }
    const userMessage: ChatMessage = { id: messageId('user'), role: 'user', content: text, createdAt: new Date().toISOString() }
    const history = [...messages, userMessage]
    setMessages(history)
    setDraft('')
    setQuickReplies([])
    setLocalWarning(undefined)
    setLoading(true)
    setStreamingText('')
    setUserMessageCount(count => count + 1)
    sessionExpiredRef.current = false
    setLastActivityAt(Date.now())
    if (userMessageCount === 0) track('chat_started', { contextKey: contextKey ?? 'home' })

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages.slice(1), userMessage].map(({ role, content }) => ({ role, content })),
          contextKey, historyToken, consentProof,
        }),
      })
      const outcome = await readChatResponse(response, setStreamingText)
      setStreamingText('')
      if (outcome.rateLimited) {
        setMessages(current => current.filter(message => message.id !== userMessage.id))
        setUserMessageCount(count => Math.max(0, count - 1))
        setDraft(text)
        setRateLimited(true)
        window.clearTimeout(rateLimitTimerRef.current)
        rateLimitTimerRef.current = window.setTimeout(() => setRateLimited(false), outcome.retryAfterMs ?? 10_000)
        return
      }
      if (outcome.errored) throw new Error('chat_failed')
      if (outcome.text.trim()) {
        setMessages(current => [...current, {
          id: messageId('assistant'), role: 'assistant', content: outcome.text.trim(), createdAt: new Date().toISOString(),
        }])
      }
      if (!outcome.preserveState) setCollectedState(current => mergeAiState(current, outcome.collectedState))
      setQuickReplies(outcome.quickReplies)
      setReadyForConfirmation(outcome.readyForConfirmation)
      setDevisToken(outcome.devisToken)
      if (outcome.historyToken) setHistoryToken(outcome.historyToken)
      if (outcome.consentProof) setConsentProof(outcome.consentProof)
    } catch {
      setMessages(current => current.filter(message => message.id !== userMessage.id))
      setUserMessageCount(count => Math.max(0, count - 1))
      setDraft(text)
      setLocalWarning('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
      window.setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [consentProof, contextKey, historyToken, honeypot, loading, messages, readyForConfirmation, success, userMessageCount])

  const requestCorrection = (field: CollectedField) => {
    setReadyForConfirmation(false)
    setDevisToken(undefined)
    setCollectedState(current => {
      const next = { ...current }
      delete next[field]
      return next
    })
    void sendText(`Je souhaite corriger ${correctionLabels[field]}.`, true)
  }

  useEffect(() => () => {
    window.clearTimeout(rateLimitTimerRef.current)
    window.clearTimeout(sessionSaveTimerRef.current)
    window.clearTimeout(draftActivityTimerRef.current)
  }, [])

  const confirmDevis = async () => {
    if (!devisToken || !readyForConfirmation || loading) return
    setLoading(true)
    setSubmissionError(false)
    try {
      const response = await fetch('/api/devis', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...collectedState, token: devisToken, message2: honeypot }),
      })
      if (!response.ok) throw new Error('devis_failed')
      const result = await response.json() as Partial<SuccessResult>
      if (typeof result.reference !== 'string' || !result.reference.trim() || typeof result.priceEur !== 'number' || !Number.isFinite(result.priceEur)) {
        throw new Error('invalid_devis_response')
      }
      const successResult: SuccessResult = { reference: result.reference, priceEur: result.priceEur }
      setSuccess(successResult)
      purgeEliaPrivateSession(sessionStorage)
      track('request_submitted', { type: collectedState.type ?? 'unknown' })
    } catch {
      setSubmissionError(true)
      track('devis_failed', { reason: 'api_error' })
    } finally {
      setLoading(false)
    }
  }

  const handleDialogKeyDown = (event: React.KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      closeDialog()
      return
    }
    if (event.key !== 'Tab') return
    const focusable = [...event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), summary')]
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable.at(-1)!
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  if (!hydrated) return <div ref={ctaRef} className="h-24" aria-hidden="true" />

  const limitReached = userMessageCount >= MAX_USER_MESSAGES
  return (
    <>
      <div ref={ctaRef} className="relative z-10 max-w-xl rounded-3xl border border-[#C9A96E]/20 bg-[#111] p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-[#C9A96E] font-display text-xl text-black" aria-hidden="true">É</span>
          <div>
            <p className="text-lg text-[#F5F0E8]">Élia</p>
            <p className="text-sm text-[#F5F0E8]/55">Disponible · Réponse immédiate</p>
          </div>
        </div>
        <p className="mt-5 text-sm leading-relaxed text-[#F5F0E8]/65">Préparez votre demande de trajet dans une conversation privée, simple et guidée.</p>
        <button ref={triggerRef} type="button" onClick={openDialog} className="mt-6 rounded-full bg-[#C9A96E] px-6 py-3 text-sm font-medium text-black" aria-haspopup="dialog">
          Ouvrir la conversation avec Élia
        </button>
      </div>

      {hasPassedCta && !isOpen && (
        <button type="button" onClick={openDialog} className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border border-[#C9A96E]/40 bg-[#111] p-2 pr-4 text-sm text-[#F5F0E8] shadow-xl" aria-label="Ouvrir la conversation avec Élia">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[#C9A96E] text-black" aria-hidden="true">É</span>
          Parler à Élia
        </button>
      )}

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onCancel={event => { event.preventDefault(); closeDialog() }}
        onKeyDown={handleDialogKeyDown}
        className="fixed inset-0 m-0 h-[var(--elia-viewport-height,100dvh)] max-h-none w-full max-w-none overflow-hidden bg-[#0D0D0D] p-0 text-[#F5F0E8] backdrop:bg-black/80 md:m-auto md:h-[min(760px,calc(100dvh-3rem))] md:w-[min(680px,calc(100vw-3rem))] md:rounded-3xl md:border md:border-[#C9A96E]/25 md:shadow-2xl"
      >
        <div className="flex h-full min-h-0 flex-col">
          <header className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-[#111] px-4 py-3 pt-[max(.75rem,env(safe-area-inset-top))]">
            <button type="button" onClick={closeDialog} className="grid h-10 w-10 place-items-center rounded-full text-2xl text-[#E4C995]" aria-label="Fermer la conversation">‹</button>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#C9A96E] font-display text-lg text-black" aria-hidden="true">É</span>
            <div>
              <h2 id={titleId} className="font-medium">Conversation avec Élia</h2>
              <p className="text-xs text-[#F5F0E8]/55"><span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-400" />Disponible</p>
            </div>
          </header>

          {hasConsent && <CollectedPanel state={collectedState} onCorrect={requestCorrection} />}

          {!hasConsent ? (
            <div className="grid flex-1 place-items-center overflow-y-auto p-6">
              <div className="max-w-md rounded-3xl border border-[#C9A96E]/25 bg-[#15130f] p-6">
                <h3 className="text-lg text-[#E4C995]">Avant de commencer</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#F5F0E8]/70">Vos réponses seront traitées par nos prestataires techniques et d’intelligence artificielle uniquement pour préparer votre devis.</p>
                <a href="/politique-de-confidentialite" className="mt-3 inline-block text-sm text-[#E4C995] underline underline-offset-2">Politique de confidentialité</a>
                <button type="button" onClick={() => void acceptConsent()} className="mt-6 block w-full rounded-full bg-[#C9A96E] px-5 py-3 font-medium text-black">Accepter et commencer</button>
                {consentError && <p role="alert" className="mt-3 text-sm text-red-300">Le consentement n’a pas pu être enregistré. Réessayez.</p>}
              </div>
            </div>
          ) : (
            <>
              <div ref={logRef} role="log" aria-live="polite" aria-label="Messages avec Élia" className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-5 overscroll-contain sm:px-6">
                {messages.map(message => (
                  <article key={message.id} className={`flex items-end gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.role === 'assistant' && <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#C9A96E] text-xs text-black" aria-hidden="true">É</span>}
                    <div className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${message.role === 'user' ? 'rounded-br-md bg-[#C9A96E] text-black' : 'rounded-bl-md bg-[#232323] text-[#F5F0E8]'}`}>
                      <span className="sr-only">{message.role === 'assistant' ? 'Élia : ' : 'Vous : '}</span>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      {messageTime(message) && <time className={`mt-1 block text-[10px] ${message.role === 'user' ? 'text-black/55' : 'text-white/40'}`}>{messageTime(message)}</time>}
                    </div>
                  </article>
                ))}
                {loading && !streamingText && <div role="status" aria-label="Élia écrit…" className="ml-9 w-fit rounded-2xl bg-[#232323] px-4 py-3 text-xs text-white/60">Élia écrit<span aria-hidden="true" className="elia-typing">…</span></div>}
                {streamingText && <div aria-hidden="true" className="ml-9 max-w-[82%] rounded-2xl bg-[#232323] px-4 py-2.5 text-sm">{streamingText}</div>}
                {localWarning && <p role="alert" className="rounded-xl border border-amber-500/30 bg-amber-950/30 p-3 text-sm text-amber-100">{localWarning}</p>}
                {quickReplies.length > 0 && !loading && (
                  <div aria-label="Réponses suggérées" className="ml-9 flex flex-wrap gap-2">
                    {quickReplies.map(reply => <button type="button" key={reply} onClick={() => void sendText(reply)} className="rounded-full border border-[#C9A96E]/50 px-3 py-2 text-xs text-[#E4C995]">{reply}</button>)}
                  </div>
                )}
                {readyForConfirmation && <Summary state={collectedState} onConfirm={() => void confirmDevis()} onCorrect={requestCorrection} submitting={loading} />}
                {success && <section role="status" className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-4"><p>Demande {success.reference} envoyée.</p><p className="mt-1 text-sm">Tarif estimé : {success.priceEur.toFixed(2)} €.</p></section>}
                {submissionError && <p role="alert" className="rounded-xl bg-red-950/40 p-3 text-sm">La demande n’a pas été envoyée. Vous pouvez réessayer ou appeler le 07 83 69 92 29.</p>}
                {limitReached && <p role="alert" className="rounded-xl bg-[#C9A96E]/10 p-3 text-sm text-[#E4C995]">Limite de 30 messages atteinte pour cette session. Appelez le 07 83 69 92 29 pour continuer.</p>}
                {rateLimited && <p role="alert" className="rounded-xl bg-[#C9A96E]/10 p-3 text-sm text-[#E4C995]">Trop de messages rapprochés. La saisie sera réactivée automatiquement.</p>}
              </div>

              <div className="shrink-0 border-t border-white/10 bg-[#111] px-3 py-3 pb-[max(.75rem,env(safe-area-inset-bottom))]">
                <input type="text" name="message2" value={honeypot} onChange={event => setHoneypot(event.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute h-0 w-0 opacity-0" />
                <form className="flex items-center gap-2" onSubmit={event => { event.preventDefault(); void sendText(draft) }}>
                  <label htmlFor="elia-message" className="sr-only">Votre réponse à Élia</label>
                  <input ref={inputRef} id="elia-message" value={draft} onChange={event => { setDraft(event.target.value); markDraftActivity() }} maxLength={1000} disabled={loading || limitReached || rateLimited || readyForConfirmation || Boolean(success)} autoComplete="off" enterKeyHint="send" placeholder="Votre réponse…" className="min-w-0 flex-1 rounded-full border border-white/10 bg-[#1c1c1c] px-4 py-3 text-base text-white placeholder:text-white/35 disabled:opacity-50" />
                  <button type="submit" disabled={!draft.trim() || loading || limitReached || rateLimited || readyForConfirmation || Boolean(success)} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#C9A96E] text-sm font-bold text-black disabled:opacity-30" aria-label="Envoyer">↑</button>
                </form>
              </div>
            </>
          )}
        </div>
      </dialog>
    </>
  )
}
