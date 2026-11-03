import type { Metadata } from 'next'
import SceneHero         from '@/components/scenes/SceneHero'
import SceneContact      from '@/components/scenes/SceneContact'
import SectionHighlights from '@/components/ui/SectionHighlights'
import FAQSection        from '@/components/ui/FAQSection'
import ErrorBoundary     from '@/components/ui/ErrorBoundary'
import { buildBreadcrumbJsonLd } from '@/lib/breadcrumb'

const FAQ_ITEMS = [
  {
    question: 'Combien coûte un chauffeur privé pour un mariage dans le Gard ou l\'Hérault ?',
    answer:
      "Le tarif d'un mariage dépend de la durée de mise à disposition et du nombre de trajets (cortège, allers-retours entre lieux de cérémonie et de réception). Il n'existe pas de forfait unique : Élia établit un devis personnalisé une fois votre programme précisé (horaires, lieux, nombre de véhicules souhaités).",
  },
  {
    question: 'Peut-on réserver plusieurs véhicules pour le cortège ?',
    answer:
      "Oui, nous coordonnons plusieurs véhicules si nécessaire pour que tous vos invités arrivent ensemble, sans improvisation le jour J.",
  },
  {
    question: 'Proposez-vous des attentions particulières (fleurs, champagne) ?',
    answer:
      "Oui, sur demande : rubans, fleurs blanches, champagne à bord. Précisez vos souhaits à Élia lors de la préparation de votre devis, nous nous adaptons.",
  },
  {
    question: 'Combien de temps à l\'avance faut-il réserver pour un mariage ?',
    answer:
      "Dès que la date est fixée, idéalement plusieurs semaines à l'avance pour garantir la disponibilité du véhicule. Élia peut aussi traiter des demandes plus rapprochées selon nos disponibilités.",
  },
]

export const metadata: Metadata = {
  title: 'VTC Mariage Gard & Hérault | Chauffeur Événementiel',
  description:
    "Chauffeur privé pour votre mariage dans le Gard et l'Hérault. VTCLAND assure votre transport avec élégance. Mas provençaux, domaines viticoles, châteaux — disponible sur devis.",
  alternates: { canonical: '/vtc-mariage-gard' },
  openGraph: {
    title: 'VTC Mariage Gard & Hérault — VTCLAND',
    description:
      "Votre chauffeur privé pour un mariage d'exception dans le Gard et l'Hérault. Élégance et ponctualité garanties.",
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'VTC mariage Gard Hérault VTCLAND' }],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TaxiService',
  name: "VTCLAND — VTC Mariage Gard & Hérault",
  description: "Service de transport haut de gamme pour les mariages dans le Gard et l'Hérault.",
  url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vtcland.fr'}/vtc-mariage-gard`,
  telephone: '+33783699229',
  serviceType: 'Transport événementiel mariage',
  areaServed: [
    { '@type': 'AdministrativeArea', name: 'Gard' },
    { '@type': 'AdministrativeArea', name: 'Hérault' },
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

const breadcrumbJsonLd = buildBreadcrumbJsonLd('VTC Mariage Gard & Hérault', '/vtc-mariage-gard')

export default function VtcMariageGard() {
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
        heroImageSrc="/images/hero-mariage-gard.webp"
        imageAlt="Chauffeur privé VTCLAND pour mariage dans le Gard et l'Hérault"
        title={
          <>
            Votre mariage,<br />
            <span className="text-[#C9A96E] italic">notre honneur.</span>
          </>
        }
        subtitle="Chauffeur événementiel · Gard & Hérault · Sur devis"
        ctaLabel="Devis mariage"
        discoverHref="#highlights"
      />
      <SectionHighlights
        label="Mariage · Gard & Hérault · Événementiel"
        title={
          <>
            Le plus beau jour,<br />
            <em className="text-[#C9A96E] not-italic">sans fausse note.</em>
          </>
        }
        intro="Mas provençaux du Gard, domaines viticoles de l'Hérault, châteaux d'Occitanie — chaque lieu a son caractère, VTCLAND s'y adapte. Discret, élégant, à l'heure exacte. Du cortège au retour de soirée, nous assurons chaque trajet de votre mariage avec l'élégance qu'il mérite."
        highlights={[
          {
            title: 'Cortège & navettes',
            body:  'Coordination de plusieurs véhicules si nécessaire. Tous vos invités arrivent ensemble, sans improvisation.',
          },
          {
            title: 'Attentions personnalisées',
            body:  'Rubans, fleurs blanches, champagne à bord — nous accueillons vos demandes pour que le détail soit parfait.',
          },
          {
            title: 'Ponctualité absolue',
            body:  'Le jour J, pas de place au hasard. Votre chauffeur reconnaît les lieux en amont et anticipe chaque trajet.',
          },
        ]}
      />
      <FAQSection items={FAQ_ITEMS} title="Questions fréquentes — VTC Mariage Gard & Hérault" />
      <SceneContact
        greeting="Bonsoir. Je suis ravie de vous accompagner pour le transport de votre mariage dans le Gard ou l'Hérault. Quelle est la date de la cérémonie ?"
        contextKey="vtc-mariage-gard"
      />
      </ErrorBoundary>
    </main>
  )
}
