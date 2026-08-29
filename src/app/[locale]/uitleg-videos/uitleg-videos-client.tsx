'use client'

import Link from 'next/link'
import { useActionState, useEffect, useRef, useState, useTransition } from 'react'

import { Math as TeX, RichMath } from '@/components/math'
import { MathKeyboard } from '@/components/math-keyboard'
import { Button, ErrorBanner } from '@/components/ui'
import { insertAtCursor, toLatexPreview } from '@/lib/practice/input'

import { ExerciseTileMathPreview } from '../oefenen/exercise-tile-preview'

import {
  checkVideoAnswerAction,
  vraagVideoAction,
  type VideoAnswerResult,
  type VideoVraagState,
} from './actions'

export type OefenVraag = {
  id: string
  latex_body: string | null
}

type VideoItem = {
  slug: string
  title: string
  description: string
  duration: string
  src: string
  href: string
  hasPractice: boolean
}

type Labels = {
  h1: string
  intro: string
  playlistTitle: string
  practiceTitle: string
  questionTile: string
  preview: string
  placeholder: string
  check: string
  checking: string
  correct: string
  wrongTitle: string
  yourAnswer: string
  correctAnswer: string
  stepsTitle: string
  nextQuestion: string
  previousQuestion: string
  morePractice: string
  loginToPractice: string
  askTitle: string
  askIntro: string
  askCta: string
  askPlaceholder: string
  askSend: string
  askThanks: string
  loginToAsk: string
}

const initialVraagState: VideoVraagState = { error: null, sent: false }

function IconPlay() {
  return (
    <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5.14v13.72c0 .8.87 1.3 1.56.88l10.54-6.86a1.05 1.05 0 0 0 0-1.76L9.56 4.26A1.04 1.04 0 0 0 8 5.14Z" />
    </svg>
  )
}

