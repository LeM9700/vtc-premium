import { describe, expect, it } from 'vitest'
import { detectSensitiveData } from '@/lib/sensitiveData'

describe('detectSensitiveData', () => {
  it.each([
    'carte ４２４２\u00a0４２４２.４２４２-４２４２',
    'carte ٤٢٤٢ ٤٢٤٢ ٤٢٤٢ ٤٢٤٢',
    'mon mdp : Azerty!42',
    'code SMS = １２３４５６',
    'cvc : ١٢٣',
  ])('normalise les contournements Unicode : %s', value => {
    expect(detectSensitiveData(value)).toBe(true)
  })

  it.each([
    'Nous serons 4 passagers le 12 décembre',
    'Mon code postal est 34000',
    'Paiement par carte bancaire',
    'Envoyez-moi un SMS au 06 12 34 56 78',
  ])('évite un faux positif raisonnable : %s', value => {
    expect(detectSensitiveData(value)).toBe(false)
  })
})
