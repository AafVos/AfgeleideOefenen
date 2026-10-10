'use client'

import { useRouter } from 'next/navigation'

import { Link } from '@/i18n/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'

import { Math as TeX, RichMath } from '@/components/math'
import { Button, ErrorBanner } from '@/components/ui'
import {
  skipStudyQuestionAction,
  submitStudyAnswerAction,
  type SkipResult,
  type StudyResult,
} from '@/lib/practice/chapter-actions'
import { insertAtCursor, toLatexPreview } from '@/lib/practice/input'
import type { UitlegVideo } from '@/lib/videos'

import { MathKeyboard } from '@/components/math-keyboard'

import { FlagQuestionButton } from './flag-question'

const MASTERY_THRESHOLD = 3

/**
 * Notatie voor de antwoordregel onder de opgave, afgeleid van de functieletter
 * in de vraag: "k(x) = …" → "k'(x) =".
 */
function answerPrefix(latexBody: string | null): string {
  const letter = latexBody?.match(/([a-zA-Z])\s*\(\s*x\s*\)\s*=/)?.[1] ?? 'f'
  return `${letter}'(x) =`
}

type Step = { id: string; step_order: number; step_description: string }

/** Klein icoontje: er staat een uitlegvideo klaar over dit onderwerp. */
function IconVideo() {
  return (
    <svg className="size-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5.14v13.72c0 .8.87 1.3 1.56.88l10.54-6.86a1.05 1.05 0 0 0 0-1.76L9.56 4.26A1.04 1.04 0 0 0 8 5.14Z" />
    </svg>
  )
}

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
  /** De leerling wist het niet en vroeg de uitwerking op (zie AFG-102). */
  | {
      phase: 'skipped'
      correctAnswer: string
      latexCorrectAnswer: string | null
    }

export function StudyCard({
  question,
  steps,
  nextHref,
  questionNumber,
  video,
  onAnswered,
}: {
  question: StudyQuestion
  steps: Step[]
  nextHref?: string
  questionNumber?: number
  /** Uitlegvideo over dit onderwerp, als die er is. */
  video?: UitlegVideo | null
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

  /**
   * "Ik weet het niet": meteen het goede antwoord en het stappenplan, zonder
   * dat de leerling eerst iets moet verzinnen om fout te laten rekenen.
   */
  function skip() {
    if (state.phase !== 'input' || submitting) return

    setSubmitting(true)
    startTransition(async () => {
      const result: SkipResult = await skipStudyQuestionAction(question.id)
      setSubmitting(false)
      if (result.kind === 'error') {
        setState({ phase: 'input', error: result.message })
        return
      }
      setRevealed(true)
      setState({
        phase: 'skipped',
        correctAnswer: result.correctAnswer,
        latexCorrectAnswer: result.latexCorrectAnswer,
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
        {video && (
          <Link
            href={`/uitleg-videos?video=${encodeURIComponent(video.slug)}` as '/uitleg-videos'}
            title={video.title}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-accent/30 bg-accent-light px-2.5 py-1 text-xs font-medium text-accent transition hover:border-accent/60"
          >
            <IconVideo />
            <span>{t('hasVideo')}</span>
          </Link>
        )}
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
        {(state.phase === 'wrong' || state.phase === 'skipped') && (
          <div className="mt-4 flex flex-wrap items-stretch justify-center gap-3">
            {state.phase === 'wrong' && state.userAnswer.trim() && (
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

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="submit"
                  className="min-h-11 px-5"
                  disabled={(pending && submitting) || !answer.trim()}
                >
                  {t('submit')}
                </Button>
                {/*
                  Zonder deze knop is de enige weg naar de uitwerking: iets
                  fout intypen. Dat deden leerlingen dan ook (zie AFG-102).
                */}
                <Button
                  type="button"
                  variant="secondary"
                  className="min-h-11 px-5"
                  onClick={skip}
                  disabled={pending && submitting}
                >
                  {t('dontKnow')}
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

      {state.phase === 'skipped' && (
        <div ref={feedbackRef} className="space-y-4">
          <p className="text-center text-sm text-text-muted">{t('skippedBody')}</p>
          <StepsList steps={steps} />
          <AfterAnswerButtons onNext={next} onRetry={retry} pending={pending} />
        </div>
      )}

      <div className="mt-6 flex justify-end border-t border-border pt-3">
        <FlagQuestionButton questionId={question.id} />
      </div>
    </div>
  )
}

/** Het stappenplan onder een opgave waarvan het antwoord nu zichtbaar is. */
function StepsList({ steps }: { steps: Step[] }) {
  const t = useTranslations('PracticeCard')
  const orderedSteps = [...steps].sort((a, b) => a.step_order - b.step_order)

  if (orderedSteps.length === 0) {
    return <p className="text-center text-xs text-text-muted">{t('noSteps')}</p>
  }

  return (
    <div className="rounded-lg border border-border bg-white/90 shadow-sm">
      <div className="px-4 py-3">
        <p className="text-sm font-semibold text-text">{t('stepsTitle')}</p>
      </div>
      <ol className="list-none space-y-1 border-t border-border px-3 py-3 text-sm text-text">
        {orderedSteps.map((s) => (
          <li key={s.id}>
            <div className="flex items-start gap-3 rounded-md px-3 py-2 leading-relaxed">
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
  )
}

/** Doorgaan of deze opgave nog een keer proberen. */
function AfterAnswerButtons({
  onNext,
  onRetry,
  pending,
}: {
  onNext: () => void
  onRetry: () => void
  pending: boolean
}) {
  const t = useTranslations('PracticeCard')
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Button onClick={onNext} disabled={pending} className="min-h-11 px-5">
        {pending ? t('navigating') : t('nextPlus')}
      </Button>
      <Button
        variant="secondary"
        onClick={onRetry}
        disabled={pending}
        className="min-h-11 px-5"
      >
        {t('retryButton')}
      </Button>
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

  if (!revealed) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button onClick={onRetry} disabled={pending} className="min-h-11 px-5">
          {t('retryButton')}
        </Button>
        <Button
          variant="secondary"
          onClick={onReveal}
          disabled={pending}
          className="min-h-11 px-5"
        >
          {t('showAnswer')}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <StepsList steps={steps} />
      <AfterAnswerButtons onNext={onNext} onRetry={onRetry} pending={pending} />
    </div>
  )
}
