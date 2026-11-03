'use client'

import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '@/lib/gsap'

/**
 * Curseur custom deux couches — dot rapide + ring lagué.
 * S'agrandit automatiquement sur a, button, [data-cursor].
 * Désactivé sur écrans tactiles (pointer: coarse) et si reduced-motion.
 */
export default function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dot  = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    const isTouch = window.matchMedia('(pointer: coarse)').matches
    if (isTouch || prefersReducedMotion()) return

    const moveDot  = gsap.quickTo(dot,  'x', { duration: 0.1,  ease: 'none' })
    const moveDotY = gsap.quickTo(dot,  'y', { duration: 0.1,  ease: 'none' })
    const moveRing  = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power2.out' })
    const moveRingY = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power2.out' })

    const onMouseMove = (e: MouseEvent) => {
      moveDot(e.clientX)
      moveDotY(e.clientY)
      moveRing(e.clientX)
      moveRingY(e.clientY)
    }

    const onEnter = () => gsap.to(ring, { scale: 2.5, opacity: 1, duration: 0.3 })
    const onLeave = () => gsap.to(ring, { scale: 1,   opacity: 0.5, duration: 0.3 })

    const targets = document.querySelectorAll('a, button, [data-cursor]')
    targets.forEach(el => {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
    })

    window.addEventListener('mousemove', onMouseMove)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      targets.forEach(el => {
        el.removeEventListener('mouseenter', onEnter)
        el.removeEventListener('mouseleave', onLeave)
      })
    }
  }, [])

  return (
    <>
      <div
        ref={dotRef}
        style={{ willChange: 'transform' }}
        className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full bg-[#C9A96E] pointer-events-none z-[99999] -translate-x-1/2 -translate-y-1/2"
      />
      <div
        ref={ringRef}
        style={{ willChange: 'transform' }}
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-[#C9A96E] pointer-events-none z-[99998] -translate-x-1/2 -translate-y-1/2 opacity-50"
      />
    </>
  )
}