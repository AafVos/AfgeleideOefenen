import type { CSSProperties, ReactNode } from 'react'
import { Audio, Sequence, Series, staticFile } from 'remotion'

import type { AafPose } from './Aaf'
import { Breuk, FadeUp, Macht, Pop, X, X2 } from './ui'
import {
  formuleStijl,
  KorteKaart,
  KortTitel,
  PlusC,
  ShortScene,
  Sitenaam,
} from './short-ui'
import { SHORT_LEAD, duurVan, shortDuren } from './shorts-duren'
import { theme } from './theme'

type Beat = { caption: string; pose: AafPose; visual: ReactNode }

/**
 * Eén Short: elke beat is één zin, met de ondertitel in beeld en de stem
 * een derde seconde later. De voorbeelden zijn eigen sommen, nagekeken door
 * terug te differentiëren.
 */
function Short({ map, beats, duren }: { map: string; beats: Beat[]; duren: readonly number[] }) {
  if (duren.length !== beats.length) {
    throw new Error(`${map}: ${duren.length} duren voor ${beats.length} beats`)
  }
  return (
    <Series>
      {beats.map((beat, i) => (
        <Series.Sequence key={`${map}-${i}`} durationInFrames={duren[i]}>
          <ShortScene caption={beat.caption} pose={beat.pose}>
            <FadeUp from={4}>{beat.visual}</FadeUp>
          </ShortScene>
          <Sequence from={SHORT_LEAD}>
            <Audio src={staticFile(`voiceover-shorts/${map}/beat-${i + 1}.mp3`)} />
          </Sequence>
        </Series.Sequence>
      ))}
    </Series>
  )
}

function Formule({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ ...formuleStijl, ...style }}>{children}</div>
}

function Sup({ children }: { children: ReactNode }) {
  return <sup style={{ fontSize: '0.55em' }}>{children}</sup>
}

function Ex() {
  return (
    <span>
      e<Sup><X /></Sup>
    </span>
  )
}

/** ∫ met optionele grenzen, in de serif van de pagina. */
function Integraal({
  van,
  tot,
  children,
}: {
  van?: ReactNode
  tot?: ReactNode
  children: ReactNode
}) {
  if (van == null && tot == null) {
    return (
      <span>
        <span style={{ fontSize: '1.15em' }}>∫ </span>
        {children}
      </span>
    )
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}>
      <span
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          lineHeight: 1,
        }}
      >
        <span style={{ fontSize: '0.32em' }}>{tot}</span>
        <span style={{ fontSize: '1.15em' }}>∫</span>
        <span style={{ fontSize: '0.32em' }}>{van}</span>
      </span>
      <span>{children}</span>
    </span>
  )
}

function Grafiek() {
  return (
    <svg width={780} height={440} viewBox="0 0 320 190" role="img" aria-label="Grafiek van f van x is 2x, van 0 tot 3">
      <polygon points="36,150 250,40 250,150" fill={theme.accentLight} />
      <line x1="28" y1="150" x2="290" y2="150" stroke={theme.text} strokeWidth="3" />
      <line x1="36" y1="168" x2="36" y2="24" stroke={theme.text} strokeWidth="3" />
      <line x1="36" y1="150" x2="250" y2="40" stroke={theme.accent} strokeWidth="5" strokeLinecap="round" />
      <text x="28" y="176" fontSize="22" fontFamily={theme.fontSerif} fill={theme.text}>
        0
      </text>
      <text x="238" y="176" fontSize="22" fontFamily={theme.fontSerif} fill={theme.text}>
        3
      </text>
    </svg>
  )
}

/** ∫ 4x³ dx = x⁴ + c. Afgeleide van x⁴ is 4x³. */
export function ShortPrimitief() {
  return (
    <Short
      map="primitief"
      duren={shortDuren.primitief}
      beats={[
        {
          pose: 'think',
          caption: 'Hoe vind je de primitieve van 4x³?',
          visual: (
            <Formule>
              <Integraal>
                4
                <Macht n="3">
                  <X />
                </Macht>{' '}
                d<X />
              </Integraal>
            </Formule>
          ),
        },
        {
          pose: 'wave',
          caption: 'De macht gaat één omhoog. Deel door de nieuwe macht.',
          visual: (
            <>
              <KortTitel>Primitieve van een macht</KortTitel>
              <KorteKaart>
                <Macht n="n">
                  <X />
                </Macht>{' '}
                <span style={{ color: theme.accent }}>→</span>{' '}
                <Breuk
                  teller={
                    <Macht n="n+1">
                      <X />
                    </Macht>
                  }
                  noemer="n + 1"
                />
              </KorteKaart>
            </>
          ),
        },
        {
          pose: 'point',
          caption: 'De integraal van 4x³.',
          visual: (
            <Formule>
              <Integraal>
                4
                <Macht n="3">
                  <X />
                </Macht>{' '}
                d<X />
              </Integraal>
            </Formule>
          ),
        },
        {
          pose: 'point',
          caption: 'Macht 3 wordt 4. Deel door 4.',
          visual: (
            <Formule>
              <Breuk
                teller={
                  <>
                    <span style={{ color: theme.accent }}>4</span> ·{' '}
                    <Macht n="4">
                      <X />
                    </Macht>
                  </>
                }
                noemer={<span style={{ color: theme.accent }}>4</span>}
              />
            </Formule>
          ),
        },
        {
          pose: 'jump',
          caption: 'De primitieve is x⁴ + c.',
          visual: (
            <Pop from={6}>
              <Formule>
                <Macht n="4">
                  <X />
                </Macht>
                <PlusC />
              </Formule>
            </Pop>
          ),
        },
        {
          pose: 'wave',
          caption: 'Oefen dit op integraaloefenen.nl',
          visual: <KortTitel><Sitenaam groot /></KortTitel>,
        },
      ]}
    />
  )
}

