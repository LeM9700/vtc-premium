# Rapport d'Audit Performance — VTCLAND

**Date :** 2026-07-14  
**Auditeur :** Claude (Sonnet 4.6)  
**Scope :** Frontend, rendu, API, IA, médias, mobile, cache, monitoring

---

## 🔄 MISE À JOUR — 2026-07-16

| ID | Finding | Statut |
|---|---|---|
| B1 | `vehicle_scrub.mp4` 43 Mo | ⚠️ **PARTIEL** — copie compressée générée (9,6 Mo, -78%), au-dessus de la cible <5 Mo, **pas encore branchée dans le code** (en attente de validation visuelle) |
| B2 | Chat IA sans streaming | ✅ **CORRIGÉ** — streaming SSE implémenté (`app/api/chat/route.ts` + `SceneContact.tsx`), premiers caractères affichés dès réception |
| B3 | Aucun timeout sur appels externes | ✅ **CORRIGÉ** — 8s sur ORS, 12s sur Anthropic |
| F-FE1 | `preload="auto"` sur hero.mp4 | ✅ **CORRIGÉ** — `preload="none"` |
| F-MEDIA2 | `vehicle.mp4` 20 Mo | ⚠️ **PARTIEL** — copie compressée générée (8,9 Mo, -55%), pas encore branchée |
| F-MEDIA4 | `.MOV` bruts + doublon 56 Mo dans `public/` | ✅ **CORRIGÉ** — déplacés vers `raw-footage/` (gitignored), plus servis publiquement |
| F-AI3 | System prompt envoyé depuis le client | ✅ **CORRIGÉ** — voir security.md P0-1 |
| F-AI4 | Pas de suivi des coûts tokens Anthropic | ✅ **CORRIGÉ** — `console.log('[chat] tokens:', ...)` |
| F-MON1 | Aucun monitoring | ✅ **CORRIGÉ** — Sentry (erreurs) + Vercel Speed Insights (Core Web Vitals) |
| F-RENDER1 | Landing pages full CSR | ❌ Non traité |
| P2-BE1 | Géocodages non mis en cache | ❌ Non traité |

**Nouveau score estimé : 6,5/10** (était 3,5/10). Le vrai plafond restant : brancher (ou non) les vidéos compressées dans le code après validation visuelle — c'est le dernier gros gain de performance mobile disponible.

---

## 🔄 MISE À JOUR — 2026-07-18

**B1/F-MEDIA2 (vidéos) :** ✅ **RÉSOLU** depuis le 2026-07-18 (voir `production.md` P0-6) — `vehicle_scrub.mp4` compressé (43 Mo → 9,6 Mo) est branché dans `SceneVehicle.tsx`, `.MOV` bruts et `vehicle.mp4` déplacés vers `raw-footage/` (gitignored). Le statut "⚠️ PARTIEL" ci-dessus est obsolète.

