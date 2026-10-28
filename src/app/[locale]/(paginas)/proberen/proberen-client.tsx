'use client'

import { useRef, useState, useTransition } from 'react'

import { DeelKnop } from '@/components/deel-knop'
import { GoogleKnop } from '@/components/google-knop'
import { MathKeyboard } from '@/components/math-keyboard'
import { Math as TeX, RichMath } from '@/components/math'
import { Button } from '@/components/ui'
import { Link } from '@/i18n/navigation'
import { answerPrefix } from '@/lib/practice/answer-prefix'
import { insertAtCursor, toLatexPreview } from '@/lib/practice/input'
import type { ProefOpgave } from '@/lib/practice/proberen-laden'
import { oefenenVanProberen, type ProefSelectie } from '@/lib/practice/proberen'

import { nakijkProefopgave, type ProefUitslag } from './actions'

type Stap = { id: string; step_order: number; step_description: string }

type Fase =
  | { soort: 'invoer'; melding: string | null }
  | { soort: 'goed'; latex: string; stappen: Stap[] }
  | {
      soort: 'fout'
      eigen: string
      latex: string
      stappen: Stap[]
      zichtbaar: boolean
    }
  | { soort: 'overgeslagen'; latex: string; stappen: Stap[] }

function metVoorvoegsel(prefix: string, rest: string): string {
  return prefix ? `${prefix} ${rest}` : rest
}

function toonLatex(latexAntwoord: string | null, antwoord: string): string {
  return (latexAntwoord ?? antwoord).replaceAll('$', '')
}

