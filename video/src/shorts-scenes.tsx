import type { ReactNode } from 'react'
import { AbsoluteFill, useCurrentFrame } from 'remotion'

import { XTot, Wortel } from './herschrijven-helpers'
import { FnX } from './quotient-helpers'
import { theme } from './theme'
import { Breuk, FadeUp, Macht, X } from './ui'
import {
  Eindbeeld,
  Formule,
  KorteKaart,
  ShortShell,
  Stemmen,
  beatIndex,
  beatStart,
  totaal,
} from './shorts-ui'
import type { AafPose } from './Aaf'

const groen = theme.accent
const min = theme.accent2

/** 15 frames aanloop + gemeten audio + 30 frames uitloop. */
/** Eerste getal is de vraag; daarna de oude fragmenten, ongewijzigd. */
export const MACHT_DUREN = [119, 145, 121, 121, 126, 126, 119]
export const KETTING_DUREN = [134, 142, 332, 173, 113, 171, 134]
export const PRODUCT_DUREN = [151, 133, 156, 158, 145, 148, 109, 135]
export const QUOTIENT_DUREN = [135, 138, 141, 148, 219, 259, 131]
export const WORTEL_DUREN = [99, 152, 221, 137, 133, 116]

const MACHT_TEKST = [
  'Hoe differentieer je 3x⁴?',
  'De machtsregel: een macht van x.',
  'f(x) = 3x⁴',
  'Haal de macht naar voren, en haal er één af.',
  '4 × 3 = 12. En 4 − 1 = 3.',
  'De afgeleide van f is 12x³.',
  'Oefen het zelf op afgeleideoefenen.nl.',
]
const KETTING_TEKST = [
  'Hoe differentieer je (2x + 1)³?',
  'Een functie in een functie: de kettingregel.',
  'f(x) = (2x + 1)³. Binnenkant h, buitenkant g.',
  'Eerst de buitenkant: 3(2x + 1)².',
  'Keer de afgeleide van h. Die is 2.',
  'De afgeleide van f is 6(2x + 1)².',
  'Oefen de kettingregel op afgeleideoefenen.nl.',
]
const PRODUCT_TEKST = [
  'Hoe differentieer je x² · (3x + 1)?',
  'Twee functies keer elkaar: de productregel.',
  'f(x) = x² · (3x + 1)',
  'g(x) = x² en h(x) = 3x + 1.',
  'De afgeleide van g is 2x. Die van h is 3.',
  '2x · (3x + 1) + x² · 3',
  'Dat is 9x² + 2x.',
  'Oefen de productregel op afgeleideoefenen.nl.',
]
const QUOTIENT_TEKST = [
  'Hoe differentieer je x / (x + 1)?',
  'Een breuk van twee functies: de quotiëntregel.',
  'f(x) = x / (x + 1)',
  'g is de teller. h is de noemer.',
  'In de teller staat een min. Dat wordt 1.',
  'De afgeleide is 1 / (x + 1)².',
  'Oefen de quotiëntregel op afgeleideoefenen.nl.',
]
const WORTEL_TEKST = [
  'Hoe differentieer je √x?',
  'De afgeleide van een wortel. Eerst als macht.',
  '√x = x tot de macht ½. Voor x > 0.',
  'Een half, keer x tot de macht −½.',
  'Terugschrijven: 1 / (2√x).',
  'Oefen wortels op afgeleideoefenen.nl.',
]

function poseVoor(beat: number, laatste: number): AafPose {
  if (beat === 0 || beat === laatste) return 'wave'
  if (beat === laatste - 1) return 'jump'
  return 'point'
}

function Kader({
  duren,
  teksten,
  titel,
  vraag,
  children,
}: {
  duren: number[]
  teksten: string[]
  titel: ReactNode
  vraag: ReactNode
  children: (beat: number) => ReactNode
}) {
  const frame = useCurrentFrame()
  const beat = beatIndex(frame, duren)
  const lokaal = frame - beatStart(duren, beat)
  const einde = beat === duren.length - 1
  return (
    <ShortShell
      titel={beat > 0 && !einde ? titel : undefined}
      caption={teksten[beat]}
      pose={poseVoor(beat, duren.length - 1)}
      poseFrame={lokaal}
    >
      {beat === 0 ? (
        <FadeUp from={8}>{vraag}</FadeUp>
      ) : einde ? (
        <FadeUp from={beatStart(duren, beat)}>
          <Eindbeeld />
        </FadeUp>
      ) : (
        children(beat)
      )}
    </ShortShell>
  )
}

