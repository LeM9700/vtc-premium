import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

interface DevisPayload {
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
  distanceKm:  number
  durationMin: number
  prixEstime:  number
}

/**
 * Envoie un email de devis au chauffeur via Resend.
 * POST DevisPayload → { success: boolean }
 */
export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  try {
    const payload: DevisPayload = await req.json()

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

    const detailTable = `
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; width: 40%;">Client</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 15px;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Téléphone</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 15px;"><a href="tel:${phone}" style="color: #C9A96E;">${phone}</a></td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Email</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 15px;"><a href="mailto:${email}" style="color: #C9A96E;">${email}</a></td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Type</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 15px;">${typeLabel[type] ?? type}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Départ</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 15px;">${departure}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Destination</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 15px;">${destination}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Date & heure</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 15px;">${date} à ${time}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Passagers</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 15px;">${passengers}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Distance</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 15px;">${distanceKm} km — ${durationMin} min</td>
        </tr>
        ${options.length > 0 ? `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Options</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 15px;">${options.join(', ')}</td>
        </tr>` : ''}
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Paiement</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 15px;">${payment}</td>
        </tr>
      </table>
      <div style="margin-top: 32px; padding: 24px; background: #0A0A0A; color: #F5F0E8;">
        <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 3px; color: #C9A96E; margin: 0 0 8px;">Tarif estimé</p>
        <p style="font-size: 42px; font-weight: 300; margin: 0; letter-spacing: 2px;">${prixEstime}€</p>
      </div>`

    const results = await Promise.allSettled([
      resend.emails.send({
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
      }),
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
            <p style="font-size: 16px; font-weight: 300; margin-bottom: 32px;">Bonjour ${name},<br><br>Nous avons bien reçu votre demande. Voici le récapitulatif de votre trajet :</p>
            ${detailTable}
            <p style="margin-top: 24px; color: #888; font-size: 13px;">Notre chauffeur vous contactera sous 2 heures pour confirmer votre réservation.</p>
          </div>`,
      }),
    ])

    results.forEach((r, i) => {
      if (r.status === 'rejected')
        console.error(`[devis] email ${i === 0 ? 'chauffeur' : 'client'} failed:`, r.reason)
    })

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('[devis]', err)
    return NextResponse.json({ error: 'Erreur envoi email' }, { status: 500 })
  }
}