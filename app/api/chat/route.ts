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
