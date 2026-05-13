'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'

import { Math as TeX, RichMath } from '@/components/math'
import { Badge, Button, cn, ErrorBanner } from '@/components/ui'
import {
  submitStudyAnswerAction,
  type StudyResult,
} from '@/lib/practice/chapter-actions'
import { insertAtCursor, toLatexPreview } from '@/lib/practice/input'

import { MathKeyboard } from '@/components/math-keyboard'

const MASTERY_THRESHOLD = 3

type Step = { id: string; step_order: number; step_description: string }

type StudyQuestion = {
  id: string
  latex_body: string | null
  difficulty: 1 | 2 | 3
}

type State =
  | { phase: 'input'; error: string | null }
  | { phase: 'correct'; streak: number; mastered: boolean }
  | {
      phase: 'wrong'
      correctAnswer: string
      latexCorrectAnswer: string | null
      errorExplanation: string | null
    }

export function StudyCard({
  question,
  steps,
  nextHref,
  questionNumber,
}: {
  question: StudyQuestion
  steps: Step[]
  nextHref?: string
  questionNumber?: number
}) {
  const router = useRouter()
  const t = useTranslations('PracticeCard')
  const [pending, startTransition] = useTransition()
  const [submitting, setSubmitting] = useState(false)
  const [answer, setAnswer] = useState('')
  const [state, setState] = useState<State>({ phase: 'input', error: null })
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setState({ phase: 'input', error: null })
    setAnswer('')
    setSubmitting(false)
  }, [question.id])

  function next() {
    startTransition(() => {
      if (nextHref) {
        router.push(nextHref)
      } else {
        router.refresh()
      }
    })
  }

  function retry() {
    setAnswer('')
    setState({ phase: 'input', error: null })
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

    setSubmitting(true)
    startTransition(async () => {
      const result: StudyResult = await submitStudyAnswerAction(question.id, answer)
      setSubmitting(false)
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
        correctAnswer: result.correctAnswer,
        latexCorrectAnswer: result.latexCorrectAnswer,
        errorExplanation: result.errorExplanation,
      })
    })
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {questionNumber != null && (
            <span className="text-xs font-medium text-text-muted">
              #{questionNumber}
            </span>
          )}
          <Badge
            tone={
              question.difficulty === 1
                ? 'accent'
                : question.difficulty === 2
                  ? 'warn'
                  : 'danger'
            }
          >
            {t('difficulty', { n: question.difficulty })}
          </Badge>
        </div>
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
                <span
                  className="practice-check-dots ml-1 inline-flex items-end gap-0.5 pb-0.5 align-middle"
                  aria-hidden
                >
                  <span className="inline-block h-1 w-1 rounded-full bg-text-muted" />
                  <span className="inline-block h-1 w-1 rounded-full bg-text-muted" />
                  <span className="inline-block h-1 w-1 rounded-full bg-text-muted" />
                </span>
              </p>
              {answer.trim() ? (
                <div className="mt-4 rounded-lg border border-border/60 bg-surface/90 px-3 py-2">
                  <p className="text-xs uppercase tracking-wide text-text-muted">
                    {t('yourAnswer')}
                  </p>
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
                  <span className="text-xs uppercase tracking-wide text-text-muted">
                    {t('preview')}
                  </span>
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
                <Button
                  type="submit"
                  disabled={(pending && submitting) || !answer.trim()}
                >
                  {t('submit')}
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {state.phase === 'correct' && (
        <div className="rounded-xl border border-accent/30 bg-accent-light p-4">
          <p className="font-serif text-xl text-accent">
            {state.mastered ? t('correctMastered') : t('correct')}
          </p>
          <p className="mt-1 text-sm text-accent/80">
            {state.mastered
              ? t('masteredBody')
              : t('streakBody', { streak: state.streak, remaining: MASTERY_THRESHOLD - state.streak })}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <Button onClick={next} disabled={pending}>
              {pending ? t('navigating') : t('nextQuestion')}
            </Button>
            <button
              type="button"
              onClick={retry}
              disabled={pending}
              className="rounded-lg border border-accent/40 bg-white/70 px-4 py-2 text-sm font-medium text-accent transition hover:bg-white disabled:opacity-60"
            >
              {t('retryButton')}
            </button>
          </div>
        </div>
      )}

      {state.phase === 'wrong' && (
        <WrongFeedback
          correctAnswer={state.correctAnswer}
          latexCorrectAnswer={state.latexCorrectAnswer}
          errorExplanation={state.errorExplanation}
          steps={steps}
          onNext={next}
          onRetry={retry}
          pending={pending}
        />
      )}
    </div>
  )
}

function WrongFeedback({
  correctAnswer,
  latexCorrectAnswer,
  errorExplanation,
  steps,
  onNext,
  onRetry,
  pending,
}: {
  correctAnswer: string
  latexCorrectAnswer: string | null
  errorExplanation: string | null
  steps: Step[]
  onNext: () => void
  onRetry: () => void
  pending: boolean
}) {
  const t = useTranslations('PracticeCard')
  const orderedSteps = [...steps].sort((a, b) => a.step_order - b.step_order)

  const answerDisplay = latexCorrectAnswer ?? correctAnswer
  const isLatex = answerDisplay.includes('$')

  return (
    <div className="rounded-xl border border-accent-2/40 bg-accent-2-light p-4">
      <p className="font-serif text-xl text-accent-2">{t('wrongTitle')}</p>
      <div className="mt-2 text-sm text-accent-2">
        <span>
          {t('correctAnswer')}:{' '}
          {isLatex ? (
            <span className="font-serif">
              <RichMath source={answerDisplay} />
            </span>
          ) : (
            <span className="font-serif">
              <TeX tex={answerDisplay} />
            </span>
          )}
        </span>
      </div>
      {orderedSteps.length > 0 && (
        <div className="mt-4 rounded-lg border border-border bg-white/90 shadow-sm">
          <div className="px-4 py-3">
            <p className="text-sm font-semibold text-text">{t('stepsTitle')}</p>
          </div>
          <ol className="list-none space-y-1 border-t border-border px-3 py-3 text-sm text-text">
            {orderedSteps.map((s) => (
              <li key={s.id}>
                <div
                  className={cn(
                    'flex items-start gap-3 rounded-md border border-transparent px-3 py-2 leading-relaxed',
                  )}
                >
                  <span className="min-w-[1.25rem] shrink-0 font-semibold tabular-nums text-accent">
                    {s.step_order}.
                  </span>
                  <span>
                    <RichMath source={s.step_description} />
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="mt-4 flex items-center gap-2">
        <Button onClick={onNext} disabled={pending}>
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
