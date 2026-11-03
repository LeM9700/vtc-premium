'use client'

import { FormEvent, useState } from 'react'
import { track } from '@vercel/analytics'

const initial = { type: 'ride', pickupAddress: '', dropoffAddress: '', pickupAt: '', passengers: '1', name: '', email: '', phone: '', hours: '1' }

export default function QuickBookingForm() {
  const [step, setStep] = useState(0); const [data, setData] = useState(initial)
  const [busy, setBusy] = useState(false); const [result, setResult] = useState<{ reference: string; priceEur: number } | null>(null)
  const [error, setError] = useState('')
  const update = (key: keyof typeof data, value: string) => setData(current => ({ ...current, [key]: value }))

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); track('form_started')
    const response = await fetch('/api/reservation', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({
      idempotencyKey: crypto.randomUUID(), type: data.type, pickupAddress: data.pickupAddress,
      ...(data.type === 'ride' ? { dropoffAddress: data.dropoffAddress } : { disposalMinutes: Number(data.hours) * 60 }),
      pickupAt: new Date(data.pickupAt).toISOString(), passengers: Number(data.passengers), luggage: 0, options: {},
      customer: { name: data.name, email: data.email, phone: data.phone },
    }) })
    const payload = await response.json()
    setBusy(false)
    if (!response.ok) { setError(payload.message ?? payload.error ?? 'Demande non envoyée'); track('request_failed'); return }
    setResult(payload); track('request_submitted')
  }

  if (result) return <section id="reservation" className="bg-[#0A0A0A] px-6 md:px-24 py-24 text-[#F5F0E8]"><div className="max-w-xl border border-[#C9A96E]/40 p-8"><p className="text-[#C9A96E] uppercase tracking-widest text-xs">Demande envoyée</p><h2 className="font-display text-4xl my-4">{result.reference}</h2><p>Tarif estimé : {result.priceEur.toFixed(2)} €. Votre course sera confirmée après acceptation du chauffeur.</p></div></section>

  const fields = [
    <div key="route" className="space-y-4"><h3 className="text-2xl">Quel trajet souhaitez-vous ?</h3><select value={data.type} onChange={e => update('type', e.target.value)} className="field"><option value="ride">Trajet</option><option value="disposal">Mise à disposition</option></select><input className="field" required placeholder="Adresse de départ" value={data.pickupAddress} onChange={e => update('pickupAddress', e.target.value)}/>{data.type === 'ride' ? <input className="field" required placeholder="Adresse d’arrivée" value={data.dropoffAddress} onChange={e => update('dropoffAddress', e.target.value)}/> : <input className="field" required type="number" min="0.25" step="0.25" value={data.hours} onChange={e => update('hours', e.target.value)} />}</div>,
    <div key="when" className="space-y-4"><h3 className="text-2xl">Quand et pour combien de passagers ?</h3><input className="field" required type="datetime-local" value={data.pickupAt} onChange={e => update('pickupAt', e.target.value)}/><input className="field" required type="number" min="1" max="8" value={data.passengers} onChange={e => update('passengers', e.target.value)}/></div>,
    <div key="who" className="space-y-4"><h3 className="text-2xl">Comment vous joindre ?</h3><input className="field" required placeholder="Prénom et nom" value={data.name} onChange={e => update('name', e.target.value)}/><input className="field" required type="email" placeholder="Email" value={data.email} onChange={e => update('email', e.target.value)}/><input className="field" required type="tel" placeholder="Téléphone" value={data.phone} onChange={e => update('phone', e.target.value)}/></div>,
  ]

  return <section id="reservation" className="bg-[#0A0A0A] px-6 md:px-24 py-24 text-[#F5F0E8] border-t border-white/10"><form onSubmit={submit} className="max-w-xl"><p className="text-[#C9A96E] uppercase tracking-[.35em] text-xs mb-4">Demande en moins de 30 secondes</p><div className="[&_.field]:w-full [&_.field]:bg-[#111] [&_.field]:border [&_.field]:border-white/15 [&_.field]:p-3">{fields[step]}</div>{error && <p className="text-red-300 mt-4">{error}</p>}<div className="flex gap-3 mt-8">{step > 0 && <button type="button" onClick={() => setStep(step - 1)} className="border border-white/20 px-5 py-3">Retour</button>}{step < fields.length - 1 ? <button type="button" onClick={() => setStep(step + 1)} className="bg-[#C9A96E] text-black px-5 py-3">Continuer</button> : <button disabled={busy} className="bg-[#C9A96E] text-black px-5 py-3">Envoyer la demande</button>}</div></form></section>
}
