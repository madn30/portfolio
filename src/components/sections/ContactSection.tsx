import { useId, useState, type FormEvent } from 'react'
import { Github, Linkedin, Mail, Send } from 'lucide-react'
import { siteConfig } from '@/data/siteConfig'
import { Button } from '@/components/ui/Button'
import { EnvelopeDoodle } from '@/components/ui/Doodles'
import { ExternalLink } from '@/components/ui/ExternalLink'
import { isSafeExternalUrl } from '@/utils/links'
import { SectionPanel } from './SectionPanel'

type Status = 'idle' | 'sending' | 'sent' | 'error'

interface FormValues {
  name: string
  email: string
  message: string
}

type Errors = Partial<Record<keyof FormValues, string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function validate(values: FormValues): Errors {
  const errors: Errors = {}
  if (values.name.trim().length < 2) errors.name = 'Please tell me your name.'
  if (!EMAIL_PATTERN.test(values.email.trim()))
    errors.email = 'That email address does not look right.'
  if (values.message.trim().length < 10)
    errors.message = 'A few more words would help (at least 10 characters).'
  return errors
}

const socialIcons = {
  github: <Github size={15} />,
  linkedin: <Linkedin size={15} />,
  other: null,
}

export function ContactSection() {
  const id = useId()
  const [values, setValues] = useState<FormValues>({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<Status>('idle')
  const endpoint = siteConfig.contact.formEndpoint.trim()
  const hasBackend = isSafeExternalUrl(endpoint)

  const update =
    (field: keyof FormValues) => (event: FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    if (!hasBackend) {
      // No backend configured: hand the message to the visitor's mail client.
      // This is a real action rather than a fake "sent" confirmation.
      const subject = encodeURIComponent(`Portfolio message from ${values.name.trim()}`)
      const body = encodeURIComponent(
        `${values.message.trim()}\n\n— ${values.name.trim()} (${values.email.trim()})`,
      )
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
    } catch (error) {
      if (import.meta.env.DEV) console.error('[contact] submission failed', error)
      setStatus('error')
    }
  }

  const fieldClass =
    'mt-1.5 w-full rounded-md border border-ink/40 bg-cream px-3.5 py-2.5 font-sans text-[15px] text-ink placeholder:text-pencil focus:border-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/60'

  return (
    <SectionPanel
      id="contact"
      eyebrow="say hello"
      title="Let's talk."
      intro={siteConfig.contact.closingMessage}
    >
      <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div className="space-y-8">
          <div data-reveal className="text-ink" aria-hidden="true">
            <EnvelopeDoodle className="w-40" />
          </div>
          <div data-reveal>
            <h3 className="font-hand text-2xl text-terracotta">Email</h3>
            <ExternalLink
              href={`mailto:${siteConfig.contact.email}`}
              icon={<Mail size={15} />}
              className="mt-1 text-lg"
            >
              {siteConfig.contact.email}
            </ExternalLink>
          </div>
          <div data-reveal>
            <h3 className="font-hand text-2xl text-terracotta">Elsewhere</h3>
            <ul className="mt-1 flex flex-col gap-2">
              {siteConfig.social
                .filter((link) => isSafeExternalUrl(link.url))
                .map((link) => (
                  <li key={link.id}>
                    <ExternalLink href={link.url} icon={socialIcons[link.id]} className="text-lg">
                      {link.label}
                    </ExternalLink>
                  </li>
                ))}
            </ul>
            <p className="mt-3 font-hand text-base text-pencil">
              (profile links are placeholders — set them in src/data/siteConfig.ts)
            </p>
          </div>
        </div>

        <form
          data-reveal
          onSubmit={onSubmit}
          noValidate
          className="sketch-border bg-cream/85 p-6 shadow-sketch sm:p-8"
          aria-describedby={`${id}-note`}
        >
          <h3 className="text-2xl text-ink">Leave a note</h3>
          <p id={`${id}-note`} className="mt-1 text-sm text-charcoal">
            {hasBackend
              ? 'Your message goes straight to my inbox.'
              : 'Submitting opens your email app with the message filled in. To send directly instead, set contact.formEndpoint in src/data/siteConfig.ts.'}
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor={`${id}-name`} className="font-sans text-sm font-medium text-ink">
                Name
              </label>
              <input
                id={`${id}-name`}
                name="name"
                type="text"
                autoComplete="name"
                value={values.name}
                onInput={update('name')}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? `${id}-name-error` : undefined}
                className={fieldClass}
              />
              {errors.name && (
                <p id={`${id}-name-error`} className="mt-1 text-sm text-terracotta" role="alert">
                  {errors.name}
                </p>
              )}
            </div>
            <div>
              <label htmlFor={`${id}-email`} className="font-sans text-sm font-medium text-ink">
                Email
              </label>
              <input
                id={`${id}-email`}
                name="email"
                type="email"
                autoComplete="email"
                value={values.email}
                onInput={update('email')}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? `${id}-email-error` : undefined}
                className={fieldClass}
              />
              {errors.email && (
                <p id={`${id}-email-error`} className="mt-1 text-sm text-terracotta" role="alert">
                  {errors.email}
                </p>
              )}
            </div>
            <div>
              <label htmlFor={`${id}-message`} className="font-sans text-sm font-medium text-ink">
                Message
              </label>
              <textarea
                id={`${id}-message`}
                name="message"
                rows={5}
                value={values.message}
                onInput={update('message')}
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? `${id}-message-error` : undefined}
                className={`${fieldClass} resize-y`}
              />
              {errors.message && (
                <p id={`${id}-message-error`} className="mt-1 text-sm text-terracotta" role="alert">
                  {errors.message}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Button type="submit" icon={<Send size={15} />} disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : hasBackend ? 'Send message' : 'Compose email'}
            </Button>
            <p className="text-sm text-charcoal" role="status" aria-live="polite">
              {status === 'sent' && 'Thanks — your message was delivered.'}
              {status === 'error' && 'Sending failed. Please email me directly instead.'}
            </p>
          </div>
        </form>
      </div>
    </SectionPanel>
  )
}