/** ∫ 2x(x²+3)⁴ dx = (x²+3)⁵ / 5 + c. */
export function ShortSubstitutie() {
  return (
    <Short
      map="substitutie"
      duren={shortDuren.substitutie}
      beats={[
        {
          pose: 'think',
          caption: 'Hoe primitiver je 2x(x² + 3)⁴?',
          visual: (
            <Formule>
              <Integraal>
                2<X />(<X2 /> + 3)
                <Sup>4</Sup> d<X />
              </Integraal>
            </Formule>
          ),
        },
        {
          pose: 'wave',
          caption: 'Zie je een functie én zijn afgeleide?',
          visual: (
            <>
              <KortTitel>
                <span style={{ color: theme.accent }}>Substitutie</span>
              </KortTitel>
              <KorteKaart>de kern, en vlak ervoor de afgeleide van die kern</KorteKaart>
            </>
          ),
        },
        {
          pose: 'point',
          caption: 'Integraal van 2x keer (x² + 3)⁴.',
          visual: (
            <Formule>
              <Integraal>
                <span style={{ color: theme.accent }}>2<X /></span>(<X2 /> + 3)
                <Sup>4</Sup> d<X />
              </Integraal>
            </Formule>
          ),
        },
        {
          pose: 'point',
          caption: 'g(x) = x² + 3. De afgeleide van g is 2x.',
          visual: (
            <>
              <Formule style={{ fontSize: 120 }}>
                g(<X />) = <X2 /> + 3
              </Formule>
              <Formule style={{ fontSize: 120 }}>
                <span style={{ color: theme.accent }}>
                  g′(<X />) = 2<X />
                </span>
              </Formule>
            </>
          ),
        },
        {
          pose: 'jump',
          caption: 'De primitieve is (x² + 3)⁵ / 5 + c.',
          visual: (
            <Pop from={6}>
              <Formule>
                <Breuk
                  teller={
                    <>
                      (<X2 /> + 3)<Sup>5</Sup>
                    </>
                  }
                  noemer="5"
                />
                <PlusC />
              </Formule>
            </Pop>
          ),
        },
        {
          pose: 'wave',
          caption: 'Oefen substitutie op integraaloefenen.nl',
          visual: <KortTitel><Sitenaam groot /></KortTitel>,
        },
      ]}
    />
  )
}

/** ∫ x e^x dx = x e^x − e^x + c. */
export function ShortPartieel() {
  return (
    <Short
      map="partieel"
      duren={shortDuren.partieel}
      beats={[
        {
          pose: 'think',
          caption: 'Hoe primitiver je x · eˣ?',
          visual: (
            <Formule>
              <Integraal>
                <X /> · <Ex /> d<X />
              </Integraal>
            </Formule>
          ),
        },
        {
          pose: 'wave',
          caption: 'Een product van twee functies.',
          visual: (
            <>
              <KortTitel>Partieel integreren</KortTitel>
              <KorteKaart>
                ∫ g(<X />) · h′(<X />) d<X />
                <br />= g(<X />) · h(<X />) − ∫ g′(<X />) · h(<X />) d<X />
              </KorteKaart>
            </>
          ),
        },
        {
          pose: 'point',
          caption: 'Integraal van x keer e tot de x.',
          visual: (
            <Formule>
              <Integraal>
                <X /> · <Ex /> d<X />
              </Integraal>
            </Formule>
          ),
        },
        {
          pose: 'point',
          caption: 'g(x) is x. h(x) is e tot de x.',
          visual: (
            <div style={{ display: 'flex', gap: 24 }}>
              <KorteKaart>
                g(<X />) = <X />
                <br />
                g′(<X />) = 1
              </KorteKaart>
              <KorteKaart>
                h′(<X />) = <Ex />
                <br />
                h(<X />) = <Ex />
              </KorteKaart>
            </div>
          ),
        },
        {
          pose: 'nod',
          caption: 'x keer e tot de x, min de integraal van e tot de x.',
          visual: (
            <Formule style={{ fontSize: 120 }}>
              <X /> · <Ex /> − <Integraal><Ex /> d<X /></Integraal>
            </Formule>
          ),
        },
        {
          pose: 'jump',
          caption: 'De primitieve is x eˣ − eˣ + c.',
          visual: (
            <Pop from={6}>
              <Formule style={{ fontSize: 128 }}>
                <X /> · <Ex /> − <Ex />
                <PlusC />
              </Formule>
            </Pop>
          ),
        },
        {
          pose: 'wave',
          caption: 'Oefen partieel op integraaloefenen.nl',
          visual: <KortTitel><Sitenaam groot /></KortTitel>,
        },
      ]}
    />
  )
}

