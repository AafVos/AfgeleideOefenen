import type { CSSProperties, ReactNode } from 'react'
import { useCurrentFrame } from 'remotion'

import { theme } from './theme'
import { Antwoord, BreukLabel, FnX, Noemer, NoemerKwadraat, Opgave, Teller } from './som34-helpers'
import { Fn, RegelKaart, sceneTitelStijl } from './scenes-regels'
import {
  AafCorner,
  Breuk,
  captionStyle,
  Chip,
  Circled,
  FadeUp,
  Macht,
  mathStyle,
  Pop,
  Scene,
  titleStyle,
  X,
} from './ui'

const groen = theme.accent
const rood = theme.accent2

/**
 * Tempo-knop: 1 = strak AI-tempo (beats getimed op Pauline). Hoger = ruimer,
 * bijv. voor zelf inspreken. Scèneduren in Som34Video.tsx en de cues in
 * cues-som34.ts schalen mee via dezelfde factor.
 */
export const TEMPO = 1
export const t = (n: number) => Math.round(n * TEMPO)

/** Effen groen stap-label voor het stappenplan. */
function StapLabel({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-block',
        fontFamily: theme.fontSans,
        fontSize: 26,
        fontWeight: 600,
        color: '#ffffff',
        backgroundColor: groen,
        borderRadius: 999,
        padding: '8px 24px',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  )
}

const rijStijl: CSSProperties = { display: 'flex', alignItems: 'center', gap: 36, width: 1180 }

/** De quotiëntregel-kaart, precies zoals hij in stap 3 wordt overgeschreven. */
function QuotientKaart({ fontSize = 34 }: { fontSize?: number }) {
  return (
    <RegelKaart fontSize={fontSize}>
      <Fn naam="f" vanX /> ={' '}
      <Breuk teller={<Fn naam="g" vanX />} noemer={<Fn naam="h" vanX />} />{' '}
      <span style={{ color: groen }}>⟹</span> <Fn naam="f" accent vanX /> ={' '}
      <span style={{ color: groen }}>
        <Breuk
          teller={
            <span>
              <Fn naam="g" accent vanX />
              <Fn naam="h" vanX /> <span style={{ color: rood }}>−</span>{' '}
              <Fn naam="g" vanX />
              <Fn naam="h" accent vanX />
            </span>
          }
          noemer={
            <Macht n={2}>
              (<Fn naam="h" vanX />)
            </Macht>
          }
        />
      </span>
    </RegelKaart>
  )
}

/* ── Scène 1 · H2 · #34 ─────────────────────────────────────────────── */
export function Som34Intro() {
  const frame = useCurrentFrame()
  return (
    <Scene>
      <FadeUp from={t(10)}>
        <h1 style={titleStyle}>
          H2 · <span style={{ color: groen }}>#34</span>
        </h1>
      </FadeUp>
      <FadeUp from={t(40)}>
        <Opgave />
      </FadeUp>
      <AafCorner pose={frame > 45 ? 'wave' : 'idle'} poseFrame={frame - t(45)} enterAt={10} />
    </Scene>
  )
}

/* ── Scène 2 · Stap 0: Analyseer de buitenste schil ─────────────────── */
export function Som34Analyse() {
  const frame = useCurrentFrame()
  return (
    <Scene>
      <FadeUp from={t(10)}>
        <h2 style={sceneTitelStijl}>
          Stap 0 · <span style={{ color: groen }}>Analyseer de buitenste schil</span>
        </h2>
      </FadeUp>
      {/* De breukstreep splitst; teller en noemer worden apart omcirkeld */}
      <FadeUp from={t(20)}>
        <div style={{ ...mathStyle, fontSize: 52 }}>
          <FnX naam="f" /> ={' '}
          <Breuk
            teller={
              <span style={{ display: 'inline-block', padding: '12px 40px' }}>
                <Circled from={t(220)} color={groen}>
                  <Teller />
                </Circled>
              </span>
            }
            noemer={
              <span style={{ display: 'inline-block', padding: '12px 40px' }}>
                <Circled from={t(300)} color={rood}>
                  <Noemer />
                </Circled>
              </span>
            }
          />
        </div>
      </FadeUp>
      <Pop from={t(500)}>
        <Chip color={rood} bg={theme.accent2Light}>
          Quotiëntregel!
        </Chip>
      </Pop>
      <FadeUp from={t(575)}>
        <QuotientKaart fontSize={36} />
      </FadeUp>
      <AafCorner pose={frame >= t(210) ? 'point' : 'idle'} poseFrame={frame - t(210)} />
    </Scene>
  )
}

