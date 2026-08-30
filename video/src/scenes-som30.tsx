import type { CSSProperties, ReactNode } from 'react'
import { useCurrentFrame } from 'remotion'

import { theme } from './theme'
import { FnX, Opgave, VHerschreven, Xp } from './som30-helpers'
import { FactorLabel, Fn, RegelKaart, sceneTitelStijl } from './scenes-regels'
import {
  AafCorner,
  captionStyle,
  Chip,
  Circled,
  FadeUp,
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
 * bijv. voor zelf inspreken. Scèneduren in Som30Video.tsx en de cues in
 * cues-som30.ts schalen mee via dezelfde factor.
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

const rijStijl: CSSProperties = { display: 'flex', alignItems: 'center', gap: 40, width: 1180 }

/* ── Scène 1 · H2 · #30 ──────────────────────────────────────────────────── */
export function Som30Intro() {
  const frame = useCurrentFrame()
  return (
    <Scene>
      <FadeUp from={t(10)}>
        <h1 style={titleStyle}>
          H2 · <span style={{ color: groen }}>#30</span>
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
export function Som30Analyse() {
  const frame = useCurrentFrame()
  return (
    <Scene>
      <FadeUp from={t(10)}>
        <h2 style={sceneTitelStijl}>
          Stap 0 · <span style={{ color: groen }}>Analyseer de buitenste schil</span>
        </h2>
      </FadeUp>
      {/* De som; de twee delen worden omcirkeld, de − splitst en blijft buiten */}
      <FadeUp from={t(20)}>
        <div style={{ ...mathStyle, fontSize: 54 }}>
          <FnX naam="k" /> ={' '}
          <span style={{ margin: '0 18px' }}>
            <Circled from={t(370)} color={groen}>
              <span>5</span>
            </Circled>
          </span>
          <span style={{ margin: '0 36px' }}>−</span>
          <Circled from={t(430)} color={rood}>
            <span>
              3(
              <Xp n={4} /> − <X />)(<X /> + 1)
            </span>
          </Circled>
        </div>
      </FadeUp>
      <Pop from={t(640)}>
        <Chip color={groen} bg={theme.accentLight}>
          Somregel!
        </Chip>
      </Pop>
      {/* De somregel komt in beeld */}
      <FadeUp from={t(700)}>
        <RegelKaart fontSize={40}>
          <Fn naam="f" vanX /> = <Fn naam="u" vanX /> + <Fn naam="v" vanX />{' '}
          <span style={{ color: groen }}>⟹</span> <Fn naam="f" accent vanX /> ={' '}
          <span style={{ color: groen }}>
            <Fn naam="u" accent vanX /> + <Fn naam="v" accent vanX />
          </span>
        </RegelKaart>
      </FadeUp>
      <AafCorner pose={frame >= t(360) ? 'point' : 'idle'} poseFrame={frame - t(360)} />
    </Scene>
  )
}

/* ── Scène 3 · De somregel: stap 1 en 2 ─────────────────────────────── */
export function Som30Somregel() {
  const frame = useCurrentFrame()
  return (
    <Scene>
      <FadeUp from={t(5)}>
        <h2 style={sceneTitelStijl}>
          De <span style={{ color: groen }}>somregel</span>
        </h2>
      </FadeUp>
      <FadeUp from={t(5)}>
        <RegelKaart fontSize={38}>
          <Fn naam="f" vanX /> = <Fn naam="u" vanX /> + <Fn naam="v" vanX />{' '}
          <span style={{ color: groen }}>⟹</span> <Fn naam="f" accent vanX /> ={' '}
          <span style={{ color: groen }}>
            <Fn naam="u" accent vanX /> + <Fn naam="v" accent vanX />
          </span>
        </RegelKaart>
      </FadeUp>
      {/* De som met u en v eronder gelabeld (de − splitst en blijft los) */}
      <FadeUp from={t(5)}>
        <div style={{ ...mathStyle, fontSize: 46, paddingBottom: 40 }}>
          <FnX naam="k" /> ={' '}
          <FactorLabel label="u(x)" from={t(100)}>
            <span>5</span>
          </FactorLabel>
          <span style={{ margin: '0 14px' }}>−</span>
          <FactorLabel label="v(x)" from={t(100)}>
            <span>
              3(
              <Xp n={4} /> − <X />)(<X /> + 1)
            </span>
          </FactorLabel>
        </div>
      </FadeUp>
      {/* Stap 1 */}
      <div style={rijStijl}>
        <Pop from={t(20)}>
          <StapLabel>
            Stap 1 · kies <em>u</em> en <em>v</em>
          </StapLabel>
        </Pop>
        <FadeUp from={t(115)}>
          <div style={{ ...mathStyle, fontSize: 36 }}>
            <FnX naam="u" /> = 5
            <span style={{ ...captionStyle, fontSize: 28, margin: '0 24px' }}>en</span>
            <FnX naam="v" /> = 3(
            <Xp n={4} /> − <X />)(<X /> + 1)
          </div>
        </FadeUp>
      </div>
      {/* Stap 2: u′ direct, v herschrijven */}
      <div style={{ ...rijStijl, alignItems: 'flex-start' }}>
        <Pop from={t(330)}>
          <StapLabel>
            Stap 2 · bereken <em>u</em>′ en <em>v</em>′
          </StapLabel>
        </Pop>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <FadeUp from={t(390)}>
            <div style={{ ...mathStyle, fontSize: 36 }}>
              <FnX naam="u" accent /> = <span style={{ color: groen }}>0</span>
              <span style={{ ...captionStyle, fontSize: 26, marginLeft: 24 }}>
                (er zit geen <X /> in)
              </span>
            </div>
          </FadeUp>
          <FadeUp from={t(490)}>
            <div style={{ ...mathStyle, fontSize: 36 }}>
              <FnX naam="v" /> = 3(
              <Xp n={4} /> − <X />)(<X /> + 1)
            </div>
          </FadeUp>
          <FadeUp from={t(590)}>
            <div style={{ ...captionStyle, fontSize: 30, textAlign: 'left' }}>↓</div>
          </FadeUp>
          <FadeUp from={t(620)}>
            <div style={{ ...mathStyle, fontSize: 36 }}>
              <FnX naam="v" /> ={' '}
              <span style={{ color: rood }}>
                <VHerschreven />
              </span>
            </div>
          </FadeUp>
          <FadeUp from={t(750)}>
            <p style={{ ...captionStyle, fontSize: 26, margin: 0, textAlign: 'left' }}>
              handig: haal de 3 naar binnen, dan zie je twee losse factoren staan
            </p>
          </FadeUp>
        </div>
      </div>
      <Pop from={t(980)}>
        <Chip color={rood} bg={theme.accent2Light}>
          Productregel!
        </Chip>
      </Pop>
      <AafCorner
        pose={frame >= t(390) ? 'nod' : frame >= t(30) ? 'point' : 'idle'}
        poseFrame={frame >= t(390) ? frame - t(390) : frame - t(30)}
      />
    </Scene>
  )
}

/* ── Scène 4 · De productregel: v′ uitrekenen met g en h ────────────── */
export function Som30Productregel() {
  const frame = useCurrentFrame()
  const formuleRegel: CSSProperties = { ...mathStyle, fontSize: 36 }
  return (
    <Scene>
      {/* Regel en onze v staan klaar zodra de scène begint */}
      <FadeUp from={t(5)}>
        <h2 style={sceneTitelStijl}>
          De <span style={{ color: rood }}>productregel</span>
        </h2>
      </FadeUp>
      <FadeUp from={t(5)}>
        <RegelKaart fontSize={38}>
          <Fn naam="f" vanX /> = <Fn naam="g" vanX /> · <Fn naam="h" vanX />{' '}
          <span style={{ color: groen }}>⟹</span> <Fn naam="f" accent vanX /> ={' '}
          <span style={{ color: groen }}>
            <Fn naam="g" accent vanX /> · <Fn naam="h" vanX /> + <Fn naam="g" vanX /> ·{' '}
            <Fn naam="h" accent vanX />
          </span>
        </RegelKaart>
      </FadeUp>
      <FadeUp from={t(5)}>
        <div style={{ ...mathStyle, fontSize: 42 }}>
          <FnX naam="v" /> = <VHerschreven />
        </div>
      </FadeUp>
      {/* Stap 1 */}
      <div style={rijStijl}>
        <Pop from={t(85)}>
          <StapLabel>
            Stap 1 · kies <em>g</em> en <em>h</em>
          </StapLabel>
        </Pop>
        <FadeUp from={t(115)}>
          <div style={{ ...mathStyle, fontSize: 36 }}>
            <FnX naam="g" /> = 3<Xp n={4} /> − 3<X />
            <span style={{ ...captionStyle, fontSize: 28, margin: '0 24px' }}>en</span>
            <FnX naam="h" /> = <X /> + 1
          </div>
        </FadeUp>
      </div>
      {/* Stap 2 */}
      <div style={rijStijl}>
        <Pop from={t(250)}>
          <StapLabel>
            Stap 2 · bereken <em>g</em>′ en <em>h</em>′
          </StapLabel>
        </Pop>
        <FadeUp from={t(280)}>
          <div style={{ ...mathStyle, fontSize: 36, color: groen }}>
            <FnX naam="g" accent /> = 12<Xp n={3} /> − 3
            <span style={{ ...captionStyle, fontSize: 28, margin: '0 24px' }}>en</span>
            <FnX naam="h" accent /> = 1
          </div>
        </FadeUp>
      </div>
      {/* Stap 3: formule opschrijven, invullen, haakjes wegwerken, uitkomst */}
      <div style={{ ...rijStijl, alignItems: 'flex-start' }}>
        <Pop from={t(465)}>
          <StapLabel>Stap 3 · vul de formule in</StapLabel>
        </Pop>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <FadeUp from={t(530)}>
            <div style={formuleRegel}>
              <FnX naam="v" accent /> ={' '}
              <span style={{ color: groen }}>
                <FnX naam="g" accent /> · <FnX naam="h" /> + <FnX naam="g" /> ·{' '}
                <FnX naam="h" accent />
              </span>
            </div>
          </FadeUp>
          <FadeUp from={t(745)}>
            <div style={formuleRegel}>
              <FnX naam="v" accent /> ={' '}
              <span style={{ color: groen }}>
                (12
                <Xp n={3} /> − 3)
              </span>{' '}
              · (<X /> + 1) + (3
              <Xp n={4} /> − 3<X />) · <span style={{ color: groen }}>1</span>
            </div>
          </FadeUp>
          <FadeUp from={t(985)}>
            <div style={formuleRegel}>
              <FnX naam="v" accent /> = 12
              <Xp n={4} /> + 12
              <Xp n={3} /> − 3<X /> − 3 + 3<Xp n={4} /> − 3<X />
            </div>
          </FadeUp>
          <Pop from={t(1320)}>
            <div style={{ ...mathStyle, fontSize: 44 }}>
              <FnX naam="v" accent /> ={' '}
              <span style={{ color: groen }}>
                15
                <Xp n={4} /> + 12
                <Xp n={3} /> − 6<X /> − 3
              </span>
            </div>
          </Pop>
        </div>
      </div>
      <AafCorner
        pose={frame >= t(280) ? 'nod' : frame >= t(30) ? 'point' : 'idle'}
        poseFrame={frame >= t(280) ? frame - t(280) : frame - t(30)}
      />
    </Scene>
  )
}

/* ── Scène 5 · Voeg alles samen ─────────────────────────────────────── */
export function Som30Samen() {
  const frame = useCurrentFrame()
  return (
    <Scene>
      <FadeUp from={t(10)}>
        <h2 style={sceneTitelStijl}>
          Voeg alles <span style={{ color: groen }}>samen</span>
        </h2>
      </FadeUp>
      <FadeUp from={t(25)}>
        <Opgave fontSize={54} />
      </FadeUp>
      <FadeUp from={t(80)}>
        <div style={{ ...mathStyle, fontSize: 50 }}>
          <FnX naam="k" accent /> = <FnX naam="u" accent /> − <FnX naam="v" accent />
        </div>
      </FadeUp>
      <FadeUp from={t(225)}>
        <div style={{ ...mathStyle, fontSize: 46 }}>
          <FnX naam="k" accent /> = <span style={{ color: theme.textMuted }}>0</span> − (15
          <Xp n={4} /> + 12
          <Xp n={3} /> − 6<X /> − 3)
        </div>
      </FadeUp>
      <FadeUp from={t(455)}>
        <p style={{ ...captionStyle, fontSize: 26, margin: 0 }}>
          de min gaat over álle termen heen
        </p>
      </FadeUp>
      <Pop from={t(560)}>
        <div style={{ ...mathStyle, fontSize: 58 }}>
          <FnX naam="k" accent /> ={' '}
          <span style={{ color: groen }}>
            −15
            <Xp n={4} /> − 12
            <Xp n={3} /> + 6<X /> + 3
          </span>
        </div>
      </Pop>
      <AafCorner pose={frame >= t(585) ? 'jump' : 'idle'} poseFrame={frame - t(585)} />
    </Scene>
  )
}
