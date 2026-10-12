import { useSyncExternalStore } from 'react'
import { openSection } from '@/app/navigation'
import type { PaperField } from './paperTexture'

export type MessageField = PaperField
type MessageStatus = 'idle' | 'sending' | 'sent' | 'error'

interface MessageValues {
  name: string
  email: string
  message: string
}

interface MessageState {
  values: MessageValues
  active: MessageField | null
  status: MessageStatus
  hasBackend: boolean
  raised: boolean
  sentTick: number
}

interface FormHandlers {
  focus: (field: MessageField) => void
  submit: () => void
}

const EMPTY: MessageValues = { name: '', email: '', message: '' }

let state: MessageState = {
  values: EMPTY,
  active: null,
  status: 'idle',
  hasBackend: false,
  raised: false,
  sentTick: 0,
}
let handlers: FormHandlers | null = null
const listeners = new Set<() => void>()

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function setMessage(partial: Partial<MessageState>): void {
  let changed = false
  for (const key in partial) {
    const k = key as keyof MessageState
    if (partial[k] !== state[k]) changed = true
  }
  if (!changed) return
  state = { ...state, ...partial }
  listeners.forEach((listener) => listener())
}

export function useMessage<T>(selector: (s: MessageState) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state))
}

export function registerMessageForm(next: FormHandlers): () => void {
  handlers = next
  return () => {
    if (handlers === next) handlers = null
    setMessage({ values: EMPTY, active: null, status: 'idle', raised: false })
  }
}

export function focusMessageField(field: MessageField): void {
  setMessage({ raised: true })
  if (handlers) handlers.focus(field)
  else openSection('contact')
}

export function submitMessage(): void {
  if (handlers) handlers.submit()
  else openSection('contact')
}

export function messageSent(): void {
  setMessage({ sentTick: state.sentTick + 1, raised: false })
}