/* ── Scène 3 · De quotiëntregel ─────────────────────────────────────── */
export function Som34Quotientregel() {
  const frame = useCurrentFrame()
  const formuleRegel: CSSProperties = { ...mathStyle, fontSize: 30 }
  return (
    <Scene gap={14}>
      {/* Titel, kaart en onze f staan klaar zodra de scène begint */}
      <FadeUp from={t(5)}>
        <h2 style={sceneTitelStijl}>
          De <span style={{ color: rood }}>quotiëntregel</span>
        </h2>
      </FadeUp>
      <FadeUp from={t(5)}>
        <QuotientKaart fontSize={30} />
      </FadeUp>
      {/* g boven, h onder de breukstreep — de volgorde ligt vast */}
      <FadeUp from={t(5)}>
        <div style={{ ...mathStyle, fontSize: 30, padding: '24px 0 40px' }}>
          <FnX naam="f" /> ={' '}
          <Breuk
            teller={
              <BreukLabel positie="boven" label="g(x)" from={t(100)}>
                <Teller />
              </BreukLabel>
            }
            noemer={
              <BreukLabel positie="onder" label="h(x)" from={t(100)}>
                <Noemer />
              </BreukLabel>
            }
          />
        </div>
      </FadeUp>
      {/* Stap 1 */}
      <div style={rijStijl}>
        <Pop from={t(20)}>
          <StapLabel>
            Stap 1 · kies <em>g</em> en <em>h</em>
          </StapLabel>
        </Pop>
        <FadeUp from={t(165)}>
          <div style={{ ...mathStyle, fontSize: 30 }}>
            <FnX naam="g" /> = <X /> − 2
            <span style={{ ...captionStyle, fontSize: 26, margin: '0 20px' }}>en</span>
            <FnX naam="h" /> = <X /> + 5
          </div>
        </FadeUp>
      </div>
      {/* Stap 2 */}
      <div style={rijStijl}>
        <Pop from={t(325)}>
          <StapLabel>
            Stap 2 · bereken <em>g</em>′ en <em>h</em>′
          </StapLabel>
        </Pop>
        <FadeUp from={t(395)}>
          <div style={{ ...mathStyle, fontSize: 30, color: groen }}>
            <FnX naam="g" accent /> = 1
            <span style={{ ...captionStyle, fontSize: 26, margin: '0 20px' }}>en</span>
            <FnX naam="h" accent /> = 1
          </div>
        </FadeUp>
      </div>
      {/* Stap 3 */}
      <div style={{ ...rijStijl, alignItems: 'flex-start' }}>
        <Pop from={t(545)}>
          <StapLabel>Stap 3 · vul de formule in</StapLabel>
        </Pop>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <FadeUp from={t(610)}>
            <div style={formuleRegel}>
              <FnX naam="f" accent /> ={' '}
              <span style={{ color: groen }}>
                <Breuk
                  teller={
                    <span>
                      <FnX naam="g" accent />
                      <FnX naam="h" /> <span style={{ color: rood }}>−</span>{' '}
                      <FnX naam="g" />
                      <FnX naam="h" accent />
                    </span>
                  }
                  noemer={
                    <Macht n={2}>
                      (<FnX naam="h" />)
                    </Macht>
                  }
                />
              </span>
            </div>
          </FadeUp>
          <FadeUp from={t(945)}>
            <div style={formuleRegel}>
              <FnX naam="f" accent /> ={' '}
              <Breuk
                teller={
                  <span>
                    <span style={{ color: groen }}>1</span> · (<Noemer />){' '}
                    <span style={{ color: rood }}>−</span> (<Teller />) ·{' '}
                    <span style={{ color: groen }}>1</span>
                  </span>
                }
                noemer={<NoemerKwadraat />}
              />
            </div>
          </FadeUp>
          <FadeUp from={t(1180)}>
            <div style={formuleRegel}>
              <FnX naam="f" accent /> ={' '}
              <Breuk
                teller={
                  <span>
                    <X /> + 5 − <X /> + 2
                  </span>
                }
                noemer={<NoemerKwadraat />}
              />
            </div>
          </FadeUp>
          <Pop from={t(1305)}>
            <Antwoord fontSize={34} kleur={groen} />
          </Pop>
        </div>
      </div>
      <AafCorner
        pose={
          frame >= t(1330) ? 'jump' : frame >= t(395) ? 'nod' : frame >= t(30) ? 'point' : 'idle'
        }
        poseFrame={
          frame >= t(1330) ? frame - t(1330) : frame >= t(395) ? frame - t(395) : frame - t(30)
        }
      />
    </Scene>
  )
}