export function ProberenClient({
  titel,
  opgaven,
  selectie,
  googleAan,
}: {
  titel: string
  opgaven: ProefOpgave[]
  selectie: ProefSelectie
  googleAan: boolean
}) {
  const [index, setIndex] = useState(0)
  const [klaar, setKlaar] = useState(false)
  const [antwoord, setAntwoord] = useState('')
  const [fase, setFase] = useState<Fase>({ soort: 'invoer', melding: null })
  const [bezig, setBezig] = useState(false)
  const [, startTransition] = useTransition()
  const invoerRef = useRef<HTMLInputElement | null>(null)

  const opgave = opgaven[index]
  const prefix = answerPrefix(opgave?.latexBody ?? null, opgave?.answerPrefix)
  const laatste = index >= opgaven.length - 1

  function verstuur(opvragen: boolean) {
    if (!opgave || fase.soort !== 'invoer' || bezig) return
    if (!opvragen && !antwoord.trim()) return

    setBezig(true)
    const ingevuld = antwoord
    startTransition(async () => {
      const resultaat: ProefUitslag = await nakijkProefopgave({
        chapter: selectie.chapter,
        topic: selectie.topic,
        cluster: selectie.cluster,
        questionId: opgave.id,
        antwoord: ingevuld,
        opvragen,
      })
      setBezig(false)
      if (resultaat.kind === 'melding') {
        setFase({ soort: 'invoer', melding: resultaat.tekst })
        return
      }
      const latex = toonLatex(resultaat.latexAntwoord, resultaat.antwoord)
      if (resultaat.kind === 'goed') {
        setFase({ soort: 'goed', latex, stappen: resultaat.stappen })
        return
      }
      if (resultaat.kind === 'overgeslagen') {
        setFase({ soort: 'overgeslagen', latex, stappen: resultaat.stappen })
        return
      }
      setFase({
        soort: 'fout',
        eigen: ingevuld,
        latex,
        stappen: resultaat.stappen,
        zichtbaar: false,
      })
    })
  }

  function opnieuw() {
    setAntwoord('')
    setFase({ soort: 'invoer', melding: null })
    requestAnimationFrame(() => invoerRef.current?.focus())
  }

  function volgende() {
    if (!laatste) {
      setIndex(index + 1)
      setAntwoord('')
      setFase({ soort: 'invoer', melding: null })
      return
    }
    setKlaar(true)
  }

  function toets(tekst: string) {
    const el = invoerRef.current
    const start = el?.selectionStart ?? antwoord.length
    const end = el?.selectionEnd ?? antwoord.length
    const { value, caret } = insertAtCursor(antwoord, start, end, tekst)
    setAntwoord(value)
    requestAnimationFrame(() => {
      if (invoerRef.current) {
        invoerRef.current.focus()
        invoerRef.current.setSelectionRange(caret, caret)
      }
    })
  }

  if (klaar) {
    const oefenpad = oefenenVanProberen(selectie)
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-sm font-medium uppercase tracking-wider text-accent">
          Proberen
        </p>
        <h1 className="mt-2 font-serif text-4xl text-text">Goed bezig!</h1>
        <p className="mt-6 text-lg text-text">
          Maak een gratis account om je voortgang te bewaren en verder te oefenen
        </p>
        <div className="mt-8 max-w-sm">
          {googleAan && <GoogleKnop oefenpad={oefenpad} />}
          <div className="flex flex-wrap items-start gap-3">
            <Link
              href="/registreren?van=proberen"
              data-meet="proefsom-registreren"
              className={
                googleAan
                  ? 'inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-surface px-5 py-3 text-sm font-medium text-text shadow-sm hover:bg-surface-2'
                  : 'inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-accent/90'
              }
            >
              Account aanmaken
            </Link>
            <DeelKnop />
          </div>
        </div>
      </div>
    )
  }

  if (!opgave) return null

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-sm font-medium uppercase tracking-wider text-accent">Proberen</p>
      <h1 className="mt-2 font-serif text-4xl text-text">{titel}</h1>
      <p className="mt-3 text-text-muted">
        Som {index + 1} van {opgaven.length}. Dit wordt niet opgeslagen.
      </p>

      <div className="mt-8 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="mb-6 min-w-0 overflow-x-auto font-serif text-2xl leading-snug text-text">
          {opgave.latexBody?.includes('$') ? (
            <RichMath source={opgave.latexBody} />
          ) : (
            <TeX tex={opgave.latexBody ?? ''} displayMode wrap />
          )}
        </div>

        {fase.soort === 'invoer' && (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              verstuur(false)
            }}
            className="space-y-3"
          >
            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-wide text-text-muted">
                Jouw antwoord
              </span>
              <div className="mb-2 min-h-8 overflow-x-auto font-serif text-2xl text-accent">
                <TeX
                  tex={metVoorvoegsel(
                    prefix,
                    antwoord.trim() ? toLatexPreview(antwoord) : '\\ldots',
                  )}
                  wrap
                />
              </div>
              <input
                ref={invoerRef}
                value={antwoord}
                onChange={(e) => setAntwoord(e.target.value)}
                placeholder="Typ je antwoord"
                disabled={bezig}
                className="w-full rounded-lg border border-border bg-surface px-4 py-3 font-mono text-lg text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                inputMode="text"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                autoFocus
              />
              <MathKeyboard onInsert={toets} disabled={bezig} />
            </label>

            {fase.melding && (
              <p className="text-sm text-accent-2" role="alert">
                {fase.melding}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="submit"
                data-meet="proefsom-nakijken"
                className="min-h-11 px-5"
                disabled={bezig || !antwoord.trim()}
              >
                Nakijken
              </Button>
              <Button
                type="button"
                variant="secondary"
                data-meet="proefsom-weet-ik-niet"
                className="min-h-11 px-5"
                disabled={bezig}
                onClick={() => verstuur(true)}
              >
                Ik weet het niet
              </Button>
            </div>
            {bezig && (
              <p className="text-sm text-text-muted" role="status">
                Even nakijken…
              </p>
            )}
          </form>
        )}

        {fase.soort === 'goed' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-accent/30 bg-accent-light p-4">
              <p className="font-serif text-xl text-accent">Goed!</p>
              <div className="mt-2 overflow-x-auto font-serif text-2xl text-accent">
                <TeX tex={metVoorvoegsel(prefix, fase.latex)} wrap />
              </div>
            </div>
            <Stappenplan stappen={fase.stappen} />
            <Verder laatste={laatste} onVolgende={volgende} onOpnieuw={opnieuw} />
          </div>
        )}

        {fase.soort === 'fout' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-accent-2/40 bg-accent-2-light p-4">
              <p className="font-serif text-xl text-accent-2">Niet helemaal goed</p>
              {fase.eigen.trim() && (
                <p className="mt-2 text-sm text-accent-2">
                  Jouw antwoord:{' '}
                  <span className="font-serif text-lg">
                    <TeX tex={toLatexPreview(fase.eigen)} wrap />
                  </span>
                </p>
              )}
            </div>
            {fase.zichtbaar ? (
              <>
                <Juist prefix={prefix} latex={fase.latex} />
                <Stappenplan stappen={fase.stappen} />
                <Verder laatste={laatste} onVolgende={volgende} onOpnieuw={opnieuw} />
              </>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  data-meet="proefsom-opnieuw"
                  className="min-h-11 px-5"
                  onClick={opnieuw}
                >
                  Opnieuw proberen
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  data-meet="proefsom-antwoord-zien"
                  className="min-h-11 px-5"
                  onClick={() => setFase({ ...fase, zichtbaar: true })}
                >
                  Laat het goede antwoord zien
                </Button>
              </div>
            )}
          </div>
        )}

        {fase.soort === 'overgeslagen' && (
          <div className="space-y-4">
            <p className="text-sm text-text-muted">
              Je hebt het antwoord opgevraagd. Er wordt niets bewaard.
            </p>
            <Juist prefix={prefix} latex={fase.latex} />
            <Stappenplan stappen={fase.stappen} />
            <Verder laatste={laatste} onVolgende={volgende} onOpnieuw={opnieuw} />
          </div>
        )}

        {index === 0 && fase.soort !== 'invoer' && (
          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4">
            <p className="text-sm text-text-muted">
              Handig voor de toetsweek: je klasgenoten kunnen deze proefsom ook maken.
            </p>
            <DeelKnop compact />
          </div>
        )}
      </div>
    </div>
  )
}

