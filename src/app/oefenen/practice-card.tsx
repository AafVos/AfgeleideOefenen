'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'

import { Math as TeX, RichMath } from '@/components/math'
import { Badge, Button, cn, ErrorBanner } from '@/components/ui'
import {
  markCarelessAction,
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
  | {
      phase: 'correct'
      streak: number
      mastered: boolean
    }
  | {
      phase: 'wrong'
      answerId: string
      correctAnswer: string
      latexCorrectAnswer: string | null
      errorExplanation: string | null
      resolved: boolean
    }

export function PracticeCard({
  question,
  steps,
  streakAtStart,
}: {
  question: Question
  steps: Step[]
  streakAtStart: number
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [answer, setAnswer] = useState('')
  const [state, setState] = useState<State>({ phase: 'input', error: null })
  const startedAtRef = useRef<number>(0)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    startedAtRef.current = Date.now()
  }, [question.id])

  function next() {
    setAnswer('')
    setState({ phase: 'input', error: null })
    startedAtRef.current = Date.now()
    startTransition(() => router.refresh())
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

    startTransition(async () => {
      const result: SubmitResult = await submitAnswerAction(
        question.id,
        answer,
        timeSpent,
      )
      if (result.kind === 'error') {
        setState({ phase: 'input', error: result.message })
        return
      }
      if (result.kind === 'correct') {
        setState({
          phase: 'correct',
          streak: result.streak,
          mastered: result.mastered,
        })
        return
      }
      setState({
        phase: 'wrong',
        answerId: result.answerId,
        correctAnswer: result.correctAnswer,
        latexCorrectAnswer: result.latexCorrectAnswer,
        errorExplanation: result.errorExplanation,
        resolved: false,
      })
    })
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-2">
        <Badge
          tone={
            question.difficulty === 1
              ? 'accent'
              : question.difficulty === 2
                ? 'warn'
                : 'danger'
          }
        >
          Moeilijkheid {question.difficulty}
        </Badge>
        <FlagQuestionButton questionId={question.id} />
      </div>

      <div className="mb-6">
        <div className="font-serif text-2xl leading-snug text-text">
          {question.latex_body ? (
            question.latex_body.includes('$') ? (
              <RichMath source={question.latex_body} />
            ) : (
              <TeX tex={question.latex_body} displayMode />
            )
          ) : (
            <RichMath source={question.body} />
          )}
        </div>
      </div>

      {state.phase === 'input' && (
        <form onSubmit={submit} className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-text">
              Jouw antwoord
            </span>
            <input
              ref={inputRef}
              autoFocus
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Bijv. 12x^2"
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 font-mono text-lg text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              disabled={pending}
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
            <div className="mt-2 flex min-h-6 items-center gap-2 text-sm">
              <span className="text-xs uppercase tracking-wide text-text-muted">
                Preview
              </span>
              {answer.trim() ? (
                <span className="font-serif text-lg text-text">
                  <TeX tex={toLatexPreview(answer)} />
                </span>
              ) : (
                <span className="text-text-muted">—</span>
              )}
            </div>
          </label>

          <ErrorBanner>{state.error}</ErrorBanner>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={pending || !answer.trim()}>
              {pending ? 'Nakijken…' : 'Nakijken'}
            </Button>
            {streakAtStart > 0 && (
              <span className="text-xs text-text-muted">
                Huidige streak: {streakAtStart}
              </span>
            )}
          </div>
        </form>
      )}

      {state.phase === 'correct' && (
        <CorrectFeedback
          streak={state.streak}
          mastered={state.mastered}
          onNext={next}
          pending={pending}
        />
      )}

      {state.phase === 'wrong' && (
        <WrongFeedback
          answerId={state.answerId}
          correctAnswer={state.correctAnswer}
          latexCorrectAnswer={state.latexCorrectAnswer}
          errorExplanation={state.errorExplanation}
          steps={steps}
          resolved={state.resolved}
          onResolved={() => setState({ ...state, resolved: true })}
          onNext={next}
          pending={pending}
        />
      )}
    </div>
  )
}

// =====================================================================
// Correct feedback
// =====================================================================
function CorrectFeedback({
  streak,
  mastered,
  onNext,
  pending,
}: {
  streak: number
  mastered: boolean
  onNext: () => void
  pending: boolean
}) {
  return (
    <div className="rounded-xl border border-accent/30 bg-accent-light p-4">
      <p className="font-serif text-xl text-accent">
        {mastered ? 'Geweldig — cluster afgerond 🎉' : 'Goed!'}
      </p>
      <p className="mt-1 text-sm text-accent">
        {mastered
          ? 'Je hebt 3 keer correct op rij. Het volgende cluster wordt nu ontgrendeld.'
          : `Streak: ${streak}/3. Nog ${3 - streak} goed op rij.`}
      </p>
      <div className="mt-4">
        <Button onClick={onNext} disabled={pending}>
          {mastered ? 'Door naar volgend cluster' : 'Volgende vraag'}
        </Button>
      </div>
    </div>
  )
}

