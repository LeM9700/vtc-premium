'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { lenisRef } from '@/lib/lenis'

interface SmoothScrollerProps {
  children: React.ReactNode
}

/**
 * Wrapper global Lenis + GSAP ScrollTrigger sync.
 * Doit être placé directement dans layout.tsx.
 */
export default function SmoothScroller({ children }: SmoothScrollerProps) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 1.5,
    })

    lenisRef.current = lenis

    lenis.on('scroll', ScrollTrigger.update)

    const rafFn = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(rafFn)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(rafFn)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  return <>{children}</>
}
