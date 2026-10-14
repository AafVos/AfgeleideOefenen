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
export const MACHT_DUREN = [145, 121, 121, 126, 126, 119]
export const KETTING_DUREN = [142, 332, 173, 113, 171, 134]
export const PRODUCT_DUREN = [133, 156, 158, 145, 148, 109, 135]
export const QUOTIENT_DUREN = [138, 141, 148, 219, 259, 131]
export const WORTEL_DUREN = [152, 221, 137, 133, 116]

function poseVoor(beat: number, laatste: number): AafPose {
  if (beat === 0 || beat === laatste) return 'wave'
  if (beat === laatste - 1) return 'jump'
  return 'point'
}

function Kader({
  sleutel,
  duren,
  titel,
  children,
}: {
  sleutel: string
  duren: number[]
  titel: ReactNode
  children: (beat: number) => ReactNode
}) {
  const frame = useCurrentFrame()
  const beat = beatIndex(frame, duren)
  const lokaal = frame - beatStart(duren, beat)
  const einde = beat === duren.length - 1
  return (
    <ShortShell
      titel={einde ? undefined : titel}
      fragment={`voiceover-shorts/${sleutel}/${beat + 1}`}
      delay={beatStart(duren, beat) + 15}
      pose={poseVoor(beat, duren.length - 1)}
      poseFrame={lokaal}
    >
      {einde ? (
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
        sleutel="macht"
        duren={MACHT_DUREN}
        titel={
          <>
            De <span style={{ color: groen }}>machtsregel</span>
          </>
        }
      >
        {(beat) => (
          <>
            {beat >= 2 && (
              <FadeUp from={verschijn(MACHT_DUREN, 2, beat)}>
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
            {beat >= 1 && beat < 4 && (
              <FadeUp from={verschijn(MACHT_DUREN, 1, beat)}>
                <Formule>
                  <FnX naam="f" /> = 3
                  <XTot n="4" />
                </Formule>
              </FadeUp>
            )}
            {beat === 3 && (
              <FadeUp from={verschijn(MACHT_DUREN, 3, beat)}>
                <Formule>
                  4 · 3 = 12
                  <span style={{ color: theme.textMuted }}> en </span>4 − 1 = 3
                </Formule>
              </FadeUp>
            )}
            {beat === 4 && (
              <FadeUp from={verschijn(MACHT_DUREN, 4, beat)}>
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
        sleutel="ketting"
        duren={KETTING_DUREN}
        titel={
          <>
            De <span style={{ color: groen }}>kettingregel</span>
          </>
        }
      >
        {(beat) => (
          <>
            {beat >= 2 && beat < 5 && (
              <FadeUp from={verschijn(KETTING_DUREN, 2, beat)}>
                <KorteKaart>
                  <FnX naam="f" /> = <em>g</em>(<em>h</em>(<X />))
                  <br />
                  <FnX naam="f" accent /> = <em>g</em>′(<em>h</em>(<X />)) · <em>h</em>′(<X />)
                </KorteKaart>
              </FadeUp>
            )}
            {beat === 1 && (
              <>
                <FadeUp from={verschijn(KETTING_DUREN, 1, beat)}>
                  <Formule>
                    <FnX naam="f" /> = <Haakje3><TweeXPlusEen /></Haakje3>
                  </Formule>
                </FadeUp>
                <FadeUp from={beatStart(KETTING_DUREN, 1) + 90}>
                  <Formule>
                    <span style={{ color: groen }}>
                      <em>h</em>(<X />) = <TweeXPlusEen />
                    </span>
                  </Formule>
                </FadeUp>
                <FadeUp from={beatStart(KETTING_DUREN, 1) + 160}>
                  <Formule>
                    <em>g</em> is de derde macht
                  </Formule>
                </FadeUp>
              </>
            )}
            {beat === 2 && (
              <FadeUp from={verschijn(KETTING_DUREN, 2, beat)}>
                <Formule>
                  3
                  <Haakje2>
                    <TweeXPlusEen />
                  </Haakje2>
                </Formule>
              </FadeUp>
            )}
            {beat === 3 && (
              <FadeUp from={verschijn(KETTING_DUREN, 3, beat)}>
                <Formule>
                  3
                  <Haakje2>
                    <TweeXPlusEen />
                  </Haakje2>
                  <span style={{ color: groen }}> · 2</span>
                </Formule>
              </FadeUp>
            )}
            {beat === 4 && (
              <FadeUp from={verschijn(KETTING_DUREN, 4, beat)}>
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
        sleutel="product"
        duren={PRODUCT_DUREN}
        titel={
          <>
            De <span style={{ color: min }}>productregel</span>
          </>
        }
      >
        {(beat) => (
          <>
            {beat >= 1 && beat < 6 && (
              <FadeUp from={verschijn(PRODUCT_DUREN, 1, beat)}>
                <KorteKaart>
                  <FnX naam="f" accent /> = <em>g</em>′(<X />)·<em>h</em>(<X />) + <em>g</em>(<X />)·<em>h</em>′(<X />)
                </KorteKaart>
              </FadeUp>
            )}
            {beat === 1 && (
              <FadeUp from={verschijn(PRODUCT_DUREN, 1, beat)}>
                <Formule>
                  <FnX naam="f" /> = <XTot n="2" /> · (3<X /> + 1)
                </Formule>
              </FadeUp>
            )}
            {beat === 2 && (
              <FadeUp from={verschijn(PRODUCT_DUREN, 2, beat)}>
                <Formule>
                  <em>g</em>(<X />) = <XTot n="2" />
                  <span style={{ color: theme.textMuted }}> · </span>
                  <em>h</em>(<X />) = 3<X /> + 1
                </Formule>
              </FadeUp>
            )}
            {beat === 3 && (
              <FadeUp from={verschijn(PRODUCT_DUREN, 3, beat)}>
                <Formule kleur={groen}>
                  <em>g</em>′(<X />) = 2<X />
                  <span style={{ color: theme.textMuted }}> · </span>
                  <em>h</em>′(<X />) = 3
                </Formule>
              </FadeUp>
            )}
            {beat === 4 && (
              <FadeUp from={verschijn(PRODUCT_DUREN, 4, beat)}>
                <Formule>
                  2<X /> · (3<X /> + 1) + <XTot n="2" /> · 3
                </Formule>
              </FadeUp>
            )}
            {beat === 5 && (
              <FadeUp from={verschijn(PRODUCT_DUREN, 5, beat)}>
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
        sleutel="quotient"
        duren={QUOTIENT_DUREN}
        titel={
          <>
            De <span style={{ color: groen }}>quotiëntregel</span>
          </>
        }
      >
        {(beat) => (
          <>
            {beat >= 1 && beat < 5 && (
              <FadeUp from={verschijn(QUOTIENT_DUREN, 1, beat)}>
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
            {(beat === 1 || beat === 2) && (
              <FadeUp from={verschijn(QUOTIENT_DUREN, 1, beat)}>
                <Formule>
                  <FnX naam="f" /> ={' '}
                  <Breuk
                    teller={
                      <span>
                        <X />
                        {beat >= 2 && (
                          <span style={{ display: 'block', fontSize: 32, color: groen }}>g</span>
                        )}
                      </span>
                    }
                    noemer={
                      <span>
                        <X /> + 1
                        {beat >= 2 && (
                          <span style={{ display: 'block', fontSize: 32, color: min }}>h</span>
                        )}
                      </span>
                    }
                  />
                </Formule>
              </FadeUp>
            )}
            {beat === 3 && (
              <FadeUp from={verschijn(QUOTIENT_DUREN, 3, beat)}>
                <Formule>
                  (<X /> + 1) <span style={{ color: min }}>−</span> <X />{' '}
                  <span style={{ color: groen }}>= 1</span>
                </Formule>
              </FadeUp>
            )}
            {beat === 4 && (
              <FadeUp from={verschijn(QUOTIENT_DUREN, 4, beat)}>
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
        sleutel="wortel"
        duren={WORTEL_DUREN}
        titel={
          <>
            Afgeleide van een <span style={{ color: groen }}>wortel</span>
          </>
        }
      >
        {(beat) => (
          <>
            {beat >= 2 && beat < 4 && (
              <FadeUp from={verschijn(WORTEL_DUREN, 2, beat)}>
                <KorteKaart>
                  <FnX naam="f" /> = <em>a</em>
                  <XTot n={<em>n</em>} /> <span style={{ color: groen }}>⟹</span> <FnX naam="f" accent /> ={' '}
                  <em>n</em> · <em>a</em>
                  <XTot n={<em>n − 1</em>} />
                </KorteKaart>
              </FadeUp>
            )}
            {beat === 1 && (
              <FadeUp from={verschijn(WORTEL_DUREN, 1, beat)}>
                <Formule>
                  <FnX naam="f" /> = <Wortel><X /></Wortel> = <XTot n="½" />
                </Formule>
              </FadeUp>
            )}
            {beat === 2 && (
              <FadeUp from={verschijn(WORTEL_DUREN, 2, beat)}>
                <Formule>
                  <FnX naam="f" accent /> = ½ · <XTot n="−½" />
                </Formule>
              </FadeUp>
            )}
            {beat === 3 && (
              <FadeUp from={verschijn(WORTEL_DUREN, 3, beat)}>
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
