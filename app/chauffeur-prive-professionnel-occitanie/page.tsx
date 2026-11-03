import type { Metadata } from 'next'
import SceneHero         from '@/components/scenes/SceneHero'
import SceneContact      from '@/components/scenes/SceneContact'
import SectionHighlights from '@/components/ui/SectionHighlights'
import FAQSection        from '@/components/ui/FAQSection'
import ErrorBoundary     from '@/components/ui/ErrorBoundary'
import { buildBreadcrumbJsonLd } from '@/lib/breadcrumb'

const FAQ_ITEMS = [
  {
    question: 'Proposez-vous la facturation entreprise ?',
    answer:
      "Oui. Compte client, factures avec mention de TVA et reporting mensuel sont disponibles pour simplifier l'intégration à votre gestion de frais professionnels.",
  },
  {
    question: 'Combien coûte une mise à disposition professionnelle ?',
    answer:
      "Comptez environ 320€ pour une demi-journée (4h) et 490€ pour une journée complète (7h), soit un tarif dégressif entre 70€ et 80€/h selon la durée. Au-delà de 7h, le tarif est de 100€/h. Élia vous confirme le montant exact selon vos besoins.",
  },
  {
    question: 'Le chauffeur respecte-t-il la confidentialité de mes échanges professionnels ?',
    answer:
      "Oui, discrétion absolue. Votre chauffeur est soumis à une stricte obligation de réserve sur tout ce qui se dit ou se fait à bord du véhicule.",
  },
  {
    question: 'Peut-on réserver un chauffeur pour plusieurs jours consécutifs (séminaire) ?',
    answer:
      "Oui, la mise à disposition peut être organisée sur plusieurs jours pour un séminaire ou un déplacement professionnel prolongé. Précisez votre programme à Élia pour un devis adapté.",
  },
]

export const metadata: Metadata = {
  title: 'Chauffeur Privé Professionnel Occitanie',
  description:
    "VTCLAND, partenaire transport des entreprises en Occitanie. Mise à disposition, transferts gare et aéroport, séminaires. Facturation entreprise, discrétion garantie.",
  alternates: { canonical: '/chauffeur-prive-professionnel-occitanie' },
  openGraph: {
    title: 'Chauffeur Privé Professionnel Occitanie — VTCLAND',
    description:
      "Transport d'affaires haut de gamme en Occitanie. Mise à disposition, aéroport, séminaires. Facturation entreprise.",
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Chauffeur professionnel Occitanie VTCLAND' }],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TaxiService',
  name: "VTCLAND — Chauffeur Professionnel Occitanie",
  description: "Transport d'affaires et mise à disposition pour les professionnels en Occitanie.",
  url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vtcland.fr'}/chauffeur-prive-professionnel-occitanie`,
  telephone: '+33783699229',
  serviceType: "Transport professionnel",
  areaServed: { '@type': 'AdministrativeArea', name: 'Occitanie' },
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

const breadcrumbJsonLd = buildBreadcrumbJsonLd('Chauffeur Privé Professionnel Occitanie', '/chauffeur-prive-professionnel-occitanie')

export default function ChauffeurProOccitanie() {
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
        heroImageSrc="/images/hero-chauffeur-pro.webp"
        imageAlt="Chauffeur privé professionnel VTCLAND pour mise à disposition en Occitanie"
        title={
          <>
            Transport<br />
            <span className="text-[#C9A96E] italic">d&apos;affaires, sans compromis.</span>
          </>
        }
        subtitle="Chauffeur professionnel · Occitanie · Facturation entreprise"
        ctaLabel="Devis entreprise"
        discoverHref="#highlights"
      />
      <SectionHighlights
        label="Transport d'affaires · Occitanie"
        title={
          <>
            L&apos;excellence<br />
            <em className="text-[#C9A96E] not-italic">comme standard.</em>
          </>
        }
        intro="Vos collaborateurs méritent mieux que les aléas des transports en commun. VTCLAND est le partenaire transport des entreprises en Occitanie — mise à disposition journalière, transferts gare et aéroport, navettes de séminaire à Montpellier et Nîmes. Facturation entreprise disponible."
        highlights={[
          {
            title: 'Mise à disposition dédiée',
            body:  'Votre chauffeur reste disponible entre vos rendez-vous sur la journée. Aucun temps mort, aucune attente.',
          },
          {
            title: 'Facturation entreprise',
            body:  'Compte client, factures avec TVA, reporting mensuel. Intégration simplifiée à votre gestion de frais.',
          },
          {
            title: 'Confidentialité totale',
            body:  'Discrétion absolue pour vos échanges à bord. Votre chauffeur est soumis à une stricte obligation de réserve.',
          },
        ]}
      />
      <FAQSection items={FAQ_ITEMS} title="Questions fréquentes — Chauffeur Privé Professionnel" />
      <SceneContact
        greeting="Bonsoir. Je vous prépare un devis pour une mise à disposition professionnelle en Occitanie. Combien d'heures de mise à disposition souhaitez-vous ?"
        contextKey="chauffeur-prive-professionnel-occitanie"
      />
      </ErrorBoundary>
    </main>
  )
}
