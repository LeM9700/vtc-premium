import type { Metadata } from 'next'
import SceneHero      from '@/components/scenes/SceneHero'
import SceneServices  from '@/components/scenes/SceneServices'
import SceneContact   from '@/components/scenes/SceneContact'

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
  serviceArea: { '@type': 'City', name: 'Montpellier' },
  areaServed:  { '@type': 'AdministrativeArea', name: 'Hérault' },
}

export default function VtcMontpellier() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SceneHero
        title={
          <>
            VTC Montpellier<br />
            <span className="text-[#C9A96E] italic">à votre service.</span>
          </>
        }
        subtitle="Chauffeur privé · Hérault · Occitanie"
        ctaLabel="Réserver à Montpellier"
      />
      <SceneServices />
      <SceneContact />
    </main>
  )
}
