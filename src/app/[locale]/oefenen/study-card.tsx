'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'

import { SITE } from '@/config/site'
import { Math as TeX, RichMath } from '@/components/math'
import { Button, cn, ErrorBanner } from '@/components/ui'
import {
  submitStudyAnswerAction,
  type StudyResult,
} from '@/lib/practice/chapter-actions'
import { insertAtCursor, toLatexPreview } from '@/lib/practice/input'

import { MathKeyboard } from '@/components/math-keyboard'

const MASTERY_THRESHOLD = 3

/**
 * Notatie voor de antwoordregel onder de opgave, afgeleid van de functieletter
 * in de vraag: "k(x) = …" → "k'(x) =" (afgeleiden) of "K(x) =" (integralen).
 */
function answerPrefix(latexBody: string | null): string {
  const letter = latexBody?.match(/([a-zA-Z])\s*\(\s*x\s*\)\s*=/)?.[1] ?? 'f'
  return SITE === 'integralen' ? `${letter.toUpperCase()}(x) =` : `${letter}'(x) =`
}

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
      userAnswer: string
      correctAnswer: string
      latexCorrectAnswer: string | null
      errorExplanation: string | null
    }

export function StudyCard({
  question,
  steps,
  nextHref,
  questionNumber,
  onAnswered,
}: {
  question: StudyQuestion
  steps: Step[]
  nextHref?: string
  questionNumber?: number
  onAnswered?: (questionId: string, isCorrect: boolean) => void
}) {
  const router = useRouter()
  const t = useTranslations('PracticeCard')
  const [pending, startTransition] = useTransition()
  const [submitting, setSubmitting] = useState(false)
  const [answer, setAnswer] = useState('')
  const [state, setState] = useState<State>({ phase: 'input', error: null })
  const [lastAttempt, setLastAttempt] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const feedbackRef = useRef<HTMLDivElement | null>(null)
  // Reset bij vraagwissel gebeurt via key={question.id} op de call site.

  // Stappenplan + knoppen automatisch in beeld brengen na het onthullen
  useEffect(() => {
    if (revealed) {
      feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [revealed])

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
    setRevealed(false)
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
    const submitted = answer
    startTransition(async () => {
      const result: StudyResult = await submitStudyAnswerAction(question.id, submitted)
      setSubmitting(false)
      if (result.kind === 'error') {
        setState({ phase: 'input', error: result.message })
        return
      }
      if (result.kind === 'correct') {
        onAnswered?.(question.id, true)
        setLastAttempt(submitted)
        setState({ phase: 'correct', streak: result.streak, mastered: result.mastered })
        return
      }
      onAnswered?.(question.id, false)
      setLastAttempt(submitted)
      setState({
        phase: 'wrong',
        userAnswer: submitted,
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
        {state.phase === 'input' && (
          <div className="mt-2 font-serif text-2xl leading-snug text-accent">
            <TeX
              tex={`${answerPrefix(question.latex_body)} ${
                answer.trim() ? toLatexPreview(answer) : '\\ldots'
              }`}
              displayMode
            />
          </div>
        )}
        {state.phase === 'wrong' && (
          <div className="mt-4 flex flex-wrap items-stretch justify-center gap-3">
            {state.userAnswer.trim() && (
              <div className="w-fit rounded-xl border border-accent-2/40 bg-accent-2-light px-5 py-3 text-center">
                <p className="text-xs font-medium uppercase tracking-wide text-accent-2/80">
                  {t('yourAnswer')}
                </p>
                <div className="mt-1 font-serif text-2xl leading-snug text-accent-2">
                  <TeX
                    tex={`${answerPrefix(question.latex_body)} ${toLatexPreview(
                      state.userAnswer,
                    )}`}
                  />
                </div>
              </div>
            )}
            {revealed && (
              <div className="w-fit rounded-xl border border-accent/30 bg-accent-light px-5 py-3 text-center">
                <p className="text-xs font-medium uppercase tracking-wide text-accent/80">
                  {t('correctAnswer')}
                </p>
                <div className="mt-1 font-serif text-2xl leading-snug text-accent">
                  <TeX
                    tex={`${answerPrefix(question.latex_body)} ${(
                      state.latexCorrectAnswer ?? state.correctAnswer
                    ).replaceAll('$', '')}`}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {state.phase === 'input' && (
        <div className="space-y-3">
          <div className="relative">
            <form
              onSubmit={submit}
              className={`space-y-3 ${
                pending && submitting ? 'pointer-events-none opacity-30' : ''
              }`}
              aria-hidden={pending && submitting ? true : undefined}
            >
              <label className="block">
                <div className="mb-2 flex min-h-8 items-center gap-2">
                  {lastAttempt?.trim() && (
                    <>
                      <span className="text-xs uppercase tracking-wide text-text-muted">
                        {t('previousAttempt')}
                      </span>
                      <span className="font-serif text-lg text-text">
                        <TeX tex={toLatexPreview(lastAttempt)} />
                      </span>
                    </>
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
            {pending && submitting && (
              <div
                role="status"
                aria-live="polite"
                aria-busy="true"
                aria-label={t('checking')}
                className="absolute inset-0 flex items-center justify-center"
              >
                <svg
                  className="size-10 animate-spin text-accent"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  aria-hidden
                >
                  <path d="M12 3a9 9 0 1 1-9 9" />
                </svg>
              </div>
            )}
          </div>
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
        <div ref={feedbackRef}>
          <WrongFeedback
            steps={steps}
            revealed={revealed}
            onReveal={() => setRevealed(true)}
            onNext={next}
            onRetry={retry}
            pending={pending}
          />
        </div>
      )}
    </div>
  )
}

function WrongFeedback({
  steps,
  revealed,
  onReveal,
  onNext,
  onRetry,
  pending,
}: {
  steps: Step[]
  revealed: boolean
  onReveal: () => void
  onNext: () => void
  onRetry: () => void
  pending: boolean
}) {
  const t = useTranslations('PracticeCard')
  const orderedSteps = [...steps].sort((a, b) => a.step_order - b.step_order)

  if (!revealed) {
    return (
      <div className="flex items-center justify-center gap-2">
        <Button onClick={onRetry} disabled={pending}>
          {t('retryButton')}
        </Button>
        <button
          type="button"
          onClick={onReveal}
          disabled={pending}
          className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text transition hover:bg-surface-2 disabled:opacity-60"
        >
          {t('showAnswer')}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orderedSteps.length > 0 && (
        <div className="rounded-lg border border-border bg-white/90 shadow-sm">
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

      <div className="flex items-center justify-center gap-2">
        <Button onClick={onNext} disabled={pending}>
          {pending ? t('navigating') : t('nextPlus')}
        </Button>
        <button
          type="button"
          onClick={onRetry}
          disabled={pending}
          className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text transition hover:bg-surface-2 disabled:opacity-60"
        >
          {t('retryButton')}
        </button>
      </div>
    </div>
  )
}
