import { Send } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { Field } from './Field'
import type { ContactFormState } from './useContactForm'

export function ContactForm({ contact }: { contact: ContactFormState }) {
  const { id, form, values, errors, status, hasBackend, update, focusField, onSubmit } = contact

  return (
    <form
      id="contact-form"
      ref={form}
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
        <Field
          formId={id}
          name="name"
          label="Name"
          control={{ kind: 'input', type: 'text', autoComplete: 'name' }}
          value={values.name}
          error={errors.name}
          onInput={update('name')}
          onFocus={focusField('name')}
          onBlur={focusField(null)}
        />
        <Field
          formId={id}
          name="email"
          label="Email"
          control={{ kind: 'input', type: 'email', autoComplete: 'email' }}
          value={values.email}
          error={errors.email}
          onInput={update('email')}
          onFocus={focusField('email')}
          onBlur={focusField(null)}
        />
        <Field
          formId={id}
          name="message"
          label="Message"
          control={{ kind: 'textarea' }}
          value={values.message}
          error={errors.message}
          onInput={update('message')}
          onFocus={focusField('message')}
          onBlur={focusField(null)}
        />
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
  )
}
