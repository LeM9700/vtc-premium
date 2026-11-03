# Rapport d'Audit Accessibilité — VTCLAND

**Date :** 2026-07-14  
**Auditeur :** Claude (Sonnet 4.6)  
**Scope :** WCAG 2.2 niveau AA — HTML sémantique, clavier, lecteur d'écran, ARIA, contrastes, médias, IA, mobile, animations

> ⚠️ Cet audit est basé sur l'analyse statique du code source. Il ne remplace pas un audit manuel avec VoiceOver/NVDA/JAWS, ni une batterie de tests automatisés axe.

---

## 🔄 MISE À JOUR — 2026-07-16

Les 3 bloquants P0 et la quasi-totalité des P1 ont été corrigés :

| ID | Finding | Statut |
|---|---|---|
| C1 | Input chat sans `<label>` | ✅ **CORRIGÉ** — `<label htmlFor="elia-chat-input" className="sr-only">` |
| C2 | Aucune région live pour les réponses | ✅ **CORRIGÉ** — `role="log" aria-live="polite" aria-atomic="false"` sur le conteneur de messages |
| C3 | Indicateur de frappe non accessible | ✅ **CORRIGÉ** — `role="status" aria-label="Élia est en train de répondre…"`, dots en `aria-hidden` |
| C4 | Aucun support `prefers-reduced-motion` | ✅ **CORRIGÉ** — implémenté dans les 7 composants animés (`lib/gsap.ts` → `prefersReducedMotion()`), y compris désactivation du pin/scrub vidéo de `SceneVehicle` |
| C5 | Vidéo hero autoplay sans contrôles | ✅ **CORRIGÉ** — bouton pause/play visible et accessible au clavier |
| C6 | Icônes SVG non masquées | ✅ **CORRIGÉ** — `aria-hidden="true" focusable="false"` sur les 4 icônes |
| A-KB1 | Pas de skip link | ✅ **CORRIGÉ** — `app/layout.tsx` |
| A-KB2 | `cursor-none` sur les cards services | ✅ **CORRIGÉ** — retiré |
| A-FOC1 | Absence de focus ring visible | ✅ **CORRIGÉ** — `:focus-visible` global dans `globals.css` |
| A-SR1 | Messages de phase non annoncés | ✅ **CORRIGÉ** — région `role="status" aria-live="assertive"` dédiée |
| A-SR3 | Compteurs GSAP bruyants | ✅ **CORRIGÉ** — `aria-hidden` pendant l'animation + span `.sr-only` avec la valeur finale |
| A-CON1 | Textes `/30` et `/20` opacity — contraste insuffisant | ✅ **CORRIGÉ** — `/30` → `/60`, `/20` → `/40` sur tous les usages identifiés |
| A-AI1 | Structure conversationnelle non balisée | ✅ **CORRIGÉ** — `span.sr-only` "Élia :" / "Vous :" par message |
| A-NAV2 | Pas de navigation principale accessible | ❌ Non traité — `Navbar.tsx` toujours vide ; le maillage repose sur le footer + skip link |
| A-MOB3 | CustomCursor actif inutilement sur mobile | ✅ **CORRIGÉ** — désactivé sur `pointer: coarse` et reduced-motion |

**Nouveau score estimé : 8,5/10** (était 4/10). Le chat Élia est désormais utilisable par un lecteur d'écran de bout en bout (non re-testé manuellement avec VoiceOver/NVDA — recommandé avant lancement).

---

## 🔄 MISE À JOUR — 2026-07-18

**Lighthouse Accessibility (axe-core sous le capot) exécuté pour la première fois** contre un build de production local : **96/100**.

**Bug réel trouvé et corrigé — A-CON1 pas assez poussé partout :** le fix du 2026-07-16 (`/30` → `/60`, `/20` → `/40`) a laissé plusieurs textes à opacité `/40`, ce qui donne un ratio de contraste réel de **3,46:1** (vérifié par calcul WCAG, formule de luminance relative) — insuffisant pour du texte normal (norme AA : 4,5:1 minimum). `/50` donnerait 4,83:1 (limite), `/60` donne 6,55:1 (confortable). 6 occurrences corrigées (`/40` → `/60`) :
- `components/layout/FooterSeo.tsx` — mention "Chauffeur Privé · Occitanie" + les 2 liens légaux
- `components/scenes/SceneVehicle.tsx` — labels des caractéristiques véhicule
- `components/scenes/SceneHero.tsx` — lien pause/play vidéo
- `components/ui/SectionHighlights.tsx` — corps de texte des points forts
- `app/politique-de-confidentialite/page.tsx` et `app/mentions-legales/page.tsx` — dates/notes en petit texte
- `components/scenes/SceneContact.tsx` — **régression introduite le jour même** : le nouveau bandeau d'information RGPD (voir ci-dessous) avait été codé directement en `/40`, corrigé avant même d'être remarqué en dehors de ce test

