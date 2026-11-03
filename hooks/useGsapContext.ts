import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'

/**
 * Hook utilitaire — crée un contexte GSAP propre par composant.
 * Évite les fuites mémoire en nettoyant toutes les animations au unmount.
 */
export function useGsapContext(scope: React.RefObject<HTMLElement>) {
  const ctx = useRef<gsap.Context | null>(null)

  useEffect(() => {
    ctx.current = gsap.context(() => {}, scope)
    return () => ctx.current?.revert()
  }, [scope])

  return ctx
}