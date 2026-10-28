'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'

import { GoogleKnop } from '@/components/google-knop'
import { MathKeyboard } from '@/components/math-keyboard'
import { Math as TeX, RichMath } from '@/components/math'
import { Badge, Button } from '@/components/ui'
import { Link } from '@/i18n/navigation'
import { insertAtCursor, toLatexPreview } from '@/lib/practice/input'
import { proefsomKlopt, type Proefsom } from '@/lib/practice/proefsom'

type Difficulty = Proefsom

type State =
  | { phase: 'input'; error: string | null }
  | { phase: 'correct' }
  | { phase: 'wrong'; studentAnswer: string }

type QuestionConfig = {
  difficulty: 1 | 2 | 3
  correctLatex: string
}

/** Drie sommen van dezelfde soort als de makkelijke proefsom: een polynoom. */
const DRIE_SOMMEN =
  '/proberen?chapter=h2&topic=h2_termsgewijs&cluster=polynoom_differentieren'

const QUESTIONS: Record<Difficulty, QuestionConfig> = {
  easy: {
    difficulty: 1,
    correctLatex: '6x + 5',
  },
  medium: {
    difficulty: 2,
    correctLatex: '3\\cos(3x)',
  },
  hard: {
    difficulty: 3,
    correctLatex: '(x^2 + 2x)e^x',
  },
}

/**
 * Verschijnt direct na het nakijken (AFG-657): op 25 oktober klikten alle
 * bezoekers die nakeken door naar "drie sommen", maar niemand registreerde.
 * Deze CTA zet Google-aanmelden bovenaan, met e-mail eronder.
 */
function BewaarVoortgang({ googleAan }: { googleAan: boolean }) {
  const t = useTranslations('HomeDemo')
  return (
    <div className="mt-3 rounded-xl border border-border bg-surface p-4">
      <p className="font-serif text-lg text-text">{t('bewaarTitle')}</p>
      <div className="mt-3 max-w-sm">
        {googleAan && (
          <GoogleKnop oefenpad={null} dataMeet="home-proefsom-bewaar-google" />
        )}
        <Link
          href="/registreren?van=proefsom"
          data-meet="home-proefsom-bewaar-email"
          className={
            googleAan
              ? 'inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-border bg-surface px-5 py-3 text-sm font-medium text-text shadow-sm hover:bg-surface-2'
              : 'inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-accent px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-accent/90'
          }
        >
          {t('bewaarEmail')}
        </Link>
      </div>
    </div>
  )
}

