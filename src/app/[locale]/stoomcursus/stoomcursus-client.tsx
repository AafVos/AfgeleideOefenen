'use client'

import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'

import { RichMath } from '@/components/math'
import { cn } from '@/components/ui'

import {
  saveStoomcursusProgress,
  type StoomcursusData,
  type StoomcursusProgress,
  type StoomcursusStep,
} from './actions'
import { GEEL_TREDES, TYPE_VRAAG_OPTIES } from './geel-tredes'

/**
 * Voer een state-update uit als view transition, zodat blokken met een
 * view-transition-name zichtbaar naar hun nieuwe plek glijden in plaats
 * van hard te wisselen. `after` draait pas als het glijden klaar is.
 * Zonder browsersupport: gewoon direct updaten.
 */
function rearrange(update: () => void, after?: () => void) {
  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => { finished: Promise<void> }
  }
  if (doc.startViewTransition) {
    const vt = doc.startViewTransition(() => flushSync(update))
    if (after) vt.finished.then(after, after)
  } else {
    update()
    after?.()
  }
}

type StoomcursusPart = {
  label: string
  title: string
  body: string
  oefenPlaceholder: string
}

type StoomcursusLabels = {
  eyebrow: string
  welcome: string
  start: string
  partsIntro: string
  next: string
  back: string
  exampleEyebrow: string
  exampleGiven: string
  exampleQuestion: string
  howSolve: string
  answerEyebrow: string
  answerBody: string
  methodTitle: string
  methodBody: string
  choosePrompt: string
  hubStatusNieuw: string
  hubStatusBezig: string
  hubStatusKlaar: string
  hubFinaleTitle: string
  hubFinaleLocked: string
  hubFinaleSoon: string
  oplosTitle: string
  oplosIntro: string
  oplosGroepen: AlsDanGroep[]
  groenTitle: string
  groenIntro: string
  groenGroepen: AlsDanGroep[]
  parts: StoomcursusPart[]
}

type AlsDanGroep = {
  title: string
  items: Array<{ als: string; dan?: string; stappen: string[] }>
}

// Voortgang van niet-ingelogde bezoekers in localStorage; ingelogde
// gebruikers krijgen hun voortgang uit het account (stoomcursus_progress).
const STORAGE_KEY = 'stoomcursus-voortgang'

function loadLocalProgress(): StoomcursusProgress | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const saved = JSON.parse(raw) as Partial<StoomcursusProgress>
    if (
      typeof saved.step !== 'string' ||
      !['welkom', 'onderdelen', 'uitleg', 'vervolg', 'oefenen'].includes(saved.step)
    ) {
      return null
    }
    return {
      step: saved.step as StoomcursusStep,
      placed: typeof saved.placed === 'number' ? saved.placed : 0,
      part: typeof saved.part === 'number' ? saved.part : null,
      data:
        saved.data && typeof saved.data === 'object' && !Array.isArray(saved.data)
          ? saved.data
          : {},
    }
  } catch {
    return null
  }
}

/** Zet opgeslagen voortgang om naar een consistente beginstand. */
function sanitizeProgress(
  p: StoomcursusProgress | null | undefined,
): StoomcursusProgress | null {
  if (!p || p.step === 'welkom') return null
  // Terugkerende bezoekers landen op het keuzescherm (de overview met
  // statuslabels), niet diep in een onderdeel waar ze gebleven waren.
  const naarHub = p.step === 'oefenen'
  return {
    step: naarHub ? 'vervolg' : p.step,
    placed: naarHub ? 3 : Math.min(3, Math.max(0, p.placed)),
    part: naarHub ? null : p.part,
    data: p.data ?? {},
  }
}

// Timing van het "filmpje" op het onderdelen-scherm (in seconden):
// de blokken poppen één voor één op, daarna pas de voorbeeldopgave.
const BLOCK_POP_DELAY = (i: number) => 0.6 + i * 1.4
const EXAMPLE_APPEARS_MS = 5000

// Sleutels in StoomcursusData per onderdeel-index
const PART_KEYS = ['geel', 'groen', 'rood'] as const

// Gele accentkleuren (huisstijl-geel)
const GEEL_BORDER = 'border-[#e2c25c]/60'

// Welke tredes zijn nu actief (hebben een "Type vraag"-optie). De rest van de
// verhaaltjes staat voor nu uit; tegels en spiekblad tonen alleen deze.
const ACTIEVE_TREDES = new Set(TYPE_VRAAG_OPTIES.flatMap((o) => o.tredeIndexes))
const ZICHTBARE_TREDES = GEEL_TREDES.map((trede, index) => ({
  trede,
  index,
})).filter(({ index }) => ACTIEVE_TREDES.has(index))

