# Chatbot — Scroll, Limites de session & Garde contenu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corriger le scroll du chat, limiter les sessions à 20 messages par session avec timeout 7 min, et bloquer les requêtes hors-sujet côté API et prompt.

**Architecture:** Deux fichiers modifiés. L'API route gère la validation du compteur et le filtre hors-sujet avant d'appeler Claude. Le composant `SceneContact` gère le compteur côté client (sessionStorage), le timeout d'inactivité, le scroll intelligent, et les états UI `limit`/`expired`.

**Tech Stack:** Next.js App Router, React hooks, TypeScript, sessionStorage, Anthropic SDK

---

## File Map

| Fichier | Rôle |
|---|---|
| `app/api/chat/route.ts` | Validation X-Message-Count header + filtre off-topic avant appel Claude |
| `components/scenes/SceneContact.tsx` | Smart scroll, messageCount + sessionStorage, timeout 7 min, états limit/expired, lien tel: |

---

### Task 1: API route — filtre off-topic + garde message count

**Files:**
- Modify: `app/api/chat/route.ts`

- [ ] **Step 1: Lire le fichier actuel**

```bash
# Vérifier le contenu actuel avant modification
cat app/api/chat/route.ts
```

- [ ] **Step 2: Remplacer entièrement `app/api/chat/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

const MAX_MESSAGES = 20

const OFF_TOPIC_PATTERNS = [
  /météo|temps qu.il fait|température extérieure/i,
  /recette|cuisine|gastronomie/i,
  /politique|élection|gouvernement/i,
  /blague|humour|raconte.moi/i,
  /\bcode\b|programme|javascript|python|typescript|développe/i,
  /actualité|journal|news|info du jour/i,
  /sport|football|match|ligue/i,
  /médecin|santé|maladie|symptôme/i,
  /traduction|traduire|anglais|espagnol/i,
]

const OFF_TOPIC_REPLY =
  "Je suis uniquement disponible pour vous aider à réserver votre trajet. Comment puis-je vous aider ?"

export async function POST(req: NextRequest) {
  try {
    const messageCount = parseInt(req.headers.get('X-Message-Count') ?? '0', 10)
    if (messageCount >= MAX_MESSAGES) {
      return NextResponse.json({ error: 'Limite atteinte' }, { status: 429 })
    }

    const { messages, system } = await req.json()

    const lastUserMsg = [...messages].reverse().find((m: { role: string }) => m.role === 'user')
    if (lastUserMsg) {
      const isOffTopic = OFF_TOPIC_PATTERNS.some(p => p.test(lastUserMsg.content))
      if (isOffTopic) {
        return NextResponse.json({ content: OFF_TOPIC_REPLY })
      }
    }

    const response = await client.messages.create({
      model:      'claude-haiku-4-5',
      max_tokens: 1024,
      system,
      messages,
    })

    const content = response.content[0]?.type === 'text'
      ? response.content[0].text
      : ''

    return NextResponse.json({ content })

  } catch (err) {
    console.error('[chat]', err)
    return NextResponse.json({ error: 'Erreur API' }, { status: 500 })
  }
}
```

- [ ] **Step 3: Vérifier le build TypeScript**

```bash
npx tsc --noEmit
```

Expected: aucune erreur sur `app/api/chat/route.ts`

- [ ] **Step 4: Commit**

```bash
git add app/api/chat/route.ts
git commit -m "feat(api): add off-topic filter and message count guard"
```

---

### Task 2: SceneContact — mise à jour du type `phase` et du SYSTEM_PROMPT

**Files:**
- Modify: `components/scenes/SceneContact.tsx`

- [ ] **Step 1: Mettre à jour le type `phase` pour inclure les deux nouveaux états**

Localiser la ligne :
```typescript
const [phase, setPhase] = useState<'chat' | 'calculating' | 'done'>('chat')
```

Remplacer par :
```typescript
const [phase, setPhase] = useState<'chat' | 'calculating' | 'done' | 'expired' | 'limit'>('chat')
```

