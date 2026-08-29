import type { CSSProperties, ReactNode } from 'react'
import { useCurrentFrame } from 'remotion'

import { theme } from './theme'
import { FnQ, Opgave, Q, Qp } from './som29-helpers'
import { FactorLabel, Fn, RegelKaart, sceneTitelStijl } from './scenes-regels'
import {
  AafCorner,
  captionStyle,
  Chip,
  Circled,
  FadeUp,
  Marker,
  mathStyle,
  Pop,
  Scene,
  titleStyle,
} from './ui'

const groen = theme.accent
const rood = theme.accent2

/**
 * Tempo-knop: 1 = strak AI-tempo (beats getimed op Pauline). Hoger = ruimer,
 * bijv. voor zelf inspreken. Scèneduren in Som29Video.tsx en de cues in
 * cues.ts schalen mee via dezelfde factor.
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

/* ── Scène 1 · #29 ──────────────────────────────────────────────────── */
export function Som29Intro() {
  const frame = useCurrentFrame()
  return (
    <Scene>
      <FadeUp from={t(10)}>
        <h1 style={{ ...titleStyle, color: groen }}>#29</h1>
      </FadeUp>
      <FadeUp from={t(40)}>
        <Opgave />
      </FadeUp>
      <AafCorner pose={frame > 45 ? 'wave' : 'idle'} poseFrame={frame - t(45)} enterAt={10} />
    </Scene>
  )
}

/* ── Scène 2 · Stap 0: Analyseer de vorm ────────────────────────────── */
export function Som29Analyse() {
  const frame = useCurrentFrame()
  return (
    <Scene>
      <FadeUp from={t(10)}>
        <h2 style={sceneTitelStijl}>
          Stap 0 · <span style={{ color: groen }}>Analyseer de vorm</span>
        </h2>
      </FadeUp>
      {/* De som; de q licht even op, daarna de twee delen (de − splitst) */}
      <FadeUp from={t(20)}>
        <div style={{ ...mathStyle, fontSize: 54 }}>
          <span style={{ fontStyle: 'italic' }}>m</span>(
          <Marker from={t(75)} until={t(260)}>
            <Q />
          </Marker>
          ) ={' '}
          <span style={{ margin: '0 18px' }}>
            <Circled from={t(290)} color={groen}>
              <span>1</span>
            </Circled>
          </span>
          <span style={{ margin: '0 14px' }}>−</span>
          <Circled from={t(350)} color={rood}>
            <span>
              (3<Qp n={2} /> − 2)<sup style={{ fontSize: '0.6em' }}>2</sup>
            </span>
          </Circled>
        </div>
      </FadeUp>
      <Pop from={t(430)}>
        <Chip color={groen} bg={theme.accentLight}>
          Somregel!
        </Chip>
      </Pop>
      {/* De somregel komt in beeld */}
      <FadeUp from={t(480)}>
        <RegelKaart fontSize={40}>
          <Fn naam="f" vanX /> = <Fn naam="g" vanX /> + <Fn naam="h" vanX />{' '}
          <span style={{ color: groen }}>⟹</span> <Fn naam="f" accent vanX /> ={' '}
          <span style={{ color: groen }}>
            <Fn naam="g" accent vanX /> + <Fn naam="h" accent vanX />
          </span>
        </RegelKaart>
      </FadeUp>
      <AafCorner pose={frame >= t(290) ? 'point' : 'idle'} poseFrame={frame - t(290)} />
    </Scene>
  )
}

