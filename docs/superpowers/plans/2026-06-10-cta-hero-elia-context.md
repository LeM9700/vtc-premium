# CTA Hero → Élia Contextualisée — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the dead hero CTA button to scroll to the Élia chat (`#contact`) with a per-page contextualized greeting and system-prompt context, and fix the broken "Découvrir →" link so it scrolls to a valid section on every page.

**Architecture:** A small singleton (`lib/lenis.ts`) exposes the app's existing Lenis smooth-scroll instance (created in `SmoothScroller`, which persists across client-side navigations) so `SceneHero` can call `scrollTo()` programmatically. `SceneHero` gains a `discoverHref` prop (default `#services`, preserving home behavior) and `onClick` handlers on the CTA button and "Découvrir →" link. `SectionHighlights` gets `id="highlights"` as the new scroll target on the 6 secondary pages. `SceneContact` gains optional `greeting`/`contextNote` props: `greeting` replaces Élia's first message, `contextNote` is injected into the system prompt (refactored from a constant into `buildSystemPrompt(contextNote?)`) so Élia skips questions already answered by context (e.g., trip type on the wedding/airport/disposal/distance pages).

**Tech Stack:** Next.js 16 (App Router), TypeScript, React 19, Lenis (smooth scroll), Tailwind CSS 4. No test framework in this repo — verification uses `npx tsc --noEmit`, `npm run build`, and manual dev-server checks.

---

## Task 1: Create the Lenis singleton

**Files:**
- Create: `lib/lenis.ts`

- [ ] **Step 1: Create `lib/lenis.ts`**

```typescript
import type Lenis from 'lenis'

export const lenisRef: { current: Lenis | null } = { current: null }
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors (no output, exit code 0).

- [ ] **Step 3: Commit**

```bash
git add lib/lenis.ts
git commit -m "feat(lenis): add singleton ref to expose active Lenis instance"
```

---

## Task 2: Register the Lenis singleton in SmoothScroller

**Files:**
- Modify: `components/layout/SmoothScroller.tsx`

- [ ] **Step 1: Replace the full file content**

Current content (42 lines):

```tsx
'use client'

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '@/lib/gsap'

interface SmoothScrollerProps {
  children: React.ReactNode
}

/**
 * Wrapper global Lenis + GSAP ScrollTrigger sync.
 * Doit être placé directement dans layout.tsx.
 */
export default function SmoothScroller({ children }: SmoothScrollerProps) {
  const lenisRef = useRef<Lenis | null>(null)

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
    }
  }, [])

  return <>{children}</>
}
```

Replace with:

```tsx
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
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/layout/SmoothScroller.tsx
git commit -m "feat(lenis): register singleton ref on mount, clear on unmount"
```

---

## Task 3: Add scroll target to SectionHighlights

**Files:**
- Modify: `components/ui/SectionHighlights.tsx:17`

- [ ] **Step 1: Add `id="highlights"` to the root section**

In `components/ui/SectionHighlights.tsx`, change:

```tsx
    <section className="relative bg-[#111111] px-12 md:px-24 py-32">
```

to:

```tsx
    <section id="highlights" className="relative bg-[#111111] px-12 md:px-24 py-32">
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/ui/SectionHighlights.tsx
git commit -m "feat(highlights): add #highlights scroll anchor"
```

---

## Task 4: Wire SceneHero CTA and "Découvrir →" to Lenis scroll

**Files:**
- Modify: `components/scenes/SceneHero.tsx`

- [ ] **Step 1: Update imports and add `discoverHref` to the props interface**

Change:

```tsx
import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import Image from 'next/image'