- [ ] **Step 2: Renforcer le SYSTEM_PROMPT**

Localiser la ligne qui commence par :
```
const SYSTEM_PROMPT = `Tu es l'assistant de réservation...
```

Remplacer **uniquement** le bloc `RÈGLES ABSOLUES :` en ajoutant la règle prioritaire en première position :

```
RÈGLE PRIORITAIRE :
- Si le client pose une question sans rapport avec la réservation d'un trajet (météo, actualités, recettes, politique, code, blagues, sport, santé, traduction, etc.), réponds UNIQUEMENT : "Je suis Élia, votre assistante réservation. Je ne suis pas en mesure de répondre à cela — mais je serai ravie de vous préparer un devis pour votre prochain trajet."

RÈGLES ABSOLUES :
```

(Le reste du prompt reste identique.)

- [ ] **Step 3: Vérifier le build TypeScript**

```bash
npx tsc --noEmit
```

Expected: aucune erreur TypeScript

- [ ] **Step 4: Commit**

```bash
git add components/scenes/SceneContact.tsx
git commit -m "feat(chat): add expired/limit phase types and reinforce system prompt"
```

---

### Task 3: SceneContact — smart scroll + scrollbar visible

**Files:**
- Modify: `components/scenes/SceneContact.tsx`

- [ ] **Step 1: Remplacer l'auto-scroll existant par un smart scroll**

Localiser le `useEffect` :
```typescript
// ── Scroll automatique vers le bas ────────────────────────
useEffect(() => {
  const el = messagesRef.current
  if (el) el.scrollTop = el.scrollHeight
}, [messages, loading])
```

Remplacer par :
```typescript
// ── Smart scroll — scroll en bas seulement si déjà proche du bas ──
useEffect(() => {
  const el = messagesRef.current
  if (!el) return
  const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80
  if (isNearBottom) el.scrollTop = el.scrollHeight
}, [messages, loading])
```

- [ ] **Step 2: Rendre la scrollbar visible dans le thème doré**

Localiser le div des messages :
```tsx
<div
  ref={messagesRef}
  className="flex flex-col gap-6 px-8 py-8 h-96 overflow-y-auto scroll-smooth"
  style={{ scrollbarWidth: 'none' }}
>
```

Remplacer par :
```tsx
<div
  ref={messagesRef}
  className="flex flex-col gap-6 px-8 py-8 h-96 overflow-y-auto scroll-smooth"
  style={{
    scrollbarWidth: 'thin',
    scrollbarColor: 'rgba(201,169,110,0.3) transparent',
  }}
>
```

- [ ] **Step 3: Démarrer le serveur de dev et vérifier manuellement**

```bash
npm run dev
```

Ouvrir `http://localhost:3000`, naviguer jusqu'à la section Contact, envoyer plusieurs messages jusqu'à remplir le chat, puis vérifier :
- La scrollbar fine dorée est visible sur le bord droit
- En remontant manuellement, la vue ne saute plus en bas quand un nouveau message arrive (tant qu'on n'est pas en bas)
- En étant en bas, les nouveaux messages auto-scrollent bien

- [ ] **Step 4: Commit**

```bash
git add components/scenes/SceneContact.tsx
git commit -m "fix(chat): smart scroll preserves reading position, show thin gold scrollbar"
```

---

### Task 4: SceneContact — compteur de messages + sessionStorage

**Files:**
- Modify: `components/scenes/SceneContact.tsx`

- [ ] **Step 1: Ajouter la constante et le state messageCount**

Après la ligne :
```typescript
const SESSION_KEY = 'elia_msg_count' // ajouter cette constante AVANT le composant
```

À placer juste avant `export default function SceneContact()`.

Puis à l'intérieur du composant, après la déclaration de `phase` :
```typescript
const [messageCount, setMessageCount] = useState<number>(() => {
  if (typeof window === 'undefined') return 0
  return parseInt(sessionStorage.getItem('elia_msg_count') ?? '0', 10)
})
```

