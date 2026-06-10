import type { Metadata } from 'next'
import SceneHero         from '@/components/scenes/SceneHero'
import SceneContact      from '@/components/scenes/SceneContact'
import SectionHighlights from '@/components/ui/SectionHighlights'

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
        heroImageSrc="/images/hero-mariage-gard.webp"
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
      <SceneContact
        greeting="Bonsoir. Je suis ravie de vous accompagner pour le transport de votre mariage dans le Gard ou l'Hérault. Quelle est la date de la cérémonie ?"
        contextNote="Le type de trajet est 'event' (mariage). Ne demande pas le type : commence directement par la date de la cérémonie."
      />
    </main>
  )
}