function verschijn(duren: number[], beat: number, huidige: number) {
  return huidige >= beat ? beatStart(duren, beat) + 8 : 99999
}

function Haakje3({ children }: { children: ReactNode }) {
  return (
    <Macht n="3">
      ({children})
    </Macht>
  )
}

function Haakje2({ children }: { children: ReactNode }) {
  return (
    <Macht n="2">
      ({children})
    </Macht>
  )
}

function TweeXPlusEen() {
  return (
    <span>
      2<X /> + 1
    </span>
  )
}

export function MachtShort() {
  return (
    <AbsoluteFill>
      <Kader
        duren={MACHT_DUREN}
        teksten={MACHT_TEKST}
        titel={
          <>
            De <span style={{ color: groen }}>machtsregel</span>
          </>
        }
        vraag={
          <Formule groot>
            <FnX naam="f" /> = 3
            <XTot n="4" />
          </Formule>
        }
      >
        {(beat) => (
          <>
            {beat >= 3 && (
              <FadeUp from={verschijn(MACHT_DUREN, 3, beat)}>
                <KorteKaart>
                  <FnX naam="f" /> = <em>a</em>
                  <XTot n={<em>n</em>} /> <span style={{ color: groen }}>⟹</span> <FnX naam="f" accent /> ={' '}
                  <span style={{ color: groen }}>
                    <em>n</em> · <em>a</em>
                    <XTot n={<em>n − 1</em>} />
                  </span>
                </KorteKaart>
              </FadeUp>
            )}
            {beat >= 2 && beat < 5 && (
              <FadeUp from={verschijn(MACHT_DUREN, 2, beat)}>
                <Formule>
                  <FnX naam="f" /> = 3
                  <XTot n="4" />
                </Formule>
              </FadeUp>
            )}
            {beat === 4 && (
              <FadeUp from={verschijn(MACHT_DUREN, 4, beat)}>
                <Formule>
                  4 · 3 = 12
                  <span style={{ color: theme.textMuted }}> en </span>4 − 1 = 3
                </Formule>
              </FadeUp>
            )}
            {beat === 5 && (
              <FadeUp from={verschijn(MACHT_DUREN, 5, beat)}>
                <Formule groot kleur={groen}>
                  <FnX naam="f" accent /> = 12
                  <XTot n="3" />
                </Formule>
              </FadeUp>
            )}
          </>
        )}
      </Kader>
      <Stemmen map="macht" duren={MACHT_DUREN} />
    </AbsoluteFill>
  )
}

export function KettingShort() {
  return (
    <AbsoluteFill>
      <Kader
        duren={KETTING_DUREN}
        teksten={KETTING_TEKST}
        titel={
          <>
            De <span style={{ color: groen }}>kettingregel</span>
          </>
        }
        vraag={
          <Formule groot>
            <Haakje3>
              <TweeXPlusEen />
            </Haakje3>
          </Formule>
        }
      >
        {(beat) => (
          <>
            {beat >= 3 && beat < 6 && (
              <FadeUp from={verschijn(KETTING_DUREN, 3, beat)}>
                <KorteKaart>
                  <FnX naam="f" /> = <em>g</em>(<em>h</em>(<X />))
                  <br />
                  <FnX naam="f" accent /> = <em>g</em>′(<em>h</em>(<X />)) · <em>h</em>′(<X />)
                </KorteKaart>
              </FadeUp>
            )}
            {beat === 2 && (
              <>
                <FadeUp from={verschijn(KETTING_DUREN, 2, beat)}>
                  <Formule>
                    <FnX naam="f" /> = <Haakje3><TweeXPlusEen /></Haakje3>
                  </Formule>
                </FadeUp>
                <FadeUp from={beatStart(KETTING_DUREN, 2) + 90}>
                  <Formule>
                    <span style={{ color: groen }}>
                      <em>h</em>(<X />) = <TweeXPlusEen />
                    </span>
                  </Formule>
                </FadeUp>
                <FadeUp from={beatStart(KETTING_DUREN, 2) + 160}>
                  <Formule>
                    <em>g</em> is de derde macht
                  </Formule>
                </FadeUp>
              </>
            )}
            {beat === 3 && (
              <FadeUp from={verschijn(KETTING_DUREN, 3, beat)}>
                <Formule>
                  3
                  <Haakje2>
                    <TweeXPlusEen />
                  </Haakje2>
                </Formule>
              </FadeUp>
            )}
            {beat === 4 && (
              <FadeUp from={verschijn(KETTING_DUREN, 4, beat)}>
                <Formule>
                  3
                  <Haakje2>
                    <TweeXPlusEen />
                  </Haakje2>
                  <span style={{ color: groen }}> · 2</span>
                </Formule>
              </FadeUp>
            )}
            {beat === 5 && (
              <FadeUp from={verschijn(KETTING_DUREN, 5, beat)}>
                <Formule groot kleur={groen}>
                  <FnX naam="f" accent /> = 6
                  <Haakje2>
                    <TweeXPlusEen />
                  </Haakje2>
                </Formule>
              </FadeUp>
            )}
          </>
        )}
      </Kader>
      <Stemmen map="ketting" duren={KETTING_DUREN} />
    </AbsoluteFill>
  )
}

