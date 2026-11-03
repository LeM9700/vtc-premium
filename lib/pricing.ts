/**
 * Calcule le prix d'un trajet selon la grille tarifaire.
 */

export type TripType = 'airport' | 'disposal' | 'event' | 'distance'

interface PricingParams {
  type:        TripType
  distanceKm?: number
  hours?:      number   // pour mise à disposition
}

/**
 * Grille tarifaire :
 * - Trajet               → max(20€, 2€/km)
 * - Mise à disposition   → 70€/h
 */
export function calculatePrice({ type, distanceKm = 0, hours = 1 }: PricingParams): number {
  if (type === 'disposal') {
    return Math.round(hours * 70 * 100) / 100
  }

  // Tous les autres types = tarif km
  return Math.max(20, Math.round(distanceKm * 2 * 100) / 100)
}

/**
 * Formate le prix avec contexte pour l'affichage chat.
 */
export function formatPriceExplanation(
  price: number,
  distanceKm: number,
  durationMin: number,
  type?: TripType,
  hours?: number
): string {
  if (type === 'disposal') {
    const h = hours ?? 1
    return `Mise à disposition ${h}h : **${price}€**`
  }

  const dist = `${distanceKm} km (environ ${durationMin} min de route)`
  return `${dist} × 2€/km, minimum 20€ = **${price}€**`
}
