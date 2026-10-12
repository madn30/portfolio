import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'ghost'
type Size = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: ReactNode
}

const base =
  'inline-flex items-center gap-2 font-sans font-medium cursor-pointer select-none transition-[transform,background-color,color,box-shadow] duration-200 ease-out-soft active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none'

const variants: Record<Variant, string> = {
  primary:
    'sketch-border bg-ink text-cream hover:bg-graphite shadow-sketch hover:-translate-y-0.5 hover:shadow-[4px_6px_0_0_rgba(47,42,38,0.14)]',
  ghost: 'sketch-border bg-cream/80 text-ink hover:bg-cream hover:-translate-y-0.5',
}

const sizes: Record<Size, string> = {
  sm: 'px-3.5 py-2 text-sm',
  md: 'px-5 py-2.5 text-[15px]',
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      <span>{children}</span>
      {icon && <span aria-hidden="true">{icon}</span>}
    </button>
  )
}
