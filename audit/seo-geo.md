# Rapport d'Audit SEO & GEO — VTCLAND

**Date :** 2026-07-14
**Auditeur :** Audit automatisé via seo-geo-audit.md
**Contexte :** Site vitrine local VTC premium — Occitanie (Montpellier, Nîmes, Gard, Hérault)

---

## 🔄 MISE À JOUR — 2026-07-16

| ID | Finding | Statut |
|---|---|---|
| P0 | `og-image.jpg` introuvable | ✅ **RÉSOLU** — le fichier existe désormais |
| P0 | Téléphone placeholder JSON-LD | ✅ **CORRIGÉ** — `+33783699229` |
| P0 | Lien Google Maps fictif | ✅ **CORRIGÉ (2026-07-17)** — l'URL concrète proposée dans le plan de remédiation (`.../NGnnj9U63svtLxAW6`) restait sans source vérifiable et n'a délibérément pas été utilisée ; l'utilisateur a ensuite fourni la vraie URL (`.../dHeBLrgB8P3VyAZ77`), vérifiée par fetch — résout vers "VTCLAND - VTC Montpellier - Chauffeurs privés" sur Google Maps. `sameAs` + `geo` (coordonnées précises 43.6323851, 3.9162285) ajoutés dans `JsonLd.tsx` et sur les pages Montpellier/aéroport |
| P1 | Alt text images hero manquant | ✅ **CORRIGÉ** — prop `imageAlt` ajoutée, texte contextuel par page |
| P1 | Schema JSON-LD landing pages incomplet | ✅ **CORRIGÉ** — `telephone`, `address`, `geo` (coordonnées réelles des villes), `priceRange`, `openingHoursSpecification`, `provider` ajoutés sur les 6 pages |
| P1 | Aucune section FAQ | ✅ **CORRIGÉ** — `FAQSection` + schema `FAQPage` sur homepage + 3 pages prioritaires (Montpellier, Nîmes, transfert aéroport) |
| P1 | Aucune page légale | ✅ **CORRIGÉ (2026-07-18)** — créées et intégralement renseignées, aucun placeholder restant |
| P2 | Tarifs non exposés publiquement | ✅ **CORRIGÉ** — section "Tarifs indicatifs" en HTML sur la homepage |
| P2 | Pas de `llms.txt` | ✅ **CORRIGÉ** — `public/llms.txt` |
| P2 | Page `/a-propos` inexistante | ✅ **CORRIGÉ** — créée et intégralement renseignée (Malik EL BOAZZATI, carte pro VTC 0342439401, 3+ ans, 8000+ courses) |
| P2 | Routes API non exclues de `robots.txt` | ✅ **CORRIGÉ** — `disallow: '/api/'` |
| P3 | `BreadcrumbList` absent | ✅ **CORRIGÉ** — sur les 6 landing pages |
| P3 | `WebSite` schema avec `SearchAction` | ⚠️ **PARTIEL** — schema `WebSite` ajouté, mais **sans** `SearchAction` : le site n'a aucune fonctionnalité de recherche interne, en ajouter un aurait cassé la sitelinks searchbox plutôt que l'activer |
| — | Contenu textuel enrichi (200-300 mots/page) | ✅ **CORRIGÉ (2026-07-18, session 2)** — FAQ ajoutée sur les 3 pages restantes (mariage, pro, longue distance), voir mise à jour ci-dessous |