/* ── Scène 3 · De somregel: stap 1 en 2 ─────────────────────────────── */
export function Som29Somregel() {
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
          <Fn naam="f" vanX /> = <Fn naam="g" vanX /> + <Fn naam="h" vanX />{' '}
          <span style={{ color: groen }}>⟹</span> <Fn naam="f" accent vanX /> ={' '}
          <span style={{ color: groen }}>
            <Fn naam="g" accent vanX /> + <Fn naam="h" accent vanX />
          </span>
        </RegelKaart>
      </FadeUp>
      {/* De som met g en h eronder gelabeld (de − splitst en blijft los) */}
      <FadeUp from={t(5)}>
        <div style={{ ...mathStyle, fontSize: 46, paddingBottom: 40 }}>
          <FnQ naam="m" /> ={' '}
          <FactorLabel label="g" from={t(110)}>
            <span>1</span>
          </FactorLabel>
          <span style={{ margin: '0 14px' }}>−</span>
          <FactorLabel label="h" from={t(110)}>
            <span>
              (3<Qp n={2} /> − 2)<sup style={{ fontSize: '0.6em' }}>2</sup>
            </span>
          </FactorLabel>
        </div>
      </FadeUp>
      {/* Stap 1 */}
      <div style={rijStijl}>
        <Pop from={t(70)}>
          <StapLabel>
            Stap 1 · kies <em>g</em> en <em>h</em>
          </StapLabel>
        </Pop>
        <FadeUp from={t(135)}>
          <div style={{ ...mathStyle, fontSize: 36 }}>
            <Fn naam="g" /> = 1
            <span style={{ ...captionStyle, fontSize: 28, margin: '0 24px' }}>en</span>
            <Fn naam="h" /> = (3<Qp n={2} /> − 2)<sup style={{ fontSize: '0.6em' }}>2</sup>
          </div>
        </FadeUp>
      </div>
      {/* Stap 2: g′ direct, h herschrijven */}
      <div style={{ ...rijStijl, alignItems: 'flex-start' }}>
        <Pop from={t(355)}>
          <StapLabel>
            Stap 2 · bereken <em>g</em>′ en <em>h</em>′
          </StapLabel>
        </Pop>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <FadeUp from={t(400)}>
            <div style={{ ...mathStyle, fontSize: 36 }}>
              <Fn naam="g" accent /> = <span style={{ color: groen }}>0</span>
              <span style={{ ...captionStyle, fontSize: 26, marginLeft: 24 }}>
                (er zit geen q in)
              </span>
            </div>
          </FadeUp>
          <FadeUp from={t(505)}>
            <div style={{ ...mathStyle, fontSize: 36 }}>
              <Fn naam="h" /> = (3<Qp n={2} /> − 2)<sup style={{ fontSize: '0.6em' }}>2</sup>
            </div>
          </FadeUp>
          <FadeUp from={t(590)}>
            <div style={{ ...captionStyle, fontSize: 30, textAlign: 'left' }}>↓</div>
          </FadeUp>
          <FadeUp from={t(615)}>
            <div style={{ ...mathStyle, fontSize: 36 }}>
              <Fn naam="h" /> = (3<Qp n={2} /> − 2) <span style={{ color: rood }}>·</span> (3
              <Qp n={2} /> − 2)
            </div>
          </FadeUp>
          <FadeUp from={t(665)}>
            <p style={{ ...captionStyle, fontSize: 26, margin: 0, textAlign: 'left' }}>
              handig: schrijf een kwadraat altijd op als de term keer zichzelf
            </p>
          </FadeUp>
        </div>
      </div>
      <Pop from={t(860)}>
        <Chip color={rood} bg={theme.accent2Light}>
          Productregel!
        </Chip>
      </Pop>
      <AafCorner
        pose={frame >= t(400) ? 'nod' : frame >= t(30) ? 'point' : 'idle'}
        poseFrame={frame >= t(400) ? frame - t(400) : frame - t(30)}
      />
    </Scene>
  )
}

