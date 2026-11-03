/**
 * Rate limiting en mémoire, par clé (ex: `chat:203.0.113.4`).
 * Suffisant pour une instance serverless unique — pas de garantie
 * cross-instance, mais empêche l'abus trivial (header client forgeable).
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
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}
