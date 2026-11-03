# Responsive Mobile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the 12 pages (home + 6 SEO landing pages) comfortable to use on phones (320-430px wide) by fixing spacing, viewport-height, typography scale, and touch-target size in the ~11 shared components they all render through — without changing any JSX structure, hooks, GSAP/ScrollTrigger/Lenis logic, video assets, or copy.

**Architecture:** Pure Tailwind `className` edits, file by file. Every component listed here is rendered by the home page and/or one or more of the 6 SEO landing pages (`app/vtc-montpellier/page.tsx`, `app/vtc-nimes/page.tsx`, `app/transfert-aeroport-montpellier/page.tsx`, `app/vtc-mariage-gard/page.tsx`, `app/chauffeur-prive-professionnel-occitanie/page.tsx`, `app/longue-distance-occitanie/page.tsx`, `app/page.tsx`), so fixing a component once fixes it everywhere. No page file needs editing.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS 4 (`@import "tailwindcss"` in `app/globals.css`, no custom `@theme` breakpoint overrides — default breakpoints apply: `sm`=640px, `md`=768px, `lg`=1024px, `xl`=1280px, `2xl`=1536px).

## Global Constraints

- Additive CSS only: no changes to JSX structure, component props/signatures, hooks, GSAP/ScrollTrigger animation logic, or Lenis smooth-scroll wiring.
- Do not touch `public/videos/*`, any `preload`/`src` video attribute, or `PIN_DISTANCE` in `SceneVehicle.tsx` — video weight and the pin-scroll mechanic are a separate, already-tracked chantier (`audit/performance.md`, `audit/fix-plan.md` Phase 5).
- Do not add a mobile navigation menu — the site stays one-page + footer (`components/ui/Navbar.tsx` stays unused, see `CLAUDE.md`).
- Do not change any French copy/text content.
- No new files, no new npm dependencies.
- **Every mobile-only size reduction must restore the exact current value at `sm:` (640px) or leave `md:`/`xl:` untouched**, so tablet/desktop (≥768px) renders pixel-identical to today. Rationale: Tailwind's `sm:` breakpoint is 640px — it does **not** create an intermediate step for portrait phones (320-430px, all below 640px). Every phone in portrait mode gets the unprefixed **base** classes. So the fix is: lower the base (unprefixed) value to something safe at 320-360px, then set `sm:` back to today's base value — nothing changes at 640px and above.
- No automated test suite exists in this repo (confirmed in `audit/production.md`) — verification per task is `npx tsc --noEmit` (must stay clean) plus a manual check against the criteria given in each task's Step 3. There is no `Test:` file to create.
- Repo root: `c:\Users\melbo\workspace\vtc-premium`. Dev server for manual checks: `npm run dev -- -H 0.0.0.0` (exposes on LAN so a real phone on the same wifi can hit `http://<your-computer-LAN-IP>:3000`).

---

### Task 1: SceneHero.tsx

**Files:**
- Modify: `components/scenes/SceneHero.tsx`
- Test: none (see Global Constraints)

**Interfaces:**
- Consumes: N/A — no cross-task dependency.
- Produces: N/A — no exported signature changes, `className`-only edits.

- [ ] **Step 1: Apply the 5 edits below**

Full-screen section — `100vh` → `100dvh` so iOS/Android address-bar collapse doesn't jump the layout:

```tsx
// Before
className="relative h-screen w-full overflow-hidden"

// After
className="relative h-dvh w-full overflow-hidden"
```

Content wrapper — fixed `px-12` eats ~26% of a 360px-wide screen; add a mobile-first scale:

```tsx
// Before
<div className="absolute inset-0 z-30 flex flex-col justify-end pb-20 px-12 md:px-24">

// After
<div className="absolute inset-0 z-30 flex flex-col justify-end pb-20 px-6 sm:px-8 md:px-24">
```

Title — `text-6xl` (60px) with `leading-none` is too large for a 360px-wide phone given the copy's hard-coded `<br/>` breaks; drop one step on mobile only, restore at `sm:` (640px) so nothing changes on tablet/desktop:

```tsx
// Before
className="font-display text-[#F5F0E8] text-6xl md:text-8xl xl:text-[9rem] font-light leading-none tracking-tight mb-6"

// After
className="font-display text-[#F5F0E8] text-5xl sm:text-6xl md:text-8xl xl:text-[9rem] font-light leading-none tracking-tight mb-6"
```

Pause/play button — enlarge the tap target without moving the visible text (equal `padding`/negative `margin` expands the hit-box only; see Global Constraints reasoning — this is a standard, safe CSS technique):

```tsx
// Before
className="absolute bottom-8 left-12 z-30 text-[#F5F0E8]/60 hover:text-[#C9A96E] transition-colors duration-300 text-xs tracking-widest uppercase"

// After
className="absolute bottom-8 left-12 z-30 inline-block p-2 -m-2 text-[#F5F0E8]/60 hover:text-[#C9A96E] transition-colors duration-300 text-xs tracking-widest uppercase"
```

"Découvrir →" link — same tap-target technique:

```tsx
// Before
className="text-[#F5F0E8]/50 text-sm tracking-widest uppercase hover:text-[#C9A96E] transition-colors duration-300">

// After
className="inline-block p-2 -m-2 text-[#F5F0E8]/50 text-sm tracking-widest uppercase hover:text-[#C9A96E] transition-colors duration-300">
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Manual check**

`npm run dev -- -H 0.0.0.0`, open `/` on a phone (or resize a desktop browser to 360px and 390px width):
- No horizontal scrollbar/overflow on the hero.
- Title "Chaque trajet / est une promesse." reads cleanly, no character clipped by the viewport edge.
- Resize back to ≥1024px: hero must look pixel-identical to before this task (title size, padding).
- Tap the pause button and the "Découvrir →" link with a mouse — visible position must be unchanged from before the edit.

- [ ] **Step 4: Commit**

```bash
git add components/scenes/SceneHero.tsx
git commit -m "fix(hero): responsive viewport height, spacing and tap targets on mobile"
```

---

### Task 2: SceneVehicle.tsx

**Files:**
- Modify: `components/scenes/SceneVehicle.tsx`
- Test: none

**Interfaces:**
- Consumes: N/A
- Produces: N/A

- [ ] **Step 1: Apply the 2 edits below**

Pinned section — same `dvh` fix as the hero (video src/`PIN_DISTANCE`/pin mechanic untouched):

```tsx
// Before
className="relative h-screen w-full overflow-hidden bg-[#0A0A0A]"

// After
className="relative h-dvh w-full overflow-hidden bg-[#0A0A0A]"
```

Left text block — two bugs today: (1) fixed `left-12` padding is oversized on narrow phones, (2) `max-w-sm` (384px) with no right-side constraint means the box can extend past the right edge of any screen narrower than ~432px, i.e. it already horizontally overflows on every phone in portrait mode. Fix both:

```tsx
// Before
<div className="absolute left-12 md:left-24 top-1/2 -translate-y-1/2 z-20 max-w-sm">

// After
<div className="absolute left-6 sm:left-8 md:left-24 top-1/2 -translate-y-1/2 z-20 max-w-[75vw] sm:max-w-sm">
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Manual check**

On the home page (`SceneVehicle` is scene 2), scroll to the vehicle section at 360px and 390px width:
- The "Un écrin sur mesure" text block and the 4 spec lines stay fully within the viewport — no text clipped at the right edge.
- At ≥1024px width, the block's position and max-width are unchanged from before.
- The pinned scroll-scrub behavior (video following scroll position) still works — do not report on video load speed, only that scrubbing itself isn't broken by the CSS change.

- [ ] **Step 4: Commit**

```bash
git add components/scenes/SceneVehicle.tsx
git commit -m "fix(vehicle): responsive viewport height and fix text block overflow on mobile"
```

---

### Task 3: SceneIdentity.tsx

**Files:**
- Modify: `components/scenes/SceneIdentity.tsx`
- Test: none

**Interfaces:**
- Consumes: N/A
- Produces: N/A

- [ ] **Step 1: Apply the 3 edits below**

Section — `py-32` (128px top+bottom) plus fixed `px-12`, and `min-h-screen` → `min-h-dvh`:

```tsx
// Before
className="relative min-h-screen w-full bg-[#0A0A0A] flex flex-col justify-center px-12 md:px-24 py-32 overflow-hidden"

// After
className="relative min-h-dvh w-full bg-[#0A0A0A] flex flex-col justify-center px-6 sm:px-8 md:px-24 py-20 sm:py-24 md:py-32 overflow-hidden"
```

Decorative vertical line — keep it aligned with the new section padding:

```tsx
// Before
<div className="absolute left-12 md:left-24 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#C9A96E]/20 to-transparent" />

// After
<div className="absolute left-6 sm:left-8 md:left-24 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#C9A96E]/20 to-transparent" />
```

Manifesto heading — longest line ("nous concevons une expérience") is too wide at the current base size on a 360px screen; drop one step, restore at `sm:`:

```tsx
// Before
className="font-display text-[#F5F0E8] text-4xl md:text-6xl xl:text-7xl font-light leading-tight opacity-0"

// After
className="font-display text-[#F5F0E8] text-3xl sm:text-4xl md:text-6xl xl:text-7xl font-light leading-tight opacity-0"
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Manual check**

On the home page at 360-390px width:
- No horizontal overflow.
- The manifesto sentence and the 4 stat numbers (10+, 98%, 500+, 24h) are readable without overlapping the decorative vertical line.
- At ≥1024px, section padding and heading size match current production exactly.

- [ ] **Step 4: Commit**

```bash
git add components/scenes/SceneIdentity.tsx
git commit -m "fix(identity): responsive spacing, viewport height and heading scale on mobile"
```

---

### Task 4: SceneServices.tsx

**Files:**
- Modify: `components/scenes/SceneServices.tsx`
- Test: none

**Interfaces:**
- Consumes: N/A
- Produces: N/A

- [ ] **Step 1: Apply the 2 edits below**

```tsx
// Before
className="relative min-h-screen w-full bg-[#0A0A0A] px-12 md:px-24 py-32 overflow-hidden"

// After
className="relative min-h-dvh w-full bg-[#0A0A0A] px-6 sm:px-8 md:px-24 py-20 sm:py-24 md:py-32 overflow-hidden"
```

```tsx
// Before
className="font-display text-[#F5F0E8] text-5xl md:text-7xl font-light leading-tight max-w-2xl"

// After
className="font-display text-[#F5F0E8] text-4xl sm:text-5xl md:text-7xl font-light leading-tight max-w-2xl"
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Manual check**

