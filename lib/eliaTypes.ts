import type { TripType } from '@/lib/pricing'

export interface ChatMessage {
  id?: string
  role: 'assistant' | 'user'
  content: string
  createdAt?: string
}

export interface CollectedState {
  type?: TripType
  departure?: string
  destination?: string
  date?: string
  time?: string
  passengers?: string
  hours?: number
  options?: string[]
  payment?: string
  name?: string
  phone?: string
  email?: string
}

export type CollectedField = keyof CollectedState

export interface AiResponseMetadata {
  visibleText: string
  collectedState: CollectedState
  quickReplies: string[]
  readyForConfirmation: boolean
}