function DemoCard({
  difficulty,
  onSubmit,
  googleAan,
}: {
  difficulty: Difficulty
  onSubmit: () => void
  googleAan: boolean
}) {
  const t = useTranslations('HomeDemo')
  const q = QUESTIONS[difficulty]
  const [answer, setAnswer] = useState('')
  const [state, setState] = useState<State>({ phase: 'input', error: null })
  const inputRef = useRef<HTMLInputElement | null>(null)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!answer.trim() || state.phase !== 'input') return
    onSubmit()
    if (proefsomKlopt(difficulty, answer)) {
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

  const tone = q.difficulty === 1 ? 'accent' : q.difficulty === 2 ? 'warn' : 'danger'

  return (
    /**
     * `animate-mastered-flash` (AFG-666): een klik op het niveau remount deze
     * kaart altijd (ook bij herklik op het al actieve niveau, AFG-548), maar
     * bij een lege invoer ziet de nieuwe kaart er dan identiek uit aan de
     * vorige — geen zichtbare reactie op de klik, vandaar de woedeklikken.
     * Deze flash maakt elke klik zichtbaar, ongeacht of de inhoud verandert.
     */
    <div className="animate-mastered-flash rounded-2xl border-2 border-accent/30 bg-surface p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Badge tone={tone}>
          {t(`difficulty${q.difficulty}` as 'difficulty1')}
        </Badge>
      </div>

      <div className="mb-6 font-serif text-2xl leading-snug text-text">
        <RichMath source={t(`${difficulty}Question` as 'easyQuestion')} />
      </div>

      {state.phase === 'input' && (
        <form onSubmit={submit} className="space-y-3">
          <label className="block">
            <div className="mb-2 flex min-h-8 items-center gap-2">
              <span className="text-xs uppercase tracking-wide text-text-muted">
                {t('studentAnswer')}
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
              placeholder={t(`${difficulty}Placeholder` as 'easyPlaceholder')}
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 font-mono text-lg text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              inputMode="text"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
            />
            <MathKeyboard onInsert={handleKey} />
          </label>

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={!answer.trim()}
              data-meet="home-proefsom-nakijken"
              className="min-h-11 px-5"
            >
              {t('submit')}
            </Button>
            <span className="text-xs text-text-muted">{t('hint')}</span>
          </div>
        </form>
      )}

      {state.phase === 'correct' && (
        <>
          <div className="rounded-xl border border-accent/30 bg-accent-light p-4">
            <p className="font-serif text-xl text-accent">{t('correctTitle')}</p>
            <p className="mt-1 text-sm text-accent">{t('correctBody')}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link
                href={DRIE_SOMMEN}
                data-meet="home-proefsom-drie-sommen"
                className="inline-flex min-h-11 items-center rounded-lg bg-accent px-5 py-2.5 font-medium text-white shadow-sm transition hover:bg-accent/90"
              >
                {t('correctCta')}
              </Link>
              <button
                type="button"
                onClick={retry}
                data-meet="home-proefsom-opnieuw"
                className="inline-flex min-h-11 items-center rounded-lg border border-accent/40 bg-white/70 px-4 py-2 text-sm font-medium text-accent transition hover:bg-white"
              >
                {t('tryAnother')}
              </button>
            </div>
          </div>
          <BewaarVoortgang googleAan={googleAan} />
        </>
      )}

      {state.phase === 'wrong' && (
        <>
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
                  <TeX tex={q.correctLatex} />
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
                      <RichMath source={t(`${difficulty}Step${n}` as 'easyStep1')} />
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link
                href={DRIE_SOMMEN}
                data-meet="home-proefsom-drie-sommen"
                className="inline-flex min-h-11 items-center rounded-lg bg-accent px-5 py-2.5 font-medium text-white shadow-sm transition hover:bg-accent/90"
              >
                {t('wrongCta')}
              </Link>
              <button
                type="button"
                onClick={retry}
                data-meet="home-proefsom-opnieuw"
                className="inline-flex min-h-11 items-center rounded-lg border border-accent-2/40 bg-white/70 px-4 py-2 text-sm font-medium text-accent-2 transition hover:bg-white"
              >
                {t('tryAgain')}
              </button>
            </div>
          </div>
          <BewaarVoortgang googleAan={googleAan} />
        </>
      )}
    </div>
  )
}

export function HomeDemo({ googleAan }: { googleAan: boolean }) {
  const t = useTranslations('HomeDemo')
  const [active, setActive] = useState<Difficulty>('easy')
  /**
   * Telt elke klik op een niveau mee, ook op het al actieve niveau. Zo
   * begint de proefsom altijd opnieuw bij een klik, in plaats van dat een
   * klik op het actieve tabblad niets zichtbaars doet.
   */
  const [klikTeller, setKlikTeller] = useState(0)
  /**
   * De niveaukeuze verschijnt pas na de eerste nagekeken poging (AFG-588):
   * bezoekers bleven klikken op de keuze zelf in plaats van meteen een som
   * na te kijken. Zo is de makkelijke som meteen te zien, zonder keuze
   * vooraf.
   */
  const [heeftGeprobeerd, setHeeftGeprobeerd] = useState(false)

  const tabs: { id: Difficulty; label: string }[] = [
    { id: 'easy', label: t('tabEasy') },
    { id: 'medium', label: t('tabMedium') },
    { id: 'hard', label: t('tabHard') },
  ]

  function kiesNiveau(id: Difficulty) {
    setActive(id)
    setKlikTeller((n) => n + 1)
  }

  return (
    <section id="proefsom" className="mt-3 scroll-mt-6 sm:mt-8">
      <div className="mb-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center">
        <span className="text-xs font-medium uppercase tracking-wider text-accent">
          {t('eyebrow')}
        </span>
        <span className="text-xs text-text-muted">·</span>
        <span className="text-xs text-text-muted">{t('subEyebrow')}</span>
      </div>

      {heeftGeprobeerd && (
        <div className="mb-3">
          <p className="mb-1 text-center text-xs text-text-muted">{t('anderNiveau')}</p>
          <div className="flex gap-1 rounded-xl border border-border bg-surface p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => kiesNiveau(tab.id)}
                data-meet="home-proefsom-niveau"
                className={`flex min-h-11 flex-1 items-center justify-center rounded-lg px-3 text-sm font-medium transition ${
                  active === tab.id
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <DemoCard
        key={`${active}-${klikTeller}`}
        difficulty={active}
        onSubmit={() => setHeeftGeprobeerd(true)}
        googleAan={googleAan}
      />
    </section>
  )
}
