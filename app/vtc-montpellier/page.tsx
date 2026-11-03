import type { Metadata } from 'next'
import SceneHero         from '@/components/scenes/SceneHero'
import SceneServices     from '@/components/scenes/SceneServices'
import SceneContact      from '@/components/scenes/SceneContact'
import SectionHighlights from '@/components/ui/SectionHighlights'
import FAQSection        from '@/components/ui/FAQSection'
import ErrorBoundary     from '@/components/ui/ErrorBoundary'
import { buildBreadcrumbJsonLd } from '@/lib/breadcrumb'

const FAQ_ITEMS = [
  {
    question: 'Combien coûte un VTC à Montpellier ?',
    answer:
      "Le tarif est de 2€/km avec un minimum de 20€. Il est calculé côté serveur sur l’itinéraire routier réel, sans majoration de nuit, dimanche ou jour férié.",
  },
  {
    question: 'Desservez-vous l\'Aéroport Montpellier-Méditerranée ?',
    answer:
      "Oui, avec suivi de vol en temps réel : votre chauffeur adapte l'heure de prise en charge en cas de retard, sans que vous ayez à le signaler.",
  },
  {
    question: 'Puis-je réserver un VTC la nuit à Montpellier ?',
    answer: 'Oui, le service est disponible 24h/24 et 7j/7, y compris pour les vols de nuit.',
  },
  {
    question: 'Comment fonctionne la réservation avec Élia ?',
    answer:
      "Élia vous pose quelques questions dans le chat (adresses, date, heure, passagers), calcule automatiquement le tarif, puis vous envoie un email de confirmation. Notre chauffeur vous recontacte sous 2 heures.",
  },
]

export const metadata: Metadata = {
  title: 'VTC Montpellier | Chauffeur Privé Hérault',
  description:
    "VTCLAND, votre chauffeur privé à Montpellier. Transferts Aéroport Montpellier-Méditerranée, mise à disposition en Hérault, VTC événementiel. Devis immédiat, disponible 24h/24.",
  alternates: { canonical: '/vtc-montpellier' },
  openGraph: {
    title: 'VTC Montpellier | Chauffeur Privé Hérault — VTCLAND',
    description:
      "Votre chauffeur privé à Montpellier. Aéroport, événements, longue distance. Disponible 24h/24 en Hérault.",
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'VTC Montpellier VTCLAND' }],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TaxiService',
  name: 'VTCLAND — VTC Montpellier',
  description: "Chauffeur privé à Montpellier et en Hérault. Disponible 24h/24.",
  url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vtcland.fr'}/vtc-montpellier`,
  telephone: '+33783699229',
  serviceArea: { '@type': 'City', name: 'Montpellier' },
  areaServed:  { '@type': 'AdministrativeArea', name: 'Hérault' },
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

const breadcrumbJsonLd = buildBreadcrumbJsonLd('VTC Montpellier', '/vtc-montpellier')

export default function VtcMontpellier() {
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
        heroImageSrc="/images/hero-vtc-montpellier.webp"
        imageAlt="Chauffeur privé VTCLAND à Montpellier, Hérault"
        title={
          <>
            VTC Montpellier<br />
            <span className="text-[#C9A96E] italic">à votre service.</span>
          </>
        }
        subtitle="Chauffeur privé · Hérault · Occitanie"
        ctaLabel="Réserver à Montpellier"
        discoverHref="#highlights"
      />
      <SectionHighlights
        label="VTC Montpellier · Hérault · Occitanie"
        title={
          <>
            Montpellier mérite<br />
            <em className="text-[#C9A96E] not-italic">un chauffeur à sa hauteur.</em>
          </>
        }
        intro="Capitale de l'Hérault, ville universitaire et économique rayonnante — Montpellier a son propre rythme. VTCLAND s'y inscrit naturellement : transferts depuis l'Aéroport Montpellier-Méditerranée, mise à disposition pour vos rendez-vous d'affaires, ou simplement le plaisir de se déplacer autrement."
        highlights={[
          {
            title: 'Aéroport Montpellier-Méditerranée',
            body:  'Arrivées et départs avec suivi de vol en temps réel. Votre chauffeur adapte l\'heure sans que vous le demandiez.',
          },
          {
            title: 'Hérault sans frontière',
            body:  'Montpellier, Sète, Béziers, Lodève, Pézenas — nous couvrons l\'ensemble du département et au-delà.',
          },
          {
            title: 'Disponible 24h/24',
            body:  'Vol de nuit, séminaire matinal, soirée tardive — VTCLAND est là à l\'heure que vous choisissez.',
          },
        ]}
      />
      <SceneServices />
      <FAQSection items={FAQ_ITEMS} title="Questions fréquentes — VTC Montpellier" />
      <SceneContact
        greeting="Bonsoir. Je suis Élia, votre assistante de réservation pour Montpellier et l'Hérault. Pour quel type de trajet puis-je vous préparer un devis ?"
        contextKey="vtc-montpellier"
      />
      </ErrorBoundary>
    </main>
  )
}
