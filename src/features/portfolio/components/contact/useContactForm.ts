import { useEffect, useId, useRef, useState, type FormEvent, type RefObject } from 'react'
import {
  messageSent,
  registerMessageForm,
  setMessage,
  type MessageField,
} from '@/features/world/rooms/contact/messageStore'
import { siteConfig } from '@/data/siteConfig'
import { prefersReducedMotion } from '@/shared/hooks/useReducedMotion'
import { unlock } from '@/features/achievements'
import { isSafeExternalUrl } from '@/shared/utils/links'

export type ContactStatus = 'idle' | 'sending' | 'sent' | 'error'

export interface ContactValues {
  name: string
  email: string
  message: string
}

export type ContactField = keyof ContactValues

export type ContactErrors = Partial<Record<ContactField, string>>

export type ContactControl = HTMLInputElement | HTMLTextAreaElement

export interface ContactFormState {
  id: string
  form: RefObject<HTMLFormElement | null>
  values: ContactValues
  errors: ContactErrors
  status: ContactStatus
  hasBackend: boolean
  update: (field: ContactField) => (event: FormEvent<ContactControl>) => void
  focusField: (field: MessageField | null) => () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function validate(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {}
  if (values.name.trim().length < 2) errors.name = 'Please tell me your name.'
  if (!EMAIL_PATTERN.test(values.email.trim()))
    errors.email = 'That email address does not look right.'
  if (values.message.trim().length < 10)
    errors.message = 'A few more words would help (at least 10 characters).'
  return errors
}

export function useContactForm(): ContactFormState {
  const id = useId()
  const form = useRef<HTMLFormElement>(null)
  const [values, setValues] = useState<ContactValues>({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState<ContactErrors>({})
  const [status, setStatus] = useState<ContactStatus>('idle')
  const endpoint = siteConfig.contact.formEndpoint.trim()
  const hasBackend = isSafeExternalUrl(endpoint)

  useEffect(
    () =>
      registerMessageForm({
        focus: (field) => {
          const input = document.getElementById(`${id}-${field}`)
          input?.scrollIntoView({
            behavior: prefersReducedMotion() ? 'auto' : 'smooth',
            block: 'center',
          })
          input?.focus({ preventScroll: true })
        },
        submit: () => form.current?.requestSubmit(),
      }),
    [id],
  )
  useEffect(() => setMessage({ values }), [values])
  useEffect(() => setMessage({ status, hasBackend }), [status, hasBackend])
  useEffect(() => setMessage({ error: Object.values(errors).find(Boolean) ?? null }), [errors])

  const focusField = (field: MessageField | null) => () => setMessage({ active: field })

  const update = (field: ContactField) => (event: FormEvent<ContactControl>) => {
    const value = event.currentTarget.value
    setValues((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      const first = Object.keys(nextErrors)[0]
      document.getElementById(`${id}-${first}`)?.focus()
      return
    }

    unlock('sociable')
    if (!hasBackend) {
      const subject = encodeURIComponent(`Portfolio message from ${values.name.trim()}`)
      const body = encodeURIComponent(
        `${values.message.trim()}\n\n— ${values.name.trim()} (${values.email.trim()})`,
      )
      messageSent()
      window.location.href = `mailto:${siteConfig.contact.email}?subject=${subject}&body=${body}`
      return
    }

    setStatus('sending')
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          message: values.message.trim(),
        }),
      })
      if (!response.ok) throw new Error(`Form endpoint responded with ${response.status}`)
      setStatus('sent')
      setValues({ name: '', email: '', message: '' })
      messageSent()
    } catch {
      setStatus('error')
    }
  }

  return { id, form, values, errors, status, hasBackend, update, focusField, onSubmit }
}
