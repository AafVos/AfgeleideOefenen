'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'

import { Math as TeX, RichMath } from '@/components/math'
import { Badge, Button, cn, ErrorBanner } from '@/components/ui'
import {
  resolveWithStepsAction,
  submitAnswerAction,
  type SubmitResult,
} from '@/lib/practice/actions'
import { insertAtCursor, toLatexPreview } from '@/lib/practice/input'

import { FlagQuestionButton } from './flag-question'
import { MathKeyboard } from './math-keyboard'

type Step = { id: string; step_order: number; step_description: string }

type Question = {
  id: string
  body: string
  latex_body: string | null
  difficulty: number
}

type State =
  | { phase: 'input'; error: string | null }
  | { phase: 'correct'; streak: number; mastered: boolean }
  | {
      phase: 'wrong'
      answerId: string
      correctAnswer: string
      latexCorrectAnswer: string | null
      errorExplanation: string | null
      studentAnswer: string
      extraSteps: Array<{ id: string; step_order: number; step_description: string }>
      resolved: boolean
    }

export function PracticeCard({
  question,
  steps,
  streakAtStart,
  nextHref,
  questionNumber,
}: {
  question: Question
  steps: Step[]
  streakAtStart: number
  nextHref?: string | undefined
  questionNumber?: number
}) {
  const router = useRouter()
  const t = useTranslations('PracticeCard')
  const [pending, startTransition] = useTransition()
  const [submitting, setSubmitting] = useState(false)
  const [answer, setAnswer] = useState('')
  const [state, setState] = useState<State>({ phase: 'input', error: null })
  const startedAtRef = useRef<number>(0)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    startedAtRef.current = Date.now()
  }, [question.id])

  function next() {
    setSubmitting(false)
    setAnswer('')
    setState({ phase: 'input', error: null })
    startedAtRef.current = Date.now()
    startTransition(() => {
      if (nextHref != null && nextHref.length > 0) {
        router.push(nextHref)
        return
      }
      router.refresh()
    })
  }

  function retry() {
    setAnswer('')
    setState({ phase: 'input', error: null })
    startedAtRef.current = Date.now()
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  function handleKey(text: string) {
    const el = inputRef.current
    const start = el?.selectionStart ?? answer.length
    const end = el?.selectionEnd ?? answer.length
    const { value, caret } = insertAtCursor(answer, start, end, text)
    setAnswer(value)
    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.focus()
        inputRef.current.setSelectionRange(caret, caret)
      }
    })
  }

  function handleBackspace() {
    const el = inputRef.current
    const start = el?.selectionStart ?? answer.length
    const end = el?.selectionEnd ?? answer.length
    if (start === end && start === 0) return
    const nextStart = start === end ? start - 1 : start
    const value = answer.slice(0, nextStart) + answer.slice(end)
    setAnswer(value)
    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.focus()
        inputRef.current.setSelectionRange(nextStart, nextStart)
      }
    })
  }

  function handleClear() {
    setAnswer('')
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!answer.trim() || state.phase !== 'input') return
    const startedAt = startedAtRef.current || Date.now()
    const timeSpent = Math.max(1, Math.round((Date.now() - startedAt) / 1000))

    setSubmitting(true)
    startTransition(async () => {
      const result: SubmitResult = await submitAnswerAction(question.id, answer, timeSpent)
      if (result.kind === 'error') {
        setState({ phase: 'input', error: result.message })
        return
      }
      if (result.kind === 'correct') {
        setState({ phase: 'correct', streak: result.streak, mastered: result.mastered })
        return
      }
      setState({
        phase: 'wrong',
        answerId: result.answerId,
        correctAnswer: result.correctAnswer,
        latexCorrectAnswer: result.latexCorrectAnswer,
        errorExplanation: result.errorExplanation,
        studentAnswer: answer,
        extraSteps: result.generatedSteps.map((s, i) => ({ id: `generated-${i}`, ...s })),
        resolved: false,
      })
    })
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {questionNumber != null && (
            <span className="text-xs font-medium text-text-muted">#{questionNumber}</span>
          )}
          <Badge
            tone={
              question.difficulty === 1 ? 'accent' : question.difficulty === 2 ? 'warn' : 'danger'
            }
          >
            {t('difficulty', { n: question.difficulty })}
          </Badge>
        </div>
        <FlagQuestionButton questionId={question.id} />
      </div>

      <div className="mb-6">
        <div className="font-serif text-2xl leading-snug text-text">
          {question.latex_body?.includes('$') ? (
            <RichMath source={question.latex_body} />
          ) : (
            <TeX tex={question.latex_body ?? ''} displayMode />
          )}
        </div>
      </div>

      {state.phase === 'input' && (
        <div className="space-y-3">
          {pending && submitting ? (
            <div
              role="status"
              aria-live="polite"
              aria-busy="true"
              className="rounded-xl border border-border bg-surface-2 px-5 py-8 text-center"
            >
              <p className="text-sm font-medium text-text">
                {t('checking')}
                <span className="practice-check-dots ml-1 inline-flex items-end gap-0.5 pb-0.5 align-middle" aria-hidden>
                  <span className="inline-block h-1 w-1 rounded-full bg-text-muted" />
                  <span className="inline-block h-1 w-1 rounded-full bg-text-muted" />
                  <span className="inline-block h-1 w-1 rounded-full bg-text-muted" />
                </span>
              </p>
              {answer.trim() ? (
                <div className="mt-4 rounded-lg border border-border/60 bg-surface/90 px-3 py-2">
                  <p className="text-xs uppercase tracking-wide text-text-muted">{t('yourAnswer')}</p>
                  <div className="mt-1 font-serif text-lg text-text">
                    <TeX tex={toLatexPreview(answer)} />
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <label className="block">
                <div className="mb-2 flex min-h-8 items-center gap-2">
                  <span className="text-xs uppercase tracking-wide text-text-muted">{t('preview')}</span>
                  {answer.trim() ? (
                    <span className="font-serif text-lg text-text">
                      <TeX tex={toLatexPreview(answer)} />
                    </span>
                  ) : (
                    <span className="text-text-muted">—</span>
                  )}
                </div>
                <input
                  ref={inputRef}
                  autoFocus
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder={t('placeholder')}
                  className="w-full rounded-lg border border-border bg-surface px-4 py-3 font-mono text-lg text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                  disabled={pending && submitting}
                  inputMode="text"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
                <MathKeyboard
                  onInsert={handleKey}
                  onBackspace={handleBackspace}
                  onClear={handleClear}
                  disabled={pending}
                />
              </label>

              <ErrorBanner>{state.error}</ErrorBanner>

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={(pending && submitting) || !answer.trim()}>
                  {t('submit')}
                </Button>
                {streakAtStart > 0 && (
                  <span className="text-xs text-text-muted">
                    {t('streakCurrent', { n: streakAtStart })}
                  </span>
                )}
              </div>
            </form>
          )}
        </div>
      )}

      {state.phase === 'correct' && (
        <CorrectFeedback
          streak={state.streak}
          mastered={state.mastered}
          onNext={next}
          onRetry={retry}
          pending={pending}
        />
      )}

      {state.phase === 'wrong' && (
        <WrongFeedback
          answerId={state.answerId}
          correctAnswer={state.correctAnswer}
          latexCorrectAnswer={state.latexCorrectAnswer}
          errorExplanation={state.errorExplanation}
          studentAnswer={state.studentAnswer}
          steps={steps.length > 0 ? steps : state.extraSteps}
          resolved={state.resolved}
          onResolved={() => setState({ ...state, resolved: true })}
          onNext={next}
          onRetry={retry}
          pending={pending}
        />
      )}
    </div>
  )
}

