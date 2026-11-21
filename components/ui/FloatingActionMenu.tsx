'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { GOOGLE_REVIEWS_FALLBACK_URI } from '@/lib/links'

const actions = [
  {
    label: 'Appeler VTCLAND',
    href: 'tel:0783699229',
    icon: 'phone',
  },
  {
    label: 'Faire une demande avec Élia',
    href: '/?elia=open#contact',
    icon: 'message',
  },
  {
    label: 'Laisser un avis',
    href: GOOGLE_REVIEWS_FALLBACK_URI,
    icon: 'star',
    external: true,
  },
] as const

function ActionIcon({ name }: { name: (typeof actions)[number]['icon'] }) {
  if (name === 'phone') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.6 3.7 9 8.3 7.5 9.8a15.3 15.3 0 0 0 6.7 6.7l1.5-1.5 4.6 2.4-.7 3.1a2 2 0 0 1-2 1.5C9 21.2 2.8 15 2 6.4a2 2 0 0 1 1.5-2l3.1-.7Z" />
      </svg>
    )
  }
  if (name === 'message') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.5 8.5 0 0 1-9 8.5 9.6 9.6 0 0 1-3.8-.8L3 21l1.8-4.7A8.5 8.5 0 1 1 21 11.5Z" />
        <path strokeLinecap="round" d="M8 12h8M8 8.5h5" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />
    </svg>
  )
}

/** Menu d'actions global, accessible et utilisable au clavier sur toutes les pages. */
export default function FloatingActionMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const actionRefs = useRef<Array<HTMLAnchorElement | null>>([])

  const close = useCallback((restoreFocus = false) => {
    setIsOpen(false)
    if (restoreFocus) window.requestAnimationFrame(() => triggerRef.current?.focus())
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close()
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        close(true)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [close, isOpen])

  const trapTab = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isOpen || event.key !== 'Tab') return
    const focusables = [...actionRefs.current.filter(Boolean), triggerRef.current].filter(Boolean) as HTMLElement[]
    const currentIndex = focusables.indexOf(document.activeElement as HTMLElement)
    if (!event.shiftKey && currentIndex === focusables.length - 1) {
      event.preventDefault()
      focusables[0]?.focus()
    } else if (event.shiftKey && currentIndex === 0) {
      event.preventDefault()
      focusables.at(-1)?.focus()
    }
  }

  return (
    <div
      ref={rootRef}
      className="fixed bottom-[calc(1rem_+_env(safe-area-inset-bottom))] right-4 z-[9990] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6"
      onKeyDown={trapTab}
    >
      <div
        id="vtcland-quick-actions"
        aria-hidden={!isOpen}
        className={`flex flex-col items-end gap-2.5 transition-[opacity,transform] duration-300 motion-reduce:transition-none ${isOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'}`}
      >
        {actions.map((action, index) => (
          <a
            key={action.href}
            ref={(element) => { actionRefs.current[index] = element }}
            href={action.href}
            target={'external' in action && action.external ? '_blank' : undefined}
            rel={'external' in action && action.external ? 'noopener noreferrer' : undefined}
            tabIndex={isOpen ? 0 : -1}
            className={`group flex min-h-12 items-center gap-3 rounded-full border border-[#C9A96E]/35 bg-[#111]/95 py-2 pl-4 pr-2 text-sm text-[#F5F0E8] shadow-[0_10px_35px_rgba(0,0,0,.42)] backdrop-blur-md transition-[opacity,transform,background-color] duration-300 hover:bg-[#1c1811] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4C995] motion-reduce:transition-none ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}
            style={{ transitionDelay: isOpen ? `${index * 55}ms` : '0ms' }}
          >
            <span className="whitespace-nowrap">{action.label}</span>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#C9A96E] text-[#0A0A0A] transition-transform group-hover:scale-105 motion-reduce:transition-none">
              <ActionIcon name={action.icon} />
            </span>
          </a>
        ))}
      </div>

      <button
        ref={triggerRef}
        type="button"
        aria-label={isOpen ? 'Fermer les actions rapides' : 'Ouvrir les actions rapides'}
        aria-expanded={isOpen}
        aria-controls="vtcland-quick-actions"
        onClick={() => setIsOpen((open) => !open)}
        className={`relative grid h-16 w-16 place-items-center overflow-hidden rounded-full border-2 bg-[#111] shadow-[0_10px_35px_rgba(0,0,0,.5)] transition-[transform,border-color] duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4C995] focus-visible:ring-offset-2 focus-visible:ring-offset-black motion-reduce:transition-none ${isOpen ? 'rotate-6 border-[#E4C995]' : 'border-[#C9A96E]/65'}`}
      >
        <span
          aria-hidden="true"
          className="absolute inset-1 rounded-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/icon.png')" }}
        />
        <span aria-hidden="true" className={`absolute inset-0 bg-black/20 transition-opacity duration-300 motion-reduce:transition-none ${isOpen ? 'opacity-25' : 'opacity-0'}`} />
      </button>
    </div>
  )
}
