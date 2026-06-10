import type { Metadata } from 'next'
import SceneHero         from '@/components/scenes/SceneHero'
import SceneServices     from '@/components/scenes/SceneServices'
import SceneContact      from '@/components/scenes/SceneContact'
import SectionHighlights from '@/components/ui/SectionHighlights'

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
        heroImageSrc="/images/hero-vtc-montpellier.webp"
        title={
          <>
            VTC Montpellier<br />
            <span className="text-[#C9A96E] italic">à votre service.</span>
          </>
        }
        subtitle="Chauffeur privé · Hérault · Occitanie"
        ctaLabel="Réserver à Montpellier"
        discoverHref="#highlights"
      />
      <SectionHighlights
        label="VTC Montpellier · Hérault · Occitanie"
        title={
          <>
            Montpellier mérite<br />
            <em className="text-[#C9A96E] not-italic">un chauffeur à sa hauteur.</em>
          </>
        }
        intro="Capitale de l'Hérault, ville universitaire et économique rayonnante — Montpellier a son propre rythme. VTCLAND s'y inscrit naturellement : transferts depuis l'Aéroport Montpellier-Méditerranée, mise à disposition pour vos rendez-vous d'affaires, ou simplement le plaisir de se déplacer autrement."
        highlights={[
          {
            title: 'Aéroport Montpellier-Méditerranée',
            body:  'Arrivées et départs avec suivi de vol en temps réel. Votre chauffeur adapte l\'heure sans que vous le demandiez.',
          },
          {
            title: 'Hérault sans frontière',
            body:  'Montpellier, Sète, Béziers, Lodève, Pézenas — nous couvrons l\'ensemble du département et au-delà.',
          },
          {
            title: 'Disponible 24h/24',
            body:  'Vol de nuit, séminaire matinal, soirée tardive — VTCLAND est là à l\'heure que vous choisissez.',
          },
        ]}
      />
      <SceneServices />
      <SceneContact
        greeting="Bonsoir. Je suis Élia, votre assistante de réservation pour Montpellier et l'Hérault. Pour quel type de trajet puis-je vous préparer un devis ?"
        contextNote="Le client navigue depuis la page VTC Montpellier (Hérault). S'il ne précise pas de ville, suppose Montpellier par défaut."
      />
    </main>
  )
}