On the home page (`#services`) at 360-390px width:
- Heading "Un service pensé pour l'exception" doesn't overflow horizontally.
- The 4 service cards stack in a single column and remain readable (this grid was already `grid-cols-1 md:grid-cols-2` — confirm it still is, this task doesn't change it).
- At ≥1024px, heading size and section padding are unchanged from current production.

- [ ] **Step 4: Commit**

```bash
git add components/scenes/SceneServices.tsx
git commit -m "fix(services): responsive spacing, viewport height and heading scale on mobile"
```

---

### Task 5: SceneSocialProof.tsx

**Files:**
- Modify: `components/scenes/SceneSocialProof.tsx`
- Test: none

**Interfaces:**
- Consumes: N/A
- Produces: N/A

- [ ] **Step 1: Apply the 3 edits below**

```tsx
// Before
className="relative min-h-screen w-full bg-[#111111] px-12 md:px-24 py-32 overflow-hidden"

// After
className="relative min-h-dvh w-full bg-[#111111] px-6 sm:px-8 md:px-24 py-20 sm:py-24 md:py-32 overflow-hidden"
```

```tsx
// Before
<div className="absolute top-0 left-12 md:left-24 right-12 md:right-24 h-px bg-gradient-to-r from-transparent via-[#C9A96E]/30 to-transparent" />

// After
<div className="absolute top-0 left-6 sm:left-8 md:left-24 right-6 sm:right-8 md:right-24 h-px bg-gradient-to-r from-transparent via-[#C9A96E]/30 to-transparent" />
```

```tsx
// Before
className="font-display text-[#F5F0E8] text-5xl md:text-7xl font-light leading-tight max-w-2xl"

// After
className="font-display text-[#F5F0E8] text-4xl sm:text-5xl md:text-7xl font-light leading-tight max-w-2xl"
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Manual check**

On the home page (social proof / reviews section) at 360-390px width:
- No horizontal overflow, decorative top line stays inset from both edges symmetrically.
- The "Note Google + stats" row (already `flex-col md:flex-row`) stacks cleanly below the reviews.
- At ≥1024px, everything matches current production exactly.

- [ ] **Step 4: Commit**

```bash
git add components/scenes/SceneSocialProof.tsx
git commit -m "fix(social-proof): responsive spacing, viewport height and heading scale on mobile"
```

---

### Task 6: SceneContact.tsx

**Files:**
- Modify: `components/scenes/SceneContact.tsx`
- Test: none

**Interfaces:**
- Consumes: N/A
- Produces: N/A

- [ ] **Step 1: Apply the 8 edits below**

Section:

```tsx
// Before
className="relative min-h-screen w-full bg-[#0A0A0A] px-12 md:px-24 py-32 overflow-hidden"

// After
className="relative min-h-dvh w-full bg-[#0A0A0A] px-6 sm:px-8 md:px-24 py-20 sm:py-24 md:py-32 overflow-hidden"
```

Decorative top line:

```tsx
// Before
<div className="absolute top-0 left-12 md:left-24 right-12 md:right-24 h-px bg-gradient-to-r from-transparent via-[#C9A96E]/30 to-transparent" />

// After
<div className="absolute top-0 left-6 sm:left-8 md:left-24 right-6 sm:right-8 md:right-24 h-px bg-gradient-to-r from-transparent via-[#C9A96E]/30 to-transparent" />
```

Heading + sub-label (two size steps in one block — both restored at `sm:`):

```tsx
// Before
<h2
  ref={titleRef}
  className="font-display text-[#F5F0E8] text-5xl md:text-7xl font-light leading-tight max-w-2xl"
>
  Parlons de<br />
  <em className="text-[#C9A96E] not-italic">votre trajet</em>
  <span className="block text-2xl md:text-3xl text-[#F5F0E8]/60 font-light mt-3 tracking-widest uppercase not-italic" style={{ fontFamily: 'var(--font-dm-sans)' }}>
    Montpellier · Nîmes · Occitanie
  </span>
</h2>

// After
<h2
  ref={titleRef}
  className="font-display text-[#F5F0E8] text-4xl sm:text-5xl md:text-7xl font-light leading-tight max-w-2xl"
>
  Parlons de<br />
  <em className="text-[#C9A96E] not-italic">votre trajet</em>
  <span className="block text-xl sm:text-2xl md:text-3xl text-[#F5F0E8]/60 font-light mt-3 tracking-widest uppercase not-italic" style={{ fontFamily: 'var(--font-dm-sans)' }}>
    Montpellier · Nîmes · Occitanie
  </span>
</h2>
```

Chat header padding (there are 4 identical `px-8` inner-padding spots in this file — header, RGPD note, messages log, input row — each gets `px-5 sm:px-8` so the chat box itself frees up width on phones, on top of the section-level padding fix above):

```tsx
// Before
<div className="flex items-center gap-4 px-8 py-5 border-b border-[#F5F0E8]/10">

// After
<div className="flex items-center gap-4 px-5 sm:px-8 py-5 border-b border-[#F5F0E8]/10">
```

RGPD note:

```tsx
// Before
<p className="px-8 py-3 border-b border-[#F5F0E8]/10 text-[#F5F0E8]/60 text-[11px] font-light leading-relaxed">

// After
<p className="px-5 sm:px-8 py-3 border-b border-[#F5F0E8]/10 text-[#F5F0E8]/60 text-[11px] font-light leading-relaxed">
```

Messages log — also reduce the fixed `h-96` (384px) on phones so the log doesn't dominate a short mobile viewport (restored at `sm:`):

```tsx
// Before
className="flex flex-col gap-6 px-8 py-8 h-96 overflow-y-auto scroll-smooth"

// After
className="flex flex-col gap-6 px-5 sm:px-8 py-8 h-72 sm:h-96 overflow-y-auto scroll-smooth"
```

Input row:

```tsx
// Before
<div className="border-t border-[#F5F0E8]/10 px-8 py-5 flex items-center gap-4">

// After
<div className="border-t border-[#F5F0E8]/10 px-5 sm:px-8 py-5 flex items-center gap-4">
```

"Envoyer" button — tap-target expansion (same technique as Task 1):

```tsx
// Before
className="text-[#C9A96E] text-xs tracking-[0.3em] uppercase disabled:opacity-20 hover:text-[#F5F0E8] transition-colors duration-300"

// After
className="p-2 -m-2 text-[#C9A96E] text-xs tracking-[0.3em] uppercase disabled:opacity-20 hover:text-[#F5F0E8] transition-colors duration-300"
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Manual check**

On the home page (`#contact`) at 360-390px width, and on at least one SEO landing page (e.g. `/vtc-montpellier`) which renders the same component with different `greeting`/`contextKey` props:
- No horizontal overflow anywhere in the chat widget.
- Start a conversation with Élia (if API keys are configured locally) or at least confirm the input field, placeholder text, and "Envoyer" button are all visible and tappable without the layout breaking.
- Open the on-screen keyboard (or simulate by shrinking the browser viewport height to ~500px) — the message log + input row must remain usable, not pushed off-screen.
- At ≥1024px width, the chat widget matches current production exactly (all `sm:` restores kick in).

- [ ] **Step 4: Commit**

```bash
git add components/scenes/SceneContact.tsx
git commit -m "fix(contact): responsive spacing, viewport height, chat sizing and tap target on mobile"
```

---

### Task 7: FooterSeo.tsx

**Files:**
- Modify: `components/layout/FooterSeo.tsx`
- Test: none

**Interfaces:**
- Consumes: N/A
- Produces: N/A

- [ ] **Step 1: Apply the 4 edits below**

Footer + decorative line:

```tsx
// Before
<footer className="relative bg-[#0A0A0A] px-12 md:px-24 py-16 border-t border-[#F5F0E8]/10">
  <div className="absolute top-0 left-12 md:left-24 right-12 md:right-24 h-px bg-gradient-to-r from-transparent via-[#C9A96E]/20 to-transparent" />

// After
<footer className="relative bg-[#0A0A0A] px-6 sm:px-8 md:px-24 py-16 border-t border-[#F5F0E8]/10">
  <div className="absolute top-0 left-6 sm:left-8 md:left-24 right-6 sm:right-8 md:right-24 h-px bg-gradient-to-r from-transparent via-[#C9A96E]/20 to-transparent" />
```

Villes/Services links — this exact `className` string appears twice in the file (once per `<nav>` list); use `replace_all` so both get the tap-target fix identically:

```tsx
// Before (2 occurrences — replace_all)
className="text-[#F5F0E8]/60 text-sm tracking-wide font-light hover:text-[#C9A96E] transition-colors duration-300 aria-[current=page]:text-[#C9A96E]"

// After
className="inline-block p-2 -m-2 text-[#F5F0E8]/60 text-sm tracking-wide font-light hover:text-[#C9A96E] transition-colors duration-300 aria-[current=page]:text-[#C9A96E]"
```

Legal links ("Mentions légales" / "Politique de confidentialité") — this exact `className` string also appears twice; use `replace_all`:

```tsx
// Before (2 occurrences — replace_all)
className="text-[#F5F0E8]/60 text-xs tracking-widest uppercase hover:text-[#C9A96E] transition-colors duration-300"

// After
className="inline-block p-2 -m-2 text-[#F5F0E8]/60 text-xs tracking-widest uppercase hover:text-[#C9A96E] transition-colors duration-300"
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Manual check**

On any page, scroll to the footer at 360-390px width:
- No horizontal overflow.
- Villes/Services columns stack (`flex-col md:flex-row`, unchanged by this task) and remain tappable.
- At ≥1024px, footer padding matches current production exactly.

- [ ] **Step 4: Commit**

```bash
git add components/layout/FooterSeo.tsx
git commit -m "fix(footer): responsive spacing and tap targets on mobile"
```

---

### Task 8: PricingSection.tsx

**Files:**
- Modify: `components/ui/PricingSection.tsx`
- Test: none

**Interfaces:**
- Consumes: N/A
- Produces: N/A

- [ ] **Step 1: Apply the 2 edits below**

```tsx
// Before
<section className="relative bg-[#0A0A0A] px-12 md:px-24 py-32 border-t border-[#F5F0E8]/10">

// After
<section className="relative bg-[#0A0A0A] px-6 sm:px-8 md:px-24 py-20 sm:py-24 md:py-32 border-t border-[#F5F0E8]/10">
```

```tsx
// Before
<h2 className="font-display text-[#F5F0E8] text-4xl md:text-5xl font-light mb-16 max-w-2xl">

// After
<h2 className="font-display text-[#F5F0E8] text-3xl sm:text-4xl md:text-5xl font-light mb-16 max-w-2xl">
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Manual check**

On any page that renders `PricingSection` (check with `grep -rl PricingSection app/`) at 360-390px width:
- Heading and the 4 pricing tiers (already `grid-cols-1 md:grid-cols-4`) render without horizontal overflow.
- At ≥1024px, matches current production exactly.

- [ ] **Step 4: Commit**

```bash
git add components/ui/PricingSection.tsx
git commit -m "fix(pricing): responsive spacing and heading scale on mobile"
```

---

### Task 9: FAQSection.tsx

**Files:**
- Modify: `components/ui/FAQSection.tsx`
- Test: none

**Interfaces:**
- Consumes: N/A
- Produces: N/A

- [ ] **Step 1: Apply the 2 edits below**

```tsx
// Before
<section className="relative bg-[#0A0A0A] px-12 md:px-24 py-32 border-t border-[#F5F0E8]/10">

// After
<section className="relative bg-[#0A0A0A] px-6 sm:px-8 md:px-24 py-20 sm:py-24 md:py-32 border-t border-[#F5F0E8]/10">
```

```tsx
// Before
<h2 className="font-display text-[#F5F0E8] text-4xl md:text-5xl font-light mb-16 max-w-2xl">

// After
<h2 className="font-display text-[#F5F0E8] text-3xl sm:text-4xl md:text-5xl font-light mb-16 max-w-2xl">
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Manual check**

On a page that renders `FAQSection` (e.g. `/vtc-montpellier`) at 360-390px width:
- Questions/answers list renders without horizontal overflow, readable line length.
- At ≥1024px, matches current production exactly.

- [ ] **Step 4: Commit**

```bash
git add components/ui/FAQSection.tsx
git commit -m "fix(faq): responsive spacing and heading scale on mobile"
```

---

### Task 10: SectionHighlights.tsx

**Files:**
- Modify: `components/ui/SectionHighlights.tsx`
- Test: none

**Interfaces:**
- Consumes: N/A
- Produces: N/A

- [ ] **Step 1: Apply the 3 edits below**

```tsx
// Before
<section id="highlights" className="relative bg-[#111111] px-12 md:px-24 py-32">
  <div className="absolute top-0 left-12 md:left-24 right-12 md:right-24 h-px bg-gradient-to-r from-transparent via-[#C9A96E]/30 to-transparent" />

// After
<section id="highlights" className="relative bg-[#111111] px-6 sm:px-8 md:px-24 py-20 sm:py-24 md:py-32">
  <div className="absolute top-0 left-6 sm:left-8 md:left-24 right-6 sm:right-8 md:right-24 h-px bg-gradient-to-r from-transparent via-[#C9A96E]/30 to-transparent" />
```

```tsx
// Before
<h2 className="font-display text-[#F5F0E8] text-5xl md:text-6xl font-light leading-tight">

// After
<h2 className="font-display text-[#F5F0E8] text-4xl sm:text-5xl md:text-6xl font-light leading-tight">
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Manual check**

On each of the 6 SEO landing pages (all render `SectionHighlights` with page-specific `title`/`intro`/`highlights` text) at 360-390px width:
- No horizontal overflow on any of the 6 variants — titles differ per page, so check all 6, not just one.
- At ≥1024px, matches current production exactly.

- [ ] **Step 4: Commit**

```bash
git add components/ui/SectionHighlights.tsx
git commit -m "fix(highlights): responsive spacing and heading scale on mobile"
```

---

### Task 11: app/layout.tsx — floating call CTA safe-area

**Files:**
- Modify: `app/layout.tsx`
- Test: none

**Interfaces:**
- Consumes: N/A
- Produces: N/A

- [ ] **Step 1: Apply the edit below**

The floating "Appeler" button uses a fixed `bottom-4` (16px), which can sit under the iOS home-indicator gesture bar on notched iPhones. Use `env(safe-area-inset-bottom)` so it respects the device's safe area, falling back to the current 16px on devices without a notch:

```tsx
// Before
<a
  href="tel:0783699229"
  className="md:hidden fixed bottom-4 right-4 z-[9990] flex items-center gap-2 bg-[#C9A96E] text-[#0A0A0A] px-5 py-3 rounded-full text-xs font-medium tracking-widest uppercase shadow-lg"
>
  Appeler
</a>

// After
<a
  href="tel:0783699229"
  className="md:hidden fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-[9990] flex items-center gap-2 bg-[#C9A96E] text-[#0A0A0A] px-5 py-3 rounded-full text-xs font-medium tracking-widest uppercase shadow-lg"
>
  Appeler
</a>
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Manual check**

On any page at a mobile width (<768px, since the button is `md:hidden`):
- Button is visible in the bottom-right corner, same visual offset as before on a browser without a simulated notch (Chrome DevTools device toolbar doesn't simulate `env()` — this is normal; the CSS fallback math means it looks identical to today when `safe-area-inset-bottom` is `0px`).
- At ≥768px width, button is hidden (unchanged `md:hidden` behavior).

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx
git commit -m "fix(layout): respect iOS safe-area-inset for floating call CTA"
```

---

### Task 12: Cross-page QA sweep

**Files:**
- None modified — verification only.

**Interfaces:**
- Consumes: the output of Tasks 1-11 (all 11 component/layout files).
- Produces: N/A — this task either confirms the work is done or produces a list of follow-up fixes.

- [ ] **Step 1: Full type-check**

Run: `npx tsc --noEmit`
Expected: no errors (this should already be true after every prior task, this is a final confirmation).

- [ ] **Step 2: Production-mode smoke build**

Run: `npm run build`
Expected: build succeeds with no errors (Tailwind class changes are compile-time; this catches any typo in a class name that `tsc` wouldn't).

- [ ] **Step 3: Start the dev server on the LAN**

Run: `npm run dev -- -H 0.0.0.0`
Note the "Network:" URL Next.js prints (e.g. `http://192.168.x.x:3000`).

- [ ] **Step 4: Manual walkthrough on a real phone**

Visit each of the 12 pages from a real phone on the same wifi, and for each one check the full list below (this is the checklist from `docs/superpowers/specs/2026-07-20-mobile-responsive-design.md` §5):

- `/`
- `/vtc-montpellier`
- `/vtc-nimes`
- `/transfert-aeroport-montpellier`
- `/vtc-mariage-gard`
- `/chauffeur-prive-professionnel-occitanie`
- `/longue-distance-occitanie`
- `/a-propos`
- `/mentions-legales`
- `/politique-de-confidentialite`

Per page:
- No horizontal scroll anywhere on the page (swipe sideways — the page must not move).
- Every heading with a hard-coded `<br/>` reads cleanly, no orphaned single word, no clipped text.
- The chat widget (`SceneContact`) is usable with the keyboard open.
- The floating "Appeler" button doesn't overlap the chat input or get clipped by the home-indicator area.
- `prefers-reduced-motion` behavior and desktop layout (resize to ≥1024px) are unchanged from before this plan — spot check at least the home page.

- [ ] **Step 5: Fix any issue found**

If Step 4 surfaces a concrete problem (e.g. one specific page's `SectionHighlights` title still wraps badly because its copy is unusually long), make a minimal, targeted follow-up edit to the specific component/class involved, re-run Steps 1-2, and re-check that one page on the phone. Repeat until the checklist in Step 4 passes on all 10 pages.

- [ ] **Step 6: Final commit (only if Step 5 produced changes)**

```bash
git add -A
git commit -m "fix(responsive): address issues found in mobile QA sweep"
```

If Step 5 found nothing to fix, there is nothing to commit — the plan is complete as of Task 11's commit.
