'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'

import { Math as TeX, RichMath } from '@/components/math'
import { Button, ErrorBanner, cn } from '@/components/ui'
import { insertAtCursor, toLatexPreview } from '@/lib/practice/input'
import type { DiagnosticQuestion } from '@/lib/practice/diagnostic'

import { MathKeyboard } from '@/app/leerpad/math-keyboard'

import {
  checkDiagnosticAction,
  saveDiagnosticPadAction,
  type DiagnosticCheckResponse,
  type DiagnosticCheckResult,
  type TopicRow,
} from './actions'

// ── helpers ──────────────────────────────────────────────────────────────────

function renderBody(q: DiagnosticQuestion) {
  const src = q.latex_body ?? q.body
  if (src.includes('$')) return <RichMath source={src} />
  return <TeX tex={src} />
}

// ── main component ───────────────────────────────────────────────────────────

type Phase = 'quiz' | 'results' | 'pad'

export function DiagnosticRunner({
  questions,
}: {
  questions: DiagnosticQuestion[]
}) {
  const [phase, setPhase] = useState<Phase>('quiz')
  const [checkData, setCheckData] = useState<DiagnosticCheckResponse | null>(null)

  if (phase === 'quiz') {
    return (
      <QuizPhase
        questions={questions}
        onDone={(data) => {
          setCheckData(data)
          setPhase('results')
        }}
      />
    )
  }

  if (phase === 'results' && checkData) {
    return (
      <ResultsPhase
        results={checkData.results}
        onContinue={() => setPhase('pad')}
      />
    )
  }

  if (phase === 'pad' && checkData) {
    return (
      <PadPhase
        results={checkData.results}
        allTopics={checkData.allTopics}
      />
    )
  }

  return null
}

// ── Fase 1: Quiz ─────────────────────────────────────────────────────────────

