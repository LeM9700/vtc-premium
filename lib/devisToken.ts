import { createHmac, randomUUID } from 'crypto'

/**
 * Token à usage unique prouvant qu'une conversation Élia a bien collecté
 * les 12 informations côté serveur avant d'autoriser l'envoi d'un devis.
 * Empêche l'appel direct de /api/devis sans être passé par le chat.
 */

const TOKEN_TTL_MS = 10 * 60 * 1000 // 10 min pour finaliser après collecte

const SECRET = process.env.DEVIS_SECRET

if (!SECRET && process.env.NODE_ENV === 'production') {
  console.error('[devisToken] DEVIS_SECRET manquant en production — les tokens de devis seront rejetés.')
}

const usedTokens = new Map<string, number>() // token → expiresAt

function cleanupUsed(now: number) {
  for (const [token, expiresAt] of usedTokens) {
    if (now > expiresAt) usedTokens.delete(token)
  }
}

function sign(payload: string): string {
  return createHmac('sha256', SECRET ?? 'dev-only-insecure-secret').update(payload).digest('hex')
}

export function issueDevisToken(): string {
  const nonce     = randomUUID()
  const expiresAt = Date.now() + TOKEN_TTL_MS
  const payload   = `${nonce}.${expiresAt}`
  return `${payload}.${sign(payload)}`
}

export function consumeDevisToken(token: string | undefined | null): boolean {
  const now = Date.now()
  if (Math.random() < 0.05) cleanupUsed(now)

  if (!SECRET || !token) return false
  if (usedTokens.has(token)) return false // rejeu

  const parts = token.split('.')
  if (parts.length !== 3) return false

  const [nonce, expiresAtStr, signature] = parts
  const payload  = `${nonce}.${expiresAtStr}`
  const expected = sign(payload)

  if (signature !== expected) return false

  const expiresAt = Number(expiresAtStr)
  if (!Number.isFinite(expiresAt) || now > expiresAt) return false

  usedTokens.set(token, expiresAt)
  return true
}