**Score à cette étape : 8/10** (était 4,5/10, 7,5 avant la fourniture de l'URL Maps).

---

## 🔄 MISE À JOUR — 2026-07-18 (session 2)

| ID | Finding | Statut |
|---|---|---|
| P1 | `geo` manquant sur 3 landing pages (mariage, pro, longue-distance) | ✅ **CORRIGÉ** — coordonnées du point GMB vérifié réutilisées comme ancrage (ces 3 pages couvrent une zone large — Gard & Hérault, Occitanie, France entière — donc pas de point unique par ville pertinent ; on ancre sur le point d'affaires vérifié plutôt que d'inventer des coordonnées non sourcées) |
| P1 | Homepage sans `export const metadata` propre | ✅ **CORRIGÉ** — `alternates.canonical: '/'` explicite ajouté dans `app/page.tsx` |
| — | `address` (PostalAddress) absente du schema global `JsonLd.tsx` | ✅ **CORRIGÉ** — adresse réelle (207A rue de l'Ancien Four, 30260 Montmirat) ajoutée, déjà publique dans les mentions légales |
| P1 | Contenu textuel + FAQ absents sur mariage/pro/longue-distance | ✅ **CORRIGÉ** — FAQ + schema `FAQPage` ajoutés sur les 3 pages restantes (4 questions chacune, sourcées sur `lib/pricing.ts` et la copy existante) ; les 6 landing pages ont désormais une FAQ |
| P2 | Vidéo hero non compressée (`preload="auto"`, ~12,5 Mo) | ✅ **CORRIGÉ** — ré-encodée à 3,7 Mo (1280×960, CRF 26, piste audio retirée car la vidéo est toujours `muted`), sous la cible <5 Mo ; qualité visuelle vérifiée quasi identique |
| P3 | Témoignages non structurés (`SceneSocialProof`) | ⚠️ **PARTIEL — problème plus grave que prévu** — la section affichait en réalité 3 témoignages **entièrement fictifs** ("Sophie M.", "Laurent D.", "Camille & Thomas R.") et une fausse note "4.9 — 48 avis" jamais reliés à la vraie fiche GMB. Supprimés. Intégration Google Places API (New) mise en place (`lib/googleReviews.ts`) avec schema `AggregateRating`/`Review` réel construit uniquement à partir de vraies données. **Inactive tant que `GOOGLE_PLACES_API_KEY` n'est pas configurée** (nécessite un projet Google Cloud avec facturation) — en attendant, la section affiche un lien vers la fiche Google au lieu de données inventées |

**Nouveau score estimé : 8,7/10** (était 8/10). Restant : configurer `GOOGLE_PLACES_API_KEY` pour activer les vrais avis (seule action bloquante restante côté utilisateur pour ce point), vérifier/créer la fiche Google Business Profile (toujours non confirmée), schema `Person` pour le chauffeur, compression de `vehicle_scrub.mp4` (9,6 Mo, non demandée cette session).

---

## 1. Résumé Exécutif

**Verdict : Bonne Base — Optimisation Nécessaire**

VTCLAND dispose d'une infrastructure SEO technique solide pour un projet Next.js : sitemap dynamique, robots.txt, canonical URLs, métadonnées uniques par page, et structured data sur chaque landing page. Le travail de fond est là.

Cependant, **trois problèmes critiques bloquent la performance réelle** :
1. **`/og-image.jpg` introuvable** — toutes les cartes sociales (OG / Twitter) affichent une image cassée.
2. **Numéro de téléphone placeholder** (`+33XXXXXXXXX`) dans le JSON-LD global — le schema LocalBusiness est invalide pour Google et les moteurs IA.
3. **Lien Google Maps fictif** dans `sameAs` — signal d'autorité locale brisé.

Sur le plan GEO (optimisation pour les moteurs IA), les lacunes majeures sont : absence de sections FAQ, aucune page d'avis/témoignages structurés, aucune page "À propos", aucun contenu de prix, et pas de `llms.txt`.

---

## 2. Contexte du Projet

| Dimension           | Valeur                                                            |
|---------------------|-------------------------------------------------------------------|
| Type de projet      | Site vitrine local + 6 landing pages SEO                         |
| Marché cible        | VTC premium Occitanie — Montpellier, Nîmes, Gard, Hérault        |
| Audience            | Particuliers et professionnels cherchant un chauffeur privé local |
| Objectif business   | Générer des demandes de devis via le chat IA Élia                 |
| Framework           | Next.js 16 App Router — SSR/SSG hybride                          |
| Pages auditées      | 7 pages (1 home one-pager + 6 landing pages SEO locales)         |
| Concurrence         | Forte sur les requêtes VTC locales (Uber, Bolt, acteurs locaux)  |

---

## 3. Scorecard SEO

| Catégorie         | Score /10 | Statut                   |
|-------------------|----------:|--------------------------|
| SEO Technique     | 6/10      | Bon socle, gaps bloquants |
| SEO Contenu       | 5/10      | Insuffisant               |
| Performance       | 5/10      | Risques LCP vidéo         |
| SEO Local         | 3/10      | Lacunes critiques         |
| Autorité / E-E-A-T| 2/10      | Quasi inexistante         |
| **SEO Global**    | **4,5/10**| **Optimisation requise**  |

---

## 4. Scorecard GEO

| Catégorie              | Score /10 | Statut                   |
|------------------------|----------:|--------------------------|
| Clarté sémantique      | 7/10      | Bonne                    |
| Reconnaissance d'entité| 5/10      | Partielle                |
| Lisibilité par les IA  | 4/10      | Insuffisante             |
| Citabilité             | 3/10      | Faible                   |
| Connaissance structurée| 2/10      | Très faible              |
| **GEO Global**         | **4/10**  | **Amélioration urgente** |

---

## 5. Findings SEO Technique

---

### P0 — Image Open Graph `/og-image.jpg` introuvable

**Problème :** Toutes les 7 pages référencent `/og-image.jpg` pour les balises Open Graph et Twitter Card, mais ce fichier n'existe pas dans `/public/`.

**Preuve :**
```ts
// app/layout.tsx
images: [{ url: '/og-image.jpg', width: 1200, height: 630, ... }]

// Fichiers présents dans /public/images/ :
// hero-aeroport-montpellier.webp, hero-chauffeur-pro.webp...
// → aucun og-image.jpg
```

**Impact :** Toutes les cartes sociales (partages Facebook, LinkedIn, WhatsApp, Twitter/X) affichent une image cassée. Perte majeure de CTR sur les partages sociaux. Les robots de crawl OG (Facebook, Slack, Discord) échoueront silencieusement.

**Fix :** Créer une image `og-image.jpg` (1200×630px) représentant la marque VTCLAND et la placer dans `/public/`.

**Effort :** 30 min (design) + 5 min (dépôt)
**Impact SEO/GEO :** Élevé

---

### P0 — Placeholder téléphone dans le schema JSON-LD global

**Problème :** Le `JsonLd.tsx` global (injecté sur toutes les pages) contient un numéro fictif.

**Preuve :**
```ts
// components/seo/JsonLd.tsx:10
telephone: '+33XXXXXXXXX', // ← À REMPLACER par le numéro réel
sameAs: ['https://www.google.com/maps/place/VTCLAND'], // ← URL fictive
```

**Impact :** Google peut invalider le schema `LocalBusiness` entier s'il détecte des données incohérentes. Les moteurs IA ne pourront pas citer le numéro de téléphone ni le lien Maps comme information fiable. Perte de confiance dans le Knowledge Graph local.

**Fix :**
```ts
telephone: '+33783699229', // numéro réel visible dans SceneContact
sameAs: ['https://maps.app.goo.gl/XXXXX'], // URL Google Business Profile réelle
```

**Effort :** 5 min
**Impact SEO/GEO :** Critique pour le SEO local

---

### P1 — Images hero sans attribut `alt` significatif

**Problème :** Les images hero des 6 landing pages utilisent `alt=""`.

**Preuve :**
```tsx
// components/scenes/SceneHero.tsx:172
<Image src={heroImageSrc} alt="" fill priority ... />
```

**Impact :** Les moteurs de recherche ne peuvent pas contextualiser ces images. Sur des pages comme `/vtc-montpellier`, l'image hero est l'élément visuel le plus important — une description alt comme `"Chauffeur privé VTCLAND à Montpellier"` contribuerait au signal de pertinence local.

**Fix :**
```tsx
// Ajouter une prop imageAlt à SceneHeroProps
<Image src={heroImageSrc} alt={imageAlt ?? ''} fill priority ... />
// Exemple sur vtc-montpellier : alt="Chauffeur privé VTCLAND à Montpellier, Hérault"
```

**Effort :** 30 min
**Impact SEO :** Moyen

---

### P1 — Schema JSON-LD des landing pages incomplet

**Problème :** Les 6 landing pages ont un schema `TaxiService` minimal. Les propriétés essentielles pour le SEO local manquent sur la quasi-totalité d'entre elles.

**Preuve :**
```ts
// vtc-montpellier/page.tsx
const jsonLd = {
  '@type': 'TaxiService',
  name: 'VTCLAND — VTC Montpellier',
  // Manquant : telephone, address, geo, priceRange, openingHoursSpecification,
  //            aggregateRating, provider, hasMap
}
```

Propriétés manquantes sur chaque landing page :
- `telephone` — numéro de contact
- `address` — adresse ou zone d'intervention formalisée
- `geo` — coordonnées géographiques
- `priceRange` — indication de gamme de prix
- `openingHoursSpecification` — 24h/24 non formalisé sur les landing pages
- `aggregateRating` — avis clients
- `provider` — lien vers l'organisation VTCLAND principale

**Impact :** Rich snippets locaux impossibles. Potentiel de Knowledge Panel réduit. Les moteurs IA peinent à extraire des informations structurées fiables.

**Fix :** Étendre chaque `jsonLd` landing page avec les propriétés manquantes.

**Effort :** 1-2 heures
**Impact SEO :** Élevé

---

### P1 — Balise `<title>` home page sans template complet

**Problème :** La page home (`/`) n'a pas de `export const metadata` propre — elle hérite uniquement du layout.

**Preuve :**
```tsx
// app/page.tsx — aucune export metadata
export default function HomePage() {
  return <main>...</main>
}
```

Le titre hérité `"VTCLAND — Chauffeur Privé Montpellier & Nîmes | Occitanie"` est correct, mais il n'y a pas de contrôle granulaire sur la balise canonical de la homepage (définie comme `alternates: { canonical: '/' }` dans le layout, ce qui est acceptable mais non explicite par page).

**Impact :** Faible en l'état, mais risque de dérive si le template évolue.

**Fix :** Ajouter un `export const metadata` minimal dans `app/page.tsx` pour expliciter le canonical.

**Effort :** 10 min

---

### P2 — Routes API non exclues de robots.txt

**Problème :** `robots.ts` autorise tout le site (`allow: '/'`) sans exclure les routes API.

**Preuve :**
```ts
rules: { userAgent: '*', allow: '/' }
// → /api/chat, /api/devis, /api/distance sont theoriquement crawlables
```

**Impact :** Très faible en pratique (les routes retournent du JSON, Google les ignorera), mais bonne pratique de les exclure explicitement.

**Fix :**
```ts
rules: [
  { userAgent: '*', allow: '/', disallow: '/api/' }
]
```

**Effort :** 5 min

---

### P2 — Performance : vidéo hero avec `preload="auto"` sur la home

**Problème :** La vidéo hero de la homepage charge avec `preload="auto"`, ce qui déclenche le téléchargement immédiat du fichier vidéo.

**Preuve :**
```tsx
// SceneHero.tsx:179
<video src="/videos/hero.mp4" autoPlay muted loop playsInline preload="auto" />
```

**Impact :** Le fichier `/public/videos/hero.mp4` peut être lourd (les fichiers `.MOV` iOS de référence font typiquement 50-200 MB). Cela retarde le LCP (Largest Contentful Paint) et pénalise le score Core Web Vitals, qui est un facteur de classement Google depuis 2021.

**Fix :**
- Compresser la vidéo (target < 5 MB pour un hero loop)
- Utiliser `preload="none"` ou `preload="metadata"`
- Envisager un poster image statique pour le LCP

**Effort :** 1-2 heures (compression vidéo)
**Impact SEO :** Moyen (Core Web Vitals)

---

### P2 — Fichiers MOV bruts dans `/public/videos/`

**Problème :** Deux fichiers `IMG_0483.MOV` et `IMG_0485.MOV` (fichiers caméra iOS bruts) sont présents dans `/public/videos/`.

**Preuve :** Listés dans les assets publics.

**Impact :** Ces fichiers sont accessibles publiquement et potentiellement très lourds. Ils ne devraient pas être déployés en production.

**Fix :** Supprimer ou déplacer hors du répertoire public.

**Effort :** 5 min

---

### P3 — Absence de `BreadcrumbList` schema

**Problème :** Aucun schema de fil d'Ariane sur les landing pages.

**Impact :** Les breadcrumbs riches dans les SERPs Google ne sont pas exploitables. Pour des landing pages locales (`/vtc-montpellier`), un breadcrumb `VTCLAND > VTC Montpellier` améliore la lisibilité dans les résultats.

**Fix :** Ajouter un `BreadcrumbList` sur chaque landing page.

---

## 6. Findings SEO Contenu

---

### P1 — Titre H1 de la homepage non optimisé pour les requêtes cibles

**Problème :** Le H1 de la homepage est "Chaque trajet est une promesse." — phrase de positionnement poétique, sans mot-clé de recherche.

**Preuve :**
```tsx
// SceneHero defaults
title = <>Chaque trajet<br /><span ...>est une promesse.</span></>
```

**Impact :** Sur la page d'accueil, Google accorde beaucoup de poids au H1 pour la pertinence thématique. Une requête comme "VTC Montpellier" ou "chauffeur privé Occitanie" ne sera pas renforcée par ce H1.

**Recommandation :** Le H1 peut rester esthétique (c'est un site premium), mais intégrer le sous-titre (`subtitle`) comme texte visible riche en mots-clés est important — c'est déjà partiellement fait avec `subtitle = 'Chauffeur privé · Montpellier · Nîmes · Occitanie'`.

**Fix alternatif :** S'assurer que la balise title meta (`VTCLAND — Chauffeur Privé Montpellier & Nîmes | Occitanie`) compense le H1 poétique, et que le contenu visible dans les premières sections est dense en mots-clés locaux.

**Effort :** Faible (contenu existant)

---

### P1 — Aucune section FAQ sur aucune page

**Problème :** Aucune page ne contient de section FAQ, ni de schema `FAQPage`.

**Impact :**
- **SEO :** Les rich snippets FAQ dans les SERPs Google sont perdus (affichage question/réponse sous le lien).
- **GEO :** Les moteurs IA (ChatGPT, Perplexity, Gemini) extraient et citent préférentiellement les formats Q/R clairs. Sans FAQ, VTCLAND est peu probable d'apparaître dans les réponses IA sur "quel est le prix d'un VTC à Montpellier ?" ou "comment réserver un chauffeur privé pour un mariage dans le Gard ?".

**Exemples de questions à couvrir :** (je te donne ici indication de reponse s'il faut n'hesites pas de demander pour mettre d'autre questtion plus interresante et servant la SEO et GEO )
- Combien coûte un transfert aéroport Montpellier ? entre 25€-45€ selon le depart 
- Puis-je réserver un chauffeur privé la nuit à Nîmes ? Oui
- Quels véhicules propose VTCLAND ? 
- Comment se déroule une réservation avec Élia ? Utilise le code pour r
- Proposez-vous la facturation entreprise ? Evidemment

**Effort :** 2-3 heures (contenu + composant + schema)
**Impact SEO/GEO :** Élevé

---

### P1 — Absence de contenu textuel structuré sur les landing pages

**Problème :** Les landing pages reposent sur des composants `SceneHero` + `SectionHighlights` + `SceneContact`. L'examen de `SectionHighlights` n'est pas disponible mais la structure générale indique des sections d'accroche courtes sans blocs de contenu long.

**Impact :** Google et les moteurs IA valorisent les pages avec du contenu textuel substantiel et structuré pour les requêtes locales. Sur "VTC Montpellier", les concurrents avec des paragraphes de texte décrivant leurs zones de couverture, leurs engagements, et leurs tarifs seront favorisés.

**Recommandation :** Ajouter sur chaque landing page un bloc de contenu (200-400 mots) décrivant le service local, les points de prise en charge (aéroport, gare, centre-ville), les occasions couvertes, et un CTA texte.

**Effort :** 3-5 heures (rédaction + intégration)

---

### P2 — Aucune page légale ni mentions obligatoires

**Problème :** Aucune page `/mentions-legales`, `/politique-de-confidentialite`, `/cgv` n'existe dans l'arborescence.

**Impact SEO :** Facteur E-E-A-T (Trust). Google pénalise les sites commerciaux sans pages légales dans ses évaluations de qualité. Les "Search Quality Rater Guidelines" de Google listent explicitement l'absence de pages de confiance comme signal négatif.

**Impact légal :** Obligation légale en France (RGPD, loi pour la confiance dans l'économie numérique).

**Fix :** Créer `/mentions-legales` et `/politique-de-confidentialite` au minimum.

---

### P2 — Page "À propos" inexistante

**Problème :** Aucune page `/a-propos` ou section dédiée au chauffeur.

**Impact GEO :** Les moteurs IA cherchent à identifier l'auteur/opérateur d'un service avant de le citer. Une page avec le nom du chauffeur, son expérience, ses certifications VTC, ses valeurs, renforcerait massivement l'E-E-A-T et la citabilité par les IA.

**Fix :** Créer une page `/a-propos` avec : identité du chauffeur, années d'expérience, certification VTC, zone de couverture, philosophie du service.

---

### P3 — Aucune stratégie de contenu (blog / guides)

**Problème :** Aucun blog, guide, ou article n'est présent.

**Impact :** Pour un site VTC local, des articles comme "Les meilleurs restaurants de Montpellier avec navette VTC" ou "Guide : comment organiser le transport de mariage dans le Gard" créent de la longue traîne SEO et des opportunités de citation IA.

**Recommandation :** Non prioritaire à court terme mais à prévoir dans la roadmap 6 mois.

---

## 7. Findings GEO / Moteurs IA

---

### P0 — Entité principale VTCLAND mal reconnue par les IA

**Problème :** Les données structurées globales contiennent un téléphone fictif et un lien Maps faux. Les moteurs IA (ChatGPT, Perplexity, Gemini) qui construisent leur connaissance des entreprises locales depuis les schemas JSON-LD, Google Business Profile, et les données web vont référencer une entité incomplète ou erronée.

**Impact :** Quand un utilisateur demande à ChatGPT "quel chauffeur VTC contacter à Montpellier ?", VTCLAND sera ignoré ou présenté avec des données incorrectes.

**Fix :** Corriger le schema global (téléphone réel, lien Maps réel). Créer un Google Business Profile vérifié.

---

### P1 — Absence de FAQ — principale lacune GEO

**Problème :** Aucune page ne répond directement aux questions que les utilisateurs posent aux assistants IA.

**Impact :** Perplexity, ChatGPT Search, Gemini, et Claude AI construisent leurs réponses sur des sources qui répondent directement aux questions. Sans FAQ ni contenu Q/R, VTCLAND ne sera pas cité dans les réponses aux requêtes conversationnelles locales.

**Exemples de requêtes IA manquées :**
- "Combien coûte un VTC pour l'aéroport de Montpellier ?" → La grille tarifaire n'est pas exposée publiquement sur le site.
- "Y a-t-il des chauffeurs VTC pour les mariages dans le Gard ?" → Page existante mais sans contenu textuel FAQ citables.
- "Comment fonctionne VTCLAND ?" → Le processus Élia n'est pas décrit dans du contenu lisible par les IA.

---

### P1 — Tarifs non exposés publiquement

**Problème :** La grille tarifaire (`lib/pricing.ts`) est calculée côté client et jamais exposée en texte HTML crawlable. Aucune page ne mentionne les prix.

**Preuve :**
```ts
// lib/pricing.ts — jamais rendu en HTML public
// < 5km → 20€, ≤ 10km → 25€, > 10km → 2.5€/km
// Mise à disposition : 80€/h ≤ 4h, 70€/h ≤ 7h
```

**Impact GEO :** Une des requêtes les plus fréquentes aux assistants IA dans le secteur VTC est le prix. Sans information tarifaire publique, VTCLAND ne sera jamais cité dans les réponses IA sur le sujet.

**Fix :** Ajouter une section "À partir de" sur la homepage ou une page dédiée, avec les fourchettes de prix principales (forfait courte distance, tarif/km, mise à disposition).

---

### P2 — Aucun `llms.txt`

**Problème :** Pas de fichier `llms.txt` à la racine du domaine.

**Impact :** Ce fichier émergent (standard de facto proposé par Answer.ai) permet aux assistants IA de comprendre le site, son opérateur, ses services, et ce qui peut être cité. Bien que non standard au sens strict, plusieurs moteurs IA (Perplexity, ChatGPT Browse) le prennent déjà en compte.

**Fix :** Créer `/public/llms.txt` avec :
```
# VTCLAND
> Chauffeur privé premium en Occitanie — Montpellier, Nîmes, Gard, Hérault

## Services
- Transfert aéroport Montpellier-Méditerranée et Nîmes-Camargue
- Mise à disposition demi-journée/journée
- VTC événementiel (mariages, séminaires)
- Longue distance France & Europe

## Contact
- Réservation : via le chat IA sur vtcland.fr
- Disponible : 24h/24

## Zone desservie
Montpellier, Nîmes, Avignon, Hérault, Gard, Occitanie
```

**Effort :** 15 min

---

### P2 — Identité de l'opérateur absente du contenu HTML

**Problème :** Le nom du chauffeur n'apparaît nulle part dans le contenu public (ni dans les pages, ni dans les schemas).

**Impact GEO :** Les moteurs IA valorisent les entités humaines identifiées. "Chauffeur privé VTCLAND, [Prénom Nom], certifié VTC, 8 ans d'expérience à Montpellier" est une entité citables. "VTCLAND" seul l'est beaucoup moins.

---

### P3 — Témoignages non structurés

**Problème :** `SceneSocialProof` existe sur la homepage mais les avis ne sont probablement pas balisés avec `Review` ou `AggregateRating` schema.

**Impact :** Les étoiles et avis ne peuvent pas apparaître en rich snippets dans les SERPs. Les moteurs IA ne peuvent pas citer des étoiles/avis vérifiés.

---

## 8. Findings Données Structurées

| Page                                    | Schema présent       | Qualité | Problèmes                                              |
|-----------------------------------------|----------------------|---------|--------------------------------------------------------|
| `/` (global JsonLd.tsx)                 | LocalBusiness + Taxi | Faible  | Téléphone fictif, Maps fictif, pas d'adresse, pas de geo |
| `/vtc-montpellier`                      | TaxiService          | Moyen   | Pas de tel, pas d'heures, pas d'avis, pas de prix      |
| `/vtc-nimes`                            | TaxiService          | Moyen   | Idem                                                   |
| `/transfert-aeroport-montpellier`       | TaxiService          | Moyen   | Idem                                                   |
| `/vtc-mariage-gard`                     | TaxiService          | Moyen   | Idem                                                   |
| `/chauffeur-prive-professionnel-occitanie` | TaxiService       | Moyen   | Idem                                                   |
| `/longue-distance-occitanie`            | TaxiService          | Moyen   | Idem, areaServed France entière (très large)           |

**Schemas manquants globalement :**
- `WebSite` avec `SearchAction` — pour le sitelinks searchbox
- `BreadcrumbList` — pour les fils d'Ariane dans les SERPs
- `FAQPage` — pour les rich snippets FAQ
- `Person` — pour identifier le chauffeur
- `AggregateRating` — pour les avis
- `PriceSpecification` — pour les tarifs

---

## 9. SEO Local

### Statut général : Insuffisant pour un business local

Le SEO local est la dimension la plus critique pour VTCLAND — un service VTC se positionne quasi exclusivement sur des requêtes locales ("VTC Montpellier", "chauffeur privé Nîmes pas cher", etc.).

| Signal Local                        | Statut           |
|-------------------------------------|------------------|
| Google Business Profile             | Non vérifié/inconnu |
| NAP cohérent (Name/Address/Phone)   | Non — téléphone fictif dans schema |
| Pages locales (par ville)           | Présentes ✓      |
| Schema LocalBusiness                | Présent mais invalide |
| Lien Google Maps vérifié            | Fictif ✗         |
| Avis clients intégrés               | Non ✗            |
| Heures d'ouverture en schema        | Uniquement sur home ✗ |
| Coordonnées géographiques           | Absentes ✗       |
| Citations locales (annuaires)       | Non vérifiable depuis le code |

**Action prioritaire :** Créer et vérifier un **Google Business Profile** complet. C'est le levier le plus important pour la visibilité locale et apparaître dans le "Local Pack" (bloc de 3 résultats avec carte sur Google).

---

## 10. Gains Rapides (< 30 min chacun)

| Action                                              | Impact     | Effort |
|-----------------------------------------------------|------------|--------|
| Créer `/public/og-image.jpg` (1200×630px)           | Élevé      | 30 min |
| Remplacer `+33XXXXXXXXX` par le vrai numéro         | Critique   | 5 min  |
| Remplacer le faux lien Google Maps par l'URL réelle | Critique   | 5 min  |
| Créer `/public/llms.txt`                            | Moyen      | 15 min |
| Ajouter `disallow: '/api/'` dans robots.ts          | Faible     | 5 min  |
| Supprimer `IMG_0483.MOV` et `IMG_0485.MOV` de public| Faible     | 5 min  |

---

## 11. Améliorations Long Terme

### Mois 1-2 : Fondations locales
- Créer et vérifier Google Business Profile (numéro réel, photos, zone, horaires)
- Créer pages légales (`/mentions-legales`, `/politique-de-confidentialite`)
- Enrichir les schemas JSON-LD des landing pages (tel, heures, priceRange, geo)
- Ajouter attributs `alt` descriptifs aux images hero

### Mois 2-3 : Contenu SEO/GEO
- Créer une section FAQ sur chaque landing page + schema `FAQPage`
- Créer une page `/a-propos` avec identité du chauffeur, certifications, valeurs
- Exposer une grille tarifaire indicative en HTML public
- Ajouter une `AggregateRating` liée aux avis Google Business Profile

### Mois 3-6 : Autorité et topical coverage
- 3-5 articles de blog ciblant de la longue traîne locale
- Intégration d'avis Google vérifiés sur le site (Google Reviews widget ou similaire)
- Obtenir des citations locales (annuaires VTC, pages mairies, sites événementiels Gard/Hérault)
- `WebSite` schema avec `SearchAction`

---

## 12. Plan de Priorités

### P0 — Bloquants (à corriger avant mise en ligne)

1. **Créer `og-image.jpg`** — toutes les cartes sociales sont cassées
2. **Corriger le numéro de téléphone** dans `components/seo/JsonLd.tsx`
3. **Corriger le lien Google Maps** dans `sameAs`

### P1 — Haute priorité (première semaine post-lancement)

4. **Créer et vérifier Google Business Profile** — levier local n°1 — ❌ toujours non fait, action externe (compte Google), pas réalisable en code
5. **Ajouter alt text descriptifs** aux images hero (`SceneHero.tsx`) — ✅ fait
6. **Enrichir les schemas landing pages** (téléphone, heures, priceRange) — ✅ fait, y compris `geo` sur les 6 pages depuis le 2026-07-18
7. **Créer pages légales** (mentions légales, politique de confidentialité) — ✅ fait
8. **Ajouter sections FAQ** avec schema FAQPage sur les pages clés — ✅ fait sur les 6 landing pages + home depuis le 2026-07-18

### P2 — Améliorations importantes (mois 1)

9. **Exposer la grille tarifaire** en HTML public (au moins une fourchette) — ✅ fait
10. **Créer `/llms.txt`** pour optimiser la citabilité par les IA — ✅ fait
11. **Créer page `/a-propos`** pour le E-E-A-T — ✅ fait
12. **Optimiser la vidéo hero** pour réduire l'impact LCP — ✅ fait (2026-07-18, 12,5 Mo → 3,7 Mo)
13. **Exclure `/api/`** de robots.txt — ✅ fait

### P3 — Optimisations (mois 2-3)

14. **BreadcrumbList schema** sur les landing pages — ✅ fait
15. **WebSite schema** avec SearchAction — ⚠️ `WebSite` fait, `SearchAction` délibérément omis (pas de recherche interne sur le site)
16. **AggregateRating** liée aux avis Google — ⚠️ infrastructure prête (`lib/googleReviews.ts`, faux avis supprimés), inactive tant que `GOOGLE_PLACES_API_KEY` n'est pas configurée
17. **Stratégie blog** (3-5 articles de longue traîne locale) — ❌ non traité, hors périmètre court terme

---

## 13. Verdict Final

**Le site dispose d'une architecture SEO technique correcte** pour un projet Next.js : sitemap, robots, canonical, métadonnées uniques, structured data de base sur toutes les pages. Le travail de fond est solide.

**Mais il n'est pas prêt à générer du trafic organique local** car :
- Les données critiques du schema (téléphone, Maps) sont des placeholders
- L'image OG est absente (impact social et partages)
- Le SEO local (Google Business Profile) n'est pas activé
- Le contenu textuel est trop léger pour concurrencer sur les requêtes VTC locales
- Aucun signal E-E-A-T (pas d'about, pas de légales, pas d'avis structurés)
- La position GEO (visibilité dans les IA) est quasi nulle faute de FAQ et de contenu citables

Les corrections P0 et P1 représentent environ 2-3 jours de travail et porteraient le score à ~6,5/10, suffisant pour un lancement commercial contrôlé.

**SEO/GEO décision : Bonne Base — Optimisation Nécessaire avant objectif de trafic organique.**
