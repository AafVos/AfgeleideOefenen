'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { useTranslations } from 'next-intl'

import { ErrorBanner } from '@/components/ui'
import type { Grade, LearningMode } from '@/lib/supabase/types'

import { completeOnboardingAction, type OnboardingState } from './actions'

type StartPath = 'leerpad' | 'free'

const initialState: OnboardingState = { error: null }

export function OnboardingWizard({ defaultName }: { defaultName: string }) {
  const t = useTranslations('Onboarding')

  const GRADE_OPTIONS: { value: Grade; label: string; hint: string }[] = [
    { value: 'vwo_4', label: t('vwo4Label'), hint: t('vwo4Hint') },
    { value: 'vwo_5', label: t('vwo5Label'), hint: t('vwo5Hint') },
    { value: 'vwo_6', label: t('vwo6Label'), hint: t('vwo6Hint') },
    { value: 'examen_training', label: t('examLabel'), hint: t('examHint') },
    { value: 'anders', label: t('othersLabel'), hint: t('othersHint') },
  ]

  const LEERPAD_MODE_OPTIONS: {
    value: Exclude<LearningMode, 'free'>
    label: string
    description: string
  }[] = [
    {
      value: 'guided',
      label: t('guidedLabel'),
      description: t('guidedDesc'),
    },
    {
      value: 'topic_select',
      label: t('topicSelectLabel'),
      description: t('topicSelectDesc'),
    },
    {
      value: 'diagnostic',
      label: t('diagnosticLabel'),
      description: t('diagnosticDesc'),
    },
  ]

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [grade, setGrade] = useState<Grade | null>(null)
  const [name, setName] = useState(defaultName.trim())
  const [startPath, setStartPath] = useState<StartPath | null>(null)
  const [mode, setMode] = useState<Exclude<LearningMode, 'free'> | null>(null)

  const [state, formAction] = useActionState(completeOnboardingAction, initialState)

  const trimmedName = name.trim()

  function next() {
    if (step === 1 && !grade) return
    if (step === 2 && trimmedName.length === 0) return
    setStep((s) => (s < 4 ? ((s + 1) as 1 | 2 | 3 | 4) : s))
  }

  function back() {
    if (step === 4) {
      setStep(3)
      setMode(null)
      return
    }
    if (step === 3) setStartPath(null)
    setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3 | 4) : s))
  }

  function goToLeerpadDetails() {
    if (startPath !== 'leerpad') return
    setStep(4)
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-2xl flex-col px-4 py-12">
      <ProgressIndicator step={step} />

      <div className="mt-10 flex-1">
        {step === 1 && (
          <section>
            <p className="text-sm font-medium uppercase tracking-wider text-accent">
              {t('step1Eyebrow')}
            </p>
            <h1 className="mt-2 font-serif text-3xl text-text">{t('step1H1')}</h1>
            <p className="mt-2 text-text-muted">{t('step1Intro')}</p>
            <div className="mt-8 grid gap-3">
              {GRADE_OPTIONS.map((opt) => {
                const active = grade === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setGrade(opt.value)}
                    className={`rounded-xl border p-4 text-left transition ${
                      active
                        ? 'border-accent bg-accent/5 ring-2 ring-accent/30'
                        : 'border-border bg-surface hover:bg-surface-2'
                    }`}
                  >
                    <p className="font-medium text-text">{opt.label}</p>
                    <p className="mt-1 text-sm text-text-muted">{opt.hint}</p>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {step === 2 && (
          <section>
            <p className="text-sm font-medium uppercase tracking-wider text-accent">
              {t('step2Eyebrow')}
            </p>
            <h1 className="mt-2 font-serif text-3xl text-text">{t('step2H1')}</h1>
            <p className="mt-2 text-text-muted">{t('step2Intro')}</p>
            <div className="mt-8">
              <label htmlFor="display_name" className="text-sm font-medium text-text">
                {t('step2NameLabel')}
              </label>
              <input
                id="display_name"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
                className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-lg text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
                autoCapitalize="words"
              />
            </div>
          </section>
        )}

        {step === 3 && (
          <section>
            <p className="text-sm font-medium uppercase tracking-wider text-accent">
              {t('step3Eyebrow')}
            </p>
            <h1 className="mt-2 font-serif text-3xl text-text">{t('step3H1')}</h1>
            <p className="mt-3 text-text-muted">
              {t.rich('step3Intro', {
                leerpad: (chunks) => (
                  <strong className="font-medium text-text">{chunks}</strong>
                ),
                vrijOefenen: (chunks) => (
                  <strong className="font-medium text-text">{chunks}</strong>
                ),
              })}
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => { setStartPath('leerpad'); setMode(null) }}
                className={`rounded-xl border p-5 text-left transition sm:min-h-[220px] ${
                  startPath === 'leerpad'
                    ? 'border-accent bg-accent/5 ring-2 ring-accent/30'
                    : 'border-border bg-surface hover:bg-surface-2'
                }`}
              >
                <p className="text-xs font-medium uppercase tracking-wider text-accent">
                  {t('card1Eyebrow')}
                </p>
                <h2 className="mt-2 font-serif text-xl text-text sm:text-2xl">
                  {t('card1Title')}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-text-muted">
                  {t('card1Body')}
                </p>
              </button>
              <button
                type="button"
                onClick={() => { setStartPath('free'); setMode(null) }}
                className={`rounded-xl border p-5 text-left transition sm:min-h-[220px] ${
                  startPath === 'free'
                    ? 'border-accent bg-accent/5 ring-2 ring-accent/30'
                    : 'border-border bg-surface hover:bg-surface-2'
                }`}
              >
                <p className="text-xs font-medium uppercase tracking-wider text-accent">
                  {t('card2Eyebrow')}
                </p>
                <h2 className="mt-2 font-serif text-xl text-text sm:text-2xl">
                  {t('card2Title')}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-text-muted">
                  {t('card2Body')}
                </p>
              </button>
            </div>
          </section>
        )}

        {step === 4 && (
          <section>
            <p className="text-sm font-medium uppercase tracking-wider text-accent">
              {t('step4Eyebrow')}
            </p>
            <h1 className="mt-2 font-serif text-3xl text-text">{t('step4H1')}</h1>
            <p className="mt-2 text-text-muted">{t('step4Intro')}</p>
            <div className="mt-8 grid gap-3">
              {LEERPAD_MODE_OPTIONS.map((opt) => {
                const active = mode === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setMode(opt.value)}
                    className={`rounded-xl border p-4 text-left transition ${
                      active
                        ? 'border-accent bg-accent/5 ring-2 ring-accent/30'
                        : 'border-border bg-surface hover:bg-surface-2'
                    }`}
                  >
                    <p className="font-medium text-text">{opt.label}</p>
                    <p className="mt-1 text-sm text-text-muted">{opt.description}</p>
                  </button>
                )
              })}
            </div>
          </section>
        )}
      </div>

      {state.error && (
        <div className="mt-6">
          <ErrorBanner>{state.error}</ErrorBanner>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={back}
          disabled={step === 1}
          className="rounded-md px-4 py-2 text-sm text-text-muted hover:bg-surface-2 disabled:invisible"
        >
          {t('back')}
        </button>

        {step <= 2 ? (
          <button
            type="button"
            onClick={next}
            disabled={
              (step === 1 && !grade) ||
              (step === 2 && trimmedName.length === 0)
            }
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-accent/90 disabled:opacity-40"
          >
            {t('next')}
          </button>
        ) : step === 3 ? (
          startPath === 'free' ? (
            <form action={formAction}>
              <input type="hidden" name="grade" value={grade ?? ''} />
              <input type="hidden" name="display_name" value={trimmedName} />
              <input type="hidden" name="learning_mode" value="free" />
              <SubmitWizard label={t('goFree')} />
            </form>
          ) : (
            <button
              type="button"
              onClick={goToLeerpadDetails}
              disabled={startPath !== 'leerpad'}
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-accent/90 disabled:opacity-40"
            >
              {t('next')}
            </button>
          )
        ) : (
          <form action={formAction}>
            <input type="hidden" name="grade" value={grade ?? ''} />
            <input type="hidden" name="display_name" value={trimmedName} />
            <input type="hidden" name="learning_mode" value={mode ?? ''} />
            <SubmitWizard label={t('start')} disabled={!mode} />
          </form>
        )}
      </div>
    </div>
  )
}

function ProgressIndicator({ step }: { step: 1 | 2 | 3 | 4 }) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4].map((s) => (
        <div
          key={s}
          className={`h-1 flex-1 rounded-full transition-colors ${
            s <= step ? 'bg-accent' : 'bg-border'
          }`}
        />
      ))}
    </div>
  )
}

function SubmitWizard({
  disabled = false,
  label,
}: {
  disabled?: boolean
  label: string
}) {
  const { pending } = useFormStatus()
  const t = useTranslations('Onboarding')
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-accent/90 disabled:opacity-40"
    >
      {pending ? t('pending') : label}
    </button>
  )
}
