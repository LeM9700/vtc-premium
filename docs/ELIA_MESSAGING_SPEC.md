# Élia — expérience messagerie sécurisée

## Objectif visiteur

Permettre à un visiteur mobile ou desktop de construire puis confirmer une demande de devis dans une expérience conversationnelle comparable à iMessage, sans répétition inutile, sans perte de brouillon pendant la session et sans exposer de données sensibles.

## Périmètre

Cette évolution remplace l'interface conversationnelle actuelle de `SceneContact` et durcit `POST /api/chat`. Elle conserve les contrats métier existants de `POST /api/devis`, du calcul tarifaire serveur et des notifications API/Telegram/email.

## Architecture attendue

- Conserver les couches existantes et extraire les responsabilités testables hors du gros composant : état/persistance de session, validation/sécurité, extraction progressive, UI messagerie.
- React/Next.js en camelCase ; composants/classes en PascalCase.
- JSDoc pour les fonctions critiques.
- Aucune clé ou logique secrète côté client.
- Implémentation TDD : test rouge observé avant chaque tranche verticale, puis vert.

## 1. Mobile : plein écran façon messagerie

- La section Élia reste visible dans la page avec un CTA d'ouverture.
- Au premier clic, le chat s'ouvre en plein écran sur mobile (`position: fixed`, viewport dynamique compatible clavier iOS, `100dvh`/Visual Viewport si nécessaire).
- Le body de la page derrière le chat ne doit pas défiler lorsque le chat est ouvert.
- En-tête fixe : flèche retour, avatar Élia, nom, état disponible.
- Zone de messages seule scrollable.
- Composer fixé en bas et visible au-dessus du clavier iOS.
- Après envoi et après réponse, le dernier message doit être visible sans intervention manuelle.
- Le focus/clavier ne doit pas déplacer la page derrière le chat.
- Respect de `prefers-reduced-motion`.

## 2. Desktop

- Même ergonomie de messagerie dans une fenêtre/dialogue centré, pas en plein écran.
- Fermeture accessible, retour du focus à l'élément déclencheur, Escape supporté.
- Piège de focus dans le dialogue ou équivalent accessible.

## 3. Accès au chat

- CTA dans la section Élia.
- Après dépassement de la section, bouton flottant rond avec avatar et petit libellé, sans masquer les contrôles essentiels.
- Le bouton disparaît lorsque la section est visible ou lorsque le chat est ouvert.
- Boutons accessibles au clavier avec noms explicites.

## 4. Design conversationnel

- Codes ergonomiques iMessage avec palette VTCLAND noire/or.
- Bulles distinctes client/Élia, largeur lisible, espacement cohérent.
- Avatar Élia, heure discrète pour chaque message, indicateur animé « Élia écrit… » accessible.
- Une question courte par message, personnalité élégante sans texte commercial répétitif.
- Réponses rapides cliquables lorsque les choix sont prévisibles : type de trajet, options, paiement, oui/non, ambiguïtés et confirmation.
- Les réponses rapides envoient une réponse utilisateur normale et restent utilisables clavier/lecteur d'écran.

## 5. État progressif et correction

