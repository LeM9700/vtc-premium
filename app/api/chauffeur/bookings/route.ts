import { NextRequest, NextResponse } from 'next/server'
import { driverApiConfig, isDriverAuthenticated } from '@/lib/driverAuth'

export async function GET(request: NextRequest) {
  if (!await isDriverAuthenticated()) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { url, token } = driverApiConfig()
  const status = request.nextUrl.searchParams.get('status')
  const response = await fetch(`${url}/driver/booking-requests${status ? `?status=${encodeURIComponent(status)}` : ''}`, {
    headers: { authorization: `Bearer ${token}` }, cache: 'no-store', signal: AbortSignal.timeout(8_000),
  })
  return NextResponse.json(await response.json(), { status: response.status })
}
