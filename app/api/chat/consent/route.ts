import { NextResponse } from 'next/server'
import { issueConsentProof } from '@/lib/eliaTokens'

/**
 * Détermine les origines légitimes sans dépendre de `request.url`, qui ne
 * reflète pas toujours l'origine publique derrière un proxy inverse
 * (Railway reconstruit parfois une URL interne). On fait confiance à
 * `NEXT_PUBLIC_SITE_URL` (déployé en production) et, en repli pour le
 * développement local, à l'en-tête `host` transmis par le navigateur.
 */
function allowedOrigins(request: Request): Set<string> {
  const origins = new Set<string>()
  const publicSiteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (publicSiteUrl) {
    try {
      origins.add(new URL(publicSiteUrl).origin)
    } catch {
      // variable mal configurée — ignorée, pas de fallback dangereux
    }
  }
  const host = request.headers.get('host')
  const proto = request.headers.get('x-forwarded-proto') ?? new URL(request.url).protocol.replace(':', '')
  if (host) origins.add(`${proto}://${host}`)
  return origins
}

export async function POST(request: Request) {
  const secret = process.env.DEVIS_SECRET
  if (!secret) return NextResponse.json({ error: 'Service indisponible' }, { status: 503 })
  const origin = request.headers.get('origin')
  const fetchSite = request.headers.get('sec-fetch-site')
  if (!origin || !allowedOrigins(request).has(origin) || (fetchSite && fetchSite !== 'same-origin')) {
    return NextResponse.json({ error: 'Origine non autorisée' }, { status: 403 })
  }
  return NextResponse.json({ consentProof: issueConsentProof(secret) }, { status: 201 })
}
