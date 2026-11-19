# Plan de retour arrière — VTCLAND

Ce document décrit le retour arrière opérationnel du site public, de l'API et de PostgreSQL. Il ne contient aucun secret.

## Principes

- Ne jamais pousser directement sur la branche de production.
- Ne jamais réécrire l'historique (`git push --force` interdit).
- Préférer un `git revert` versionné et relu à un checkout manuel non traçable.
- Ne restaurer une base de production qu'après confirmation explicite et validation du dump dans une base isolée.
- Conserver les demandes reçues : une panne de notification ne doit jamais entraîner leur suppression.

## Déclenchement

Envisager un rollback si, après un déploiement :

- `/health` ou `/ready` échoue durablement ;
- le formulaire ne peut plus créer de demande ;
- les statuts de réservation deviennent incohérents ;
- une régression expose des données ou contourne l'authentification ;
- le taux d'erreurs augmente fortement et le correctif immédiat n'est pas sûr.

Pour une erreur de contenu non critique, corriger en avant plutôt que revenir en arrière.

## Site public `vtc-premium`

Branche de production actuelle : `feat/seo-vtcland-occitanie`.
Service Railway : `vtc-premium-web`.
URL technique : `https://vtc-premium-web-production.up.railway.app`.

1. Identifier le commit fautif et le dernier commit connu comme stable :
   `git log --oneline --decorate -20`.
2. Créer une branche `revert/<motif>` depuis la branche de production à jour.
3. Exécuter `git revert <commit>` (ou revenir sur le commit de merge concerné avec `git revert -m 1 <merge>`).
4. Exécuter `npm run lint` puis `npm run build`.
5. Ouvrir une PR vers `feat/seo-vtcland-occitanie` et faire valider la fusion par Malik.
6. Vérifier le déploiement Railway. Si le webhook ne part pas, lancer explicitement `railway up --service vtc-premium-web --detach` depuis le commit fusionné.
7. Vérifier réellement : `/`, `/api/health`, formulaire et pages légales.

## API `api-vtcland`

Branche de production : `main`.
Service Railway : `api-vtcland`.
URL : `https://api-vtcland-production.up.railway.app`.

1. Identifier le commit fautif et le dernier commit stable.
2. Créer une branche `revert/<motif>` depuis `main` à jour.
3. Revenir sur le commit par `git revert` ; ne jamais forcer `main`.
4. Exécuter `npm run typecheck`, `npm run lint`, `npm run test` et `npm run build`.
5. Ouvrir une PR vers `main` ; Malik valide la fusion.
6. Surveiller la migration préalable et le déploiement Railway.
7. Vérifier réellement `/health` et `/ready`, puis une lecture non destructive d'une demande de test.

### Compatibilité des migrations

Les migrations doivent rester additives et compatibles avec la version précédente pendant la fenêtre de déploiement. Un rollback applicatif ne supprime pas automatiquement une migration déjà appliquée.

Si une migration destructive ou incompatible a atteint la production :

1. arrêter les écritures si leur poursuite aggrave l'incident ;
2. ne lancer aucune migration inverse improvisée ;
3. récupérer le dernier dump R2 antérieur à l'incident ;
4. restaurer ce dump dans une base PostgreSQL isolée ;
5. vérifier schéma, nombre de demandes et intégrité des statuts ;
6. obtenir une confirmation explicite avant toute restauration de production ;
7. documenter la fenêtre de perte éventuelle entre le dump et l'incident.

## PostgreSQL et sauvegardes

- Service : `Postgres`.
- Sauvegarde : service cron `postgres-backup-cron`, quotidienne à 03:00 UTC.
- Stockage : bucket R2 `vtcland-backups`.
- Rétention des dumps : 30 jours.

La procédure de restauration validée utilise `pg_restore` vers une base vierge. Toujours tester le dump dans une base isolée avant de remplacer une base active.

## Domaine et bascule temporaire

Le domaine public ne doit être basculé vers Railway qu'après validation du tunnel complet. En cas d'incident majeur après bascule :

1. privilégier un rollback applicatif, plus rapide et sans propagation DNS ;
2. si Railway est indisponible durablement, rétablir temporairement la dernière cible DNS stable ou une page de maintenance ;
3. ne modifier qu'un enregistrement à la fois et conserver les valeurs précédentes ;
4. vérifier HTTPS, domaine canonique et redirections `www` après propagation.

## Validation après rollback

- Site : réponse HTTP 200, navigation mobile, formulaire affiché.
- API : `/health` et `/ready` en HTTP 200.
- BDD : connexion `ready`, demandes existantes consultables.
- Notifications : aucune demande créée pendant l'incident n'est perdue ; relancer seulement les notifications explicitement identifiées comme manquantes.
- Monitoring : les services repassent `up` et l'alerte de rétablissement est reçue.

## Compte rendu d'incident

Après stabilisation, consigner : heure de début/fin, commit fautif, symptômes, impact, décision de rollback, vérifications exécutées et action préventive. Ne jamais inclure de secret ni de donnée personnelle client dans ce compte rendu.