**Lighthouse mobile enfin exécuté** (jamais fait dans les passes précédentes malgré la recommandation) — `npx lighthouse` contre un build de production local (`next build && next start`), profil mobile, throttling réseau simulé (proxy raisonnable pour "iPhone Safari 4G", qu'un vrai device/réseau cellulaire ne peut pas être testé depuis cet environnement) :

| Catégorie | Score |
|---|---|
| Performance (mobile) | **62-63/100** |
| Accessibility | **96/100** |
| Best Practices | **96/100** |
| SEO | **100/100** |

Métriques clés : FCP 1,5s, LCP 4,2s, TBT 690ms, CLS 0, Speed Index 6,1s, TTI 4,4s.

**Sous la cible de 65 fixée dans le plan de tests** (`fix-plan.md` §9), de peu. Opportunité principale identifiée : `unused-javascript` (~97 KiB estimés récupérables) — non traité dans cette passe, chantier séparé (code splitting / lazy loading des scènes hors viewport).

**Régression trouvée via cette même exécution Lighthouse (hors scope perf, mais découverte par l'outil) :** `favicon.ico` manquant causait un 404 sur chaque page (fichier supprimé sans remplacement — voir git status). Corrigé : `app/icon.png` généré à partir du logo (`og-image.jpg`), Next.js le sert désormais automatiquement (`sizes`/`type` détectés).

**Découverte critique — scripts Vercel Analytics/Speed Insights en 404 permanent :** `@vercel/analytics` et `@vercel/speed-insights` chargent `/_vercel/insights/script.js` et `/_vercel/speed-insights/script.js`, des endpoints **fournis uniquement par l'edge network Vercel**. Si le site est réellement hébergé sur Railway (comme l'indiquent les mentions légales), ces scripts ne fonctionneront **jamais**, sur aucun environnement — ce n'est pas un artefact du test local. Décision utilisateur requise : soit déployer réellement sur Vercel (et corriger les mentions légales), soit remplacer ces deux packages par une solution compatible Railway (ex: Plausible auto-hébergé, ou simplement les retirer). Non résolu dans cette passe — nécessite un choix de plateforme, pas un correctif de code.

---

## 1. Résumé Exécutif

**Verdict : MVP Utilisable Avec Risques Performance**

Le parcours de conversion fonctionnel en desktop et connexion correcte, mais trois bottlenecks compromettent sérieusement la production commerciale :

1. **`vehicle_scrub.mp4` pèse 43 Mo** — un seul fichier vidéo détruit les performances mobile et peut faire échouer le déploiement sur des CDN avec limites de taille.
2. **Aucun streaming IA** — chaque échange avec Élia bloque 1 à 4 secondes, affichant uniquement des points animés au lieu d'une réponse progressive.
3. **Aucun timeout sur les appels externes** — OpenRouteService ou Anthropic qui traîne peut bloquer la requête indéfiniment, freezant l'expérience utilisateur.

---

## 2. Contexte Performance du Projet

| Dimension | Valeur |
|---|---|
| Type | Site vitrine local + assistant IA (chauffeur privé) |
| Utilisateurs cibles | B2C, clientèle premium, France (Occitanie) |
| Framework frontend | Next.js 16 (App Router), React 19 |
| Rendu | CSR quasi-total (`'use client'` sur toutes les scènes) |
| Backend | Next.js Route Handlers serverless |
| Base de données | Aucune |
| IA | Anthropic `claude-haiku-4-5`, sans streaming |
| Médias | 3 vidéos (75 Mo utiles), 6 images hero webp |
| Déploiement | Non confirmé (probablement Vercel) |
| Traffic attendu | Faible à modéré (service local) |
| Parcours critique | Chat Élia → devis email |

---

## 3. Scorecard Performance

| Catégorie | Score /10 | Statut |
|---|---:|---|
| Performance Frontend | 4 | ⚠️ Risques |
| Core Web Vitals | 3 | ❌ Faible |
| Stratégie de rendu | 4 | ⚠️ Sous-optimal |
| Performance Backend | 5 | ⚠️ MVP |
| Latence API | 4 | ⚠️ Risques |
| Performance Base de données | N/A | — |
| Cache | 1 | ❌ Absent |
| Optimisation Médias | 2 | ❌ Critique |
| Performance IA | 4 | ⚠️ Sans streaming |
| Vector Search | N/A | — |
| Background Jobs | N/A | — |
| Infrastructure | Inconnu | — |
| Performance Mobile | 2 | ❌ Critique |
| Temps Réel | N/A | — |
| Monitoring | 1 | ❌ Absent |
| Tests Performance | 0 | ❌ Absent |

**Score global : 3.5 / 10**

---

## 4. Bottlenecks Critiques

### B1 — `vehicle_scrub.mp4` : 43 Mo pour une animation de scroll

**Sévérité :** Critique  
**Priorité :** P0  
**Zone :** Médias / Mobile  

**Preuve :** `public/videos/vehicle_scrub.mp4` — 43 Mo confirmé via `du -sh`.

**Impact performance :** Sur une connexion 10 Mbit/s (connexion mobile LTE correcte), le téléchargement prend 34 secondes. Sur 3G : plusieurs minutes. Sur mobile bas de gamme : timeout navigateur.

**Impact utilisateur :** La section véhicule est vide ou figée jusqu'à la fin du téléchargement. L'effet de scrubbing est basé sur `video.currentTime` manipulé via GSAP ScrollTrigger — si la vidéo n'est pas chargée, l'effet est muet.

**Impact business :** Le service cible une clientèle premium en déplacement qui consulte souvent depuis un mobile (aéroport, gare). Une page qui met 30 secondes à charger = rebond immédiat.

**Cause technique :** Vidéo `.mp4` non compressée exportée pour un effet frame-par-frame de scroll scrubbing. Format inadapté à un usage web.

**Correction recommandée :**
```
Option A (rapide) : Compresser avec ffmpeg — objectif < 5 Mo
  ffmpeg -i vehicle_scrub.mp4 -vcodec libx264 -crf 28 -preset slow -movflags +faststart vehicle_scrub_opt.mp4

Option B (optimale) : Remplacer par une séquence d'images WebP pilotée par JS
  → 50-100 frames WebP de 30-50 KB chacune = chargement progressif possible

Option C (mobile) : Désactiver le scrubbing sur mobile, afficher une image statique
```

**Effort estimé :** 2-4h  
**Bloquant production :** Oui pour mobile.

---

### B2 — Chat IA sans streaming (attente bloquante 1-4s par message)

**Sévérité :** Haute  
**Priorité :** P1  
**Zone :** IA / UX  

**Preuve :** `app/api/chat/route.ts:41-47`
```ts
const response = await client.messages.create({
  model: 'claude-haiku-4-5',
  max_tokens: 1024,
  system,
  messages,
})
const content = response.content[0]?.type === 'text' ? response.content[0].text : ''
return NextResponse.json({ content })
```
Anthropic SDK supporte `stream: true` mais ce n'est pas utilisé. L'API attend la réponse complète avant de répondre.

**Impact performance :** Claude Haiku génère ~150-200 tokens/s. Pour une réponse de 100 mots (~130 tokens), l'attente côté client est de 2-3 secondes de silence (indicateur "..."). Pour la confirmation finale (200+ mots), 4-6 secondes.

**Impact utilisateur :** Le chat ressemble à un service lent alors que Haiku est le modèle le plus rapide d'Anthropic. Le streaming donnerait une apparence de réactivité quasi immédiate.

**Correction recommandée :**
```ts
// Route API : streaming SSE
const stream = client.messages.stream({ model: 'claude-haiku-4-5', max_tokens: 1024, system, messages })
return new Response(stream.toReadableStream(), {
  headers: { 'Content-Type': 'text/event-stream' }
})

// SceneContact : consommer le stream
const reader = res.body?.getReader()
// ... decoder et mettre à jour le state caractère par caractère
```

**Effort estimé :** 3-5h  
**Bloquant production :** Non (fonctionnel mais mauvaise UX).

---

### B3 — Aucun timeout sur les appels externes (Anthropic, OpenRouteService, Resend)

**Sévérité :** Haute  
**Priorité :** P1  
**Zone :** Backend / Fiabilité  

**Preuve :**
- `app/api/chat/route.ts` : aucun `AbortController`, aucun timeout SDK
- `app/api/distance/route.ts` : 3 `fetch()` sans `signal`
- `app/api/devis/route.ts` : 2 appels Resend sans timeout

**Impact performance :** Si un provider externe est lent (dégradation partielle, rate limit), la requête Next.js serverless reste suspendue. Sur Vercel, le timeout par défaut est 10s (Pro) ou 30s (functions configurées). Un hang à 35s → error 504 côté utilisateur.

**Impact business :** Élia répond "Une erreur est survenue" sans information, le devis est perdu.

**Correction recommandée :**
```ts
// /api/distance — AbortController avec 8s
const controller = new AbortController()
const timeout = setTimeout(() => controller.abort(), 8_000)
const res = await fetch(url, { signal: controller.signal })
clearTimeout(timeout)
```

**Effort estimé :** 1-2h  
**Bloquant production :** Non en conditions normales, oui en cas de dégradation provider.

---

## 5. Findings Détaillés par Domaine

### Frontend

**F-FE1 — `preload="auto"` sur hero.mp4 (12 Mo)**
- Problème : La vidéo hero demande au navigateur de précharger l'intégralité du fichier 12 Mo avant le premier rendu utile.
- Preuve : `SceneHero.tsx:185` — `preload="auto"`
- Impact : LCP dégradé, bande passante monopolisée, TBT augmenté sur mobile.
- Correction : `preload="none"` ou `preload="metadata"`. La vidéo démarre après le `loading:complete` event — le preload anticipé n'est pas utile.
- Priorité : P1

**F-FE2 — LoadingScreen de 1.8s bloque le TTI intentionnellement**
- Problème : `LoadingScreen.tsx` joue une animation de 1.8s au premier chargement avant de révéler le contenu. C'est un choix de marque, mais FCP et TTI sont mathématiquement dégradés.
- Impact : Google PageSpeed Insights va pénaliser. Vitals CWV impactés.
- Correction : Conserver l'animation mais considérer de rendre le hero visible immédiatement (overlay CSS), ou accepter la note Lighthouse comme compromis de marque.
- Priorité : P2 (choix de design assumé)

**F-FE3 — CustomCursor : GSAP tween sur chaque `mousemove`**
- Problème : `CustomCursor.tsx:19-22` — `gsap.to(dot, { duration: 0.1 })` + `gsap.to(ring, { duration: 0.45 })` appelés à chaque pixel de déplacement de souris.
- Impact : GSAP gère cela proprement grâce à l'overwrite, mais cela produit des tâches JS courtes en rafale → INP potentiellement dégradé sur machines lentes.
- Correction : Utiliser `gsap.quickTo()` pour des performances optimales sur mousemove.
- Priorité : P3

**F-FE4 — Pas de `@next/bundle-analyzer`**
- Problème : La taille réelle du bundle client est inconnue. GSAP seul pèse ~70KB gzippé, Lenis ~15KB, SplitType ~5KB.
- Correction : `npm install --save-dev @next/bundle-analyzer`, analyser avant déploiement.
- Priorité : P2

---

### Core Web Vitals

**F-CWV1 — LCP dégradé : vidéo 12 Mo en autoplay avec preload="auto"**
- La vidéo est le plus grand élément visible au premier rendu. LCP sera mesuré sur cet élément. Une vidéo de 12 Mo = LCP > 4s sur mobile.
- Recommandation : Utiliser une image de fallback (`poster` attribute sur `<video>`) optimisée pour le LCP, puis charger la vidéo en arrière-plan.

**F-CWV2 — og-image.jpg absent → erreur 404 sur LCP pour les partages**
- `/og-image.jpg` manquant (référencé dans `app/layout.tsx:49-55`).
- Impact : 404 pour chaque crawl OG, potentielle requête échouée au chargement.

**F-CWV3 — CLS : dimensions vidéo non déclarées**
- `<video>` n'a pas de `width`/`height` attributs → le navigateur ne réserve pas l'espace → layout shift possible à l'arrivée du premier frame.

**F-CWV4 — INP : SplitType sur le titre hero**
- `SplitType(title)` au mount découpe le DOM en dizaines d'éléments span. Opération synchrone au mount → peut bloquer le thread principal brièvement.

---

### Stratégie de Rendu

**F-RENDER1 — Toute la page est CSR**
- Toutes les scènes utilisent `'use client'`. Le HTML initial livré par le serveur est quasi-vide. Les bots SEO et l'indexation des landing pages dépendent du rendu JavaScript.
- Contexte : GSAP + Lenis nécessitent `'use client'`, mais les textes SEO (titres H1, descriptions, JSON-LD) pourraient être dans des Server Components parents.
- Impact : Les landing pages SEO locales (`/vtc-montpellier`, etc.) sont rendues côté client, ce qui peut dégrader l'indexabilité.
- Priorité : P1

**F-RENDER2 — Pas de `loading.tsx` ni skeleton**
- Aucun état de chargement intermédiaire par route. La page est soit blanche, soit complète.
- Priorité : P2

---

### Backend

**F-BE1 — `new Resend()` instancié à chaque requête**
- `app/api/devis/route.ts:26` — le client Resend est créé dans le handler.
- Correction : Hisser l'instanciation au niveau module.
- Priorité : P3

**F-BE2 — `/api/distance` : 3 appels réseau séquentiels (2 géocodages + 1 routage)**
- Les 2 géocodages sont parallèles (`Promise.all`), puis le routage est séquentiel.
- Latence totale estimée : 400ms–1.5s pour ORS en conditions normales.
- Aucune mise en cache des géocodages (même adresse → appel à chaque fois).
- Priorité : P2

---

### Cache

**F-CACHE1 — Aucune stratégie de cache nulle part**
- `next.config.ts` vide → pas de headers `Cache-Control` personnalisés.
- API routes sans cache → chaque appel Anthropic, ORS, Resend génère une requête réseau.
- Les assets statiques (images, vidéos) sont servis sans indication de cache explicite.
- Priorité : P2

---

### Médias

**F-MEDIA1 — `vehicle_scrub.mp4` : 43 Mo** → voir B1 (Critique)

**F-MEDIA2 — `vehicle.mp4` : 20 Mo**
- Vidéo de présentation du véhicule dans `SceneVehicle`. 20 Mo pour une vidéo "ambiance" est trop lourd.
- Objectif recommandé : < 3 Mo avec `ffmpeg -crf 28`.
- Priorité : P0 (mobile)

**F-MEDIA3 — `hero.mp4` : 12 Mo avec `preload="auto"`**
- Voir F-FE1. Objectif : < 5 Mo, `preload="none"`.
- Priorité : P1

**F-MEDIA4 — Fichiers iOS bruts : `IMG_0483.MOV` (32 Mo) + `IMG_0485.MOV` (24 Mo)**
- Ces fichiers sont dans `public/videos/` et donc servis publiquement depuis la prod.
- Ils ne sont référencés nulle part dans le code.
- Impact : Alourdissent le déploiement de 56 Mo. Accessible en direct via URL.
- Correction : Supprimer immédiatement.
- Priorité : P0

**F-MEDIA5 — `IMG_0485.mp4` : 12 Mo**
- Doublon probable du fichier MOV converti. Non référencé dans le code.
- Correction : Vérifier si utilisé, sinon supprimer.
- Priorité : P1

**F-MEDIA6 — Images hero webp correctement dimensionnées**
- Les 6 images hero (64–272 Ko) sont en webp, utilisées avec `next/image` (fill + priority).
- `hero-mariage-gard.webp` à 272 Ko est le plus lourd — acceptable.
- Bon point.

---

### IA

**F-AI1 — Pas de streaming → UX dégradée** → voir B2

**F-AI2 — Pas de timeout sur l'appel Anthropic** → voir B3

**F-AI3 — Prompt système envoyé depuis le client**
- Le `system` prompt est construit côté client et envoyé dans le corps de la requête POST.
- Chaque message inclut le prompt complet (~600 tokens) + l'historique croissant.
- À 20 échanges : l'historique peut atteindre 3000–5000 tokens input, soit ~$0.002 par conversation complète avec Haiku (acceptable).
- Le vrai risque : un acteur malveillant injectant un `system` prompt plus long → coût de tokens non contrôlé.
- Priorité : P1 (voir aussi audit sécurité P0-S1)

**F-AI4 — Pas de suivi des coûts IA**
- Aucun log de `usage.input_tokens` / `usage.output_tokens` de la réponse Anthropic.
- Impossible de monitorer le coût réel ou détecter un abus.
- Priorité : P2

---

### Mobile

**F-MOB1 — Videos 43 Mo + 20 Mo + 12 Mo sur mobile** → voir B1, F-MEDIA2, F-MEDIA3

**F-MOB2 — CustomCursor inutile sur mobile**
- `CustomCursor.tsx` s'attache à `window.addEventListener('mousemove', ...)`. Sur mobile (touch), aucun `mousemove` → les éléments DOM persistent dans le layout sans impact.
- Correction : Conditionner l'injection avec `window.matchMedia('(pointer: fine)')`.
- Priorité : P2

**F-MOB3 — `preload="auto"` sur un réseau mobile = catastrophe**
- 12 Mo de vidéo hero démarrés en préchargement automatique sur une connexion 4G = ~10s, 3G = indéfini.
- Priorité : P1

---

### Monitoring

**F-MON1 — Aucun monitoring de performance**
- Pas de Vercel Analytics, pas de Sentry, pas de Lighthouse CI, pas de Plausible, pas d'OpenTelemetry.
- Les temps de réponse API, les erreurs Resend, les timeouts ORS sont invisibles en production.
- Priorité : P1

---

## 6. Performance des Parcours Critiques

### Parcours A — Visite homepage → demande de devis (desktop, fibre)

**Flow :**
```
DNS + TTFB (~100ms)
→ HTML initial (quasi-vide, CSR)
→ JS bundle (GSAP + Lenis + SplitType + scènes) (~500ms-1s)
→ LoadingScreen anime 1.8s
→ hero.mp4 commence à se charger (preload="auto", 12 Mo)
→ Scroll vers #contact → chat visible
→ Premier message → POST /api/chat (~1.5-3s Haiku sans stream)
→ ...12 échanges... chacun 1-3s
→ POST /api/distance (2 géocodages + routage, ~500ms-1.5s)
→ POST /api/devis (2 emails Resend parallèles, ~300ms-800ms)
```

**Bottleneck principal :** LoadingScreen 1.8s + 12 échanges × 2s = ~25-30 secondes pour un devis complet.  
**Verdict : Acceptable** (le chat IA implique structurellement du temps d'attente).

---

### Parcours B — Visite homepage → véhicule section (mobile 4G)

**Flow :**
```
Page charge (CSR) →
vehicle_scrub.mp4 commence à se télécharger (43 Mo sur 4G ≈ 34s+)
→ Scroll sur SceneVehicle avant fin du téléchargement
→ Vidéo de scrubbing : bloquée ou muette
```

**Verdict : Risqué** (feature centrale cassée sur mobile).

---

### Parcours C — Landing page SEO (Googlebot / utilisateur mobile)

**Flow :**
```
GET /vtc-montpellier
→ HTML quasi-vide (CSR)
→ JS bundle nécessaire pour voir le contenu
→ Image hero webp chargée via next/image (bonne pratique)
→ hero.mp4 non chargé (heroImageSrc utilisé à la place sur les landing pages — bon)
```

**Verdicts :**
- Googlebot avec JS : Acceptable
- Googlebot sans JS (premier passage) : Risqué (contenu invisible)
- Mobile : Acceptable si vehicle_scrub.mp4 n'est pas dans le viewport immédiat

---

## 7. Évaluation Performance IA

| Aspect | État | Détail |
|---|---|---|
| Modèle | ✅ Haiku 4-5 | Modèle le plus rapide et économique d'Anthropic |
| Streaming | ❌ Absent | Bloque 1-4s par réponse |
| Taille du prompt | ⚠️ Croissant | Historique complet envoyé à chaque message |
| max_tokens | ✅ 1024 | Limite correcte pour du conversationnel |
| Timeout | ❌ Absent | Risque de hang indéfini |
| Fallback provider | ❌ Absent | Si Anthropic KO, chat mort |
| Suivi coûts | ❌ Absent | Impossible de mesurer le coût/lead |
| Cache | N/A | Non applicable (conversation unique) |
| Off-topic filter | ✅ Côté serveur | Évite des appels Anthropic inutiles |

**Verdict IA : Fonctionnel, manque de streaming et de timeout.**

---

## 8. Évaluation Base de Données

**Aucune base de données détectée.**

Les données de devis sont transmises uniquement par email. Pas de persistence. Ce design simplifie l'architecture mais rend impossible tout reporting ou reprise en cas d'échec.

---

## 9. Évaluation Core Web Vitals

| Métrique | Estimation | Risque |
|---|---|---|
| LCP | > 4s mobile | ❌ Critique (vidéo 12 Mo) |
| CLS | Faible | ⚠️ Possible (vidéo sans dimensions) |
| INP | Modéré | ⚠️ SplitType au mount, GSAP |
| FCP | ~2s desktop | ⚠️ LoadingScreen 1.8s intentionnel |
| TTFB | ~100-200ms | ✅ Next.js serverless |

**Outils recommandés :** Lighthouse CI dans GitHub Actions, WebPageTest (multi-location), Vercel Speed Insights (si Vercel).

---

## 10. P0 — Blocage Production

| ID | Problème | Impact |
|---|---|---|
| P0-M1 | `vehicle_scrub.mp4` 43 Mo | Section véhicule cassée sur mobile |
| P0-M2 | `vehicle.mp4` 20 Mo | Chargement anormal sur mobile |
| P0-M3 | `IMG_0483.MOV` 32 Mo + `IMG_0485.MOV` 24 Mo en public/ | 56 Mo servis publiquement inutilement |

---

## 11. P1 — Optimisations Haute Priorité

| ID | Problème | Impact |
|---|---|---|
| P1-AI1 | Pas de streaming IA | UX chat lente, conversion réduite |
| P1-AI2 | Pas de timeout Anthropic/ORS | Hang indéfini possible |
| P1-FE1 | `preload="auto"` hero.mp4 | LCP dégradé, bande passante mobile |
| P1-MON1 | Pas de monitoring | Incidents invisibles en production |
| P1-RENDER1 | Pages SEO full CSR | Indexabilité landing pages à risque |

---

## 12. P2 — Améliorations

| ID | Problème |
|---|---|
| P2-FE1 | Bundle non analysé (pas de `@next/bundle-analyzer`) |
| P2-FE2 | CustomCursor inutile sur mobile (events attachés pour rien) |
| P2-CACHE1 | Aucun cache sur les assets, aucun header `Cache-Control` |
| P2-AI1 | Pas de suivi des coûts tokens Anthropic |
| P2-MEDIA1 | Compresser hero.mp4 (objectif < 4 Mo) |
| P2-BE1 | Géocodages non mis en cache (même adresse → appel ORS) |

---

## 13. P3 — Optimisations Facultatives

| ID | Problème |
|---|---|
| P3-FE1 | CustomCursor : `gsap.quickTo()` à la place de `gsap.to()` sur mousemove |
| P3-BE1 | `new Resend()` instancié à chaque requête → hisser au niveau module |
| P3-MEDIA1 | `IMG_0485.mp4` non référencé → vérifier et supprimer |
| P3-VIDEO1 | Attribut `poster` sur `<video>` pour améliorer LCP perçu |

---

## 14. Quick Wins (< 30 min chacun)

1. **Supprimer `IMG_0483.MOV` + `IMG_0485.MOV`** du repo → 56 Mo en moins, 5 min.
2. **Changer `preload="auto"` → `preload="none"`** sur `SceneHero.tsx:185` → 2 min, gain LCP immédiat.
3. **Logger les tokens Anthropic** : `console.log('[chat] tokens:', response.usage)` → 1 ligne, visibilité coût immédiate.
4. **Ajouter un AbortController 8s** sur les fetch de `/api/distance` → 15 min, protection hang ORS.
5. **Hisser `new Resend()`** au niveau module dans `api/devis/route.ts` → 2 min.

---

## 15. Tests Performance Suggérés

### Tests Frontend

| Objectif | Outil | Scénario | Résultat attendu |
|---|---|---|---|
| LCP réel | Lighthouse CI | Homepage desktop et mobile | LCP < 2.5s desktop, < 4s mobile |
| Bundle size | `@next/bundle-analyzer` | `npm run build` | Identifier les chunks > 100 Ko |
| CWV continu | Vercel Speed Insights | Trafic réel | Alerte si LCP > 2.5s |

### Tests API

| Objectif | Outil | Scénario | Résultat attendu |
|---|---|---|---|
| Latence chat IA | Manuel / Postman | POST /api/chat avec message court | Réponse < 3s |
| Latence distance | Manuel / Postman | POST /api/distance (Montpellier → Nîmes) | Réponse < 2s |
| Comportement timeout | Manuel | Couper ORS, appeler /api/distance | Réponse erreur < 10s |

### Tests Mobile

| Objectif | Outil | Scénario | Résultat attendu |
|---|---|---|---|
| Chargement 4G | Chrome DevTools throttle | Ouvrir homepage en 4G simulé | Page utilisable < 5s |
| Section véhicule mobile | iPhone Safari / Android | Scroller vers SceneVehicle | Animation visible, pas bloquée |

### Tests de charge

| Objectif | Outil | Scénario | Résultat attendu |
|---|---|---|---|
| 10 chats simultanés | k6 ou Artillery | 10 VUs, 5 messages chacun | Pas de timeout, < 3s par réponse |

---

## 16. Scénarios de Test Manuel

- [ ] Ouvrir la homepage sur iPhone (4G) : vérifier que le hero se charge sans erreur, que la vidéo ne bloque pas l'UI
- [ ] Scroller jusqu'à la section véhicule : l'animation scrub fonctionne-t-elle ? Ou la vidéo n'est-elle pas chargée ?
- [ ] Compléter un devis Élia entier en mesurant le temps de chaque réponse (chronomètre)
- [ ] Couper le WiFi après envoi du message Élia : l'interface affiche-t-elle une erreur dans les 10 secondes ou reste-t-elle bloquée indéfiniment ?
- [ ] Lancer Lighthouse (mode mobile) sur la homepage : noter LCP, INP, CLS
- [ ] Lancer Lighthouse sur une landing page SEO (`/vtc-montpellier`) : vérifier que le contenu est indexable

---

## 17. Monitoring Recommandé

| Domaine | Outil recommandé | Métrique clé |
|---|---|---|
| Core Web Vitals | Vercel Speed Insights | LCP, INP, CLS en temps réel |
| Erreurs JS | Sentry (Free tier) | Taux d'erreur, stack traces |
| Uptime API | Better Stack (Free) | Ping /api/chat, /api/distance |
| Coût IA | Log `response.usage` → console | Tokens input/output par session |
| Analytics business | Plausible (léger, RGPD) | Pages vues, taux chat démarré, funnel Élia |

---

## 18. Verdict Final

**La performance est acceptable en desktop sur connexion correcte. Elle est inacceptable sur mobile.**

**Plus gros bottleneck :** `vehicle_scrub.mp4` à 43 Mo + `vehicle.mp4` à 20 Mo. Aucun service premium ne peut se permettre de proposer une expérience mobile de ce niveau à des clients qui réservent depuis un aéroport ou une gare.

**À corriger en premier :** Comprimer les vidéos (P0), supprimer les `.MOV` (P0), puis ajouter le streaming IA (P1) et les timeouts (P1).

**Ce qui peut attendre :** L'architecture de rendu CSR est un choix assumé pour les animations GSAP — acceptable pour un site vitrine local à trafic modéré. Le LoadingScreen de marque est un compromis de design acceptable.

**Chemin le plus court vers une release stable :**
1. Compresser `vehicle_scrub.mp4` → `< 5 Mo` (4h)
2. Compresser `vehicle.mp4` → `< 3 Mo` (2h)
3. Supprimer les `.MOV` (5 min)
4. `preload="none"` sur la vidéo hero (2 min)
5. Ajouter timeouts sur les fetch externes (2h)
6. Ajouter Sentry + Vercel Analytics (2h)

**Total : ~1.5 jour de travail pour passer de 3.5/10 à 7/10.**

**Performance decision : MVP Utilisable Avec Risques Performance**
