# Responsive mobile — Design

**Contexte :** La clientèle VTCLAND réserve majoritairement depuis son téléphone (aéroport, gare, déplacement).
Le site fonctionne visuellement en desktop mais n'a jamais été audité/ajusté spécifiquement pour mobile au-delà
du strict minimum (bouton d'appel flottant, `CustomCursor` désactivé sur `pointer: coarse`, meta viewport
auto-injectée par Next). Douze pages (home + 6 landing pages SEO) partagent ~11 composants (`SceneHero`,
`SceneIdentity`, `SceneVehicle`, `SceneServices`, `SceneSocialProof`, `SceneContact`, `FooterSeo`,
`PricingSection`, `FAQSection`, `SectionHighlights`) — corriger ces composants suffit à couvrir toutes les pages.

**Objectif :** Rendre l'expérience confortable sur téléphone (320–430px de large) sans rien casser de l'existant
(animations GSAP/ScrollTrigger, smooth scroll Lenis, structure JSX, contenu). Travail purement additif au niveau
des classes Tailwind (spacing, typographie, hauteur de viewport, zones tactiles).

---

## 1. Diagnostic

Constats issus de la lecture de `app/globals.css`, `app/layout.tsx`, des 6 scènes de la home, des composants UI
partagés et d'une page SEO type (`app/vtc-montpellier/page.tsx`) :

| # | Constat | Où | Impact mobile |
|---|---|---|---|
| D1 | `py-32` (128px) en haut **et** en bas sur presque chaque section | `SceneContact`, `SceneIdentity`, `SceneServices`, `SceneSocialProof`, `FooterSeo`, `PricingSection`, `FAQSection`, `SectionHighlights` | Sur un viewport visible ~650-700px, ~35-40% consommé en padding pur avant le contenu → scroll interminable |
| D2 | `px-12` (48px) fixe des deux côtés, aucun palier `sm:` | Toutes les sections plein-largeur | Sur 360-375px de large, ~26% de la largeur perdue en padding ; se cumule avec le padding interne du chat (`px-8`) |
| D3 | `h-screen` / `min-h-screen` (= `100vh`) | `SceneHero`, `SceneVehicle` (`h-screen`) ; `SceneContact`, `SceneIdentity`, `SceneServices`, `SceneSocialProof` (`min-h-screen`) | Ignore la rétractation de la barre d'adresse Safari iOS / Chrome Android → saut de layout au scroll |
| D4 | Typo qui saute directement de mobile à `md:` (768px), tailles `text-5xl`→`text-7xl`, retours à la ligne `<br/>` codés en dur jamais vérifiés < 768px | `SceneHero` (titre), `SceneIdentity` (manifeste), `SceneServices`/`SceneSocialProof`/`FAQSection`/`PricingSection` (h2) | Risque de débordement horizontal ou de titres trop écrasés sur 360-390px |
| D5 | Zones tactiles serrées, pas de zone de clic élargie | Bouton "Envoyer" (chat), lien "Découvrir →", bouton pause vidéo hero, liens footer | Sous la cible recommandée WCAG 2.5.8 (≥24×24px) |
| D6 | CTA flottant "Appeler" ne respecte pas la zone d'encoche / home-indicator iOS | `app/layout.tsx` (`fixed bottom-4 right-4`) | Peut chevaucher la zone de geste système sur iPhone récent |
| D7 | Ligne "Note Google + stats" et footer passent de `flex-col` à `flex-row` uniquement à `md:` | `SceneSocialProof`, `FooterSeo` | Correct directionnellement, à revérifier avec le nouveau spacing (D1/D2) |

---

## 2. Approche

**Passe systématique additive**, appliquée composant par composant : introduire une petite grammaire responsive
cohérente (échelle d'espacement, `dvh`, échelle typo à 3 paliers, zones tactiles) et l'appliquer via des classes
Tailwind supplémentaires/modifiées. Aucune structure JSX, aucun hook, aucune logique GSAP/ScrollTrigger/Lenis ne
change.

Écarté :
- **Variantes mobiles dédiées** (`SceneHeroMobile`, etc.) — double la surface de maintenance, risque de
  divergence, disproportionné pour un projet sans tests automatisés.
- **Refonte fluide `clamp()`/container queries** — changement de paradigme trop large pour être vérifié sans
  outil de rendu visuel dans cet environnement ; les paliers Tailwind discrets restent plus simples à relire et
  à faire tester par l'utilisateur sur son téléphone.

### Grammaire responsive introduite

| Token actuel | Nouveau | Notes |
|---|---|---|
| `py-32` | `py-20 sm:py-24 md:py-32` | Sections de contenu (pas le hero, qui reste `h-screen`→`dvh`) |
| `px-12 md:px-24` | `px-6 sm:px-8 md:px-12 lg:px-24` | Toutes les sections plein-largeur + éléments alignés dessus (lignes déco, footer) |
| `h-screen` / `min-h-screen` | `h-dvh` / `min-h-dvh` | `SceneHero`, `SceneVehicle`, `SceneContact`, `SceneIdentity`, `SceneServices`, `SceneSocialProof` |
| Titres `text-Xl md:text-Yl` | Ajout d'un palier `sm:` intermédiaire | Vérifier chaque `<br/>` codé en dur à 360/375/390px |
| Boutons/liens texte seul | `+inline-block p-2 -m-2` (ou équivalent) | Élargit la zone de clic sans changer le rendu visuel |
| CTA flottant | `bottom-[calc(1rem+env(safe-area-inset-bottom))]` | iPhone à encoche / home-indicator |

---

## 3. Phasage

### Phase 1 — Fondations spacing & viewport (impact le plus fort, risque le plus faible)
- `py-32` → `py-20 sm:py-24 md:py-32` sur les 8 composants listés en D1.
- `px-12 md:px-24` → `px-6 sm:px-8 md:px-12 lg:px-24` (sections + lignes décoratives alignées + footer).
- `h-screen`/`min-h-screen` → `h-dvh`/`min-h-dvh` sur les 6 composants listés en D3.

### Phase 2 — Typographie
- Ajout d'un palier `sm:` sur les titres principaux (`SceneHero`, `SceneIdentity`, `SceneServices`,
  `SceneSocialProof`, `SceneVehicle`, `SceneContact`, `PricingSection`, `FAQSection`, `SectionHighlights`).
