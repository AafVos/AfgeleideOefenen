'use client'

import { useRouter } from 'next/navigation'

import { Link } from '@/i18n/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'

import { DeelKnop } from '@/components/deel-knop'
import { Math as TeX, RichMath } from '@/components/math'
import { Button, ErrorBanner, NakijkMelding } from '@/components/ui'
import {
  skipStudyQuestionAction,
  startStudySessionAction,
  submitStudyAnswerAction,
  type SkipResult,
  type StudyResult,
} from '@/lib/practice/chapter-actions'
import { answerPrefix } from '@/lib/practice/answer-prefix'
import { MASTERY_THRESHOLD } from '@/lib/practice/engine'
import { netBeheerst, nogEenGoedZin } from '@/lib/practice/nog-een-goed'
import { insertAtCursor, toLatexPreview } from '@/lib/practice/input'
import { useTimeSpent } from '@/lib/practice/use-time-spent'
import type { UitlegVideo } from '@/lib/videos'

import { MathKeyboard } from '@/components/math-keyboard'

import { FlagQuestionButton } from './flag-question'

function metVoorvoegsel(prefix: string, rest: string): string {
  return prefix ? `${prefix} ${rest}` : rest
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
  /** Tekst vóór het antwoordvak. Leeg bij een kale som: `f'(x) =`. Leeg bij een verhaaltje: niets. */
  answer_prefix: string | null
  difficulty: 1 | 2 | 3
  source_label: string | null
  source_url: string | null
}

