import type { Metadata } from 'next'
import SceneHero    from '@/components/scenes/SceneHero'
import SceneContact from '@/components/scenes/SceneContact'

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
  serviceType: "Transport professionnel",
  areaServed: { '@type': 'AdministrativeArea', name: 'Occitanie' },
}

export default function ChauffeurProOccitanie() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SceneHero
        title={
          <>
            Transport<br />
            <span className="text-[#C9A96E] italic">d&apos;affaires, sans compromis.</span>
          </>
        }
        subtitle="Chauffeur professionnel · Occitanie · Facturation entreprise"
        ctaLabel="Devis entreprise"
      />
      <SceneContact />
    </main>
  )
}
