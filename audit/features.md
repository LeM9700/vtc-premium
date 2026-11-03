# VTCLAND — Feature Audit Report

**Date :** 2026-07-14  
**Auditeur :** Claude (Sonnet 4.6)  
**Scope :** Toutes les fonctionnalités utilisateur-facing et backend du projet

---

## 🔄 MISE À JOUR — 2026-07-16

| ID | Finding | Statut |
|---|---|---|
| F1 | Perte de lead silencieuse (`success:true` même si Resend échoue) | ✅ **CORRIGÉ** — HTTP 500 + message avec numéro de téléphone si l'email chauffeur échoue |
| F2 | Prix 20€ si géocodage échoue | ✅ **CORRIGÉ** — message "à confirmer par notre équipe", plus de prix fictif envoyé |
| F3 | Aucun analytics | ✅ **CORRIGÉ** — Vercel Analytics, events `chat_started` / `devis_completed` / `devis_failed` |
| F4 | Données hardcodées (stats, avis, véhicule) | ❌ Non traité — reste hors périmètre |
| F5 | Numéro de téléphone quasi invisible | ✅ **CORRIGÉ** — visible dans le hero, en CTA sticky mobile, footer, page `/a-propos` |
| F6 | Pas d'error boundary React | ✅ **CORRIGÉ** — `ErrorBoundary` sur toutes les scènes (homepage) et sur le contenu des 6 landing pages |
| F7 | `Navbar.tsx` vide, non utilisé | ❌ Non traité — fichier mort toujours présent |
| F8 | Session anti-spam contournable (header client) | ✅ **CORRIGÉ** — rate limiting IP côté serveur remplace le header forgeable |

Bonus hors périmètre initial : chat désormais en streaming (SSE), fiabilité renforcée sur le calcul distance (timeouts 8s), token de session à usage unique sur `/api/devis`.

**Nouveau score estimé : 7,5/10** (était 3,9/10). Restant : externaliser les données hardcodées (F4), traiter `Navbar.tsx` (F7 — soit implémenté, soit supprimé).

---

## 1. Executive Summary

**Verdict : Needs Work Before Launch**

Le parcours de conversion principal (chat Élia → devis email) est fonctionnel en happy path mais présente des risques silencieux majeurs en production : perte de lead sans trace, 0€ affiché en cas d'échec de géocodage, aucun analytics. Les fonctionnalités annexes (stats, avis, véhicule) sont entièrement hardcodées. Un analytics et un fallback email sont requis avant mise en production commerciale.

---

## 2. Feature Inventory

| Feature | Fichier(s) | Statut | Criticité |
|---|---|---|---|
| Chat IA Élia (collecte devis) | `SceneContact.tsx`, `api/chat/route.ts` | ✅ Fonctionnel (happy path) | P0 |
| Calcul distance réelle | `api/distance/route.ts`, OpenRouteService | ⚠️ Silently fails → 0km | P0 |
| Calcul tarif | `lib/pricing.ts` | ✅ Fonctionnel | P1 |
| Envoi email devis | `api/devis/route.ts`, Resend | ⚠️ Lead perdu si Resend KO | P0 |
| Hero (vidéo + CTA + Lenis scroll) | `SceneHero.tsx` | ✅ Fonctionnel | P1 |
| Identité (stats) | `SceneIdentity.tsx` | ⚠️ Hardcodé, non vérifié | P2 |
| Véhicule (scrubbing vidéo) | `SceneVehicle.tsx` | ✅ Fonctionnel | P2 |
| Services | `SceneServices.tsx` | ✅ Fonctionnel | P2 |
| Preuve sociale (avis) | `SceneSocialProof.tsx` | ⚠️ Hardcodé, non lié GBP | P1 |
| 6 landing pages SEO | `app/(seo)/*/page.tsx` | ✅ Rendues | P1 |
| JSON-LD LocalBusiness | `components/seo/JsonLd.tsx` | ❌ Placeholders invalides | P0 |
| Sitemap | `app/sitemap.ts` | ✅ 7 pages | P2 |
| robots.txt | `app/robots.ts` | ⚠️ Expose `/api/` | P3 |
| Footer maillage SEO | `FooterSeo.tsx` | ✅ Fonctionnel | P2 |
| Navbar | `components/ui/Navbar.tsx` | ❌ Vide, non importé | P3 |
| Analytics / tracking | — | ❌ Absent | P0 |
| Error boundaries | — | ❌ Absent | P1 |

---

## 3. Critical User Journeys

### Journey A — Devis via Élia (parcours principal)

```
Visiteur arrive → scrolle vers #contact
→ Élia pose question 1 (type de trajet)
→ 12 échanges collecte données
→ Claude renvoie <COLLECTED>{...}
→ SceneContact parse la balise
→ POST /api/distance (OpenRouteService)
→ calculatePrice() local
→ Affichage confirmation + prix
→ POST /api/devis (Resend × 2 emails)
→ Phase "done"
```

**Points de défaillance silencieuse :**

