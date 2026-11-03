import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import * as Sentry from '@sentry/nextjs'
import { escapeHtml } from '@/lib/escapeHtml'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'
import { consumeDevisToken } from '@/lib/devisToken'

interface DevisPayload {
  token:       string
  name:        string
  phone:       string
  email:       string
  type:        string
  departure:   string
  destination: string
  date:        string
  time:        string
  passengers:  string
  options:     string[]
  payment:     string
  distanceKm:  number | null
  durationMin: number | null
  prixEstime:  number | null
}

const DEVIS_WINDOW_MS = 10 * 60 * 1000
const DEVIS_MAX_PER_WINDOW = 1
const MAX_FIELD_LENGTH = 200
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const ERROR_CALL_US = "Une erreur est survenue lors de l'envoi de votre demande. Merci d'appeler directement le 07 83 69 92 29."

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0 && v.length <= MAX_FIELD_LENGTH
}

function validatePayload(payload: Partial<DevisPayload>): string | null {
  if (!isNonEmptyString(payload.name)) return 'name invalide'
  if (!isNonEmptyString(payload.phone)) return 'phone invalide'
  if (!isNonEmptyString(payload.email) || !EMAIL_RE.test(payload.email) || payload.email.length > MAX_FIELD_LENGTH) return 'email invalide'
  if (!isNonEmptyString(payload.departure)) return 'departure invalide'
  if (typeof payload.destination !== 'string' || payload.destination.length > MAX_FIELD_LENGTH) return 'destination invalide'
  if (payload.prixEstime != null && typeof payload.prixEstime !== 'number') return 'prixEstime invalide'
  if (payload.distanceKm != null && typeof payload.distanceKm !== 'number') return 'distanceKm invalide'
  if (!Array.isArray(payload.options)) return 'options invalide'
  return null
}

/**
 * Envoie un email de devis au chauffeur via Resend.
 * POST DevisPayload → { success: boolean }
 * Protégé par token à usage unique (issu de /api/chat en fin de collecte)
 * et rate limiting IP.
 */
