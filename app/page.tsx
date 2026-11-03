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

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

const FAQ_ITEMS = [
  {
    question: 'Comment fonctionne la réservation avec Élia ?',
    answer:
      "Élia, notre assistante de réservation, vous pose quelques questions sur votre trajet directement dans le chat du site : type de trajet, adresses, date, heure, nombre de passagers. Une fois toutes les informations réunies, le tarif est calculé automatiquement et un email de confirmation vous est envoyé. Notre chauffeur vous recontacte ensuite sous 2 heures.",
  },
  {
    question: 'Quels sont vos tarifs ?',
    answer:
      "Pour un trajet court (moins de 5 km), le tarif est forfaitaire à 20€. Jusqu'à 10 km, il est de 25€. Au-delà, le tarif est de 2,50€/km. Pour une mise à disposition, comptez à partir de 70€/h selon la durée choisie. Le tarif exact de votre trajet est calculé automatiquement par Élia lors de la réservation.",
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
      <ErrorBoundary><SceneContact /></ErrorBoundary>
      {/* Les scènes arrivent une par une */}
    </main>
  )
}