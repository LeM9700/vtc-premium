const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vtcland.fr'

const schema = {
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'TaxiService'],
  name: 'VTCLAND',
  description:
    "Chauffeur privé d'exception en Occitanie. Transferts aéroport Montpellier-Méditerranée et Nîmes-Camargue, VTC événementiel Gard & Hérault, longue distance. Disponible 24h/24.",
  url: SITE_URL,
  telephone: '+33XXXXXXXXX', // ← À REMPLACER par le numéro réel
  image: `${SITE_URL}/og-image.jpg`,
  priceRange: '€€€',
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
  sameAs: [
    'https://www.google.com/maps/place/VTCLAND', // ← À REMPLACER par l'URL réelle
  ],
}

export default function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
