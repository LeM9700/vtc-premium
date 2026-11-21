function luhnValid(digits: string): boolean {
  let sum = 0
  let double = false
  for (let index = digits.length - 1; index >= 0; index--) {
    let digit = Number(digits[index])
    if (double) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    double = !double
  }
  return sum % 10 === 0
}

export const SENSITIVE_DATA_REPLY = 'Ne partagez jamais de numéro de carte, cryptogramme, mot de passe, code de connexion ou pièce d’identité. Ces données ne sont pas nécessaires pour votre devis.'

function normalizeSensitiveText(text: string): string {
  return Array.from(text.normalize('NFKC'), character => {
    const code = character.codePointAt(0) ?? 0
    if (code >= 0x0660 && code <= 0x0669) return String(code - 0x0660)
    if (code >= 0x06f0 && code <= 0x06f9) return String(code - 0x06f0)
    return character
  }).join('').replace(/[\u00a0\u2007\u202f]/g, ' ')
}

/** Détecte les secrets inutiles au devis avant tout appel à un prestataire IA. */
export function detectSensitiveData(text: string): boolean {
  const normalized = normalizeSensitiveText(text)
  const cardCandidates = normalized.match(/(?:\d[\s.\-/]?){13,19}/g) ?? []
  if (cardCandidates.some(candidate => {
    const digits = candidate.replace(/\D/g, '')
    return digits.length >= 13 && digits.length <= 19 && luhnValid(digits)
  })) return true

  return [
    /\b(?:cvv|cvc|cryptogramme)\b\s*(?:est|:|=)?\s*\d{3,4}\b/i,
    /\b(?:mot de passe|mdp|password|secret)\b\s*(?:est|:|=)\s*\S+/i,
    /\b(?:code\s*(?:de )?(?:connexion|authentification|sécurité|sms)|otp)\b\D{0,10}\d{4,8}\b/i,
    /\b(?:passeport|carte d'identité|pièce d'identité)\b\D{0,20}[a-z0-9]{6,}/i,
  ].some(pattern => pattern.test(normalized))
}
