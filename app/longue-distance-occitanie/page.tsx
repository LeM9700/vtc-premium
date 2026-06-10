import type { Metadata } from 'next'
import SceneHero         from '@/components/scenes/SceneHero'
import SceneContact      from '@/components/scenes/SceneContact'
import SectionHighlights from '@/components/ui/SectionHighlights'

export const metadata: Metadata = {
  title: 'VTC Longue Distance Occitanie | Paris, Lyon, Monaco',
  description:
    "VTCLAND assure vos trajets longue distance depuis Montpellier et Nîmes. Paris, Lyon, Avignon, Marseille, Monaco, Genève — voyagez sans contrainte de correspondance.",
  alternates: { canonical: '/longue-distance-occitanie' },
  openGraph: {
    title: 'VTC Longue Distance Occitanie — Paris, Lyon, Monaco — VTCLAND',
    description:
      "Trajets longue distance depuis Montpellier et Nîmes. Paris, Lyon, Monaco, Genève. Confort et ponctualité garantis.",
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'VTC longue distance Occitanie VTCLAND' }],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TaxiService',
  name: "VTCLAND — Longue Distance Occitanie",
  description: "Trajets longue distance depuis Montpellier et Nîmes vers Paris, Lyon, Monaco et toute la France.",
  url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vtcland.fr'}/longue-distance-occitanie`,
  serviceType: "Transport longue distance",
  areaServed: [
    { '@type': 'AdministrativeArea', name: 'Occitanie' },
    { '@type': 'Country', name: 'France' },
  ],
}

export default function LongueDistanceOccitanie() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SceneHero
        heroImageSrc="/images/hero-longue-distance.webp"
        title={
          <>
            Toutes destinations,<br />
            <span className="text-[#C9A96E] italic">un seul chauffeur.</span>
          </>
        }
        subtitle="Longue distance · Paris · Lyon · Monaco · Genève"
        ctaLabel="Planifier mon trajet"
        discoverHref="#highlights"
      />
      <SectionHighlights
        label="Longue distance · France & Europe"
        title={
          <>
            La route est longue.<br />
            <em className="text-[#C9A96E] not-italic">Le confort, lui, ne faiblit pas.</em>
          </>
        }
        intro="Montpellier ou Nîmes vers Paris, Lyon, Marseille, Monaco, Genève ou toute autre destination — VTCLAND transforme chaque grand trajet en moment de sérénité. Wi-Fi, silence, confort : vous travaillez ou vous reposez pendant que nous conduisons."
        highlights={[
          {
            title: 'Aucune correspondance',
            body:  'Porte à porte, sans rupture de charge ni stress des gares. Un seul véhicule, un seul chauffeur.',
          },
          {
            title: 'Wi-Fi & chargeurs à bord',
            body:  'Restez connecté et productif tout au long du trajet. Votre bureau vous accompagne.',
          },
          {
            title: 'Tarif fixe à la réservation',
            body:  'Le prix est arrêté dès la confirmation. Aucune surprise à l\'arrivée, quelle que soit la durée du trajet.',
          },
        ]}
      />
      <SceneContact
        greeting="Bonsoir. Indiquez-moi votre ville de départ (Montpellier, Nîmes...) et votre destination longue distance, et je vous prépare un devis."
        contextNote="Le type de trajet est 'distance'. Ne demande pas le type : commence directement par les adresses de départ et de destination."
      />
    </main>
  )
}
