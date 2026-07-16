'use client'

import { useActionState, useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'

import { askAafAction, type FeedbackState } from '@/app/[locale]/feedback/actions'

const STORAGE_KEY = 'aaf-tour-done'
const GUIDE_WIDTH = 400

type Step = { target?: string; text: string }

const initialAskState: FeedbackState = { error: null, sent: false }

/** Rustende Aaf rechtsonder: rondleiding herstarten of een vraag stellen. */
function AafHelper({ onRestartTour }: { onRestartTour: () => void }) {
  const t = useTranslations('Tour')
  const [open, setOpen] = useState(false)
  const [askState, askFormAction] = useActionState(askAafAction, initialAskState)

  return (
    <div className="fixed bottom-4 right-4 z-30 flex flex-col items-end gap-2">
      {open && (
        <div className="w-72 rounded-2xl rounded-br-sm border border-border bg-surface p-4 shadow-xl">
          <p className="font-serif text-base text-text">{t('askTitle')}</p>
          {askState.sent ? (
            <p className="mt-2 rounded-md border border-accent/30 bg-accent-light px-3 py-2 text-sm text-accent">
              {t('askThanks')}
            </p>
          ) : (
            <form action={askFormAction} className="mt-2 space-y-2">
              <textarea
                name="message"
                required
                rows={3}
                maxLength={2000}
                placeholder={t('askPlaceholder')}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
              {askState.error && (
                <p className="rounded-md border border-accent-2/30 bg-accent-2-light px-3 py-1.5 text-xs text-accent-2">
                  {askState.error}
                </p>
              )}
              <button
                type="submit"
                className="rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-white transition hover:bg-accent/90"
              >
                {t('askSend')}
              </button>
            </form>
          )}
          <div className="mt-3 border-t border-border pt-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                onRestartTour()
              }}
              className="text-xs font-medium text-text-muted underline-offset-2 hover:text-text hover:underline"
            >
              {t('restart')}
            </button>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={t('askTitle')}
        title={t('askTitle')}
        className={`transition hover:-translate-y-0.5 ${open ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
      >
        <Aaf size={44} />
      </button>
    </div>
  )
}

function Aaf({ size = 84 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 100 130"
      width={size}
      height={size * 1.3}
      className="overflow-visible text-text"
      aria-hidden
    >
      <g className="tour-inner">
        {/* zwaaiende arm (achter het lijf) */}
        <path
          className="tour-arm-wave"
          d="M47 72 C 38 66, 31 55, 30 44"
          fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round"
        />
        {/* staartjes (achter het hoofd) */}
        <path d="M34 33 C 25 35, 20 44, 23 52" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <path d="M70 33 C 79 35, 84 44, 81 52" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <circle cx="23" cy="52" r="2.6" fill="currentColor" />
        <circle cx="81" cy="52" r="2.6" fill="currentColor" />
        {/* hoofd: licht wiebelige cirkel */}
        <path
          d="M52 18 C 64 17, 73 27, 72 38 C 71 50, 62 58, 51 57.5 C 40 57, 32 48, 32.5 37 C 33 27, 41 18.5, 52 18"
          fill="var(--color-surface)" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
        />
        {/* pony */}
        <path
          d="M40 23 C 44 18, 50 17, 53 20 M53 20 C 56 16.5, 62 17.5, 64 22"
          fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"
        />
        {/* hals */}
        <path d="M52 58 L 52 66" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        {/* jurkje */}
        <path
          d="M52 64 L 40 96 L 64 96 Z"
          fill="var(--color-surface)" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"
        />
        {/* rustende arm */}
        <path d="M55 72 C 62 76, 67 83, 69 91" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
        {/* benen */}
        <path d="M47 96 C 46 104, 45 112, 44 119 M57 96 C 58 104, 59 111, 60 118" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
        {/* voeten */}
        <path d="M44 119 L 37 121 M60 118 L 67 119" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
        {/* gezicht */}
        <g className="tour-eyes">
          <circle cx="46" cy="36" r="2.8" fill="currentColor" />
          <circle cx="59" cy="36" r="2.8" fill="currentColor" />
        </g>
        <path d="M47 45 C 50 48.5, 55 48.5, 58 45" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="41" cy="43" r="3.5" fill="var(--color-accent)" opacity="0.4" />
        <circle cx="64" cy="43" r="3.5" fill="var(--color-accent)" opacity="0.4" />
      </g>
    </svg>
  )
}

export function WelcomeTour() {
  const t = useTranslations('Tour')
  const [phase, setPhase] = useState<'hidden' | 'tour' | 'rest'>('hidden')
  const [stepIdx, setStepIdx] = useState(0)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)

  const steps: Step[] = useMemo(
    () => [
      { text: t('welcome') },
      { target: 'theorie', text: t('stepTheorie') },
      { target: 'oefenen', text: t('stepOefenen') },
      { target: 'zelftoets', text: t('stepZelfToets') },
      { target: 'voortgang', text: t('stepVoortgang') },
      { text: t('done') },
    ],
    [t],
  )
  const step = steps[stepIdx]!
  const isLast = stepIdx === steps.length - 1

  // Eerste bezoek: start de rondleiding (alleen op brede schermen)
  useEffect(() => {
    const id = window.setTimeout(() => {
      if (localStorage.getItem(STORAGE_KEY)) {
        setPhase('rest')
      } else if (window.innerWidth >= 900) {
        setPhase('tour')
      }
    }, 700)
    return () => window.clearTimeout(id)
  }, [])

  // Plaats de gids bij de actieve stap en zet een ring om het doelwit
  useEffect(() => {
    if (phase !== 'tour') return

    function place() {
      document.querySelectorAll('.tour-ring').forEach((el) => el.classList.remove('tour-ring'))
      const s = steps[stepIdx]!
      if (s.target) {
        const el = document.querySelector(`[data-tour="${s.target}"]`)
        if (el) {
          el.classList.add('tour-ring')
          const r = el.getBoundingClientRect()
          setPos({
            x: Math.max(8, Math.min(r.left + r.width / 2 - GUIDE_WIDTH / 2, window.innerWidth - GUIDE_WIDTH - 8)),
            y: r.bottom + 14,
          })
          return
        }
      }
      setPos({
        x: (window.innerWidth - GUIDE_WIDTH) / 2,
        y: Math.max(120, window.innerHeight * 0.34),
      })
    }

    const raf = requestAnimationFrame(place)
    window.addEventListener('resize', place)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', place)
      document.querySelectorAll('.tour-ring').forEach((el) => el.classList.remove('tour-ring'))
    }
  }, [phase, stepIdx, steps])

  function finish() {
    localStorage.setItem(STORAGE_KEY, '1')
    setPhase('rest')
    setStepIdx(0)
  }

  function restart() {
    setStepIdx(0)
    setPhase('tour')
  }

  if (phase === 'rest') {
    return <AafHelper onRestartTour={restart} />
  }

  if (phase !== 'tour' || !pos) return null

  return (
    <>
      {/* Dim de pagina; zonder doelwit in de header dimmen we het hele scherm */}
      <div
        className={
          step.target
            ? 'fixed inset-x-0 bottom-0 top-14 z-20 bg-[#101820]/30'
            : 'fixed inset-0 z-40 bg-[#101820]/30'
        }
        aria-hidden
      />

      <div
        role="dialog"
        aria-label={t('restart')}
        className="fixed left-0 top-0 z-50 flex items-start gap-1 transition-transform duration-500 ease-out"
        style={{ transform: `translate(${pos.x}px, ${pos.y}px)`, width: GUIDE_WIDTH }}
      >
        <div className="shrink-0">
          <Aaf size={72} />
        </div>
        <div className="rounded-2xl rounded-tl-sm border border-border bg-surface px-4 py-3 shadow-xl">
          <p className="text-sm leading-relaxed text-text">{step.text}</p>
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={() => (isLast ? finish() : setStepIdx((i) => i + 1))}
              className="rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-white transition hover:bg-accent/90"
            >
              {isLast ? t('finish') : stepIdx === 0 ? t('start') : t('next')}
            </button>
            {!isLast && (
              <button
                type="button"
                onClick={finish}
                className="text-xs font-medium text-text-muted underline-offset-2 hover:text-text hover:underline"
              >
                {t('skip')}
              </button>
            )}
            <span className="ml-auto text-xs tabular-nums text-text-muted">
              {stepIdx + 1} / {steps.length}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
