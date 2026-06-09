'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'

/**
 * Scène 4 — Social Proof.
 * 3 citations clients, note Google stylisée, logos partenaires.
 * Animations sobres — le luxe ne crie pas.
 */
export default function SceneSocialProof() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef   = useRef<HTMLHeadingElement>(null)
  const quotesRef  = useRef<HTMLDivElement>(null)
  const ratingRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const title   = titleRef.current
    const quotes  = quotesRef.current
    const rating  = ratingRef.current
    if (!section || !title || !quotes || !rating) return

    const ctx = gsap.context(() => {

      // ── Titre ─────────────────────────────────────────────────
      gsap.from(title, {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: title,
          start: 'top 80%',
        },
      })

      // ── Citations stagger ─────────────────────────────────────
      gsap.from(quotes.children, {
        opacity: 0,
        y: 40,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: quotes,
          start: 'top 75%',
        },
      })

      // ── Note Google ───────────────────────────────────────────
      gsap.from(rating, {
        opacity: 0,
        scale: 0.95,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: rating,
          start: 'top 80%',
        },
      })

      // ── Étoiles se remplissent une par une ───────────────────
      const stars = rating.querySelectorAll<HTMLElement>('[data-star]')
      gsap.from(stars, {
        opacity: 0,
        scale: 0,
        duration: 0.4,
        stagger: 0.1,
        ease: 'back.out(2)',
        scrollTrigger: {
          trigger: rating,
          start: 'top 75%',
        },
      })

    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full bg-[#111111] px-12 md:px-24 py-32 overflow-hidden"
    >

      {/* Ligne décorative top */}
      <div className="absolute top-0 left-12 md:left-24 right-12 md:right-24 h-px bg-gradient-to-r from-transparent via-[#C9A96E]/30 to-transparent" />

      {/* Header */}
      <div className="relative z-10 mb-20">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px w-16 bg-[#C9A96E]" />
          <span className="text-[#C9A96E] text-xs tracking-[0.5em] uppercase font-light">
            Ils nous font confiance · Gard & Hérault
          </span>
        </div>

        <h2
          ref={titleRef}
          className="font-display text-[#F5F0E8] text-5xl md:text-7xl font-light leading-tight max-w-2xl"
        >
          La confiance,<br />
          <em className="text-[#C9A96E] not-italic">méritée</em>
        </h2>
      </div>

      {/* Citations */}
      <div
        ref={quotesRef}
        className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 mb-24"
      >
        {TESTIMONIALS.map((t) => (
          <div
            key={t.author}
            className="relative border-l border-[#C9A96E]/20 pl-8 py-2"
          >
            {/* Guillemet décoratif */}
            <span className="absolute -top-4 left-6 font-display text-[#C9A96E]/20 text-7xl font-light leading-none">
              &quot;
            </span>

            <p className="font-display text-[#F5F0E8]/80 text-xl font-light leading-relaxed mb-6 italic">
              {t.quote}
            </p>

            <div className="flex flex-col gap-1">
              <span className="text-[#F5F0E8] text-sm tracking-wide">
                {t.author}
              </span>
              <span className="text-[#F5F0E8]/30 text-xs tracking-widest uppercase">
                {t.role}
              </span>
              <span className="text-[#C9A96E]/50 text-xs tracking-[0.3em] uppercase">
                {t.city}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Note Google + stats */}
      <div
        ref={ratingRef}
        className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-12 pt-16 border-t border-[#F5F0E8]/10"
      >

        {/* Note Google */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            {/* Logo Google stylisé */}
            <div className="flex gap-0.5">
              {['#4285F4','#EA4335','#FBBC05','#34A853'].map((color, i) => (
                <span
                  key={i}
                  className="font-display text-2xl font-light"
                  style={{ color }}
                >
                  G
                </span>
              ))}
            </div>
            <span className="text-[#F5F0E8]/30 text-xs tracking-widest uppercase">
              Note
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-display text-[#C9A96E] text-5xl font-light">
              4.9
            </span>
            <div className="flex flex-col gap-1">
              <div className="flex gap-1">
                {[1,2,3,4,5].map((star) => (
                  <span
                    key={star}
                    data-star
                    className="text-[#C9A96E] text-lg"
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-[#F5F0E8]/30 text-xs tracking-widest uppercase">
                sur 5 — 48 avis
              </span>
            </div>
          </div>
        </div>

        {/* Séparateur vertical */}
        <div className="hidden md:block w-px h-24 bg-[#F5F0E8]/10" />

        {/* Stats rapides */}
        <div className="flex gap-12">
          {QUICK_STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-2">
              <span className="font-display text-[#C9A96E] text-3xl font-light">
                {stat.value}
              </span>
              <span className="text-[#F5F0E8]/30 text-xs tracking-widest uppercase">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

      </div>

      {/* Fond décoratif */}
      <div
        className="absolute top-1/2 right-0 -translate-y-1/2 text-[22vw] font-display text-[#F5F0E8]/[0.015] leading-none select-none pointer-events-none"
        aria-hidden
      >
        5★
      </div>

    </section>
  )
}

// ── Data ──────────────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote: "Ponctuel, discret, d'une élégance rare. Notre transfert depuis l'aéroport de Montpellier s'est transformé en véritable moment de sérénité.",
    author: 'Sophie M.',
    role: 'Directrice commerciale',
    city: 'Montpellier',
  },
  {
    quote: "Nous faisons appel à ce service pour tous nos séminaires depuis deux ans. Fiabilité et professionnalisme à chaque trajet entre Nîmes et Paris.",
    author: 'Laurent D.',
    role: 'Responsable RH — Groupe Meridia',
    city: 'Nîmes',
  },
  {
    quote: "Le jour de notre mariage dans le Gard, tout était parfait. Le véhicule, l'attitude, les petites attentions. Un souvenir inoubliable.",
    author: 'Camille & Thomas R.',
    role: 'Particuliers',
    city: 'Uzès, Gard',
  },
] as const

const QUICK_STATS = [
  { value: '100%', label: 'Ponctualité'    },
  { value: '5★',   label: 'Confort'        },
  { value: '0',    label: 'Incident'       },
] as const