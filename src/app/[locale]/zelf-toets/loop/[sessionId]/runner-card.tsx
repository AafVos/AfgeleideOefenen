'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'

import { Math as TeX, RichMath } from '@/components/math'
import { Badge, Button, ErrorBanner } from '@/components/ui'
import { insertAtCursor, toLatexPreview } from '@/lib/practice/input'

import { MathKeyboard } from '@/components/math-keyboard'
import {
  submitCustomTestAnswerAction,
  type CustomTestAnswerResult,
} from '../../actions'

type Step = { id: string; step_order: number; step_description: string }

type RunnerQuestion = {
  id: string
  latex_body: string | null
  difficulty: 1 | 2 | 3
}

type State =
  | { phase: 'input'; error: string | null }
  | { phase: 'correct'; done: boolean }
  | {
      phase: 'wrong'
      done: boolean
      correctAnswer: string
      latexCorrectAnswer: string | null
    }
  | { phase: 'saved'; done: boolean }

export function TestRunnerCard({
  sessionId,
  question,
  steps,
  showAnswers,
}: {
  sessionId: string
  question: RunnerQuestion
  steps: Step[]
  showAnswers: 'immediate' | 'end'
}) {
  const router = useRouter()
  const t = useTranslations('ZelfToets')
  const tP = useTranslations('PracticeCard')
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
      router.refresh()
    })
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
      const result: CustomTestAnswerResult = await submitCustomTestAnswerAction(
        sessionId,
        question.id,
        answer,
      )
      setSubmitting(false)
      if (result.kind === 'error') {
        setState({ phase: 'input', error: result.message })
        return
      }
      if (showAnswers === 'end') {
        setState({ phase: 'saved', done: result.done })
        return
      }
      if (result.kind === 'correct') {
        setState({ phase: 'correct', done: result.done })
        return
      }
      setState({
        phase: 'wrong',
        done: result.done,
        correctAnswer: result.correctAnswer,
        latexCorrectAnswer: result.latexCorrectAnswer,
      })
    })
  }

  const orderedSteps = [...steps].sort((a, b) => a.step_order - b.step_order)

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between">
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

      <div className="mb-6 font-serif text-2xl leading-snug text-text">
        {question.latex_body?.includes('$') ? (
          <RichMath source={question.latex_body} />
        ) : (
          <TeX tex={question.latex_body ?? ''} displayMode />
        )}
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
          <p className="font-serif text-xl text-accent">{t('correct')}</p>
          <div className="mt-4">
            <Button onClick={next} disabled={pending}>
              {pending ? t('navigating') : state.done ? t('toResults') : t('nextQuestion')}
            </Button>
          </div>
        </div>
      )}

      {state.phase === 'saved' && (
        <div className="rounded-xl border border-border bg-surface-2 p-4">
          <p className="font-serif text-xl text-text">{t('savedDeferred')}</p>
          <div className="mt-4">
            <Button onClick={next} disabled={pending}>
              {pending ? t('navigating') : state.done ? t('toResults') : t('nextQuestion')}
            </Button>
          </div>
        </div>
      )}

      {state.phase === 'wrong' && (
        <div className="rounded-xl border border-accent-2/40 bg-accent-2-light p-4">
          <p className="font-serif text-xl text-accent-2">{t('wrongTitle')}</p>
          <div className="mt-2 flex flex-col gap-1 text-sm text-accent-2">
            <span>
              {t('yourAnswer')}:{' '}
              <span className="font-serif">
                <TeX tex={toLatexPreview(answer)} />
              </span>
            </span>
            <span>
              {t('correctAnswer')}:{' '}
              {(() => {
                const display = state.latexCorrectAnswer ?? state.correctAnswer
                if (display.includes('$')) {
                  return <span className="font-serif"><RichMath source={display} /></span>
                }
                return <span className="font-serif"><TeX tex={display} /></span>
              })()}
            </span>
          </div>

          {orderedSteps.length > 0 ? (
            <div className="mt-4 rounded-lg border border-border bg-white/90 shadow-sm">
              <div className="px-4 py-3">
                <p className="text-sm font-semibold text-text">{tP('stepsTitle')}</p>
              </div>
              <ol className="list-none space-y-1 border-t border-border px-3 py-3 text-sm text-text">
                {orderedSteps.map((s) => (
                  <li key={s.id} className="flex items-start gap-3 rounded-md px-3 py-2 leading-relaxed">
                    <span className="min-w-[1.25rem] shrink-0 font-semibold tabular-nums text-accent">
                      {s.step_order}.
                    </span>
                    <span>
                      <RichMath source={s.step_description} />
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <p className="mt-3 text-xs text-text-muted">{tP('noSteps')}</p>
          )}

          <div className="mt-4">
            <Button onClick={next} disabled={pending}>
              {pending ? t('navigating') : state.done ? t('toResults') : t('nextQuestion')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