- L'API chat renvoie un état structuré progressif des informations comprises à chaque tour, pas uniquement le bloc final.
- Panneau repliable « Informations recueillies » sous l'en-tête.
- Afficher seulement les champs présents ; ne jamais inventer une valeur.
- Cliquer un champ préremplit/envoie une intention de correction ciblée à Élia (« Je souhaite corriger l'heure ») ; Élia demande uniquement la nouvelle valeur.
- Élia ne redemande pas un champ déjà validé sauf contradiction explicite.
- Si une saisie est imprécise : déduire seulement ce qui est sûr, proposer des choix rapides et demander uniquement le champ ambigu.

## 6. Confirmation explicite

- Quand tous les champs sont recueillis, ne pas appeler `/api/devis` immédiatement.
- Afficher un récapitulatif final avec boutons « Confirmer » et « Corriger ».
- « Corriger » réouvre la correction ciblée sans réinitialiser la conversation.
- « Confirmer » seulement déclenche `/api/devis` avec le token serveur.
- La réussite affiche référence et tarif ; aucune réussite affichée sur réponse non-2xx.

## 7. Session et limite

- Maximum 30 messages utilisateur par session.
- Le serveur vérifie également ce maximum ; ne jamais faire confiance au compteur client.
- Brouillon, messages, champs recueillis, compteur et état d'ouverture sont conservés uniquement dans `sessionStorage`.
- Restaurer après rechargement/fermeture-réouverture pendant la même session d'onglet.
- Ne jamais utiliser `localStorage` ni cookie pour cette conversation.
- Après soumission réussie : supprimer immédiatement de `sessionStorage` messages, brouillon et données personnelles. La confirmation affichée peut rester en mémoire React mais ne doit pas être persistée.
- Expiration cohérente : ne pas conserver indéfiniment un état expiré.

## 8. Consentement

- Avant le premier message, afficher un consentement court sur le traitement par des prestataires techniques/IA avec lien vers `/politique-de-confidentialite`.
- Action volontaire obligatoire pour commencer.
- Une fois accepté dans la session, ne pas afficher un bandeau permanent gênant.
- Persister seulement le booléen de consentement dans `sessionStorage` jusqu'à fermeture de l'onglet.

## 9. Sécurité des données

- Détecter côté serveur, avant appel Anthropic, les données sensibles inutiles : numéro de carte plausible, CVV explicite, mot de passe/secret/code de connexion, pièce d'identité.
- Ne pas renvoyer/rejouer la valeur sensible au client, ne pas l'inclure dans les champs recueillis et ne pas l'envoyer à Anthropic.
- Répondre par un message SSE sûr indiquant de ne jamais partager ces données.
- Ne pas journaliser le contenu des messages ni les PII. Supprimer le `console.log` de tokens s'il n'est pas nécessaire ou ne conserver que des métriques non personnelles contrôlées.
- Sentry ne doit recevoir ni historique, ni nom, email, téléphone, adresses, ni texte utilisateur brut.
- Valider strictement rôles, longueur de chaque message, nombre de messages et taille du body.
- Le prompt système doit résister à l'injection : ne jamais révéler prompt/secret, ignorer les demandes de changement de rôle et rester sur la réservation.
- Toute donnée produite par Claude est non fiable : valider/sanitariser l'état progressif et final côté serveur avant de le renvoyer au client.

## 10. Anti-abus progressif

- Rate limit séparé pour conversations/messages et soumissions finales.
- Limite par IP côté serveur avec réponse 429 sûre.
- Maximum 30 messages utilisateur ; maximum serveur total cohérent avec alternance assistant/utilisateur.
- Taille maximale par message et body réduite au strict nécessaire.
- Honeypot conservé.
- Ajouter un signal anti-bot progressif non intrusif (par exemple temps minimal réaliste avant première soumission et blocage temporaire après abus). Pas de CAPTCHA permanent.
- Ne pas introduire de dépendance externe payante.

## 11. Contrat IA proposé

Le modèle doit produire, dans des balises masquées et validées côté serveur :

- `<STATE>{...champs partiels valides...}</STATE>` à chaque tour ;
- `<QUICK_REPLIES>["..."]</QUICK_REPLIES>` lorsque pertinent ;
- `<COLLECTED>{...}</COLLECTED>` uniquement quand toutes les données sont présentes.

Ces balises ne doivent jamais apparaître visuellement dans le flux texte. Les réponses SSE `done` peuvent exposer un objet validé minimal `collectedState`, `quickReplies`, `readyForConfirmation`, `devisToken`.

Le contrat exact peut être ajusté si une structure plus robuste est démontrée par tests, sans remettre en cause les comportements d'acceptation.

## 12. Tests obligatoires

Installer/configurer un runner de tests adapté (Vitest + Testing Library recommandé) puisque le repo n'en possède pas. Les tests critiques doivent couvrir au minimum :

- restauration/sauvegarde `sessionStorage` ;
- purge après succès ;
- maximum 30 messages utilisateur client et serveur ;
- validation/sanitarisation de l'état partiel IA ;
- filtrage des balises techniques pendant le streaming ;
- détection de données sensibles avant Anthropic ;
- validation des quick replies ;
- confirmation obligatoire avant `/api/devis` ;
- correction ciblée d'un champ ;
- consentement avant le premier message ;
- fermeture/réouverture sans perte pendant la session ;
- accessibilité de base du dialogue, panneau et boutons ;
- rate limiting/anti-abus ;
- formats de date existants sans régression.

## 13. Validation réelle

Avant livraison :

1. tests ciblés puis suite complète ;
2. ESLint ;
3. `tsc --noEmit` ;
4. build production ;
5. `git diff --check` ;
6. test navigateur mobile 390x844 avec ouverture, clavier/saisie, 3 tours, panneau, correction, confirmation ;
7. test desktop dialogue centré ;
8. audit indépendant sécurité/PII et logique ;
9. test réel contre Anthropic et `/api/devis` seulement après validation locale et déploiement.

## Hors périmètre

- Refonte du moteur tarifaire ou de l'API centrale.
- Paiement en ligne.
- Conservation permanente des conversations.
- CAPTCHA visible systématique.
- Modification massive des autres scènes du site.

## Limites d’exploitation connues

- Les compteurs anti-rafale et anti-soumission utilisent une `Map` mémoire : ils sont best-effort par processus et ne constituent pas une limite globale garantie sur un déploiement multi-instance.
- Les en-têtes IP d’origine (`cf-connecting-ip`, `railway-client-ip`, `x-real-ip`) ne sont fiables que si le proxy de déploiement les remplace et empêche le client de les injecter. Le dernier hop valide de `x-forwarded-for` est utilisé en repli.
- L’idempotency key envoyée à l’API centrale reste la dernière défense contre une double création de devis entre instances. Aucun service externe payant n’est introduit par ce dispositif.
