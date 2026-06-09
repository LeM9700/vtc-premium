# Chatbot — Scroll, Limites de session & Garde contenu

Date: 2026-06-09  
Composants concernés: `components/scenes/SceneContact.tsx`, `app/api/chat/route.ts`

---

## 1. Fix scroll intelligent

### Problème
- `scrollbarWidth: none` rend la scrollbar invisible.
- L'auto-scroll actuel (`el.scrollTop = el.scrollHeight`) force le retour en bas à chaque message, même quand l'utilisateur remonte lire.

### Solution
- Remplacer l'auto-scroll par un **smart scroll** : ne scrolle en bas que si l'utilisateur est déjà dans les 80 derniers pixels du container.
- Ajouter une fine scrollbar custom via Tailwind (`scrollbar-thin`, couleur dorée `#C9A96E`/20) — ou via `className` CSS inline pour rester cohérent avec le thème.

---

## 2. Limite de session — 20 messages max

### Architecture
Vercel étant serverless (pas de mémoire persistante entre invocations), le comptage se fait **côté client** avec validation **côté serveur** :

- `SceneContact` maintient un state `messageCount` initialisé depuis `sessionStorage` (clé `elia_msg_count`).
- Chaque appel à `/api/chat` inclut le header `X-Message-Count: <n>`.
- La route API rejette avec `429` si `n >= 20`, sans appeler Claude.

### UX au dépassement
Quand `messageCount >= 20` côté client :
- L'input et le bouton Envoyer se désactivent.
- Élia affiche le message :

> *"Vous avez atteint le nombre maximum d'échanges pour cette session. Pour finaliser votre réservation, appelez-nous directement : **[07 83 69 92 29](tel:0783699229)**"*

Le numéro est un lien `<a href="tel:0783699229">` — compose automatiquement sur mobile, ouvre le composeur sur desktop.

---

## 3. Timeout d'inactivité — 7 minutes

- Timer `useRef<NodeJS.Timeout>` remis à zéro à chaque `sendMessage`.
- Après **7 minutes** sans envoi, la session expire.
- État `phase` passe à `'expired'`.
- Input désactivé, message affiché :

> *"Votre session a expiré après **7 minutes** d'inactivité. Rechargez la page pour démarrer une nouvelle conversation."*

---

## 4. Garde contenu — double couche

### Couche API (avant appel Claude)
Dans `app/api/chat/route.ts`, avant `client.messages.create()`, on vérifie le dernier message utilisateur contre une liste de patterns hors-sujet :

```ts
const OFF_TOPIC_PATTERNS = [
  /météo|temps qu.il fait|température/i,
  /recette|cuisine|gastronomie/i,
  /politique|élection|gouvernement/i,
  /blague|humour|drôle/i,
  /code|programme|javascript|python/i,
  /actualité|info|journal|news/i,
  /sport|foot|match/i,
]
```

Si match → réponse directe `200` sans appeler Claude :
> *"Je suis uniquement disponible pour vous aider à réserver votre trajet. Comment puis-je vous aider ?"*

### Couche prompt système
Ajout dans `SYSTEM_PROMPT` d'une règle absolue en tête de liste :

> **RÈGLE PRIORITAIRE** : Si le client pose une question sans rapport avec la réservation d'un trajet (météo, actualités, recettes, politique, code, blagues, sport, etc.), réponds UNIQUEMENT : "Je suis Élia, votre assistante réservation. Je ne suis pas en mesure de répondre à cela — mais je serai ravie de vous préparer un devis pour votre prochain trajet."

---

## États du composant

| `phase`      | Description                                |
|--------------|--------------------------------------------|
| `chat`       | Session active, échanges en cours          |
| `calculating`| Calcul distance + prix après collecte      |
| `done`       | Devis envoyé, chat verrouillé              |
| `expired`    | Timeout 7 min atteint, chat verrouillé     |
| `limit`      | 20 messages atteints, chat verrouillé      |

---

## Fichiers modifiés

| Fichier | Changements |
|---|---|
| `components/scenes/SceneContact.tsx` | Smart scroll, `messageCount`, timeout 7 min, états `expired`/`limit`, lien tel: |
| `app/api/chat/route.ts` | Vérif header `X-Message-Count`, filtre off-topic patterns |
