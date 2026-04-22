import * as React from 'react'

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

export function Button({
  variant = 'primary',
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      {...props}
      className={cn(
        'inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60',
        variant === 'primary' &&
          'bg-accent text-white shadow-sm hover:bg-accent/90',
        variant === 'secondary' &&
          'border border-border bg-surface text-text hover:bg-surface-2',
        variant === 'ghost' && 'text-text-muted hover:bg-surface-2 hover:text-text',
        variant === 'danger' &&
          'border border-accent-2/40 bg-accent-2-light text-accent-2 hover:bg-accent-2/10',
        className,
      )}
    />
  )
}

export function Input({
  label,
  hint,
  error,
  className,
  id,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  hint?: string
  error?: string | null
}) {
  const inputId = id ?? props.name
  return (
    <label htmlFor={inputId} className="block">
      {label && (
        <span className="mb-1 block text-sm font-medium text-text">{label}</span>
      )}
      <input
        {...props}
        id={inputId}
        className={cn(
          'w-full rounded-md border border-border bg-surface px-3 py-2 text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20',
          error && 'border-accent-2',
          className,
        )}
      />
      {hint && !error && (
        <span className="mt-1 block text-xs text-text-muted">{hint}</span>
      )}
      {error && (
        <span className="mt-1 block text-xs text-accent-2">{error}</span>
      )}
    </label>
  )
}

export function Textarea({
  label,
  hint,
  error,
  className,
  id,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  hint?: string
  error?: string | null
}) {
  const inputId = id ?? props.name
  return (
    <label htmlFor={inputId} className="block">
      {label && (
        <span className="mb-1 block text-sm font-medium text-text">{label}</span>
      )}
      <textarea
        {...props}
        id={inputId}
        className={cn(
          'w-full rounded-md border border-border bg-surface px-3 py-2 text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20',
          error && 'border-accent-2',
          className,
        )}
      />
      {hint && !error && (
        <span className="mt-1 block text-xs text-text-muted">{hint}</span>
      )}
      {error && (
        <span className="mt-1 block text-xs text-accent-2">{error}</span>
      )}
    </label>
  )
}

export function Select({
  label,
  hint,
  error,
  className,
  id,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  hint?: string
  error?: string | null
}) {
  const inputId = id ?? props.name
  return (
    <label htmlFor={inputId} className="block">
      {label && (
        <span className="mb-1 block text-sm font-medium text-text">{label}</span>
      )}
      <select
        {...props}
        id={inputId}
        className={cn(
          'w-full rounded-md border border-border bg-surface px-3 py-2 text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20',
          error && 'border-accent-2',
          className,
        )}
      >
        {children}
      </select>
      {hint && !error && (
        <span className="mt-1 block text-xs text-text-muted">{hint}</span>
      )}
      {error && (
        <span className="mt-1 block text-xs text-accent-2">{error}</span>
      )}
    </label>
  )
}

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        'rounded-xl border border-border bg-surface p-5',
        className,
      )}
    />
  )
}

export function ErrorBanner({ children }: { children: React.ReactNode }) {
  if (!children) return null
  return (
    <p
      role="alert"
      className="rounded-md border border-accent-2/30 bg-accent-2-light px-3 py-2 text-sm text-accent-2"
    >
      {children}
    </p>
  )
}

export function SuccessBanner({ children }: { children: React.ReactNode }) {
  if (!children) return null
  return (
    <p
      role="status"
      className="rounded-md border border-accent/30 bg-accent-light px-3 py-2 text-sm text-accent"
    >
      {children}
    </p>
  )
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode
  tone?: 'neutral' | 'accent' | 'warn' | 'danger'
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        tone === 'neutral' && 'bg-surface-2 text-text-muted',
        tone === 'accent' && 'bg-accent-light text-accent',
        tone === 'warn' && 'bg-warn/20 text-warn',
        tone === 'danger' && 'bg-accent-2-light text-accent-2',
      )}
    >
      {children}
    </span>
  )
}

export function SubmitButton({
  label,
  pending,
  variant = 'primary',
}: {
  label: string
  pending?: boolean
  variant?: ButtonVariant
}) {
  return (
    <Button type="submit" disabled={pending} variant={variant}>
      {pending ? 'Bezig…' : label}
    </Button>
  )
}
