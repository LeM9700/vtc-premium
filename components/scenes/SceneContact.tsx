import EliaMessenger from '@/components/elia/EliaMessenger'
import type { ContextKey } from '@/lib/systemPrompt'

interface SceneContactProps {
  greeting?: string
  contextKey?: ContextKey
}

const defaultGreeting = 'Bonsoir. Je suis Élia, votre assistante de réservation. Quel type de trajet souhaitez-vous organiser ?'

/** Point d'entrée de la section devis ; la conversation interactive reste isolée. */
export default function SceneContact({ greeting = defaultGreeting, contextKey }: SceneContactProps = {}) {
  return (
    <section id="contact" className="relative min-h-dvh w-full overflow-hidden bg-[#0A0A0A] px-6 py-20 sm:px-8 sm:py-24 md:px-24 md:py-32">
      <div className="absolute left-6 right-6 top-0 h-px bg-gradient-to-r from-transparent via-[#C9A96E]/30 to-transparent sm:left-8 sm:right-8 md:left-24 md:right-24" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-12 sm:mb-16">
          <div className="mb-8 flex items-center gap-4">
            <div className="h-px w-16 bg-[#C9A96E]" />
            <span className="text-xs font-light uppercase tracking-[0.35em] text-[#C9A96E] sm:tracking-[0.5em]">Votre devis · 24h/24 en Occitanie</span>
          </div>
          <h2 className="max-w-2xl font-display text-4xl font-light leading-tight text-[#F5F0E8] sm:text-5xl md:text-7xl">
            Parlons de<br /><em className="not-italic text-[#C9A96E]">votre trajet</em>
            <span className="mt-3 block text-xl font-light uppercase tracking-widest text-[#F5F0E8]/60 sm:text-2xl md:text-3xl" style={{ fontFamily: 'var(--font-dm-sans)' }}>
              Montpellier · Nîmes · Occitanie
            </span>
          </h2>
        </div>
        <EliaMessenger greeting={greeting} contextKey={contextKey} />
      </div>
      <div className="pointer-events-none absolute bottom-0 right-0 select-none font-display text-[18vw] leading-none text-[#F5F0E8]/[0.015]" aria-hidden="true">DEVIS</div>
    </section>
  )
}