/* ── Scène 4 · De productregel: h′ uitrekenen met u en v ────────────── */
export function Som29Productregel() {
  const frame = useCurrentFrame()
  const formuleRegel: CSSProperties = { ...mathStyle, fontSize: 36 }
  return (
    <Scene>
      {/* Regel en onze h staan klaar zodra de scène begint */}
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
          <Fn naam="h" /> = (3<Qp n={2} /> − 2) · (3<Qp n={2} /> − 2)
        </div>
      </FadeUp>
      <FadeUp from={t(130)}>
        <p style={{ ...captionStyle, fontSize: 28, margin: 0 }}>
          <em>g</em> en <em>h</em> zijn al bezet — we noemen de delen <em>u</em> en <em>v</em>
        </p>
      </FadeUp>
      {/* Stap 1 */}
      <div style={rijStijl}>
        <Pop from={t(300)}>
          <StapLabel>
            Stap 1 · kies <em>u</em> en <em>v</em>
          </StapLabel>
        </Pop>
        <FadeUp from={t(330)}>
          <div style={{ ...mathStyle, fontSize: 36 }}>
            <Fn naam="u" /> = 3<Qp n={2} /> − 2
            <span style={{ ...captionStyle, fontSize: 28, margin: '0 24px' }}>en</span>
            <Fn naam="v" /> = 3<Qp n={2} /> − 2
          </div>
        </FadeUp>
      </div>
      {/* Stap 2 */}
      <div style={rijStijl}>
        <Pop from={t(510)}>
          <StapLabel>
            Stap 2 · bereken <em>u</em>′ en <em>v</em>′
          </StapLabel>
        </Pop>
        <FadeUp from={t(545)}>
          <div style={{ ...mathStyle, fontSize: 36, color: groen }}>
            <Fn naam="u" accent /> = 6<Q />
            <span style={{ ...captionStyle, fontSize: 28, margin: '0 24px' }}>en</span>
            <Fn naam="v" accent /> = 6<Q />
          </div>
        </FadeUp>
      </div>
      {/* Stap 3: eerst de formule opschrijven, dan invullen, uitrekenen, uitkomst */}
      <div style={{ ...rijStijl, alignItems: 'flex-start' }}>
        <Pop from={t(705)}>
          <StapLabel>Stap 3 · vul de formule in</StapLabel>
        </Pop>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <FadeUp from={t(790)}>
            <div style={formuleRegel}>
              <Fn naam="h" accent /> ={' '}
              <span style={{ color: groen }}>
                <Fn naam="u" accent />
              </span>{' '}
              · <Fn naam="v" /> + <Fn naam="u" /> ·{' '}
              <span style={{ color: groen }}>
                <Fn naam="v" accent />
              </span>
            </div>
          </FadeUp>
          <FadeUp from={t(1050)}>
            <div style={formuleRegel}>
              <Fn naam="h" accent /> ={' '}
              <span style={{ color: groen }}>
                6<Q />
              </span>{' '}
              · (3<Qp n={2} /> − 2) + (3<Qp n={2} /> − 2) ·{' '}
              <span style={{ color: groen }}>
                6<Q />
              </span>
            </div>
          </FadeUp>
          <FadeUp from={t(1265)}>
            <div style={formuleRegel}>
              <Fn naam="h" accent /> = <span style={{ color: groen }}>2</span> · 6<Q />
              (3<Qp n={2} /> − 2)
            </div>
          </FadeUp>
          <Pop from={t(1410)}>
            <div style={{ ...mathStyle, fontSize: 46 }}>
              <Fn naam="h" accent /> = <span style={{ color: groen }}>12</span>
              <Q />
              (3<Qp n={2} /> − 2)
            </div>
          </Pop>
        </div>
      </div>
      <AafCorner
        pose={frame >= t(545) ? 'nod' : frame >= t(30) ? 'point' : 'idle'}
        poseFrame={frame >= t(545) ? frame - t(545) : frame - t(30)}
      />
    </Scene>
  )
}

/* ── Scène 5 · Voeg alles samen ─────────────────────────────────────── */
export function Som29Samen() {
  const frame = useCurrentFrame()
  return (
    <Scene>
      <FadeUp from={t(10)}>
        <h2 style={sceneTitelStijl}>
          Voeg alles <span style={{ color: groen }}>samen</span>
        </h2>
      </FadeUp>
      <FadeUp from={t(60)}>
        <Opgave fontSize={54} />
      </FadeUp>
      <FadeUp from={t(150)}>
        <div style={{ ...mathStyle, fontSize: 50 }}>
          <FnQ naam="m" accent /> = <Fn naam="g" accent /> − <Fn naam="h" accent />
        </div>
      </FadeUp>
      <FadeUp from={t(240)}>
        <div style={{ ...mathStyle, fontSize: 50 }}>
          <FnQ naam="m" accent /> = <span style={{ color: theme.textMuted }}>0</span> − 12
          <Q />
          (3<Qp n={2} /> − 2)
        </div>
      </FadeUp>
      <Pop from={t(370)}>
        <div style={{ ...mathStyle, fontSize: 62 }}>
          <FnQ naam="m" accent /> = <span style={{ color: groen }}>−12</span>
          <Q />
          (3<Qp n={2} /> − 2)
        </div>
      </Pop>
      <AafCorner pose={frame >= t(390) ? 'jump' : 'idle'} poseFrame={frame - t(390)} />
    </Scene>
  )
}