export function ProductShort() {
  return (
    <AbsoluteFill>
      <Kader
        duren={PRODUCT_DUREN}
        teksten={PRODUCT_TEKST}
        titel={
          <>
            De <span style={{ color: min }}>productregel</span>
          </>
        }
        vraag={
          <Formule groot>
            <XTot n="2" /> · (3<X /> + 1)
          </Formule>
        }
      >
        {(beat) => (
          <>
            {beat >= 2 && beat < 7 && (
              <FadeUp from={verschijn(PRODUCT_DUREN, 2, beat)}>
                <KorteKaart>
                  <FnX naam="f" accent /> = <em>g</em>′(<X />)·<em>h</em>(<X />) + <em>g</em>(<X />)·<em>h</em>′(<X />)
                </KorteKaart>
              </FadeUp>
            )}
            {beat === 2 && (
              <FadeUp from={verschijn(PRODUCT_DUREN, 2, beat)}>
                <Formule>
                  <FnX naam="f" /> = <XTot n="2" /> · (3<X /> + 1)
                </Formule>
              </FadeUp>
            )}
            {beat === 3 && (
              <FadeUp from={verschijn(PRODUCT_DUREN, 3, beat)}>
                <Formule>
                  <em>g</em>(<X />) = <XTot n="2" />
                  <span style={{ color: theme.textMuted }}> · </span>
                  <em>h</em>(<X />) = 3<X /> + 1
                </Formule>
              </FadeUp>
            )}
            {beat === 4 && (
              <FadeUp from={verschijn(PRODUCT_DUREN, 4, beat)}>
                <Formule kleur={groen}>
                  <em>g</em>′(<X />) = 2<X />
                  <span style={{ color: theme.textMuted }}> · </span>
                  <em>h</em>′(<X />) = 3
                </Formule>
              </FadeUp>
            )}
            {beat === 5 && (
              <FadeUp from={verschijn(PRODUCT_DUREN, 5, beat)}>
                <Formule>
                  2<X /> · (3<X /> + 1)
                </Formule>
                <Formule>
                  + <XTot n="2" /> · 3
                </Formule>
              </FadeUp>
            )}
            {beat === 6 && (
              <FadeUp from={verschijn(PRODUCT_DUREN, 6, beat)}>
                <Formule groot kleur={groen}>
                  <FnX naam="f" accent /> = 9
                  <XTot n="2" /> + 2<X />
                </Formule>
              </FadeUp>
            )}
          </>
        )}
      </Kader>
      <Stemmen map="product" duren={PRODUCT_DUREN} />
    </AbsoluteFill>
  )
}

