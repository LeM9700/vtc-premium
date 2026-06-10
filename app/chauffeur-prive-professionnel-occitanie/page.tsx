import type { Metadata } from 'next'
import SceneHero         from '@/components/scenes/SceneHero'
import SceneContact      from '@/components/scenes/SceneContact'
import SectionHighlights from '@/components/ui/SectionHighlights'

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
        heroImageSrc="/images/hero-chauffeur-pro.webp"
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
      <SceneContact
        greeting="Bonsoir. Je vous prépare un devis pour une mise à disposition professionnelle en Occitanie. Combien d'heures de mise à disposition souhaitez-vous ?"
        contextNote="Le type de trajet est 'disposal'. Ne demande pas le type : commence directement par le nombre d'heures souhaité."
      />
    </main>
  )
}
