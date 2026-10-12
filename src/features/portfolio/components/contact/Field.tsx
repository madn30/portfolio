import type { FormEventHandler } from 'react'
import type { ContactControl, ContactField } from './useContactForm'

const fieldClass =
  'mt-1.5 w-full rounded-md border border-ink/40 bg-cream px-3.5 py-2.5 font-sans text-[15px] text-ink placeholder:text-pencil focus:border-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/60'

type FieldControl =
  { kind: 'input'; type: 'text' | 'email'; autoComplete: 'name' | 'email' } | { kind: 'textarea' }

interface FieldProps {
  formId: string
  name: ContactField
  label: string
  control: FieldControl
  value: string
  error: string | undefined
  onInput: FormEventHandler<ContactControl>
  onFocus: () => void
  onBlur: () => void
}

export function Field({
  formId,
  name,
  label,
  control,
  value,
  error,
  onInput,
  onFocus,
  onBlur,
}: FieldProps) {
  const id = `${formId}-${name}`
  const shared = {
    id,
    name,
    value,
    onInput,
    onFocus,
    onBlur,
    'aria-invalid': Boolean(error),
    'aria-describedby': error ? `${id}-error` : undefined,
  }

  return (
    <div>
      <label htmlFor={id} className="font-sans text-sm font-medium text-ink">
        {label}
      </label>
      {control.kind === 'textarea' ? (
        <textarea {...shared} rows={5} className={`${fieldClass} resize-y`} />
      ) : (
        <input
          {...shared}
          type={control.type}
          autoComplete={control.autoComplete}
          className={fieldClass}
        />
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-terracotta" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
