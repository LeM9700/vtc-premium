# SEO VTCLAND Occitanie — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construire un SEO complet en 3 phases pour VTCLAND — couche technique (metadata, JSON-LD, sitemap, robots), couche contenu (réécriture immersive avec géolocalisation), couche architecture (nouvelles pages par ville et service).

**Architecture:** Phase 1 ajoute les fondations techniques sans toucher aux composants. Phase 2 met à jour le contenu textuel des 6 scènes existantes. Phase 3 refactore SceneHero pour accepter des props, puis crée 6 nouvelles pages.

**Tech Stack:** Next.js 16.2.7 App Router, TypeScript, React 19, Tailwind CSS 4

---

## Fichiers créés / modifiés

| Fichier | Action | Phase |
|---|---|---|
| `.env.local` | Créer | 1 |
| `app/layout.tsx` | Modifier (metadata + import JsonLd) | 1 |
| `components/seo/JsonLd.tsx` | Créer | 1 |
| `app/sitemap.ts` | Créer | 1 |
| `app/robots.ts` | Créer | 1 |
| `components/scenes/SceneHero.tsx` | Modifier (textes + props Phase 3) | 2 & 3 |
| `components/scenes/SceneIdentity.tsx` | Modifier (textes) | 2 |
| `components/scenes/SceneVehicle.tsx` | Modifier (textes + specs) | 2 |
| `components/scenes/SceneServices.tsx` | Modifier (textes + descriptions) | 2 |
| `components/scenes/SceneSocialProof.tsx` | Modifier (textes + villes) | 2 |
| `components/scenes/SceneContact.tsx` | Modifier (textes) | 2 |
| `app/vtc-montpellier/page.tsx` | Créer | 3 |
| `app/vtc-nimes/page.tsx` | Créer | 3 |
| `app/transfert-aeroport-montpellier/page.tsx` | Créer | 3 |
| `app/vtc-mariage-gard/page.tsx` | Créer | 3 |
| `app/chauffeur-prive-professionnel-occitanie/page.tsx` | Créer | 3 |
| `app/longue-distance-occitanie/page.tsx` | Créer | 3 |

---

## PHASE 1 — SEO Technique

---

### Task 1 : Variable d'environnement

**Files:**
- Create: `.env.local`

- [ ] **Step 1 : Créer .env.local**

```
NEXT_PUBLIC_SITE_URL=https://vtcland.fr
```

> Note : remplace `https://vtcland.fr` par ton domaine réel si différent. Ce fichier ne doit pas être commité (il est dans `.gitignore` par défaut avec Next.js).

- [ ] **Step 2 : Vérifier que .gitignore couvre .env.local**

```bash
grep ".env.local" .gitignore
```

Attendu : une ligne contenant `.env.local`. Si absent, l'ajouter.

- [ ] **Step 3 : Commit**

```bash
git add .gitignore
git commit -m "chore: ensure .env.local is gitignored"
```

---

### Task 2 : Metadata complète dans app/layout.tsx

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1 : Remplacer le bloc metadata**

Ouvrir `app/layout.tsx`. Remplacer :

```typescript
export const metadata: Metadata = {
  title: 'Chauffeur Privé Premium | VTC',
  description: 'Service de transport de prestige. Réservation sur devis.',
}
```

Par :

```typescript
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vtcland.fr'),
  title: {
    default: 'VTCLAND — Chauffeur Privé Montpellier & Nîmes | Occitanie',
    template: '%s | VTCLAND Chauffeur Privé Occitanie',
  },
  description:
    "VTCLAND, chauffeur privé d'exception en Occitanie. Transferts aéroport Montpellier-Méditerranée et Nîmes-Camargue, VTC événementiel Gard & Hérault, longue distance. Disponible 24h/24.",
  keywords: [
    'VTC Montpellier',
    'chauffeur privé Nîmes',
    'VTC Occitanie',
    'transfert aéroport Montpellier Méditerranée',
    'chauffeur privé Gard',
    'VTC mariage Hérault',
    'VTCLAND',
    'chauffeur privé professionnel Occitanie',
  ],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'VTCLAND',
    title: 'VTCLAND — Chauffeur Privé Montpellier & Nîmes',
    description:
      "Votre chauffeur privé d'exception en Occitanie. Disponible 24h/24 dans le Gard et l'Hérault.",
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'VTCLAND Chauffeur Privé Occitanie',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VTCLAND — Chauffeur Privé Montpellier & Nîmes',
    description: "Votre chauffeur privé d'exception en Occitanie. Disponible 24h/24.",
    images: ['/og-image.jpg'],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
}
```

- [ ] **Step 2 : Vérifier le build TypeScript**

```bash
npx tsc --noEmit
```

Attendu : aucune erreur.

- [ ] **Step 3 : Commit**

```bash
git add app/layout.tsx
git commit -m "feat(seo): add complete metadata for VTCLAND Occitanie"
```

---

### Task 3 : Composant JSON-LD

**Files:**
- Create: `components/seo/JsonLd.tsx`

- [ ] **Step 1 : Créer le répertoire et le fichier**

Créer `components/seo/JsonLd.tsx` avec le contenu suivant.

> Ce composant est un **Server Component** — pas de `'use client'`. Il injecte directement le JSON-LD dans le HTML initial, ce qui est requis pour que Google le lise.

