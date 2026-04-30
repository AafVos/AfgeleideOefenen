'use client'

import { useEffect, useRef, useState, useTransition } from 'react'

import { Math as TeX, RichMath } from '@/components/math'
import { Button, ErrorBanner } from '@/components/ui'
import { insertAtCursor, toLatexPreview } from '@/lib/practice/input'
import type { DiagnosticQuestion } from '@/lib/practice/diagnostic'

import { MathKeyboard } from '@/app/leerpad/math-keyboard'

import { submitDiagnosticAction } from './actions'

function renderBody(q: DiagnosticQuestion) {
  const src = q.latex_body ?? q.body
  if (src.includes('$')) return <RichMath source={src} />
  return <TeX tex={src} />
}

export function DiagnosticRunner({ questions }: { questions: DiagnosticQuestion[] }) {
  const [index, setIndex] = useState(0)
  const [values, setValues] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const inputRef = useRef<HTMLInputElement | null>(null)

  const q = questions[index]
  const raw = values[q?.id ?? ''] ?? ''

  useEffect(() => {
    if (q?.id && inputRef.current) {
      requestAnimationFrame(() => {
        inputRef.current?.focus()
      })
    }
  }, [q?.id])

  function handleKey(text: string) {
    const el = inputRef.current
    const startCaret = el?.selectionStart ?? raw.length
    const endCaret = el?.selectionEnd ?? raw.length
    const { value, caret } = insertAtCursor(raw, startCaret, endCaret, text)
    if (!q?.id) return
    setValues((v) => ({ ...v, [q.id]: value }))
    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.focus()
        inputRef.current.setSelectionRange(caret, caret)
      }
    })
  }

  function handleBackspace() {
    const el = inputRef.current
    const startCaret = el?.selectionStart ?? raw.length
    const endCaret = el?.selectionEnd ?? raw.length
    if (startCaret === endCaret && startCaret === 0) return
    const nextStart = startCaret === endCaret ? startCaret - 1 : startCaret
    const value = raw.slice(0, nextStart) + raw.slice(endCaret)
    if (!q?.id) return
    setValues((v) => ({ ...v, [q.id]: value }))
    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.focus()
        inputRef.current.setSelectionRange(nextStart, nextStart)
      }
    })
  }

  function handleClear() {
    if (!q?.id) return
    setValues((v) => ({ ...v, [q.id]: '' }))
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  function next() {
    if (index < questions.length - 1) setIndex((i) => i + 1)
  }

  function prev() {
    if (index > 0) setIndex((i) => i - 1)
  }

  function finish() {
    setError(null)
    const payload = questions.map((qq) => ({
      questionId: qq.id,
      raw: (values[qq.id] ?? '').trim(),
    }))
    const missing = payload.find((p) => p.raw === '')
    if (missing) {
      setError('Vul elk antwoord in voordat je indient.')
      const mi = questions.findIndex((qq) => qq.id === missing.questionId)
      if (mi >= 0) setIndex(mi)
      return
    }
    start(async () => {
      const res = await submitDiagnosticAction(payload)
      if (res?.error) setError(res.error)
    })
  }

  if (!q) return null

  return (
    <div className="space-y-6">
      <p className="text-sm text-text-muted">
        Vraag {index + 1} van {questions.length}
      </p>

      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="font-serif text-lg text-text">{renderBody(q)}</div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-text">
            Jouw antwoord (afgeleide)
          </span>
          <input
            ref={inputRef}
            id="diag-answer"
            autoFocus={index === 0}
            value={raw}
            onChange={(e) =>
              setValues((v) => ({ ...v, [q.id]: e.target.value }))
            }
            placeholder="Bijv. 12x^2"
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 font-mono text-lg text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            disabled={pending}
            autoComplete="off"
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
            {raw.trim() ? (
              <span className="font-serif text-lg text-text">
                <TeX tex={toLatexPreview(raw)} />
              </span>
            ) : (
              <span className="text-text-muted">—</span>
            )}
          </div>
        </label>
      </div>

      {error && <ErrorBanner>{error}</ErrorBanner>}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="ghost"
          type="button"
          disabled={index === 0 || pending}
          onClick={prev}
        >
          ← Vorige
        </Button>
        <div className="flex gap-2">
          {index < questions.length - 1 ? (
            <Button
              type="button"
              onClick={next}
              disabled={pending}
            >
              Volgende →
            </Button>
          ) : (
            <Button type="button" onClick={finish} disabled={pending}>
              {pending ? 'Bezig…' : 'Toets afsluiten'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