function CorrectFeedback({
  streak,
  mastered,
  onNext,
  onRetry,
  pending,
}: {
  streak: number
  mastered: boolean
  onNext: () => void
  onRetry: () => void
  pending: boolean
}) {
  const t = useTranslations('PracticeCard')
  return (
    <div className="rounded-xl border border-accent/30 bg-accent-light p-4">
      <p className="font-serif text-xl text-accent">
        {mastered ? t('correctMastered') : t('correct')}
      </p>
      <p className="mt-1 text-sm text-accent">
        {mastered
          ? t('masteredBody')
          : t('streakBody', { streak, remaining: 3 - streak })}
      </p>
      <div className="mt-4 flex items-center gap-2">
        <Button onClick={onNext} disabled={pending}>
          {pending ? t('navigating') : mastered ? t('nextCluster') : t('nextQuestion')}
        </Button>
      </div>
    </div>
  )
}

function WrongFeedback({
  answerId,
  correctAnswer,
  latexCorrectAnswer,
  errorExplanation,
  studentAnswer,
  steps,
  resolved,
  onResolved,
  onNext,
  onRetry,
  pending,
}: {
  answerId: string
  correctAnswer: string
  latexCorrectAnswer: string | null
  errorExplanation: string | null
  studentAnswer: string
  steps: Step[]
  resolved: boolean
  onResolved: () => void
  onNext: () => void
  onRetry: () => void
  pending: boolean
}) {
  const t = useTranslations('PracticeCard')
  const [wrongSteps, setWrongSteps] = useState<Set<string>>(new Set())
  const [, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const orderedSteps = [...steps].sort((a, b) => a.step_order - b.step_order)

  function toggleStep(id: string) {
    const next = new Set(wrongSteps)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setWrongSteps(next)
  }

  function doResolveWithSteps() {
    setError(null)
    startTransition(async () => {
      try {
        await resolveWithStepsAction(answerId, [...wrongSteps])
        onResolved()
      } catch (e) {
        setError(e instanceof Error ? e.message : t('genericError'))
      }
    })
  }

  function handleNext() {
    setError(null)
    startTransition(async () => {
      try {
        if (!resolved) await resolveWithStepsAction(answerId, [...wrongSteps])
        onNext()
      } catch (e) {
        setError(e instanceof Error ? e.message : t('genericError'))
      }
    })
  }

  return (
    <div className="rounded-xl border border-accent-2/40 bg-accent-2-light p-4">
      <p className="font-serif text-xl text-accent-2">{t('wrongTitle')}</p>
      <div className="mt-2 flex flex-col gap-1 text-sm text-accent-2">
        <span>
          {t('studentAnswer')}:{' '}
          <span className="font-serif"><TeX tex={toLatexPreview(studentAnswer)} /></span>
        </span>
        <span>
          {t('correctAnswer')}:{' '}
          {latexCorrectAnswer ? (
            latexCorrectAnswer.includes('$') ? (
              <span className="font-serif"><RichMath source={latexCorrectAnswer} /></span>
            ) : (
              <span className="font-serif"><TeX tex={latexCorrectAnswer} /></span>
            )
          ) : correctAnswer.includes('$') ? (
            <span className="font-serif"><RichMath source={correctAnswer} /></span>
          ) : (
            <code className="rounded bg-white/60 px-1.5 py-0.5 font-mono">{correctAnswer}</code>
          )}
        </span>
      </div>


      {steps.length > 0 ? (
        <div className="mt-4 rounded-lg border border-border bg-white/90 shadow-sm">
          <div className="px-4 py-3">
            <p className="text-sm font-semibold text-text">{t('stepsTitle')}</p>
            <p className="mt-0.5 text-xs text-text-muted">{t('stepsHint')}</p>
          </div>
          <ol className="list-none space-y-1 border-t border-border px-3 py-3 text-sm text-text">
            {orderedSteps.map((s) => (
              <li key={s.id}>
                <label className={`flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2 leading-relaxed transition ${resolved ? 'cursor-default' : 'hover:border-accent-2/40'} ${wrongSteps.has(s.id) ? 'border-accent-2/40 bg-accent-2-light/60' : 'border-transparent bg-white/40'}`}>
                  <input
                    type="checkbox"
                    checked={wrongSteps.has(s.id)}
                    onChange={() => !resolved && toggleStep(s.id)}
                    disabled={resolved}
                    className="mt-0.5 size-4 shrink-0 rounded border-border accent-[var(--color-accent-2)]"
                  />
                  <span className="min-w-[1.25rem] shrink-0 font-semibold tabular-nums text-accent">
                    {s.step_order}.
                  </span>
                  <span>
                    <RichMath source={s.step_description} />
                  </span>
                </label>
              </li>
            ))}
          </ol>
          {!resolved && (
            <div className="border-t border-border px-4 py-3">
              <Button onClick={doResolveWithSteps} variant="secondary" disabled={pending}>
                {wrongSteps.size
                  ? t('confirmSteps', { n: wrongSteps.size, plural: wrongSteps.size > 1 ? 's' : '' })
                  : t('confirmNone')}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <p className="mt-3 text-xs text-text-muted">{t('noSteps')}</p>
      )}

      <ErrorBanner>{error}</ErrorBanner>

      <div className="mt-4 flex items-center gap-2">
        <Button onClick={handleNext} disabled={pending}>
          {pending ? t('navigating') : t('nextPlus')}
        </Button>
        <button
          type="button"
          onClick={onRetry}
          disabled={pending}
          className="rounded-lg border border-accent-2/40 bg-white/70 px-4 py-2 text-sm font-medium text-accent-2 transition hover:bg-white disabled:opacity-60"
        >
          {t('retryButton')}
        </button>
      </div>
    </div>
  )
}
