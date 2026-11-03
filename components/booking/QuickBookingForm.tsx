'use client'

import { FormEvent, useState } from 'react'
import { track } from '@vercel/analytics'

import AddressAutocomplete from './AddressAutocomplete'

const initial = {
  type: 'ride',
  pickupAddress: '',
  dropoffAddress: '',
  pickupAt: '',
  passengers: '1',
  name: '',
  email: '',
  phone: '',
  hours: '1',
}

export default function QuickBookingForm() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState(initial)
  const [pickupSelected, setPickupSelected] = useState(false)
  const [dropoffSelected, setDropoffSelected] = useState(false)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ reference: string; priceEur: number } | null>(null)
  const [error, setError] = useState('')

  const update = (key: keyof typeof data, value: string) => {
    setData(current => ({ ...current, [key]: value }))
    setError('')
  }

  function nextStep() {
    if (step === 0 && (!pickupSelected || (data.type === 'ride' && !dropoffSelected))) {
      setError('Sélectionnez les adresses de départ et d’arrivée dans les suggestions Google Maps.')
      return
    }
    if (step === 1 && (!data.pickupAt || !data.passengers)) {
      setError('Renseignez la date, l’heure et le nombre de passagers.')
      return
    }
    setError('')
    setStep(current => current + 1)
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!pickupSelected || (data.type === 'ride' && !dropoffSelected)) {
      setStep(0)
      setError('Sélectionnez les adresses dans les suggestions Google Maps.')
      return
    }

    setBusy(true)
    setError('')
    track('form_started')
    const response = await fetch('/api/reservation', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        idempotencyKey: crypto.randomUUID(),
        type: data.type,
        pickupAddress: data.pickupAddress,
        ...(data.type === 'ride'
          ? { dropoffAddress: data.dropoffAddress }
          : { disposalMinutes: Number(data.hours) * 60 }),
        pickupAt: new Date(data.pickupAt).toISOString(),
        passengers: Number(data.passengers),
        luggage: 0,
        options: {},
        customer: { name: data.name, email: data.email, phone: data.phone },
      }),
    })
    const payload = await response.json()
    setBusy(false)
    if (!response.ok) {
      setError(payload.message ?? payload.error ?? 'Demande non envoyée')
      track('request_failed')
      return
    }
    setResult(payload)
    track('request_submitted')
  }

  if (result) {
    return (
      <section id="reservation" className="bg-[#0A0A0A] px-6 py-24 text-[#F5F0E8] md:px-24">
        <div className="max-w-xl border border-[#C9A96E]/40 p-8">
          <p className="text-xs uppercase tracking-widest text-[#C9A96E]">Demande envoyée</p>
          <h2 className="my-4 font-display text-4xl">{result.reference}</h2>
          <p>Tarif estimé : {result.priceEur.toFixed(2)} €. Votre course sera confirmée après acceptation du chauffeur.</p>
        </div>
      </section>
    )
  }

  const fields = [
    <div key="route" className="space-y-4">
      <h3 className="text-2xl">Quel trajet souhaitez-vous ?</h3>
      <select value={data.type} onChange={event => update('type', event.target.value)} className="field">
        <option value="ride">Trajet</option>
        <option value="disposal">Mise à disposition</option>
      </select>
      <AddressAutocomplete
        id="pickup-address"
        label="Adresse de départ"
        required
        value={data.pickupAddress}
        onChange={value => update('pickupAddress', value)}
        onSelectionChange={setPickupSelected}
      />
      {data.type === 'ride' ? (
        <AddressAutocomplete
          id="dropoff-address"
          label="Adresse d’arrivée"
          required
          value={data.dropoffAddress}
          onChange={value => update('dropoffAddress', value)}
          onSelectionChange={setDropoffSelected}
        />
      ) : (
        <input
          className="field"
          aria-label="Durée en heures"
          required
          type="number"
          min="0.25"
          step="0.25"
          value={data.hours}
          onChange={event => update('hours', event.target.value)}
        />
      )}
    </div>,
    <div key="when" className="space-y-4">
      <h3 className="text-2xl">Quand et pour combien de passagers ?</h3>
      <input className="field" aria-label="Date et heure" required type="datetime-local" value={data.pickupAt} onChange={event => update('pickupAt', event.target.value)} />
      <input className="field" aria-label="Nombre de passagers" required type="number" min="1" max="8" value={data.passengers} onChange={event => update('passengers', event.target.value)} />
    </div>,
    <div key="who" className="space-y-4">
      <h3 className="text-2xl">Comment vous joindre ?</h3>
      <input className="field" required placeholder="Prénom et nom" value={data.name} onChange={event => update('name', event.target.value)} />
      <input className="field" required type="email" placeholder="Email" value={data.email} onChange={event => update('email', event.target.value)} />
      <input className="field" required type="tel" placeholder="Téléphone" value={data.phone} onChange={event => update('phone', event.target.value)} />
    </div>,
  ]

  return (
    <section id="reservation" className="border-t border-white/10 bg-[#0A0A0A] px-6 py-24 text-[#F5F0E8] md:px-24">
      <form onSubmit={submit} className="max-w-xl">
        <p className="mb-4 text-xs uppercase tracking-[.35em] text-[#C9A96E]">Demande en moins de 30 secondes</p>
        <div className="[&_.field]:w-full [&_.field]:border [&_.field]:border-white/15 [&_.field]:bg-[#111] [&_.field]:p-3">
          {fields[step]}
        </div>
        {error && <p role="alert" className="mt-4 text-red-300">{error}</p>}
        <div className="mt-8 flex gap-3">
          {step > 0 && (
            <button type="button" onClick={() => { setError(''); setStep(current => current - 1) }} className="border border-white/20 px-5 py-3">
              Retour
            </button>
          )}
          {step < fields.length - 1 ? (
            <button type="button" onClick={nextStep} className="bg-[#C9A96E] px-5 py-3 text-black">Continuer</button>
          ) : (
            <button disabled={busy} className="bg-[#C9A96E] px-5 py-3 text-black disabled:opacity-50">
              {busy ? 'Envoi…' : 'Envoyer la demande'}
            </button>
          )}
        </div>
      </form>
    </section>
  )
}
