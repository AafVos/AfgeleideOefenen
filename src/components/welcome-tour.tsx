'use client'

import { useActionState, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { askAafAction, type FeedbackState } from '@/app/[locale]/(paginas)/feedback/actions'
import { Aaf } from './tour-aaf-icon'

/** Zodat een nieuwe pagina de rondleiding niet terugzet naar het begin. */
const STAP_SLEUTEL = 'aaf-rondleiding-stap'

function wisStap() {
  try {
    sessionStorage.removeItem(STAP_SLEUTEL)
  } catch {
    // Een volle of geblokkeerde opslag mag de rondleiding niet stoppen.
  }
}

// Het DOM-gespeur en de stap-voor-stap-logica van de lopende rondleiding
// wegen zwaar en zijn alleen nodig voor een leerling die de rondleiding ook
// echt ziet. Dat is het grootste deel van de tijd niet zo: de meeste
// bezoeken zijn van iemand die hem al gezien heeft en alleen het rustende
// Aaf-knopje rechtsonder krijgt. Daarom laadt de browser `TourWalker` pas
// zodra de rondleiding ook echt start (AFG-810).
const TourWalker = dynamic(() => import('./tour-walker').then((m) => m.TourWalker), {
  ssr: false,
})

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
          <div className="mt-3 border-t border-border">
            {/* Breed en hoog genoeg om met een duim te raken */}
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                onRestartTour()
              }}
              className="block w-full py-3 text-left text-xs font-medium text-text-muted underline-offset-2 hover:text-text hover:underline"
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

export function WelcomeTour({ tourSeen }: { tourSeen: boolean }) {
  const pathname = usePathname()
  const opNaamPagina = pathname.includes('/gebruikersnaam')
  const [phase, setPhase] = useState<'hidden' | 'tour' | 'rest'>('hidden')

  // Pas ná de gebruikersnaam. Op die pagina ligt de ballon anders over het
  // formulier. Daarna start hij op computer én telefoon: de oefenpagina
  // legt zichzelf uit, ook als het menu is ingeklapt.
  useEffect(() => {
    if (opNaamPagina) return
    const id = window.setTimeout(() => {
      if (tourSeen) {
        wisStap()
        setPhase('rest')
        return
      }
      setPhase('tour')
    }, 700)
    return () => window.clearTimeout(id)
  }, [tourSeen, opNaamPagina])

  function restart() {
    setPhase('tour')
  }

  if (opNaamPagina) return null
  if (phase === 'rest') return <AafHelper onRestartTour={restart} />
  if (phase !== 'tour') return null

  return <TourWalker onDone={() => setPhase('rest')} />
}
