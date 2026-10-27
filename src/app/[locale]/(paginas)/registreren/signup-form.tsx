'use client'

import { useActionState, useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { useFormStatus } from 'react-dom'
import { useTranslations } from 'next-intl'

import { GoogleKnop } from '@/components/google-knop'
import { ErrorBanner } from '@/components/ui'
import { Link } from '@/i18n/navigation'
import { hrefMetOefenpad } from '@/lib/auth/oefenpad'
import type { Herkomst } from '@/lib/herkomst'
import { haalOnthoudenHerkomst } from '@/lib/herkomst-sessie'
import { meldMeting } from '@/lib/meten/melden'

import { signupAction, type SignupState } from './actions'
import { resendConfirmationAction } from '../inloggen/actions'

const initialState: SignupState = { errorKey: null, noticeKey: null }

const COOLDOWN_SECONDS = 60

export function SignupForm({
  herkomst = null,
  oefenpad = null,
  googleAan = false,
}: {
  herkomst?: Herkomst | null
  oefenpad?: string | null
  googleAan?: boolean
}) {
  const [state, formAction] = useActionState(signupAction, initialState)
  const t = useTranslations('Register')
  // Stond `?van=` niet op déze pagina, dan valt deze terug op wat een
  // eerdere pagina van dit bezoek heeft opgeslagen (`?van=` of `utm_source`).
  // Eén keer lezen, bij hydratatie (lazy initializer): een latere her-render
  // die deze waarde nog zou veranderen is hier niet nodig.
  const [herkomstWaarde] = useState<Herkomst | null>(() => herkomst ?? haalOnthoudenHerkomst())
  const [showPassword, setShowPassword] = useState(false)
  const [resendPending, startResend] = useTransition()
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [cooldown, setCooldown] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startCooldown = useCallback(() => {
    setCooldown(COOLDOWN_SECONDS)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // De aanmelding is gelukt zodra het formulier plaatsmaakt voor "kijk in je
  // mail". Dat kan de klikmeting zelf niet zien, dus melden we het hier.
  const gemeld = useRef(false)
  useEffect(() => {
    if (!state.noticeKey || gemeld.current) return
    gemeld.current = true
    meldMeting('registratie', herkomstWaarde ? `registratie-via-${herkomstWaarde}` : undefined)
  }, [state.noticeKey, herkomstWaarde])

  function handleResend() {
    if (!state.email) return
    startResend(async () => {
      const { ok } = await resendConfirmationAction(state.email!, oefenpad ?? undefined)
      setResendStatus(ok ? 'success' : 'error')
      startCooldown()
    })
  }

  if (state.noticeKey) {
    return (
      <div className="space-y-4">
        <p
          role="status"
          className="rounded-md border border-accent/30 bg-accent-light px-3 py-2 text-sm text-accent"
        >
          {t(state.noticeKey)}
        </p>

        <div className="space-y-1 rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text-muted">
          {resendStatus === 'success' ? (
            <p role="status">{t('resendSuccess')}</p>
          ) : resendStatus === 'error' ? (
            <p role="alert" className="text-accent-2">
              {t('resendError')}
            </p>
          ) : null}
          {cooldown > 0 ? (
            <button
              type="button"
              disabled
              className="font-medium text-text-muted opacity-60"
            >
              {t('resendCooldown', { seconds: cooldown })}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resendPending}
              className="font-medium text-accent hover:underline disabled:opacity-60"
            >
              {resendPending ? t('resendPending') : t('resendButton')}
            </button>
          )}
        </div>

        {googleAan ? (
          <div className="space-y-2">
            <p className="text-sm text-text-muted">{t('googlePrompt')}</p>
            <GoogleKnop
              oefenpad={oefenpad}
              herkomst={herkomstWaarde}
              dataMeet="google-aanmelden-na-mail"
            />
          </div>
        ) : null}

        <Link
          href={hrefMetOefenpad('/inloggen', oefenpad)}
          data-meet="registreren-na-mail-inloggen"
          className="block w-full rounded-md bg-accent px-4 py-2.5 text-center font-medium text-white shadow-sm transition hover:bg-accent/90"
        >
          {t('toLoginLabel')}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {googleAan ? <GoogleKnop oefenpad={oefenpad} herkomst={herkomstWaarde} /> : null}
      <form action={formAction} className="space-y-4" noValidate>
      {herkomstWaarde ? <input type="hidden" name="van" defaultValue={herkomstWaarde} /> : null}
      {oefenpad ? <input type="hidden" name="naar" defaultValue={oefenpad} /> : null}
      <Field
        label={t('usernameLabel')}
        name="username"
        type="text"
        autoComplete="username"
        defaultValue={state.values?.username}
      />
      <Field
        label={t('emailLabel')}
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state.values?.email}
      />
      <PasswordField
        label={t('passwordLabel')}
        name="password"
        autoComplete="new-password"
        required
        hint={t('passwordHint')}
        showPassword={showPassword}
        onToggle={() => setShowPassword((prev) => !prev)}
        toggleLabel={showPassword ? t('hidePassword') : t('showPassword')}
      />
      <PasswordField
        label={t('passwordConfirmLabel')}
        name="passwordConfirm"
        autoComplete="new-password"
        required
        showPassword={showPassword}
        onToggle={() => setShowPassword((prev) => !prev)}
        toggleLabel={showPassword ? t('hidePassword') : t('showPassword')}
      />

      {state.errorKey && <ErrorBanner>{t(state.errorKey)}</ErrorBanner>}

      <SubmitButton />

      <p className="pt-1 text-center text-sm text-text-muted">
        {t('hasAccount')}{' '}
        <Link
          href={hrefMetOefenpad('/inloggen', oefenpad)}
          data-meet="registreren-naar-inloggen"
          className="font-medium text-accent hover:underline"
        >
          {t('loginLink')}
        </Link>
      </p>
      </form>
    </div>
  )
}

function Field({
  label,
  name,
  type,
  autoComplete,
  required,
  hint,
  defaultValue,
}: {
  label: string
  name: string
  type: string
  autoComplete?: string
  required?: boolean
  hint?: string
  defaultValue?: string
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-text">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        defaultValue={defaultValue}
        minLength={type === 'password' ? 8 : undefined}
        className="w-full rounded-md border border-border bg-surface px-3 py-2 text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
      {hint && <span className="mt-1 block text-xs text-text-muted">{hint}</span>}
    </label>
  )
}

function PasswordField({
  label,
  name,
  autoComplete,
  required,
  hint,
  showPassword,
  onToggle,
  toggleLabel,
}: {
  label: string
  name: string
  autoComplete?: string
  required?: boolean
  hint?: string
  showPassword: boolean
  onToggle: () => void
  toggleLabel: string
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-text">{label}</span>
      <div className="flex items-center gap-2">
        <input
          name={name}
          type={showPassword ? 'text' : 'password'}
          autoComplete={autoComplete}
          required={required}
          minLength={8}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex min-h-11 shrink-0 items-center rounded-md border border-border px-3 text-xs font-medium text-text-muted hover:bg-surface-2 hover:text-text"
        >
          {toggleLabel}
        </button>
      </div>
      {hint && <span className="mt-1 block text-xs text-text-muted">{hint}</span>}
    </label>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  const t = useTranslations('Register')
  return (
    <button
      type="submit"
      disabled={pending}
      data-meet="registreren-versturen"
      className="w-full rounded-md bg-accent px-4 py-2.5 font-medium text-white shadow-sm transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? t('submitPending') : t('submitLabel')}
    </button>
  )
}