import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { Link } from 'react-router-dom'
import { Icon, type IconName } from './Icon'

/* ------------------------------------------------------------------ button */

type Variant = 'primary' | 'gold' | 'navy' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm',
  gold: 'bg-gold-500 text-navy-900 hover:bg-gold-400 shadow-sm',
  navy: 'bg-navy-700 text-white hover:bg-navy-600 shadow-sm',
  outline: 'border border-line bg-white text-ink hover:border-brand-300 hover:bg-brand-50',
  ghost: 'text-body hover:bg-brand-50 hover:text-brand-700',
  danger: 'bg-white text-brand-700 border border-brand-200 hover:bg-brand-600 hover:text-white',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-5 text-[0.95rem] gap-2',
  lg: 'h-13 px-7 text-base gap-2.5',
}

const buttonBase =
  'inline-flex cursor-pointer items-center justify-center rounded-full font-semibold whitespace-nowrap transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-55'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: IconName
  iconRight?: IconName
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  className = '',
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${buttonBase} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && <Icon name={icon} className="h-[1.1em] w-[1.1em] shrink-0" />}
      {children}
      {iconRight && <Icon name={iconRight} className="h-[1.1em] w-[1.1em] shrink-0" />}
    </button>
  )
}

interface ButtonLinkProps {
  to: string
  variant?: Variant
  size?: Size
  icon?: IconName
  iconRight?: IconName
  className?: string
  children: ReactNode
}

export function ButtonLink({
  to,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  className = '',
  children,
}: ButtonLinkProps) {
  return (
    <Link
      to={to}
      className={`${buttonBase} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {icon && <Icon name={icon} className="h-[1.1em] w-[1.1em] shrink-0" />}
      {children}
      {iconRight && <Icon name={iconRight} className="h-[1.1em] w-[1.1em] shrink-0" />}
    </Link>
  )
}

/* ------------------------------------------------------------------- badge */

type BadgeTone = 'brand' | 'gold' | 'navy' | 'green' | 'neutral'

const tones: Record<BadgeTone, string> = {
  brand: 'bg-brand-50 text-brand-700 ring-brand-100',
  gold: 'bg-gold-300/25 text-gold-700 ring-gold-300/60',
  navy: 'bg-navy-50 text-navy-700 ring-navy-100',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  neutral: 'bg-line/50 text-muted ring-line',
}

export function Badge({
  tone = 'neutral',
  icon,
  children,
  className = '',
}: {
  tone?: BadgeTone
  icon?: IconName
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${tones[tone]} ${className}`}
    >
      {icon && <Icon name={icon} className="h-3.5 w-3.5" />}
      {children}
    </span>
  )
}

/** Green when serving, muted when not — with a text label, never colour alone. */
export function OpenBadge({ open, label }: { open: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        open
          ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
          : 'bg-neutral-100 text-neutral-600 ring-neutral-200'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${open ? 'bg-emerald-500' : 'bg-neutral-400'}`}
        aria-hidden="true"
      />
      {label}
    </span>
  )
}

/* ------------------------------------------------------------- form fields */

const controlBase =
  'w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[0.95rem] text-ink transition-colors duration-200 placeholder:text-muted/60 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:bg-neutral-50'

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className = '',
}: {
  label: string
  htmlFor?: string
  hint?: string
  error?: string
  required?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
        {required && (
          <span className="text-brand-600" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 flex items-center gap-1 text-sm text-brand-700">
          <Icon name="alert" className="h-4 w-4 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-sm text-muted">{hint}</p>
      ) : null}
    </div>
  )
}

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${controlBase} ${className}`} {...props} />
}

export function Textarea({
  className = '',
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${controlBase} min-h-28 resize-y ${className}`} {...props} />
}

export function Select({
  className = '',
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select className={`${controlBase} cursor-pointer appearance-none pr-10 ${className}`} {...props}>
        {children}
      </select>
      <Icon
        name="chevronDown"
        className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-muted"
      />
    </div>
  )
}

export function Checkbox({
  label,
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode }) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-2.5 text-[0.95rem] text-ink ${className}`}
    >
      <input
        type="checkbox"
        className="h-4.5 w-4.5 cursor-pointer accent-brand-600"
        {...props}
      />
      {label}
    </label>
  )
}

/** A pill that behaves like a checkbox — used for opening days and filters. */
export function TogglePill({
  checked,
  onChange,
  children,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  children: ReactNode
}) {
  return (
    <label
      className={`cursor-pointer rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 transition-colors duration-200 ${
        checked
          ? 'bg-brand-600 text-white ring-brand-600'
          : 'bg-white text-body ring-line hover:ring-brand-300'
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="sr-only"
      />
      {children}
    </label>
  )
}

/* ----------------------------------------------------------------- layout */

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="mb-2 text-xs font-bold tracking-[0.18em] text-brand-600 uppercase">
            {eyebrow}
          </p>
        )}
        <h2 className="text-2xl sm:text-3xl">{title}</h2>
        {description && <p className="mt-2 text-body">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function EmptyState({
  icon = 'search',
  title,
  description,
  action,
}: {
  icon?: IconName
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="rounded-card border border-dashed border-line bg-white/70 px-6 py-14 text-center">
      <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-500">
        <Icon name={icon} className="h-7 w-7" />
      </span>
      <h3 className="text-lg">{title}</h3>
      {description && <p className="mx-auto mt-2 max-w-md text-body">{description}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  )
}

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      role="status"
      aria-label="กำลังโหลด"
    />
  )
}
