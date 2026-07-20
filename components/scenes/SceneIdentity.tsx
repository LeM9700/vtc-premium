'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap'

/**
 * Scène 1 — Identité / Manifeste.
 * Phrase centrale avec mask reveal au scroll.
 * Compteurs animés (chiffres clés).
 * Fond grain + ligne or décorative.
 */
export default function SceneIdentity() {
  const sectionRef  = useRef<HTMLElement>(null)
  const manifestRef = useRef<HTMLHeadingElement>(null)
  const lineRef     = useRef<HTMLDivElement>(null)
  const statsRef    = useRef<HTMLDivElement>(null)
  const maskRef     = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section  = sectionRef.current
    const manifest = manifestRef.current
    const line     = lineRef.current
    const stats    = statsRef.current
    const mask     = maskRef.current

    if (!section || !manifest || !line || !stats || !mask) return

    if (prefersReducedMotion()) {
      gsap.set(mask, { scaleX: 0 })
      gsap.set(manifest, { opacity: 1 })
      gsap.set(line, { scaleX: 1 })
      gsap.set(stats.children, { opacity: 1, y: 0 })
      stats.querySelectorAll<HTMLElement>('[data-count]').forEach(el => {
        el.textContent = el.dataset.count ?? '0'
      })
      return
    }

    const ctx = gsap.context(() => {

      // ── Mask reveal sur la phrase manifeste ──────────────────
      // Le mask (rectangle or) slide de gauche à droite
      // révélant le texte en dessous
      gsap.set(mask, { scaleX: 1, transformOrigin: 'left center' })

      ScrollTrigger.create({
        trigger: manifest,
        start: 'top 75%',
        end: 'top 30%',
        scrub: 0.8,
        onUpdate: (self) => {
          gsap.set(mask, { scaleX: 1 - self.progress })
          gsap.set(manifest, { opacity: self.progress })
        },
      })

      // ── Ligne décorative or — draw from left ─────────────────
      gsap.from(line, {
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 1.2,
        ease: 'power3.inOut',
        scrollTrigger: {
          trigger: line,
          start: 'top 80%',
        },
      })

      // ── Compteurs animés ──────────────────────────────────────
      const counters = stats.querySelectorAll<HTMLElement>('[data-count]')

      counters.forEach((el) => {
        const target = parseInt(el.dataset.count ?? '0', 10)
        const obj = { val: 0 }

        // aria-hidden pendant le décompte : évite qu'un lecteur d'écran
        // annonce "0, 1, 2, 3…" — la valeur finale reste lisible via le
        // span .sr-only jumeau (voir JSX).
        el.setAttribute('aria-hidden', 'true')

        gsap.to(obj, {
          val: target,
          duration: 2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 80%',
          },
          onUpdate: () => {
            el.textContent = Math.round(obj.val).toString()
          },
          onComplete: () => {
            el.removeAttribute('aria-hidden')
          },
        })
      })

      // ── Fade in staggeré des cards stats ─────────────────────
      gsap.from(stats.children, {
        opacity: 0,
        y: 50,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: stats,
          start: 'top 75%',
        },
      })

    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full bg-[#0A0A0A] flex flex-col justify-center px-12 md:px-24 py-32 overflow-hidden"
    >

      {/* Ligne décorative verticale gauche */}
      <div className="absolute left-12 md:left-24 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#C9A96E]/20 to-transparent" />

      {/* Label section */}
      <div className="flex items-center gap-4 mb-16">
        <div
          ref={lineRef}
          className="h-px w-16 bg-[#C9A96E]"
        />
        <span className="text-[#C9A96E] text-xs tracking-[0.5em] uppercase font-light">
          VTCLAND · Au service de l&apos;Occitanie
        </span>
      </div>

      {/* Phrase manifeste avec mask reveal */}
      <div className="relative mb-24 max-w-5xl">
        {/* Mask qui se rétracte au scroll */}
        <div
          ref={maskRef}
          className="absolute inset-0 z-10 bg-[#C9A96E]/10 backdrop-blur-sm"
          style={{ transformOrigin: 'left center' }}
        />

        <h2
          ref={manifestRef}
          className="font-display text-[#F5F0E8] text-4xl md:text-6xl xl:text-7xl font-light leading-tight opacity-0"
        >
          Nous ne proposons pas<br />
          un simple trajet —<br />
          nous concevons{' '}
          <em className="text-[#C9A96E] not-italic">
            une expérience
          </em>{' '}
          à votre mesure.
        </h2>
      </div>

      {/* Stats / Chiffres clés */}
      <div
        ref={statsRef}
        className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8"
      >
        {STATS.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-3">
            <div className="flex items-end gap-1">
              <span
                data-count={stat.value}
                className="font-display text-[#C9A96E] text-5xl md:text-6xl font-light tabular-nums"
              >
                0
              </span>
              <span className="sr-only">{stat.value}{stat.suffix}</span>
              <span aria-hidden className="font-display text-[#C9A96E] text-3xl font-light mb-1">
                {stat.suffix}
              </span>
            </div>
            <p className="text-[#F5F0E8]/50 text-sm tracking-widest uppercase font-light">
              {stat.label}
            </p>
            <div className="h-px w-8 bg-[#C9A96E]/30" />
          </div>
        ))}
      </div>

      {/* Texte décoratif en arrière-plan */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 text-[20vw] font-display text-[#F5F0E8]/[0.02] leading-none select-none pointer-events-none"
        aria-hidden
      >
        VTC
      </div>

    </section>
  )
}

// ── Data ───────────────────────────────────────────────────────────────────────
const STATS = [
  { value: 10,  suffix: '+', label: 'Années en Occitanie'        },
  { value: 98,  suffix: '%', label: 'Clients satisfaits'          },
  { value: 500, suffix: '+', label: 'Trajets Gard & Hérault'     },
  { value: 24,  suffix: 'h', label: 'Disponibilité'               },
] as const