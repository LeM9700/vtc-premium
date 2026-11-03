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
 * - Trajet < 5km        → 20€ fixe
 * - Trajet ≤ 10km       → 25€ fixe
 * - Trajet > 10km       → 2.5€/km
 * - Mise à disposition  → 100€/h | 4h = 320€ | 7h = 490€
 */
export function calculatePrice({ type, distanceKm = 0, hours = 1 }: PricingParams): number {
  if (type === 'disposal') {
    if (hours <= 4)  return Math.round(hours * 80)   // demi-journée
    if (hours <= 7)  return Math.round(hours * 70)   // journée
    return Math.round(hours * 100)                    // heure seule
  }

  // Tous les autres types = tarif km
  if (distanceKm < 5)  return 20
  if (distanceKm <= 10) return 25
  return Math.round(distanceKm * 2.5)
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
  if (distanceKm < 5)   return `Tarif forfaitaire courte distance (< 5 km) : **${price}€**`
  if (distanceKm <= 10) return `Tarif forfaitaire (≤ 10 km) : **${price}€**`
  return `${dist} × 2,50€/km = **${price}€**`
}