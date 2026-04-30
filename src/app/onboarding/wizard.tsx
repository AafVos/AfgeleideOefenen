'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'

import { ErrorBanner } from '@/components/ui'
import type { Grade, LearningMode } from '@/lib/supabase/types'

import { completeOnboardingAction, type OnboardingState } from './actions'

const GRADE_OPTIONS: { value: Grade; label: string; hint: string }[] = [
  { value: 'vwo_4', label: 'VWO 4', hint: 'Net begonnen met differentiëren' },
  { value: 'vwo_5', label: 'VWO 5', hint: 'Volle bak afgeleiden' },
  { value: 'vwo_6', label: 'VWO 6', hint: 'Examenjaar' },
  {
    value: 'examen_training',
    label: 'Examen Training',
    hint: 'Ik bereid me voor op het eindexamen',
  },
  { value: 'anders', label: 'Anders', hint: 'HBO, herhaling, of iets anders' },
]

const LEERPAD_MODE_OPTIONS: {
  value: Exclude<LearningMode, 'free'>
  label: string
  description: string
}[] = [
  {
    value: 'guided',
    label: 'Net begonnen — neem me bij de hand',
    description:
      'We starten bij de eerste regel en gaan stap voor stap door het leerpad.',
  },
  {
    value: 'topic_select',
    label: 'Ik weet welke onderwerpen ik wil oefenen',
    description:
      'Vink aan wat je al kent. Wij stellen een leerpad samen op jouw maat.',
  },
  {
    value: 'diagnostic',
    label: 'Geef me een korte toets',
    description:
      '5 vragen om je niveau in te schatten. Daarna start je leerpad op het juiste punt.',
  },
]

type StartPath = 'leerpad' | 'free'

const initialState: OnboardingState = { error: null }