export function UitlegVideosClient({
  videos,
  activeSlug,
  vragen,
  isLoggedIn,
  loginHref,
  oefenHref,
  labels,
}: {
  videos: VideoItem[]
  activeSlug: string | null
  vragen: OefenVraag[]
  isLoggedIn: boolean
  loginHref: string
  oefenHref: string
  labels: Labels
}) {
  const active = videos.find((v) => v.slug === activeSlug) ?? null

  /** Springt naar het vraagformulier onderaan en zet de cursor in het tekstvak. */
  function naarVraagFormulier() {
    const sectie = document.getElementById('vraag-stellen')
    sectie?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    window.setTimeout(() => {
      sectie?.querySelector('textarea')?.focus({ preventScroll: true })
    }, 600)
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl text-text sm:text-4xl">{labels.h1}</h1>
          <p className="mt-2 max-w-2xl text-text-muted">{labels.intro}</p>
        </div>
        <div className="shrink-0 rounded-2xl border border-border bg-surface-2 p-4 sm:max-w-64">
          <p className="font-serif text-base text-text">{labels.askTitle}</p>
          <p className="mt-1 text-sm text-text-muted">{labels.askIntro}</p>
          <button
            type="button"
            onClick={naarVraagFormulier}
            className="mt-3 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent/90"
          >
            {labels.askCta}
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        {/* Speler (rechts op desktop, bovenaan op mobiel) */}
        <div className="lg:order-2">
          {active ? (
            <video
              key={active.src}
              src={active.src}
              controls
              preload="metadata"
              className="aspect-video w-full rounded-2xl border border-border bg-surface-2 shadow-sm"
            />
          ) : null}
          {active ? (
            <div className="mt-3">
              <h2 className="font-serif text-xl text-text">{active.title}</h2>
              <p className="mt-1 text-sm text-text-muted">{active.description}</p>
            </div>
          ) : null}
        </div>

        {/* Playlist (links op desktop) */}
        <aside className="lg:order-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            {labels.playlistTitle}
          </p>
          <ul className="mt-2 space-y-2">
            {videos.map((v) => {
              const isActive = v.slug === activeSlug
              return (
                <li key={v.slug}>
                  <Link
                    href={v.href as '/uitleg-videos'}
                    scroll={false}
                    aria-current={isActive ? 'true' : undefined}
                    className={`flex items-start gap-2.5 rounded-xl border p-3 transition ${
                      isActive
                        ? 'border-accent bg-accent-light text-text'
                        : 'border-border bg-surface text-text-muted hover:border-accent/40 hover:text-text'
                    }`}
                  >
                    <span className={isActive ? 'mt-0.5 text-accent' : 'mt-0.5'}>
                      <IconPlay />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium leading-snug">{v.title}</span>
                      <span className="mt-0.5 block text-xs opacity-70">{v.duration}</span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </aside>
      </div>

      {/* Oefenen */}
      {active?.hasPractice ? (
        <section className="mt-10">
          <h2 className="font-serif text-2xl text-text">{labels.practiceTitle}</h2>
          {isLoggedIn && vragen.length > 0 ? (
            <div className="mt-4">
              <OefenKaart key={active.slug} vragen={vragen} oefenHref={oefenHref} labels={labels} />
            </div>
          ) : !isLoggedIn ? (
            <p className="mt-3 text-text-muted">
              <Link href={loginHref as '/inloggen'} className="text-accent underline underline-offset-2">
                {labels.loginToPractice}
              </Link>
            </p>
          ) : null}
        </section>
      ) : null}

      {/* Vraag insturen */}
      <section
        id="vraag-stellen"
        className="mt-12 scroll-mt-20 rounded-2xl border border-border bg-surface-2 p-5 sm:p-7"
      >
        <h2 className="font-serif text-2xl text-text">{labels.askTitle}</h2>
        <p className="mt-1 text-sm text-text-muted">{labels.askIntro}</p>
        {isLoggedIn ? (
          <VraagFormulier labels={labels} />
        ) : (
          <p className="mt-4">
            <Link href={loginHref as '/inloggen'} className="text-accent underline underline-offset-2">
              {labels.loginToAsk}
            </Link>
          </p>
        )}
      </section>
    </main>
  )
}

/* ── Oefenkaart: 3 klikbare vraagtegels, wisselen met vorige/volgende ── */

type VraagResultaat =
  | { phase: 'correct' }
  | {
      phase: 'wrong'
      correctAnswer: string
      latexCorrectAnswer: string | null
      steps: Array<{ id: string; step_order: number; step_description: string }>
    }

function OefenKaart({
  vragen,
  oefenHref,
  labels,
}: {
  vragen: OefenVraag[]
  oefenHref: string
  labels: Labels
}) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [results, setResults] = useState<Record<string, VraagResultaat>>({})
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement | null>(null)

  const vraag = vragen[index]
  const answer = vraag ? (answers[vraag.id] ?? '') : ''
  const resultaat = vraag ? (results[vraag.id] ?? null) : null

  function setAnswer(value: string) {
    if (!vraag) return
    setAnswers((prev) => ({ ...prev, [vraag.id]: value }))
  }

  useEffect(() => {
    setError(null)
  }, [index])

  function handleInsert(text: string) {
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

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!answer.trim() || resultaat || !vraag) return
    startTransition(async () => {
      const result: VideoAnswerResult = await checkVideoAnswerAction(vraag.id, answer)
      if (result.kind === 'error') {
        setError(result.message)
      } else if (result.kind === 'correct') {
        setResults((prev) => ({ ...prev, [vraag.id]: { phase: 'correct' } }))
      } else {
        setResults((prev) => ({
          ...prev,
          [vraag.id]: {
            phase: 'wrong',
            correctAnswer: result.correctAnswer,
            latexCorrectAnswer: result.latexCorrectAnswer,
            steps: result.steps,
          },
        }))
      }
    })
  }

  if (!vraag) return null

  const navigatie = (
    <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
      <Button onClick={() => setIndex((i) => i - 1)} disabled={index === 0}>
        ← {labels.previousQuestion}
      </Button>
      <Button
        onClick={() => setIndex((i) => i + 1)}
        disabled={index === vragen.length - 1}
      >
        {labels.nextQuestion} →
      </Button>
    </div>
  )

  return (
    <div>
      {/* Vraagtegels */}
      <div className="grid gap-3 sm:grid-cols-3">
        {vragen.map((v, i) => {
          const isActive = i === index
          const status = results[v.id]?.phase ?? null
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-current={isActive ? 'true' : undefined}
              className={`rounded-xl border p-3 text-left transition ${
                isActive
                  ? 'border-accent bg-accent-light'
                  : 'border-border bg-surface hover:border-accent/40'
              }`}
            >
              <span className="flex items-center justify-between text-sm font-medium text-text">
                <span>{labels.questionTile.replace('{n}', String(i + 1))}</span>
                {status === 'correct' && <span className="text-accent">✓</span>}
                {status === 'wrong' && <span className="text-accent-2">✗</span>}
              </span>
              <ExerciseTileMathPreview latex_body={v.latex_body} />
            </button>
          )
        })}
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6">
      <div className="mb-6 font-serif text-2xl leading-snug text-text">
        {vraag.latex_body?.includes('$') ? (
          <RichMath source={vraag.latex_body} />
        ) : (
          <TeX tex={vraag.latex_body ?? ''} displayMode />
        )}
      </div>

      {!resultaat && (
        <form onSubmit={submit} className="space-y-3">
          <label className="block">
            <div className="mb-2 flex min-h-8 items-center gap-2">
              <span className="text-xs uppercase tracking-wide text-text-muted">
                {labels.preview}
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
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={labels.placeholder}
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 font-mono text-lg text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              disabled={pending}
              inputMode="text"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
            />
            <MathKeyboard
              onInsert={handleInsert}
              onBackspace={handleBackspace}
              onClear={() => setAnswer('')}
              disabled={pending}
            />
          </label>
          <ErrorBanner>{error}</ErrorBanner>
          <Button type="submit" disabled={pending || !answer.trim()}>
            {pending ? labels.checking : labels.check}
          </Button>
        </form>
      )}

      {resultaat?.phase === 'correct' && (
        <div className="rounded-xl border border-accent/30 bg-accent-light p-4">
          <p className="font-serif text-xl text-accent">{labels.correct}</p>
        </div>
      )}

      {resultaat?.phase === 'wrong' && (
        <div className="rounded-xl border border-accent-2/40 bg-accent-2-light p-4">
          <p className="font-serif text-xl text-accent-2">{labels.wrongTitle}</p>
          <div className="mt-2 flex flex-col gap-1 text-sm text-accent-2">
            <span>
              {labels.yourAnswer}:{' '}
              <span className="font-serif">
                <TeX tex={toLatexPreview(answer)} />
              </span>
            </span>
            <span>
              {labels.correctAnswer}:{' '}
              {(() => {
                const display = resultaat.latexCorrectAnswer ?? resultaat.correctAnswer
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
          {resultaat.steps.length > 0 && (
            <div className="mt-4 rounded-lg border border-border bg-white/90 shadow-sm">
              <div className="px-4 py-3">
                <p className="text-sm font-semibold text-text">{labels.stepsTitle}</p>
              </div>
              <ol className="list-none space-y-1 border-t border-border px-3 py-3 text-sm text-text">
                {resultaat.steps.map((s) => (
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
          )}
        </div>
      )}

      {navigatie}
      </div>

      <p className="mt-3 text-sm">
        <Link href={oefenHref as '/oefenen'} className="text-accent underline underline-offset-2">
          {labels.morePractice} →
        </Link>
      </p>
    </div>
  )
}

/* ── Vraagformulier ─────────────────────────────────────────────────── */

function VraagFormulier({ labels }: { labels: Labels }) {
  const [state, formAction] = useActionState(vraagVideoAction, initialVraagState)

  if (state.sent) {
    return (
      <p className="mt-4 rounded-xl border border-accent/30 bg-accent-light px-4 py-3 text-accent">
        {labels.askThanks}
      </p>
    )
  }

  return (
    <form action={formAction} className="mt-4 space-y-3">
      <textarea
        name="message"
        required
        rows={3}
        maxLength={2000}
        placeholder={labels.askPlaceholder}
        className="w-full max-w-2xl rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
      <ErrorBanner>{state.error}</ErrorBanner>
      <Button type="submit">{labels.askSend}</Button>
    </form>
  )
}
