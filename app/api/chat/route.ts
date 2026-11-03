import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import * as Sentry from '@sentry/nextjs'
import { buildSystemPrompt, isValidContextKey } from '@/lib/systemPrompt'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'
import { issueDevisToken } from '@/lib/devisToken'
import { createSSEStream } from '@/lib/sse'
import { createTagFilter } from '@/lib/streamTagFilter'

const client = new Anthropic()

const MAX_MESSAGES_PER_WINDOW = 25
const WINDOW_MS = 10 * 60 * 1000
const ANTHROPIC_TIMEOUT_MS = 12_000
const MAX_BODY_BYTES = 262_144 // 256 Ko — largement suffisant pour une conversation Élia
const MAX_MESSAGES = 50
const MAX_MESSAGE_LENGTH = 1000

interface ChatMessage {
  role:    'user' | 'assistant'
  content: string
}

function isValidMessages(value: unknown): value is ChatMessage[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_MESSAGES) return false
  return value.every((m): m is ChatMessage =>
    typeof m === 'object' && m !== null &&
    (m as { role?: unknown }).role !== undefined &&
    ((m as { role: unknown }).role === 'user' || (m as { role: unknown }).role === 'assistant') &&
    typeof (m as { content?: unknown }).content === 'string' &&
    (m as { content: string }).content.length > 0 &&
    (m as { content: string }).content.length <= MAX_MESSAGE_LENGTH
  )
}

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

const COLLECTED_TAG = /<COLLECTED>[\s\S]*?<\/COLLECTED>/

/**
 * Réponse en streaming SSE : chaque frame est `{ type: 'delta', text }` ou
 * `{ type: 'done', devisToken? }` / `{ type: 'error' }`. Le bloc <COLLECTED>
 * n'est jamais transmis au client (voir lib/streamTagFilter.ts).
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!checkRateLimit(`chat:${ip}`, MAX_MESSAGES_PER_WINDOW, WINDOW_MS)) {
    return NextResponse.json({ error: 'Trop de requêtes. Réessayez dans quelques minutes.' }, { status: 429 })
  }

  const contentLength = Number(req.headers.get('content-length') ?? '0')
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Requête trop volumineuse' }, { status: 413 })
  }

  let body: { messages?: unknown; contextKey?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  }

  const { messages, contextKey } = body
  if (!isValidMessages(messages)) {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  }

  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')
  const isOffTopic = !!lastUserMsg && OFF_TOPIC_PATTERNS.some(p => p.test(lastUserMsg.content))

  if (isOffTopic) {
    return createSSEStream(async (send) => {
      send({ type: 'delta', text: OFF_TOPIC_REPLY })
      send({ type: 'done' })
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

      const finalMessage = await stream.finalMessage()
      console.log('[chat] tokens:', finalMessage.usage)

      // Le client ne reçoit jamais le bloc <COLLECTED> brut (filtré côté
      // serveur) : on lui transmet directement les données déjà parsées.
      const tagMatch = fullText.match(COLLECTED_TAG)
      let collected: unknown
      if (tagMatch) {
        try {
          collected = JSON.parse(tagMatch[0].replace(/^<COLLECTED>|<\/COLLECTED>$/g, ''))
        } catch {
          collected = undefined
        }
      }

      const devisToken = collected ? issueDevisToken() : undefined
      send({ type: 'done', devisToken, collected })

    } catch (err) {
      console.error('[chat]', err)
      Sentry.captureException(err)
      send({ type: 'error' })
    }
  })
}
