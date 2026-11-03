import { NextRequest, NextResponse } from 'next/server'
import { driverApiConfig, isDriverAuthenticated } from '@/lib/driverAuth'

export async function POST(_request: NextRequest, context: { params: Promise<{ reference: string; action: string }> }) {
  if (!await isDriverAuthenticated()) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { reference, action } = await context.params
  if (!/^(accept|decline|complete)$/.test(action) || !/^VTC-\d{8}-[A-F0-9]{6}$/.test(reference)) {
    return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
  }
  const { url, token } = driverApiConfig()
  const response = await fetch(`${url}/driver/booking-requests/${reference}/${action}`, {
    method: 'POST', headers: { authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(8_000),
  })
  return NextResponse.json(await response.json(), { status: response.status })
}
