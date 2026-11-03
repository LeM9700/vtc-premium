import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

gsap.defaults({
  ease: 'power2.out',
  duration: 0.6,
})

ScrollTrigger.config({
  ignoreMobileResize: true,
})

export { gsap, ScrollTrigger }

/**
 * `true` si l'utilisateur a activé "Réduire les animations" au niveau OS.
 * À vérifier dans chaque useEffect avant de lancer une animation GSAP —
 * bascule vers l'état final immédiat (`gsap.set`) plutôt que la transition.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}