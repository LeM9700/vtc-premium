'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { track } from '@vercel/analytics'
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap'
import { calculatePrice, formatPriceExplanation, TripType } from '@/lib/pricing'
import type { ContextKey } from '@/lib/systemPrompt'

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
  distanceKm?:  number | null
  durationMin?: number | null
  prixEstime?:  number | null
}

interface SceneContactProps {
  greeting?:   string
  contextKey?: ContextKey
}

const SESSION_KEY  = 'elia_msg_count'
const INACTIVITY_MS = 7 * 60 * 1000

/**
 * Scène 5 — Contact conversationnel IA.
 * Chat avec Claude (Anthropic API) qui collecte les infos,
 * calcule le prix via OpenRouteService, envoie l'email via Resend.
 */
export default function SceneContact({ greeting, contextKey }: SceneContactProps = {}) {
  const sectionRef    = useRef<HTMLElement>(null)
  const titleRef      = useRef<HTMLHeadingElement>(null)
  const chatRef       = useRef<HTMLDivElement>(null)
  const messagesRef   = useRef<HTMLDivElement>(null)
  const inputRef      = useRef<HTMLInputElement>(null)
  const timeoutRef    = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [messages,  setMessages]  = useState<Message[]>([{
    role:    'assistant',
    content: greeting ?? 'Bonsoir. Je suis Élia, votre assistante de réservation. Pour quel type de trajet puis-je vous préparer un devis ?',
  }])
  const [input,     setInput]     = useState('')
  const [honeypot,  setHoneypot]  = useState('') // champ piège anti-bot — jamais visible pour un humain
  const [loading,   setLoading]   = useState(false)
  const [collected, setCollected] = useState<CollectedData>({})
  const [phase,     setPhase]     = useState<'chat' | 'calculating' | 'done' | 'expired' | 'limit' | 'failed'>('chat')
  const [messageCount, setMessageCount] = useState<number>(() => {
    if (typeof window === 'undefined') return 0
    return parseInt(sessionStorage.getItem(SESSION_KEY) ?? '0', 10)
  })
  // Texte d'Élia en cours de réception (streaming) — affiché en direct, mais
  // seul le message final complet rejoint `messages` (et donc le aria-live).
  const [streamingText, setStreamingText] = useState<string | null>(null)

  // ── Inactivity timer ─────────────────────────────────────────────────────────
  const resetInactivityTimer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setPhase(prev => {
        if (prev !== 'chat') return prev
        setMessages(m => [...m, {
          role:    'assistant' as const,
          content: "Votre session a expiré après 7 minutes d'inactivité. Rechargez la page pour démarrer une nouvelle conversation.",
        }])
        return 'expired'
      })
    }, INACTIVITY_MS)
  }, [])

  // ── Smart scroll — scroll en bas seulement si déjà proche du bas ──
  useEffect(() => {
    const el = messagesRef.current
    if (!el) return
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80
    if (isNearBottom) el.scrollTop = el.scrollHeight
  }, [messages, loading, streamingText])

  // ── Start inactivity timer on mount, clean up on unmount ─────────────────────
  useEffect(() => {
    resetInactivityTimer()
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }
  }, [resetInactivityTimer])

  // ── Animation entrée section ──────────────────────────────
  useEffect(() => {
    const section = sectionRef.current
    const title   = titleRef.current
    const chat    = chatRef.current
    if (!section || !title || !chat) return

    if (prefersReducedMotion()) {
      gsap.set([title, chat], { opacity: 1, y: 0 })
      return
    }

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

  // ── Appel Claude API en streaming (SSE) ────────────────────
  // Le prompt système est construit côté serveur à partir de `contextKey`
  // (clé whitelistée) — jamais de texte libre envoyé au serveur. Le bloc
  // <COLLECTED> n'est jamais transmis brut : le serveur envoie directement
  // les données déjà parsées dans l'event `done`.
  const callClaudeStream = useCallback(async (
    history: Message[],
    onDelta: (text: string) => void
  ): Promise<{
    devisToken?: string
    collected?: CollectedData
    rateLimited: boolean
    errored: boolean
  }> => {
    const res = await fetch('/api/chat', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ messages: history, contextKey }),
    })

    if (res.status === 429) return { rateLimited: true, errored: false }
    if (!res.ok || !res.body) return { rateLimited: false, errored: true }

    const reader  = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let outcome: { devisToken?: string; collected?: CollectedData; errored: boolean } = { errored: false }

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      const frames = buffer.split('\n\n')
      buffer = frames.pop() ?? '' // dernier fragment potentiellement incomplet

      for (const frame of frames) {
        const line = frame.trim()
        if (!line.startsWith('data: ')) continue
        try {
          const evt = JSON.parse(line.slice(6))
          if (evt.type === 'delta' && typeof evt.text === 'string') {
            onDelta(evt.text)
          } else if (evt.type === 'done') {
            outcome = { devisToken: evt.devisToken, collected: evt.collected, errored: false }
          } else if (evt.type === 'error') {
            outcome = { errored: true }
          }
        } catch {
          // frame malformée — ignorée
        }
      }
    }

    return { ...outcome, rateLimited: false }
  }, [contextKey])

  // ── Calcul distance + prix + envoi email ──────────────────
  const processDevis = useCallback(async (data: CollectedData, devisToken?: string) => {
    setPhase('calculating')

    let distanceKm:  number | null = null
    let durationMin: number | null = null
    let distanceError = false

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
        if (res.ok) {
          const dist = await res.json()
          if (dist.distanceKm) {
            distanceKm  = dist.distanceKm
            durationMin = dist.durationMin
          } else {
            distanceError = true
          }
        } else {
          distanceError = true
        }
      } catch {
        distanceError = true
      }
    }

    // Ne jamais afficher/envoyer un prix calculé sur une distance à 0 par
    // défaut : si le géocodage a échoué, le tarif reste "à confirmer".
    const prix = distanceError ? null : calculatePrice({
      type:       data.type as TripType,
      distanceKm: distanceKm ?? 0,
      hours:      data.hours,
    })

    const explication = distanceError
      ? "Nous n'avons pas pu calculer automatiquement la distance de votre trajet. Notre équipe vous confirmera le tarif exact très rapidement."
      : formatPriceExplanation(prix!, distanceKm ?? 0, durationMin ?? 0, data.type as TripType, data.hours)

    const finalData: CollectedData = {
      ...data,
      distanceKm,
      durationMin,
      prixEstime: prix,
    }

    setCollected(finalData)

    // Envoi email — bloquant : si ça échoue, on ne prétend pas avoir réussi.
    try {
      const res = await fetch('/api/devis', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          ...finalData,
          distanceKm,
          durationMin,
          prixEstime: prix,
          token: devisToken,
        }),
      })

      if (!res.ok) {
        track('devis_failed', { reason: 'api_error' })
        setMessages(prev => [...prev, {
          role:    'assistant',
          content: "Une erreur est survenue lors de l'envoi de votre demande. Merci de nous appeler directement pour finaliser votre réservation.",
        }])
        setPhase('failed')
        return
      }

      track('devis_completed', { type: data.type ?? 'unknown', distanceError })
      setMessages(prev => [...prev, {
        role:    'assistant',
        content: `Parfait. Voici le récapitulatif de votre trajet :\n\n${explication}\n\nUn email de confirmation vient d'être envoyé à ${data.email}. Notre chauffeur vous contactera sous 2 heures pour confirmer votre réservation.`,
      }])
      setPhase('done')
    } catch {
      track('devis_failed', { reason: 'network_error' })
      setMessages(prev => [...prev, {
        role:    'assistant',
        content: "Une erreur est survenue lors de l'envoi de votre demande. Merci de nous appeler directement pour finaliser votre réservation.",
      }])
      setPhase('failed')
    }
  }, [])

  // ── Envoi message ─────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    if (honeypot) return // champ piège rempli → bot détecté, requête ignorée silencieusement

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
    resetInactivityTimer()
    setLoading(true)

    const newCount = messageCount + 1
    setMessageCount(newCount)
    sessionStorage.setItem(SESSION_KEY, String(newCount))
    if (newCount === 1) track('chat_started', { contextKey: contextKey ?? 'home' })

    try {
      let liveText = ''
      const { devisToken, collected, rateLimited, errored } = await callClaudeStream(newHistory, (delta) => {
        setLoading(false)
        liveText += delta
        setStreamingText(liveText)
      })

      setStreamingText(null)

      if (rateLimited) {
        setPhase('limit')
        return
      }

      if (errored) {
        setMessages(prev => [...prev, {
          role:    'assistant',
          content: 'Une erreur est survenue. Veuillez réessayer.',
        }])
        return
      }

      setMessages(prev => [...prev, { role: 'assistant', content: liveText.trim() }])

      if (collected) {
        await processDevis(collected, devisToken)
      } else if (newCount >= 20) {
        setPhase('limit')
      }

    } catch {
      setStreamingText(null)
      setMessages(prev => [...prev, {
        role:    'assistant',
        content: 'Une erreur est survenue. Veuillez réessayer.',
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }, [input, honeypot, loading, messages, phase, callClaudeStream, processDevis, messageCount, resetInactivityTimer, contextKey])

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
      className="relative min-h-dvh w-full bg-[#0A0A0A] px-6 sm:px-8 md:px-24 py-20 sm:py-24 md:py-32 overflow-hidden"
    >
      <div className="absolute top-0 left-6 sm:left-8 md:left-24 right-6 sm:right-8 md:right-24 h-px bg-gradient-to-r from-transparent via-[#C9A96E]/30 to-transparent" />

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
          className="font-display text-[#F5F0E8] text-4xl sm:text-5xl md:text-7xl font-light leading-tight max-w-2xl"
        >
          Parlons de<br />
          <em className="text-[#C9A96E] not-italic">votre trajet</em>
          <span className="block text-xl sm:text-2xl md:text-3xl text-[#F5F0E8]/60 font-light mt-3 tracking-widest uppercase not-italic" style={{ fontFamily: 'var(--font-dm-sans)' }}>
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
        <div className="flex items-center gap-4 px-5 sm:px-8 py-5 border-b border-[#F5F0E8]/10">
          <div className="relative w-2.5 h-2.5 rounded-full bg-[#C9A96E]">
            <span className="absolute inset-0 rounded-full bg-[#C9A96E] animate-ping opacity-40" />
          </div>
          <span className="text-[#F5F0E8]/60 text-xs tracking-[0.4em] uppercase">
            Élia — Assistante réservation
          </span>
        </div>

        {/* Information RGPD — affichée avant tout échange (art. 13 RGPD).
            Note informative, pas un bandeau de consentement à cocher : la
            base légale du traitement est l'exécution de mesures
            précontractuelles (art. 6.1.b RGPD), pas le consentement — voir
            /politique-de-confidentialite. */}
        <p className="px-5 sm:px-8 py-3 border-b border-[#F5F0E8]/10 text-[#F5F0E8]/60 text-[11px] font-light leading-relaxed">
          En discutant avec Élia, vos informations sont transmises à nos prestataires techniques (IA, cartographie, email) pour établir votre devis.{' '}
          <a
            href="/politique-de-confidentialite"
            className="text-[#C9A96E]/70 hover:text-[#C9A96E] underline underline-offset-2 transition-colors duration-300"
          >
            En savoir plus
          </a>
        </p>

        {/* Messages */}
        <div
          ref={messagesRef}
          role="log"
          aria-live="polite"
          aria-atomic="false"
          aria-label="Conversation avec Élia"
          className="flex flex-col gap-6 px-5 sm:px-8 py-8 h-72 sm:h-96 overflow-y-auto scroll-smooth"
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
                <span className="sr-only">{msg.role === 'assistant' ? 'Élia : ' : 'Vous : '}</span>
                {msg.content}
              </div>
            </div>
          ))}

          {/* Indicateur de frappe — avant le premier fragment reçu */}
          {loading && (
            <div className="flex justify-start" role="status" aria-label="Élia est en train de répondre…">
              <div className="flex gap-1.5 items-center py-2" aria-hidden="true">
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

          {/* Réponse en cours de réception — texte final annoncé une seule
              fois via le log aria-live une fois le flux terminé, pas ici. */}
          {streamingText !== null && (
            <div className="flex justify-start" aria-hidden="true">
              <div className="max-w-xs md:max-w-sm text-sm font-light leading-relaxed whitespace-pre-line text-[#F5F0E8]/80">
                {streamingText}
              </div>
            </div>
          )}

          {/* Phase calcul */}
          {phase === 'calculating' && (
            <div className="flex justify-start">
              <p className="text-[#F5F0E8]/60 text-xs tracking-widest uppercase animate-pulse">
                Calcul de votre itinéraire...
              </p>
            </div>
          )}

          {/* Phase limit */}
          {phase === 'limit' && (
            <div className="flex justify-start">
              <p className="text-[#F5F0E8]/60 text-sm font-light leading-relaxed max-w-xs md:max-w-sm">
                Vous avez atteint le nombre maximum d&apos;échanges pour cette session. Pour finaliser votre réservation, appelez-nous directement :{' '}
                <a
                  href="tel:0783699229"
                  className="text-[#C9A96E] hover:text-[#F5F0E8] transition-colors duration-300 underline underline-offset-2"
                >
                  07 83 69 92 29
                </a>
              </p>
            </div>
          )}

          {/* Phase échec envoi */}
          {phase === 'failed' && (
            <div className="flex justify-start">
              <p className="text-[#F5F0E8]/60 text-sm font-light leading-relaxed max-w-xs md:max-w-sm">
                Appelez-nous directement pour finaliser votre réservation :{' '}
                <a
                  href="tel:0783699229"
                  className="text-[#C9A96E] hover:text-[#F5F0E8] transition-colors duration-300 underline underline-offset-2"
                >
                  07 83 69 92 29
                </a>
              </p>
            </div>
          )}
        </div>

        {/* Annonce des changements de phase pour lecteurs d'écran (hors log) */}
        <div role="status" aria-live="assertive" className="sr-only">
          {phase === 'calculating' && 'Calcul de votre devis en cours.'}
          {phase === 'limit' && 'Limite de messages atteinte pour cette session. Appelez le 07 83 69 92 29.'}
          {phase === 'expired' && 'Votre session a expiré après 7 minutes d’inactivité.'}
          {phase === 'failed' && 'Échec de l’envoi de votre demande. Appelez le 07 83 69 92 29.'}
          {phase === 'done' && 'Votre demande de devis a été envoyée avec succès.'}
        </div>

        {/* Input */}
        <div className="border-t border-[#F5F0E8]/10 px-5 sm:px-8 py-5 flex items-center gap-4">
          {/* Champ piège anti-bot : invisible et inatteignable pour un humain
              (hors flux de tabulation, masqué visuellement). Un bot qui
              remplit tous les champs du formulaire le remplira aussi. */}
          <input
            type="text"
            name="message2"
            value={honeypot}
            onChange={e => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute w-0 h-0 opacity-0 pointer-events-none -z-10"
          />
          <label htmlFor="elia-chat-input" className="sr-only">
            Votre réponse à Élia
          </label>
          <input
            ref={inputRef}
            id="elia-chat-input"
            type="text"
            autoComplete="off"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={
              phase === 'done'    ? 'Demande envoyée ✓' :
              phase === 'limit'   ? 'Session limitée — appelez le 07 83 69 92 29' :
              phase === 'expired' ? 'Session expirée — rechargez la page' :
              phase === 'failed'  ? 'Échec de l’envoi — appelez le 07 83 69 92 29' :
              'Votre réponse...'
            }
            disabled={loading || phase !== 'chat'}
            className="flex-1 bg-transparent outline-none text-[#F5F0E8] text-sm font-light placeholder:text-[#F5F0E8]/40 disabled:opacity-40"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading || phase !== 'chat'}
            data-cursor
            className="p-2 -m-2 text-[#C9A96E] text-xs tracking-[0.3em] uppercase disabled:opacity-20 hover:text-[#F5F0E8] transition-colors duration-300"
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