```typescript
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vtcland.fr'

const schema = {
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'TaxiService'],
  name: 'VTCLAND',
  description:
    "Chauffeur privé d'exception en Occitanie. Transferts aéroport Montpellier-Méditerranée et Nîmes-Camargue, VTC événementiel Gard & Hérault, longue distance. Disponible 24h/24.",
  url: SITE_URL,
  telephone: '+33XXXXXXXXX', // ← À REMPLACER par le numéro réel
  image: `${SITE_URL}/og-image.jpg`,
  priceRange: '€€€',
  areaServed: [
    { '@type': 'City', name: 'Montpellier' },
    { '@type': 'City', name: 'Nîmes' },
    { '@type': 'City', name: 'Avignon' },
    { '@type': 'AdministrativeArea', name: 'Gard' },
    { '@type': 'AdministrativeArea', name: 'Hérault' },
    { '@type': 'AdministrativeArea', name: 'Occitanie' },
  ],
  serviceType: [
    'Transfert aéroport',
    'Mise à disposition',
    'VTC événementiel',
    'Longue distance',
  ],
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    opens: '00:00',
    closes: '23:59',
    dayOfWeek: [
      'Monday', 'Tuesday', 'Wednesday', 'Thursday',
      'Friday', 'Saturday', 'Sunday',
    ],
  },
  sameAs: [
    'https://www.google.com/maps/place/VTCLAND', // ← À REMPLACER par l'URL réelle de ta fiche Google
  ],
}

export default function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

- [ ] **Step 2 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

Attendu : aucune erreur.

- [ ] **Step 3 : Commit**

```bash
git add components/seo/JsonLd.tsx
git commit -m "feat(seo): add JSON-LD LocalBusiness + TaxiService structured data"
```

---

### Task 4 : Importer JsonLd dans le layout

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1 : Ajouter l'import**

En haut de `app/layout.tsx`, après les imports existants, ajouter :

```typescript
import JsonLd from '@/components/seo/JsonLd'
```

- [ ] **Step 2 : Insérer le composant dans le body**

Dans `app/layout.tsx`, dans le `<body>`, ajouter `<JsonLd />` juste avant `<LoadingScreen />` :

```typescript
<body className="bg-[#0A0A0A] text-[#F5F0E8] overflow-x-hidden">
  <JsonLd />
  <LoadingScreen />
  <SmoothScroller>
    <CustomCursor />
    {children}
  </SmoothScroller>
</body>
```

- [ ] **Step 3 : Lancer le serveur dev et vérifier dans le navigateur**

```bash
npm run dev
```

Ouvrir `http://localhost:3000`, clic droit → "View Page Source" (pas Inspect). Chercher `application/ld+json`. Le JSON doit apparaître dans le HTML initial (pas injecté après coup par JS).

- [ ] **Step 4 : Commit**

```bash
git add app/layout.tsx
git commit -m "feat(seo): inject JSON-LD structured data in layout"
```

---

### Task 5 : Sitemap

**Files:**
- Create: `app/sitemap.ts`

- [ ] **Step 1 : Créer app/sitemap.ts**

```typescript
import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vtcland.fr'
  const now  = new Date()

  return [
    { url: base,                                              lastModified: now, changeFrequency: 'weekly',  priority: 1.0  },
    { url: `${base}/vtc-montpellier`,                         lastModified: now, changeFrequency: 'monthly', priority: 0.9  },
    { url: `${base}/vtc-nimes`,                               lastModified: now, changeFrequency: 'monthly', priority: 0.9  },
    { url: `${base}/transfert-aeroport-montpellier`,          lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${base}/vtc-mariage-gard`,                        lastModified: now, changeFrequency: 'monthly', priority: 0.8  },
    { url: `${base}/chauffeur-prive-professionnel-occitanie`, lastModified: now, changeFrequency: 'monthly', priority: 0.8  },
    { url: `${base}/longue-distance-occitanie`,               lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
  ]
}
```

- [ ] **Step 2 : Vérifier le rendu**

Avec le serveur dev actif, visiter `http://localhost:3000/sitemap.xml`.
Attendu : XML valide listant toutes les URLs ci-dessus.

- [ ] **Step 3 : Commit**

```bash
git add app/sitemap.ts
git commit -m "feat(seo): add dynamic sitemap.xml"
```

---

### Task 6 : Robots.txt

**Files:**
- Create: `app/robots.ts`

- [ ] **Step 1 : Créer app/robots.ts**

```typescript
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vtcland.fr'
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${base}/sitemap.xml`,
  }
}
```

- [ ] **Step 2 : Vérifier le rendu**

Visiter `http://localhost:3000/robots.txt`.
Attendu :
```
User-agent: *
Allow: /

Sitemap: https://vtcland.fr/sitemap.xml
```

- [ ] **Step 3 : Commit**

```bash
git add app/robots.ts
git commit -m "feat(seo): add robots.txt with sitemap pointer"
```

---

### Task 7 : Vérification Phase 1

- [ ] **Step 1 : Build de production**

```bash
npm run build
```

Attendu : build sans erreur. Note: les warnings sur les pages Phase 3 (non encore créées) n'existent pas encore — toutes les routes pointées dans le sitemap seront créées en Phase 3.

