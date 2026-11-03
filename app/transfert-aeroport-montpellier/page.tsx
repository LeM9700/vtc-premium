import type { Metadata } from 'next'
import SceneHero         from '@/components/scenes/SceneHero'
import SceneContact      from '@/components/scenes/SceneContact'
import SectionHighlights from '@/components/ui/SectionHighlights'
import FAQSection        from '@/components/ui/FAQSection'
import ErrorBoundary     from '@/components/ui/ErrorBoundary'
import { buildBreadcrumbJsonLd } from '@/lib/breadcrumb'

const FAQ_ITEMS = [
  {
    question: 'Combien coûte un transfert aéroport Montpellier ?',
    answer:
      "Le tarif dépend de la distance entre l'aéroport et votre adresse : forfait de 20€ pour moins de 5 km, 25€ jusqu'à 10 km, puis 2,50€/km au-delà. Élia calcule le tarif exact dès que vous indiquez votre adresse.",
  },
  {
    question: 'Suivez-vous mon vol en cas de retard ?',
    answer: "Oui, nous suivons votre vol en temps réel et adaptons automatiquement l'heure de prise en charge, sans que vous ayez à nous prévenir.",
  },
  {
    question: 'Comment réserver mon transfert ?',
    answer:
      "Via Élia, notre assistante de réservation, directement dans le chat du site : précisez arrivée ou départ, votre adresse, la date et l'heure de vol. Le devis est calculé automatiquement.",
  },
  {
    question: 'Le transfert est-il disponible de nuit ?',
    answer: 'Oui, 24h/24 et 7j/7, y compris pour les vols de nuit ou très matinaux.',
  },
]

export const metadata: Metadata = {
  title: 'Transfert Aéroport Montpellier-Méditerranée',
  description:
    "Navette et transfert VTC depuis l'Aéroport Montpellier-Méditerranée. VTCLAND assure votre prise en charge avec suivi des vols en temps réel. Réservation 24h/24.",
  alternates: { canonical: '/transfert-aeroport-montpellier' },
  openGraph: {
    title: 'Transfert Aéroport Montpellier-Méditerranée — VTCLAND',
    description:
      "Chauffeur privé pour l'Aéroport Montpellier-Méditerranée. Suivi de vol, accueil personnalisé, disponible 24h/24.",
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Transfert aéroport Montpellier VTCLAND' }],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TaxiService',
  name: "VTCLAND — Transfert Aéroport Montpellier",
  description: "Service de transfert VTC depuis et vers l'Aéroport Montpellier-Méditerranée.",
  url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vtcland.fr'}/transfert-aeroport-montpellier`,
  telephone: '+33783699229',
  serviceType: 'Transfert aéroport',
  serviceArea: { '@type': 'City', name: 'Montpellier' },
  address: { '@type': 'PostalAddress', addressLocality: 'Montpellier', addressRegion: 'Occitanie', addressCountry: 'FR' },
  geo: { '@type': 'GeoCoordinates', latitude: 43.6323851, longitude: 3.9162285 },
  priceRange: '€€€',
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '00:00',
    closes: '23:59',
  },
  provider: { '@type': 'Organization', name: 'VTCLAND', url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vtcland.fr' },
}

const breadcrumbJsonLd = buildBreadcrumbJsonLd('Transfert Aéroport Montpellier', '/transfert-aeroport-montpellier')

export default function TransfertAeroportMontpellier() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ErrorBoundary>
      <SceneHero
        heroImageSrc="/images/hero-aeroport-montpellier.webp"
        imageAlt="Transfert VTCLAND vers l'Aéroport Montpellier-Méditerranée"
        title={
          <>
            Aéroport Montpellier<br />
            <span className="text-[#C9A96E] italic">sans l&apos;imprévu.</span>
          </>
        }
        subtitle="Transfert · Méditerranée · Vol suivi en temps réel"
        ctaLabel="Réserver mon transfert"
        discoverHref="#highlights"
      />
      <SectionHighlights
        label="Transfert aéroport · Méditerranée & Camargue"
        title={
          <>
            Votre vol arrive.<br />
            <em className="text-[#C9A96E] not-italic">Votre chauffeur attend.</em>
          </>
        }
        intro="Chaque transfert est une promesse tenue. VTCLAND suit votre vol en temps réel — aucun changement d'horaire ne nous surprend. De l'Aéroport Montpellier-Méditerranée à votre destination en Hérault, ou depuis Nîmes-Camargue vers le Gard, vous montez à bord d'un véhicule de prestige, prêt et ponctuel."
        highlights={[
          {
            title: 'Suivi de vol en temps réel',
            body:  'Retard ou avance : nous adaptons l\'heure de prise en charge automatiquement. Vous ne gérez rien.',
          },
          {
            title: 'Accueil personnalisé',
            body:  'Votre prénom sur pancarte à la sortie des arrivées, eau fraîche, assistance aux bagages.',
          },
          {
            title: 'Deux aéroports, une exigence',
            body:  'Montpellier-Méditerranée (MPL) et Nîmes-Camargue (FNI) — même niveau de service, 24h/24.',
          },
        ]}
      />
      <FAQSection items={FAQ_ITEMS} title="Questions fréquentes — Transfert Aéroport Montpellier" />
      <SceneContact
        greeting="Bonsoir. Je vois que vous préparez un transfert vers ou depuis l'Aéroport Montpellier-Méditerranée. S'agit-il d'une arrivée ou d'un départ ?"
        contextKey="transfert-aeroport-montpellier"
      />
      </ErrorBoundary>
    </main>
  )
}
