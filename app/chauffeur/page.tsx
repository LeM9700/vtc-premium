'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'

interface Booking {
  reference: string; status: string; type: string; pickupAt: string; priceEur: number
  customerName: string; customerEmail: string; customerPhone: string
  pickupAddress: string; dropoffAddress: string | null; passengers: number; luggage: number
}

export default function ChauffeurPage() {
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const response = await fetch('/api/chauffeur/bookings', { cache: 'no-store' })
    if (response.status === 401) { setAuthenticated(false); return }
    if (!response.ok) { setError('Impossible de charger les demandes.'); return }
    const data = await response.json() as { bookings: Booking[] }
    setBookings(data.bookings); setAuthenticated(true)
  }, [])

  useEffect(() => {
    const timeout = window.setTimeout(() => { void load() }, 0)
    return () => window.clearTimeout(timeout)
  }, [load])

  async function login(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('')
    const response = await fetch('/api/chauffeur/session', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password }),
    })
    setBusy(false)
    if (!response.ok) { setError('Mot de passe incorrect.'); return }
    setPassword(''); await load()
  }

  async function act(reference: string, action: 'accept' | 'decline' | 'complete') {
    setBusy(true); setError('')
    const response = await fetch(`/api/chauffeur/bookings/${reference}/${action}`, { method: 'POST' })
    setBusy(false)
    if (!response.ok) { setError('Action impossible avec le statut actuel.'); return }
    await load()
  }

  if (authenticated === null) return <main className="min-h-screen bg-[#0A0A0A] text-[#F5F0E8] p-8">Chargement…</main>
  if (!authenticated) return (
    <main className="min-h-screen bg-[#0A0A0A] text-[#F5F0E8] grid place-items-center p-6">
      <form onSubmit={login} className="w-full max-w-sm border border-[#C9A96E]/40 p-8 space-y-6">
        <p className="text-[#C9A96E] tracking-[0.35em] uppercase text-xs">VTCLAND</p>
        <h1 className="font-display text-4xl font-light">Espace chauffeur</h1>
        <input type="password" value={password} onChange={event => setPassword(event.target.value)} required
          className="w-full bg-[#111] border border-white/15 p-3" placeholder="Mot de passe" />
        {error && <p className="text-red-300 text-sm">{error}</p>}
        <button disabled={busy} className="w-full bg-[#C9A96E] text-black p-3 uppercase tracking-widest text-xs">Connexion</button>
      </form>
    </main>
  )

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-[#F5F0E8] p-6 md:p-12">
      <header className="flex justify-between items-end mb-10"><div><p className="text-[#C9A96E] tracking-[0.35em] uppercase text-xs">VTCLAND</p><h1 className="font-display text-4xl md:text-6xl font-light">Demandes</h1></div><button onClick={() => fetch('/api/chauffeur/session', { method: 'DELETE' }).then(() => setAuthenticated(false))} className="text-sm text-white/60">Déconnexion</button></header>
      {error && <p className="mb-6 text-red-300">{error}</p>}
      <div className="grid gap-5 lg:grid-cols-2">
        {bookings.map(booking => <article key={booking.reference} className="border border-white/10 bg-[#111] p-6 space-y-4">
          <div className="flex justify-between gap-4"><div><p className="text-[#C9A96E] text-xs tracking-widest">{booking.reference}</p><h2 className="text-xl mt-1">{booking.customerName}</h2></div><span className="text-xs uppercase text-white/60">{booking.status}</span></div>
          <p className="text-sm text-white/75">{new Date(booking.pickupAt).toLocaleString('fr-FR')} · {booking.passengers} passager(s)</p>
          <p>{booking.pickupAddress}<br/><span className="text-[#C9A96E]">→</span> {booking.dropoffAddress ?? 'Mise à disposition'}</p>
          <p className="text-2xl font-display">{booking.priceEur.toFixed(2)} €</p>
          <div className="flex flex-wrap gap-3"><a href={`tel:${booking.customerPhone}`} className="border border-white/20 px-4 py-2 text-sm">Appeler</a><a href={`https://wa.me/${booking.customerPhone.replace(/\D/g, '')}`} className="border border-white/20 px-4 py-2 text-sm">WhatsApp</a>
            {booking.status === 'submitted' && <><button disabled={busy} onClick={() => act(booking.reference, 'accept')} className="bg-[#C9A96E] text-black px-4 py-2 text-sm">Accepter</button><button disabled={busy} onClick={() => act(booking.reference, 'decline')} className="border border-red-400/50 text-red-200 px-4 py-2 text-sm">Refuser</button></>}
            {booking.status === 'accepted' && <button disabled={busy} onClick={() => act(booking.reference, 'complete')} className="bg-[#C9A96E] text-black px-4 py-2 text-sm">Course terminée</button>}
          </div>
        </article>)}
      </div>
    </main>
  )
}
