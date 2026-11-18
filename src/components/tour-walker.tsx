'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { markTourSeenAction } from '@/lib/tour-actions'
import { Aaf } from './tour-aaf-icon'

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

/**
 * De lopende rondleiding zelf: alleen gemount terwijl hij ook echt te zien is
 * (zie `WelcomeTour`). Zo komt al het DOM-gespeur en de stapvoor-stap-logica
 * pas als los bestand bij de leerling terecht wanneer hij de rondleiding ook
 * daadwerkelijk krijgt — niet op elke pagina voor iedereen (AFG-810).
 */
export function TourWalker({ onDone }: { onDone: () => void }) {
  const t = useTranslations('Tour')
  const router = useRouter()

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
  // Een opgeslagen stap kan voorbij het einde liggen (minder stappen dan
  // toen hij werd bewaard); dat mag de rondleiding niet laten crashen.
  const [stepIdx, setStepIdx] = useState(() => Math.min(leesStap() ?? 0, steps.length - 1))
  const [wacht, setWacht] = useState(true)
  const [plek, setPlek] = useState<Plek | null>(null)
  const doelRef = useRef<HTMLElement | null>(null)
  const doosRef = useRef<HTMLDivElement | null>(null)
  const routerRef = useRef(router)
  const geduwd = useRef<string | null>(null)

  const stepsRef = useRef(steps)
  useEffect(() => {
    stepsRef.current = steps
    routerRef.current = router
  }, [steps, router])

  const step = steps[stepIdx]!
  const isLast = stepIdx === steps.length - 1

  useEffect(() => {
    bewaarStap(stepIdx)
  }, [stepIdx])

  useEffect(() => {
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
  }, [stepIdx])

  useLayoutEffect(() => {
    if (wacht) return

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
  }, [wacht, stepIdx])

  function finish() {
    wisStap()
    void markTourSeenAction()
    onDone()
  }

  function ga(naar: number) {
    setPlek(null)
    setWacht(true)
    setStepIdx(naar)
  }

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