const PART_STYLES = [
  // 1. Begrijp het verhaaltje — geel
  {
    block: 'border-[#e2c25c]/70 bg-[#fbf3d8]',
    label: 'text-[#8a6a14]',
  },
  // 2. Vind de afgeleide — groen (huisstijl)
  {
    block: 'border-accent/40 bg-accent-light',
    label: 'text-accent',
  },
  // 3. Gebruik oplosmethodes — rood
  {
    block: 'border-accent-2/40 bg-accent-2-light',
    label: 'text-accent-2',
  },
] as const

function ParabolaSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 130" className={cn('shrink-0', className)} aria-hidden>
      <line x1="10" y1="105" x2="212" y2="105" stroke="var(--color-text-muted)" strokeWidth="1.2" />
      <line x1="30" y1="8" x2="30" y2="124" stroke="var(--color-text-muted)" strokeWidth="1.2" />
      <path
        d="M45 125 Q115 -75 185 125"
        fill="none"
        stroke="var(--color-accent-2)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="115"
        y1="25"
        x2="115"
        y2="105"
        stroke="var(--color-accent)"
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />
      <text x="195" y="122" fontSize="13" fontStyle="italic" fill="var(--color-accent-2)">
        f
      </text>
      <text x="205" y="99" fontSize="12" fontStyle="italic" fill="var(--color-text-muted)">
        x
      </text>
      <text x="36" y="16" fontSize="12" fontStyle="italic" fill="var(--color-text-muted)">
        y
      </text>
    </svg>
  )
}

function ExampleCard({
  labels,
  compact,
}: {
  labels: StoomcursusLabels
  compact?: boolean
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 text-left sm:p-6">
      <p className="text-xs font-medium uppercase tracking-wider text-accent">
        {labels.exampleEyebrow}
      </p>
      <div
        className={cn(
          'mt-3 flex',
          compact
            ? 'flex-col items-center gap-y-3'
            : 'flex-wrap items-center gap-x-8 gap-y-3 sm:flex-nowrap',
        )}
      >
        <div className="min-w-0 w-full flex-1 text-base leading-relaxed text-text">
          <p>
            <RichMath source={labels.exampleGiven} />
          </p>
          <p className="mt-1.5 font-medium">
            <RichMath source={labels.exampleQuestion} />
          </p>
        </div>
        <ParabolaSvg className={compact ? 'h-24' : 'h-28'} />
      </div>
    </div>
  )
}

function ExplainBlock({
  part,
  index,
  className,
}: {
  part: StoomcursusPart
  index: number
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex min-h-44 flex-col justify-center rounded-2xl border p-5 text-left',
        PART_STYLES[index].block,
        className,
      )}
    >
      <p
        className={cn(
          'text-xs font-medium uppercase tracking-wider',
          PART_STYLES[index].label,
        )}
      >
        {part.title}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-text">
        <RichMath source={part.body} />
      </p>
    </div>
  )
}

/**
 * Uitklapbaar als→dan-overzicht in groepen. Gebruikt voor "Begrijp het
 * verhaaltje" (geel, zonder zichtbare `dan`) en "Gebruik oplosmethodes"
 * (rood, mét zichtbare `dan`). `accentBorder`/`accentText` kleuren het
 * stappenplan per onderdeel.
 */
