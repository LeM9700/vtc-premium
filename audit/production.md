# Rapport d'Audit Production Readiness — VTCLAND

**Date :** 2026-07-14  
**Auditeur :** Claude (Sonnet 4.6)  
**Scope :** Go/No-Go avant mise en production commerciale

> Cet audit synthétise les conclusions des audits précédents (security, SEO/GEO, features, performance, accessibility) enrichis des vérifications spécifiques à la production.

---

## 🔄 MISE À JOUR — 2026-07-16

Les 8 P0 listés en section 3 ont été traités :

| ID | Problème | Statut |
|---|---|---|
| P0-1 | Prompt système injectable | ✅ **CORRIGÉ** |
| P0-2 | `/api/devis` open spam | ✅ **CORRIGÉ** (token HMAC + rate limit) |
| P0-3 | Leads perdus silencieusement | ✅ **CORRIGÉ** (HTTP 500 explicite si email chauffeur échoue) |
| P0-4 | Pas de politique de confidentialité / mentions légales | ✅ **CORRIGÉ (2026-07-17)** — informations légales réelles fournies par l'utilisateur et intégrées (raison sociale, SIRET, forme juridique, adresse complète du siège social, directeur de publication, contact, hébergeur). Aucun placeholder restant |
| P0-5 | Variables d'environnement en prod non confirmées | ⚠️ **PARTIEL — hors de portée du code** — `.env.example` complet, et une validation de démarrage a été ajoutée (`instrumentation.ts` logue clairement toute variable manquante au boot). **Mais la configuration réelle sur la plateforme de déploiement ne peut pas être vérifiée depuis le repo** — aucun outil ne me donne accès à Railway/Vercel/etc., c'est une action que seul l'utilisateur peut faire |
| P0-6 | Vidéos 63 Mo | ✅ **CORRIGÉ (2026-07-18)** — `.MOV` bruts + doublon retirés, ET la version compressée est désormais branchée : `vehicle_scrub.mp4` sert la version 9,6 Mo (validée par ffprobe — même durée/résolution que l'original 44 Mo). L'original et `vehicle.mp4` (20 Mo, jamais référencé dans le code) déplacés vers `raw-footage/` (gitignored). `public/videos/` passe de 94 Mo à 22 Mo |
| P0-7 | JSON-LD placeholders invalides | ✅ **CORRIGÉ** (vrai téléphone, vraie URL Google Maps + géolocalisation précise désormais intégrées) |
| P0-8 | `og-image.jpg` manquant | ✅ **CORRIGÉ ET VÉRIFIÉ** — JPEG valide 1200×630 (dimensions OG exactes), contenu inspecté visuellement : logo VTCLAND noir/jaune/vert cohérent avec l'identité de marque |

Corrections additionnelles au-delà du périmètre P0 initial : monitoring (Sentry + `/api/health` + Vercel Analytics/Speed Insights), accessibilité WCAG (label, aria-live, reduced-motion, focus visible, skip link), SEO/GEO (FAQ + schema, BreadcrumbList, llms.txt, grille tarifaire), streaming du chat IA, error boundaries, page `/a-propos`, CTA téléphonique visible.

**Nouvelle recommandation : MVP Controlled Launch atteignable — tous les P0 traitables depuis le code sont résolus.** Il ne reste que des actions hors du périmètre code, nécessitant une intervention directe de l'utilisateur sur la plateforme de déploiement : confirmer les variables d'environnement en production (notamment `DEVIS_SECRET`, obligatoire), et vérifier l'adresse de Railway Corporation citée en hébergeur (identifiée par recherche web, non confirmée en première main).

---

## 🔄 MISE À JOUR — 2026-07-18 (revue de cohérence)

Revue ligne par ligne de `security.md` avec vérification directe du code (pas seulement confiance dans les statuts déclarés). Écarts réels trouvés et corrigés :

| ID | Problème trouvé | Statut |
|---|---|---|
| P0-2 (complément) | `/api/distance` était le seul des 3 endpoints à n'avoir **ni rate limiting ni validation d'input**, alors que P0-2 le couvre explicitement — accessible directement sans passer par le token de `/api/chat` | ✅ **CORRIGÉ** — `checkRateLimit` (20/IP/10min) + validation longueur/type des adresses ajoutés |
| P1-2 (complément) | HSTS absent des headers malgré la mention explicite dans P1-2 | ✅ **CORRIGÉ** — `Strict-Transport-Security` ajouté dans `next.config.ts` |
| — | **Bug de régression trouvé pendant la vérification** : `new Resend()` avait été remonté au niveau module dans `app/api/devis/route.ts`. Next.js 16 évalue les modules de route au moment du build (« Collecting page data »), donc `npm run build` **plantait dès que `RESEND_API_KEY` était absente au moment du build** — un risque réel selon la façon dont Railway/Vercel séparent build et secrets runtime | ✅ **CORRIGÉ** — reverti vers une instanciation paresseuse dans le handler |
| — | Pas de honeypot anti-bot sur le chat | ✅ **AJOUTÉ** — champ piège invisible, requête ignorée silencieusement si rempli |
| — | `npm audit` jamais exécuté | ✅ **CORRIGÉ** — 1 vulnérabilité modérée (postcss transitif) neutralisée, `npm audit` clean, + workflow CI hebdomadaire |

`npm run build` et `npx tsc --noEmit` re-vérifiés après ces correctifs : les deux passent sans erreur. Détail complet dans `security.md` et `fix-plan.md`.

**Le point 4 (bug Resend/build) est le plus important de cette passe** : c'est le genre de régression qui ne se voit qu'au déploiement réel, pas en local avec des clés factices — exactement le type de risque que ce audit de cohérence visait à détecter.

---

## 1. Décision Finale Go/No-Go (état initial de l'audit — voir mise à jour ci-dessus)

### ❌ DÉCISION : Ne pas déployer en production commerciale

**Raison principale :**

Le site présente **8 bloquants P0** qui, pris ensemble, exposeront le chauffeur à des pertes de leads sans trace, des abus coûteux de l'API IA, une non-conformité RGPD, et un échec silencieux du parcours de conversion en cas de panne d'un provider. Déployer dans cet état est risqué commercialement et légalement.

**Verdict possible avec corrections :** Avec les P0 corrigés en ~3 jours, le projet peut recevoir un **MVP Controlled Launch** (trafic limité, suivi actif).

---

## 2. Contexte Production

| Dimension | État |
|---|---|
| Type | Site vitrine local + assistant IA de réservation |
| Utilisateurs cibles | Grand public, clientèle premium, France (Occitanie) |
| Parcours critiques | Chat Élia → collecte 12 données → calcul prix → email devis |
| Plateforme de déploiement | **Inconnue** (aucun fichier vercel.json, Dockerfile, railway.json détecté) |
| Runtime | Next.js 16 — serverless functions |
| Base de données | **Aucune** |
| Auth | **Aucune** |
| IA | Anthropic `claude-haiku-4-5` via `POST /api/chat` |
| Email | Resend via `POST /api/devis` |
| Géocodage | OpenRouteService via `POST /api/distance` |
| Paiement/webhooks | Aucun |
| Données personnelles | Oui — nom, téléphone, email, adresses de trajet → **RGPD applicable** |

---

## 3. P0 — Bloquants Production

| ID | Problème | Audit source | Impact |
|---|---|---|---|
| **P0-1** | Prompt système injectable depuis le client | Sécurité | Manipulation IA, abus de coûts |
| **P0-2** | `/api/devis` open spam sans rate limiting | Sécurité | Centaines d'emails indésirables |
| **P0-3** | Leads perdus silencieusement si Resend échoue | Features | Perte de revenus directe |
| **P0-4** | Aucune politique de confidentialité / mentions légales | RGPD | Illégal (collecte données sans base légale affichée) |
| **P0-5** | Variables d'environnement en production non confirmées | Infrastructure | Site cassé au démarrage |
| **P0-6** | `vehicle_scrub.mp4` 43 Mo + `vehicle.mp4` 20 Mo | Performance | Expérience mobile catastrophique |
| **P0-7** | JSON-LD avec placeholders invalides (téléphone, Google Maps) | SEO | Schema invalide, crédibilité nulle |
| **P0-8** | `og-image.jpg` manquant | SEO | 404 sur chaque partage social, CTR dégradé |

---

### Détail P0-1 — Prompt injectable

**Fichier :** `app/api/chat/route.ts:30`
```ts
const { messages, system } = await req.json()
// system vient du client → jamais validé
const response = await client.messages.create({ model, system, messages })
```
Un attaquant peut envoyer n'importe quel `system` prompt, forcer Élia à dire ce qu'il veut, et épuiser le quota Anthropic.

**Correction :**
```ts
// Supprimer system du body, le construire côté serveur
const { messages, contextNote } = await req.json()
const system = buildSystemPrompt(contextNote)
```
Valider `contextNote` dans une whitelist d'IDs connus (un par landing page).

---

### Détail P0-3 — Leads perdus silencieusement

**Fichier :** `app/api/devis/route.ts:97-135`
```ts
const results = await Promise.allSettled([...])
// résultat rejeté → console.error seulement
return NextResponse.json({ success: true }) // toujours 200
```
Si Resend est en panne ou que la clé expire, le client voit "Demande envoyée" — le chauffeur ne reçoit rien.

**Correction minimale :**
```ts
const chauffeurResult = results[0]
if (chauffeurResult.status === 'rejected') {
  return NextResponse.json({ error: 'Erreur envoi' }, { status: 500 })
}
```
Et afficher côté client : "Une erreur est survenue, appelez le 07 83 69 92 29."

---

### Détail P0-4 — Non-conformité RGPD

Le site collecte via le chat Élia : **nom complet, numéro de téléphone, email, adresses de départ et de destination** (données de géolocalisation indirectes). Ces données sont :
- Envoyées à **Anthropic** (LLM — serveurs hors UE)
- Envoyées à **OpenRouteService** (géocodage)
- Envoyées à **Resend** (email marketing SaaS)

**Obligations légales manquantes :**
- Aucune politique de confidentialité accessible
- Aucune mention des sous-traitants (Anthropic, ORS, Resend)
- Aucune base légale affichée (consentement ou intérêt légitime)
- Aucune durée de conservation
- Aucun droit d'accès/rectification/suppression
- Aucune bannière cookies (si analytics ajoutés)
- Aucun DPA (Data Processing Agreement) vérifié avec les sous-traitants

**Risque :** Plainte CNIL, amende jusqu'à 4% du CA annuel ou 20M€.

**Correction minimale :** Une page `/politique-de-confidentialite` et un lien depuis le footer.

---

### Détail P0-5 — Variables d'environnement non confirmées

`.env.local` contient uniquement :
```
NEXT_PUBLIC_SITE_URL=https://vtcland.fr
```

Les variables **manquantes en local mais requises en production** :
- `ANTHROPIC_API_KEY` → chat Élia cassé si absent
- `RESEND_API_KEY` → emails cassés
- `EMAIL_FROM` → emails cassés (fallback `onboarding@resend.dev` mais bloqué Resend)
- `CHAUFFEUR_EMAIL` → email chauffeur ne part pas
- `OPENROUTESERVICE_API_KEY` → calcul distance cassé

**Risque :** Si une seule variable est manquante ou mal nommée en production, le parcours de conversion est muet et aucune alerte n'est envoyée (pas de monitoring).

---

## 4. P1 — Haute Priorité Avant Launch

| ID | Problème | Audit source | Effort |
|---|---|---|---|
| P1-1 | Rate limiting réel sur `/api/chat` côté serveur | Sécurité | 2h |
| P1-2 | Timeout sur appels Anthropic, ORS, Resend | Performance | 2h |
| P1-3 | Prix 0€ affiché si géocodage échoue | Features | 1h |
| P1-4 | Aucun monitoring d'erreur (Sentry ou équivalent) | Monitoring | 2h |
| P1-5 | Aucun uptime check sur les routes critiques | Monitoring | 30 min |
| P1-6 | Input chat sans `<label>` — inaccessible lecteur d'écran | Accessibilité | 5 min |
| P1-7 | Pas de `aria-live` sur le chat — réponses non annoncées | Accessibilité | 10 min |
| P1-8 | Headers de sécurité absents (`next.config.ts` vide) | Sécurité | 30 min |
| P1-9 | Injection HTML possible dans les emails Resend | Sécurité | 1h |
| P1-10 | `preload="auto"` sur hero.mp4 12Mo | Performance | 2 min |
| P1-11 | Fichiers `.MOV` 56Mo servis publiquement | Performance | 5 min |

---

## 5. Build & Runtime

| Check | État | Commentaire |
|---|---|---|
| `npm run build` passe | **Inconnu** | Non testé dans cet audit — à confirmer |
| Node.js version fixée | ❌ | Pas de `.nvmrc`, pas de `engines` dans `package.json` |
| `next start` (mode production) | **Inconnu** | Non confirmé |
| Variables d'env présentes au build | ❌ | `NEXT_PUBLIC_SITE_URL` seule présente localement |
| `next.config.ts` configuré | ❌ | Fichier vide — aucun header, aucune optimisation |
| Erreurs TypeScript | **Inconnu** | `tsc --noEmit` non exécuté dans cet audit |
| ESLint passe | **Inconnu** | `npm run lint` non vérifié |
| Dépendances à jour | **Inconnu** | `npm audit` non exécuté |

**Action requise avant déploiement :**
```bash
npm run build && npm run lint && npx tsc --noEmit && npm audit
```

---

## 6. Variables d'Environnement & Secrets

| Variable | Présente localement | Présente en prod | Requise |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | ✅ | **Inconnue** | Oui |
| `ANTHROPIC_API_KEY` | ❌ | **Inconnue** | Oui — chat cassé |
| `RESEND_API_KEY` | ❌ | **Inconnue** | Oui — emails cassés |
| `EMAIL_FROM` | ❌ | **Inconnue** | Oui |
| `CHAUFFEUR_EMAIL` | ❌ | **Inconnue** | Oui |
| `OPENROUTESERVICE_API_KEY` | ❌ | **Inconnue** | Oui — distance cassée |

**Bonnes pratiques manquantes :**
- Aucun fichier `.env.example` documentant les variables requises
- Aucune validation de démarrage (la plupart des variables sont utilisées lazily à la première requête, pas au démarrage → le site démarre même si tout est cassé)

**Correction minimale :** Créer `.env.example` et ajouter une validation au démarrage :
```ts
// app/api/_check-env.ts — importé une fois au démarrage
const required = ['ANTHROPIC_API_KEY', 'RESEND_API_KEY', 'CHAUFFEUR_EMAIL', ...]
required.forEach(k => { if (!process.env[k]) console.error(`[ENV] Missing: ${k}`) })
```

---

## 7. Tests & CI/CD

| Check | État |
|---|---|
| Tests unitaires | ❌ Aucun |
| Tests d'intégration | ❌ Aucun |
| Tests E2E | ❌ Aucun |
| CI pipeline | ❌ Aucun (pas de `.github/`, pas de Vercel CI configuré) |
| CD automatique | ❌ Inconnu |
| Lint dans CI | ❌ Aucun |
| Build vérifié en CI | ❌ Aucun |
| Accessibilité testée | ❌ Aucun |

**Conséquence directe :** Chaque déploiement est manuel et non vérifié. Une régression dans `lib/pricing.ts` (calcul tarifaire) peut partir en production sans détection.

**Action minimale :** Ajouter un fichier GitHub Actions simple :
```yaml
# .github/workflows/ci.yml
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npm run build
```

---

## 8. Monitoring, Logs & Health Checks

| Check | État |
|---|---|
| Error tracking (Sentry) | ❌ Absent |
| Uptime monitoring | ❌ Absent |
| Logs structurés | ⚠️ `console.error` seulement |
| Core Web Vitals tracking | ❌ Absent |
| AI token tracking | ❌ Absent |
| Analytics business | ❌ Absent |
| Health check endpoint | ❌ Absent |
| Alertes email/Slack | ❌ Absent |

**Risque opérationnel majeur :** Si l'API Anthropic tombe, si Resend rejette les emails, ou si ORS rate-limite la clé, **rien n'alerte le chauffeur**. Il découvrira le problème quand un client appellera pour demander où est son devis.

**Monitoring minimal requis en production :**
```
Better Stack (gratuit) → ping /api/health toutes les 5 min
Sentry (tier gratuit) → capture les exceptions API
Vercel Analytics → Core Web Vitals sans config
```

**Health check endpoint à créer :**
```ts
// app/api/health/route.ts
export async function GET() {
  return Response.json({ status: 'ok', ts: Date.now() })
}
```

---

## 9. Base de Données, Migrations, Backups

**Aucune base de données détectée.** Ce design simplifie le déploiement.

**Conséquence :** Les demandes de devis existent uniquement dans les emails. Si :
- Resend échoue → lead perdu définitivement
- La boîte email du chauffeur est pleine → lead perdu
- Le chauffeur supprime l'email → historique perdu

Il n'existe aucune possibilité de retrouver une demande sans trace email. Ce n'est pas un bloquant technique mais un risque business à noter.

**Recommandation future :** Logger les devis dans une simple feuille Google Sheets via une API ou dans un CSV stocké dans R2/S3 avant d'envisager une vraie base de données.

---

## 10. Privacy / RGPD

**Verdict : Non-conforme au RGPD. Bloquant légal.**

| Obligation RGPD | État |
|---|---|
| Base légale affichée | ❌ Absente |
| Politique de confidentialité | ❌ Absente |
| Mentions légales | ❌ Absentes |
| Liste des sous-traitants | ❌ Absente (Anthropic, ORS, Resend) |
| Droits des personnes | ❌ Non implémentés |
| Durée de conservation | ❌ Non définie |
| DPA avec sous-traitants | ❌ Non vérifié |
| Transferts hors UE | ⚠️ Anthropic = USA — clauses SCCs à vérifier |
| Bannière cookies | ⚠️ Nécessaire si analytics ajoutés |

**Données collectées par le chat Élia :**
- Prénom + nom
- Numéro de téléphone
- Adresse email
- Adresses de départ/destination (géolocalisation indirecte)
- Date et heure de trajet

Ces données sont transmises à Anthropic (San Francisco), OpenRouteService, et Resend. Sans accord contractuel documenté avec chaque sous-traitant et sans information fournie à l'utilisateur, cette collecte est illicite.

**Correction minimale requise avant lancement :**
1. Page `/mentions-legales` (obligatoire en France pour tout site commercial)
2. Page `/politique-de-confidentialite` listant les données collectées, les fins, la durée, les sous-traitants
3. Lien dans le footer vers ces deux pages
4. Mentionner dans l'interface chat que les données sont utilisées uniquement pour la réservation

---

## 11. Checklist Pré-Lancement Manuel

### Obligatoire avant tout trafic

- [ ] `npm run build` passe sans erreur
- [ ] `npm run lint` passe sans erreur
- [ ] `npx tsc --noEmit` passe sans erreur
- [ ] Toutes les variables d'environnement sont configurées sur la plateforme de déploiement
- [ ] Test E2E manuel du chat Élia de bout en bout (chat → 2 emails reçus)
- [ ] Vérifier que le chauffeur reçoit bien l'email de devis
- [ ] Vérifier que le client reçoit bien l'email de confirmation
- [ ] `/api/health` endpoint répond 200
- [ ] JSON-LD corrigé (vrai numéro, vraie URL Google Maps)
- [ ] `og-image.jpg` créé et déployé
- [ ] Politique de confidentialité et mentions légales en ligne
- [ ] `.MOV` supprimés du repo

### Haute priorité avant trafic payant

- [ ] Sentry configuré et testé
- [ ] Uptime monitoring configuré (Better Stack ou équivalent)
- [ ] Rate limiting réel sur `/api/chat` côté serveur
- [ ] `system` prompt fixé côté serveur (plus injectable)
- [ ] Videos compressées (vehicle_scrub < 5Mo, vehicle < 3Mo)
- [ ] Skip link accessibilité + label input chat
- [ ] Timeout 8s sur tous les fetch externes
- [ ] Headers sécurité dans `next.config.ts`
- [ ] Google Analytics ou Plausible configuré
- [ ] Test Lighthouse score > 70

---

## 12. Plan de Stabilisation 48h

### Heures 0-4 — Correction des bloquants légaux et critiques

**Objectif : Rendre le déploiement légalement valide**

- Créer `/app/politique-de-confidentialite/page.tsx` et `/app/mentions-legales/page.tsx` (contenu minimal)
- Ajouter les liens dans `FooterSeo.tsx`
- Corriger `JsonLd.tsx` : vrai numéro, vraie URL Google Maps
- Créer `public/og-image.jpg` (1200×630px)
- Supprimer `IMG_0483.MOV`, `IMG_0485.MOV`, vérifier `IMG_0485.mp4`

---

### Heures 4-8 — Sécuriser le parcours de conversion

**Objectif : Arrêter les risques de perte de leads et d'abus**

- Fixer le `system` prompt côté serveur dans `/api/chat` (supprimer le `system` du body client)
- Corriger `/api/devis` pour retourner 500 si l'email chauffeur échoue
- Ajouter `aria-live="polite"` + `role="log"` sur le chat + label input
- Ajouter `AbortController` 8s sur les fetch externes (ORS)
- Créer `/api/health` endpoint

---

### Heures 8-16 — Infrastructure et monitoring

**Objectif : Avoir de la visibilité en production**

- Confirmer et documenter toutes les variables d'environnement sur la plateforme
- Créer `.env.example` dans le repo
- Installer Sentry (`@sentry/nextjs`) et configurer DSN
- Configurer un ping Better Stack sur `/api/health`
- Ajouter `npm run build` + `tsc --noEmit` + `lint` dans un workflow GitHub Actions

---

### Heures 16-24 — Performance et qualité

**Objectif : Acceptable sur mobile**

- Compresser `vehicle_scrub.mp4` → objectif < 5Mo
- Compresser `vehicle.mp4` → objectif < 3Mo
- `preload="none"` sur hero.mp4
- Ajouter headers sécurité dans `next.config.ts` (CSP minimal, X-Frame-Options, etc.)

---

### Heures 24-48 — Validation finale

**Objectif : Test E2E humain complet**

- Test complet du parcours Élia (15+ min de chat, confirmation emails)
- Test Lighthouse homepage (desktop + mobile)
- Test sur iPhone Safari 4G (video, chat, footer)
- Test navigation clavier (skip link, focus visible, chat au clavier)
- Vérification Google Search Console (pas d'erreur crawl)
- Vérification Rich Results Test (JSON-LD valide)

---

## 13. Verdict Final

### Le projet n'est pas prêt pour un lancement commercial public.

**Ce qui fonctionne :**
- Le parcours Élia fonctionne en happy path sur desktop et connexion stable
- La structure SEO des landing pages est en place
- L'architecture est simple et maintenable
- Les emails HTML sont bien formatés
- Le design et l'expérience premium sont cohérents

**Ce qui bloque :**
1. **RGPD** — Collecte de données personnelles sans base légale affichée. Illégal en l'état.
2. **Sécurité** — Prompt injectable, spam ouvert, injection HTML dans emails.
3. **Fiabilité** — Leads perdus silencieusement, aucun monitoring, aucun timeout.
4. **Performance mobile** — 63Mo de vidéos lourdes cassent l'expérience sur mobile.
5. **SEO** — Schema JSON-LD avec placeholders, og-image manquante.

**Ce qui peut attendre :**
- Tests automatisés complets (E2E Playwright)
- Optimisation streaming IA
- Composants accessibilité avancés (reduced motion, contrastes)
- Analytics avancés

**Verdict autorisé avec corrections P0 :** `MVP Controlled Launch` — trafic limité (SEO organique, pas de Google Ads), monitoring actif, chauffeur en veille sur emails.

**Estimation pour atteindre MVP Controlled Launch :** 3 jours de travail ciblé.

---

**Final decision : Ne pas déployer — MVP Controlled Launch possible après corrections P0.**