// =====================================================================
// Wrong feedback met stappenplan of slordigheidsoptie
// =====================================================================
function WrongFeedback({
  answerId,
  correctAnswer,
  latexCorrectAnswer,
  errorExplanation,
  steps,
  resolved,
  onResolved,
  onNext,
  pending,
}: {
  answerId: string
  correctAnswer: string
  latexCorrectAnswer: string | null
  errorExplanation: string | null
  steps: Step[]
  resolved: boolean
  onResolved: () => void
  onNext: () => void
  pending: boolean
}) {
  const [wrongSteps, setWrongSteps] = useState<Set<string>>(new Set())
  const [, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function toggleStep(id: string) {
    const next = new Set(wrongSteps)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setWrongSteps(next)
  }

  function doCareless() {
    setError(null)
    startTransition(async () => {
      try {
        await markCarelessAction(answerId)
        onResolved()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Er ging iets mis.')
      }
    })
  }

  function doResolveWithSteps() {
    setError(null)
    startTransition(async () => {
      try {
        await resolveWithStepsAction(answerId, [...wrongSteps])
        onResolved()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Er ging iets mis.')
      }
    })
  }

  return (
    <div className="rounded-xl border border-accent-2/40 bg-accent-2-light p-4">
      <p className="font-serif text-xl text-accent-2">Niet helemaal goed</p>
      <div className="mt-2 text-sm text-accent-2">
        Het juiste antwoord was{' '}
        {latexCorrectAnswer ? (
          latexCorrectAnswer.includes('$') ? (
            <span className="font-serif">
              <RichMath source={latexCorrectAnswer} />
            </span>
          ) : (
            <span className="font-serif">
              <TeX tex={latexCorrectAnswer} />
            </span>
          )
        ) : correctAnswer.includes('$') ? (
          <span className="font-serif">
            <RichMath source={correctAnswer} />
          </span>
        ) : (
          <code className="rounded bg-white/60 px-1.5 py-0.5 font-mono">
            {correctAnswer}
          </code>
        )}
        .
      </div>

      {errorExplanation && (
        <div className="mt-3 rounded-md border border-accent-2/30 bg-white/70 p-3 text-sm text-text">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-accent-2">
            Wat ging er mis?
          </p>
          <p className="leading-relaxed">{errorExplanation}</p>
        </div>
      )}

      {!resolved && (
        <>
          <button
            type="button"
            onClick={doCareless}
            disabled={pending}
            className={cn(
              'mt-4 block w-full rounded-md border border-accent-2/40 bg-white/70 px-3 py-2 text-left text-sm font-medium text-accent-2 transition hover:bg-white',
              pending && 'opacity-60',
            )}
          >
            Slordigheidsfoutje — ik wist het wel
            <span className="ml-1 text-xs font-normal text-text-muted">
              (telt niet tegen je streak)
            </span>
          </button>

          {steps.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-text">
                Of: welke stap(pen) gingen fout?
              </p>
              <ul className="mt-2 space-y-1">
                {steps.map((s) => (
                  <li key={s.id}>
                    <label className="flex cursor-pointer items-start gap-2 rounded-md border border-transparent bg-white/60 px-3 py-2 text-sm text-text hover:border-accent-2/40">
                      <input
                        type="checkbox"
                        checked={wrongSteps.has(s.id)}
                        onChange={() => toggleStep(s.id)}
                        className="mt-0.5 size-4 rounded border-border"
                      />
                      <span>
                        <span className="font-medium text-text">
                          Stap {s.step_order}:
                        </span>{' '}
                        <span className="text-text-muted">
                          {s.step_description}
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
              <Button
                onClick={doResolveWithSteps}
                variant="secondary"
                disabled={pending}
                className="mt-3"
              >
                {wrongSteps.size
                  ? `Bevestig ${wrongSteps.size} fout${wrongSteps.size > 1 ? 'e' : 'e'} stap${wrongSteps.size > 1 ? 'pen' : ''}`
                  : 'Geen van bovenstaande — ga door'}
              </Button>
            </div>
          )}

          <ErrorBanner>{error}</ErrorBanner>
        </>
      )}

      {resolved && (
        <div className="mt-4">
          <Button onClick={onNext} disabled={pending}>
            Volgende vraag
          </Button>
        </div>
      )}
    </div>
  )
}