interface SceneHeroProps {
  title?:    ReactNode
  subtitle?: string
  ctaLabel?: string
  heroImageSrc?: string
}
import { gsap, ScrollTrigger } from '@/lib/gsap'
import SplitType from 'split-type'
```

to:

```tsx
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
```

- [ ] **Step 2: Default the new prop in the function signature**

Change:

```tsx
export default function SceneHero({
  title    = <>Chaque trajet<br /><span className="text-[#C9A96E] italic">est une promesse.</span></>,
  subtitle = 'Chauffeur privé · Montpellier · Nîmes · Occitanie',
  ctaLabel = 'Demander un devis',
  heroImageSrc,
}: SceneHeroProps = {}) {
```

to:

```tsx
export default function SceneHero({
  title    = <>Chaque trajet<br /><span className="text-[#C9A96E] italic">est une promesse.</span></>,
  subtitle = 'Chauffeur privé · Montpellier · Nîmes · Occitanie',
  ctaLabel = 'Demander un devis',
  heroImageSrc,
  discoverHref = '#services',
}: SceneHeroProps = {}) {
```

- [ ] **Step 3: Add the click handlers before the JSX return**

In `components/scenes/SceneHero.tsx`, the `useEffect` block ends and is immediately followed by `return (`:

```tsx
    return () => {
      window.removeEventListener('loading:complete', onLoadingComplete)
      split.revert()
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [])

  return (
```

Change to:

```tsx
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
```

- [ ] **Step 4: Wire the CTA button**

Change:

```tsx
          <button
            data-cursor
            className="group relative px-10 py-4 border border-[#C9A96E] text-[#C9A96E] font-body text-sm tracking-[0.3em] uppercase overflow-hidden transition-colors duration-500 hover:text-[#0A0A0A]"
          >
```

to:

```tsx
          <button
            onClick={handleCtaClick}
            data-cursor
            className="group relative px-10 py-4 border border-[#C9A96E] text-[#C9A96E] font-body text-sm tracking-[0.3em] uppercase overflow-hidden transition-colors duration-500 hover:text-[#0A0A0A]"
          >
```

- [ ] **Step 5: Wire the "Découvrir →" link**

Change:

```tsx
          <a
            href="#services"
            data-cursor
            className="text-[#F5F0E8]/50 text-sm tracking-widest uppercase hover:text-[#C9A96E] transition-colors duration-300">
            Découvrir →
          </a>
```

to:

```tsx
          <a
            href={discoverHref}
            onClick={handleDiscoverClick}
            data-cursor
            className="text-[#F5F0E8]/50 text-sm tracking-widest uppercase hover:text-[#C9A96E] transition-colors duration-300">
            Découvrir →
          </a>
```

- [ ] **Step 6: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add components/scenes/SceneHero.tsx
git commit -m "feat(hero): wire CTA and Découvrir link to Lenis scroll targets"
```

---

## Task 5: Contextualize SceneContact (greeting + system prompt)

**Files:**
- Modify: `components/scenes/SceneContact.tsx`

- [ ] **Step 1: Add the `SceneContactProps` interface**

After the `CollectedData` interface (ends at line 29 with `}`), insert a new interface before the `// ── Prompt système ─...` comment:

Change:

```tsx
interface CollectedData {
  type?:        TripType
  departure?:   string
  destination?: string
  date?:        string
  time?:        string
  passengers?:  string
  hours?:       number
  options?:     string[]
  payment?:     string
  name?:        string
  phone?:       string
  email?:       string
  distanceKm?:  number
  durationMin?: number
  prixEstime?:  number
}

// ── Prompt système ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Tu es l'assistant de réservation d'un service de chauffeur privé premium.
```

to:

```tsx
interface CollectedData {
  type?:        TripType
  departure?:   string
  destination?: string
  date?:        string
  time?:        string
  passengers?:  string
  hours?:       number
  options?:     string[]
  payment?:     string
  name?:        string
  phone?:       string
  email?:       string
  distanceKm?:  number
  durationMin?: number
  prixEstime?:  number
}

interface SceneContactProps {
  greeting?:    string
  contextNote?: string
}

// ── Prompt système ─────────────────────────────────────────────────────────────
function buildSystemPrompt(contextNote?: string): string {
  const contextBlock = contextNote ? `\nCONTEXTE :\n${contextNote}\n` : ''

  return `Tu es l'assistant de réservation d'un service de chauffeur privé premium.
```

- [ ] **Step 2: Close the new function and remove the old constant's closing**

The body of `SYSTEM_PROMPT` is unchanged except for one inserted line (`${contextBlock}`) right after the persona line, and the final closing backtick becomes `` ` } `` (closing the function instead of the constant).

Change:

```tsx
Tu t'appelles "Élia". Tu es élégant, chaleureux, concis. Jamais de listes à puces. Jamais de markdown visible.

RÈGLE PRIORITAIRE :
```

to:

```tsx
Tu t'appelles "Élia". Tu es élégant, chaleureux, concis. Jamais de listes à puces. Jamais de markdown visible.
${contextBlock}
RÈGLE PRIORITAIRE :
```

Then change the end of the prompt from:

```tsx
Pour "type" utilise uniquement : airport, disposal, event, distance.
Pour mise à disposition, destination = "N/A".`

const SESSION_KEY  = 'elia_msg_count'
```

to:

```tsx
Pour "type" utilise uniquement : airport, disposal, event, distance.
Pour mise à disposition, destination = "N/A".`
}

const SESSION_KEY  = 'elia_msg_count'
```

After steps 1-2, `buildSystemPrompt` is a complete function:

```tsx
interface SceneContactProps {
  greeting?:    string
  contextNote?: string
}

// ── Prompt système ─────────────────────────────────────────────────────────────
function buildSystemPrompt(contextNote?: string): string {
  const contextBlock = contextNote ? `\nCONTEXTE :\n${contextNote}\n` : ''

  return `Tu es l'assistant de réservation d'un service de chauffeur privé premium.
Tu t'appelles "Élia". Tu es élégant, chaleureux, concis. Jamais de listes à puces. Jamais de markdown visible.
${contextBlock}
RÈGLE PRIORITAIRE :
- Si le client pose une question sans rapport avec la réservation d'un trajet (météo, actualités, recettes, politique, code, blagues, sport, santé, traduction, etc.), réponds UNIQUEMENT : "Je suis Élia, votre assistante réservation. Je ne suis pas en mesure de répondre à cela — mais je serai ravie de vous préparer un devis pour votre prochain trajet."

RÈGLES ABSOLUES :
- Ne donne JAMAIS d'estimation de prix, de distance ou de durée — le calcul est automatique après collecte.
- Si le client demande le prix, réponds : "Le tarif exact sera calculé et affiché dès que j'ai toutes vos informations."
- Collecte les adresses COMPLÈTES avec ville (ex: "14 rue de la Paix, Montpellier").
- Une seule question à la fois. Jamais de formulaire.

Tu collectes ces informations dans l'ordre, UNE par UNE :
1. Type de trajet (aéroport/gare, mise à disposition, événement, longue distance)
2. Si mise à disposition : combien d'heures ?
3. Adresse complète de départ (rue + ville)
4. Adresse complète de destination (rue + ville) — sauf mise à disposition
5. Date souhaitée
6. Heure de prise en charge
7. Nombre de passagers
8. Options parmi : Grand bagage, Siège enfant, Accueil personnalisé, Eau & rafraîchissements, Discrétion totale
9. Mode de paiement parmi : Carte bancaire, Espèces, Virement bancaire
10. Prénom et nom
11. Numéro de téléphone
12. Email

Quand tu as TOUTES les infos (les 12 points), envoie UN message de confirmation élégant, puis termine EXACTEMENT par ce bloc sur une ligne séparée :
<COLLECTED>{"type":"airport|disposal|event|distance","departure":"...","destination":"...","date":"...","time":"...","passengers":"...","hours":4,"options":[],"payment":"...","name":"...","phone":"...","email":"..."}</COLLECTED>

Pour "type" utilise uniquement : airport, disposal, event, distance.
Pour mise à disposition, destination = "N/A".`
}
```

- [ ] **Step 3: Accept the new props in the component signature**

Change:

```tsx
export default function SceneContact() {
```

to:

```tsx
export default function SceneContact({ greeting, contextNote }: SceneContactProps = {}) {
```

- [ ] **Step 4: Use `greeting` for the initial message**

Change:

```tsx
  const [messages,  setMessages]  = useState<Message[]>([{
    role:    'assistant',
    content: 'Bonsoir. Je suis Élia, votre assistante de réservation. Pour quel type de trajet puis-je vous préparer un devis ?',
  }])
```

to:

```tsx
  const [messages,  setMessages]  = useState<Message[]>([{
    role:    'assistant',
    content: greeting ?? 'Bonsoir. Je suis Élia, votre assistante de réservation. Pour quel type de trajet puis-je vous préparer un devis ?',
  }])
```

- [ ] **Step 5: Use `buildSystemPrompt(contextNote)` in `callClaude`**

Change:

```tsx
  const callClaude = useCallback(async (history: Message[], count: number): Promise<string> => {
    const res = await fetch('/api/chat', {
      method:  'POST',
      headers: {
        'Content-Type':    'application/json',
        'X-Message-Count': String(count),
      },
      body: JSON.stringify({ messages: history, system: SYSTEM_PROMPT }),
    })
    const data = await res.json()
    return data.content ?? 'Une erreur est survenue.'
  }, [])
```

to:

```tsx
  const callClaude = useCallback(async (history: Message[], count: number): Promise<string> => {
    const res = await fetch('/api/chat', {
      method:  'POST',
      headers: {
        'Content-Type':    'application/json',
        'X-Message-Count': String(count),
      },
      body: JSON.stringify({ messages: history, system: buildSystemPrompt(contextNote) }),
    })
    const data = await res.json()
    return data.content ?? 'Une erreur est survenue.'
  }, [contextNote])
```

- [ ] **Step 6: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add components/scenes/SceneContact.tsx
git commit -m "feat(contact): add greeting/contextNote props, refactor SYSTEM_PROMPT to buildSystemPrompt"
```

---

## Task 6: Pass discoverHref / greeting / contextNote on the 6 secondary pages

**Files:**
- Modify: `app/vtc-nimes/page.tsx`
- Modify: `app/vtc-montpellier/page.tsx`
- Modify: `app/transfert-aeroport-montpellier/page.tsx`
- Modify: `app/vtc-mariage-gard/page.tsx`
- Modify: `app/chauffeur-prive-professionnel-occitanie/page.tsx`
- Modify: `app/longue-distance-occitanie/page.tsx`

For each page below: add `discoverHref="#highlights"` as the last prop on `<SceneHero>`, and replace the bare `<SceneContact />` with `<SceneContact greeting="..." contextNote="..." />` using the values given.

- [ ] **Step 1: `app/vtc-nimes/page.tsx`**

Change:

```tsx
      <SceneHero
        heroImageSrc="/images/hero-vtc-nimes.webp"
        title={
          <>
            VTC Nîmes<br />
            <span className="text-[#C9A96E] italic">excellence &amp; ponctualité.</span>
          </>
        }
        subtitle="Chauffeur privé · Gard · Occitanie"
        ctaLabel="Réserver à Nîmes"
      />
```

to:

```tsx
      <SceneHero
        heroImageSrc="/images/hero-vtc-nimes.webp"
        title={
          <>
            VTC Nîmes<br />
            <span className="text-[#C9A96E] italic">excellence &amp; ponctualité.</span>
          </>
        }
        subtitle="Chauffeur privé · Gard · Occitanie"
        ctaLabel="Réserver à Nîmes"
        discoverHref="#highlights"
      />
```

Change:

```tsx
      <SceneServices />
      <SceneContact />
    </main>
  )
}
```

to:

```tsx
      <SceneServices />
      <SceneContact
        greeting="Bonsoir. Je suis Élia, votre assistante de réservation pour Nîmes et le Gard. Pour quel type de trajet puis-je vous préparer un devis ?"
        contextNote="Le client navigue depuis la page VTC Nîmes (Gard). S'il ne précise pas de ville, suppose Nîmes par défaut."
      />
    </main>
  )
}
```

- [ ] **Step 2: `app/vtc-montpellier/page.tsx`**

Change:

```tsx
      <SceneHero
        heroImageSrc="/images/hero-vtc-montpellier.webp"
        title={
          <>
            VTC Montpellier<br />
            <span className="text-[#C9A96E] italic">à votre service.</span>
          </>
        }
        subtitle="Chauffeur privé · Hérault · Occitanie"
        ctaLabel="Réserver à Montpellier"
      />
