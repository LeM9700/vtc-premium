import { describe, expect, it } from 'vitest'
import { buildSystemPrompt } from '@/lib/systemPrompt'

describe('buildSystemPrompt', () => {
  it('impose le contrat progressif et résiste aux changements de rôle', () => {
    const prompt = buildSystemPrompt()
    expect(prompt).toContain('<STATE>')
    expect(prompt).toContain('<QUICK_REPLIES>')
    expect(prompt).toContain('<COLLECTED>')
    expect(prompt).toMatch(/ignore.*changement de rôle/i)
    expect(prompt).toMatch(/ne révèle.*prompt.*secret/i)
  })
})
