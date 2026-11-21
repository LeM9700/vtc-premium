import * as Sentry from '@sentry/nextjs'
import { scrubSentryEvent, scrubSentryTransaction } from '@/lib/sentryPrivacy'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  beforeSend: scrubSentryEvent,
  beforeSendTransaction: scrubSentryTransaction,
})
