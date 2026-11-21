const TAGS = ['STATE', 'QUICK_REPLIES', 'COLLECTED'] as const
function visiblePrefix(fullText: string): string {
  let visible = ''
  let cursor = 0
  while (cursor < fullText.length) {
    const openingPattern = /<\s*(STATE|QUICK_REPLIES|COLLECTED)\s*>/gi
    openingPattern.lastIndex = cursor
    const next = openingPattern.exec(fullText)
    if (!next) break
    visible += fullText.slice(cursor, next.index)
    const closingPattern = new RegExp(`<\\/\\s*${next[1]}\\s*>`, 'gi')
    closingPattern.lastIndex = openingPattern.lastIndex
    const closing = closingPattern.exec(fullText)
    if (!closing) return visible
    cursor = closing.index + closing[0].length
  }
  const remainder = fullText.slice(cursor)
  const partialIndex = remainder.lastIndexOf('<')
  if (partialIndex === -1) return visible + remainder
  const suffix = remainder.slice(partialIndex)
  const normalizedSuffix = suffix.replace(/\s/g, '').toUpperCase()
  return TAGS.some(tag => `<${tag}>`.startsWith(normalizedSuffix))
    ? visible + remainder.slice(0, partialIndex)
    : visible + remainder
}

/**
 * Filtre un snapshot cumulatif et ne rend que le nouveau texte sûr. Les trois
 * balises restent retenues même si elles arrivent caractère par caractère.
 */
export function createTagFilter() {
  let sentVisibleLength = 0
  return function filter(fullTextSoFar: string): string {
    const visible = visiblePrefix(fullTextSoFar)
    if (visible.length <= sentVisibleLength) return ''
    const chunk = visible.slice(sentVisibleLength)
    sentVisibleLength = visible.length
    return chunk
  }
}