1. `/api/distance` échoue → `distanceKm = 0` → `calculatePrice()` retourne 20€ → prix affiché est faux, aucun message d'erreur.
2. `/api/devis` (Resend) échoue → `{ success: true }` renvoyé quand même → le client pense sa demande envoyée, le chauffeur ne reçoit rien → **lead perdu sans trace**.
3. `<COLLECTED>` tag absent ou malformé → `processDevis()` jamais appelé → conversation bloquée silencieusement.
4. `sessionStorage` reset (onglet privé, navigation) → compteur remis à 0 → limite de 20 messages contournable.

### Journey B — Landing page SEO → conversion

```
Recherche Google "vtc montpellier aéroport"
→ Landing page /transfert-aeroport-montpellier
→ SceneContact avec greeting/contextNote personnalisé
→ même parcours que Journey A
```

**Différenciateur correct** : chaque landing a un greeting contextualisé (ex: "Bonjour, je suis Élia..."). `contextNote` injecté dans le system prompt côté client (voir audit sécurité).

### Journey C — Appel direct

Seul point d'entrée : numéro `07 83 69 92 29` hardcodé dans `SceneContact.tsx:403` (affiché quand limite 20 messages atteinte). Pas de CTA téléphone visible ailleurs sur la page d'accueil ni dans les landing pages.

---

## 4. Functional Findings

### F1 — Perte de lead silencieuse (CRITIQUE)
**Fichier :** `app/api/devis/route.ts`  
`return NextResponse.json({ success: true })` même quand l'envoi Resend au chauffeur échoue. Si Resend est en panne ou que la clé expire, le client voit "Un email de confirmation vient d'être envoyé" — mais aucun email n'arrive. Aucun log, aucun fallback.

### F2 — Prix incorrect en cas d'échec géocodage
**Fichier :** `components/scenes/SceneContact.tsx:199`  
```ts
distanceKm  = dist.distanceKm  ?? 0
durationMin = dist.durationMin ?? 0
```
Si OpenRouteService échoue (adresse non reconnue, quota dépassé), `distanceKm = 0` → `calculatePrice()` → 20€ forfait. Le client voit un prix anormalement bas sans avertissement.

### F3 — Aucun analytics
Aucun `gtag`, `plausible`, `posthog`, ni custom event. Impossible de mesurer :
- Taux d'ouverture de chat
- Taux de complétion du devis
- Page la plus convertissante
- Abandons par question (q1 type → q12 email)

### F4 — Données hardcodées non maintenables

| Donnée | Fichier | Impact |
|---|---|---|
| `10+ ans d'expérience` | `SceneIdentity.tsx` | Crédibilité si faux |
| `98% de satisfaction` | `SceneIdentity.tsx` | Légal si non sourcé |
| `500+ trajets` | `SceneIdentity.tsx` | À mettre à jour manuellement |
| `4.9 / 48 avis` | `SceneSocialProof.tsx` | Stale immédiatement |
| 3 témoignages | `SceneSocialProof.tsx` | Non liés à Google |
| Mercedes Classe E / S | `SceneVehicle.tsx` | Si véhicule change |

### F5 — Numéro de téléphone inaccessible hors session expirée
Le numéro `07 83 69 92 29` n'est affiché que dans deux cas :
1. Phase `limit` (20 messages atteints) — `SceneContact.tsx:403`
2. Dans le footer `FooterSeo.tsx`

Aucun CTA téléphone dans le hero, dans les landing pages au-dessus de la fold, ni dans le header. Un visiteur pressé ne trouve pas de contact rapide.

### F6 — Absence d'error boundary React
Si une animation GSAP/ScrollTrigger lève une exception non catchée dans une scène, React peut démounter la page entière. Aucun `ErrorBoundary` détecté.

### F7 — Navbar vide
`components/ui/Navbar.tsx` est un fichier vide, non importé. Aucune navigation principale entre les pages. Le maillage interne repose uniquement sur `FooterSeo.tsx` — invisible above the fold.

### F8 — Session anti-spam contournable
`messageCount` lu depuis `sessionStorage` côté client. Reset en navigation privée, nouvel onglet, ou `sessionStorage.clear()`. Combiné à l'absence de rate limiting serveur réel (voir audit sécurité), le bot-spam est trivial.

---

## 5. Feature Scores

| Dimension | Score | Justification |
|---|---|---|
| Parcours de conversion | 6/10 | Happy path OK, défaillances silencieuses critiques |
| Fiabilité email | 3/10 | Pas de fallback, pas de retry, succès faux |
| Calcul tarifaire | 7/10 | Logique correcte, 0-fallback problématique |
| Trust signals | 4/10 | Hardcodé, non vérifiable, Google rating stale |
| Accessibilité fonctionnelle | 5/10 | Chat accessible clavier, pas d'ARIA live regions |
| Observabilité | 1/10 | Aucun analytics, aucun logging exploitable |
| Maintenabilité des données | 2/10 | Tout est hardcodé dans les composants |
| CTA & parcours téléphone | 3/10 | Numéro quasi invisible |

**Score global : 3.9/10**

---

## 6. Priority Plan

### P0 — Bloquants production

