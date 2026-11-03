'use client'

import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '@/lib/gsap'

/**
 * Écran de chargement — logo animé, disparaît en 1.8s.
 * Lance un event custom 'loading:complete' pour débloquer les animations hero.
 */
export default function LoadingScreen() {
  const screenRef = useRef<HTMLDivElement>(null)
  const logoRef   = useRef<HTMLDivElement>(null)
  const lineRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const screen = screenRef.current
    const logo   = logoRef.current
    const line   = lineRef.current
    if (!screen || !logo || !line) return

    if (prefersReducedMotion()) {
      window.dispatchEvent(new CustomEvent('loading:complete'))
      ;(window as typeof window & { __loadingComplete?: boolean }).__loadingComplete = true
      gsap.set(screen, { yPercent: -100 })
      return
    }

    const tl = gsap.timeline({
      onComplete: () => {
        window.dispatchEvent(new CustomEvent('loading:complete'))
        ;(window as typeof window & { __loadingComplete?: boolean }).__loadingComplete = true
      },
    })

    tl.from(logo, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: 'power3.out',
      })
      .from(line, {
        scaleX: 0,
        duration: 0.6,
        ease: 'power2.inOut',
        transformOrigin: 'left center',
      }, '-=0.3')
      .to(screen, {
        yPercent: -100,
        duration: 1,
        ease: 'power3.inOut',
        delay: 0.3,
      })

  }, [])

  return (
    <div
      ref={screenRef}
      className="fixed inset-0 z-[99997] flex flex-col items-center justify-center bg-[#0A0A0A]"
    >
      <div ref={logoRef} className="text-center">
        <p className="font-display text-[#F5F0E8] text-4xl tracking-[0.3em] uppercase font-light">
          Prestige
        </p>
        <p className="text-[#C9A96E] text-xs tracking-[0.5em] uppercase mt-2 font-light">
          Chauffeur Privé
        </p>
      </div>
      <div
        ref={lineRef}
        className="mt-8 h-px w-24 bg-[#C9A96E]"
      />
    </div>
  )
}