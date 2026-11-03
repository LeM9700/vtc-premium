import type { Metadata } from 'next'
import SceneContact from '@/components/scenes/SceneContact'
import SceneHero from '@/components/scenes/SceneHero'
import SceneIdentity from '@/components/scenes/SceneIdentity'
import SceneServices from '@/components/scenes/SceneServices'
import SceneSocialProof from '@/components/scenes/SceneSocialProof'
import SceneVehicle from '@/components/scenes/SceneVehicle'
import FAQSection from '@/components/ui/FAQSection'
import PricingSection from '@/components/ui/PricingSection'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import { getGoogleReviews } from '@/lib/googleReviews'
import QuickBookingForm from '@/components/booking/QuickBookingForm'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

const FAQ_ITEMS = [
  {
    question: 'Comment fonctionne la réservation avec Élia ?',
    answer:
      "Élia recueille les informations du trajet puis l’API calcule le tarif. Une référence de demande vous est envoyée ; la course est confirmée uniquement après acceptation du chauffeur.",
  },
  {
    question: 'Quels sont vos tarifs ?',
    answer:
      "Chaque trajet est facturé 2€/km avec un minimum de 20€. La mise à disposition coûte 70€/h. Aucune majoration ne s’applique la nuit, le dimanche ou les jours fériés.",
  },
  {
    question: 'VTCLAND est-il disponible la nuit ?',
    answer:
      "Oui, le service est disponible 24h/24 et 7j/7 en Occitanie, y compris pour les vols de nuit et les prises en charge tardives.",
  },
  {
    question: 'Quelles zones desservez-vous ?',
    answer:
      "VTCLAND opère principalement à Montpellier, Nîmes, dans le Gard et l'Hérault, ainsi que pour des trajets longue distance vers le reste de la France.",
  },
]

export default async function HomePage() {
  const reviews = await getGoogleReviews()

  return (
    <main>
      <ErrorBoundary><SceneHero /></ErrorBoundary>
      <ErrorBoundary><SceneIdentity /></ErrorBoundary>
      <ErrorBoundary><SceneVehicle /></ErrorBoundary>
      <ErrorBoundary><SceneServices /></ErrorBoundary>
      <ErrorBoundary><SceneSocialProof reviews={reviews} /></ErrorBoundary>
      <PricingSection />
      <FAQSection items={FAQ_ITEMS} />
      <ErrorBoundary><QuickBookingForm /></ErrorBoundary>
      <ErrorBoundary><SceneContact /></ErrorBoundary>
      {/* Les scènes arrivent une par une */}
    </main>
  )
}