- [ ] **Step 2 : Valider les meta tags dans le HTML**

Lancer `npm run dev`, visiter `http://localhost:3000`, view source. Vérifier la présence de :
- `<title>VTCLAND — Chauffeur Privé Montpellier &amp; Nîmes | Occitanie</title>`
- `<meta name="description" content="VTCLAND, chauffeur privé...`
- `<meta property="og:title"...`
- `<meta name="twitter:card" content="summary_large_image"...`
- `<script type="application/ld+json">`

---

## PHASE 2 — Content SEO : Réécriture Immersive

---

### Task 8 : SceneHero — Textes géolocalisés

**Files:**
- Modify: `components/scenes/SceneHero.tsx`

- [ ] **Step 1 : Mettre à jour le sous-titre**

Dans `SceneHero.tsx`, trouver le `<p ref={subtitleRef}>` (ligne ~169). Remplacer :

```typescript
<p
  ref={subtitleRef}
  className="text-[#F5F0E8]/70 text-lg md:text-xl font-light tracking-widest uppercase mb-10 max-w-md"
>
  Chauffeur privé — sur devis
</p>
```

Par :

```typescript
<p
  ref={subtitleRef}
  className="text-[#F5F0E8]/70 text-lg md:text-xl font-light tracking-widest uppercase mb-10 max-w-md"
>
  Chauffeur privé · Montpellier · Nîmes · Occitanie
</p>
```

- [ ] **Step 2 : Mettre à jour le badge top-right**

Trouver le `<div className="absolute top-8 right-12 z-30 text-right">` (ligne ~206). Remplacer :

```typescript
<p className="text-[#F5F0E8]/30 text-xs tracking-[0.3em] uppercase">
  Disponible 24h/24
</p>
```

Par :

```typescript
<p className="text-[#F5F0E8]/30 text-xs tracking-[0.3em] uppercase">
  Disponible 24h/24 en Occitanie
</p>
```

- [ ] **Step 3 : Vérifier visuellement**

`npm run dev` → `http://localhost:3000`. Le sous-titre doit afficher `"Chauffeur privé · Montpellier · Nîmes · Occitanie"`.

- [ ] **Step 4 : Commit**

```bash
git add components/scenes/SceneHero.tsx
git commit -m "feat(seo): add geo-keywords to Hero subtitle and badge"
```

---

### Task 9 : SceneIdentity — Labels et stats géolocalisés

**Files:**
- Modify: `components/scenes/SceneIdentity.tsx`

- [ ] **Step 1 : Mettre à jour le label chip**

Dans `SceneIdentity.tsx`, trouver le `<span>` du label (ligne ~113). Remplacer :

```typescript
<span className="text-[#C9A96E] text-xs tracking-[0.5em] uppercase font-light">
  Notre engagement
</span>
```

Par :

```typescript
<span className="text-[#C9A96E] text-xs tracking-[0.5em] uppercase font-light">
  VTCLAND · Au service de l&apos;Occitanie
</span>
```

- [ ] **Step 2 : Mettre à jour les labels des stats**

Dans le tableau `STATS` en bas du fichier, remplacer par :

```typescript
const STATS = [
  { value: 10,  suffix: '+', label: 'Années en Occitanie'        },
  { value: 98,  suffix: '%', label: 'Clients satisfaits'          },
  { value: 500, suffix: '+', label: 'Trajets Gard & Hérault'     },
  { value: 24,  suffix: 'h', label: 'Disponibilité'               },
] as const
```

- [ ] **Step 3 : Commit**

```bash
git add components/scenes/SceneIdentity.tsx
git commit -m "feat(seo): inject Occitanie keywords in Identity scene labels"
```

---

### Task 10 : SceneVehicle — Label et specs

**Files:**
- Modify: `components/scenes/SceneVehicle.tsx`

- [ ] **Step 1 : Mettre à jour le label chip**

Dans `SceneVehicle.tsx`, trouver le `<span>` du label (ligne ~154). Remplacer :

```typescript
<span className="text-[#C9A96E] text-xs tracking-[0.5em] uppercase">
  Le véhicule
</span>
```

Par :

```typescript
<span className="text-[#C9A96E] text-xs tracking-[0.5em] uppercase">
  Le véhicule · Montpellier & Nîmes
</span>
```

- [ ] **Step 2 : Enrichir les specs avec le nom du véhicule**

Remplacer le tableau `SPECS` en bas du fichier par :

```typescript
const SPECS = [
  { value: 'Mercedes Classe E / S',    label: 'Véhicule'      },
  { value: '4 passagers',              label: 'Capacité'      },
  { value: 'Climatisation bi-zone',    label: 'Confort'       },
  { value: 'WiFi & chargeurs USB-C',   label: 'Connectivité'  },
] as const
```

> Note : si tu n'utilises pas de Mercedes, remplace par le modèle exact de ta flotte.

- [ ] **Step 3 : Commit**

```bash
git add components/scenes/SceneVehicle.tsx
git commit -m "feat(seo): add vehicle name and geo-keywords in Vehicle scene"
```

---

### Task 11 : SceneServices — Descriptions géolocalisées

**Files:**
- Modify: `components/scenes/SceneServices.tsx`

- [ ] **Step 1 : Mettre à jour le label chip**

