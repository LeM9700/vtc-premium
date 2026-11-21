import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import * as Sentry from '@sentry/nextjs'
import { buildSystemPrompt, isValidContextKey } from '@/lib/systemPrompt'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'
import { issueDevisToken } from '@/lib/devisToken'
import { createSSEStream } from '@/lib/sse'
import { createTagFilter } from '@/lib/streamTagFilter'
import { parseAiResponse, validateChatMessages } from '@/lib/eliaValidation'
import { detectSensitiveData, SENSITIVE_DATA_REPLY } from '@/lib/sensitiveData'
import { issueConsentProof, issueConversationToken, verifyConsentProof, verifyConversationToken } from '@/lib/eliaTokens'

const client = new Anthropic()

const MAX_BURST_MESSAGES = 8
const BURST_WINDOW_MS = 10 * 1000
const ANTHROPIC_TIMEOUT_MS = 12_000
const MAX_BODY_BYTES = 64 * 1024
const MIN_CONSENT_AGE_FOR_DEVIS_MS = 750

const OFF_TOPIC_PATTERNS = [
  /météo|temps qu'il fait|température extérieure/i,
  /recette|cuisine|gastronomie/i,
  /politique|élection|gouvernement/i,
  /blague|humour|raconte-moi/i,
  /\bcode\b|programme|javascript|python|typescript|développe/i,
  /actualité|journal|news|info du jour/i,
  /sport|football|match|ligue/i,
  /médecin|santé|maladie|symptôme/i,
  /traduction|traduire|anglais|espagnol/i,
]

const OFF_TOPIC_REPLY =
  "Je suis uniquement disponible pour vous aider à réserver votre trajet. Comment puis-je vous aider ?"

/**
 * Réponse en streaming SSE : chaque frame est `{ type: 'delta', text }` ou
 * `{ type: 'done', devisToken? }` / `{ type: 'error' }`. Le bloc <COLLECTED>
 * n'est jamais transmis au client (voir lib/streamTagFilter.ts).
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!checkRateLimit(`chat:${ip}`, MAX_BURST_MESSAGES, BURST_WINDOW_MS)) {
    return NextResponse.json(
      { error: 'Trop de messages rapprochés. Réessayez dans quelques secondes.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(BURST_WINDOW_MS / 1000)) } },
    )
  }

  const contentLength = Number(req.headers.get('content-length') ?? '0')
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Requête trop volumineuse' }, { status: 413 })
  }

  let body: { messages?: unknown; contextKey?: unknown; historyToken?: unknown; consentProof?: unknown }
  try {
    const rawBody = await req.text()
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'Requête trop volumineuse' }, { status: 413 })
    }
    body = JSON.parse(rawBody) as typeof body
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  }

  const validation = validateChatMessages(body.messages)
  if (!validation.ok) {
    if (validation.reason === 'user_limit') {
      return NextResponse.json({ error: 'Limite de messages atteinte.' }, { status: 429 })
    }
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  }
  const { messages } = validation
  const { contextKey } = body
  const secret = process.env.DEVIS_SECRET
  const consent = verifyConsentProof(typeof body.consentProof === 'string' ? body.consentProof : undefined, secret)
  if (!consent) return NextResponse.json({ error: 'Consentement requis' }, { status: 403 })

  const previousHistory = messages.slice(0, -1)
  const firstTurn = previousHistory.length === 0 && messages.length === 1 && messages[0].role === 'user'
  const hasValidContinuity = typeof body.historyToken === 'string' &&
    verifyConversationToken(body.historyToken, previousHistory, secret)
  if (!firstTurn && !hasValidContinuity) {
    return NextResponse.json({ error: 'Historique non authentifié' }, { status: 403 })
  }

  if (messages.some(message => detectSensitiveData(message.content))) {
    return NextResponse.json({ error: SENSITIVE_DATA_REPLY }, { status: 400 })
  }

  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')
  const isOffTopic = !!lastUserMsg && OFF_TOPIC_PATTERNS.some(p => p.test(lastUserMsg.content))

  if (isOffTopic) {
    return createSSEStream(async (send) => {
      send({ type: 'delta', text: OFF_TOPIC_REPLY })
      send({
        type: 'done', collectedState: {}, quickReplies: [], readyForConfirmation: false, preserveState: true,
        historyToken: issueConversationToken([...messages, { role: 'assistant', content: OFF_TOPIC_REPLY }], secret),
        consentProof: issueConsentProof(secret),
      })
    })
  }

  const system = buildSystemPrompt(isValidContextKey(contextKey) ? contextKey : undefined)

  return createSSEStream(async (send) => {
    const filter = createTagFilter()
    let fullText = ''

    try {
      const stream = client.messages.stream(
        {
          model:      'claude-haiku-4-5',
          max_tokens: 1024,
          system,
          messages,
        },
        { timeout: ANTHROPIC_TIMEOUT_MS }
      )

      stream.on('text', (_delta, textSnapshot) => {
        fullText = textSnapshot
        const safeChunk = filter(fullText)
        if (safeChunk) send({ type: 'delta', text: safeChunk })
      })

      await stream.finalMessage()
      const metadata = parseAiResponse(fullText)
      if (!metadata.visibleText) throw new Error('empty_assistant_response')
      const remainingConsentDelay = MIN_CONSENT_AGE_FOR_DEVIS_MS - (Date.now() - consent.issuedAt)
      if (metadata.readyForConfirmation && remainingConsentDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingConsentDelay))
      }
      const devisToken = metadata.readyForConfirmation ? issueDevisToken(metadata.collectedState) : undefined
      const historyToken = issueConversationToken(
        [...messages, { role: 'assistant', content: metadata.visibleText }], secret,
      )
      send({
        type: 'done',
        collectedState: metadata.collectedState,
        quickReplies: metadata.quickReplies,
        readyForConfirmation: metadata.readyForConfirmation,
        historyToken,
        consentProof: issueConsentProof(secret),
        ...(devisToken ? { devisToken } : {}),
      })

    } catch {
      console.error('[chat] Anthropic request failed')
      Sentry.captureException(new Error('Anthropic chat request failed'))
      send({ type: 'error' })
    }
  })
}
