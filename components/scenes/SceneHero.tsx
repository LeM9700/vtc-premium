'use client'

import { useEffect, useRef } from 'react'
import type { ReactNode, MouseEvent } from 'react'
import Image from 'next/image'
import { lenisRef } from '@/lib/lenis'

interface SceneHeroProps {
  title?:    ReactNode
  subtitle?: string
  ctaLabel?: string
  heroImageSrc?: string
  discoverHref?: string
}
import { gsap, ScrollTrigger } from '@/lib/gsap'
import SplitType from 'split-type'

/**
 * Scène 0 — Hero fullscreen.
 * Vidéo coucher de soleil en loop, reveal titre lettre par lettre,
 * sous-titre + CTA apparaissent en différé.
 * Écoute l'event 'loading:complete' avant de lancer les animations.
 */
export default function SceneHero({
  title    = <>Chaque trajet<br /><span className="text-[#C9A96E] italic">est une promesse.</span></>,
  subtitle = 'Chauffeur privé · Montpellier · Nîmes · Occitanie',
  ctaLabel = 'Demander un devis',
  heroImageSrc,
  discoverHref = '#services',
}: SceneHeroProps = {}) {
  const sectionRef   = useRef<HTMLElement>(null)
  const videoRef     = useRef<HTMLVideoElement>(null)
  const titleRef     = useRef<HTMLHeadingElement>(null)
  const subtitleRef  = useRef<HTMLParagraphElement>(null)
  const ctaRef       = useRef<HTMLDivElement>(null)
  const scrollRef    = useRef<HTMLDivElement>(null)
  const overlayRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section  = sectionRef.current
    const video    = videoRef.current
    const title    = titleRef.current
    const subtitle = subtitleRef.current
    const cta      = ctaRef.current
    const scroll   = scrollRef.current
    const overlay  = overlayRef.current

    if (!section || (!video && !heroImageSrc) || !title || !subtitle || !cta || !scroll || !overlay) return

    // Split le titre en caractères individuels
    const split = new SplitType(title, { types: 'chars' })

    // État initial — tout invisible
    gsap.set(split.chars, { opacity: 0, y: 40, rotateX: -90 })
    gsap.set([subtitle, cta, scroll], { opacity: 0, y: 30 })
    gsap.set(overlay, { opacity: 1 })

    const runIntro = () => {
      const tl = gsap.timeline()

      // 1. Overlay noir se dissout
      tl.to(overlay, {
          opacity: 0,
          duration: 1.2,
          ease: 'power2.inOut',
        })

        // 2. Vidéo fade in (géré via opacity sur le wrapper)
        // 3. Chars du titre tombent en cascade
        .to(split.chars, {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.8,
          stagger: 0.04,
          ease: 'power3.out',
        }, '-=0.4')

        // 4. Sous-titre
        .to(subtitle, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
        }, '-=0.3')

        // 5. CTA
        .to(cta, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
        }, '-=0.4')

        // 6. Indicateur scroll
        .to(scroll, {
          opacity: 1,
          y: 0,
          duration: 0.5,
        }, '-=0.2')
    }

    // Attend que le loading screen ait disparu (une seule fois au premier chargement).
    // Lors d'une navigation client (Link), le LoadingScreen ne se rejoue pas et
    // l'event 'loading:complete' ne sera plus jamais redispatché : on lance donc
    // l'intro immédiatement si elle a déjà eu lieu.
    const onLoadingComplete = () => runIntro()
    if ((window as typeof window & { __loadingComplete?: boolean }).__loadingComplete) {
      runIntro()
    } else {
      window.addEventListener('loading:complete', onLoadingComplete)
    }

    // Parallax de la vidéo au scroll
    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
       if (video) {
  gsap.set(video, {
    yPercent: self.progress * 30,
  })
}
      },
    })

    // Fade out du contenu hero au scroll
    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: '40% top',
      scrub: true,
      onUpdate: (self) => {
        gsap.set([title, subtitle, cta], {
          opacity: 1 - self.progress,
          y: self.progress * -40,
        })
      },
    })

    return () => {
      window.removeEventListener('loading:complete', onLoadingComplete)
      split.revert()
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [])

  const handleCtaClick = () => {
    lenisRef.current?.scrollTo('#contact', { offset: -40 })
  }

  const handleDiscoverClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    lenisRef.current?.scrollTo(discoverHref, { offset: -40 })
  }

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden"
    >
      {/* Overlay noir initial */}
      <div
        ref={overlayRef}
        className="absolute inset-0 z-20 bg-[#0A0A0A]"
      />

      {heroImageSrc ? (
  <Image
    src={heroImageSrc}
    alt=""
    fill
    priority
    className="absolute inset-0 object-cover scale-110"
  />
) : (
  <video
    ref={videoRef}
    className="absolute inset-0 w-full h-full object-cover scale-110"
    src="/videos/hero.mp4"
    autoPlay
    muted
    loop
    playsInline
    preload="auto"
  />
)}

      {/* Dégradé bas → haut pour lisibilité texte */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent" />

      {/* Dégradé gauche pour le texte */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#0A0A0A]/60 to-transparent" />

      {/* Contenu hero */}
      <div className="absolute inset-0 z-30 flex flex-col justify-end pb-20 px-12 md:px-24">

        {/* Titre principal */}
        <h1
          ref={titleRef}
          className="font-display text-[#F5F0E8] text-6xl md:text-8xl xl:text-[9rem] font-light leading-none tracking-tight mb-6"
          style={{ perspective: '800px' }}
        >
          {title}
        </h1>

        {/* Sous-titre */}
        <p
          ref={subtitleRef}
          className="text-[#F5F0E8]/70 text-lg md:text-xl font-light tracking-widest uppercase mb-10 max-w-md"
        >
          {subtitle}
        </p>

        {/* CTA */}
        <div ref={ctaRef} className="flex items-center gap-6">
          <button
            onClick={handleCtaClick}
            data-cursor
            className="group relative px-10 py-4 border border-[#C9A96E] text-[#C9A96E] font-body text-sm tracking-[0.3em] uppercase overflow-hidden transition-colors duration-500 hover:text-[#0A0A0A]"
          >
            {/* Fill au hover */}
            <span className="absolute inset-0 bg-[#C9A96E] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
            <span className="relative">{ctaLabel}</span>
          </button>

          <a
            href={discoverHref}
            onClick={handleDiscoverClick}
            data-cursor
            className="text-[#F5F0E8]/50 text-sm tracking-widest uppercase hover:text-[#C9A96E] transition-colors duration-300">
            Découvrir →
          </a>
        </div>
      </div>

      {/* Indicateur scroll */}
      <div
        ref={scrollRef}
        className="absolute bottom-8 right-12 z-30 flex flex-col items-center gap-3"
      >
        <span className="text-[#F5F0E8]/30 text-xs tracking-[0.4em] uppercase rotate-90 origin-center">
          Scroll
        </span>
        <div className="w-px h-16 bg-gradient-to-b from-[#C9A96E] to-transparent animate-pulse" />
      </div>

      {/* Badge discret top-right */}
      <div className="absolute top-8 right-12 z-30 text-right">
        <p className="text-[#F5F0E8]/30 text-xs tracking-[0.3em] uppercase">
          Disponible 24h/24 en Occitanie
        </p>
      </div>
    </section>
  )
}