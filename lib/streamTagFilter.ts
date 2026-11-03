const TAG_START = '<COLLECTED>'

/**
 * Filtre de streaming : ne laisse jamais passer le bloc `<COLLECTED>…` (ni
 * un préfixe partiel comme `<COLL`) vers le client. Élia termine toujours sa
 * réponse par ce bloc de données structurées — il ne doit jamais s'afficher.
 *
 * Appeler avec le texte accumulé complet à chaque delta ; retourne la portion
 * nouvellement sûre à envoyer (peut être vide tant que le tag n'est pas exclu).
 */
export function createTagFilter() {
  let sentLength = 0

  return function filter(fullTextSoFar: string): string {
    const tagIndex = fullTextSoFar.indexOf(TAG_START)

    if (tagIndex !== -1) {
      const safe = fullTextSoFar.slice(sentLength, tagIndex)
      sentLength = tagIndex
      return safe
    }

    // Pas de tag complet trouvé — vérifie si la fin du texte pourrait être
    // le début du tag en cours de formation, et la retient dans ce cas.
    const maxOverlap = Math.min(TAG_START.length - 1, fullTextSoFar.length)
    for (let overlap = maxOverlap; overlap > 0; overlap--) {
      if (fullTextSoFar.slice(-overlap) === TAG_START.slice(0, overlap)) {
        const boundary = fullTextSoFar.length - overlap
        const safe = fullTextSoFar.slice(sentLength, boundary)
        sentLength = boundary
        return safe
      }
    }

    const safe = fullTextSoFar.slice(sentLength)
    sentLength = fullTextSoFar.length
    return safe
  }
}
