import { NextResponse } from 'next/server'
import { issueConsentProof } from '@/lib/eliaTokens'

export async function POST(request: Request) {
  const secret = process.env.DEVIS_SECRET
  if (!secret) return NextResponse.json({ error: 'Service indisponible' }, { status: 503 })
  const origin = request.headers.get('origin')
  const fetchSite = request.headers.get('sec-fetch-site')
  if (origin !== new URL(request.url).origin || (fetchSite && fetchSite !== 'same-origin')) {
    return NextResponse.json({ error: 'Origine non autorisée' }, { status: 403 })
  }
  return NextResponse.json({ consentProof: issueConsentProof(secret) }, { status: 201 })
}