| ID | Problème | Fichier | Action |
|---|---|---|---|
| P0-F1 | Lead perdu si Resend KO | `api/devis/route.ts` | Logger l'erreur, retourner 500, afficher message d'erreur à l'utilisateur |
| P0-F2 | Prix 20€ si géocodage KO | `SceneContact.tsx:199` | Informer l'utilisateur "impossible de calculer la distance, notre équipe vous contacte" |
| P0-F3 | Aucun analytics | — | Intégrer Plausible ou GA4 avec events `chat_started`, `devis_completed`, `devis_failed` |
| P0-F4 | JSON-LD invalide (placeholders) | `JsonLd.tsx:10,37` | Remplacer `+33XXXXXXXXX` par le vrai numéro, corriger l'URL Google Maps |

### P1 — Importants avant traffic payant

| ID | Problème | Fichier | Action |
|---|---|---|---|
| P1-F1 | Avis Google hardcodés | `SceneSocialProof.tsx` | Lier à Google Places API ou mettre à jour manuellement régulièrement |
| P1-F2 | Pas de CTA téléphone visible | Hero, landing pages | Ajouter `href="tel:0783699229"` dans la section hero et en sticky mobile |
| P1-F3 | Pas d'error boundary | — | Wrapper chaque scène dans un ErrorBoundary minimal |
| P1-F4 | Sécurité system prompt | `api/chat/route.ts` | Voir audit sécurité P0-S1 |

### P2 — Qualité & maintenabilité

| ID | Problème | Action |
|---|---|---|
| P2-F1 | Stats hardcodées | Externaliser dans un fichier de config ou CMS headless minimal |
| P2-F2 | Témoignages hardcodés | Idem — ou documenter le process de mise à jour manuelle |
| P2-F3 | Limite session contournable | Implémenter le comptage côté serveur (voir audit sécurité) |

### P3 — Nice to have

| ID | Problème | Action |
|---|---|---|
| P3-F1 | Navbar vide | Supprimer le fichier mort ou implémenter une navigation réelle |
| P3-F2 | robots.txt expose `/api/` | Ajouter `Disallow: /api/` |
| P3-F3 | Fichiers .MOV en `public/` | Supprimer `IMG_0483.MOV`, `IMG_0485.MOV` |

---

## 7. Quick Wins (< 2h chacun)

1. **Remplacer le placeholder téléphone** dans `JsonLd.tsx:10` → 5 min, impact SEO/GEO immédiat.
2. **Corriger l'URL Google Maps** dans `JsonLd.tsx:37` → 5 min.
3. **Ajouter un `<a href="tel:...">` dans le Hero** → 30 min, impact conversion immédiat.
4. **Logger l'erreur Resend et retourner 500** → `api/devis/route.ts`, 30 min, stoppe la perte silencieuse de leads.
5. **Supprimer `Navbar.tsx`** (fichier mort) → 2 min.
6. **Supprimer les `.MOV`** de `public/` → 2 min, réduit le déploiement.

---

## 8. Manual QA Scenarios

Avant mise en production, tester manuellement :

- [ ] Compléter le chat Élia du début à la fin → vérifier réception des 2 emails (chauffeur + client)
- [ ] Entrer une adresse invalide → vérifier que le prix ne s'affiche pas à 20€ sans avertissement
- [ ] Couper le réseau après `<COLLECTED>` → vérifier que le message d'erreur est affiché
- [ ] Tester sur mobile (iPhone Safari, Android Chrome) → vérifier que le chat est utilisable
- [ ] Atteindre 20 messages → vérifier que le numéro de téléphone s'affiche
- [ ] Ouvrir en navigation privée → vérifier que la limite de session fonctionne (ou pas)
- [ ] Tester les 6 landing pages → vérifier que le greeting personnalisé s'affiche bien
- [ ] Vérifier que les 2 emails reçus contiennent toutes les informations collectées

---

## 9. Missing Tests

Aucun test automatisé détecté dans le projet. Tests prioritaires à créer :

- **Unit** : `lib/pricing.ts` — `calculatePrice()` et `formatPriceExplanation()` avec tous les cas limites (4h, 7h, 4.9km, 5km, 10km, 10.1km)
- **Integration** : `POST /api/distance` avec adresses valides et invalides
- **Integration** : `POST /api/devis` — vérifier que le corps des emails contient les bonnes données
- **E2E** : Parcours Élia complet (Playwright ou Cypress)

---

## 10. Final Verdict

Le projet est **fonctionnel en happy path** mais **pas prêt pour du trafic commercial réel**.

Deux défauts critiques peuvent faire perdre des leads sans que le chauffeur ni le client le sache : l'absence de fallback Resend et le 0€ silencieux en cas d'échec géocodage. L'absence totale d'analytics rend impossible toute mesure de performance ou d'optimisation.

Les 4 quick wins P0 (téléphone JSON-LD, Google Maps URL, log Resend, analytics minimaliste) peuvent être livrés en une demi-journée et changeront radicalement la fiabilité et la visibilité du funnel.

**Feature verdict : Needs Work Before Launch**
