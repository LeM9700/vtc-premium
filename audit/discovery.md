# Project Discovery Report

> ⚠️ Note méthodologique : la commande `/audit-discovery` (`.claude/commands/audit-discovery.md`) est en réalité le contenu de l'**audit d'accessibilité** (elle référence `project-discovery.md` + `accessibility-audit.md` et produit un "Accessibility Audit Report"), et non une simple découverte de projet. Sur demande explicite de l'utilisateur, ce rapport applique directement la logique de `.claude/skills/project-discovery.md` seule, pour obtenir la vision globale attendue en première étape. À corriger : soit renommer ce fichier de commande en `audit-accessibility.md`, soit créer un vrai fichier `audit-discovery.md` basé sur `project-discovery.md`.

---

## 🔄 MISE À JOUR — 2026-07-16

Le plan de remédiation en 13 phases (`audit/fix-plan.md` + plan détaillé) a été exécuté en quasi-totalité. Statut des risques listés en section "Risks" ci-dessous :

- ✅ Injection de prompt, rate limiting, spam `/api/devis`, perte de leads silencieuse, placeholders JSON-LD, `.MOV` publics, `Navbar.tsx` non résolu (voir features.md F7) — corrigés, voir security.md/features.md/seo-geo.md pour le détail.
- ✅ Absence de tests/CI toujours vraie — non traité (hors périmètre de ce cycle).
- ⚠️ Fonctionnalité cœur en environnement local : `.env.example` créé pour documenter les variables requises, mais les clés réelles en production restent à confirmer par l'utilisateur (toujours une inconnue du repo).
- ✅ Le fichier artefact Windows (`commit_diff.txt`) a été supprimé.
- Score de compréhension du projet inchangé (8/10) — reste vrai indépendamment du code.

Voir `audit/security.md`, `audit/features.md`, `audit/performance.md`, `audit/accessibility.md`, `audit/seo-geo.md` et `audit/production.md` pour le détail phase par phase.

---

## Executive Summary

VTCLAND est un site marketing premium (une seule page principale « one-page » + 6 landing pages SEO locales) pour un service de **chauffeur privé VTC** opérant en Occitanie (Montpellier, Nîmes, Gard, Hérault). Construit en Next.js 16 / React 19 / Tailwind 4, avec une forte identité visuelle (animations GSAP, smooth-scroll Lenis, curseur personnalisé, esthétique « luxe » noir/or).

Le cœur business du site est un **assistant de réservation conversationnel nommé « Élia »**, propulsé par l'API Claude (Anthropic, modèle `claude-haiku-4-5`), qui collecte 12 informations de trajet en dialoguant avec le visiteur, calcule automatiquement un tarif (grille interne + distance routière via OpenRouteService), puis envoie un email de devis au chauffeur et au client via Resend. C'est un pipeline "lead-to-devis" entièrement automatisé, sans formulaire classique — un pari produit ambitieux et différenciant pour ce secteur.

Le projet est en développement actif (commits récents sur le chat IA, le hero, le SEO des pages secondaires) mais présente des signaux clairs de stade **MVP avancé, pas encore production-ready** : aucune variable d'environnement secrète n'est configurée en local (donc le chat IA, le calcul de distance et l'envoi d'email de devis sont potentiellement non fonctionnels tels quels), aucun test automatisé, aucune CI/CD, un composant `Navbar.tsx` créé mais vide et non utilisé (aucune navigation globale du site), et des placeholders non remplacés dans les données structurées SEO (numéro de téléphone factice `+33XXXXXXXXX`, lien Google Maps factice).

---

## Project Type

**Primary:** Marketing Website (site vitrine local avec forte orientation conversion/lead-gen)

**Secondary:** AI Application (assistant conversationnel de devis intégré au parcours de conversion)

**Confidence:** Élevée — le code, les routes API, le schema.org `TaxiService`/`LocalBusiness`, et le contenu éditorial confirment sans ambiguïté un site vitrine VTC avec IA de prise de devis.

---

## Business Goal

Générer des **demandes de devis / réservations de trajet** (transferts aéroport, mise à disposition, VTC événementiel — notamment mariages, longue distance) pour un service de chauffeur privé premium basé en Occitanie (zone Montpellier/Nîmes, départements Gard et Hérault).