export function OnboardingWizard({ defaultName }: { defaultName: string }) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [grade, setGrade] = useState<Grade | null>(null)
  const [name, setName] = useState(defaultName.trim())
  const [startPath, setStartPath] = useState<StartPath | null>(null)
  const [mode, setMode] = useState<Exclude<LearningMode, 'free'> | null>(null)

  const [state, formAction] = useActionState(
    completeOnboardingAction,
    initialState,
  )

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
    if (step === 3) {
      setStartPath(null)
    }
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
          <Step1Grade selected={grade} onSelect={setGrade} />
        )}
        {step === 2 && (
          <Step2Name name={name} onChange={setName} />
        )}
        {step === 3 && (
          <Step3ChoosePath
            selected={startPath}
            onSelect={(p) => {
              setStartPath(p)
              setMode(null)
            }}
          />
        )}
        {step === 4 && (
          <Step4LeerpadMode selected={mode} onSelect={setMode} />
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
          ← Terug
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
            Volgende →
          </button>
        ) : step === 3 ? (
          startPath === 'free' ? (
            <form action={formAction}>
              <input type="hidden" name="grade" value={grade ?? ''} />
              <input type="hidden" name="display_name" value={trimmedName} />
              <input type="hidden" name="learning_mode" value="free" />
              <SubmitWizard label="Naar vrij oefenen" />
            </form>
          ) : (
            <button
              type="button"
              onClick={goToLeerpadDetails}
              disabled={startPath !== 'leerpad'}
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-accent/90 disabled:opacity-40"
            >
              Volgende →
            </button>
          )
        ) : (
          <form action={formAction}>
            <input type="hidden" name="grade" value={grade ?? ''} />
            <input type="hidden" name="display_name" value={trimmedName} />
            <input type="hidden" name="learning_mode" value={mode ?? ''} />
            <SubmitWizard label="Laten we beginnen" disabled={!mode} />
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

function Step1Grade({
  selected,
  onSelect,
}: {
  selected: Grade | null
  onSelect: (g: Grade) => void
}) {
  return (
    <section>
      <p className="text-sm font-medium uppercase tracking-wider text-accent">
        Stap 1 van 4
      </p>
      <h1 className="mt-2 font-serif text-3xl text-text">
        Welke klas zit je in?
      </h1>
      <p className="mt-2 text-text-muted">
        Zo kunnen we de stof afstemmen op je leerjaar.
      </p>

      <div className="mt-8 grid gap-3">
        {GRADE_OPTIONS.map((opt) => {
          const active = selected === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
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
  )
}

function Step2Name({
  name,
  onChange,
}: {
  name: string
  onChange: (v: string) => void
}) {
  return (
    <section>
      <p className="text-sm font-medium uppercase tracking-wider text-accent">
        Stap 2 van 4
      </p>
      <h1 className="mt-2 font-serif text-3xl text-text">
        Hoe mogen we je noemen?
      </h1>
      <p className="mt-2 text-text-muted">
        Alleen je voornaam, om je persoonlijk aan te spreken. We vullen dit niet
        vanuit je e-mailadres — jouw keuze.
      </p>

      <div className="mt-8">
        <label
          htmlFor="display_name"
          className="text-sm font-medium text-text"
        >
          Voornaam
        </label>
        <input
          id="display_name"
          autoFocus
          value={name}
          onChange={(e) => onChange(e.target.value)}
          maxLength={50}
          className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-lg text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
          placeholder=""
          autoCapitalize="words"
        />
      </div>
    </section>
  )
}

function Step3ChoosePath({
  selected,
  onSelect,
}: {
  selected: StartPath | null
  onSelect: (p: StartPath) => void
}) {
  return (
    <section>
      <p className="text-sm font-medium uppercase tracking-wider text-accent">
        Stap 3 van 4
      </p>
      <h1 className="mt-2 font-serif text-3xl text-text">
        Leerpad of vrij oefenen?
      </h1>
      <p className="mt-3 text-text-muted">
        Er zijn twee manieren: het <strong className="font-medium text-text">leerpad</strong>{' '}
        voert je adaptief langs de onderwerpen (volgens de leerlijn) — handig als
        je structuur wilt. Bij{' '}
        <strong className="font-medium text-text">vrij oefenen</strong> kies jij
        elke sessie zelf een onderwerp, zonder vaste route — handig voor herhaling
        of als je maar één stuk wilt pakken. In het menu kun je later altijd
        wisselen.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onSelect('leerpad')}
          className={`rounded-xl border p-5 text-left transition sm:min-h-[220px] ${
            selected === 'leerpad'
              ? 'border-accent bg-accent/5 ring-2 ring-accent/30'
              : 'border-border bg-surface hover:bg-surface-2'
          }`}
        >
          <p className="text-xs font-medium uppercase tracking-wider text-accent">
            Gestructureerd
          </p>
          <h2 className="mt-2 font-serif text-xl text-text sm:text-2xl">
            Het leerpad
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-text-muted">
            Je volgt de rode draad (Getal &amp; Ruimte): machtsregel, somregel,
            productregel, quotiëntregel, kettingregel. Het pad past zich automatisch aan
            op je antwoorden: waar je fout gaat krijg je gerichte uitleg en
            opvolgvragen; wat je beheerst, komt minder vaak terug.
          </p>
        </button>
        <button
          type="button"
          onClick={() => onSelect('free')}
          className={`rounded-xl border p-5 text-left transition sm:min-h-[220px] ${
            selected === 'free'
              ? 'border-accent bg-accent/5 ring-2 ring-accent/30'
              : 'border-border bg-surface hover:bg-surface-2'
          }`}
        >
          <p className="text-xs font-medium uppercase tracking-wider text-accent">
            Los
          </p>
          <h2 className="mt-2 font-serif text-xl text-text sm:text-2xl">
            Vrij oefenen
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-text-muted">
            Jij kiest per keer welk onderwerp je opent — dezelfde soort vragen en
            feedback als in het leerpad, maar zonder vaste volgorde. Je komt daarna op
            de oefenpagina om los onderwerpen te pakken (het leerpad blijft in het menu
            bereikbaar).
          </p>
        </button>
      </div>
    </section>
  )
}

function Step4LeerpadMode({
  selected,
  onSelect,
}: {
  selected: Exclude<LearningMode, 'free'> | null
  onSelect: (m: Exclude<LearningMode, 'free'>) => void
}) {
  return (
    <section>
      <p className="text-sm font-medium uppercase tracking-wider text-accent">
        Stap 4 van 4
      </p>
      <h1 className="mt-2 font-serif text-3xl text-text">
        Je leerpad verder afstemmen
      </h1>
      <p className="mt-2 text-text-muted">
        Hoe wil je het pad starten? Je kunt later nog wisselen of naar vrij
        oefenen gaan.
      </p>

      <div className="mt-8 grid gap-3">
        {LEERPAD_MODE_OPTIONS.map((opt) => {
          const active = selected === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
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
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-accent/90 disabled:opacity-40"
    >
      {pending ? 'Bezig…' : label}
    </button>
  )
}