```

to:

```tsx
      <SceneHero
        heroImageSrc="/images/hero-vtc-montpellier.webp"
        title={
          <>
            VTC Montpellier<br />
            <span className="text-[#C9A96E] italic">à votre service.</span>
          </>
        }
        subtitle="Chauffeur privé · Hérault · Occitanie"
        ctaLabel="Réserver à Montpellier"
        discoverHref="#highlights"
      />
```

Change:

```tsx
      <SceneServices />
      <SceneContact />
    </main>
  )
}
```

to:

```tsx
      <SceneServices />
      <SceneContact
        greeting="Bonsoir. Je suis Élia, votre assistante de réservation pour Montpellier et l'Hérault. Pour quel type de trajet puis-je vous préparer un devis ?"
        contextNote="Le client navigue depuis la page VTC Montpellier (Hérault). S'il ne précise pas de ville, suppose Montpellier par défaut."
      />
    </main>
  )
}
```

- [ ] **Step 3: `app/transfert-aeroport-montpellier/page.tsx`**

Change:

```tsx
      <SceneHero
        heroImageSrc="/images/hero-aeroport-montpellier.webp"
        title={
          <>
            Aéroport Montpellier<br />
            <span className="text-[#C9A96E] italic">sans l&apos;imprévu.</span>
          </>
        }
        subtitle="Transfert · Méditerranée · Vol suivi en temps réel"
        ctaLabel="Réserver mon transfert"
      />
