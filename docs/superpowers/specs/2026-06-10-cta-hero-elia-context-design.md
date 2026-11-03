# CTA Hero → Élia contextualisée — Design

**Contexte :** Sur les 6 pages annexes (`/vtc-nimes`, `/vtc-montpellier`, `/transfert-aeroport-montpellier`,
`/vtc-mariage-gard`, `/chauffeur-prive-professionnel-occitanie`, `/longue-distance-occitanie`) ainsi que sur la
home, le bouton CTA du hero (ex: "Devis mariage", "Réserver à Nîmes") n'a aucun comportement — c'est un `<button>`
purement décoratif. Le lien "Découvrir →" pointe vers `#services`, qui n'existe que sur 2 des 6 pages annexes
(vtc-montpellier, vtc-nimes) et est donc cassé sur les 4 autres.

Chaque page dispose déjà d'une section `SceneContact` (`id="contact"`) contenant le chat IA "Élia", qui collecte
les infos de devis et calcule le prix.

**Objectif :** Câbler le CTA hero pour qu'il scrolle vers `#contact` et que le premier message d'Élia (et son
comportement) soit contextualisé selon le service de la page. Corriger au passage le lien "Découvrir →".

Ce chantier est volontairement scopé au câblage (pas de nouveau contenu visuel/sections — ça fait l'objet d'un
chantier B séparé : FAQ, zones desservies, tarifs indicatifs, galerie).

---

## 1. Mécanique de scroll (Lenis singleton)

Le site utilise Lenis (smooth scroll) via `SmoothScroller` (monté dans `app/layout.tsx`, persiste entre
navigations client). L'instance Lenis n'est aujourd'hui accessible que localement dans `SmoothScroller`.

- **Nouveau fichier `lib/lenis.ts`** : singleton typé exposant une référence mutable vers l'instance Lenis active.

```typescript
import type Lenis from 'lenis'

export const lenisRef: { current: Lenis | null } = { current: null }
```

- **`SmoothScroller`** : au montage, assigne `lenisRef.current = lenis` ; au démontage, `lenisRef.current = null`.

- **`SceneHero`** :
  - Le bouton CTA reçoit un `onClick` : `lenisRef.current?.scrollTo('#contact', { offset: -40 })`.
  - Le lien "Découvrir →" passe de `<a href={discoverHref}>` (navigation native) à un `onClick` avec
    `e.preventDefault()` puis `lenisRef.current?.scrollTo(discoverHref, { offset: -40 })`. Garde `href={discoverHref}`
    pour l'accessibilité/fallback sans JS.
  - Nouvelle prop `discoverHref?: string` (défaut `'#services'` — comportement home inchangé).

- **`SectionHighlights`** : la `<section>` racine reçoit `id="highlights"`.

L'offset `-40` évite que le titre "Parlons de votre trajet" colle au bord supérieur de l'écran après le scroll.

---

## 2. Contextualisation du chat Élia (`SceneContact`)

Deux nouvelles props optionnelles, sans valeur par défaut → comportement home inchangé :

```typescript
interface SceneContactProps {
  greeting?:    string  // remplace le 1er message assistant affiché
  contextNote?: string  // contexte additionnel injecté dans le system prompt
}
```

- `greeting` remplace la valeur initiale de `messages[0].content` (actuellement
  `"Bonsoir. Je suis Élia, votre assistante de réservation. Pour quel type de trajet puis-je vous préparer un devis ?"`).
- `SYSTEM_PROMPT` (constante actuelle) devient `buildSystemPrompt(contextNote?: string)` : si `contextNote` est
  fourni, un bloc est inséré avant les "RÈGLES ABSOLUES" :

```
CONTEXTE :
${contextNote}
```

`callClaude` appelle `buildSystemPrompt(contextNote)` au lieu d'utiliser la constante directement.

---

## 3. Contenu par page