type State =
  | { phase: 'input'; error: string | null }
  | { phase: 'correct'; streak: number; mastered: boolean; clusterName: string }
  | {
      phase: 'wrong'
      userAnswer: string
      correctAnswer: string
      latexCorrectAnswer: string | null
      errorExplanation: string | null
      melding: string | null
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
  clusterName,
  video,
  onAnswered,
  onVolgende,
}: {
  question: StudyQuestion
  steps: Step[]
  nextHref?: string
  questionNumber?: number
  /** Naam van de soort som, zoals die al op de site staat. */
  clusterName?: string
  /** Uitlegvideo over dit onderwerp, als die er is. */
  video?: UitlegVideo | null
  onAnswered?: (questionId: string, isCorrect: boolean) => void
  /** Volgende som openen zonder de hele pagina opnieuw te tekenen. */
  onVolgende?: () => void
}) {
  const router = useRouter()
  const t = useTranslations('PracticeCard')
  const prefix = answerPrefix(question.latex_body, question.answer_prefix)
  const [pending, startTransition] = useTransition()
  const [submitting, setSubmitting] = useState(false)
  const [answer, setAnswer] = useState('')
  const [state, setState] = useState<State>({ phase: 'input', error: null })
  const [lastAttempt, setLastAttempt] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  // Twee klikken vlak na elkaar: `submitting` staat dan nog op false, want
  // React tekent pas aan het eind van de tel opnieuw en de knop is dus nog
  // niet grijs. Een ref staat meteen goed (AFG-505).
  const bezigRef = useRef(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const feedbackRef = useRef<HTMLDivElement | null>(null)
  const { secondsSpent, restart: restartTimer } = useTimeSpent()
  // Reset bij vraagwissel gebeurt via key={question.id} op de call site.

  // De opgave staat op het scherm: vanaf nu is er een oefensessie, ook als de
  // leerling niets invult (zie AFG-115).
  useEffect(() => {
    void startStudySessionAction(question.id)
  }, [question.id])

  // Na een fout antwoord de uitleg in beeld brengen. Bij het stappenplan
  // blijft die uitleg bovenaan staan; bij "ik weet het niet" de knoppen.
  useEffect(() => {
    if (state.phase !== 'wrong' && !revealed) return
    feedbackRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: state.phase === 'wrong' ? 'start' : 'end',
    })
  }, [state.phase, revealed])

  function next() {
    if (onVolgende) {
      onVolgende()
      return
    }
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
    // Nieuwe poging, nieuwe tijdmeting: anders telt het lezen van de
    // uitwerking mee bij het volgende antwoord.
    restartTimer()
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

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!answer.trim() || state.phase !== 'input' || bezigRef.current) return

    bezigRef.current = true
    setSubmitting(true)
    const submitted = answer
    const seconds = secondsSpent()
    startTransition(async () => {
      const result: StudyResult = await submitStudyAnswerAction(
        question.id,
        submitted,
        seconds,
      )
      bezigRef.current = false
      setSubmitting(false)
      if (result.kind === 'error') {
        setState({ phase: 'input', error: result.message })
        return
      }
      if (result.kind === 'correct') {
        onAnswered?.(question.id, true)
        setLastAttempt(submitted)
        setState({
          phase: 'correct',
          streak: result.streak,
          mastered: result.mastered,
          clusterName: result.clusterTitle,
        })
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
        melding: result.melding,
      })
    })
  }

  /**
   * "Ik weet het niet": meteen het goede antwoord en het stappenplan, zonder
   * dat de leerling eerst iets moet verzinnen om fout te laten rekenen.
   */
  function skip() {
    if (state.phase !== 'input' || submitting || bezigRef.current) return

    bezigRef.current = true
    setSubmitting(true)
    const seconds = secondsSpent()
    startTransition(async () => {
      const result: SkipResult = await skipStudyQuestionAction(question.id, seconds)
      bezigRef.current = false
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
            href={`/uitleg-videos/${encodeURIComponent(video.slug)}` as '/uitleg-videos'}
            title={video.title}
            data-meet="oefenen-video-bij-opgave"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-accent/30 bg-accent-light px-2.5 py-1 text-xs font-medium text-accent transition hover:border-accent/60"
          >
            <IconVideo />
            <span>{t('hasVideo')}</span>
          </Link>
        )}
      </div>

      <div className="mb-6 min-w-0">
        {question.source_label ? (
          <p className="mb-3 text-sm leading-snug text-text-muted">
            {question.source_url ? (
              <a
                href={question.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center text-accent underline-offset-2 hover:underline"
              >
                {question.source_label}
              </a>
            ) : (
              question.source_label
            )}
          </p>
        ) : null}
        <div className="font-serif text-2xl leading-snug text-text">
          {question.latex_body?.includes('$') ? (
            <div className="break-words">
              <RichMath source={question.latex_body} />
            </div>
          ) : (
            <TeX tex={question.latex_body ?? ''} displayMode />
          )}
        </div>
        {state.phase === 'input' && (
          <div className="mt-2 font-serif text-2xl leading-snug text-accent">
            <TeX
              tex={metVoorvoegsel(
                prefix,
                answer.trim() ? toLatexPreview(answer) : '\\ldots',
              )}
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
                    tex={metVoorvoegsel(prefix, toLatexPreview(state.userAnswer))}
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
                    tex={metVoorvoegsel(
                      prefix,
                      (
                        state.latexCorrectAnswer ?? state.correctAnswer
                      ).replaceAll('$', ''),
                    )}
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
                  data-tour="antwoord"
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
                <div data-tour="beheersing">
                  <MathKeyboard onInsert={handleKey} disabled={pending} />
                </div>
              </label>

              <ErrorBanner>{state.error}</ErrorBanner>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="submit"
                  data-tour="nakijken"
                  data-meet="oefenen-nakijken"
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
                  data-meet="oefenen-weet-ik-niet"
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

      {state.phase === 'correct' && (() => {
        const justMastered = netBeheerst(state.streak, state.mastered)
        return (
          <div
            className={`rounded-xl border border-accent/30 bg-accent-light p-4 ${
              justMastered ? 'animate-mastered-flash' : ''
            }`}
          >
            <p
              className={`font-serif text-accent ${
                justMastered ? 'text-2xl font-semibold' : 'text-xl'
              }`}
            >
              {state.mastered ? t('correctMastered') : t('correct')}
            </p>
            <p className="mt-1 text-sm text-accent/80">
              {state.mastered
                ? t('masteredBody')
                : (nogEenGoedZin(state.streak, state.clusterName || clusterName || '') ??
                  t('streakBody', {
                    streak: state.streak,
                    remaining: MASTERY_THRESHOLD - state.streak,
                  }))}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <Button
                onClick={next}
                disabled={pending}
                data-meet="oefenen-volgende"
                className="min-h-11 px-5"
              >
                {pending ? t('navigating') : t('nextQuestion')}
              </Button>
              <button
                type="button"
                onClick={retry}
                disabled={pending}
                data-meet="oefenen-opnieuw"
                className="inline-flex min-h-11 items-center rounded-lg border border-accent/40 bg-white/70 px-4 py-2 text-sm font-medium text-accent transition hover:bg-white disabled:opacity-60"
              >
                {t('retryButton')}
              </button>
            </div>
            {justMastered && (
              <div className="mt-3">
                <DeelKnop compact />
              </div>
            )}
          </div>
        )
      })()}

      {state.phase === 'wrong' && (
        <div ref={feedbackRef}>
          <WrongFeedback
            steps={steps}
            explanation={state.errorExplanation}
            melding={state.melding}
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
      <Button
        onClick={onNext}
        disabled={pending}
        data-meet="oefenen-volgende"
        className="min-h-11 px-5"
      >
        {pending ? t('navigating') : t('nextPlus')}
      </Button>
      <Button
        variant="secondary"
        onClick={onRetry}
        disabled={pending}
        data-meet="oefenen-opnieuw"
        className="min-h-11 px-5"
      >
        {t('retryButton')}
      </Button>
    </div>
  )
}

/**
 * Korte uitleg waarom dit antwoord fout is. Leeg of alleen witruimte: geen vak,
 * ook niet als het stappenplan er wel is.
 */
function FoutUitleg({ text }: { text: string | null }) {
  const t = useTranslations('PracticeCard')
  const uitleg = text?.trim() ?? ''
  if (!uitleg) return null

  return (
    <div
      role="status"
      className="rounded-xl border border-accent-2/40 bg-accent-2-light px-4 py-3"
    >
      <p className="text-sm font-semibold text-accent-2">{t('whatWentWrong')}</p>
      <div className="mt-1 max-w-full overflow-x-auto text-sm leading-relaxed break-words text-text">
        <RichMath source={uitleg} />
      </div>
    </div>
  )
}

function WrongFeedback({
  steps,
  explanation,
  melding,
  revealed,
  onReveal,
  onNext,
  onRetry,
  pending,
}: {
  steps: Step[]
  explanation: string | null
  melding: string | null
  revealed: boolean
  onReveal: () => void
  onNext: () => void
  onRetry: () => void
  pending: boolean
}) {
  const t = useTranslations('PracticeCard')
  const uitleg = (
    <>
      <FoutUitleg text={explanation} />
      <NakijkMelding text={melding} />
    </>
  )

  if (!revealed) {
    return (
      <div className="space-y-4">
        {uitleg}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            onClick={onRetry}
            disabled={pending}
            data-meet="oefenen-opnieuw"
            className="min-h-11 px-5"
          >
            {t('retryButton')}
          </Button>
          <Button
            variant="secondary"
            onClick={onReveal}
            disabled={pending}
            data-meet="oefenen-antwoord-zien"
            className="min-h-11 px-5"
          >
            {t('showAnswer')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {uitleg}
      <StepsList steps={steps} />
      <AfterAnswerButtons onNext={onNext} onRetry={onRetry} pending={pending} />
    </div>
  )
}
