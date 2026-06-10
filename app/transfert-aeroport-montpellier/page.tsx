import type { Metadata } from 'next'
import SceneHero          from '@/components/scenes/SceneHero'
import SceneContact       from '@/components/scenes/SceneContact'
import SectionHighlights  from '@/components/ui/SectionHighlights'

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
        heroImageSrc="/images/hero-aeroport-montpellier.webp"
        title={
          <>
            Aéroport Montpellier<br />
            <span className="text-[#C9A96E] italic">sans l&apos;imprévu.</span>
          </>
        }
        subtitle="Transfert · Méditerranée · Vol suivi en temps réel"
        ctaLabel="Réserver mon transfert"
        discoverHref="#highlights"
      />
      <SectionHighlights
        label="Transfert aéroport · Méditerranée & Camargue"
        title={
          <>
            Votre vol arrive.<br />
            <em className="text-[#C9A96E] not-italic">Votre chauffeur attend.</em>
          </>
        }
        intro="Chaque transfert est une promesse tenue. VTCLAND suit votre vol en temps réel — aucun changement d'horaire ne nous surprend. De l'Aéroport Montpellier-Méditerranée à votre destination en Hérault, ou depuis Nîmes-Camargue vers le Gard, vous montez à bord d'un véhicule de prestige, prêt et ponctuel."
        highlights={[
          {
            title: 'Suivi de vol en temps réel',
            body:  'Retard ou avance : nous adaptons l\'heure de prise en charge automatiquement. Vous ne gérez rien.',
          },
          {
            title: 'Accueil personnalisé',
            body:  'Votre prénom sur pancarte à la sortie des arrivées, eau fraîche, assistance aux bagages.',
          },
          {
            title: 'Deux aéroports, une exigence',
            body:  'Montpellier-Méditerranée (MPL) et Nîmes-Camargue (FNI) — même niveau de service, 24h/24.',
          },
        ]}
      />
      <SceneContact
        greeting="Bonsoir. Je vois que vous préparez un transfert vers ou depuis l'Aéroport Montpellier-Méditerranée. S'agit-il d'une arrivée ou d'un départ ?"
        contextNote="Le type de trajet est 'airport', l'une des deux adresses est l'Aéroport Montpellier-Méditerranée (MPL). Ne demande pas le type : commence par confirmer arrivée/départ, puis collecte uniquement l'adresse manquante (ville incluse)."
      />
    </main>
  )
}
