import { createHmac, randomUUID, timingSafeEqual } from 'crypto'

/**
 * Token à usage unique prouvant qu'une conversation Élia a bien collecté
 * les 12 informations côté serveur avant d'autoriser l'envoi d'un devis.
 * Empêche l'appel direct de /api/devis sans être passé par le chat.
 */

const TOKEN_TTL_MS = 10 * 60 * 1000 // 10 min pour finaliser après collecte

const usedTokens = new Map<string, number>() // token → expiresAt

function cleanupUsed(now: number) {
  for (const [token, expiresAt] of usedTokens) {
    if (now > expiresAt) usedTokens.delete(token)
  }
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex')
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

function digestData(value: unknown, secret: string): string {
  return createHmac('sha256', secret).update(stableStringify(value)).digest('hex')
}

export function issueDevisToken(confirmedData: unknown, secret = process.env.DEVIS_SECRET): string {
  if (!secret) throw new Error('DEVIS_SECRET manquant')
  const nonce     = randomUUID()
  const issuedAt  = Date.now()
  const expiresAt = Date.now() + TOKEN_TTL_MS
  const payload   = `${nonce}.${issuedAt}.${expiresAt}.${digestData(confirmedData, secret)}`
  return `${payload}.${sign(payload, secret)}`
}

/** Valide l'authenticité, l'âge minimal et l'usage unique d'un token serveur. */
export function consumeDevisToken(token: string | undefined | null, confirmedData: unknown, minAgeMs = 0, secret = process.env.DEVIS_SECRET): boolean {
  const now = Date.now()
  if (Math.random() < 0.05) cleanupUsed(now)

  if (!secret || !token) return false
  if (usedTokens.has(token)) return false // rejeu

  const parts = token.split('.')
  if (parts.length !== 5) return false

  const [nonce, issuedAtStr, expiresAtStr, dataDigest, signature] = parts
  const payload  = `${nonce}.${issuedAtStr}.${expiresAtStr}.${dataDigest}`
  const expected = sign(payload, secret)

  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false
  if (dataDigest !== digestData(confirmedData, secret)) return false

  const issuedAt = Number(issuedAtStr)
  const expiresAt = Number(expiresAtStr)
  if (!Number.isFinite(issuedAt) || !Number.isFinite(expiresAt) || issuedAt > now || now - issuedAt < minAgeMs || now > expiresAt) return false

  usedTokens.set(token, expiresAt)
  return true
}
