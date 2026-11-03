/**
 * Récupère la note et les avis réels de la fiche Google Business Profile
 * VTCLAND via l'API Places (New). Nécessite un projet Google Cloud avec
 * "Places API (New)" activée (distincte de l'ancienne "Places API") et
 * GOOGLE_PLACES_API_KEY renseignée.
 *
 * Aucun place_id n'est codé en dur : une recherche textuelle biaisée sur les
 * coordonnées connues de VTCLAND retrouve la fiche à chaque revalidation,
 * ce qui évite de dépendre d'un identifiant Google susceptible de changer.
 */

const SEARCH_TEXT = 'VTCLAND VTC Montpellier Chauffeurs privés'
const FIELD_MASK =
  'places.rating,places.userRatingCount,places.reviews,places.googleMapsUri'

export interface GoogleReview {
  author: string
  rating: number
  text: string
  relativeTime: string
}

export interface GoogleReviewsData {
  rating: number
  userRatingCount: number
  mapsUri: string
  reviews: GoogleReview[]
}

export async function getGoogleReviews(): Promise<GoogleReviewsData | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) return null

  try {
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': FIELD_MASK,
      },
      body: JSON.stringify({
        textQuery: SEARCH_TEXT,
        languageCode: 'fr',
        locationBias: {
          circle: {
            center: { latitude: 43.6323851, longitude: 3.9162285 },
            radius: 500,
          },
        },
      }),
      next: { revalidate: 86400 },
    })

    if (!res.ok) return null

    const data = await res.json()
    const place = data.places?.[0]
    if (!place || typeof place.rating !== 'number') return null

    return {
      rating: place.rating,
      userRatingCount: place.userRatingCount ?? 0,
      mapsUri: place.googleMapsUri ?? 'https://maps.app.goo.gl/dHeBLrgB8P3VyAZ77',
      reviews: (place.reviews ?? [])
        .filter((r: { text?: { text?: string } }) => !!r.text?.text)
        .slice(0, 3)
        .map((r: {
          authorAttribution?: { displayName?: string }
          rating?: number
          text?: { text?: string }
          relativePublishTimeDescription?: string
        }) => ({
          author: r.authorAttribution?.displayName ?? 'Client Google',
          rating: r.rating ?? 5,
          text: r.text?.text ?? '',
          relativeTime: r.relativePublishTimeDescription ?? '',
        })),
    }
  } catch {
    return null
  }
}
