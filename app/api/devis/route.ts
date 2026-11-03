import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { consumeDevisToken } from '@/lib/devisToken'

interface DevisPayload {
  token?: string; name?: string; phone?: string; email?: string
  type?: 'airport' | 'disposal' | 'event' | 'distance'
  departure?: string; destination?: string; date?: string; time?: string
  passengers?: string; hours?: number; options?: string[]; payment?: string
}

function parisLocalToIso(date: string, time: string): string {
  const approximate = new Date(`${date}T${time}:00Z`)
  const zone = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Paris', timeZoneName: 'longOffset',
  }).formatToParts(approximate).find(item => item.type === 'timeZoneName')?.value
  return new Date(`${date}T${time}:00${zone?.replace('GMT', '') || '+01:00'}`).toISOString()
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json() as DevisPayload
    if (!consumeDevisToken(payload.token)) {
      return NextResponse.json({ error: 'Requête non autorisée' }, { status: 403 })
    }
    if (!payload.name || !payload.phone || !payload.email || !payload.type || !payload.departure || !payload.date || !payload.time) {
      return NextResponse.json({ error: 'Informations incomplètes' }, { status: 400 })
    }
    const apiUrl = process.env.VTCLAND_API_URL
    if (!apiUrl) throw new Error('VTCLAND_API_URL manquante')
    const disposal = payload.type === 'disposal'
    const response = await fetch(`${apiUrl.replace(/\/$/, '')}/booking-requests`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'idempotency-key': `elia:${payload.token}` },
      body: JSON.stringify({
        type: disposal ? 'disposal' : 'ride', source: 'elia', pickupAddress: payload.departure,
        ...(disposal ? { disposalMinutes: Math.max(15, Math.round((payload.hours ?? 1) * 60)) } : { dropoffAddress: payload.destination }),
        pickupAt: parisLocalToIso(payload.date, payload.time),
        passengers: Math.max(1, Number.parseInt(payload.passengers ?? '1', 10) || 1),
        luggage: payload.options?.some(option => /bagage/i.test(option)) ? 1 : 0,
        options: { selected: payload.options ?? [], payment: payload.payment },
        customer: { name: payload.name, phone: payload.phone, email: payload.email },
      }),
      signal: AbortSignal.timeout(12_000),
    })
    const result = await response.json() as { message?: string; reference?: string; priceEur?: number }
    if (!response.ok) {
      return NextResponse.json({ error: result.message ?? 'Demande non transmise' }, { status: response.status })
    }
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    Sentry.captureException(error)
    return NextResponse.json({ error: 'Une erreur est survenue. Appelez le 07 83 69 92 29.' }, { status: 500 })
  }
}