Dans `SceneServices.tsx`, trouver le `<span>` du label chip (ligne ~102). Remplacer :

```typescript
<span className="text-[#C9A96E] text-xs tracking-[0.5em] uppercase font-light">
  Nos prestations
</span>
```

Par :

```typescript
<span className="text-[#C9A96E] text-xs tracking-[0.5em] uppercase font-light">
  Nos prestations · Gard & Hérault
</span>
```

- [ ] **Step 2 : Remplacer le tableau SERVICES**

En bas du fichier, remplacer le tableau `SERVICES` par :

```typescript
const SERVICES = [
  {
    Icon: IconAirport,
    title: 'Transferts aéroport & gare',
    description:
      "Prise en charge ponctuelle depuis ou vers l'Aéroport Montpellier-Méditerranée et Nîmes-Camargue. Suivi des vols en temps réel, accueil personnalisé. Votre chauffeur vous attend, quoi qu'il arrive.",
  },
  {
    Icon: IconCar,
    title: 'Mise à disposition',
    description:
      'Demi-journée ou journée complète à Montpellier, Nîmes et en Occitanie — votre chauffeur reste à votre disposition. Idéal pour les déplacements professionnels ou personnels multiples dans le Gard et l\'Hérault.',
  },
  {
    Icon: IconEvent,
    title: 'Événements & occasions',
    description:
      "Mariages dans le Gard et l'Hérault, soirées de prestige, séminaires d'entreprise en Occitanie. Nous assurons votre transport avec l'élégance que l'événement mérite.",
  },
  {
    Icon: IconRoute,
    title: 'Longue distance',
    description:
      'Montpellier, Nîmes, Avignon, Marseille, Lyon, Monaco, Genève, Paris — aucune destination n\'est trop lointaine. Voyagez confortablement sans contrainte de correspondance.',
  },
] as const
```

- [ ] **Step 3 : Commit**

```bash
git add components/scenes/SceneServices.tsx
git commit -m "feat(seo): inject city and airport names in Services descriptions"
```

---

### Task 12 : SceneSocialProof — Villes sur les témoignages

**Files:**
- Modify: `components/scenes/SceneSocialProof.tsx`

- [ ] **Step 1 : Mettre à jour le label chip**

Dans `SceneSocialProof.tsx`, trouver le `<span>` du label chip (ligne ~95). Remplacer :

```typescript
<span className="text-[#C9A96E] text-xs tracking-[0.5em] uppercase font-light">
  Ils nous font confiance
</span>
```

Par :

```typescript
<span className="text-[#C9A96E] text-xs tracking-[0.5em] uppercase font-light">
  Ils nous font confiance · Gard & Hérault
</span>
```

- [ ] **Step 2 : Mettre à jour le type et le tableau TESTIMONIALS**

En bas du fichier, remplacer la définition du tableau `TESTIMONIALS` par :

```typescript
const TESTIMONIALS = [
  {
    quote: "Ponctuel, discret, d'une élégance rare. Notre transfert depuis l'aéroport de Montpellier s'est transformé en véritable moment de sérénité.",
    author: 'Sophie M.',
    role: 'Directrice commerciale',
    city: 'Montpellier',
  },
  {
    quote: "Nous faisons appel à ce service pour tous nos séminaires depuis deux ans. Fiabilité et professionnalisme à chaque trajet entre Nîmes et Paris.",
    author: 'Laurent D.',
    role: 'Responsable RH — Groupe Meridia',
    city: 'Nîmes',
  },
  {
    quote: "Le jour de notre mariage dans le Gard, tout était parfait. Le véhicule, l'attitude, les petites attentions. Un souvenir inoubliable.",
    author: 'Camille & Thomas R.',
    role: 'Particuliers',
    city: 'Uzès, Gard',
  },
] as const
```

- [ ] **Step 3 : Afficher la ville dans le JSX**

Dans le JSX des témoignages, trouver le bloc qui affiche `t.author` et `t.role` (lignes ~128–134). Remplacer :

```typescript
<div className="flex flex-col gap-1">
  <span className="text-[#F5F0E8] text-sm tracking-wide">
    {t.author}
  </span>
  <span className="text-[#F5F0E8]/30 text-xs tracking-widest uppercase">
    {t.role}
  </span>
</div>
```

Par :

```typescript
<div className="flex flex-col gap-1">
  <span className="text-[#F5F0E8] text-sm tracking-wide">
    {t.author}
  </span>
  <span className="text-[#F5F0E8]/30 text-xs tracking-widest uppercase">
    {t.role}
  </span>
  <span className="text-[#C9A96E]/50 text-xs tracking-[0.3em] uppercase">
    {t.city}
  </span>
</div>
```

- [ ] **Step 4 : Commit**

```bash
git add components/scenes/SceneSocialProof.tsx
git commit -m "feat(seo): add city geo-anchors to testimonials"
```

---

### Task 13 : SceneContact — Textes géolocalisés

**Files:**
- Modify: `components/scenes/SceneContact.tsx`

- [ ] **Step 1 : Mettre à jour le label chip**

Dans `SceneContact.tsx`, trouver le `<span>` du label chip (ligne ~256). Remplacer :

```typescript
<span className="text-[#C9A96E] text-xs tracking-[0.5em] uppercase font-light">
  Votre devis
</span>
```