```

to:

```tsx
      <SceneHero
        heroImageSrc="/images/hero-aeroport-montpellier.webp"
        title={
          <>
            Aéroport Montpellier<br />
            <span className="text-[#C9A96E] italic">sans l&apos;imprévu.</span>
          </>
        }
        subtitle="Transfert · Méditerranée · Vol suivi en temps réel"
        ctaLabel="Réserver mon transfert"
        discoverHref="#highlights"
      />
```

Change:

```tsx
      <SceneContact />
    </main>
  )
}
```

to:

```tsx
      <SceneContact
        greeting="Bonsoir. Je vois que vous préparez un transfert vers ou depuis l'Aéroport Montpellier-Méditerranée. S'agit-il d'une arrivée ou d'un départ ?"
        contextNote="Le type de trajet est 'airport', l'une des deux adresses est l'Aéroport Montpellier-Méditerranée (MPL). Ne demande pas le type : commence par confirmer arrivée/départ, puis collecte uniquement l'adresse manquante (ville incluse)."
      />
    </main>
  )
}
```

- [ ] **Step 4: `app/vtc-mariage-gard/page.tsx`**

Change:

```tsx
      <SceneHero
        heroImageSrc="/images/hero-mariage-gard.webp"
        title={
          <>
            Votre mariage,<br />
            <span className="text-[#C9A96E] italic">notre honneur.</span>
          </>
        }
        subtitle="Chauffeur événementiel · Gard & Hérault · Sur devis"
        ctaLabel="Devis mariage"
      />
