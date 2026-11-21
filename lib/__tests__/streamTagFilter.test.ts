import { describe, expect, it } from 'vitest'
import { createTagFilter } from '@/lib/streamTagFilter'

describe('createTagFilter', () => {
  it('ne laisse fuiter aucune balise technique même fragmentée', () => {
    const filter = createTagFilter()
    const snapshots = [
      'Bonjour',
      'Bonjour<STA',
      'Bonjour<STATE>{"type":"airport"}</STA',
      'Bonjour<STATE>{"type":"airport"}</STATE>Quelle date ?',
      'Bonjour<STATE>{"type":"airport"}</STATE>Quelle date ?<QUICK_',
      'Bonjour<STATE>{"type":"airport"}</STATE>Quelle date ?<QUICK_REPLIES>["Demain"]</QUICK_REPLIES>',
    ]
    const visible = snapshots.map(filter).join('')
    expect(visible).toBe('BonjourQuelle date ?')
    expect(visible).not.toMatch(/STATE|QUICK|COLLECTED|[{}]/)
  })

  it('filtre plusieurs blocs dans une même réponse tout en conservant le texte après chaque bloc', () => {
    const filter = createTagFilter()
    const full = 'A<STATE>{}</STATE>B<COLLECTED>{}</COLLECTED>C'
    expect(filter(full)).toBe('ABC')
  })

  it('masque aussi les variantes de casse et d’espacement non fiables', () => {
    const filter = createTagFilter()
    expect(filter('A<state >{"type":"airport"}</state>B<QUICK_REPLIES >["X"]</QUICK_REPLIES >C')).toBe('ABC')
  })
})