- [ ] **Step 2: Mettre à jour `callClaude` pour envoyer le header**

Localiser dans `callClaude` :
```typescript
const res = await fetch('/api/chat', {
  method:  'POST',
  headers: { 'Content-Type': 'application/json' },
  body:    JSON.stringify({ messages: history, system: SYSTEM_PROMPT }),
})
```

Remplacer par :
```typescript
const res = await fetch('/api/chat', {
  method:  'POST',
  headers: {
    'Content-Type':    'application/json',
    'X-Message-Count': String(messageCount),
  },
  body: JSON.stringify({ messages: history, system: SYSTEM_PROMPT }),
})
```

Note: `callClaude` doit recevoir `messageCount` en paramètre ou le lire via closure. Comme il est dans le même composant et `useCallback` le référence, il doit être ajouté aux dépendances.

Mettre à jour la signature de `callClaude` :
```typescript
const callClaude = useCallback(async (history: Message[], count: number): Promise<string> => {
  const res = await fetch('/api/chat', {
    method:  'POST',
    headers: {
      'Content-Type':    'application/json',
      'X-Message-Count': String(count),
    },
    body: JSON.stringify({ messages: history, system: SYSTEM_PROMPT }),
  })
  const data = await res.json()
  return data.content ?? 'Une erreur est survenue.'
}, [])
```

- [ ] **Step 3: Mettre à jour `sendMessage` pour incrémenter le compteur et passer à `callClaude`**

Localiser dans `sendMessage` :
```typescript
const text = input.trim()
if (!text || loading || phase !== 'chat') return
```

Remplacer par :
```typescript
const text = input.trim()
if (!text || loading || phase !== 'chat') return

if (messageCount >= 20) {
  setPhase('limit')
  return
}
```

Puis, après `setMessages(newHistory)` et `setInput('')` :
```typescript
const newCount = messageCount + 1
setMessageCount(newCount)
sessionStorage.setItem('elia_msg_count', String(newCount))
```

Et mettre à jour l'appel à `callClaude` :
```typescript
const reply = await callClaude(newHistory, newCount)
```

Puis, après avoir ajouté le message assistant, vérifier si le nouveau compteur atteint la limite :
```typescript
if (newCount >= 20) {
  setPhase('limit')
}
```

Mettre à jour les dépendances du `useCallback` de `sendMessage` pour inclure `messageCount`.

- [ ] **Step 4: Vérifier TypeScript**

```bash
npx tsc --noEmit
```

Expected: aucune erreur

- [ ] **Step 5: Commit**

```bash
git add components/scenes/SceneContact.tsx
git commit -m "feat(chat): add 20-message session limit with sessionStorage persistence"
```

---

### Task 5: SceneContact — timeout d'inactivité 7 minutes

**Files:**
- Modify: `components/scenes/SceneContact.tsx`

- [ ] **Step 1: Ajouter la ref du timer et la constante de durée**

Après les déclarations de `useRef` existantes (après `inputRef`), ajouter :
```typescript
const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
const INACTIVITY_MS = 7 * 60 * 1000 // 7 minutes
```

- [ ] **Step 2: Ajouter la fonction `resetInactivityTimer`**

Après les déclarations de state, ajouter ce `useCallback` :
```typescript
const resetInactivityTimer = useCallback(() => {
  if (timeoutRef.current) clearTimeout(timeoutRef.current)
  timeoutRef.current = setTimeout(() => {
    setPhase(prev => {
      if (prev !== 'chat') return prev // ne pas écraser done/limit
      return 'expired'
    })
    setMessages(prev => [...prev, {
      role:    'assistant',
      content: 'Votre session a expiré après 7 minutes d\'inactivité. Rechargez la page pour démarrer une nouvelle conversation.',
    }])
  }, INACTIVITY_MS)
}, [INACTIVITY_MS])
```

- [ ] **Step 3: Démarrer le timer au montage et le nettoyer au démontage**