| Page | `greeting` | `contextNote` | `discoverHref` |
|---|---|---|---|
| `/vtc-nimes` | "Bonsoir. Je suis Élia, votre assistante de réservation pour Nîmes et le Gard. Pour quel type de trajet puis-je vous préparer un devis ?" | "Le client navigue depuis la page VTC Nîmes (Gard). S'il ne précise pas de ville, suppose Nîmes par défaut." | `#highlights` |
| `/vtc-montpellier` | "Bonsoir. Je suis Élia, votre assistante de réservation pour Montpellier et l'Hérault. Pour quel type de trajet puis-je vous préparer un devis ?" | "Le client navigue depuis la page VTC Montpellier (Hérault). S'il ne précise pas de ville, suppose Montpellier par défaut." | `#highlights` |
| `/transfert-aeroport-montpellier` | "Bonsoir. Je vois que vous préparez un transfert vers ou depuis l'Aéroport Montpellier-Méditerranée. S'agit-il d'une arrivée ou d'un départ ?" | "Le type de trajet est 'airport', l'une des deux adresses est l'Aéroport Montpellier-Méditerranée (MPL). Ne demande pas le type : commence par confirmer arrivée/départ, puis collecte uniquement l'adresse manquante (ville incluse)." | `#highlights` |
| `/vtc-mariage-gard` | "Bonsoir. Je suis ravie de vous accompagner pour le transport de votre mariage dans le Gard ou l'Hérault. Quelle est la date de la cérémonie ?" | "Le type de trajet est 'event' (mariage). Ne demande pas le type : commence directement par la date de la cérémonie." | `#highlights` |
| `/chauffeur-prive-professionnel-occitanie` | "Bonsoir. Je vous prépare un devis pour une mise à disposition professionnelle en Occitanie. Combien d'heures de mise à disposition souhaitez-vous ?" | "Le type de trajet est 'disposal'. Ne demande pas le type : commence directement par le nombre d'heures souhaité." | `#highlights` |
| `/longue-distance-occitanie` | "Bonsoir. Indiquez-moi votre ville de départ (Montpellier, Nîmes...) et votre destination longue distance, et je vous prépare un devis." | "Le type de trajet est 'distance'. Ne demande pas le type : commence directement par les adresses de départ et de destination." | `#highlights` |
| `/` (home) | défaut (inchangé) | aucun | `#services` (défaut, inchangé) |

---

## 4. Fichiers impactés

| Fichier | Changement |
|---|---|
| `lib/lenis.ts` | **Créer** — singleton ref Lenis |
| `components/layout/SmoothScroller.tsx` | Enregistrer/nettoyer `lenisRef.current` |
| `components/scenes/SceneHero.tsx` | `onClick` CTA → scroll `#contact` ; prop `discoverHref` ; "Découvrir →" en scroll programmatique |
| `components/ui/SectionHighlights.tsx` | Ajouter `id="highlights"` |
| `components/scenes/SceneContact.tsx` | Props `greeting?`, `contextNote?` ; `SYSTEM_PROMPT` → `buildSystemPrompt(contextNote?)` |
| `app/vtc-nimes/page.tsx` | Passer `discoverHref`, `greeting`, `contextNote` |
| `app/vtc-montpellier/page.tsx` | idem |
| `app/transfert-aeroport-montpellier/page.tsx` | idem |
| `app/vtc-mariage-gard/page.tsx` | idem |
| `app/chauffeur-prive-professionnel-occitanie/page.tsx` | idem |
| `app/longue-distance-occitanie/page.tsx` | idem |
| `app/page.tsx` | Aucun changement (props par défaut) |

---

## 5. Vérification

- `npm run build` — aucune erreur TypeScript.
- Sur chaque page annexe (dev server) :
  - Cliquer le CTA hero → scroll fluide jusqu'à `#contact`, vérifier que le 1er message d'Élia correspond au
    `greeting` de la page.
  - Cliquer "Découvrir →" → scroll fluide jusqu'à `#highlights`.
  - Démarrer une conversation et vérifier qu'Élia ne redemande pas le type de trajet sur les pages où
    `contextNote` le précise (transfert aéroport, mariage, chauffeur pro, longue distance).
- Sur la home (`/`) :
  - CTA → `#contact` (nouveau comportement, mais cohérent — actuellement le bouton ne fait rien).
  - "Découvrir →" → `#services` (comportement actuel préservé).
- Navigation client (Link) entre pages : vérifier que `lenisRef.current` reste valide après changement de route
  (le `SmoothScroller` ne se démonte pas entre routes, donc la ref doit rester stable).

---

## Hors scope (Chantier B — session de brainstorming séparée)

- Section FAQ par service (+ schema `FAQPage`)
- Section "zones / villes desservies" par page
- Section "tarifs indicatifs" (basée sur `lib/pricing.ts`)
- Galerie / preuve sociale visuelle (nécessite de définir les assets disponibles au-delà des 6 photos hero)
