'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { calculatePrice, formatPriceExplanation, TripType } from '@/lib/pricing'

// ── Types ─────────────────────────────────────────────────────────────────────
interface Message {
  role:    'assistant' | 'user'
  content: string
}

interface CollectedData {
  type?:        TripType
  departure?:   string
  destination?: string
  date?:        string
  time?:        string
  passengers?:  string
  hours?:       number
  options?:     string[]
  payment?:     string
  name?:        string
  phone?:       string
  email?:       string
  distanceKm?:  number
  durationMin?: number
  prixEstime?:  number
}

// ── Prompt système ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Tu es l'assistant de réservation d'un service de chauffeur privé premium.
Tu t'appelles "Élia". Tu es élégant, chaleureux, concis. Jamais de listes à puces. Jamais de markdown visible.

RÈGLE PRIORITAIRE :
- Si le client pose une question sans rapport avec la réservation d'un trajet (météo, actualités, recettes, politique, code, blagues, sport, santé, traduction, etc.), réponds UNIQUEMENT : "Je suis Élia, votre assistante réservation. Je ne suis pas en mesure de répondre à cela — mais je serai ravie de vous préparer un devis pour votre prochain trajet."

RÈGLES ABSOLUES :
- Ne donne JAMAIS d'estimation de prix, de distance ou de durée — le calcul est automatique après collecte.
- Si le client demande le prix, réponds : "Le tarif exact sera calculé et affiché dès que j'ai toutes vos informations."
- Collecte les adresses COMPLÈTES avec ville (ex: "14 rue de la Paix, Montpellier").
- Une seule question à la fois. Jamais de formulaire.

Tu collectes ces informations dans l'ordre, UNE par UNE :
1. Type de trajet (aéroport/gare, mise à disposition, événement, longue distance)
2. Si mise à disposition : combien d'heures ?
3. Adresse complète de départ (rue + ville)
4. Adresse complète de destination (rue + ville) — sauf mise à disposition
5. Date souhaitée
6. Heure de prise en charge
7. Nombre de passagers
8. Options parmi : Grand bagage, Siège enfant, Accueil personnalisé, Eau & rafraîchissements, Discrétion totale
9. Mode de paiement parmi : Carte bancaire, Espèces, Virement bancaire
10. Prénom et nom
11. Numéro de téléphone
12. Email

Quand tu as TOUTES les infos (les 12 points), envoie UN message de confirmation élégant, puis termine EXACTEMENT par ce bloc sur une ligne séparée :
<COLLECTED>{"type":"airport|disposal|event|distance","departure":"...","destination":"...","date":"...","time":"...","passengers":"...","hours":4,"options":[],"payment":"...","name":"...","phone":"...","email":"..."}</COLLECTED>

