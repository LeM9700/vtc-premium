import type { Metadata } from 'next'
import SceneHero    from '@/components/scenes/SceneHero'
import SceneContact from '@/components/scenes/SceneContact'

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
  serviceType: "Transport longue distance",
  areaServed: [
    { '@type': 'AdministrativeArea', name: 'Occitanie' },
    { '@type': 'Country', name: 'France' },
  ],
}

export default function LongueDistanceOccitanie() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SceneHero
        title={
          <>
            Toutes destinations,<br />
            <span className="text-[#C9A96E] italic">un seul chauffeur.</span>
          </>
        }
        subtitle="Longue distance · Paris · Lyon · Monaco · Genève"
        ctaLabel="Planifier mon trajet"
      />
      <SceneContact />
    </main>
  )
}
