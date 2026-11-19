/**
 * Émet un événement applicatif local sans dépendre d'un fournisseur d'hébergement.
 * Un collecteur compatible Railway pourra écouter `vtcland:analytics` ultérieurement.
 */
export function track(event: string, properties?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent('vtcland:analytics', {
      detail: { event, properties: properties ?? {} },
    }),
  )
}
