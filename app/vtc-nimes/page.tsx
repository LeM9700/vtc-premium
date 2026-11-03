import type { Metadata } from 'next'
import SceneHero         from '@/components/scenes/SceneHero'
import SceneServices     from '@/components/scenes/SceneServices'
import SceneContact      from '@/components/scenes/SceneContact'
import SectionHighlights from '@/components/ui/SectionHighlights'
import FAQSection        from '@/components/ui/FAQSection'
import ErrorBoundary     from '@/components/ui/ErrorBoundary'
import { buildBreadcrumbJsonLd } from '@/lib/breadcrumb'

const FAQ_ITEMS = [
  {
    question: 'Combien coûte un VTC à Nîmes ?',
    answer:
      "Le tarif est de 2€/km avec un minimum de 20€. Il est calculé côté serveur sur l’itinéraire routier réel, sans majoration de nuit, dimanche ou jour férié.",
  },
  {
    question: 'Desservez-vous l\'Aéroport Nîmes-Camargue ?',
    answer: 'Oui, avec suivi de vol et accueil personnalisé dès la sortie des arrivées.',
  },
  {
    question: 'Puis-je réserver un VTC la nuit à Nîmes ?',
    answer: 'Oui, le service est disponible 24h/24 et 7j/7, y compris pendant les férias et événements nîmois.',
  },
  {
    question: 'Comment fonctionne la réservation avec Élia ?',
    answer:
      "Élia vous pose quelques questions dans le chat (adresses, date, heure, passagers), calcule automatiquement le tarif, puis vous envoie un email de confirmation. Notre chauffeur vous recontacte sous 2 heures.",
  },
]

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
  telephone: '+33783699229',
  serviceArea: { '@type': 'City', name: 'Nîmes' },
  areaServed:  { '@type': 'AdministrativeArea', name: 'Gard' },
  address: { '@type': 'PostalAddress', addressLocality: 'Nîmes', addressRegion: 'Occitanie', addressCountry: 'FR' },
  geo: { '@type': 'GeoCoordinates', latitude: 43.8367, longitude: 4.3601 },
  priceRange: '€€€',
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '00:00',
    closes: '23:59',
  },
  provider: { '@type': 'Organization', name: 'VTCLAND', url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vtcland.fr' },
}

const breadcrumbJsonLd = buildBreadcrumbJsonLd('VTC Nîmes', '/vtc-nimes')

export default function VtcNimes() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ErrorBoundary>
      <SceneHero
        heroImageSrc="/images/hero-vtc-nimes.webp"
        imageAlt="Chauffeur privé VTCLAND à Nîmes, Gard"
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
      <FAQSection items={FAQ_ITEMS} title="Questions fréquentes — VTC Nîmes" />
      <SceneContact
        greeting="Bonsoir. Je suis Élia, votre assistante de réservation pour Nîmes et le Gard. Pour quel type de trajet puis-je vous préparer un devis ?"
        contextKey="vtc-nimes"
      />
      </ErrorBoundary>
    </main>
  )
}
