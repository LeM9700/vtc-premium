import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto'
import type { ChatMessage } from '@/lib/eliaTypes'

const TOKEN_TTL_MS = 7 * 60 * 1000

interface SignedPayload {
  v: 1
  purpose: 'consent' | 'conversation'
  nonce: string
  issuedAt: number
  expiresAt: number
  historyDigest?: string
}

function encode(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url')
}

function signature(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

function signPayload(payload: SignedPayload, secret: string): string {
  const encoded = encode(JSON.stringify(payload))
  return `${encoded}.${signature(encoded, secret)}`
}

function readPayload(token: string | undefined, secret: string | undefined, now: number): SignedPayload | null {
  if (!token || !secret) return null
  const [encoded, provided, extra] = token.split('.')
  if (!encoded || !provided || extra) return null
  const expected = signature(encoded, secret)
  if (provided.length !== expected.length || !timingSafeEqual(Buffer.from(provided), Buffer.from(expected))) return null
  try {
    const value = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as Partial<SignedPayload>
    if (value.v !== 1 || (value.purpose !== 'consent' && value.purpose !== 'conversation') ||
      typeof value.nonce !== 'string' || !Number.isFinite(value.issuedAt) || !Number.isFinite(value.expiresAt) ||
      value.issuedAt! > now || value.expiresAt! < now || value.expiresAt! - value.issuedAt! !== TOKEN_TTL_MS) return null
    return value as SignedPayload
  } catch {
    return null
  }
}

function historyDigest(messages: Pick<ChatMessage, 'role' | 'content'>[]): string {
  return createHash('sha256').update(JSON.stringify(messages.map(({ role, content }) => ({ role, content })))).digest('base64url')
}

export function issueConsentProof(secret: string | undefined, now = Date.now(), nonce: string = randomUUID()): string {
  if (!secret) throw new Error('DEVIS_SECRET manquant')
  return signPayload({ v: 1, purpose: 'consent', nonce, issuedAt: now, expiresAt: now + TOKEN_TTL_MS }, secret)
}

export function verifyConsentProof(token: string | undefined, secret: string | undefined, now = Date.now()): SignedPayload | null {
  const payload = readPayload(token, secret, now)
  return payload?.purpose === 'consent' ? payload : null
}

export function issueConversationToken(messages: Pick<ChatMessage, 'role' | 'content'>[], secret: string | undefined, now = Date.now()): string {
  if (!secret) throw new Error('DEVIS_SECRET manquant')
  return signPayload({
    v: 1, purpose: 'conversation', nonce: randomUUID(), issuedAt: now,
    expiresAt: now + TOKEN_TTL_MS, historyDigest: historyDigest(messages),
  }, secret)
}

export function verifyConversationToken(
  token: string | undefined,
  messages: Pick<ChatMessage, 'role' | 'content'>[],
  secret: string | undefined,
  now = Date.now(),
): boolean {
  const payload = readPayload(token, secret, now)
  return payload?.purpose === 'conversation' && payload.historyDigest === historyDigest(messages)
}
