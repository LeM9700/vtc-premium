import type { Metadata } from 'next'
import SceneHero    from '@/components/scenes/SceneHero'
import SceneContact from '@/components/scenes/SceneContact'

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
  serviceType: 'Transfert aéroport',
  serviceArea: { '@type': 'City', name: 'Montpellier' },
}

export default function TransfertAeroportMontpellier() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SceneHero
        title={
          <>
            Aéroport Montpellier<br />
            <span className="text-[#C9A96E] italic">sans l&apos;imprévu.</span>
          </>
        }
        subtitle="Transfert · Méditerranée · Vol suivi en temps réel"
        ctaLabel="Réserver mon transfert"
      />
      <SceneContact />
    </main>
  )
}
