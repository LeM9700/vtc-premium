const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vtcland.fr'

const schema = {
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'TaxiService'],
  name: 'VTCLAND',
  description:
    "Chauffeur privé d'exception en Occitanie. Transferts aéroport Montpellier-Méditerranée et Nîmes-Camargue, VTC événementiel Gard & Hérault, longue distance. Disponible 24h/24.",
  url: SITE_URL,
  telephone: '+33783699229',
  image: `${SITE_URL}/og-image.jpg`,
  priceRange: '€€€',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '207A rue de l\'Ancien Four',
    postalCode: '30260',
    addressLocality: 'Montmirat',
    addressRegion: 'Occitanie',
    addressCountry: 'FR',
  },
  geo: { '@type': 'GeoCoordinates', latitude: 43.6323851, longitude: 3.9162285 },
  areaServed: [
    { '@type': 'City', name: 'Montpellier' },
    { '@type': 'City', name: 'Nîmes' },
    { '@type': 'City', name: 'Avignon' },
    { '@type': 'AdministrativeArea', name: 'Gard' },
    { '@type': 'AdministrativeArea', name: 'Hérault' },
    { '@type': 'AdministrativeArea', name: 'Occitanie' },
  ],
  serviceType: [
    'Transfert aéroport',
    'Mise à disposition',
    'VTC événementiel',
    'Longue distance',
  ],
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    opens: '00:00',
    closes: '23:59',
    dayOfWeek: [
      'Monday', 'Tuesday', 'Wednesday', 'Thursday',
      'Friday', 'Saturday', 'Sunday',
    ],
  },
  // Fiche Google Business Profile réelle, vérifiée le 2026-07-17 (résout vers
  // "VTCLAND - VTC Montpellier - Chauffeurs privés" sur Google Maps).
  sameAs: ['https://maps.app.goo.gl/dHeBLrgB8P3VyAZ77'],
}

// Pas de `potentialAction: SearchAction` : le site n'a aucune fonctionnalité
// de recherche interne. En ajouter un pointant vers une page inexistante
// casserait la sitelinks searchbox plutôt que de l'activer.
const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'VTCLAND',
  url: SITE_URL,
}

export default function JsonLd() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  )
}