```

to:

```tsx
      <SceneHero
        heroImageSrc="/images/hero-mariage-gard.webp"
        title={
          <>
            Votre mariage,<br />
            <span className="text-[#C9A96E] italic">notre honneur.</span>
          </>
        }
        subtitle="Chauffeur événementiel · Gard & Hérault · Sur devis"
        ctaLabel="Devis mariage"
        discoverHref="#highlights"
      />
```

Change:

```tsx
      <SceneContact />
    </main>
  )
}
```

to:

```tsx
      <SceneContact
        greeting="Bonsoir. Je suis ravie de vous accompagner pour le transport de votre mariage dans le Gard ou l'Hérault. Quelle est la date de la cérémonie ?"
        contextNote="Le type de trajet est 'event' (mariage). Ne demande pas le type : commence directement par la date de la cérémonie."
      />
    </main>
  )
}
```

- [ ] **Step 5: `app/chauffeur-prive-professionnel-occitanie/page.tsx`**

Change:

```tsx
      <SceneHero
        heroImageSrc="/images/hero-chauffeur-pro.webp"
        title={
          <>
            Transport<br />
            <span className="text-[#C9A96E] italic">d&apos;affaires, sans compromis.</span>
          </>
        }
        subtitle="Chauffeur professionnel · Occitanie · Facturation entreprise"
        ctaLabel="Devis entreprise"
      />
```

to:

```tsx
      <SceneHero
        heroImageSrc="/images/hero-chauffeur-pro.webp"
        title={
          <>
            Transport<br />
            <span className="text-[#C9A96E] italic">d&apos;affaires, sans compromis.</span>
          </>
        }
        subtitle="Chauffeur professionnel · Occitanie · Facturation entreprise"
        ctaLabel="Devis entreprise"
        discoverHref="#highlights"
      />