Par :

```typescript
<span className="text-[#C9A96E] text-xs tracking-[0.5em] uppercase font-light">
  Votre devis · 24h/24 en Occitanie
</span>
```

- [ ] **Step 2 : Mettre à jour le h2**

Trouver le `<h2 ref={titleRef}>` (ligne ~260). Remplacer :

```typescript
<h2
  ref={titleRef}
  className="font-display text-[#F5F0E8] text-5xl md:text-7xl font-light leading-tight max-w-2xl"
>
  Parlons de<br />
  <em className="text-[#C9A96E] not-italic">votre trajet</em>
</h2>
```

Par :

```typescript
<h2
  ref={titleRef}
  className="font-display text-[#F5F0E8] text-5xl md:text-7xl font-light leading-tight max-w-2xl"
>
  Parlons de<br />
  <em className="text-[#C9A96E] not-italic">votre trajet</em>
  <span className="block text-2xl md:text-3xl text-[#F5F0E8]/30 font-light mt-3 tracking-widest uppercase not-italic" style={{ fontFamily: 'var(--font-dm-sans)' }}>
    Montpellier · Nîmes · Occitanie
  </span>
</h2>
```

- [ ] **Step 3 : Vérifier le rendu**

`npm run dev` → scroller jusqu'au bas de la page. La section contact doit afficher `"Montpellier · Nîmes · Occitanie"` sous le titre.

- [ ] **Step 4 : Commit**

```bash
git add components/scenes/SceneContact.tsx
git commit -m "feat(seo): add geo-keywords to Contact section"
```

---

### Task 14 : Vérification Phase 2

- [ ] **Step 1 : Inspecter les mots-clés dans le HTML source**

Visiter `http://localhost:3000`, view source (Ctrl+U), chercher :
- `Montpellier` → doit apparaître plusieurs fois
- `Nîmes` → doit apparaître plusieurs fois
- `Occitanie` → doit apparaître
- `Gard` → doit apparaître
- `Hérault` → doit apparaître
- `Méditerranée` → doit apparaître (dans la description de l'aéroport)

- [ ] **Step 2 : Vérification visuelle des animations**

Scroller toute la page. Vérifier que les nouvelles phrases n'ont pas cassé les animations GSAP (reveal, stagger, split-text).

---

## PHASE 3 — Architecture : Nouvelles Pages

---

### Task 15 : Refactorer SceneHero pour accepter des props

**Files:**
- Modify: `components/scenes/SceneHero.tsx`

- [ ] **Step 1 : Ajouter l'import ReactNode et définir l'interface props**

En haut du fichier `components/scenes/SceneHero.tsx`, après `import { useEffect, useRef } from 'react'`, ajouter :

```typescript
import type { ReactNode } from 'react'

interface SceneHeroProps {
  title?:    ReactNode
  subtitle?: string
  ctaLabel?: string
}
```

- [ ] **Step 2 : Mettre à jour la signature de la fonction**

Remplacer :

```typescript
export default function SceneHero() {
```

Par :

```typescript
export default function SceneHero({
  title    = <>Chaque trajet<br /><span className="text-[#C9A96E] italic">est une promesse.</span></>,
  subtitle = 'Chauffeur privé · Montpellier · Nîmes · Occitanie',
  ctaLabel = 'Demander un devis',
}: SceneHeroProps = {}) {
```

- [ ] **Step 3 : Utiliser les props dans le JSX**

Remplacer le contenu codé en dur du `<h1>` :

```typescript
<h1
  ref={titleRef}
  className="font-display text-[#F5F0E8] text-6xl md:text-8xl xl:text-[9rem] font-light leading-none tracking-tight mb-6"
  style={{ perspective: '800px' }}
>
  Chaque trajet<br />
  <span className="text-[#C9A96E] italic">est une promesse.</span>
</h1>
```

Par :

```typescript
<h1
  ref={titleRef}
  className="font-display text-[#F5F0E8] text-6xl md:text-8xl xl:text-[9rem] font-light leading-none tracking-tight mb-6"
  style={{ perspective: '800px' }}
>
  {title}
</h1>
```

Remplacer le sous-titre codé en dur :

```typescript
<p
  ref={subtitleRef}
  className="text-[#F5F0E8]/70 text-lg md:text-xl font-light tracking-widest uppercase mb-10 max-w-md"
>
  Chauffeur privé · Montpellier · Nîmes · Occitanie
</p>
```

Par :

```typescript
<p
  ref={subtitleRef}
  className="text-[#F5F0E8]/70 text-lg md:text-xl font-light tracking-widest uppercase mb-10 max-w-md"
>
  {subtitle}
</p>
```

Remplacer le texte du CTA :

```typescript
<span className="relative">Demander un devis</span>
```

Par :

```typescript
<span className="relative">{ctaLabel}</span>
```

- [ ] **Step 4 : Vérifier que la homepage est inchangée**

`npm run dev` → `http://localhost:3000`. Le Hero doit afficher exactement les mêmes textes qu'avant.

- [ ] **Step 5 : Commit**

```bash
git add components/scenes/SceneHero.tsx
git commit -m "refactor(hero): accept optional title/subtitle/ctaLabel props"
```

---

### Task 16 : Page VTC Montpellier

**Files:**
- Create: `app/vtc-montpellier/page.tsx`

- [ ] **Step 1 : Créer la page**

```typescript
import type { Metadata } from 'next'
import SceneHero      from '@/components/scenes/SceneHero'
import SceneServices  from '@/components/scenes/SceneServices'
import SceneContact   from '@/components/scenes/SceneContact'

export const metadata: Metadata = {
  title: 'VTC Montpellier | Chauffeur Privé Hérault',
  description:
    "VTCLAND, votre chauffeur privé à Montpellier. Transferts Aéroport Montpellier-Méditerranée, mise à disposition en Hérault, VTC événementiel. Devis immédiat, disponible 24h/24.",
  alternates: { canonical: '/vtc-montpellier' },
  openGraph: {
    title: 'VTC Montpellier | Chauffeur Privé Hérault — VTCLAND',
    description:
      "Votre chauffeur privé à Montpellier. Aéroport, événements, longue distance. Disponible 24h/24 en Hérault.",
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'VTC Montpellier VTCLAND' }],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TaxiService',
  name: 'VTCLAND — VTC Montpellier',
  description: "Chauffeur privé à Montpellier et en Hérault. Disponible 24h/24.",
  url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vtcland.fr'}/vtc-montpellier`,
  serviceArea: { '@type': 'City', name: 'Montpellier' },
  areaServed:  { '@type': 'AdministrativeArea', name: 'Hérault' },
}

