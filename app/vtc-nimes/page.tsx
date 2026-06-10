import type { Metadata } from 'next'
import SceneHero         from '@/components/scenes/SceneHero'
import SceneServices     from '@/components/scenes/SceneServices'
import SceneContact      from '@/components/scenes/SceneContact'
import SectionHighlights from '@/components/ui/SectionHighlights'

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
        heroImageSrc="/images/hero-vtc-nimes.webp"
        title={
          <>
            VTC Nîmes<br />
            <span className="text-[#C9A96E] italic">excellence &amp; ponctualité.</span>
          </>
        }
        subtitle="Chauffeur privé · Gard · Occitanie"
        ctaLabel="Réserver à Nîmes"
        discoverHref="#highlights"
      />
      <SectionHighlights
        label="VTC Nîmes · Gard · Occitanie"
        title={
          <>
            Nîmes, ville d&apos;histoire.<br />
            <em className="text-[#C9A96E] not-italic">Votre chauffeur, sans histoire.</em>
          </>
        }
        intro="Arènes romaines, férias, Pont du Gard — Nîmes est une ville qui ne dort jamais vraiment. VTCLAND y est chez lui : transferts depuis l'Aéroport Nîmes-Camargue, déplacements dans le Gard, longue distance vers Paris ou Lyon. Ponctualité et discrétion, toujours."
        highlights={[
          {
            title: 'Aéroport Nîmes-Camargue',
            body:  'Prise en charge à l\'aéroport FNI avec suivi des vols. Accueil personnalisé dès la sortie des arrivées.',
          },
          {
            title: 'Tout le Gard couvert',
            body:  'Nîmes, Alès, Uzès, Le Grau-du-Roi, Pont du Gard — chaque destination gardoise est accessible.',
          },
          {
            title: 'Événements nîmois',
            body:  'Férias, concerts aux arènes, mariages en Camargue — nous connaissons le terrain et anticipons l\'affluence.',
          },
        ]}
      />
      <SceneServices />
      <SceneContact
        greeting="Bonsoir. Je suis Élia, votre assistante de réservation pour Nîmes et le Gard. Pour quel type de trajet puis-je vous préparer un devis ?"
        contextNote="Le client navigue depuis la page VTC Nîmes (Gard). S'il ne précise pas de ville, suppose Nîmes par défaut."
      />
    </main>
  )
}