- Relecture des `<br/>` codés en dur dans les titres à 360/375/390px (le contenu texte ne change pas, seule la
  taille de police est ajustée si un retour à la ligne produit un rendu cassé).

### Phase 3 — Zones tactiles
- Padding invisible (`p-2 -m-2` ou équivalent) sur : bouton "Envoyer" (chat), lien "Découvrir →" et lien
  tel. discret du hero, bouton pause/lecture vidéo hero, liens du footer.
- `env(safe-area-inset-bottom)` sur le CTA flottant "Appeler" (`app/layout.tsx`).

### Phase 4 — Ajustements ciblés
- `SceneContact` : hauteur du log de messages (`h-96`) revue pour petit viewport (`dvh`-based ou réduite en
  dessous de `sm:`), padding interne du chat (`px-8`) allégé sur mobile en cohérence avec Phase 1.
- `SceneSocialProof` : ré-vérifier l'empilement `flex-col md:flex-row` de la ligne note Google + stats avec le
  nouveau spacing.
- `SceneVehicle` : positionnement/lisibilité du bloc texte gauche (`left-12 md:left-24`, `max-w-sm`) avec le
  nouveau spacing — **sans toucher à la vidéo, à `preload`, ni à la mécanique de pin-scroll `PIN_DISTANCE`**.

### Phase 5 — QA croisée
- Vérification des 12 pages (home + 6 SEO) après chaque phase, `npm run dev -- -H 0.0.0.0` exposé sur le réseau
  local pour test sur téléphone réel.

---

## 4. Fichiers impactés

| Fichier | Phases |
|---|---|
| `components/scenes/SceneHero.tsx` | 1, 2, 3 |
| `components/scenes/SceneVehicle.tsx` | 1, 2, 4 |
| `components/scenes/SceneIdentity.tsx` | 1, 2 |
| `components/scenes/SceneServices.tsx` | 1, 2 |
| `components/scenes/SceneSocialProof.tsx` | 1, 2, 4 |
| `components/scenes/SceneContact.tsx` | 1, 2, 3, 4 |
| `components/layout/FooterSeo.tsx` | 1, 3 |
| `components/ui/PricingSection.tsx` | 1, 2 |
| `components/ui/FAQSection.tsx` | 1, 2 |
| `components/ui/SectionHighlights.tsx` | 1, 2 |
| `app/layout.tsx` | 3 (CTA flottant, `env(safe-area-inset-bottom)`) |

Aucune page (`app/*/page.tsx`) n'a besoin de modification directe — elles ne font que composer les composants
ci-dessus.

---

## 5. Vérification

- `npx tsc --noEmit` après chaque phase — aucune erreur.
- `npm run dev -- -H 0.0.0.0` — l'utilisateur teste sur son téléphone (même wifi) après chaque phase.
- Largeurs de relecture de code ciblées : 360, 375, 390, 414, 768, 1024px.
- Points de contrôle manuels :
  - Aucun débordement horizontal (scroll-x involontaire) sur aucune des 12 pages.
  - Les titres avec `<br/>` codés en dur restent lisibles, pas de mot orphelin ou de chevauchement.
  - Le chat Élia reste utilisable (clavier virtuel ouvert, zone de saisie visible) sur un viewport réduit.
  - Le CTA flottant "Appeler" ne chevauche pas la zone d'encoche/home-indicator ni le bas du chat.
  - `prefers-reduced-motion` et le comportement desktop existant restent inchangés (test rapide en resize
    navigateur ≥1024px après chaque phase).

---

## Hors scope

- Poids et branchement des vidéos (`vehicle_scrub.mp4`, `vehicle.mp4`, `hero.mp4`), mécanique de pin-scroll de
  `SceneVehicle` (`PIN_DISTANCE`) — chantier performance séparé, déjà tracé dans `audit/performance.md` et
  `audit/fix-plan.md` (Phase 5).
- Navigation mobile dédiée (menu hamburger) — le site reste one-page + footer, `components/ui/Navbar.tsx` reste
  vide/inutilisé (point déjà noté dans `CLAUDE.md`).
- Changement de copy/contenu, de logique métier, ou d'animations GSAP/ScrollTrigger/Lenis.
