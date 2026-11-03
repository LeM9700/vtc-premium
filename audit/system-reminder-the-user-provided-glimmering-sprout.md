# VTCLAND — Plan de résolution exhaustif (P0 → P4)

## Contexte

Le site est en état **MVP avancé mais non déployable commercialement**. Sept audits croisés (discovery, features, performance, production, security, accessibility, seo-geo) ont identifié des risques sérieux : injection de prompt IA, perte silencieuse de leads, non-conformité RGPD, expérience mobile catastrophique (63 Mo de vidéos), et signaux SEO invalides (placeholders). Ce plan organise les corrections dans l'ordre qu'un développeur senior fullstack prioriserait : d'abord sécurité/légal/données, ensuite fiabilité, ensuite performance, puis SEO/contenu/accessibilité.

> ## 🔄 MISE À JOUR — 2026-07-16 : les 13 phases ont été exécutées
>
> | Phase | Statut |
> |---|---|
> | 1 — Sécurité critique | ✅ Fait (1.1-1.5) |
> | 2 — Fiabilité des leads | ✅ Fait (2.1-2.3) |
> | 3 — RGPD / Légal | ⚠️ Pages créées avec placeholders `[À COMPLÉTER]` — infos légales réelles à fournir |
> | 4 — Infrastructure & env | ⚠️ `.env.example` créé, fichier artefact supprimé ; vérification des vraies valeurs en prod hors périmètre code |
> | 5 — Médias & perf mobile | ⚠️ `.MOV`/doublon retirés de `public/` ; vidéos compressées générées mais **non branchées** (validation visuelle requise) ; `preload="none"` fait |
> | 6 — SEO critique | ✅ Fait (og-image déjà présent, JSON-LD corrigé — lien Maps retiré plutôt qu'inventé, voir note ci-dessous) |
> | 7 — Monitoring | ✅ Fait (Sentry scaffoldé, `/api/health`, Vercel Analytics + Speed Insights, log tokens) |
> | 8 — Accessibilité critique | ✅ Fait (8.1-8.8, y compris reduced-motion sur les 7 composants) |
> | 9 — SEO & GEO | ✅ Fait (9.1-9.6) |
> | 10 — Streaming IA | ✅ Fait — SSE, filtre du tag `<COLLECTED>` vérifié par tests unitaires runtime (non testé avec une vraie clé Anthropic) |
> | 11 — Qualité & maintenabilité | ✅ Fait (11.1-11.5) |
> | 12 — Contenu & GEO | ⚠️ `/a-propos` créée (placeholders identité chauffeur), CTA téléphonique fait ; enrichissement 200-300 mots sur 3 pages restantes non fait |
> | 13 — Optimisations P3 | ✅ Fait pour l'essentiel (quickTo, cursor mobile, aria-current, BreadcrumbList, WebSite schema sans SearchAction fictif) |
>
> **⚠️ Incohérence détectée dans ce plan et corrigée à l'exécution :** la phase 6.2 proposait de remplacer le faux lien Google Maps par `https://maps.app.goo.gl/NGnnj9U63svtLxAW6` — cette URL n'apparaît sourcée dans **aucun** des sept audits d'origine (qui la listent tous comme information manquante). Elle n'a **pas** été utilisée ; le champ `sameAs` a été omis du JSON-LD en attendant la vraie fiche Google Business.
>
> Détail par audit : voir la section "MISE À JOUR" en tête de `security.md`, `features.md`, `performance.md`, `accessibility.md`, `seo-geo.md`, `production.md` et `discovery.md`.

---

## PHASE 1 — Sécurité critique (P0) · ~4h

> Objectif : empêcher l'exploitation financière et la compromission de l'infrastructure avant tout trafic.

### 1.1 — Fixer le prompt injection (`/api/chat`)
**Fichiers :** `app/api/chat/route.ts`, `components/scenes/SceneContact.tsx`

- **Retirer** le paramètre `system` du corps de la requête client
- **Reconstruire** le system prompt entièrement côté serveur via `buildSystemPrompt(contextNote)`
- **Valider** que `contextNote` fait partie d'un whitelist (ex. : les 6 pages SEO)
- Jamais accepter `system` depuis `req.json()`

```ts
// AVANT (vulnérable)
const { messages, system } = await req.json()
// APRÈS (sécurisé)
const { messages, contextNote } = await req.json()
const system = buildSystemPrompt(validatedContextNote)
```

### 1.2 — Rate limiting serveur sur `/api/chat`
**Fichiers :** `app/api/chat/route.ts`, optionnellement `middleware.ts`

- L'actuel `X-Message-Count` header est forgeable par le client → **supprimer**
- Implémenter rate limiting basé sur IP en mémoire ou via `@upstash/ratelimit` (Redis)
- Limite recommandée : 25 messages / session IP / 10 min
- Ajouter `AbortController` + timeout 12s sur l'appel Anthropic

### 1.3 — Protéger `/api/devis` contre le spam email
**Fichiers :** `app/api/devis/route.ts`, `app/api/chat/route.ts`

- Générer un **one-time token** signé côté serveur à la fin du flow Élia (après collecte des 12 infos)
- Vérifier ce token dans `/api/devis` avant tout envoi Resend
- Ajouter rate limiting IP : 1 devis / IP / 10 min
- Valider tous les champs : format email, longueur adresses, prixEstime numérique

### 1.4 — Corriger l'injection HTML dans les emails Resend
**Fichier :** `app/api/devis/route.ts`

- Créer `escapeHtml(str)` utilitaire
- Appliquer à `name`, `phone`, `email`, `departure`, `destination` avant interpolation dans le template HTML

### 1.5 — Ajouter les headers de sécurité HTTP
**Fichier :** `next.config.ts`

```ts
headers: async () => [{
  source: '/(.*)',
  headers: [
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=()' },
    // CSP minimal → renforcer après stabilisation
    { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline'; ..." },
  ]
}]
```

---

## PHASE 2 — Fiabilité des leads (P0) · ~2h

> Objectif : garantir qu'aucun lead ne disparaît silencieusement.

### 2.1 — Corriger la réponse fausse de `/api/devis`
**Fichier :** `app/api/devis/route.ts`

- **Actuellement :** retourne `{ success: true }` même si l'email chauffeur échoue
- **Correction :** retourner HTTP 500 si l'email chauffeur échoue, avec message clair côté client : "Une erreur est survenue, appelez directement le 07 83 69 92 29"
- L'email client (confirmation) peut être tenté en best-effort séparé

### 2.2 — Corriger le prix €20 si géocodage échoue
**Fichier :** `components/scenes/SceneContact.tsx:199`, `app/api/distance/route.ts`

- `distanceKm = dist.distanceKm ?? 0` → distance 0 = prix minimum €20 affiché comme prix réel
- **Correction :** si `distanceKm` est null/undefined ou 0 après appel ORS, afficher message : "Impossible de calculer la distance automatiquement. Notre équipe vous contactera avec un devis personnalisé."
- Ne jamais envoyer un email avec un tarif €20 calculé sur 0 km

### 2.3 — Timeouts sur tous les appels externes
**Fichiers :** `app/api/chat/route.ts`, `app/api/distance/route.ts`, `app/api/devis/route.ts`

```ts
const controller = new AbortController()
const timeout = setTimeout(() => controller.abort(), 8_000)
try {
  const res = await fetch(url, { signal: controller.signal })
  clearTimeout(timeout)
} catch (e) {
  clearTimeout(timeout)
  if (e instanceof DOMException && e.name === 'AbortError') {
    return NextResponse.json({ error: 'Délai dépassé' }, { status: 504 })
  }
  throw e
}
```

---

## PHASE 3 — Conformité légale RGPD (P0) · ~3h

> Obligatoire en France avant tout trafic payant.

### 3.1 — Créer `/app/politique-de-confidentialite/page.tsx`
- Données collectées : nom, téléphone, email, adresses (géoloc indirecte), date/heure, nb passagers
- Sous-traitants : Anthropic (USA), Resend (USA), OpenRouteService (DE)
- Base légale : exécution d'un contrat (devis)
- Durée de conservation : données uniquement en email chauffeur, pas de base de données
- Droits : accès, rectification, suppression via email chauffeur

### 3.2 — Créer `/app/mentions-legales/page.tsx`
- Éditeur, hébergeur, contact
- Liens depuis `FooterSeo.tsx`

### 3.3 — Lier depuis le footer
**Fichier :** `components/layout/FooterSeo.tsx`
- Ajouter liens "Mentions légales" et "Politique de confidentialité" dans le footer sur toutes les pages

---

## PHASE 4 — Infrastructure & Environment (P0) · ~1h

### 4.1 — Créer `.env.example` documenté
- Lister toutes les variables requises avec description
- Inclure une validation au démarrage (ex. dans `app/layout.tsx` côté serveur)

### 4.2 — Vérifier les variables en production
- Checklist manuelle : confirmer que `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`, `CHAUFFEUR_EMAIL`, `OPENROUTESERVICE_API_KEY` sont configurées sur la plateforme de déploiement

### 4.3 — Supprimer le fichier artefact Windows
- Supprimer `C:UsersmelboAppDataLocalTempcommit_diff.txt` du working tree

---

## PHASE 5 — Médias & Performance mobile (P0) · ~4h

> 63 Mo de vidéos sur un site vitrine premium = KO mobile immédiat.

### 5.1 — Supprimer les fichiers MOV bruts iOS
**Fichiers à supprimer :** `public/videos/IMG_0483.MOV`, `public/videos/IMG_0485.MOV`, vérifier `IMG_0485.mp4`
- 5 min. Impact immédiat.

### 5.2 — Compresser `vehicle_scrub.mp4` (43 Mo → < 5 Mo)
```bash
ffmpeg -i vehicle_scrub.mp4 -vcodec libx264 -crf 28 -preset slow \
  -movflags +faststart vehicle_scrub_opt.mp4
```
- Si résultat encore > 5 Mo : envisager Option C (mobile = image statique, scrubbing désactivé en dessous de 768px)

### 5.3 — Compresser `vehicle.mp4` (20 Mo → < 3 Mo)
```bash
ffmpeg -i vehicle.mp4 -vcodec libx264 -crf 28 -preset slow \
  -movflags +faststart vehicle_opt.mp4
```

### 5.4 — Corriger `preload="auto"` sur hero.mp4
**Fichier :** `components/scenes/SceneHero.tsx:185`
- Changer `preload="auto"` → `preload="none"`
- Ajouter attribut `poster` pointant vers la hero image WebP correspondante

---

## PHASE 6 — SEO critique (P0) · ~1h

### 6.1 — Créer `public/og-image.jpg` (1200×630px)
- Image de marque VTCLAND (noir/or, logo, tagline)
- Requis par toutes les 7 pages pour les partages sociaux

### 6.2 — Corriger les placeholders JSON-LD
**Fichier :** `components/seo/JsonLd.tsx`
```ts
// AVANT
telephone: '+33XXXXXXXXX',
sameAs: ['https://www.google.com/maps/place/VTCLAND'],
// APRÈS
telephone: '+33783699229',
sameAs: ['https://maps.app.goo.gl/NGnnj9U63svtLxAW6'],
```

---

## PHASE 7 — Monitoring & Observabilité (P1) · ~3h

> Sans monitoring, les incidents de production sont invisibles.

### 7.1 — Intégrer Sentry (`@sentry/nextjs`)
- Installer et configurer Sentry
- Wrapper les 3 routes API (`/api/chat`, `/api/distance`, `/api/devis`) avec capture d'erreur
- Alertes email/Slack sur nouvelles erreurs

### 7.2 — Créer endpoint `/api/health`
**Fichier :** `app/api/health/route.ts`
```ts
export async function GET() {
  return NextResponse.json({ status: 'ok', timestamp: Date.now() })
}
```
- Configurer Better Stack (ou équivalent gratuit) pour ping toutes les 5 min

### 7.3 — Intégrer analytics
- **Option recommandée :** Plausible (lightweight, GDPR-friendly) ou Vercel Analytics
- Events clés : `chat_started`, `devis_completed`, `devis_failed`, `page_view`

### 7.4 — Logger les tokens Anthropic
**Fichier :** `app/api/chat/route.ts`
```ts
console.log('[chat] tokens:', response.usage)
```
- Coût estimé par lead = mesurable immédiatement

---

## PHASE 8 — Accessibilité critique (P0/P1) · ~3h

### 8.1 — P0-A1 : Ajouter label au chat input
**Fichier :** `components/scenes/SceneContact.tsx:414-428`
```tsx
<label htmlFor="chat-input" className="sr-only">
  Votre réponse à Élia
</label>
<input id="chat-input" aria-label="Votre réponse à Élia" ... />
```

### 8.2 — P0-A2 : Ajouter `aria-live` sur le container de messages
**Fichier :** `components/scenes/SceneContact.tsx:354-395`
```tsx
<div role="log" aria-live="polite" aria-label="Conversation avec Élia">
  {messages.map(...)}
</div>
```

### 8.3 — P0-A3 : Rendre l'indicateur de chargement accessible
**Fichier :** `SceneContact.tsx:373-385`
```tsx
<div aria-label="Élia réfléchit..." role="status">
  <span aria-hidden="true">...</span>
  {/* 3 dots */}
</div>
```

### 8.4 — P1-A1 : Ajouter un skip link
**Fichier :** `app/layout.tsx`
```tsx
<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 ...">
  Aller au contenu principal
</a>
```

### 8.5 — P1-A2 : Ajouter focus rings visibles
**Fichier :** `app/globals.css`
```css
:focus-visible {
  outline: 2px solid #C9A96E; /* or VTCLAND */
  outline-offset: 2px;
}
```
Supprimer `outline-none` des composants interactifs.

### 8.6 — P1-A3 : Support `prefers-reduced-motion`
**Fichiers :** `LoadingScreen.tsx`, `SceneHero.tsx`, `SceneIdentity.tsx`, `SceneVehicle.tsx`, `SceneServices.tsx`, `SceneContact.tsx`, `CustomCursor.tsx`
```ts
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
// Conditionner toutes les animations GSAP
if (!prefersReduced) { gsap.to(...) }
```

### 8.7 — P1-A5 : Annoncer les changements de phase du chat
**Fichier :** `SceneContact.tsx:388-409`
```tsx
<div role="status" aria-live="assertive" className="sr-only">
  {phase === 'calculating' ? 'Calcul du devis en cours...' : ''}
  {phase === 'limit' ? 'Limite de messages atteinte.' : ''}
  {phase === 'expired' ? 'Session expirée.' : ''}
</div>
```

### 8.8 — P1-A6 : Ajouter contrôles pause/play sur la vidéo hero
**Fichier :** `components/scenes/SceneHero.tsx:179-188`
- Ajouter bouton "Pause vidéo" visible au focus clavier

---

## PHASE 9 — SEO & GEO (P1) · ~5h

### 9.1 — Enrichir les schemas JSON-LD des landing pages
**Fichiers :** `app/vtc-montpellier/page.tsx`, `app/vtc-nimes/page.tsx`, et 4 autres pages SEO

Ajouter sur chaque page :
```ts
const jsonLd = {
  '@type': 'TaxiService',
  name: '...',
  telephone: '+33783699229',
  address: { '@type': 'PostalAddress', addressLocality: '...', addressRegion: 'Occitanie' },
  geo: { '@type': 'GeoCoordinates', latitude: '...', longitude: '...' },
  priceRange: '€€',
  openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday',...], opens: '00:00', closes: '23:59' }],
  provider: { '@type': 'Organization', name: 'VTCLAND' },
}
```

### 9.2 — Ajouter alt text significatif aux images hero
**Fichier :** `components/scenes/SceneHero.tsx:172`
- Ajouter prop `imageAlt` à `SceneHeroProps`
- Chaque landing page passe son alt contextuel

### 9.3 — Ajouter sections FAQ avec schema `FAQPage`
**Pages cibles :** homepage + `/vtc-montpellier`, `/vtc-nimes`, `/transfert-aeroport-montpellier`

Questions prioritaires :
- "Combien coûte un transfert aéroport Montpellier ?"
- "Puis-je réserver un VTC la nuit en Occitanie ?"
- "Comment fonctionne la réservation avec Élia ?"
- "Quels véhicules propose VTCLAND ?"

### 9.4 — Créer `public/llms.txt`
- Fichier de 30 lignes max décrivant le service pour les LLM (ChatGPT, Perplexity, Gemini)

### 9.5 — Exclure `/api/` de `robots.txt`
**Fichier :** `app/robots.ts`
```ts
rules: [{ userAgent: '*', allow: '/', disallow: '/api/' }]
```

### 9.6 — Exposer une grille tarifaire indicative en HTML
- Ajouter section "Tarifs indicatifs" visible dans le HTML (crawlable par Google et AI)
- Basé sur `lib/pricing.ts` : < 5km = 20€, > 10km = 2.5€/km, mise à dispo 80€/h

---

## PHASE 10 — Performance IA (P1) · ~4h

### 10.1 — Implémenter le streaming IA
**Fichiers :** `app/api/chat/route.ts`, `components/scenes/SceneContact.tsx`

```ts
// Route API : SSE streaming
const stream = client.messages.stream({ model: 'claude-haiku-4-5', max_tokens: 1024, system, messages })
return new Response(stream.toReadableStream(), {
  headers: { 'Content-Type': 'text/event-stream' }
})

// Client : consommer le stream
const reader = res.body?.getReader()
// decoder ReadableStream, mettre à jour state caractère par caractère
```

---

## PHASE 11 — Qualité & Maintenabilité (P2) · ~3h

### 11.1 — Error boundaries sur chaque scène
**Fichiers :** `app/page.tsx`, chaque page SEO

```tsx
<ErrorBoundary fallback={<section id="services" />}>
  <SceneServices />
</ErrorBoundary>
```

### 11.2 — Corriger la validation côté serveur des sessions
**Fichier :** `app/api/chat/route.ts`
- Le compteur de messages doit être côté serveur (cookie signé ou Redis), pas dans un header client

### 11.3 — Hisser l'instanciation Resend au niveau module
**Fichier :** `app/api/devis/route.ts`
```ts
const resend = new Resend(process.env.RESEND_API_KEY) // module level
```

### 11.4 — Correction contrastes accessibilité
- `text-[#F5F0E8]/30` (ratio ~2.5:1) → minimum `/60` pour atteindre 4.5:1
- `text-[#F5F0E8]/20` (placeholder) → augmenter à `/40` minimum
- Affecter : `app/globals.css`, `components/scenes/SceneServices.tsx`, `components/layout/FooterSeo.tsx`

### 11.5 — Corriger `cursor-none` sur les cards services
**Fichier :** `components/scenes/SceneServices.tsx:129`
- Supprimer `cursor-none`, utiliser `cursor-pointer`

---

## PHASE 12 — Améliorations GEO & Contenu (P2) · ~4h

### 12.1 — Créer page `/a-propos`
- Identité chauffeur, certifications VTC, expérience, zone desservie
- Renforce E-E-A-T pour Google et citabilité pour les LLM

### 12.2 — Enrichir le contenu textuel des landing pages
- Ajouter 200-300 mots par page SEO décrivant : zones couvertes, occasions, points de prise en charge (aéroport, gare, centre-ville)

### 12.3 — CTA téléphonique visible
- Ajouter `<a href="tel:0783699229">` dans le hero et en sticky mobile
- Actuellement visible uniquement dans le footer et phase "limit" du chat

---

## PHASE 13 — Optimisations P3 (nice-to-have) · ~2h

| ID | Action | Fichier | Effort |
|---|---|---|---|
| P3-1 | `gsap.quickTo()` sur CustomCursor | `CustomCursor.tsx` | 30 min |
| P3-2 | Désactiver CustomCursor sur mobile (`pointer: coarse`) | `CustomCursor.tsx` | 15 min |
| P3-3 | `aria-current="page"` sur liens footer | `FooterSeo.tsx` | 10 min |
| P3-4 | `autocomplete="off"` sur input chat | `SceneContact.tsx` | 5 min |
| P3-5 | Ajouter `poster` attr sur vidéos | `SceneHero.tsx`, `SceneVehicle.tsx` | 15 min |
| P3-6 | Analyse bundle (`@next/bundle-analyzer`) | `next.config.ts` | 30 min |
| P3-7 | Aria-label plus précis sur bouton CTA hero | `SceneHero.tsx` | 5 min |
| P3-8 | Ajouter `BreadcrumbList` schema sur landing pages | pages SEO | 1h |
| P3-9 | `WebSite` schema avec `SearchAction` | `JsonLd.tsx` | 30 min |
| P3-10 | `role="log"` et aria structure conversation chat | `SceneContact.tsx` | 20 min |
| P3-11 | Réduire animations compteurs GSAP si focus lecteur d'écran | `SceneIdentity.tsx` | 30 min |

---

## Récapitulatif des phases et priorités

| Phase | Domaine | Priorité | Effort | Bloque la mise en prod ? |
|---|---|---|---|---|
| 1 | Sécurité (injection, rate limit, spam) | P0 | ~4h | **OUI** |
| 2 | Fiabilité leads (Resend, prix, timeout) | P0 | ~2h | **OUI** |
| 3 | RGPD / Légal | P0 | ~3h | **OUI** |
| 4 | Infrastructure & env vars | P0 | ~1h | **OUI** |
| 5 | Médias & Performance mobile | P0 | ~4h | **OUI** (mobile) |
| 6 | SEO P0 (og-image, JSON-LD) | P0 | ~1h | Oui (SEO) |
| 7 | Monitoring & Observabilité | P1 | ~3h | Avant trafic payant |
| 8 | Accessibilité P0/P1 | P1 | ~3h | Avant trafic payant |
| 9 | SEO & GEO P1 | P1 | ~5h | Avant trafic payant |
| 10 | Streaming IA | P1 | ~4h | Non (UX) |
| 11 | Qualité & Maintenabilité | P2 | ~3h | Non |
| 12 | Contenu & GEO | P2 | ~4h | Non |
| 13 | Optimisations P3 | P3 | ~2h | Non |

**Total estimé Phase 1-6 (P0) : ~15h (~2 jours développeur senior**
**Total estimé Phase 7-10 (P1) : ~15h (~2 jours)**
**Total estimé Phase 11-13 (P2-P3) : ~9h (~1 jour)**

---

## Vérification & Tests

### Après Phase 1-6 (avant tout déploiement)
- [ ] `POST /api/chat` avec `system` custom dans le body → vérifié ignoré
- [ ] 50 requêtes `/api/chat` avec `X-Message-Count: 0` → rate limiting déclenché
- [ ] `POST /api/devis` sans token valide → rejeté 403
- [ ] Injection HTML dans `name` (`<img src=x onerror=alert(1)>`) → email reçu escappé
- [ ] Headers de sécurité présents : `curl -I https://vtcland.fr`
- [ ] Flow complet Élia → 2 emails reçus (chauffeur + client)
- [ ] Couper Resend → message d'erreur avec numéro de téléphone affiché à l'utilisateur
- [ ] Adresse introuvable dans Élia → message d'erreur, pas de prix €20
- [ ] `npm run build` sans erreur
- [ ] `npx tsc --noEmit` sans erreur
- [ ] Rich Results Test sur JSON-LD : https://search.google.com/test/rich-results
- [ ] OG tags valides : https://www.opengraph.xyz/url/https://vtcland.fr

### Après Phase 7-10 (avant trafic payant)
- [ ] Lighthouse desktop homepage > 70 (Performance), > 80 (Accessibility)
- [ ] Lighthouse mobile homepage LCP < 4s
- [ ] Sentry dashboard accessible et reçoit des events test
- [ ] Ping uptime configuré sur `/api/health`
- [ ] Streaming chat : premières lettres de réponse < 500ms
- [ ] iPhone Safari 4G : hero charge, vehicle section visible, chat fonctionnel

### Tests accessibilité
- [ ] Navigation entière au clavier (Tab, Enter, Escape)
- [ ] Skip link visible au focus
- [ ] VoiceOver (macOS) / NVDA (Windows) : lire les réponses d'Élia annoncées automatiquement
- [ ] `prefers-reduced-motion: reduce` activé dans l'OS → aucune animation GSAP ne se déclenche

---

## Fichiers critiques modifiés

| Fichier | Phases concernées |
|---|---|
| `app/api/chat/route.ts` | 1.1, 1.2, 2.3, 10.1 |
| `app/api/devis/route.ts` | 1.3, 1.4, 2.1, 2.3, 11.3 |
| `app/api/distance/route.ts` | 2.2, 2.3 |
| `components/scenes/SceneContact.tsx` | 1.1, 2.2, 8.1-8.3, 8.7, 10.1 |
| `components/seo/JsonLd.tsx` | 6.2, 9.1 |
| `next.config.ts` | 1.5 |
| `app/layout.tsx` | 3.3, 8.4 |
| `app/globals.css` | 8.5, 11.4 |
| `components/layout/FooterSeo.tsx` | 3.3, 11.4, P3-3 |
| `components/scenes/SceneHero.tsx` | 5.4, 8.8, 9.2 |
| `public/videos/` | 5.1-5.3 |
| `public/og-image.jpg` | 6.1 |
| `public/llms.txt` | 9.4 |
| `app/robots.ts` | 9.5 |
| `app/(seo)/*/page.tsx` (6 pages) | 9.1, 9.2, 9.3, 12.2 |
| `app/politique-de-confidentialite/page.tsx` | 3.1 (nouveau) |
| `app/mentions-legales/page.tsx` | 3.2 (nouveau) |
| `app/a-propos/page.tsx` | 12.1 (nouveau) |
| `app/api/health/route.ts` | 7.2 (nouveau) |
| `.env.example` | 4.1 (nouveau) |
