import type { Metadata } from 'next'
import SceneHero    from '@/components/scenes/SceneHero'
import SceneContact from '@/components/scenes/SceneContact'

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
  serviceType: 'Transport événementiel mariage',
  areaServed: [
    { '@type': 'AdministrativeArea', name: 'Gard' },
    { '@type': 'AdministrativeArea', name: 'Hérault' },
  ],
}

export default function VtcMariageGard() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SceneHero
        title={
          <>
            Votre mariage,<br />
            <span className="text-[#C9A96E] italic">notre honneur.</span>
          </>
        }
        subtitle="Chauffeur événementiel · Gard & Hérault · Sur devis"
        ctaLabel="Devis mariage"
      />
      <SceneContact />
    </main>
  )
}
