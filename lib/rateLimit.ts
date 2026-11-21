import { isIP } from 'node:net'

/**
 * Rate limiting en mémoire, par clé (ex: `chat:203.0.113.4`).
 * Best-effort par instance : la Map n'offre aucune garantie multi-instance.
 * L'idempotency key de l'API centrale reste la dernière défense des devis.
 */

interface RateLimitEntry {
  count:   number
  resetAt: number
}
const buckets = new Map<string, RateLimitEntry>()

function cleanup(now: number) {
  for (const [key, entry] of buckets) {
    if (now >= entry.resetAt) buckets.delete(key)
  }
}

export function checkRateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  if (Math.random() < 0.01) cleanup(now)

  const entry = buckets.get(key)
  if (!entry || now >= entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= max) return false

  entry.count++
  return true
}

export function getClientIp(req: Request): string {
  const isIp = (value: string | null): value is string => {
    return Boolean(value && isIP(value) !== 0)
  }
  for (const header of ['cf-connecting-ip', 'railway-client-ip', 'x-real-ip']) {
    const candidate = req.headers.get(header)?.trim() ?? null
    if (isIp(candidate)) return candidate
  }
  const hops = (req.headers.get('x-forwarded-for') ?? '').split(',').map(value => value.trim()).filter(isIp)
  return hops.at(-1) ?? 'unknown'
}