/** ∫ van 0 tot 3 van 2x dx = 9. */
export function ShortOppervlakte() {
  return (
    <Short
      map="oppervlakte"
      duren={shortDuren.oppervlakte}
      beats={[
        {
          pose: 'think',
          caption: 'Wat is de oppervlakte onder 2x?',
          visual: (
            <>
              <Grafiek />
              <div style={{ ...formuleStijl, fontSize: 112 }}>
                van 0 tot 3
              </div>
            </>
          ),
        },
        {
          pose: 'wave',
          caption: 'Onder een grafiek: reken een integraal.',
          visual: (
            <>
              <KortTitel>Oppervlakte</KortTitel>
              <KorteKaart>de oppervlakte onder de grafiek</KorteKaart>
            </>
          ),
        },
        {
          pose: 'point',
          caption: 'f(x) = 2x, van 0 tot 3.',
          visual: (
            <>
              <Grafiek />
              <div style={{ ...formuleStijl, fontSize: 120 }}>
                f(<X />) = 2<X />
              </div>
            </>
          ),
        },
        {
          pose: 'point',
          caption: 'De primitieve van 2x is x².',
          visual: (
            <Formule style={{ fontSize: 112 }}>
              <Integraal van="0" tot="3">
                2<X /> d<X />
              </Integraal>
              {' = '}
              <span>
                [<X2 />]
                <span style={{ fontSize: '0.4em', display: 'inline-flex', flexDirection: 'column', verticalAlign: 'middle', marginLeft: 4, lineHeight: 1.05 }}>
                  <span>3</span>
                  <span>0</span>
                </span>
              </span>
            </Formule>
          ),
        },
        {
          pose: 'jump',
          caption: 'De oppervlakte is 9.',
          visual: (
            <Pop from={6}>
              <Formule>9</Formule>
            </Pop>
          ),
        },
        {
          pose: 'wave',
          caption: 'Oefen oppervlakte op integraaloefenen.nl',
          visual: <KortTitel><Sitenaam groot /></KortTitel>,
        },
      ]}
    />
  )
}

/** ∫ dx/(x²+1) = arctan(x) + c. Afgeleide van arctan(x) is 1/(x²+1). */
export function ShortArctan() {
  return (
    <Short
      map="arctan"
      duren={shortDuren.arctan}
      beats={[
        {
          pose: 'think',
          caption: 'Welke primitieve hoort bij 1/(x² + 1)?',
          visual: (
            <Formule>
              <Integraal>
                <Breuk teller="1" noemer={<><X2 /> + 1</>} /> d<X />
              </Integraal>
            </Formule>
          ),
        },
        {
          pose: 'jump',
          caption: 'De primitieve is arctan(x) + c.',
          visual: (
            <Pop from={6}>
              <Formule>
                arctan(<X />)
                <PlusC />
              </Formule>
            </Pop>
          ),
        },
        {
          pose: 'nod',
          caption: 'De afgeleide van arctan(x) is weer die breuk.',
          visual: (
            <Formule style={{ fontSize: 108 }}>
              <span style={{ color: theme.accent }}>afgeleide</span> van arctan(<X />)
              <br />= <Breuk teller="1" noemer={<><X2 /> + 1</>} />
            </Formule>
          ),
        },
        {
          pose: 'wave',
          caption: 'Oefen arctan op integraaloefenen.nl',
          visual: <KortTitel><Sitenaam groot /></KortTitel>,
        },
      ]}
    />
  )
}

export const shortComposities = [
  { id: 'ShortPrimitief', component: ShortPrimitief, duur: duurVan(shortDuren.primitief) },
  { id: 'ShortSubstitutie', component: ShortSubstitutie, duur: duurVan(shortDuren.substitutie) },
  { id: 'ShortPartieel', component: ShortPartieel, duur: duurVan(shortDuren.partieel) },
  { id: 'ShortOppervlakte', component: ShortOppervlakte, duur: duurVan(shortDuren.oppervlakte) },
  { id: 'ShortArctan', component: ShortArctan, duur: duurVan(shortDuren.arctan) },
]