```

Change:

```tsx
      <SceneContact />
    </main>
  )
}
```

to:

```tsx
      <SceneContact
        greeting="Bonsoir. Je vous prépare un devis pour une mise à disposition professionnelle en Occitanie. Combien d'heures de mise à disposition souhaitez-vous ?"
        contextNote="Le type de trajet est 'disposal'. Ne demande pas le type : commence directement par le nombre d'heures souhaité."
      />
    </main>
  )
}
```

- [ ] **Step 6: `app/longue-distance-occitanie/page.tsx`**

Change:

```tsx
      <SceneHero
        heroImageSrc="/images/hero-longue-distance.webp"
        title={
          <>
            Toutes destinations,<br />
            <span className="text-[#C9A96E] italic">un seul chauffeur.</span>
          </>
        }
        subtitle="Longue distance · Paris · Lyon · Monaco · Genève"
        ctaLabel="Planifier mon trajet"
      />
```

to:

```tsx
      <SceneHero
        heroImageSrc="/images/hero-longue-distance.webp"
        title={
          <>
            Toutes destinations,<br />
            <span className="text-[#C9A96E] italic">un seul chauffeur.</span>
          </>
        }
        subtitle="Longue distance · Paris · Lyon · Monaco · Genève"
        ctaLabel="Planifier mon trajet"
        discoverHref="#highlights"
      />
```

Change:

```tsx
      <SceneContact />
    </main>
  )
}
```

to:

```tsx
      <SceneContact
        greeting="Bonsoir. Indiquez-moi votre ville de départ (Montpellier, Nîmes...) et votre destination longue distance, et je vous prépare un devis."
        contextNote="Le type de trajet est 'distance'. Ne demande pas le type : commence directement par les adresses de départ et de destination."
      />
    </main>
  )
}
```

- [ ] **Step 7: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add app/vtc-nimes/page.tsx app/vtc-montpellier/page.tsx app/transfert-aeroport-montpellier/page.tsx app/vtc-mariage-gard/page.tsx app/chauffeur-prive-professionnel-occitanie/page.tsx app/longue-distance-occitanie/page.tsx
git commit -m "feat(pages): contextualize Élia greeting/prompt and discover link on secondary pages"
```

---

## Task 7: Build and manual verification

**Files:** none (verification only)

- [ ] **Step 1: Production build**

Run: `npm run build`
Expected: build completes successfully with no type or lint errors.

- [ ] **Step 2: Start dev server (or reuse the running one) and check the homepage (`/`)**

- Click the hero CTA ("Demander un devis") → smooth-scrolls to `#contact`, Élia's first message is unchanged ("Bonsoir. Je suis Élia, votre assistante de réservation. Pour quel type de trajet puis-je vous préparer un devis ?").
- Click "Découvrir →" → smooth-scrolls to `#services` (unchanged behavior).

- [ ] **Step 3: Check each of the 6 secondary pages**

For `/vtc-nimes`, `/vtc-montpellier`, `/transfert-aeroport-montpellier`, `/vtc-mariage-gard`, `/chauffeur-prive-professionnel-occitanie`, `/longue-distance-occitanie`:

- Click the hero CTA → smooth-scrolls to `#contact`, and Élia's first message matches the page's `greeting`.
- Click "Découvrir →" → smooth-scrolls to `#highlights` (the `SectionHighlights` block).
- On the airport / wedding / chauffeur-pro / longue-distance pages, start a conversation and confirm Élia does not re-ask for the trip type (it should jump straight to the next question per `contextNote`).

- [ ] **Step 4: Client-side navigation check**

From the homepage, click a footer/services link to a secondary page (client-side `Link` navigation, no full reload). Confirm:
- The hero image and title still animate in correctly (regression check for the earlier `__loadingComplete` fix).
- The CTA button still scrolls to `#contact` (confirms `lenisRef.current` remains valid after navigation, since `SmoothScroller` does not unmount between routes).

- [ ] **Step 5: Final commit (if any fixes were needed during verification)**

```bash
git add -A
git commit -m "fix: address issues found during CTA/Élia context verification"
```

(Skip this step if no fixes were needed.)