export default function VtcMontpellier() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SceneHero
        title={
          <>
            VTC Montpellier<br />
            <span className="text-[#C9A96E] italic">à votre service.</span>
          </>
        }
        subtitle="Chauffeur privé · Hérault · Occitanie"
        ctaLabel="Réserver à Montpellier"
      />
      <SceneServices />
      <SceneContact />
    </main>
  )
}
```

- [ ] **Step 2 : Vérifier la page**

`npm run dev` → `http://localhost:3000/vtc-montpellier`. La page doit s'afficher avec le h1 "VTC Montpellier / à votre service."

- [ ] **Step 3 : Commit**

```bash
git add app/vtc-montpellier/page.tsx
git commit -m "feat(seo): add /vtc-montpellier landing page"
```

---

### Task 17 : Page VTC Nîmes

**Files:**
- Create: `app/vtc-nimes/page.tsx`

- [ ] **Step 1 : Créer la page**

```typescript
import type { Metadata } from 'next'
import SceneHero     from '@/components/scenes/SceneHero'
import SceneServices from '@/components/scenes/SceneServices'
import SceneContact  from '@/components/scenes/SceneContact'

export const metadata: Metadata = {
  title: 'VTC Nîmes | Chauffeur Privé Gard',
  description:
    "VTCLAND, votre chauffeur privé à Nîmes. Transferts Aéroport Nîmes-Camargue, mise à disposition dans le Gard, VTC événementiel (arènes, férias, mariages). Devis immédiat, disponible 24h/24.",
  alternates: { canonical: '/vtc-nimes' },
  openGraph: {
    title: 'VTC Nîmes | Chauffeur Privé Gard — VTCLAND',
    description:
      "Votre chauffeur privé à Nîmes. Aéroport Nîmes-Camargue, arènes, événements. Disponible 24h/24 dans le Gard.",
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'VTC Nîmes VTCLAND' }],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TaxiService',
  name: 'VTCLAND — VTC Nîmes',
  description: "Chauffeur privé à Nîmes et dans le Gard. Disponible 24h/24.",
  url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vtcland.fr'}/vtc-nimes`,
  serviceArea: { '@type': 'City', name: 'Nîmes' },
  areaServed:  { '@type': 'AdministrativeArea', name: 'Gard' },
}

export default function VtcNimes() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SceneHero
        title={
          <>
            VTC Nîmes<br />
            <span className="text-[#C9A96E] italic">excellence & ponctualité.</span>
          </>
        }
        subtitle="Chauffeur privé · Gard · Occitanie"
        ctaLabel="Réserver à Nîmes"
      />
      <SceneServices />
      <SceneContact />
    </main>
  )
}
```

- [ ] **Step 2 : Vérifier**

`http://localhost:3000/vtc-nimes` → h1 "VTC Nîmes / excellence & ponctualité."

- [ ] **Step 3 : Commit**

```bash
git add app/vtc-nimes/page.tsx
git commit -m "feat(seo): add /vtc-nimes landing page"
```

---

### Task 18 : Page Transfert Aéroport Montpellier

**Files:**
- Create: `app/transfert-aeroport-montpellier/page.tsx`

- [ ] **Step 1 : Créer la page**