export function QuotientShort() {
  return (
    <AbsoluteFill>
      <Kader
        duren={QUOTIENT_DUREN}
        teksten={QUOTIENT_TEKST}
        titel={
          <>
            De <span style={{ color: groen }}>quotiëntregel</span>
          </>
        }
        vraag={
          <Formule groot>
            <Breuk teller={<X />} noemer={<span><X /> + 1</span>} />
          </Formule>
        }
      >
        {(beat) => (
          <>
            {beat >= 2 && beat < 6 && (
              <FadeUp from={verschijn(QUOTIENT_DUREN, 2, beat)}>
                <KorteKaart>
                  <FnX naam="f" accent /> ={' '}
                  <Breuk
                    teller={
                      <span>
                        <em>g</em>′<em>h</em> <span style={{ color: min }}>−</span> <em>gh</em>′
                      </span>
                    }
                    noemer={
                      <span>
                        (<em>h</em>)²
                      </span>
                    }
                  />
                </KorteKaart>
              </FadeUp>
            )}
            {(beat === 2 || beat === 3) && (
              <FadeUp from={verschijn(QUOTIENT_DUREN, 2, beat)}>
                <Formule>
                  <FnX naam="f" /> ={' '}
                  <Breuk
                    teller={
                      <span>
                        <X />
                        {beat >= 3 && (
                          <span style={{ display: 'block', fontSize: 64, color: groen }}>g</span>
                        )}
                      </span>
                    }
                    noemer={
                      <span>
                        <X /> + 1
                        {beat >= 3 && (
                          <span style={{ display: 'block', fontSize: 64, color: min }}>h</span>
                        )}
                      </span>
                    }
                  />
                </Formule>
              </FadeUp>
            )}
            {beat === 4 && (
              <FadeUp from={verschijn(QUOTIENT_DUREN, 4, beat)}>
                <Formule>
                  (<X /> + 1) <span style={{ color: min }}>−</span> <X />{' '}
                  <span style={{ color: groen }}>= 1</span>
                </Formule>
              </FadeUp>
            )}
            {beat === 5 && (
              <FadeUp from={verschijn(QUOTIENT_DUREN, 5, beat)}>
                <Formule groot kleur={groen}>
                  <FnX naam="f" accent /> ={' '}
                  <Breuk
                    teller={<span>1</span>}
                    noemer={
                      <Haakje2>
                        <X /> + 1
                      </Haakje2>
                    }
                    streepKleur={groen}
                  />
                </Formule>
              </FadeUp>
            )}
          </>
        )}
      </Kader>
      <Stemmen map="quotient" duren={QUOTIENT_DUREN} />
    </AbsoluteFill>
  )
}

export function WortelShort() {
  return (
    <AbsoluteFill>
      <Kader
        duren={WORTEL_DUREN}
        teksten={WORTEL_TEKST}
        titel={
          <>
            Afgeleide van een <span style={{ color: groen }}>wortel</span>
          </>
        }
        vraag={
          <Formule groot>
            <Wortel>
              <X />
            </Wortel>
          </Formule>
        }
      >
        {(beat) => (
          <>
            {beat >= 3 && beat < 5 && (
              <FadeUp from={verschijn(WORTEL_DUREN, 3, beat)}>
                <KorteKaart>
                  <FnX naam="f" /> = <em>a</em>
                  <XTot n={<em>n</em>} /> <span style={{ color: groen }}>⟹</span> <FnX naam="f" accent /> ={' '}
                  <em>n</em> · <em>a</em>
                  <XTot n={<em>n − 1</em>} />
                </KorteKaart>
              </FadeUp>
            )}
            {beat === 2 && (
              <FadeUp from={verschijn(WORTEL_DUREN, 2, beat)}>
                <Formule>
                  <FnX naam="f" /> = <Wortel><X /></Wortel> = <XTot n="½" />
                </Formule>
              </FadeUp>
            )}
            {beat === 3 && (
              <FadeUp from={verschijn(WORTEL_DUREN, 3, beat)}>
                <Formule>
                  <FnX naam="f" accent /> = ½ · <XTot n="−½" />
                </Formule>
              </FadeUp>
            )}
            {beat === 4 && (
              <FadeUp from={verschijn(WORTEL_DUREN, 4, beat)}>
                <Formule groot kleur={groen}>
                  <FnX naam="f" accent /> ={' '}
                  <Breuk
                    teller={<span>1</span>}
                    noemer={
                      <span>
                        2
                        <Wortel>
                          <X />
                        </Wortel>
                      </span>
                    }
                    streepKleur={groen}
                  />
                </Formule>
              </FadeUp>
            )}
          </>
        )}
      </Kader>
      <Stemmen map="wortel" duren={WORTEL_DUREN} />
    </AbsoluteFill>
  )
}

export const MACHT_DUUR = totaal(MACHT_DUREN)
export const KETTING_DUUR = totaal(KETTING_DUREN)
export const PRODUCT_DUUR = totaal(PRODUCT_DUREN)
export const QUOTIENT_DUUR = totaal(QUOTIENT_DUREN)
export const WORTEL_DUUR = totaal(WORTEL_DUREN)
