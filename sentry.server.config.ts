import * as Sentry from '@sentry/nextjs'

// DSN absent = SDK inactif (no-op), aucun risque en local sans compte Sentry.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
})