```typescript
import type { Metadata } from 'next'
import SceneHero    from '@/components/scenes/SceneHero'
import SceneContact from '@/components/scenes/SceneContact'

export const metadata: Metadata = {
  title: 'Transfert Aéroport Montpellier-Méditerranée',
  description:
    "Navette et transfert VTC depuis l'Aéroport Montpellier-Méditerranée. VTCLAND assure votre prise en charge avec suivi des vols en temps réel. Réservation 24h/24.",
  alternates: { canonical: '/transfert-aeroport-montpellier' },
  openGraph: {
    title: 'Transfert Aéroport Montpellier-Méditerranée — VTCLAND',
    description:
      "Chauffeur privé pour l'Aéroport Montpellier-Méditerranée. Suivi de vol, accueil personnalisé, disponible 24h/24.",
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Transfert aéroport Montpellier VTCLAND' }],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TaxiService',
  name: "VTCLAND — Transfert Aéroport Montpellier",
  description: "Service de transfert VTC depuis et vers l'Aéroport Montpellier-Méditerranée.",
  url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vtcland.fr'}/transfert-aeroport-montpellier`,
  serviceType: 'Transfert aéroport',
  serviceArea: { '@type': 'City', name: 'Montpellier' },
}

export default function TransfertAeroportMontpellier() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SceneHero
        title={
          <>
            Aéroport Montpellier<br />
            <span className="text-[#C9A96E] italic">sans l&apos;imprévu.</span>
          </>
        }
        subtitle="Transfert · Méditerranée · Vol suivi en temps réel"
        ctaLabel="Réserver mon transfert"
      />
      <SceneContact />
    </main>
  )
}
```

- [ ] **Step 2 : Commit**

```bash
git add app/transfert-aeroport-montpellier/page.tsx
git commit -m "feat(seo): add /transfert-aeroport-montpellier landing page"
```

---

### Task 19 : Page VTC Mariage Gard

**Files:**
- Create: `app/vtc-mariage-gard/page.tsx`

- [ ] **Step 1 : Créer la page**

```typescript
import type { Metadata } from 'next'
import SceneHero    from '@/components/scenes/SceneHero'
import SceneContact from '@/components/scenes/SceneContact'

export const metadata: Metadata = {
  title: 'VTC Mariage Gard & Hérault | Chauffeur Événementiel',
  description:
    "Chauffeur privé pour votre mariage dans le Gard et l'Hérault. VTCLAND assure votre transport avec élégance. Mas provençaux, domaines viticoles, châteaux — disponible sur devis.",
  alternates: { canonical: '/vtc-mariage-gard' },
  openGraph: {
    title: 'VTC Mariage Gard & Hérault — VTCLAND',
    description:
      "Votre chauffeur privé pour un mariage d'exception dans le Gard et l'Hérault. Élégance et ponctualité garanties.",
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'VTC mariage Gard Hérault VTCLAND' }],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TaxiService',
  name: "VTCLAND — VTC Mariage Gard & Hérault",
  description: "Service de transport haut de gamme pour les mariages dans le Gard et l'Hérault.",
  url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vtcland.fr'}/vtc-mariage-gard`,
  serviceType: 'Transport événementiel mariage',
  areaServed: [
    { '@type': 'AdministrativeArea', name: 'Gard' },
    { '@type': 'AdministrativeArea', name: 'Hérault' },
  ],
}

export default function VtcMariageGard() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SceneHero
        title={
          <>
            Votre mariage,<br />
            <span className="text-[#C9A96E] italic">notre honneur.</span>
          </>
        }
        subtitle="Chauffeur événementiel · Gard & Hérault · Sur devis"
        ctaLabel="Devis mariage"
      />
      <SceneContact />
    </main>
  )
}
```

- [ ] **Step 2 : Commit**

```bash
git add app/vtc-mariage-gard/page.tsx
git commit -m "feat(seo): add /vtc-mariage-gard landing page"
```

---

### Task 20 : Page Chauffeur Professionnel Occitanie

**Files:**
- Create: `app/chauffeur-prive-professionnel-occitanie/page.tsx`

- [ ] **Step 1 : Créer la page**

```typescript
import type { Metadata } from 'next'
import SceneHero    from '@/components/scenes/SceneHero'
import SceneContact from '@/components/scenes/SceneContact'

export const metadata: Metadata = {
  title: 'Chauffeur Privé Professionnel Occitanie',
  description:
    "VTCLAND, partenaire transport des entreprises en Occitanie. Mise à disposition, transferts gare et aéroport, séminaires. Facturation entreprise, discrétion garantie.",
  alternates: { canonical: '/chauffeur-prive-professionnel-occitanie' },
  openGraph: {
    title: 'Chauffeur Privé Professionnel Occitanie — VTCLAND',
    description:
      "Transport d'affaires haut de gamme en Occitanie. Mise à disposition, aéroport, séminaires. Facturation entreprise.",
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Chauffeur professionnel Occitanie VTCLAND' }],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TaxiService',
  name: "VTCLAND — Chauffeur Professionnel Occitanie",
  description: "Transport d'affaires et mise à disposition pour les professionnels en Occitanie.",
  url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vtcland.fr'}/chauffeur-prive-professionnel-occitanie`,
  serviceType: "Transport professionnel",
  areaServed: { '@type': 'AdministrativeArea', name: 'Occitanie' },
}

export default function ChauffeurProOccitanie() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SceneHero
        title={
          <>
            Transport<br />
            <span className="text-[#C9A96E] italic">d&apos;affaires, sans compromis.</span>
          </>
        }
        subtitle="Chauffeur professionnel · Occitanie · Facturation entreprise"
        ctaLabel="Devis entreprise"
      />
      <SceneContact />
    </main>
  )
}
```

- [ ] **Step 2 : Commit**

```bash
git add "app/chauffeur-prive-professionnel-occitanie/page.tsx"
git commit -m "feat(seo): add /chauffeur-prive-professionnel-occitanie landing page"
```

---

### Task 21 : Page Longue Distance Occitanie

**Files:**
- Create: `app/longue-distance-occitanie/page.tsx`

- [ ] **Step 1 : Créer la page**

```typescript
import type { Metadata } from 'next'
import SceneHero    from '@/components/scenes/SceneHero'
import SceneContact from '@/components/scenes/SceneContact'

