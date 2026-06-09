import type { Metadata } from 'next'
import SceneHero     from '@/components/scenes/SceneHero'
import SceneServices from '@/components/scenes/SceneServices'
import SceneContact  from '@/components/scenes/SceneContact'

export const metadata: Metadata = {
  title: 'VTC Nîmes | Chauffeur Privé Gard',
  description:
    "VTCLAND, votre chauffeur privé à Nîmes. Transferts Aéroport Nîmes-Camargue, mise à disposition dans le Gard, VTC événementiel (arènes, férias, mariages). Devis immédiat, disponible 24h/24.",
  alternates: { canonical: '/vtc-nimes' },
  openGraph: {
    title: 'VTC Nîmes | Chauffeur Privé Gard — VTCLAND',
    description:
      "Votre chauffeur privé à Nîmes. Aéroport Nîmes-Camargue, arènes, événements. Disponible 24h/24 dans le Gard.",
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'VTC Nîmes VTCLAND' }],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TaxiService',
  name: 'VTCLAND — VTC Nîmes',
  description: "Chauffeur privé à Nîmes et dans le Gard. Disponible 24h/24.",
  url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vtcland.fr'}/vtc-nimes`,
  serviceArea: { '@type': 'City', name: 'Nîmes' },
  areaServed:  { '@type': 'AdministrativeArea', name: 'Gard' },
}

export default function VtcNimes() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SceneHero
        title={
          <>
            VTC Nîmes<br />
            <span className="text-[#C9A96E] italic">excellence &amp; ponctualité.</span>
          </>
        }
        subtitle="Chauffeur privé · Gard · Occitanie"
        ctaLabel="Réserver à Nîmes"
      />
      <SceneServices />
      <SceneContact />
    </main>
  )
}