export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  try {
    const ip = getClientIp(req)
    if (!checkRateLimit(`devis:${ip}`, DEVIS_MAX_PER_WINDOW, DEVIS_WINDOW_MS)) {
      return NextResponse.json({ error: 'Trop de demandes. Réessayez plus tard.' }, { status: 429 })
    }

    const payload: DevisPayload = await req.json()

    if (!consumeDevisToken(payload.token)) {
      return NextResponse.json({ error: 'Requête non autorisée' }, { status: 403 })
    }

    const validationError = validatePayload(payload)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    const {
      name, phone, email, type, departure, destination,
      date, time, passengers, options, payment, distanceKm, durationMin, prixEstime,
    } = payload

    const typeLabel: Record<string, string> = {
      airport:  'Aéroport / Gare',
      disposal: 'Mise à disposition',
      event:    'Événement',
      distance: 'Longue distance',
    }

    const from = process.env.EMAIL_FROM ?? 'onboarding@resend.dev'

    const safe = {
      name:        escapeHtml(name),
      phone:       escapeHtml(phone),
      email:       escapeHtml(email),
      departure:   escapeHtml(departure),
      destination: escapeHtml(destination),
      date:        escapeHtml(date ?? ''),
      time:        escapeHtml(time ?? ''),
      passengers:  escapeHtml(passengers ?? ''),
      payment:     escapeHtml(payment ?? ''),
      options:     options.map(escapeHtml),
      type:        escapeHtml(typeLabel[type] ?? type ?? ''),
    }

    const distanceRow = distanceKm != null
      ? `${distanceKm} km — ${durationMin ?? '?'} min`
      : 'À confirmer manuellement avec le client'

    const priceBlock = prixEstime != null
      ? `<p style="font-size: 42px; font-weight: 300; margin: 0; letter-spacing: 2px;">${prixEstime}€</p>`
      : `<p style="font-size: 20px; font-weight: 300; margin: 0;">Tarif à confirmer — distance non calculée automatiquement</p>`

    const detailTable = `
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; width: 40%;">Client</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 15px;">${safe.name}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Téléphone</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 15px;"><a href="tel:${safe.phone}" style="color: #C9A96E;">${safe.phone}</a></td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Email</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 15px;"><a href="mailto:${safe.email}" style="color: #C9A96E;">${safe.email}</a></td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Type</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 15px;">${safe.type}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Départ</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 15px;">${safe.departure}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Destination</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 15px;">${safe.destination}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Date & heure</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 15px;">${safe.date} à ${safe.time}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Passagers</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 15px;">${safe.passengers}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Distance</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 15px;">${distanceRow}</td>
        </tr>
        ${safe.options.length > 0 ? `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Options</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 15px;">${safe.options.join(', ')}</td>
        </tr>` : ''}
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Paiement</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 15px;">${safe.payment}</td>
        </tr>
      </table>
      <div style="margin-top: 32px; padding: 24px; background: #0A0A0A; color: #F5F0E8;">
        <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 3px; color: #C9A96E; margin: 0 0 8px;">Tarif estimé</p>
        ${priceBlock}
      </div>`

    // L'email chauffeur est le lead lui-même : s'il échoue, la demande est
    // perdue. On bloque donc la réponse et on prévient le client au lieu
    // de renvoyer success:true à tort.
    const chauffeurSend = await resend.emails.send({
      from,
      to:      process.env.CHAUFFEUR_EMAIL!,
      replyTo: email,
      subject: `Nouvelle demande de devis — ${name}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
          <div style="border-bottom: 2px solid #C9A96E; padding-bottom: 24px; margin-bottom: 32px;">
            <h1 style="font-size: 28px; font-weight: 300; margin: 0; letter-spacing: 2px;">NOUVELLE DEMANDE DE DEVIS</h1>
            <p style="color: #C9A96E; font-size: 13px; letter-spacing: 3px; text-transform: uppercase; margin-top: 8px;">Chauffeur Privé Premium</p>
          </div>
          ${detailTable}
          <p style="margin-top: 24px; color: #888; font-size: 13px;">Répondez directement à cet email pour confirmer ou ajuster le devis.</p>
        </div>`,
    })

    if (chauffeurSend.error) {
      console.error('[devis] CRITICAL: email chauffeur échoué', chauffeurSend.error)
      Sentry.captureException(new Error('devis: échec email chauffeur'), { extra: { resendError: chauffeurSend.error } })
      return NextResponse.json({ error: ERROR_CALL_US }, { status: 500 })
    }

    // Email de confirmation client — best effort, ne bloque pas la réponse.
    resend.emails.send({
      from,
      to:      email,
      subject: `Votre devis chauffeur privé — ${date}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
          <div style="border-bottom: 2px solid #C9A96E; padding-bottom: 24px; margin-bottom: 32px;">
            <h1 style="font-size: 28px; font-weight: 300; margin: 0; letter-spacing: 2px;">VOTRE DEVIS</h1>
            <p style="color: #C9A96E; font-size: 13px; letter-spacing: 3px; text-transform: uppercase; margin-top: 8px;">Chauffeur Privé Premium</p>
          </div>
          <p style="font-size: 16px; font-weight: 300; margin-bottom: 32px;">Bonjour ${safe.name},<br><br>Nous avons bien reçu votre demande. Voici le récapitulatif de votre trajet :</p>
          ${detailTable}
          <p style="margin-top: 24px; color: #888; font-size: 13px;">Notre chauffeur vous contactera sous 2 heures pour confirmer votre réservation.</p>
        </div>`,
    }).then(r => {
      if (r.error) console.error('[devis] email client échoué (non bloquant):', r.error)
    }).catch(err => console.error('[devis] email client échoué (non bloquant):', err))

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('[devis]', err)
    Sentry.captureException(err)
    return NextResponse.json({ error: ERROR_CALL_US }, { status: 500 })
  }
}
