import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

const EXTERNAL_TIMEOUT_MS = 8_000
const MAX_ADDRESS_LENGTH = 200
const MAX_PER_WINDOW = 20
const WINDOW_MS = 10 * 60 * 1000

function isValidAddress(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= MAX_ADDRESS_LENGTH
}

/**
 * Calcule la distance routière entre deux adresses via OpenRouteService.
 * POST { departure: string, destination: string }
 * → { distanceKm: number, durationMin: number }
 */
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req)
    if (!checkRateLimit(`distance:${ip}`, MAX_PER_WINDOW, WINDOW_MS)) {
      return NextResponse.json({ error: 'Trop de requêtes. Réessayez dans quelques minutes.' }, { status: 429 })
    }

    const { departure, destination } = await req.json()

    if (!isValidAddress(departure) || !isValidAddress(destination)) {
      return NextResponse.json(
        { error: 'Départ et destination requis (200 caractères max)' },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENROUTESERVICE_API_KEY
    if (!apiKey) throw new Error('Clé ORS manquante')

    // Géocode les deux adresses
    const [depCoords, destCoords] = await Promise.all([
      geocode(departure, apiKey),
      geocode(destination, apiKey),
    ])

    if (!depCoords || !destCoords) {
      return NextResponse.json(
        { error: 'Adresse introuvable' },
        { status: 422 }
      )
    }

    // Calcule l'itinéraire
    const routeRes = await fetchWithTimeout(
      'https://api.openrouteservice.org/v2/directions/driving-car',
      {
        method: 'POST',
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coordinates: [depCoords, destCoords],
        }),
      }
    )

    const routeData = await routeRes.json()
    const summary   = routeData.routes?.[0]?.summary

    if (!summary) {
      return NextResponse.json(
        { error: 'Itinéraire introuvable' },
        { status: 422 }
      )
    }

    const distanceKm  = Math.round(summary.distance / 1000 * 10) / 10
    const durationMin = Math.round(summary.duration / 60)

    return NextResponse.json({ distanceKm, durationMin })

  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      console.error('[distance] timeout')
      return NextResponse.json({ error: 'Délai dépassé' }, { status: 504 })
    }
    console.error('[distance]', err)
    Sentry.captureException(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

async function fetchWithTimeout(url: string, init: RequestInit = {}): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), EXTERNAL_TIMEOUT_MS)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * Géocode une adresse → [longitude, latitude]
 */
async function geocode(
  address: string,
  apiKey: string
): Promise<[number, number] | null> {
  const url = `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(address)}&size=1&boundary.country=FR&focus.point.lon=3.87&focus.point.lat=43.61`
  const res  = await fetchWithTimeout(url)
  const data = await res.json()
  const coords = data.features?.[0]?.geometry?.coordinates
  return coords ?? null
}