export const metadata: Metadata = {
  title: 'VTC Longue Distance Occitanie | Paris, Lyon, Monaco',
  description:
    "VTCLAND assure vos trajets longue distance depuis Montpellier et Nîmes. Paris, Lyon, Avignon, Marseille, Monaco, Genève — voyagez sans contrainte de correspondance.",
  alternates: { canonical: '/longue-distance-occitanie' },
  openGraph: {
    title: 'VTC Longue Distance Occitanie — Paris, Lyon, Monaco — VTCLAND',
    description:
      "Trajets longue distance depuis Montpellier et Nîmes. Paris, Lyon, Monaco, Genève. Confort et ponctualité garantis.",
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'VTC longue distance Occitanie VTCLAND' }],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TaxiService',
  name: "VTCLAND — Longue Distance Occitanie",
  description: "Trajets longue distance depuis Montpellier et Nîmes vers Paris, Lyon, Monaco et toute la France.",
  url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vtcland.fr'}/longue-distance-occitanie`,
  serviceType: "Transport longue distance",
  areaServed: [
    { '@type': 'AdministrativeArea', name: 'Occitanie' },
    { '@type': 'Country', name: 'France' },
  ],
}

export default function LongueDistanceOccitanie() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SceneHero
        title={
          <>
            Toutes destinations,<br />
            <span className="text-[#C9A96E] italic">un seul chauffeur.</span>
          </>
        }
        subtitle="Longue distance · Paris · Lyon · Monaco · Genève"
        ctaLabel="Planifier mon trajet"
      />
      <SceneContact />
    </main>
  )
}
```

- [ ] **Step 2 : Commit**

```bash
git add app/longue-distance-occitanie/page.tsx
git commit -m "feat(seo): add /longue-distance-occitanie landing page"
```

---

### Task 22 : Build final et vérification complète

- [ ] **Step 1 : Build de production**

```bash
npm run build
```

Attendu : `✓ Compiled successfully`. Toutes les 7 routes (1 homepage + 6 nouvelles) doivent apparaître dans la liste des pages générées.

- [ ] **Step 2 : Démarrer en mode production et tester chaque URL**

```bash
npm run start
```

Visiter et vérifier chaque page :
- `http://localhost:3000` — Hero "Chaque trajet est une promesse"
- `http://localhost:3000/vtc-montpellier` — Hero "VTC Montpellier / à votre service"
- `http://localhost:3000/vtc-nimes` — Hero "VTC Nîmes / excellence & ponctualité"
- `http://localhost:3000/transfert-aeroport-montpellier` — Hero "Aéroport Montpellier / sans l'imprévu"
- `http://localhost:3000/vtc-mariage-gard` — Hero "Votre mariage, notre honneur"
- `http://localhost:3000/chauffeur-prive-professionnel-occitanie` — Hero "Transport d'affaires, sans compromis"
- `http://localhost:3000/longue-distance-occitanie` — Hero "Toutes destinations, un seul chauffeur"
- `http://localhost:3000/sitemap.xml` — XML listant les 7 URLs
- `http://localhost:3000/robots.txt` — Contient `Sitemap:`

- [ ] **Step 3 : Valider le JSON-LD global**

Sur la homepage, view source → copier le JSON dans `<script type="application/ld+json">` → le coller dans [Google Rich Results Test](https://search.google.com/test/rich-results). Attendu : "LocalBusiness" et "TaxiService" détectés.

- [ ] **Step 4 : Valider les OG tags**

Copier l'URL de production (ou `http://localhost:3000`) dans [Open Graph Debugger](https://developers.facebook.com/tools/debug/). Attendu : titre, description et image s'affichent correctement.

- [ ] **Step 5 : Commit final**

```bash
git add .
git commit -m "feat(seo): complete Phase 3 - all landing pages created and verified"
```

---

## Prérequis utilisateur (hors code)

Avant de déployer, l'utilisateur doit :

1. **Renseigner le numéro de téléphone** dans `components/seo/JsonLd.tsx` (remplacer `+33XXXXXXXXX`)
2. **Renseigner l'URL Google Business** dans `components/seo/JsonLd.tsx` (remplacer l'URL placeholder)
3. **Créer `public/og-image.jpg`** — visuel 1200×630 (capture hero stylisée ou visuel de marque)
4. **Confirmer le domaine** dans `.env.local` (`NEXT_PUBLIC_SITE_URL=https://[domaine réel]`)
5. **Après déploiement** : soumettre le sitemap dans Google Search Console

---

## Vérification post-déploiement

```
Google Search Console → Sitemaps → Ajouter https://vtcland.fr/sitemap.xml
Google Rich Results Test → https://vtcland.fr
Open Graph Debugger → https://vtcland.fr
Chrome view source → confirmer JSON-LD dans le HTML initial (pas injecté JS)
```
