import type { Metadata } from 'next'
import SceneHero         from '@/components/scenes/SceneHero'
import SceneContact      from '@/components/scenes/SceneContact'
import SectionHighlights from '@/components/ui/SectionHighlights'
import FAQSection        from '@/components/ui/FAQSection'
import ErrorBoundary     from '@/components/ui/ErrorBoundary'
import { buildBreadcrumbJsonLd } from '@/lib/breadcrumb'

const FAQ_ITEMS = [
  {
    question: 'Combien coûte un trajet longue distance depuis Montpellier ou Nîmes ?',
    answer:
      "Le tarif est de 2€/km avec un minimum de 20€, calculé sur l'itinéraire routier réel. La validation envoie une demande au chauffeur.",
  },
  {
    question: 'Desservez-vous Paris, Lyon, Marseille, Monaco et Genève ?',
    answer:
      "Oui, toute destination accessible par la route en France et dans les pays limitrophes peut être desservie depuis Montpellier ou Nîmes.",
  },
  {
    question: 'Le tarif est-il fixe dès la réservation ?',
    answer:
      "Oui, le tarif est calculé par l’API lors de la demande et la course est confirmée après acceptation du chauffeur.",
  },
  {
    question: 'Peut-on faire des arrêts pendant le trajet longue distance ?',
    answer:
      "Oui, sur demande. Précisez vos arrêts souhaités à Élia lors de la préparation de votre devis pour que le chauffeur organise l'itinéraire en conséquence.",
  },
]

export const metadata: Metadata = {
  title: 'VTC Longue Distance Occitanie | Paris, Lyon, Monaco',
  description:
    "VTCLAND assure vos trajets longue distance depuis Montpellier et Nîmes. Paris, Lyon, Avignon, Marseille, Monaco, Genève — voyagez sans contrainte de correspondance.",
  alternates: { canonical: '/longue-distance-occitanie' },
  openGraph: {
    title: 'VTC Longue Distance Occitanie — Paris, Lyon, Monaco — VTCLAND',
    description:
      "Trajets longue distance depuis Montpellier et Nîmes. Paris, Lyon, Monaco, Genève. Confort et ponctualité garantis.",
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'VTC longue distance Occitanie VTCLAND' }],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TaxiService',
  name: "VTCLAND — Longue Distance Occitanie",
  description: "Trajets longue distance depuis Montpellier et Nîmes vers Paris, Lyon, Monaco et toute la France.",
  url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vtcland.fr'}/longue-distance-occitanie`,
  telephone: '+33783699229',
  serviceType: "Transport longue distance",
  areaServed: [
    { '@type': 'AdministrativeArea', name: 'Occitanie' },
    { '@type': 'Country', name: 'France' },
  ],
  address: { '@type': 'PostalAddress', addressRegion: 'Occitanie', addressCountry: 'FR' },
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

const breadcrumbJsonLd = buildBreadcrumbJsonLd('Longue Distance Occitanie', '/longue-distance-occitanie')

export default function LongueDistanceOccitanie() {
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
        heroImageSrc="/images/hero-longue-distance.webp"
        imageAlt="Chauffeur privé VTCLAND pour trajets longue distance en Occitanie"
        title={
          <>
            Toutes destinations,<br />
            <span className="text-[#C9A96E] italic">un seul chauffeur.</span>
          </>
        }
        subtitle="Longue distance · Paris · Lyon · Monaco · Genève"
        ctaLabel="Planifier mon trajet"
        discoverHref="#highlights"
      />
      <SectionHighlights
        label="Longue distance · France & Europe"
        title={
          <>
            La route est longue.<br />
            <em className="text-[#C9A96E] not-italic">Le confort, lui, ne faiblit pas.</em>
          </>
        }
        intro="Montpellier ou Nîmes vers Paris, Lyon, Marseille, Monaco, Genève ou toute autre destination — VTCLAND transforme chaque grand trajet en moment de sérénité. Wi-Fi, silence, confort : vous travaillez ou vous reposez pendant que nous conduisons."
        highlights={[
          {
            title: 'Aucune correspondance',
            body:  'Porte à porte, sans rupture de charge ni stress des gares. Un seul véhicule, un seul chauffeur.',
          },
          {
            title: 'Wi-Fi & chargeurs à bord',
            body:  'Restez connecté et productif tout au long du trajet. Votre bureau vous accompagne.',
          },
          {
            title: 'Tarif fixe à la réservation',
            body:  'Le prix est calculé à 2€/km, avec un minimum de 20€, puis confirmé avec la course par le chauffeur.',
          },
        ]}
      />
      <FAQSection items={FAQ_ITEMS} title="Questions fréquentes — Longue Distance Occitanie" />
      <SceneContact
        greeting="Bonsoir. Indiquez-moi votre ville de départ (Montpellier, Nîmes...) et votre destination longue distance, et je vous prépare un devis."
        contextKey="longue-distance-occitanie"
      />
      </ErrorBoundary>
    </main>
  )
}
