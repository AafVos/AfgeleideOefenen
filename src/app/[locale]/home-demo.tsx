'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'

import { MathKeyboard } from '@/app/[locale]/leerpad/math-keyboard'
import { Math as TeX, RichMath } from '@/components/math'
import { Badge, Button } from '@/components/ui'
import { Link } from '@/i18n/navigation'
import { insertAtCursor, toLatexPreview } from '@/lib/practice/input'

type State =
  | { phase: 'input'; error: string | null }
  | { phase: 'correct' }
  | { phase: 'wrong'; studentAnswer: string }

const ACCEPTED_NORMALIZED = ['6x+5', '5+6x']

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/\*/g, '')
    .replace(/·/g, '')
    .replace(/\\cdot/g, '')
}

export function HomeDemo() {
  const t = useTranslations('HomeDemo')
  const [answer, setAnswer] = useState('')
  const [state, setState] = useState<State>({ phase: 'input', error: null })
  const inputRef = useRef<HTMLInputElement | null>(null)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!answer.trim() || state.phase !== 'input') return
    if (ACCEPTED_NORMALIZED.includes(normalize(answer))) {
      setState({ phase: 'correct' })
    } else {
      setState({ phase: 'wrong', studentAnswer: answer })
    }
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

  return (
    <section className="mt-14">
      <div className="mb-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center">
        <span className="text-xs font-medium uppercase tracking-wider text-accent">
          {t('eyebrow')}
        </span>
        <span className="text-xs text-text-muted">·</span>
        <span className="text-xs text-text-muted">{t('subEyebrow')}</span>
      </div>

      <div className="rounded-2xl border-2 border-accent/30 bg-surface p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Badge tone="accent">{t('difficulty')}</Badge>
        </div>

        <div className="mb-6">
          <div className="font-serif text-2xl leading-snug text-text">
            <RichMath source={t('questionBody')} />
          </div>
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
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder={t('placeholder')}
                className="w-full rounded-lg border border-border bg-surface px-4 py-3 font-mono text-lg text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                inputMode="text"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
              />
              <MathKeyboard
                onInsert={handleKey}
                onBackspace={handleBackspace}
                onClear={handleClear}
              />
            </label>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={!answer.trim()}>
                {t('submit')}
              </Button>
              <span className="text-xs text-text-muted">{t('hint')}</span>
            </div>
          </form>
        )}

        {state.phase === 'correct' && (
          <div className="rounded-xl border border-accent/30 bg-accent-light p-4">
            <p className="font-serif text-xl text-accent">{t('correctTitle')}</p>
            <p className="mt-1 text-sm text-accent">{t('correctBody')}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link
                href="/registreren"
                className="rounded-lg bg-accent px-5 py-2.5 font-medium text-white shadow-sm transition hover:bg-accent/90"
              >
                {t('correctCta')}
              </Link>
              <button
                type="button"
                onClick={retry}
                className="rounded-lg border border-accent/40 bg-white/70 px-4 py-2 text-sm font-medium text-accent transition hover:bg-white"
              >
                {t('tryAnother')}
              </button>
            </div>
          </div>
        )}

        {state.phase === 'wrong' && (
          <div className="rounded-xl border border-accent-2/40 bg-accent-2-light p-4">
            <p className="font-serif text-xl text-accent-2">{t('wrongTitle')}</p>
            <div className="mt-2 flex flex-col gap-1 text-sm text-accent-2">
              <span>
                {t('studentAnswer')}:{' '}
                <span className="font-serif">
                  <TeX tex={toLatexPreview(state.studentAnswer)} />
                </span>
              </span>
              <span>
                {t('correctAnswer')}:{' '}
                <span className="font-serif">
                  <TeX tex="6x + 5" />
                </span>
              </span>
            </div>

            <div className="mt-4 rounded-lg border border-border bg-white/90">
              <div className="px-4 py-3">
                <p className="text-sm font-semibold text-text">{t('stepsTitle')}</p>
              </div>
              <ol className="list-none space-y-1 border-t border-border px-3 py-3 text-sm text-text">
                {[1, 2, 3].map((n) => (
                  <li key={n} className="flex items-start gap-3 px-3 py-2 leading-relaxed">
                    <span className="min-w-[1.25rem] shrink-0 font-semibold tabular-nums text-accent">
                      {n}.
                    </span>
                    <span>
                      <RichMath source={t(`step${n}` as 'step1')} />
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link
                href="/registreren"
                className="rounded-lg bg-accent px-5 py-2.5 font-medium text-white shadow-sm transition hover:bg-accent/90"
              >
                {t('wrongCta')}
              </Link>
              <button
                type="button"
                onClick={retry}
                className="rounded-lg border border-accent-2/40 bg-white/70 px-4 py-2 text-sm font-medium text-accent-2 transition hover:bg-white"
              >
                {t('tryAgain')}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
