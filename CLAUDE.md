@AGENTS.md

# VTCLAND — Project Overview

Site vitrine premium pour un service de chauffeur privé VTC en Occitanie (Montpellier, Nîmes, Gard, Hérault). Next.js 16 (App Router) / React 19 / TypeScript / Tailwind 4, animations GSAP + Lenis, esthétique luxe noir/or.

## Business model

Le site n'a **pas de formulaire de contact classique**. La conversion passe entièrement par "Élia", un assistant conversationnel IA (`components/scenes/SceneContact.tsx`) qui :
1. Collecte 12 informations de trajet via dialogue (type, adresses, date/heure, passagers, options, paiement, coordonnées) — `POST /api/chat` (Claude, `claude-haiku-4-5`).
2. Calcule la distance réelle via géocodage + itinéraire — `POST /api/distance` (OpenRouteService).
3. Calcule le tarif localement — `lib/pricing.ts` (grille fixe courte distance + tarif/km + forfaits mise à disposition).
4. Envoie deux emails (chauffeur + client) récapitulant la demande — `POST /api/devis` (Resend).

Il n'y a **aucune base de données** : si l'envoi Resend échoue, la demande de devis est perdue sans trace exploitable. Il n'y a pas non plus d'espace admin — le chauffeur gère les leads uniquement par email.

## Pages

- `/` — one-page avec scènes (Hero, Identité, Véhicule, Services, Preuve sociale, Contact).
- 6 landing pages SEO locales, chacune avec son propre JSON-LD et un `SceneContact` contextualisé (`greeting`/`contextNote`) : `/vtc-montpellier`, `/vtc-nimes`, `/transfert-aeroport-montpellier`, `/vtc-mariage-gard`, `/chauffeur-prive-professionnel-occitanie`, `/longue-distance-occitanie`.

## Variables d'environnement requises

`ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`, `CHAUFFEUR_EMAIL`, `OPENROUTESERVICE_API_KEY`, `NEXT_PUBLIC_SITE_URL`. Seule `NEXT_PUBLIC_SITE_URL` est présente dans `.env.local` local — sans les autres clés, le chat, le calcul de distance et l'envoi de devis ne fonctionnent pas en local.

`GOOGLE_PLACES_API_KEY` est optionnelle — `lib/googleReviews.ts` l'utilise pour afficher la vraie note/les vrais avis Google dans `SceneSocialProof`. Sans elle, la section affiche un lien vers la fiche Google plutôt que d'inventer des données.

## Points connus à surveiller

- `components/ui/Navbar.tsx` existe mais est vide et n'est importé nulle part : pas de navigation globale entre les pages (seul le footer `FooterSeo` fait le maillage interne).
- Aucun test automatisé, aucune CI/CD, aucun monitoring détectés.
- Déploiement réel (plateforme, variables d'environnement en production) non déterminable depuis le repo — à confirmer avec l'utilisateur.

## Audits

Les audits du projet (discovery, features, sécurité, performance, SEO/GEO, accessibilité, production readiness) sont stockés dans `audit/[nom-audit].md`. Voir `audit/discovery.md` pour la vision d'ensemble détaillée.

⚠️ `.claude/commands/audit-discovery.md` est en réalité le contenu de l'audit d'accessibilité (bug de nommage) — à corriger si des audits futurs utilisent `/audit-discovery` en attendant une vraie vision projet.