function QuizPhase({
  questions,
  onDone,
}: {
  questions: DiagnosticQuestion[]
  onDone: (data: DiagnosticCheckResponse) => void
}) {
  const [index, setIndex] = useState(0)
  const [values, setValues] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const inputRef = useRef<HTMLInputElement | null>(null)

  const q = questions[index]
  const raw = values[q?.id ?? ''] ?? ''

  useEffect(() => {
    if (q?.id && inputRef.current) {
      requestAnimationFrame(() => inputRef.current?.focus())
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
      const res = await checkDiagnosticAction(payload)
      if ('error' in res) {
        setError(res.error)
      } else {
        onDone(res)
      }
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
          onClick={() => setIndex((i) => i - 1)}
        >
          ← Vorige
        </Button>
        <div className="flex gap-2">
          {index < questions.length - 1 ? (
            <Button
              type="button"
              onClick={() => setIndex((i) => i + 1)}
              disabled={pending}
            >
              Volgende →
            </Button>
          ) : (
            <Button type="button" onClick={finish} disabled={pending}>
              {pending ? 'Nakijken…' : 'Toets afsluiten'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Fase 2: Resultaten ───────────────────────────────────────────────────────

function ResultsPhase({
  results,
  onContinue,
}: {
  results: DiagnosticCheckResult[]
  onContinue: () => void
}) {
  const score = results.filter((r) => r.correct).length
  const total = results.length

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-wider text-accent">
          Toets afgerond
        </p>
        <h2 className="mt-1 font-serif text-3xl text-text">
          {score} van {total} opgaven goed
        </h2>
        <p className="mt-2 text-text-muted">
          Hieronder zie je per onderwerp hoe het ging. Daarna stel je je
          leerpad in op basis van dit resultaat — je mag alles nog aanpassen.
        </p>
      </div>

      <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
        {results.map((r) => (
          <div
            key={r.questionId}
            className={cn(
              'flex gap-4 px-5 py-4',
              r.correct ? 'bg-surface' : 'bg-accent-2-light',
            )}
          >
            <span
              className={cn(
                'mt-0.5 shrink-0 text-lg font-bold',
                r.correct ? 'text-accent' : 'text-accent-2',
              )}
              aria-label={r.correct ? 'Goed' : 'Fout'}
            >
              {r.correct ? '✓' : '✗'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-text">{r.topicTitle}</p>
              {!r.correct && (
                <div className="mt-2 space-y-1 text-sm">
                  <p className="text-text-muted">
                    Jouw antwoord:{' '}
                    <span className="font-mono text-accent-2">
                      <TeX tex={r.userAnswer || '—'} />
                    </span>
                  </p>
                  <p className="text-text-muted">
                    Juist antwoord:{' '}
                    <span className="font-mono text-accent">
                      {r.latexAnswer ? (
                        <TeX tex={r.latexAnswer} />
                      ) : (
                        <span className="font-mono">{r.correctAnswer}</span>
                      )}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button type="button" onClick={onContinue}>
          Stel mijn leerpad in →
        </Button>
      </div>
    </div>
  )
}

// ── Fase 3: Padkeuze ─────────────────────────────────────────────────────────

function PadPhase({
  results,
  allTopics,
}: {
  results: DiagnosticCheckResult[]
  allTopics: TopicRow[]
}) {
  const correctTopicIds = useMemo(
    () => new Set(results.filter((r) => r.correct).map((r) => r.topicId)),
    [results],
  )
  const diagnosticTopicIds = useMemo(
    () => new Set(results.map((r) => r.topicId)),
    [results],
  )

  const sorted = useMemo(
    () => [...allTopics].sort((a, b) => a.order_index - b.order_index),
    [allTopics],
  )

  const initialSel = useMemo(() => {
    const m = new Map<string, { ken: boolean; wil: boolean }>()
    for (const t of sorted) {
      if (diagnosticTopicIds.has(t.id)) {
        const correct = correctTopicIds.has(t.id)
        m.set(t.id, { ken: correct, wil: !correct })
      } else {
        m.set(t.id, { ken: false, wil: true })
      }
    }
    return m
  }, [sorted, correctTopicIds, diagnosticTopicIds])

  const [sel, setSel] = useState(initialSel)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  function setCell(topicId: string, key: 'ken' | 'wil', value: boolean) {
    setSel((prev) => {
      const next = new Map(prev)
      const cur = next.get(topicId) ?? { ken: false, wil: false }
      if (key === 'ken') {
        next.set(topicId, { ken: value, wil: value ? false : cur.wil })
      } else {
        next.set(topicId, { ken: value ? false : cur.ken, wil: value })
      }
      return next
    })
  }

  const canSubmit = useMemo(
    () =>
      sorted.some((t) => {
        const c = sel.get(t.id)
        return c?.wil && !c?.ken
      }),
    [sorted, sel],
  )

  function submit() {
    if (!canSubmit) {
      setError('Kies minimaal één onderwerp om aan te werken.')
      return
    }
    setError(null)
    const topicIds = sorted.map((t) => t.id)
    const payload = topicIds.map((id) => {
      const c = sel.get(id) ?? { ken: false, wil: false }
      return { topicId: id, kenIk: c.ken, wilOefenen: c.wil }
    })
    start(async () => {
      const res = await saveDiagnosticPadAction(topicIds, payload)
      if (res?.error) setError(res.error)
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-wider text-accent">
          Aanbevolen leerpad
        </p>
        <h2 className="mt-1 font-serif text-3xl text-text">
          Dit raden we je aan
        </h2>
        <p className="mt-2 text-text-muted">
          Op basis van de toets hebben we alvast ingevuld wat je al beheerst en
          wat je nog kunt oefenen. Je kunt alles hieronder nog aanpassen voordat
          je start.
        </p>
      </div>

      {error && <ErrorBanner>{error}</ErrorBanner>}

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[28rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-2 text-left">
              <th className="px-4 py-3 font-medium text-text">Onderwerp</th>
              <th className="px-4 py-3 font-medium text-text">Ken ik al</th>
              <th className="px-4 py-3 font-medium text-text">Wil ik oefenen</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((t, i) => {
              const c = sel.get(t.id) ?? { ken: false, wil: false }
              const inDiagnostic = diagnosticTopicIds.has(t.id)
              return (
                <tr
                  key={t.id}
                  className={cn(
                    'border-b border-border last:border-0',
                    i % 2 === 0 ? 'bg-surface' : 'bg-bg',
                  )}
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-text">{t.title}</span>
                    {inDiagnostic && (
                      <span
                        className={cn(
                          'ml-2 text-xs',
                          correctTopicIds.has(t.id)
                            ? 'text-accent'
                            : 'text-accent-2',
                        )}
                      >
                        {correctTopicIds.has(t.id) ? '✓ goed' : '✗ fout'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      className="size-4 accent-accent"
                      checked={c.ken}
                      onChange={(e) => setCell(t.id, 'ken', e.target.checked)}
                      aria-label={`${t.title}: ken ik al`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      className="size-4 accent-accent"
                      checked={c.wil}
                      disabled={c.ken}
                      onChange={(e) => setCell(t.id, 'wil', e.target.checked)}
                      aria-label={`${t.title}: wil ik oefenen`}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          onClick={submit}
          disabled={pending || !canSubmit}
        >
          {pending ? 'Opslaan…' : 'Start met dit leerpad'}
        </Button>
      </div>
    </div>
  )
}
