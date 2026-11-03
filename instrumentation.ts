import * as Sentry from '@sentry/nextjs'

// Variables requises pour que le parcours de conversion fonctionne (chat,
// distance, envoi d'email). Aucune n'est vérifiée par Next.js au démarrage —
// sans ce check, un déploiement avec une clé manquante démarre normalement
// et échoue silencieusement à la première requête utilisateur.
const REQUIRED_ENV_VARS = [
  'ANTHROPIC_API_KEY',
  'DEVIS_SECRET',
  'RESEND_API_KEY',
  'EMAIL_FROM',
  'CHAUFFEUR_EMAIL',
  'OPENROUTESERVICE_API_KEY',
  'NEXT_PUBLIC_SITE_URL',
] as const

function checkRequiredEnvVars() {
  const missing = REQUIRED_ENV_VARS.filter(key => !process.env[key])
  if (missing.length > 0) {
    console.error(
      `[ENV] Variable(s) manquante(s) au démarrage — le site répondra mais certaines fonctionnalités échoueront silencieusement : ${missing.join(', ')}`
    )
  }
}

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    checkRequiredEnvVars()
    await import('./sentry.server.config')
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

export const onRequestError = Sentry.captureRequestError