**2 faux positifs identifiés et documentés (non corrigés, à raison) :** les deux textes décoratifs géants en filigrane (`SceneHero.tsx`, `SceneContact.tsx` — "DEVIS" en arrière-plan à `opacity: 0.015`) sont marqués `aria-hidden="true"` et donc exclus de l'arbre d'accessibilité — ils entrent dans l'exception WCAG 1.4.3 pour le texte purement décoratif non perceptible par les technologies d'assistance. Axe-core les signale quand même (limitation connue de l'outil, qui vérifie le rendu visuel indépendamment de `aria-hidden`) — à ignorer.

**Nouveau finding — bandeau d'information RGPD ajouté (voir `security.md` P1-4) :** une ligne de texte informative (pas un bandeau "consentement" à cocher — la base légale du site est l'exécution contractuelle, art. 6.1.b RGPD, pas le consentement) est désormais affichée en permanence au-dessus du chat, avant tout message, avec lien vers `/politique-de-confidentialite`.

**Toujours non exécutable depuis cet environnement (Windows, sandbox sans accès à un vrai lecteur d'écran ni appareil physique) :**
- VoiceOver (macOS uniquement) — nécessite un Mac
- NVDA/JAWS — nécessite une session interactive avec synthèse vocale, non scriptable ici
- Test iPhone Safari sur vrai réseau 4G — nécessite un appareil physique ; le throttling réseau simulé de Lighthouse mobile en est l'approximation la plus proche réalisée dans cette passe

Ces 3 tests manuels restent recommandés avant tout lancement public, comme indiqué dans `fix-plan.md` §10.

---

## 1. Résumé Exécutif

**Verdict : MVP Utilisable Avec Risques Accessibilité**

Le site est utilisable au clavier pour la navigation générale, mais le parcours de conversion principal — le chat Élia — est **bloqué pour les utilisateurs de lecteur d'écran**. Trois risques critiques :

1. **L'input du chat n'a pas de `<label>`** — les technologies d'assistance ne peuvent pas l'identifier.
2. **Aucune `aria-live` region** — les réponses d'Élia et les états du chat (chargement, calcul, confirmation) arrivent silencieusement pour un utilisateur aveugle.
3. **Aucun support `prefers-reduced-motion`** — toutes les animations GSAP (parallax, mask reveal, SplitType, compteurs) s'exécutent quelle que soit la préférence de l'OS, risque vestibulaire pour les utilisateurs concernés.

---

## 2. Contexte Accessibilité du Projet

| Dimension | Valeur |
|---|---|
| Type | Site vitrine public + assistant IA de réservation |
| Utilisateurs cibles | Grand public, clientèle premium, France |
| Contexte légal | Service commercial privé → RGAA non applicable légalement |
| Standard cible | WCAG 2.2 niveau AA |
| Framework | Next.js 16 (App Router), React 19 |
| Librairie UI | Tailwind 4 (utilitaires) — pas de composant library |
| Design system | Custom (composants fait-main) |
| Parcours critique | Chat IA Élia → collecte devis → email |
| Mobile | Oui, parcours principal aussi sur mobile |
| Admin/SaaS | Non |
| Fonctionnalité IA | Oui — chat conversationnel Anthropic |

---

## 3. Scorecard Accessibilité

| Catégorie | Score /10 | Statut |
|---|---:|---|
| HTML Sémantique | 6 | ⚠️ Partiel |
| Navigation Clavier | 5 | ⚠️ Risques |
| Gestion du Focus | 4 | ⚠️ Insuffisant |
| Support Lecteur d'Écran | 3 | ❌ Bloquant |
| Qualité ARIA | 4 | ⚠️ Lacunes |
| Couleurs & Contrastes | 4 | ⚠️ À mesurer |
| Formulaires | 2 | ❌ Critique |
| Navigation | 6 | ⚠️ Partiel |
| Modals & Overlays | N/A | — |
| Tables & Grilles | N/A | — |
| Accessibilité Mobile | 5 | ⚠️ Risques |
| SaaS/Admin | N/A | — |
| Accessibilité IA | 2 | ❌ Bloquant |
| Retours Erreur & Statut | 3 | ❌ Lacunes |
| Accessibilité Cognitive | 6 | ⚠️ Acceptable |
| Tests Automatisés | 0 | ❌ Absent |
| Conformité RGAA | N/A | — |

**Score global : 4 / 10**

---

## 4. Findings Critiques

### C1 — Input du chat sans label

**Sévérité :** Critique  
**Priorité :** P0  
**Zone :** Formulaire IA / Accessibilité  

**Preuve :** `components/scenes/SceneContact.tsx:414-428`
```tsx
<input
  ref={inputRef}
  type="text"
  value={input}
  placeholder="Votre réponse..."
  // Aucun <label>, aucun aria-label, aucun aria-labelledby
/>
```

**Impact utilisateur :** Un utilisateur de VoiceOver (macOS/iOS) ou NVDA entendra simplement "modifier le texte" ou le placeholder, sans comprendre que ce champ sert à répondre à Élia. WCAG 1.3.1 (Info et relations) et 4.1.2 (Nom, rôle, valeur) non conformes.

**Impact business :** Le parcours de réservation est la fonction centrale du site. S'il est bloqué pour un utilisateur malvoyant, la perte de conversion est directe.

**WCAG :** 1.3.1 (A), 4.1.2 (A)

**Correction :**
```tsx
<label htmlFor="elia-input" className="sr-only">
  Votre message à Élia
</label>
<input
  id="elia-input"
  ref={inputRef}
  type="text"
  ...
/>
```

**Effort :** 5 min  
**Bloquant :** Oui

---

### C2 — Aucune région live pour les réponses du chat

**Sévérité :** Critique  
**Priorité :** P0  
**Zone :** IA / Lecteur d'écran  

**Preuve :** `SceneContact.tsx:354-395` — Le conteneur de messages est un `<div>` sans `aria-live` ni `role="log"`.

**Impact utilisateur :** Quand Élia répond, le message est ajouté au DOM sans aucune annonce. Un utilisateur de lecteur d'écran ne sait pas qu'une réponse est arrivée. Il ne sait pas non plus qu'Élia est en train de "réfléchir" (indicateur de frappe) ni que le devis a été calculé.

**WCAG :** 4.1.3 (AA) — Messages de statut

**Correction :**
```tsx
<div
  ref={messagesRef}
  role="log"
  aria-live="polite"
  aria-label="Conversation avec Élia"
  aria-atomic="false"
  ...
>
```
`aria-live="polite"` annonce les nouveaux messages sans interrompre la lecture en cours. `aria-atomic="false"` annonce uniquement le nouveau message ajouté, pas l'historique entier.

**Effort :** 10 min  
**Bloquant :** Oui

---

### C3 — Indicateur de chargement (typing dots) non accessible

**Sévérité :** Critique  
**Priorité :** P0  
**Zone :** IA / Lecteur d'écran  

**Preuve :** `SceneContact.tsx:373-385`
```tsx
{loading && (
  <div className="flex justify-start">
    <div className="flex gap-1.5 items-center py-2">
      {[0, 1, 2].map(i => (
        <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#C9A96E]/50 animate-bounce" />
      ))}
    </div>
  </div>
)}
```
Trois `<span>` animés sans texte, sans `role`, sans `aria-label`.

**Impact utilisateur :** L'utilisateur de lecteur d'écran envoie son message et... silence. Aucun retour que la requête est en cours. Peut répéter sa saisie croyant que l'envoi a échoué.

**WCAG :** 4.1.3 (AA) — Messages de statut

**Correction :**
```tsx
{loading && (
  <div role="status" aria-label="Élia est en train de répondre…" className="flex justify-start">
    <div className="flex gap-1.5 items-center py-2" aria-hidden="true">
      {[0, 1, 2].map(i => (
        <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#C9A96E]/50 animate-bounce" />
      ))}
    </div>
  </div>
)}
```

**Effort :** 5 min  
**Bloquant :** Oui

---

### C4 — Aucun support `prefers-reduced-motion`

**Sévérité :** Haute  
**Priorité :** P1  
**Zone :** Animations / Accessibilité vestibulaire  

**Preuve :** `LoadingScreen.tsx`, `SceneHero.tsx`, `SceneIdentity.tsx`, `SceneVehicle.tsx`, `SceneServices.tsx`, `SceneContact.tsx`, `CustomCursor.tsx` — aucun fichier ne vérifie `window.matchMedia('(prefers-reduced-motion: reduce)')` avant de lancer les animations GSAP.

**Impact utilisateur :** Les utilisateurs atteints de troubles vestibulaires (vertiges, épilepsie, troubles de l'équilibre) ont activé cette préférence OS. Sur VTCLAND, ils reçoivent :
- Le LoadingScreen animé (1.8s)
- Le parallax de la vidéo hero au scroll
- Le mask reveal de la phrase manifeste
- Les compteurs qui s'incrémentent
- Le scrubbing vidéo du véhicule
- Les stagger animations des sections

**WCAG :** 2.3.3 (AAA — Animation depuis interactions), 2.3.1 (A — Trois flashs ou sous le seuil)

**Correction globale :**
```ts
// lib/gsap.ts — wrapper global
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
if (prefersReduced) {
  gsap.globalTimeline.timeScale(100) // skip all animations
  ScrollTrigger.normalizeScroll(false)
}
```
Ou par animation individuelle :
```ts
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
if (!prefersReduced) {
  gsap.from(title, { opacity: 0, y: 60, duration: 1 })
} else {
  gsap.set(title, { opacity: 1, y: 0 }) // état final immédiat
}
```

**Effort :** 2-4h  
**Bloquant :** Non (pas de blocage fonctionnel), mais risque médical réel.

---

### C5 — Vidéo hero en autoplay sans contrôles

**Sévérité :** Haute  
**Priorité :** P1  
**Zone :** Médias / WCAG 1.4.2  

**Preuve :** `SceneHero.tsx:179-188`
```tsx
<video autoPlay muted loop playsInline preload="auto" />
```
Aucun bouton pause, aucune option d'arrêt pour l'utilisateur.

**Impact utilisateur :** WCAG 1.4.2 (A) exige que toute vidéo qui démarre automatiquement et dure plus de 3 secondes puisse être stoppée ou mise en pause. La vidéo hero tourne en boucle indéfiniment.

**WCAG :** 1.4.2 (A)

**Correction :** Ajouter un bouton discret pause/play dans le hero :
```tsx
<button
  aria-label={isPlaying ? "Mettre la vidéo en pause" : "Lancer la vidéo"}
  onClick={() => { isPlaying ? videoRef.current?.pause() : videoRef.current?.play() }}
  className="absolute bottom-8 left-12 z-30 text-[#F5F0E8]/40 text-xs"
>
  {isPlaying ? "⏸" : "▶"}
</button>
```

**Effort :** 30 min  
**Bloquant :** Non critique mais WCAG 1.4.2 niveau A.

---

### C6 — Icônes SVG dans SceneServices non masquées ni labelisées

**Sévérité :** Haute  
**Priorité :** P1  
**Zone :** Images / Lecteur d'écran  

**Preuve :** `SceneServices.tsx:178-200` — `IconAirport`, `IconCar`, `IconEvent`, `IconRoute` sont des SVG avec des `<path>` uniquement, sans `aria-hidden`, sans `<title>`.

**Impact utilisateur :** Les lecteurs d'écran tentent de lire les SVG décoratifs. VoiceOver peut annoncer "image" ou tenter de lire le contenu du path. Chaque carte de service produit un bruit inutile.

**WCAG :** 1.1.1 (A) — Contenu non textuel

**Correction :** Ces icônes sont purement décoratives (le titre du service suffit). Les masquer :
```tsx
const IconAirport = () => (
  <svg aria-hidden="true" focusable="false" width="20" height="20" ...>
```

**Effort :** 5 min  
**Bloquant :** Non.

---

## 5. Accessibilité des Parcours Critiques

### Parcours A — Chat Élia → Devis

**Flow :**
```
Page charge → Tab pour atteindre le chat → Focus sur l'input → Taper → Enter ou bouton Envoyer → Attendre réponse → ...×12 → Confirmation
```

**Clavier :** Partiellement opérable. L'input est atteignable par Tab. Le bouton "Envoyer" est un `<button>` natif. La touche Enter fonctionne (`onKeyDown`). Mais le focus n'est jamais redirigé vers les nouveaux messages — l'utilisateur clavier doit deviner qu'une réponse est arrivée.

**Lecteur d'écran :** Bloqué. Input sans label → non identifiable. Réponses non annoncées → invisible. Indicateur de frappe non annoncé → silence. Phase "calculating" (`aria-pulse` manquant) → silence.

**Mobile :** L'input est accessible au clavier virtuel iOS/Android. Le chat est dans une zone scrollable. Fonctionnel en happy path.

**Récupération d'erreur :** "Une erreur est survenue. Veuillez réessayer." s'ajoute dans le chat — mais sans live region, non annoncé aux lecteurs d'écran.

**Obstacles observés :**
- Input sans `<label>` ou `aria-label`
- `role="log"` manquant sur le conteneur de messages
- Aucune annonce de chargement
- Focus non déplacé après réponse

**Verdict : Bloqué pour lecteurs d'écran**

**Corrections requises :** C1, C2, C3 (P0 ci-dessus)

---

### Parcours B — Navigation vers une landing page SEO

**Flow :**
```
Footer links (VTC Montpellier, Transfert Aéroport, etc.) → Landing page → Hero → Chat contextualisé
```

**Clavier :** Le footer est navigable au clavier. Les `<nav>` avec `aria-label` sont correctement balisés. Les `<Link>` sont des `<a>` natifs. Fonctionnel.

**Lecteur d'écran :** Les deux `<nav>` du footer ont des `aria-label` distincts ("Villes desservies", "Nos services") — excellent. Les liens ont du texte descriptif. Bon.

**Obstacles :** Aucun skip link vers le contenu principal des landing pages. Pas de breadcrumb ou indication de page courante.

**Verdict : Mostly Accessible**

---

### Parcours C — Consultation visuelle du site

**Flow :**
```
Hero → scroll → Identité → Véhicule → Services → Preuve sociale → Contact
```

**Clavier :** Navigable. Les cards de services sont des `<Link>` (`<a>`) natifs, atteignables par Tab. Les titres H1/H2/H3 créent une structure logique.

**Lecteur d'écran :**
- Bonne hiérarchie de titres (H1 dans hero, H2 dans chaque scène, H3 dans les cards services)
- `aria-hidden` sur les textes décoratifs watermark ("DEVIS", "VTC", "PRESTIGE") — correct
- Compteurs animés : GSAP écrit dans `el.textContent` — peut produire des annonces parasites pendant l'animation
- `<main>` présent sur la page d'accueil — bon

**Obstacles :** Animations GSAP sans `prefers-reduced-motion`. Pas de skip link.

**Verdict : Mostly Accessible**

---

## 6. Findings Détaillés par Domaine

### HTML Sémantique

**A-SEM1 — `<main>` présent sur la homepage**
- Preuve : `app/page.tsx:10` — `<main>` wrapping toutes les scènes.
- Bon point. Les landing pages doivent également être vérifiées.
- Priorité : ✅

**A-SEM2 — `<p>` utilisé comme label de section**
- Preuve : `SceneServices.tsx:103`, `FooterSeo.tsx:24-27` — `<p>` et `<span>` utilisés pour les labels "Nos prestations · Gard & Hérault", "Villes", "Services" à la place d'un élément sémantique.
- Impact : Ces textes ne contribuent pas à la hiérarchie des titres.
- Correction : Utiliser `<h3>` ou `<p>` avec rôle explicite si besoin.
- Priorité : P3

**A-SEM3 — Aucun `<header>` global ni `<nav>` principale**
- `Navbar.tsx` est vide. Il n'existe aucun landmark `<header>` avec une navigation principale.
- Impact : Les utilisateurs de lecteurs d'écran ne peuvent pas sauter à la navigation. Le seul `<nav>` utile est dans le footer.
- Priorité : P2

**A-SEM4 — Hiérarchie de titres cohérente**
- H1 dans le hero (SceneHero), H2 dans chaque scène (SceneIdentity, SceneServices, SceneContact, SceneSocialProof), H3 dans les cards services.
- Bon point.
- Priorité : ✅

---

### Clavier

**A-KB1 — Pas de skip link**
- Aucun lien "Passer au contenu principal" en haut de page.
- Impact : Utilisateurs clavier doivent traverser la barre de chargement (LoadingScreen, même si elle disparaît en 1.8s), le hero complet, avant d'atteindre le contenu.
- Correction : `<a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[99999]">Passer au contenu</a>` dans `layout.tsx`.
- Priorité : P1

**A-KB2 — `cursor-none` sur les cards services**
- Preuve : `SceneServices.tsx:129` — `className="group relative cursor-none"`.
- Impact : L'indication visuelle de "cliquable" disparaît pour l'utilisateur souris ET pour certains outils d'assistance qui affichent un curseur customisé.
- Correction : Supprimer `cursor-none` ou le conditionner au `custom cursor` activé.
- Priorité : P2

**A-KB3 — Bouton CTA hero opérable au clavier**
- `<button onClick={handleCtaClick}>` dans SceneHero — natif, activable à Enter/Space.
- Bon point.

---

### Focus

**A-FOC1 — Absence de focus ring visible**
- `globals.css` ne définit aucun style de focus personnalisé. Tailwind 4 par défaut applique `outline-none` sur les éléments focusables via les variantes utilitaires. Aucune des scènes n'ajoute de classe `focus:ring` ou `focus:outline` sur les boutons et liens principaux.
- Impact : Utilisateur navigant au clavier ne voit pas l'élément focusé.
- Preuve : `SceneContact.tsx:429-433` — le bouton "Envoyer" n'a aucune classe de focus.
- Correction globale dans `globals.css` :
  ```css
  :focus-visible {
    outline: 2px solid #C9A96E;
    outline-offset: 3px;
  }
  ```
- Priorité : P1 (WCAG 2.4.11 niveau AA — Focus apparence)

**A-FOC2 — Focus non déplacé après réponse d'Élia**
- Après réception d'une réponse, le focus reste sur l'input. C'est acceptable. Mais après la phase "done" ou "limit", le focus devrait être déplacé vers le message de confirmation.
- Priorité : P2

---

### Lecteur d'Écran

→ Voir C1, C2, C3 (Input sans label, pas de live region, indicateur non accessible).

**A-SR1 — Messages de phase non annoncés**
- `SceneContact.tsx:388-409` — Les phases `calculating`, `limit`, `expired` changent l'UI visuellement mais aucune n'utilise `role="status"` ou `aria-live`.
- Correction : Wrapper chaque message de phase dans un `<div role="status" aria-live="polite">`.
- Priorité : P1

**A-SR2 — Input désactivé — placeholder comme seule information**
- En phase `done`, l'input affiche `placeholder="Demande envoyée ✓"`. Sur un champ `disabled`, certains lecteurs d'écran n'annoncent pas le placeholder.
- Correction : `aria-label="Demande envoyée avec succès"` sur l'input en mode done.
- Priorité : P2

**A-SR3 — Compteurs GSAP — annonces parasites potentielles**
- `SceneIdentity.tsx:74-78` — `el.textContent = Math.round(obj.val).toString()` pendant 2s. Si VoiceOver est actif et l'utilisateur navigue sur cette zone durant l'animation, il entendra 0, 1, 2, 3... jusqu'à 98.
- Correction : `aria-hidden="true"` sur le span de compteur + un span `sr-only` avec la valeur finale. Retirer `aria-hidden` après animation.
- Priorité : P2

---

### ARIA

**A-ARIA1 — Bons usages détectés**
- `aria-hidden="true"` sur tous les textes décoratifs watermark ✅
- `aria-hidden` sur le divider de footer ✅
- `aria-label` sur les deux `<nav>` du footer ✅
- `alt=""` sur les images décoratives hero ✅

**A-ARIA2 — Icônes SVG non marquées** → voir C6

**A-ARIA3 — `role="status"` manquant** → voir A-SR1

---

### Couleurs & Contrastes

> L'audit de contraste précis nécessite un outil (axe, Colour Contrast Analyser). Les valeurs ci-dessous sont des estimations basées sur les couleurs Tailwind.

**A-CON1 — Textes secondaires très faibles en opacité**
- Toute l'interface utilise des opacités réduites pour le texte secondaire : `text-[#F5F0E8]/30`, `text-[#F5F0E8]/50`.
- Fond `#0A0A0A` + texte `rgba(245,240,232,0.30)` ≈ `#3B3835` → ratio de contraste estimé **~2.5:1** → en dessous du seuil WCAG AA de 4.5:1 pour le texte normal.
- Zones concernées : descriptions de services, labels de statistiques, placeholders, légendes footer.
- WCAG 1.4.3 (AA) — Contraste minimum.
- Priorité : P1

**A-CON2 — Texte doré `#C9A96E` sur fond noir `#0A0A0A`**
- `#C9A96E` sur `#0A0A0A` → ratio estimé **~5.5:1** → conforme WCAG AA pour texte normal (≥ 4.5:1) ✅
- Bon point pour les titres et éléments primaires.

**A-CON3 — Placeholder `text-[#F5F0E8]/20` sur fond `#111111`**
- Ratio estimé **~1.5:1** → très insuffisant. Le placeholder "Votre réponse..." est quasi-invisible.
- WCAG ne requiert pas de contraste pour les placeholders comme labels (raison de plus d'avoir un vrai label), mais l'expérience est dégradée.
- Priorité : P2

---

### Formulaires

**A-FORM1 — Input sans label** → voir C1 (P0)

**A-FORM2 — Pas de validation accessible**
- Il n'y a pas de validation côté client (la validation est faite par Claude), donc pas de gestion d'erreur de type "champ requis". Acceptable.

**A-FORM3 — `type="text"` sur l'input de chat**
- Correct pour une entrée libre. `autocomplete="off"` pourrait être ajouté pour éviter les suggestions parasites.
- Priorité : P3

---

### Navigation

**A-NAV1 — Footer navigation correctement balisée** ✅  
`aria-label="Villes desservies"` et `aria-label="Nos services"` — conforme.

**A-NAV2 — Pas de navigation principale accessible**  
`Navbar.tsx` est vide. Aucun `<nav>` en haut de page. Sur les landing pages, les utilisateurs de lecteur d'écran n'ont aucun moyen rapide de revenir à l'accueil ou de naviguer entre les pages sans descendre jusqu'au footer.
- Priorité : P2

**A-NAV3 — `lang="fr"` sur `<html>`** ✅  
`app/layout.tsx:70` — correct.

---

### Mobile

**A-MOB1 — Viewport correctement configuré**
- Next.js injecte automatiquement `<meta name="viewport" content="width=device-width, initial-scale=1">` — correct.

**A-MOB2 — Touch targets**
- Le bouton "Envoyer" et les cards services ont des zones cliquables correctes sur mobile (padding suffisant). Acceptable.

**A-MOB3 — CustomCursor sur mobile**
- `CustomCursor.tsx` s'initialise sur tous les appareils. Sur mobile/touch, `window.addEventListener('mousemove')` ne se déclenche pas, donc l'impact est nul fonctionnellement. Mais les deux `<div>` du curseur sont injectés dans le DOM et ont `pointer-events-none` — pas de blocage.
- Priorité : P3

**A-MOB4 — Vidéo autoplay sans contrôles** → voir C5

---

### IA

→ Voir C1, C2, C3, A-SR1.

**A-AI1 — Structure conversationnelle non balisée**
- Les messages utilisateur/assistant sont des `<div>` sans structure sémantique de conversation.
- Correction : `role="log"` sur le conteneur (déjà dans C2), et considérer `aria-label` par message distinguant les rôles : "Élia :" vs "Vous :".
- Priorité : P1

**A-AI2 — Bouton "Envoyer" a un nom accessible**
- Texte visible "Envoyer" — correct. Pas d'icône-only. ✅

---

### Erreurs & Statut

**A-ERR1 — Messages d'erreur non annoncés**
- `SceneContact.tsx:285-288` — le message "Une erreur est survenue. Veuillez réessayer." s'ajoute dans le chat, mais sans live region, il n'est pas annoncé.
- Corrigé automatiquement par C2 (`role="log"` sur le conteneur).
- Priorité : P1 (résolu par C2)

**A-ERR2 — Phase "limit" : numéro de téléphone accessible**
- `SceneContact.tsx:401-407` — le lien `href="tel:0783699229"` a un texte visible "07 83 69 92 29". Accessible. ✅

---

### Tests Automatisés

**Aucun test d'accessibilité détecté.** Ni `jest-axe`, ni `eslint-plugin-jsx-a11y`, ni Lighthouse CI, ni Pa11y.

---

## 7. Mapping WCAG 2.2

| Principe WCAG | Issues concernées | Risque |
|---|---|---|
| **Perceptible** (1.x) | C5 vidéo autoplay, A-CON1 contrastes faibles, C6 SVG non masqués | ❌ Haute |
| **Opérable** (2.x) | A-KB1 skip link absent, A-FOC1 focus invisible, C4 animations, C5 vidéo | ⚠️ Moyenne-Haute |
| **Compréhensible** (3.x) | A-AI1 structure chat, A-SR1 phases non annoncées | ⚠️ Moyenne |
| **Robuste** (4.x) | C1 input sans label, C2 live regions, C3 loading, A-ARIA2 SVG | ❌ Critique |

> Le mapping précis des critères (1.4.3, 2.4.7, 4.1.2, etc.) nécessite une validation manuelle complète.

---

## 8. Conformité RGAA

**RGAA non applicable** — VTCLAND est un service commercial privé. La loi française n'impose pas la conformité RGAA aux entreprises privées qui ne sont pas organismes publics, établissements d'enseignement, ou entreprises de plus de 250M€ de CA.

Cependant, viser WCAG 2.1 AA est une bonne pratique commerciale (risque légal moindre, meilleure UX, SEO indirect).

---

## 9. P0 — Bloquants Production

| ID | Problème | WCAG | Effort |
|---|---|---|---|
| P0-A1 | Input chat sans `<label>` | 4.1.2 (A) | 5 min |
| P0-A2 | Pas de `aria-live` sur le conteneur de messages | 4.1.3 (AA) | 10 min |
| P0-A3 | Indicateur de frappe non accessible | 4.1.3 (AA) | 5 min |

---

## 10. P1 — Corrections Prioritaires

| ID | Problème | WCAG | Effort |
|---|---|---|---|
| P1-A1 | Pas de skip link | 2.4.1 (A) | 20 min |
| P1-A2 | Pas de `:focus-visible` global | 2.4.11 (AA) | 15 min |
| P1-A3 | Pas de `prefers-reduced-motion` sur les animations GSAP | 2.3.3 (AAA) | 2-4h |
| P1-A4 | Textes `/30` et `/50` opacity — contraste insuffisant | 1.4.3 (AA) | 2-4h |
| P1-A5 | Phases chat (calculating, limit, expired) non annoncées | 4.1.3 (AA) | 30 min |
| P1-A6 | Vidéo hero autoplay sans bouton pause | 1.4.2 (A) | 30 min |
| P1-A7 | Structure conversationnelle chat non balisée | 4.1.2 (AA) | 20 min |

---

## 11. P2 — Améliorations

| ID | Problème | Effort |
|---|---|---|
| P2-A1 | Pas de `<header>` / `<nav>` principale | 2-4h |
| P2-A2 | `cursor-none` sur les cards services | 5 min |
| P2-A3 | Compteurs GSAP bruyants pour lecteurs d'écran | 30 min |
| P2-A4 | Placeholder trop pâle (`/20` opacity) | 5 min |
| P2-A5 | Focus non déplacé après phase "done"/"limit" | 1h |
| P2-A6 | Input désactivé — `aria-label` contextuel manquant | 10 min |

---

## 12. P3 — Améliorations Facultatives

| ID | Problème |
|---|---|
| P3-A1 | `autocomplete="off"` sur l'input du chat |
| P3-A2 | `<p>` labels de section → utiliser des éléments plus sémantiques |
| P3-A3 | Légendes captions sur les vidéos (hero, véhicule) |
| P3-A4 | `aria-current="page"` sur les liens du footer quand on est sur la page courante |
| P3-A5 | Accessible name plus précis sur le bouton CTA hero ("Demander un devis pour votre trajet") |

---

## 13. Quick Wins (< 30 min chacun)

1. **Label input chat** (`SceneContact.tsx`) → `<label htmlFor="elia-input" className="sr-only">` + `id="elia-input"` sur l'input — **5 min, impact critique**
2. **`role="log" aria-live="polite"`** sur le conteneur de messages — **10 min, impact critique**
3. **`role="status" aria-label="Élia est en train de répondre…"`** sur le loading indicator — **5 min, impact critique**
4. **`aria-hidden="true" focusable="false"`** sur les 4 SVGs de SceneServices — **5 min**
5. **`:focus-visible` global** dans `globals.css` — **10 min, impact fort sur navigation clavier**
6. **Skip link** dans `layout.tsx` — **15 min, impact fort**
7. **`role="status" aria-live="polite"`** sur les messages de phase chat (calculating, limit, expired) — **15 min**

**Total quick wins critiques : ~50 minutes pour passer de 4/10 à 6.5/10 sur le parcours principal.**

---

## 14. Tests d'Accessibilité Suggérés

### Tests Automatisés

| Objectif | Outil | Scénario | Résultat attendu |
|---|---|---|---|
| Audit WCAG de base | axe DevTools | Homepage + /vtc-montpellier | 0 violation critique |
| Linting JSX | `eslint-plugin-jsx-a11y` | `npm run lint` | 0 erreur a11y |
| Lighthouse accessibilité | Lighthouse CI | Homepage | Score > 85 |

### Tests Clavier

| Objectif | Méthode | Scénario |
|---|---|---|
| Compléter un devis sans souris | Tab + Enter | Homepage → chat → 12 échanges → confirmation |
| Naviguer vers une landing page | Tab uniquement | Atteindre footer → cliquer "VTC Montpellier" |
| Vérifier focus visible | Oeil nu | Tabber sur chaque élément interactif |

### Tests Lecteur d'Écran

| Objectif | Outil | Scénario |
|---|---|---|
| Identifier l'input chat | VoiceOver macOS | Focus sur l'input → entendre le label |
| Recevoir réponse d'Élia | VoiceOver iOS | Envoyer un message → attendre annonce réponse |
| Loading state | NVDA Windows | Envoyer → entendre "Élia est en train de répondre" |

### Tests Mobile

| Objectif | Méthode | Scénario |
|---|---|---|
| Chat à 200% zoom | iPhone Safari, zoom 200% | Compléter un échange — UI reste utilisable |
| VoiceOver iOS | iPhone | Parcours complet du chat |
| Taille des boutons | Mesure visuelle | Bouton "Envoyer" ≥ 44×44px |

### Tests Animation

| Objectif | Méthode | Scénario |
|---|---|---|
| Reduced motion | macOS → Préférences → Réduire les animations | Ouvrir la page — animations supprimées ou réduites |

---

## 15. Scénarios de Test Manuel

### Scénario 1 — Compléter le devis Élia au clavier

**Précondition :** Aucune souris branchée. Browser macOS.  
**Étapes :**
1. Ouvrir la homepage.
2. Appuyer Tab jusqu'à atteindre le chat.
3. Taper "Bonjour" + Enter.
4. Vérifier qu'une réponse apparaît et est annoncée.
5. Continuer jusqu'à la confirmation finale.

**Résultat attendu :** Parcours complet sans souris, chaque réponse annoncée par VoiceOver.  
**Risque couvert :** C1, C2, C3

---

### Scénario 2 — Navigation lecteur d'écran (VoiceOver)

**Précondition :** VoiceOver activé (Cmd+F5 macOS).  
**Étapes :**
1. Ouvrir la homepage.
2. Naviguer avec VO+Right pour parcourir tous les éléments.
3. Vérifier que les titres, landmarks, et contenu sont bien annoncés.
4. Vérifier que les textes décoratifs ("DEVIS", "VTC") sont ignorés.

**Résultat attendu :** Structure logique, pas de contenu parasite.  
**Risque couvert :** HTML sémantique, ARIA

---

### Scénario 3 — Reduced Motion

**Précondition :** macOS → Accessibilité → Réduire les animations → activé.  
**Étapes :**
1. Ouvrir la homepage.
2. Observer le LoadingScreen, le hero, les scènes.

**Résultat attendu :** Animations réduites ou absentes.  
**Risque couvert :** C4 / WCAG 2.3.3

---

## 16. Outillage Recommandé

| Domaine | Outil | Priorité |
|---|---|---|
| Linting JSX a11y | `eslint-plugin-jsx-a11y` | P1 |
| Audit automatisé | axe DevTools (extension Chrome) | P1 |
| Test lecteur d'écran | VoiceOver (macOS/iOS) | P0 |
| Contraste couleurs | Colour Contrast Analyser (Paciello Group) | P1 |
| Lighthouse | Lighthouse CI (GitHub Actions) | P2 |
| Tests automatisés | `jest-axe` + Jest/RTL | P2 |

---

## 17. Verdict Final

**Les utilisateurs voyants naviguant au clavier peuvent utiliser le site.** La structure sémantique générale est correcte (main, sections, h1→h2→h3, footer avec aria-label). Les éléments décoratifs sont bien masqués.

**Les utilisateurs de lecteur d'écran ne peuvent pas compléter le devis.** Le chat Élia — seul canal de conversion du site — est inaccessible aux personnes aveugles ou malvoyantes : input non identifiable, réponses silencieuses, chargement non annoncé. Ces trois corrections (P0-A1, P0-A2, P0-A3) représentent **20 minutes de travail** et débloqueraient entièrement le parcours critique.

**Les utilisateurs avec troubles vestibulaires sont exposés** à des animations agressives sans possibilité de les désactiver. La correction `prefers-reduced-motion` est plus longue (2-4h) mais nécessaire pour WCAG 2.3.3.

**Chemin le plus court vers un site accessible :**
1. Les 3 quick wins P0 (label, live region, loading state) → 20 min → parcours Élia débloqué
2. Skip link + `:focus-visible` → 25 min → navigation clavier acceptable
3. `prefers-reduced-motion` → 3h → conformité WCAG sur les animations

**Total pour atteindre 7/10 : ~4 heures de travail.**

**Accessibility decision : MVP Utilisable Avec Risques Accessibilité**
