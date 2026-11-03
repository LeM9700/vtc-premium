import { NextRequest, NextResponse } from 'next/server'

interface PlacesRequest {
  input?: unknown
  sessionToken?: unknown
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as PlacesRequest | null
  const input = typeof body?.input === 'string' ? body.input.trim() : ''
  const sessionToken = typeof body?.sessionToken === 'string' ? body.sessionToken : undefined
  const apiUrl = process.env.VTCLAND_API_URL

  if (input.length < 3 || input.length > 150) {
    return NextResponse.json({ suggestions: [] }, { status: 400 })
  }
  if (!apiUrl) {
    return NextResponse.json({ error: 'Configuration invalide' }, { status: 500 })
  }

  try {
    const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')
    const clientIp = forwardedFor?.at(-1)?.trim()
    const headers: Record<string, string> = { 'content-type': 'application/json' }
    if (clientIp) headers['x-forwarded-for'] = clientIp

    const response = await fetch(`${apiUrl.replace(/\/$/, '')}/places/autocomplete`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ input, ...(sessionToken ? { sessionToken } : {}) }),
      cache: 'no-store',
      signal: AbortSignal.timeout(8_000),
    })
    const payload = await response.json().catch(() => ({ suggestions: [] }))
    return NextResponse.json(payload, { status: response.status })
  } catch {
    return NextResponse.json(
      { error: 'service_unavailable', message: "Le service d'adresses est temporairement indisponible." },
      { status: 503 },
    )
  }
}
