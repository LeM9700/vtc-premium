import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { consumeDevisToken } from '@/lib/devisToken'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'
import { isReadyForConfirmation, sanitizeCollectedState } from '@/lib/eliaValidation'

interface DevisPayload {
  token?: string; name?: string; phone?: string; email?: string
  message2?: string
  type?: 'airport' | 'disposal' | 'event' | 'distance'
  departure?: string; destination?: string; date?: string; time?: string
  passengers?: string; hours?: number; options?: string[]; payment?: string
}

const FRENCH_MONTHS: Record<string, number> = {
  janvier: 1, février: 2, fevrier: 2, mars: 3, avril: 4, mai: 5, juin: 6,
  juillet: 7, août: 8, aout: 8, septembre: 9, octobre: 10, novembre: 11,
  décembre: 12, decembre: 12,
}
const MAX_DEVIS_BODY_BYTES = 16 * 1024

export function parisLocalToIso(date: string, time: string): string {
  // Normalise les formats que le modèle pourrait malgré tout produire
  // (JJ/MM/AAAA, "19h00", "15 décembre 2026", espaces) : défense en
  // profondeur, le contrat attendu reste AAAA-MM-JJ / HH:MM imposé par
  // le prompt système, mais le modèle peut toujours s'en écarter.
  const normalizedDate = (() => {
    const trimmed = date.trim()
    const iso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (iso) return trimmed
    const fr = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
    if (fr) return `${fr[3]}-${fr[2].padStart(2, '0')}-${fr[1].padStart(2, '0')}`
    // "15 décembre 2026", "le 1er décembre 2026"
    const literal = trimmed
      .toLowerCase()
      .match(/^(?:le\s+)?(\d{1,2})(?:er)?\s+([a-zéû]+)\s+(\d{4})$/)
    if (literal) {
      const month = FRENCH_MONTHS[literal[2]]
      if (month) return `${literal[3]}-${String(month).padStart(2, '0')}-${literal[1].padStart(2, '0')}`
    }
    return null
  })()

  const normalizedTime = (() => {
    const trimmed = time.trim().replace(/^[àa]\s+/i, '')
    const hm = trimmed.match(/^(\d{1,2}):(\d{2})$/)
    if (hm) return `${hm[1].padStart(2, '0')}:${hm[2]}`
    const hFr = trimmed.match(/^(\d{1,2})\s*h\s*(\d{2})?$/i)
    if (hFr) return `${hFr[1].padStart(2, '0')}:${(hFr[2] ?? '00').padStart(2, '0')}`
    return null
  })()

  if (!normalizedDate || !normalizedTime) {
    throw new Error(`Date/heure non reconnues : "${date}" "${time}"`)
  }

  const approximate = new Date(`${normalizedDate}T${normalizedTime}:00Z`)
  if (Number.isNaN(approximate.getTime())) {
    throw new Error(`Date/heure invalides : "${normalizedDate}" "${normalizedTime}"`)
  }
  const zone = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Paris', timeZoneName: 'longOffset',
  }).formatToParts(approximate).find(item => item.type === 'timeZoneName')?.value
  const result = new Date(`${normalizedDate}T${normalizedTime}:00${zone?.replace('GMT', '') || '+01:00'}`)
  if (Number.isNaN(result.getTime())) {
    throw new Error(`Date/heure invalides après application du fuseau : "${normalizedDate}" "${normalizedTime}"`)
  }
  return result.toISOString()
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    if (!checkRateLimit(`devis:${ip}`, 5, 10 * 60 * 1000)) {
      return NextResponse.json({ error: 'Trop de demandes. Réessayez dans quelques minutes.' }, { status: 429 })
    }
    const rawBody = await request.text()
    if (new TextEncoder().encode(rawBody).byteLength > MAX_DEVIS_BODY_BYTES) {
      return NextResponse.json({ error: 'Requête trop volumineuse' }, { status: 413 })
    }
    let payload: DevisPayload
    try {
      payload = JSON.parse(rawBody) as DevisPayload
    } catch {
      return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
    }
    if (payload.message2) {
      return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
    }
    const confirmedData = sanitizeCollectedState(payload)
    if (!isReadyForConfirmation(confirmedData)) {
      return NextResponse.json({ error: 'Informations incomplètes' }, { status: 400 })
    }
    if (!consumeDevisToken(payload.token, confirmedData, 750)) {
      return NextResponse.json({ error: 'Requête non autorisée' }, { status: 403 })
    }
    const apiUrl = process.env.VTCLAND_API_URL
    if (!apiUrl) throw new Error('VTCLAND_API_URL manquante')
    const disposal = confirmedData.type === 'disposal'
    const response = await fetch(`${apiUrl.replace(/\/$/, '')}/booking-requests`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'idempotency-key': `elia:${payload.token}` },
      body: JSON.stringify({
        type: disposal ? 'disposal' : 'ride', source: 'elia', pickupAddress: confirmedData.departure,
        ...(disposal ? { disposalMinutes: Math.max(15, Math.round((confirmedData.hours ?? 1) * 60)) } : { dropoffAddress: confirmedData.destination }),
        pickupAt: parisLocalToIso(confirmedData.date!, confirmedData.time!),
        passengers: Math.max(1, Number.parseInt(confirmedData.passengers ?? '1', 10) || 1),
        luggage: confirmedData.options?.some(option => /bagage/i.test(option)) ? 1 : 0,
        options: { selected: confirmedData.options ?? [], payment: confirmedData.payment },
        customer: { name: confirmedData.name, phone: confirmedData.phone, email: confirmedData.email },
      }),
      signal: AbortSignal.timeout(12_000),
    })
    const result = await response.json() as { message?: string; reference?: string; priceEur?: number }
    if (!response.ok) {
      return NextResponse.json({ error: 'La demande n’a pas pu être transmise.' }, { status: response.status })
    }
    return NextResponse.json({ reference: result.reference, priceEur: result.priceEur }, { status: 201 })
  } catch {
    Sentry.captureException(new Error('Devis submission failed'))
    return NextResponse.json({ error: 'Une erreur est survenue. Appelez le 07 83 69 92 29.' }, { status: 500 })
  }
}
