# Lancement contrôlé — VTCLAND

## Préconditions obligatoires

Ne pas ouvrir le trafic commercial tant que l'un de ces points reste rouge :

- domaine principal et redirection `www` validés en HTTPS ;
- formulaire rapide puis acceptation Telegram validés ;
- Élia puis refus Telegram validés ;
- test réel mobile 4G effectué ;
- mentions légales et politique de confidentialité publiées ;
- durée de conservation des demandes décidée et appliquée ;
- `/health`, `/ready`, sauvegardes et monitoring opérationnels.

## Phase 1 — Observation sans publicité

Durée minimale recommandée : 3 jours complets.

- Laisser le site accessible uniquement par trafic organique/direct.
- Ne pas activer Google Ads.
- Vérifier chaque jour :
  - disponibilité du site et de l'API ;
  - demandes reçues et cohérence des statuts ;
  - réception Telegram ;
  - emails envoyés, délivrés ou en échec ;
  - exécution des tâches planifiées ;
  - sauvegarde PostgreSQL du jour ;
  - erreurs Sentry/Railway sans données personnelles dans les logs.
- Traiter toute vraie demande comme une demande client, jamais comme une donnée de test.

### Critères de sortie

Passer à la phase suivante uniquement si :

- aucune demande n'a été perdue ;
- les notifications chauffeur sont reçues ;
- les réponses client correspondent au statut enregistré ;
- aucune erreur critique ou fuite de données n'est observée ;
- le parcours mobile est utilisable en conditions réelles.

## Phase 2 — Google Ads progressive

Budget prévu dans le plan : 50 € par mois. L'activation se fait manuellement après validation de la phase 1.

1. Vérifier que la conversion mesure `request_submitted`, pas un simple affichage de page ou un début de formulaire.
2. Vérifier qu'aucune donnée personnelle (nom, email, téléphone, adresses) n'est envoyée à l'outil publicitaire.
3. Démarrer avec une zone géographique limitée à Montpellier/Nîmes/Occitanie et les pages correspondant réellement au service.
4. Observer quotidiennement coût, demandes valides et origine pendant la première semaine.
5. Ne pas augmenter le budget avant de disposer de demandes réelles attribuables et traitées correctement.

## Arrêt immédiat des campagnes

Mettre les campagnes en pause si :

- le formulaire ou Élia ne peut plus créer de demande ;
- Telegram ou les emails chauffeur échouent sans alerte ;
- l'API ou la base est indisponible ;
- le coût augmente sans demande qualifiée ;
- une conversion enregistre des données personnelles ;
- une information commerciale ou tarifaire affichée est inexacte.

L'arrêt des Ads ne nécessite pas de rollback applicatif. Stabiliser le tunnel, exécuter les tests E2E puis réactiver manuellement.

## Revue après sept jours

Consigner : trafic, formulaires démarrés, demandes soumises, demandes acceptées/refusées, coût publicitaire, coût par demande valide et incidents. Décider ensuite de maintenir, ajuster ou suspendre le budget.
