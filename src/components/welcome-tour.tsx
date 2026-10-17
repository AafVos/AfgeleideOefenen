'use client'

import { useActionState, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { askAafAction, type FeedbackState } from '@/app/[locale]/(paginas)/feedback/actions'
import { markTourSeenAction } from '@/lib/tour-actions'


/** Breedte van de tekstballon; op een smal scherm krimpt hij mee. */
const GUIDE_WIDTH = 400

/** Het hoofdstuk dat de rondleiding op de oefenpagina opent. */
const VOORBEELD = '/oefenen?chapter=h2'

/** Zodat een nieuwe pagina de rondleiding niet terugzet naar het begin. */
const STAP_SLEUTEL = 'aaf-rondleiding-stap'

type Stap = {
  tekst: string
  /** `data-tour` van het element waar de ballon bij hoort. */
  doel?: string
  /** Pad zonder taal. Een vraagteken-parameter die hier ontbreekt, mag er ook niet staan. */
  pad?: string
  /** Open de eerste tegel van het voorbeeldhoofdstuk. */
  eersteOpgave?: boolean
  /** Ontbreekt het element, dan slaan we deze stap over. */
  optioneel?: boolean
}

/** Waar de tekstballon staat, hoe breed hij is, en of hij bij een item hangt. */
type Plek = { x: number; y: number; breedte: number; bijItem: boolean }

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

function leesStap(): number | null {
  try {
    const n = Number(sessionStorage.getItem(STAP_SLEUTEL))
    return Number.isInteger(n) && n >= 0 ? n : null
  } catch {
    return null
  }
}

function bewaarStap(stap: number) {
  try {
    sessionStorage.setItem(STAP_SLEUTEL, String(stap))
  } catch {
    // Een volle of geblokkeerde opslag mag de rondleiding niet stoppen.
  }
}

function wisStap() {
  try {
    sessionStorage.removeItem(STAP_SLEUTEL)
  } catch {
    // Zie bewaarStap.
  }
}

function zichtbaar(el: Element): el is HTMLElement {
  if (!(el instanceof HTMLElement)) return false
  if (el.hidden || el.closest('[hidden]')) return false
  const stijl = getComputedStyle(el)
  if (stijl.display === 'none' || stijl.visibility === 'hidden') return false
  const r = el.getBoundingClientRect()
  return r.width >= 8 && r.height >= 8
}

function vindDoel(doel: string): HTMLElement | null {
  for (const el of document.querySelectorAll(`[data-tour="${doel}"]`)) {
    if (zichtbaar(el)) return el
  }
  return null
}

function opPad(pad: string): boolean {
  const hier = new URL(window.location.href)
  const doel = new URL(pad, window.location.origin)
  if (!hier.pathname.endsWith(doel.pathname)) return false
  for (const [sleutel, waarde] of doel.searchParams) {
    if (hier.searchParams.get(sleutel) !== waarde) return false
  }
  if (!doel.searchParams.has('q') && hier.searchParams.has('q')) return false
  return true
}

function wachtOp<T>(check: () => T | null, ms: number, stop: () => boolean): Promise<T | null> {
  const tot = Date.now() + ms
  return new Promise((resolve) => {
    function kijk() {
      if (stop()) {
        resolve(null)
        return
      }
      const gevonden = check()
      if (gevonden) {
        resolve(gevonden)
        return
      }
      if (Date.now() >= tot) {
        resolve(null)
        return
      }
      window.setTimeout(kijk, 200)
    }
    kijk()
  })
}

function berekenPlek(el: HTMLElement | null, hoogte: number, breedte: number): Plek {
  const marge = 8
  if (!el) {
    return {
      x: Math.max(marge, (window.innerWidth - breedte) / 2),
      y: Math.max(marge, (window.innerHeight - hoogte) / 2),
      breedte,
      bijItem: false,
    }
  }
  const r = el.getBoundingClientRect()
  const onder = r.bottom + 12
  const boven = r.top - 12 - hoogte
  const pastOnder = onder + hoogte <= window.innerHeight - marge
  const pastBoven = boven >= marge
  let y = pastOnder ? onder : pastBoven ? boven : Math.max(marge, window.innerHeight - hoogte - marge)
  const dekt = y < r.bottom && y + hoogte > r.top
  if (dekt) {
    y = window.innerHeight - r.bottom >= r.top ? onder : boven
  }
  y = Math.max(marge, Math.min(y, window.innerHeight - hoogte - marge))
  const x = Math.max(marge, Math.min(r.left, window.innerWidth - breedte - marge))
  return { x, y, breedte, bijItem: true }
}

export function WelcomeTour({ tourSeen }: { tourSeen: boolean }) {
  const t = useTranslations('Tour')
  const router = useRouter()
  const pathname = usePathname()
  const opNaamPagina = pathname.includes('/gebruikersnaam')
  const [phase, setPhase] = useState<'hidden' | 'tour' | 'rest'>('hidden')
  const [stepIdx, setStepIdx] = useState(0)
  const [wacht, setWacht] = useState(true)
  const [plek, setPlek] = useState<Plek | null>(null)
  const doelRef = useRef<HTMLElement | null>(null)
  const doosRef = useRef<HTMLDivElement | null>(null)
  const routerRef = useRef(router)
  const geduwd = useRef<string | null>(null)

  const steps: Stap[] = useMemo(
    () => [
      { tekst: t('welcome') },
      { doel: 'menu', tekst: t('stepMenu') },
      { doel: 'hoofdstukken', pad: VOORBEELD, tekst: t('stepHoofdstukken') },
      { doel: 'tegels', pad: VOORBEELD, tekst: t('stepTegels') },
      { doel: 'soort', pad: VOORBEELD, optioneel: true, tekst: t('stepFilter') },
      { doel: 'antwoord', eersteOpgave: true, tekst: t('stepAntwoord') },
      { doel: 'nakijken', tekst: t('stepNakijken') },
      { doel: 'beheersing', tekst: t('stepBeheersing') },
      { doel: 'delen', pad: VOORBEELD, tekst: t('stepDelen') },
      { doel: 'voortgang', tekst: t('done') },
    ],
    [t],
  )
  const stepsRef = useRef(steps)
  useEffect(() => {
    stepsRef.current = steps
    routerRef.current = router
  }, [steps, router])
  const step = steps[stepIdx]!
  const isLast = stepIdx === steps.length - 1

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
      const bewaard = leesStap()
      if (bewaard != null) setStepIdx(Math.min(bewaard, steps.length - 1))
      setPhase('tour')
    }, 700)
    return () => window.clearTimeout(id)
  }, [tourSeen, opNaamPagina, steps.length])

  useEffect(() => {
    if (phase === 'tour') bewaarStap(stepIdx)
  }, [phase, stepIdx])

  useEffect(() => {
    if (phase !== 'tour') return
    let stop = false
    const gestopt = () => stop
    doelRef.current = null

    function gaNaar(doel: string) {
      const sleutel = `${stepIdx}:${doel}`
      if (geduwd.current === sleutel) return
      geduwd.current = sleutel
      routerRef.current.push(doel)
    }

    async function klaarzetten() {
      setWacht(true)
      setPlek(null)
      const stap = stepsRef.current[stepIdx]
      if (!stap || gestopt()) return

      if (stap.eersteOpgave) {
        if (!vindDoel('antwoord')) {
          const link = await wachtOp(() => {
            const tegel = vindDoel('tegels')
            const a = tegel?.querySelector('a')
            return a instanceof HTMLAnchorElement ? a : null
          }, 8000, gestopt)
          if (gestopt()) return
          const href = link?.getAttribute('href')
          if (href) {
            const absoluut = new URL(href, window.location.origin)
            const hier = `${window.location.pathname}${window.location.search}`
            const doel = `${absoluut.pathname}${absoluut.search}`
            if (hier !== doel) gaNaar(doel)
          }
        }
      } else if (stap.pad && !opPad(stap.pad)) {
        const taal = window.location.pathname.split('/').filter(Boolean)[0] || 'nl'
        gaNaar(`/${taal}${stap.pad}`)
      }

      if (stap.pad) {
        await wachtOp(() => (opPad(stap.pad!) ? document.body : null), 8000, gestopt)
        if (gestopt()) return
      }

      // Na een paginawissel even wachten tot het element er is. Zonder
      // wissel (het menu, of voortgang op een telefoon) niet blijven hangen:
      // dan komt de ballon in het midden.
      const wachttijd = stap.optioneel ? 2000 : stap.pad || stap.eersteOpgave ? 8000 : 800
      const el = stap.doel ? await wachtOp(() => vindDoel(stap.doel!), wachttijd, gestopt) : null
      if (gestopt()) return

      if (stap.doel && !el && stap.optioneel && stepIdx < stepsRef.current.length - 1) {
        setStepIdx((i) => i + 1)
        return
      }

      if (el) el.scrollIntoView({ block: 'center', inline: 'nearest' })
      doelRef.current = el
      setWacht(false)
    }

    void klaarzetten()
    return () => {
      stop = true
    }
    // steps en router via een ref: een nieuw array-object mag deze
    // voorbereiding niet afbreken, anders blijft het scherm gedimd
    // zonder ballon.
  }, [phase, stepIdx])

  useLayoutEffect(() => {
    if (phase !== 'tour' || wacht) return

    function plaats() {
      document.querySelectorAll('.tour-ring').forEach((el) => el.classList.remove('tour-ring'))
      const el = doelRef.current
      if (el) el.classList.add('tour-ring')
      // Op de oefenpagina zelf licht geen stap het menu-item "Oefenen" meer
      // uit (de ring staat dan op de inhoud); zonder dit blijft het net zo
      // onopvallend als een pagina waar de rondleiding niet komt. Alleen
      // wanneer er al een doel gevonden is: zonder doel (de welkomststap)
      // dimt een volledig scherm (z-40) hoger dan deze ring, dus zou hij
      // daar juist onder verdwijnen.
      if (el && window.location.pathname.includes('/oefenen')) {
        vindDoel('oefenen')?.classList.add('tour-ring')
      }
      const breedte = Math.min(GUIDE_WIDTH, window.innerWidth - 16)
      const hoogte = doosRef.current?.offsetHeight ?? 200
      setPlek(berekenPlek(el, hoogte, breedte))
    }

    plaats()
    window.addEventListener('resize', plaats)
    window.addEventListener('scroll', plaats, true)
    return () => {
      window.removeEventListener('resize', plaats)
      window.removeEventListener('scroll', plaats, true)
      document.querySelectorAll('.tour-ring').forEach((el) => el.classList.remove('tour-ring'))
    }
  }, [phase, wacht, stepIdx])

  function finish() {
    wisStap()
    void markTourSeenAction()
    setPhase('rest')
    setStepIdx(0)
  }

  function ga(naar: number) {
    setPlek(null)
    setWacht(true)
    setStepIdx(naar)
  }

  function restart() {
    bewaarStap(0)
    setStepIdx(0)
    setPlek(null)
    setWacht(true)
    setPhase('tour')
  }

  if (opNaamPagina) return null

  if (phase === 'rest') {
    return <AafHelper onRestartTour={restart} />
  }

  if (phase !== 'tour') return null

  const breedte = plek?.breedte ?? Math.min(GUIDE_WIDTH, typeof window === 'undefined' ? GUIDE_WIDTH : window.innerWidth - 16)

  return (
    <>
      {!wacht && (
        <div
          className={
            plek?.bijItem
              ? 'fixed inset-x-0 bottom-0 top-14 z-20 bg-[#101820]/30'
              : 'fixed inset-0 z-40 bg-[#101820]/30'
          }
          aria-hidden
        />
      )}

      <div
        ref={doosRef}
        role="dialog"
        aria-label={t('restart')}
        className={`fixed left-0 top-0 z-50 flex items-start gap-1 ${breedte < 360 ? 'flex-col' : ''}`}
        style={
          plek
            ? { transform: `translate(${plek.x}px, ${plek.y}px)`, width: plek.breedte }
            : { visibility: 'hidden', width: breedte }
        }
      >
        <div className="shrink-0">
          <Aaf size={breedte < 360 ? 56 : 72} />
        </div>
        <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm border border-border bg-surface px-4 py-3 shadow-xl">
          <p className="text-sm leading-relaxed text-text">{step.tekst}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
            <button
              type="button"
              onClick={() => ga(stepIdx - 1)}
              disabled={stepIdx === 0 || wacht}
              className="inline-flex min-h-11 items-center px-1 text-sm font-medium text-text-muted disabled:opacity-40"
            >
              {t('back')}
            </button>
            <button
              type="button"
              onClick={() => (isLast ? finish() : ga(stepIdx + 1))}
              disabled={wacht}
              className="inline-flex min-h-11 items-center rounded-lg bg-accent px-4 text-sm font-medium text-white transition hover:bg-accent/90 disabled:opacity-60"
            >
              {isLast ? t('finish') : stepIdx === 0 ? t('start') : t('next')}
            </button>
            <button
              type="button"
              onClick={finish}
              disabled={wacht}
              className="inline-flex min-h-11 items-center px-1 text-sm font-medium text-text-muted underline-offset-2 hover:text-text hover:underline disabled:opacity-40"
            >
              {t('skip')}
            </button>
            <span className="ml-auto text-xs tabular-nums text-text-muted">
              {stepIdx + 1} / {steps.length}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