Pour "type" utilise uniquement : airport, disposal, event, distance.
Pour mise à disposition, destination = "N/A".`

const SESSION_KEY  = 'elia_msg_count'
const INACTIVITY_MS = 7 * 60 * 1000

/**
 * Scène 5 — Contact conversationnel IA.
 * Chat avec Claude (Anthropic API) qui collecte les infos,
 * calcule le prix via OpenRouteService, envoie l'email via Resend.
 */
export default function SceneContact() {
  const sectionRef    = useRef<HTMLElement>(null)
  const titleRef      = useRef<HTMLHeadingElement>(null)
  const chatRef       = useRef<HTMLDivElement>(null)
  const messagesRef   = useRef<HTMLDivElement>(null)
  const inputRef      = useRef<HTMLInputElement>(null)

  const [messages,  setMessages]  = useState<Message[]>([{
    role:    'assistant',
    content: 'Bonsoir. Je suis Élia, votre assistante de réservation. Pour quel type de trajet puis-je vous préparer un devis ?',
  }])
  const [input,     setInput]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [collected, setCollected] = useState<CollectedData>({})
  const [phase,     setPhase]     = useState<'chat' | 'calculating' | 'done' | 'expired' | 'limit'>('chat')
  const [messageCount, setMessageCount] = useState<number>(() => {
    if (typeof window === 'undefined') return 0
    return parseInt(sessionStorage.getItem(SESSION_KEY) ?? '0', 10)
  })

  // ── Smart scroll — scroll en bas seulement si déjà proche du bas ──
  useEffect(() => {
    const el = messagesRef.current
    if (!el) return
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80
    if (isNearBottom) el.scrollTop = el.scrollHeight
  }, [messages, loading])

  // ── Animation entrée section ──────────────────────────────
  useEffect(() => {
    const section = sectionRef.current
    const title   = titleRef.current
    const chat    = chatRef.current
    if (!section || !title || !chat) return

    const ctx = gsap.context(() => {
      gsap.from(title, {
        opacity: 0, y: 60, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: title, start: 'top 80%' },
      })
      gsap.from(chat, {
        opacity: 0, y: 50, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: chat, start: 'top 80%' },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  // ── Appel Claude API ──────────────────────────────────────
  const callClaude = useCallback(async (history: Message[], count: number): Promise<string> => {
    const res = await fetch('/api/chat', {
      method:  'POST',
      headers: {
        'Content-Type':    'application/json',
        'X-Message-Count': String(count),
      },
      body: JSON.stringify({ messages: history, system: SYSTEM_PROMPT }),
    })
    const data = await res.json()
    return data.content ?? 'Une erreur est survenue.'
  }, [])

  // ── Extraction données collectées ─────────────────────────
  const extractCollected = (text: string): CollectedData | null => {
    const match = text.match(/<COLLECTED>([\s\S]*?)<\/COLLECTED>/)
    if (!match) return null
    try {
      return JSON.parse(match[1])
    } catch {
      return null
    }
  }

  // ── Calcul distance + prix + envoi email ──────────────────
  const processDevis = useCallback(async (data: CollectedData) => {
    setPhase('calculating')

    let distanceKm  = 0
    let durationMin = 0

    // Calcul distance si trajet point à point
    if (data.type !== 'disposal' && data.departure && data.destination !== 'N/A') {
      try {
        const res = await fetch('/api/distance', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            departure:   data.departure,
            destination: data.destination,
          }),
        })
        const dist = await res.json()
        distanceKm  = dist.distanceKm  ?? 0
        durationMin = dist.durationMin ?? 0
      } catch {
        console.error('Erreur calcul distance')
      }
    }

    const prix = calculatePrice({
      type:       data.type as TripType,
      distanceKm,
      hours:      data.hours,
    })

    const explication = formatPriceExplanation(prix, distanceKm, durationMin, data.type as TripType, data.hours)

    const finalData: CollectedData = {
      ...data,
      distanceKm,
      durationMin,
      prixEstime: prix,
    }

    setCollected(finalData)

    // Message de confirmation avec prix
    const confirmMsg: Message = {
      role:    'assistant',
      content: `Parfait. Voici le récapitulatif de votre trajet :\n\n${explication}\n\nUn email de confirmation vient d'être envoyé à ${data.email}. Notre chauffeur vous contactera sous 2 heures pour confirmer votre réservation.`,
    }

    setMessages(prev => [...prev, confirmMsg])

    // Envoi email
    try {
      await fetch('/api/devis', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          ...finalData,
          distanceKm,
          durationMin,
          prixEstime: prix,
        }),
      })
    } catch {
      console.error('Erreur envoi email')
    }

    setPhase('done')
  }, [])

  // ── Envoi message ─────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || loading || phase !== 'chat') return

    if (messageCount >= 20) {
      setPhase('limit')
      return
    }

    const userMsg: Message = { role: 'user', content: text }
    const newHistory = [...messages, userMsg]

    setMessages(newHistory)
    setInput('')
    setLoading(true)

    const newCount = messageCount + 1
    setMessageCount(newCount)
    sessionStorage.setItem(SESSION_KEY, String(newCount))

    try {
      const reply    = await callClaude(newHistory, newCount)
      const rawReply = reply.replace(/<COLLECTED>[\s\S]*?<\/COLLECTED>/, '').trim()

      const assistantMsg: Message = { role: 'assistant', content: rawReply }
      setMessages(prev => [...prev, assistantMsg])
      if (newCount >= 20) setPhase('limit')

      // Vérifie si toutes les données sont collectées
      const data = extractCollected(reply)
      if (data) await processDevis(data)

    } catch {
      setMessages(prev => [...prev, {
        role:    'assistant',
        content: 'Une erreur est survenue. Veuillez réessayer.',
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }, [input, loading, messages, phase, callClaude, processDevis, messageCount])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative min-h-screen w-full bg-[#0A0A0A] px-12 md:px-24 py-32 overflow-hidden"
    >
      <div className="absolute top-0 left-12 md:left-24 right-12 md:right-24 h-px bg-gradient-to-r from-transparent via-[#C9A96E]/30 to-transparent" />

      {/* Header */}
      <div className="relative z-10 mb-16">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px w-16 bg-[#C9A96E]" />
          <span className="text-[#C9A96E] text-xs tracking-[0.5em] uppercase font-light">
            Votre devis · 24h/24 en Occitanie
          </span>
        </div>
        <h2
          ref={titleRef}
          className="font-display text-[#F5F0E8] text-5xl md:text-7xl font-light leading-tight max-w-2xl"
        >
          Parlons de<br />
          <em className="text-[#C9A96E] not-italic">votre trajet</em>
          <span className="block text-2xl md:text-3xl text-[#F5F0E8]/30 font-light mt-3 tracking-widest uppercase not-italic" style={{ fontFamily: 'var(--font-dm-sans)' }}>
            Montpellier · Nîmes · Occitanie
          </span>
        </h2>
      </div>

      {/* Chat */}
      <div
        ref={chatRef}
        className="relative z-10 max-w-2xl border border-[#F5F0E8]/10 bg-[#111111]"
      >

        {/* Header chat */}
        <div className="flex items-center gap-4 px-8 py-5 border-b border-[#F5F0E8]/10">
          <div className="relative w-2.5 h-2.5 rounded-full bg-[#C9A96E]">
            <span className="absolute inset-0 rounded-full bg-[#C9A96E] animate-ping opacity-40" />
          </div>
          <span className="text-[#F5F0E8]/60 text-xs tracking-[0.4em] uppercase">
            Élia — Assistante réservation
          </span>
        </div>

        {/* Messages */}
        <div
          ref={messagesRef}
          className="flex flex-col gap-6 px-8 py-8 h-96 overflow-y-auto scroll-smooth"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(201,169,110,0.3) transparent',
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs md:max-w-sm text-sm font-light leading-relaxed whitespace-pre-line ${
                  msg.role === 'assistant'
                    ? 'text-[#F5F0E8]/80'
                    : 'text-right text-[#C9A96E]'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Indicateur de frappe */}
          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-1.5 items-center py-2">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[#C9A96E]/50 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Phase calcul */}
          {phase === 'calculating' && (
            <div className="flex justify-start">
              <p className="text-[#F5F0E8]/40 text-xs tracking-widest uppercase animate-pulse">
                Calcul de votre itinéraire...
              </p>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-[#F5F0E8]/10 px-8 py-5 flex items-center gap-4">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={phase === 'done' ? 'Demande envoyée ✓' : 'Votre réponse...'}
            disabled={loading || phase !== 'chat'}
            className="flex-1 bg-transparent outline-none text-[#F5F0E8] text-sm font-light placeholder:text-[#F5F0E8]/20 disabled:opacity-40"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading || phase !== 'chat'}
            data-cursor
            className="text-[#C9A96E] text-xs tracking-[0.3em] uppercase disabled:opacity-20 hover:text-[#F5F0E8] transition-colors duration-300"
          >
            Envoyer
          </button>
        </div>
      </div>

      <div
        className="absolute bottom-0 right-0 text-[18vw] font-display text-[#F5F0E8]/[0.015] leading-none select-none pointer-events-none"
        aria-hidden
      >
        DEVIS
      </div>
    </section>
  )
}