La proposition de valeur affichée : disponibilité 24h/24, positionnement haut de gamme (« chauffeur privé d'exception »), et un parcours de devis instantané piloté par IA plutôt qu'un formulaire statique — différenciateur potentiel face à la concurrence VTC locale.

Ce que crée la valeur business ici : chaque conversation "Élia" menée à son terme = un email de devis envoyé au chauffeur avec toutes les infos qualifiées (trajet, date, contact, prix estimé) → conversion directe en piste commerciale actionnable par téléphone/email.

---

## Target Users

* **Particuliers** cherchant un transfert aéroport (Montpellier-Méditerranée, Nîmes-Camargue), notamment voyageurs d'affaires ou touristes.
* **Futurs mariés / organisateurs d'événements** dans le Gard/Hérault (page dédiée `vtc-mariage-gard`).
* **Professionnels/entreprises** ayant besoin de mise à disposition ou de chauffeur privé récurrent (`chauffeur-prive-professionnel-occitanie`).
* **Clients longue distance** (trajets inter-régionaux, `longue-distance-occitanie`).

Utilisateurs secondaires : le **chauffeur / exploitant lui-même**, qui reçoit les devis par email (pas d'interface d'administration constatée — la gestion des demandes se fait entièrement par email).

---

## Tech Stack

**Frontend**
Next.js 16.2.7 (App Router), React 19.2.4, TypeScript, Tailwind CSS 4, GSAP 3 + `@gsap/react` (animations scroll-driven), Lenis (smooth scroll), `split-type` (animation de texte).

**Backend**
Routes API Next.js (`app/api/*/route.ts`) — pas de backend séparé, pas de base de données détectée.

**Database**
Aucune détectée. Pas de persistance des leads/devis autre que l'envoi d'email (pas de stockage des conversations ou des demandes).

**Infrastructure**
Non déterminé avec certitude — absence de `Dockerfile`, `vercel.json`, ou workflow GitHub Actions. Le `README.md` est le boilerplate `create-next-app` par défaut (mentionne le déploiement Vercel de façon générique, non spécifique au projet). Le déploiement réel est **inconnu**.

**Authentication**
Aucune — site public sans compte utilisateur ni espace admin.

**AI**
Anthropic Claude (`@anthropic-ai/sdk` ^0.102.0, modèle `claude-haiku-4-5`) pour le chat de réservation. OpenRouteService (géocodage + calcul d'itinéraire) pour la distance/durée.

**Emailing**
Resend (`resend` ^6.12.4) pour l'envoi des emails de devis (chauffeur + client).

**Testing**
Aucun test détecté (aucun fichier `*.test.*`, aucun framework de test dans `package.json`).

**CI/CD**
Aucun (`.github/workflows` absent).

**Monitoring**
Aucun détecté (pas de Sentry, pas d'analytics visibles dans le code inspecté).

---

## Architecture

Architecture simple **monolithe Next.js full-stack**, sans base de données :

```
Visiteur
  ↓
Page (/ ou landing SEO locale)
  ↓
Scènes animées (Hero, Identité, Véhicule, Services, Preuve sociale)
  ↓
SceneContact (chat "Élia")
  ↓
POST /api/chat  →  Anthropic Claude (collecte conversationnelle)
  ↓ (une fois les 12 infos collectées)
POST /api/distance → OpenRouteService (géocodage + itinéraire)
  ↓
lib/pricing.ts (calcul tarif local, aucun appel externe)
  ↓
POST /api/devis → Resend (email chauffeur + email client)
  ↓
Chauffeur reçoit l'email et rappelle le client sous 2h (processus manuel hors-site)
```

Pas de couche de stockage persistante : si l'un des emails Resend échoue, la demande peut être perdue sans trace consultable (les erreurs sont seulement loguées côté serveur via `console.error`).

---

## Main Features

* Page d'accueil « one-page » à scènes animées (Hero, Identité, Flotte/Véhicule, Services, Preuve sociale, Contact/Devis).
* 6 landing pages SEO locales dédiées : `/vtc-montpellier`, `/vtc-nimes`, `/transfert-aeroport-montpellier`, `/vtc-mariage-gard`, `/chauffeur-prive-professionnel-occitanie`, `/longue-distance-occitanie` — chacune avec métadonnées, JSON-LD et un chat « Élia » contextualisé (greeting/contextNote adaptés à la page).
* Assistant IA conversationnel « Élia » (collecte structurée de 12 champs, garde-fous anti hors-sujet par regex + prompt, limite de 20 messages/session, expiration après 7 min d'inactivité).
* Calcul de tarif automatique (grille fixe courte distance + tarif/km + forfaits mise à disposition).
* Calcul de distance/durée réel via géocodage + itinéraire (OpenRouteService), avec fallback silencieux (`distanceKm = 0`) en cas d'échec.
* Envoi automatique de deux emails (chauffeur + client) récapitulant la demande de devis (Resend).
* SEO technique : `sitemap.ts`, `robots.ts`, JSON-LD `LocalBusiness`/`TaxiService` global + JSON-LD par page locale, métadonnées Open Graph/Twitter par page.
* Habillage UX : `LoadingScreen`, `CustomCursor`, smooth-scroll global (`SmoothScroller`/Lenis).
* `FooterSeo` : maillage interne vers les 6 pages villes/services.

---

## User Journey

Parcours principal (conversion) :

```
Visiteur arrive (SEO / pub / bouche-à-oreille)
  ↓
Landing page pertinente (accueil ou page locale ciblée)
  ↓
Scroll à travers les scènes de présentation (marque, véhicule, services, preuve sociale)
  ↓
Section Contact : conversation avec Élia
  ↓
Élia collecte type de trajet, adresses, date/heure, passagers, options, paiement, coordonnées
  ↓
Calcul automatique du prix + récapitulatif affiché dans le chat
  ↓
Email de devis envoyé au client (confirmation) et au chauffeur (lead qualifié)
  ↓
Chauffeur rappelle le client sous 2h (hors-site, manuel) pour confirmer
```

Parcours alternatif basique : appel téléphonique direct visible dans le chat en cas de session limite/expirée (`07 83 69 92 29`), mais **ce numéro n'apparaît nulle part ailleurs de façon persistante** (pas de header/navbar, pas de CTA téléphone visible en permanence) — point à vérifier en phase feature-audit.

---

## Deployment Context

Non déterminé avec certitude à partir du code seul :

* Domaine cible apparent : `vtcland.fr` (valeur par défaut codée en dur dans plusieurs fichiers).
* Pas de fichier de configuration de déploiement (`vercel.json`, `Dockerfile`, workflow CI).
* `.env.local` local ne contient que `NEXT_PUBLIC_SITE_URL` — aucune des clés nécessaires au fonctionnement (Anthropic, Resend, OpenRouteService, email chauffeur) n'est présente dans l'environnement local inspecté. Ces clés sont peut-être configurées uniquement sur la plateforme d'hébergement (ex. Vercel), mais cela n'a pas pu être vérifié depuis le repo.
* Aucune séparation d'environnements (dev/staging/prod) visible dans le code.

**Assomption à valider avec l'utilisateur/l'équipe : où et comment le site est-il réellement hébergé et quelles clés sont configurées en production ?**

---

## Risks

* **Fonctionnalité cœur potentiellement cassée en environnement local/preview** : sans `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `CHAUFFEUR_EMAIL`, `OPENROUTESERVICE_API_KEY` configurées, le chat, le calcul de distance et l'envoi de devis échoueront — c'est-à-dire la fonctionnalité qui génère 100 % de la valeur business du site.
* **Aucune persistance des leads.** Si l'email Resend échoue (quota, domaine non vérifié, erreur réseau), la demande de devis est perdue sans recours — aucune base de données, aucune file de retry, seul un `console.error`.
* **Aucun test automatisé et aucune CI/CD** — tout changement (y compris sur le prompt IA critique ou le calcul de prix) part directement en production sans filet.
* **Placeholders non remplacés dans le SEO/données structurées** : `telephone: '+33XXXXXXXXX'` et lien Google Maps factice dans `JsonLd.tsx` — impact direct sur le SEO local et la confiance utilisateur/Google.
* **Navigation globale absente.** `components/ui/Navbar.tsx` existe mais est vide et n'est importé nulle part — aucun menu ne permet à un visiteur de naviguer entre les pages villes/services depuis le header ; seul le footer et les liens contextuels du chat y donnent accès.
* **Prompt IA en clair côté client potentiellement contournable** : le `system` prompt est reconstruit et envoyé depuis le navigateur à `/api/chat` (visible dans `SceneContact.tsx`), ce qui mérite un examen en audit sécurité (risque de prompt injection / abus de l'API si le endpoint ne valide pas strictement l'origine et le contenu).
* **Pas de monitoring/alerting** détecté — si le pipeline de devis casse silencieusement en production, personne n'est notifié.
* **Un fichier suspect à la racine** : `C:UsersmelboAppDataLocalTempcommit_diff.txt` (non suivi, chemin Windows mal échappé) — probablement un artefact accidentel, à vérifier/supprimer avant commit.

---

## Missing Information

* Où le site est réellement déployé (Vercel ? autre ?) et quelles variables d'environnement y sont configurées.
* Si un espace d'administration ou un CRM externe existe pour suivre les demandes de devis (rien dans le repo ne l'indique).
* Le numéro de téléphone réel de l'entreprise (`+33XXXXXXXXX` dans le JSON-LD est un placeholder).
* L'URL Google Maps/Google Business réelle (placeholder également).
* S'il existe un compte Resend vérifié avec un domaine d'envoi propre (`onboarding@resend.dev` est utilisé par défaut si `EMAIL_FROM` n'est pas défini — risque de délivrabilité/spam en production).
* Volume de trafic actuel et objectifs business (nombre de devis/mois visé, budget pub, etc.).
* Statut exact des images/vidéos référencées dans `public/images` et `public/videos` (poids, formats, optimisation) — non audité à ce stade (réservé à l'audit performance).

---

## Confidence Score

**Project understanding: 8/10**

Justification : le code est petit, lisible et cohérent, le business model (VTC premium + devis piloté par IA) est sans ambiguïté, et le parcours utilisateur principal est entièrement traçable de bout en bout dans le code. Les points qui empêchent un score de 9-10 : l'environnement de déploiement réel et les secrets de production ne sont pas vérifiables depuis le repo, et il n'existe aucune documentation projet (le `README.md` est resté au boilerplate par défaut) confirmant les objectifs business exacts (volumes cibles, budget, process réel de suivi commercial côté chauffeur).