function AlsDanGroepen({
  groepen,
  backMode,
  accentBorder,
  accentText,
}: {
  groepen: AlsDanGroep[]
  backMode: boolean
  accentBorder: string
  accentText: string
}) {
  return (
    <div className="mx-auto mt-10 max-w-3xl space-y-8 text-left">
      {groepen.map((groep, gi) => (
        <section
          key={groep.title}
          className={cn(!backMode && 'stoom-fade-up')}
          style={{ animationDelay: `${0.65 + gi * 0.12}s` }}
        >
          <h2 className="font-serif text-xl leading-tight text-text">
            <RichMath source={groep.title} />
          </h2>
          <div className="mt-3 divide-y divide-border rounded-2xl border border-border bg-surface px-5">
            {groep.items.map((item) => (
              <details key={item.als} className="group">
                <summary className="flex cursor-pointer list-none items-start gap-3 py-3.5 [&::-webkit-details-marker]:hidden">
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed text-text">
                      <RichMath source={item.als} />
                    </p>
                    {item.dan && (
                      <p className={cn('mt-1 text-sm font-medium leading-relaxed', accentText)}>
                        <span aria-hidden>→ </span>
                        <RichMath source={item.dan} />
                      </p>
                    )}
                  </div>
                  <span
                    aria-hidden
                    className="mt-0.5 shrink-0 text-text-muted transition-transform duration-200 group-open:rotate-90"
                  >
                    ›
                  </span>
                </summary>
                <ol className={cn('mb-4 ml-1 space-y-1.5 border-l-2 pl-4', accentBorder)}>
                  {item.stappen.map((stap, si) => (
                    <li key={stap} className="text-sm leading-relaxed text-text-muted">
                      <span className={cn('font-medium', accentText)}>{si + 1}.</span>{' '}
                      <RichMath source={stap} />
                    </li>
                  ))}
                </ol>
              </details>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

export function StoomcursusClient({
  labels,
  accountPersist,
  initialProgress,
}: {
  labels: StoomcursusLabels
  /** Ingelogd: voortgang via het account in plaats van localStorage */
  accountPersist: boolean
  initialProgress: StoomcursusProgress | null
}) {
  // Bij een ingelogde gebruiker is de beginstand meteen de accountvoortgang
  const restored = sanitizeProgress(initialProgress)
  const [step, setStep] = useState<StoomcursusStep>(restored?.step ?? 'welkom')
  const [showExample, setShowExample] = useState(!!restored)
  // Gekozen onderdeel om mee te oefenen (index in parts)
  const [chosenPart, setChosenPart] = useState<number | null>(
    restored?.part ?? null,
  )
  // Aantal uitlegblokken dat al omhoog is geschoven en zijn tegel vervangt (0..3)
  const [placed, setPlaced] = useState(restored?.placed ?? 0)
  // Het actieve uitlegblok rendert pas nadat de blokken klaar zijn met glijden
  const [activeShown, setActiveShown] = useState(!!restored)
  // Bij teruggaan glijdt het uitlegblok terug in beeld; dan geen pop-animatie
  const [backMode, setBackMode] = useState(!!restored)
  // Voortgang per onderdeel (geel/groen/rood/finale) — zie StoomcursusData
  const [moduleData, setModuleData] = useState<StoomcursusData>(
    restored?.data ?? {},
  )
  // Gele module: welke vraag/trede is open (null = tegel-overzicht), welk
  // verhaaltje de leerling koos, en of het spiekblad links is uitgeklapt.
  const [geelTrede, setGeelTrede] = useState<number | null>(null)
  const [geelKeuze, setGeelKeuze] = useState<number | null>(null)
  const [geelTak, setGeelTak] = useState<number | null>(null)
  const [geelSpiekOpen, setGeelSpiekOpen] = useState(true)
  const activeTrede = geelTrede != null ? GEEL_TREDES[geelTrede] : null
  // geelKeuze = index in TYPE_VRAAG_OPTIES; goed als dat type de open vraag dekt
  const geelGoed =
    geelKeuze != null &&
    geelTrede != null &&
    (TYPE_VRAAG_OPTIES[geelKeuze]?.tredeIndexes.includes(geelTrede) ?? false)

  // Markeer een trede als afgerond; geel is "klaar" zodra alle tredes gedaan zijn
  const markTredeGedaan = (i: number) =>
    setModuleData((d) => {
      const gedaan = d.geel?.gedaan ?? []
      if (gedaan.includes(i)) return d
      const next = [...gedaan, i]
      return {
        ...d,
        geel: {
          ...d.geel,
          gedaan: next,
          klaar: next.length >= GEEL_TREDES.length,
        },
      }
    })

  const openTrede = (i: number) =>
    rearrange(() => {
      setBackMode(false)
      setGeelTrede(i)
      setGeelKeuze(null)
      setGeelTak(null)
      setGeelSpiekOpen(false) // spiekblad klapt in zodra een vraag opent
    })

  const closeTrede = () =>
    rearrange(() => {
      setBackMode(true)
      setGeelTrede(null)
      setGeelSpiekOpen(true)
    })

  // Antwoord op "welk verhaaltje?": vastleggen + de vraag als gedaan markeren
  const beantwoordVerhaaltje = (i: number) => {
    if (geelKeuze != null || geelTrede == null) return
    setGeelKeuze(i)
    markTredeGedaan(geelTrede)
  }

  const volgendeTrede = () => {
    if (geelTrede == null) return
    if (geelTrede < GEEL_TREDES.length - 1) openTrede(geelTrede + 1)
    else closeTrede()
  }

  const goToUitleg = () =>
    rearrange(
      () => {
        setBackMode(false)
        setPlaced(0)
        setStep('uitleg')
      },
      () => setActiveShown(true),
    )

  // Het actieve blokje schuift omhoog en vervangt zijn tegel; daarna popt het volgende op
  const placeBlock = () =>
    rearrange(
      () => {
        setBackMode(false)
        setActiveShown(false)
        setPlaced((p) => p + 1)
      },
      () => setActiveShown(true),
    )

  const goToVervolg = () =>
    rearrange(() => {
      setBackMode(false)
      setStep('vervolg')
    })

  const chooseOnderdeel = (i: number) =>
    rearrange(() => {
      setBackMode(false)
      setChosenPart(i)
      setStep('oefenen')
      // Onderdeel telt vanaf nu als "bezig" op het keuzescherm
      setModuleData((d) =>
        d[PART_KEYS[i]] ? d : { ...d, [PART_KEYS[i]]: { klaar: false } },
      )
    })

  const goBack = () => {
    if (step === 'onderdelen') {
      rearrange(() => {
        setStep('welkom')
        setShowExample(false)
      })
    } else if (step === 'oefenen') {
      if (chosenPart === 0 && geelTrede != null) {
        closeTrede()
        return
      }
      rearrange(() => {
        setBackMode(true)
        setStep('vervolg')
      })
    } else if (step === 'vervolg') {
      rearrange(() => {
        setBackMode(true)
        setActiveShown(true)
        setStep('uitleg')
      })
    } else if (step === 'uitleg' && placed === 0) {
      rearrange(() => {
        setActiveShown(false)
        setStep('onderdelen')
      })
    } else if (step === 'uitleg') {
      // Het laatst geplaatste blok glijdt van zijn tegelplek terug naar beneden
      rearrange(() => {
        setBackMode(true)
        setActiveShown(true)
        setPlaced((p) => p - 1)
      })
    }
  }

  // Niet ingelogd: herstel localStorage-voortgang bij binnenkomst
  // (vóór het opslaan-effect hieronder)
  useEffect(() => {
    if (accountPersist) return
    const saved = sanitizeProgress(loadLocalProgress())
    if (!saved) return
    // Eenmalige client-restore uit localStorage: dit kán niet in een lazy
    // initializer, want localStorage bestaat niet tijdens SSR (hydration-mismatch).
    // Daarom bewust setState in dit mount-effect.
    /* eslint-disable react-hooks/set-state-in-effect */
    setStep(saved.step)
    setPlaced(saved.placed)
    setChosenPart(saved.part)
    setModuleData(saved.data)
    setShowExample(true)
    setActiveShown(true)
    setBackMode(true) // geen pop-animaties opnieuw afspelen bij herstellen
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [accountPersist])

  // Houd bij hoe ver de bezoeker in het verhaal is
  useEffect(() => {
    const progress: StoomcursusProgress = {
      step,
      placed,
      part: chosenPart,
      data: moduleData,
    }
    if (accountPersist) {
      void saveStoomcursusProgress(progress)
      return
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    } catch {
      // localStorage kan uitstaan (privémodus); voortgang dan gewoon niet bewaren
    }
  }, [accountPersist, step, placed, chosenPart, moduleData])

  useEffect(() => {
    if (step !== 'onderdelen' || showExample) return
    // Bij reduced-motion meteen tonen zonder animatie; anders na de wachttijd
    // met een view transition. In beide gevallen gebeurt de setState in de
    // timeout-callback (niet synchroon in de effect-body).
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const id = window.setTimeout(
      () => (reduced ? setShowExample(true) : rearrange(() => setShowExample(true))),
      reduced ? 0 : EXAMPLE_APPEARS_MS,
    )
    return () => window.clearTimeout(id)
  }, [step, showExample])

  return (
    <div className="relative mx-auto flex min-h-[70vh] max-w-5xl flex-col justify-center px-4 py-12">
      {step !== 'welkom' && (
        <button
          type="button"
          onClick={goBack}
          className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-text-muted transition hover:bg-surface-2 hover:text-text"
          style={{ viewTransitionName: 'stoom-terug' }}
        >
          <span aria-hidden>←</span>
          {labels.back}
        </button>
      )}
      {step === 'welkom' && (
        <div className="text-center">
          <p className="stoom-fade-up text-sm font-medium uppercase tracking-wider text-accent">
            {labels.eyebrow}
          </p>
          <h1
            className="stoom-pop mx-auto mt-6 max-w-2xl font-serif text-3xl leading-snug text-text sm:text-4xl"
            style={{ animationDelay: '0.25s' }}
          >
            {labels.welcome}
          </h1>
          <div className="stoom-fade-up mt-10" style={{ animationDelay: '1.1s' }}>
            <button
              type="button"
              onClick={() => setStep('onderdelen')}
              className="rounded-lg bg-accent px-8 py-3 text-base font-medium text-white shadow-sm transition hover:bg-accent/90"
            >
              {labels.start}
            </button>
          </div>
        </div>
      )}

      {step === 'onderdelen' && (
        <div className="text-center">
          <p className="stoom-fade-up text-sm font-medium uppercase tracking-wider text-accent">
            {labels.eyebrow}
          </p>
          <h1 className="stoom-fade-up mx-auto mt-4 max-w-2xl font-serif text-3xl leading-snug text-text sm:text-4xl">
            {labels.partsIntro}
          </h1>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {labels.parts.map((part, i) => (
              <div
                key={part.title}
                className={cn(
                  'flex min-h-44 flex-col items-center justify-center gap-3 rounded-2xl border p-6',
                  // Het pop-filmpje speelt alleen de eerste keer, niet bij teruggaan
                  !showExample && 'stoom-block-pop',
                  PART_STYLES[i].block,
                )}
                style={{
                  animationDelay: `${BLOCK_POP_DELAY(i)}s`,
                  viewTransitionName: `stoom-part-${i}`,
                }}
              >
                <span
                  className={cn(
                    'text-xs font-medium uppercase tracking-wider',
                    PART_STYLES[i].label,
                  )}
                >
                  {part.label}
                </span>
                <span className="font-serif text-2xl leading-tight text-text">
                  {part.title}
                </span>
              </div>
            ))}
          </div>

          {showExample && (
            <div className="mx-auto mt-10 max-w-2xl">
              <div style={{ viewTransitionName: 'stoom-opgave' }}>
                <ExampleCard labels={labels} />
              </div>
              <p className="mt-6 font-serif text-xl text-text">{labels.howSolve}</p>
              <button
                type="button"
                onClick={goToUitleg}
                className="mt-4 rounded-lg bg-accent px-8 py-3 text-base font-medium text-white shadow-sm transition hover:bg-accent/90"
                style={{ viewTransitionName: 'stoom-next' }}
              >
                {labels.next}
              </button>
            </div>
          )}
        </div>
      )}

      {step === 'uitleg' && (
        <div>
          <div className="grid gap-4 md:grid-cols-3 md:items-stretch">
            {/* Rij 1: de drie tegels als slots; geplaatste uitlegblokken vervangen hun tegel */}
            {labels.parts.map((part, i) =>
              i < placed ? (
                <div key={part.title} style={{ viewTransitionName: `stoom-uitleg-${i}` }}>
                  <ExplainBlock part={part} index={i} className="h-full" />
                </div>
              ) : (
                <div
                  key={part.title}
                  className={cn(
                    'flex min-h-44 flex-col items-center justify-center gap-3 rounded-2xl border p-6 text-center',
                    PART_STYLES[i].block,
                  )}
                  style={{ viewTransitionName: `stoom-part-${i}` }}
                >
                  <span
                    className={cn(
                      'text-xs font-medium uppercase tracking-wider',
                      PART_STYLES[i].label,
                    )}
                  >
                    {part.label}
                  </span>
                  <span className="font-serif text-2xl leading-tight text-text">
                    {part.title}
                  </span>
                </div>
              ),
            )}

            {/* Rij 2: de opgave links (onder geel), het actieve blokje in het midden */}
            <div style={{ viewTransitionName: 'stoom-opgave' }}>
              <ExampleCard labels={labels} compact />
            </div>

            {/* Popt op nadat het glijden klaar is; bij teruggaan glijdt het
                geplaatste blok vanaf zijn tegelplek hierheen terug. Tijdens
                het glijden alvast onzichtbaar gerenderd, zodat de verticaal
                gecentreerde layout niet verspringt zodra het verschijnt. */}
            {placed < labels.parts.length && (
              <div
                key={placed}
                className={cn(
                  activeShown ? !backMode && 'stoom-pop' : 'invisible',
                )}
                style={{ viewTransitionName: `stoom-uitleg-${placed}` }}
              >
                <ExplainBlock part={labels.parts[placed]} index={placed} className="h-full" />
              </div>
            )}

            {/* Als alle drie geplaatst zijn: pijl onder groen, antwoord onder rood */}
            {placed === labels.parts.length && (
              <>
                <div
                  className={cn(
                    activeShown ? !backMode && 'stoom-pop' : 'invisible',
                    'flex items-center justify-center',
                  )}
                  aria-hidden
                >
                  <span className="font-serif text-5xl text-text-muted max-md:rotate-90">
                    →
                  </span>
                </div>
                <div
                  className={cn(
                    activeShown ? !backMode && 'stoom-pop' : 'invisible',
                  )}
                  style={{
                    viewTransitionName: 'stoom-antwoord',
                    animationDelay: activeShown && !backMode ? '0.3s' : undefined,
                  }}
                >
                  <div className="flex h-full min-h-44 flex-col justify-center rounded-2xl border border-border bg-surface p-5 text-left">
                    <p className="text-xs font-medium uppercase tracking-wider text-accent">
                      {labels.answerEyebrow}
                    </p>
                    <p className="mt-2 text-base leading-relaxed text-text">
                      <RichMath source={labels.answerBody} />
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="mt-8 text-center">
            <button
              type="button"
              disabled={!activeShown}
              onClick={placed < labels.parts.length ? placeBlock : goToVervolg}
              className={cn(
                activeShown ? !backMode && 'stoom-fade-up' : 'invisible',
                'rounded-lg bg-accent px-8 py-3 text-base font-medium text-white shadow-sm transition hover:bg-accent/90',
              )}
              style={{ viewTransitionName: 'stoom-next', animationDelay: '0.5s' }}
            >
              {labels.next}
            </button>
          </div>
        </div>
      )}

      {step === 'vervolg' && (
        <div className="text-center">
          <p
            className={cn(
              !backMode && 'stoom-fade-up',
              'text-sm font-medium uppercase tracking-wider text-accent',
            )}
          >
            {labels.eyebrow}
          </p>
          <h1
            className={cn(
              !backMode && 'stoom-pop',
              'mx-auto mt-4 max-w-2xl font-serif text-3xl leading-snug text-text sm:text-4xl',
            )}
            style={{ animationDelay: '0.15s' }}
          >
            {labels.methodTitle}
          </h1>
          <p
            className={cn(
              !backMode && 'stoom-fade-up',
              'mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-text-muted',
            )}
            style={{ animationDelay: '0.45s' }}
          >
            {labels.methodBody}
          </p>
          <p
            className={cn(
              !backMode && 'stoom-fade-up',
              'mt-10 font-serif text-xl text-text',
            )}
            style={{ animationDelay: '0.75s' }}
          >
            {labels.choosePrompt}
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {labels.parts.map((part, i) => {
              const voortgang = moduleData[PART_KEYS[i]]
              const statusTekst = voortgang?.klaar
                ? labels.hubStatusKlaar
                : voortgang
                  ? labels.hubStatusBezig
                  : labels.hubStatusNieuw
              return (
                <button
                  key={part.title}
                  type="button"
                  onClick={() => chooseOnderdeel(i)}
                  className={cn(
                    !backMode && 'stoom-fade-up',
                    'flex min-h-44 flex-col items-center justify-center gap-3 rounded-2xl border p-6 text-center transition hover:-translate-y-1 hover:shadow-md',
                    PART_STYLES[i].block,
                  )}
                  style={{
                    animationDelay: `${0.95 + i * 0.15}s`,
                    viewTransitionName: `stoom-part-${i}`,
                  }}
                >
                  <span
                    className={cn(
                      'text-xs font-medium uppercase tracking-wider',
                      PART_STYLES[i].label,
                    )}
                  >
                    {part.label}
                  </span>
                  <span className="font-serif text-2xl leading-tight text-text">
                    {part.title}
                  </span>
                  <span
                    className={cn(
                      'text-xs font-medium',
                      voortgang?.klaar ? 'text-accent' : 'text-text-muted',
                    )}
                  >
                    {statusTekst}
                  </span>
                </button>
              )
            })}

            {/* Vooruitblik op fase 3: ontgrendelt na alle drie de onderdelen */}
            <div
              className={cn(
                !backMode && 'stoom-fade-up',
                'flex min-h-24 flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-border bg-surface-2/60 p-6 sm:col-span-3',
              )}
              style={{ animationDelay: '1.45s' }}
            >
              <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
                <span aria-hidden>🔒 </span>
                {labels.hubFinaleTitle}
              </span>
              <span className="text-sm text-text-muted">
                {PART_KEYS.every((k) => moduleData[k]?.klaar)
                  ? labels.hubFinaleSoon
                  : labels.hubFinaleLocked}
              </span>
            </div>
          </div>
        </div>
      )}

      {step === 'oefenen' && chosenPart === 0 && (
        <div className="mx-auto w-full max-w-5xl">
          <p
            className={cn(
              !backMode && 'stoom-fade-up',
              'text-center text-sm font-medium uppercase tracking-wider',
              PART_STYLES[0].label,
            )}
          >
            {labels.parts[0].title}
          </p>
          <h1
            className={cn(
              !backMode && 'stoom-pop',
              'mx-auto mt-3 max-w-2xl text-center font-serif text-3xl leading-snug text-text sm:text-4xl',
            )}
            style={{ animationDelay: '0.15s' }}
          >
            Van vraag naar stappenplan
          </h1>
          {!activeTrede && (
            <p
              className={cn(
                !backMode && 'stoom-fade-up',
                'mx-auto mt-4 max-w-2xl text-center text-base leading-relaxed text-text-muted',
              )}
              style={{ animationDelay: '0.35s' }}
            >
              Kies een vraag. Eerst bepaal je welk verhaaltje erbij hoort, daarna
              schrijf je het stappenplan. Het spiekblad links helpt je op weg.
            </p>
          )}

          <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-start">
            {/* LINKS: spiekblad — klapt in zodra een vraag open is */}
            <aside
              className={cn(
                'shrink-0 lg:sticky lg:top-4',
                activeTrede ? 'lg:w-60' : 'lg:w-72',
              )}
            >
              <div
                className={cn('rounded-2xl border p-4 text-left', PART_STYLES[0].block)}
              >
                <button
                  type="button"
                  onClick={() => setGeelSpiekOpen((o) => !o)}
                  className="flex w-full items-center justify-between gap-2"
                >
                  <span
                    className={cn(
                      'text-xs font-semibold uppercase tracking-wider',
                      PART_STYLES[0].label,
                    )}
                  >
                    Spiekblad
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      'shrink-0 text-text-muted transition-transform duration-200',
                      geelSpiekOpen && 'rotate-90',
                    )}
                  >
                    ›
                  </span>
                </button>
                {geelSpiekOpen && (
                  <>
                    <p className="mt-1 text-xs text-text-muted">
                      De mogelijke types vraag — alleen wat er gevraagd kán worden.
                    </p>
                    <ol className="mt-3 space-y-1.5">
                      {TYPE_VRAAG_OPTIES.map((optie, i) => (
                        <li
                          key={optie.label}
                          className="flex items-start gap-2 text-xs leading-relaxed text-text"
                        >
                          <span
                            className={cn('shrink-0 font-medium', PART_STYLES[0].label)}
                          >
                            {i + 1}.
                          </span>
                          <RichMath source={optie.label} />
                        </li>
                      ))}
                    </ol>
                  </>
                )}
              </div>
            </aside>

            {/* RECHTS: tegels (overzicht) of de geopende vraag */}
            <div className="min-w-0 flex-1">
              {!activeTrede ? (
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {ZICHTBARE_TREDES.map(({ trede, index }) => {
                    const gedaan = (moduleData.geel?.gedaan ?? []).includes(index)
                    return (
                      <li key={trede.titel}>
                        <button
                          type="button"
                          onClick={() => openTrede(index)}
                          className={cn(
                            'flex min-h-[6.75rem] w-full flex-col rounded-xl border px-3 py-3 text-left transition',
                            gedaan
                              ? 'border-[#e2c25c]/70 bg-[#fbf3d8] hover:border-[#e2c25c]'
                              : 'border-border bg-surface hover:bg-surface-2',
                          )}
                        >
                          <span className="flex items-center justify-between">
                            <span className="text-xs font-medium text-text-muted">
                              #{index + 1}
                            </span>
                            {gedaan && (
                              <span aria-hidden className="text-xs text-[#8a6a14]">
                                ✓
                              </span>
                            )}
                          </span>
                          <span className="mt-2 line-clamp-4 text-xs leading-relaxed text-text">
                            <RichMath source={trede.oefening.vraag} />
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <div>
                  {/* De vraag */}
                  <div className="rounded-2xl border border-border bg-surface p-5 text-left">
                    <p className="text-xs text-text-muted">
                      {activeTrede.oefening.bron}
                    </p>
                    <p className="mt-2 text-base leading-relaxed text-text">
                      <RichMath source={activeTrede.oefening.vraag} />
                    </p>
                  </div>

                  {/* Welk verhaaltje hoort erbij? → daarna meteen het stappenplan */}
                  <div className="mt-5 text-left">
                    <p className="font-serif text-lg text-text">Type vraag</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {TYPE_VRAAG_OPTIES.map((optie, oi) => {
                        const beantwoord = geelKeuze != null
                        const juist =
                          geelTrede != null &&
                          optie.tredeIndexes.includes(geelTrede)
                        const gekozen = oi === geelKeuze
                        return (
                          <button
                            key={optie.label}
                            type="button"
                            disabled={beantwoord}
                            onClick={() => beantwoordVerhaaltje(oi)}
                            className={cn(
                              'rounded-full border px-2.5 py-1 text-xs transition',
                              !beantwoord &&
                                'border-[#e2c25c]/50 bg-surface/70 text-text hover:border-[#e2c25c] hover:bg-surface',
                              beantwoord &&
                                juist &&
                                'border-[#e2c25c] bg-[#fbf3d8] text-[#8a6a14]',
                              beantwoord &&
                                gekozen &&
                                !juist &&
                                'border-accent-2 bg-accent-2-light text-accent-2',
                              beantwoord &&
                                !juist &&
                                !gekozen &&
                                'border-border bg-surface text-text-muted opacity-50',
                            )}
                          >
                            <RichMath source={optie.label} />
                          </button>
                        )
                      })}
                    </div>

                    {geelKeuze != null && (
                      <div className="stoom-fade-up mt-4">
                        <p
                          className={cn(
                            'text-sm font-semibold',
                            geelGoed ? 'text-[#8a6a14]' : 'text-accent-2',
                          )}
                        >
                          {geelGoed ? 'Goed!' : 'Niet helemaal!'}
                        </p>

                        {/* Vertakking (keuzeboom) als die er is, anders het platte
                            algemene stappenplan — steeds zonder concrete getallen */}
                        {activeTrede.takken ? (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-text">
                              {activeTrede.takken.vraag}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {activeTrede.takken.opties.map((tak, ti) => (
                                <button
                                  key={tak.keuze}
                                  type="button"
                                  onClick={() => setGeelTak(ti)}
                                  className={cn(
                                    'rounded-full border px-2.5 py-1 text-xs transition',
                                    geelTak === ti
                                      ? 'border-[#e2c25c] bg-[#fbf3d8] text-[#8a6a14]'
                                      : 'border-[#e2c25c]/50 bg-surface/70 text-text hover:border-[#e2c25c] hover:bg-surface',
                                  )}
                                >
                                  {tak.keuze}
                                </button>
                              ))}
                            </div>
                            {geelTak != null && (
                              <div
                                className={cn(
                                  'stoom-fade-up mt-3 rounded-xl border bg-[#fbf3d8]/60 p-4',
                                  GEEL_BORDER,
                                )}
                              >
                                <p
                                  className={cn(
                                    'text-xs font-medium uppercase tracking-wider',
                                    PART_STYLES[0].label,
                                  )}
                                >
                                  Stappenplan
                                </p>
                                <ol className="mt-2 space-y-1.5">
                                  {activeTrede.takken.opties[geelTak].stappen.map(
                                    (stap, si) => (
                                      <li
                                        key={si}
                                        className="text-sm leading-relaxed text-text"
                                      >
                                        <span
                                          className={cn(
                                            'font-medium',
                                            PART_STYLES[0].label,
                                          )}
                                        >
                                          {si + 1}.
                                        </span>{' '}
                                        <RichMath source={stap} />
                                      </li>
                                    ),
                                  )}
                                </ol>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div
                            className={cn(
                              'mt-3 rounded-xl border bg-[#fbf3d8]/60 p-4',
                              GEEL_BORDER,
                            )}
                          >
                            <p
                              className={cn(
                                'text-xs font-medium uppercase tracking-wider',
                                PART_STYLES[0].label,
                              )}
                            >
                              Stappenplan
                            </p>
                            <ol className="mt-2 space-y-1.5">
                              {activeTrede.stappen.map((stap, si) => (
                                <li
                                  key={si}
                                  className="text-sm leading-relaxed text-text"
                                >
                                  <span
                                    className={cn(
                                      'font-medium',
                                      PART_STYLES[0].label,
                                    )}
                                  >
                                    {si + 1}.
                                  </span>{' '}
                                  <RichMath source={stap} />
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}

                        <div className="mt-8 flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            onClick={closeTrede}
                            className="rounded-lg border border-border px-6 py-3 text-sm text-text transition hover:bg-surface-2"
                          >
                            Terug naar overzicht
                          </button>
                          <button
                            type="button"
                            onClick={volgendeTrede}
                            className="rounded-lg bg-accent px-8 py-3 text-base font-medium text-white shadow-sm transition hover:bg-accent/90"
                          >
                            {(geelTrede ?? 0) < GEEL_TREDES.length - 1
                              ? 'Volgende vraag'
                              : 'Klaar'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rood (onderdeel 3): als→dan-overzicht van oplosmethodes */}
      {step === 'oefenen' && chosenPart === 2 && (
        <div className="text-center">
          <p
            className={cn(
              !backMode && 'stoom-fade-up',
              'text-sm font-medium uppercase tracking-wider',
              PART_STYLES[2].label,
            )}
          >
            {labels.parts[2].title}
          </p>
          <h1
            className={cn(
              !backMode && 'stoom-pop',
              'mx-auto mt-4 max-w-2xl font-serif text-3xl leading-snug text-text sm:text-4xl',
            )}
            style={{ animationDelay: '0.15s' }}
          >
            {labels.oplosTitle}
          </h1>
          <p
            className={cn(
              !backMode && 'stoom-fade-up',
              'mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-text-muted',
            )}
            style={{ animationDelay: '0.45s' }}
          >
            {labels.oplosIntro}
          </p>
          <AlsDanGroepen
            groepen={labels.oplosGroepen}
            backMode={backMode}
            accentBorder="border-accent-2/50"
            accentText="text-accent-2"
          />
        </div>
      )}

      {/* Groen (onderdeel 2): als→dan-overzicht van rekenregels */}
      {step === 'oefenen' && chosenPart === 1 && (
        <div className="text-center">
          <p
            className={cn(
              !backMode && 'stoom-fade-up',
              'text-sm font-medium uppercase tracking-wider',
              PART_STYLES[1].label,
            )}
          >
            {labels.parts[1].title}
          </p>
          <h1
            className={cn(
              !backMode && 'stoom-pop',
              'mx-auto mt-4 max-w-2xl font-serif text-3xl leading-snug text-text sm:text-4xl',
            )}
            style={{ animationDelay: '0.15s' }}
          >
            {labels.groenTitle}
          </h1>
          <p
            className={cn(
              !backMode && 'stoom-fade-up',
              'mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-text-muted',
            )}
            style={{ animationDelay: '0.45s' }}
          >
            {labels.groenIntro}
          </p>
          <AlsDanGroepen
            groepen={labels.groenGroepen}
            backMode={backMode}
            accentBorder="border-accent/50"
            accentText="text-accent"
          />
        </div>
      )}
    </div>
  )
}
