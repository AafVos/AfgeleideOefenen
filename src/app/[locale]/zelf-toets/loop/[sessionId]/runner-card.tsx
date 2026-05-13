'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'

import { Math as TeX, RichMath } from '@/components/math'
import { Badge, Button, ErrorBanner } from '@/components/ui'
import { insertAtCursor, toLatexPreview } from '@/lib/practice/input'

import { MathKeyboard } from '../../../leerpad/math-keyboard'
import {
  submitCustomTestAnswerAction,
  type CustomTestAnswerResult,
} from '../../actions'

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
  showAnswers,
}: {
  sessionId: string
  question: RunnerQuestion
  showAnswers: 'immediate' | 'end'
}) {
  const router = useRouter()
  const t = useTranslations('ZelfToets')
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

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
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
              {pending && submitting ? t('checking') : t('submit')}
            </Button>
          </div>
        </form>
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
          <div className="mt-2 text-sm text-accent-2">
            <span>
              {t('correctAnswer')}:{' '}
              {(() => {
                const display = state.latexCorrectAnswer ?? state.correctAnswer
                if (display.includes('$')) {
                  return (
                    <span className="font-serif">
                      <RichMath source={display} />
                    </span>
                  )
                }
                return (
                  <span className="font-serif">
                    <TeX tex={display} />
                  </span>
                )
              })()}
            </span>
          </div>
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