Après le `useEffect` du smart scroll, ajouter :
```typescript
// ── Timer d'inactivité ────────────────────────────────────
useEffect(() => {
  resetInactivityTimer()
  return () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }
}, [resetInactivityTimer])
```

- [ ] **Step 4: Réinitialiser le timer à chaque envoi de message**

Dans `sendMessage`, juste avant `setLoading(true)`, ajouter :
```typescript
resetInactivityTimer()
```

Ajouter `resetInactivityTimer` dans les dépendances du `useCallback` de `sendMessage`.

- [ ] **Step 5: Vérifier TypeScript**

```bash
npx tsc --noEmit
```

Expected: aucune erreur

- [ ] **Step 6: Commit**

```bash
git add components/scenes/SceneContact.tsx
git commit -m "feat(chat): add 7-minute inactivity timeout"
```

---

### Task 6: SceneContact — UI des états `limit` et `expired`

**Files:**
- Modify: `components/scenes/SceneContact.tsx`

- [ ] **Step 1: Ajouter le rendu conditionnel après la liste de messages**

Localiser la fin du div des messages (juste avant la fermeture `</div>` qui suit le bloc `{phase === 'calculating'...}`) et ajouter après :

```tsx
{/* Bannière limite atteinte */}
{phase === 'limit' && (
  <div className="flex justify-start">
    <p className="text-[#F5F0E8]/60 text-sm font-light leading-relaxed max-w-xs md:max-w-sm">
      Vous avez atteint le nombre maximum d&apos;échanges pour cette session. Pour finaliser votre réservation, appelez-nous directement :{' '}
      <a
        href="tel:0783699229"
        className="text-[#C9A96E] hover:text-[#F5F0E8] transition-colors duration-300 underline underline-offset-2"
      >
        07 83 69 92 29
      </a>
    </p>
  </div>
)}
```

- [ ] **Step 2: Mettre à jour le placeholder de l'input pour couvrir tous les états désactivés**

Localiser :
```tsx
placeholder={phase === 'done' ? 'Demande envoyée ✓' : 'Votre réponse...'}
disabled={loading || phase !== 'chat'}
```

Remplacer par :
```tsx
placeholder={
  phase === 'done'    ? 'Demande envoyée ✓' :
  phase === 'limit'   ? 'Session limitée — appelez le 07 83 69 92 29' :
  phase === 'expired' ? 'Session expirée — rechargez la page' :
  'Votre réponse...'
}
disabled={loading || phase !== 'chat'}
```

- [ ] **Step 3: Vérifier le build complet**

```bash
npm run build
```

Expected: build réussi sans erreurs TypeScript ni erreurs de lint

- [ ] **Step 4: Test manuel complet**

```bash
npm run dev
```

Scénarios à vérifier dans le navigateur :

1. **Scroll** : envoyer 6+ messages, remonter manuellement → la vue ne saute plus ; scrollbar fine dorée visible
2. **Off-topic API** : envoyer "Quelle est la météo à Montpellier ?" → Élia répond qu'elle ne peut pas aider avec ça
3. **Off-topic prompt** : envoyer "Raconte-moi une blague" → même résultat
4. **Limite 20 messages** : ouvrir la console, faire `sessionStorage.setItem('elia_msg_count', '19')`, recharger, envoyer 1 message → la bannière avec le lien `tel:` apparaît, l'input affiche le message de limite
5. **Lien téléphone** : cliquer sur "07 83 69 92 29" → ouvre le composeur (mobile) ou l'app téléphone (desktop)
6. **Timeout** : ouvrir la console, dans `SceneContact` changer temporairement `INACTIVITY_MS` à `5000` (5 secondes), attendre → message d'expiration après 5 secondes, input désactivé

- [ ] **Step 5: Commit final**

```bash
git add components/scenes/SceneContact.tsx
git commit -m "feat(chat): add limit/expired UI states with tel link and disabled input messages"
```
