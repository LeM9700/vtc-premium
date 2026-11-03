const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vtcland.fr'

/**
 * Schema BreadcrumbList à deux niveaux (Accueil > Page courante) pour les
 * landing pages SEO — permet l'affichage du fil d'Ariane dans les SERPs.
 */
export function buildBreadcrumbJsonLd(pageName: string, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: pageName, item: `${SITE_URL}${path}` },
    ],
  }
}
