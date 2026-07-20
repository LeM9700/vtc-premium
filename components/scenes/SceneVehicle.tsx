'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap'

/**
 * Scène 2 — Showcase véhicule.
 * Video scrubbing : currentTime de la vidéo piloté par ScrollTrigger.
 * La scène est "pinned" pendant toute la durée du scroll.
 * Texte latéral apparaît en milieu de séquence.
 */
export default function SceneVehicle() {
  const sectionRef  = useRef<HTMLElement>(null)
  const videoRef    = useRef<HTMLVideoElement>(null)
  const labelRef    = useRef<HTMLDivElement>(null)
  const titleRef    = useRef<HTMLHeadingElement>(null)
  const specsRef    = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section  = sectionRef.current
    const video    = videoRef.current
    const label    = labelRef.current
    const title    = titleRef.current
    const specs    = specsRef.current
    const progress = progressRef.current

    if (!section || !video || !label || !title || !specs || !progress) return

    if (prefersReducedMotion()) {
      // Pas de pin/scrub scroll-jacké : contenu statique visible d'emblée,
      // vidéo figée sur son premier frame.
      gsap.set([label, title], { opacity: 1, x: 0 })
      gsap.set(specs.querySelectorAll('[data-spec]'), { opacity: 1, y: 0 })
      gsap.set(progress, { scaleX: 1 })
      return
    }

    const PIN_DISTANCE = window.innerHeight * 4

    // Attend que la vidéo soit prête pour connaître sa durée
    const initScrubbing = () => {
      const duration = video.duration
      if (!duration || isNaN(duration)) return

      const ctx = gsap.context(() => {

        // Timeline principale — tout dans UN SEUL ScrollTrigger pinné.
        // Les ScrollTriggers séparés avec start `top+=Npx top` ne fonctionnent
        // pas correctement une fois la section pinnée (positions relatives au
        // scroll total, pas au pin) : on pilote donc tout via la progress
        // de cette unique instance.
        gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: `+=${PIN_DISTANCE}`,
            pin: true,
            scrub: 1,
            onUpdate: (self) => {
              video.currentTime = self.progress * duration

              gsap.set(progress, {
                scaleX: self.progress,
                transformOrigin: 'left center',
              })

              const p = self.progress

              // Texte apparaît entre 25% et 50%, disparaît entre 80% et 100%
              const textOpacity = p < 0.25
                ? 0
                : p < 0.5
                ? (p - 0.25) / 0.25
                : p < 0.8
                ? 1
                : 1 - (p - 0.8) / 0.2

              const textX = p < 0.25
                ? -30
                : p < 0.5
                ? gsap.utils.interpolate(-30, 0, (p - 0.25) / 0.25)
                : 0

              gsap.set([label, title], {
                opacity: textOpacity,
                x: textX,
              })

              // Specs décalées — apparaissent entre 40% et 70%, disparaissent entre 80% et 100%
              const specsOpacity = p < 0.4
                ? 0
                : p < 0.65
                ? (p - 0.4) / 0.25
                : p < 0.8
                ? 1
                : 1 - (p - 0.8) / 0.2

              const specsY = p < 0.4
                ? 20
                : gsap.utils.interpolate(20, 0, Math.min(1, (p - 0.4) / 0.25))

              const items = specs.querySelectorAll<HTMLElement>('[data-spec]')
              items.forEach((el, i) => {
                const delay = i * 0.08
                const adjustedP = Math.max(0, specsOpacity - delay)
                gsap.set(el, {
                  opacity: Math.min(1, adjustedP * 4),
                  y: specsY,
                })
              })
            },
          },
        })

      }, section)

      return () => ctx.revert()
    }

    // Si la vidéo est déjà chargée
    if (video.readyState >= 2) {
      initScrubbing()
    } else {
      video.addEventListener('loadedmetadata', initScrubbing, { once: true })
    }

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative h-dvh w-full overflow-hidden bg-[#0A0A0A]"
    >
      {/* Vidéo scrubbing — pas d'autoPlay, pas de loop */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        src="/videos/vehicle_scrub.mp4"
        muted
        playsInline
        preload="auto"
      />

      {/* Dégradé gauche pour lisibilité texte */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#0A0A0A]/80 via-[#0A0A0A]/20 to-transparent" />

      {/* Dégradé bas */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0A0A0A]/60 to-transparent" />

      {/* Contenu textuel gauche */}
      <div className="absolute left-6 sm:left-8 md:left-24 top-1/2 -translate-y-1/2 z-20 max-w-[75vw] sm:max-w-sm">

        {/* Label */}
        <div
          ref={labelRef}
          className="flex items-center gap-4 mb-6 opacity-0"
        >
          <div className="h-px w-8 bg-[#C9A96E]" />
          <span className="text-[#C9A96E] text-xs tracking-[0.5em] uppercase">
            Le véhicule · Montpellier & Nîmes
          </span>
        </div>

        {/* Titre */}
        <h2
          ref={titleRef}
          className="font-display text-[#F5F0E8] text-4xl md:text-5xl font-light leading-tight mb-8 opacity-0"
        >
          Un écrin<br />
          <em className="text-[#C9A96E] not-italic">sur mesure</em>
        </h2>

        {/* Specs */}
        <div ref={specsRef} className="flex flex-col gap-4">
          {SPECS.map((spec) => (
            <div
              key={spec.label}
              data-spec
              className="flex items-center gap-4 opacity-0"
            >
              <div className="w-px h-8 bg-[#C9A96E]/40" />
              <div>
                <p className="text-[#F5F0E8] text-sm font-light">
                  {spec.value}
                </p>
                <p className="text-[#F5F0E8]/60 text-xs tracking-widest uppercase">
                  {spec.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Barre de progression en bas */}
      <div className="absolute bottom-0 left-0 right-0 z-20 h-px bg-[#F5F0E8]/10">
        <div
          ref={progressRef}
          className="h-full bg-[#C9A96E]"
          style={{ transformOrigin: 'left center' }}
        />
      </div>

      {/* Numéro de scène discret */}
      <div className="absolute bottom-8 right-12 z-20">
        <span className="font-display text-[#F5F0E8]/40 text-6xl font-light">
          02
        </span>
      </div>

    </section>
  )
}

// ── Data — à adapter selon le véhicule réel ───────────────────────────────────
const SPECS = [
  { value: 'Mercedes Classe E / S',    label: 'Véhicule'      },
  { value: '4 passagers',              label: 'Capacité'      },
  { value: 'Climatisation bi-zone',    label: 'Confort'       },
  { value: 'WiFi & chargeurs USB-C',   label: 'Connectivité'  },
] as const