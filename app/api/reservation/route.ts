import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json() as Record<string, unknown> & { idempotencyKey?: string }
  const apiUrl = process.env.VTCLAND_API_URL
  if (!apiUrl || !body.idempotencyKey) return NextResponse.json({ error: 'Configuration invalide' }, { status: 500 })
  const { idempotencyKey, ...payload } = body
  const response = await fetch(`${apiUrl.replace(/\/$/, '')}/booking-requests`, {
    method: 'POST', headers: { 'content-type': 'application/json', 'idempotency-key': `form:${idempotencyKey}` },
    body: JSON.stringify({ ...payload, source: 'quick_form' }), signal: AbortSignal.timeout(12_000),
  })
  return NextResponse.json(await response.json(), { status: response.status })
}