function Juist({ prefix, latex }: { prefix: string; latex: string }) {
  return (
    <div className="rounded-xl border border-accent/30 bg-accent-light px-5 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-accent/80">
        Juiste antwoord
      </p>
      <div className="mt-1 overflow-x-auto font-serif text-2xl text-accent">
        <TeX tex={metVoorvoegsel(prefix, latex)} wrap />
      </div>
    </div>
  )
}

function Stappenplan({ stappen }: { stappen: Stap[] }) {
  const geordend = [...stappen].sort((a, b) => a.step_order - b.step_order)
  if (!geordend.length) {
    return (
      <p className="text-sm text-text-muted">
        Bij deze opgave staat nog geen stappenplan klaar.
      </p>
    )
  }
  return (
    <div className="rounded-lg border border-border bg-white/90">
      <p className="px-4 py-3 text-sm font-semibold text-text">
        Stappenplan: zo hoort het stap voor stap
      </p>
      <ol className="list-none space-y-1 border-t border-border px-3 py-3 text-sm text-text">
        {geordend.map((stap) => (
          <li key={stap.id} className="flex items-start gap-3 px-3 py-2 leading-relaxed">
            <span className="min-w-[1.25rem] shrink-0 font-semibold tabular-nums text-accent">
              {stap.step_order}.
            </span>
            <span className="min-w-0">
              <RichMath source={stap.step_description} />
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}

function Verder({
  laatste,
  onVolgende,
  onOpnieuw,
}: {
  laatste: boolean
  onVolgende: () => void
  onOpnieuw: () => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        type="button"
        data-meet={laatste ? 'proefsom-klaar' : 'proefsom-volgende'}
        className="min-h-11 px-5"
        onClick={onVolgende}
      >
        {laatste ? 'Klaar' : 'Volgende som'}
      </Button>
      <Button
        type="button"
        variant="secondary"
        data-meet="proefsom-opnieuw"
        className="min-h-11 px-5"
        onClick={onOpnieuw}
      >
        Opnieuw proberen
      </Button>
    </div>
  )
}
