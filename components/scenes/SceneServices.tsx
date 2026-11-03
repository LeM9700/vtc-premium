'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap'

/**
 * Scène 3 — Services.
 * Cards qui se déploient en stagger au scroll.
 * Ligne active qui suit la card en viewport.
 */
export default function SceneServices() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef   = useRef<HTMLHeadingElement>(null)
  const cardsRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const title   = titleRef.current
    const cards   = cardsRef.current
    if (!section || !title || !cards) return

    const cardEls = cards.querySelectorAll<HTMLElement>('[data-card]')

    if (prefersReducedMotion()) {
      gsap.set(title, { opacity: 1, y: 0 })
      gsap.set(cardEls, { opacity: 1, y: 0 })
      return
    }

    const ctx = gsap.context(() => {

      // ── Titre reveal ──────────────────────────────────────────
      gsap.from(title, {
        opacity: 0,
        y: 60,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: title,
          start: 'top 80%',
        },
      })

      // ── Cards stagger ─────────────────────────────────────────
      gsap.from(cardEls, {
        opacity: 0,
        y: 80,
        duration: 0.9,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: cards,
          start: 'top 75%',
        },
      })

      // ── Hover magnétique sur chaque card ─────────────────────
      cardEls.forEach((card) => {
        const inner = card.querySelector<HTMLElement>('[data-card-inner]')
        if (!inner) return

        const onEnter = (e: MouseEvent) => {
          const rect = card.getBoundingClientRect()
          const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 12
          const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 12

          gsap.to(inner, {
            rotateX: -y,
            rotateY: x,
            duration: 0.4,
            ease: 'power2.out',
            transformPerspective: 800,
          })
        }

        const onLeave = () => {
          gsap.to(inner, {
            rotateX: 0,
            rotateY: 0,
            duration: 0.6,
            ease: 'power3.out',
          })
        }

        card.addEventListener('mousemove', onEnter)
        card.addEventListener('mouseleave', onLeave)
      })

    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="services"
      className="relative min-h-dvh w-full bg-[#0A0A0A] px-6 sm:px-8 md:px-24 py-20 sm:py-24 md:py-32 overflow-hidden"
    >

      {/* Fond décoratif */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-[#111111] to-[#0A0A0A]" />

      {/* Header section */}
      <div className="relative z-10 mb-20">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px w-16 bg-[#C9A96E]" />
          <span className="text-[#C9A96E] text-xs tracking-[0.5em] uppercase font-light">
            Nos prestations · Gard & Hérault
          </span>
        </div>

        <h2
          ref={titleRef}
          className="font-display text-[#F5F0E8] text-4xl sm:text-5xl md:text-7xl font-light leading-tight max-w-2xl"
        >
          Un service pensé<br />
          <em className="text-[#C9A96E] not-italic">pour l&apos;exception</em>
        </h2>
      </div>

      {/* Grid cards */}
      <div
        ref={cardsRef}
        className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {SERVICES.map((service, i) => (
          <Link
            key={service.title}
            href={service.href}
            data-card
            data-cursor
            className="group relative"
            style={{ perspective: '1000px' }}
          >
            <div
              data-card-inner
              className="relative border border-[#F5F0E8]/10 bg-[#111111] p-10 h-full transition-colors duration-500 group-hover:border-[#C9A96E]/30 overflow-hidden"
            >
              {/* Numéro */}
              <span className="absolute top-8 right-8 font-display text-[#F5F0E8]/10 text-5xl font-light">
                {String(i + 1).padStart(2, '0')}
              </span>

              {/* Icône SVG */}
              <div className="mb-8 w-12 h-12 flex items-center justify-center border border-[#C9A96E]/30 group-hover:border-[#C9A96E] transition-colors duration-500">
                <service.Icon />
              </div>

              {/* Titre */}
              <h3 className="font-display text-[#F5F0E8] text-2xl font-light mb-4 group-hover:text-[#C9A96E] transition-colors duration-500">
                {service.title}
              </h3>

              {/* Description */}
              <p className="text-[#F5F0E8]/50 text-sm leading-relaxed font-light">
                {service.description}
              </p>

              {/* Ligne bottom hover */}
              <div className="absolute bottom-0 left-0 h-px w-0 bg-[#C9A96E] group-hover:w-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />

              {/* Glow hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-[#C9A96E]/5 to-transparent pointer-events-none" />
            </div>
          </Link>
        ))}
      </div>

      {/* Texte décoratif fond */}
      <div
        className="absolute bottom-0 left-0 right-0 text-center text-[18vw] font-display text-[#F5F0E8]/[0.015] leading-none select-none pointer-events-none overflow-hidden"
        aria-hidden
      >
        PRESTIGE
      </div>

    </section>
  )
}

// ── Icônes SVG inline ─────────────────────────────────────────────────────────
const IconAirport = () => (
  <svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="1.5">
    <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
  </svg>
)

const IconCar = () => (
  <svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="1.5">
    <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h11l4 4h1a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-1"/>
    <circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
  </svg>
)

const IconEvent = () => (
  <svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="1.5">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
)

const IconRoute = () => (
  <svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="1.5">
    <path d="M3 12h18M3 6h18M3 18h18"/>
  </svg>
)

// ── Data ──────────────────────────────────────────────────────────────────────
const SERVICES = [
  {
    Icon: IconAirport,
    title: 'Transferts aéroport & gare',
    href: '/transfert-aeroport-montpellier',
    description:
      "Prise en charge ponctuelle depuis ou vers l'Aéroport Montpellier-Méditerranée et Nîmes-Camargue. Suivi des vols en temps réel, accueil personnalisé. Votre chauffeur vous attend, quoi qu'il arrive.",
  },
  {
    Icon: IconCar,
    title: 'Mise à disposition',
    href: '/vtc-montpellier',
    description:
      "Demi-journée ou journée complète à Montpellier, Nîmes et en Occitanie — votre chauffeur reste à votre disposition. Idéal pour les déplacements professionnels ou personnels multiples dans le Gard et l'Hérault.",
  },
  {
    Icon: IconEvent,
    title: 'Événements & occasions',
    href: '/vtc-mariage-gard',
    description:
      "Mariages dans le Gard et l'Hérault, soirées de prestige, séminaires d'entreprise en Occitanie. Nous assurons votre transport avec l'élégance que l'événement mérite.",
  },
  {
    Icon: IconRoute,
    title: 'Longue distance',
    href: '/longue-distance-occitanie',
    description:
      "Montpellier, Nîmes, Avignon, Marseille, Lyon, Monaco, Genève, Paris — aucune destination n'est trop lointaine. Voyagez confortablement sans contrainte de correspondance.",
  },
]