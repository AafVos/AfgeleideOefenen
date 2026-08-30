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

const rijStijl: CSSProperties = { display: 'flex', alignItems: 'center', gap: 36, width: 1180 }

/** (3q² − 2)², de tweede term van de opgave. */
function Kwadraat() {
  return (
    <span>
      (3
      <Qp n={2} /> − 2)<sup style={{ fontSize: '0.6em' }}>2</sup>
    </span>
  )
}

/** De somregel, met de boekletters f, g en h. */
function SomKaart({ fontSize = 38 }: { fontSize?: number }) {
  return (
    <RegelKaart fontSize={fontSize}>
      <Fn naam="f" vanX /> = <Fn naam="g" vanX /> + <Fn naam="h" vanX />{' '}
      <span style={{ color: groen }}>⟹</span> <Fn naam="f" accent vanX /> ={' '}
      <span style={{ color: groen }}>
        <Fn naam="g" accent vanX /> + <Fn naam="h" accent vanX />
      </span>
    </RegelKaart>
  )
}

/* ── Scène 1 · H2 · #29 ─────────────────────────────────────────────── */
export function Som29Intro() {
  const frame = useCurrentFrame()
  return (
    <Scene>
      <FadeUp from={t(10)}>
        <h1 style={titleStyle}>
          H2 · <span style={{ color: groen }}>#29</span>
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
export function Som29Analyse() {
  const frame = useCurrentFrame()
  return (
    <Scene>
      <FadeUp from={t(10)}>
        <h2 style={sceneTitelStijl}>
          Stap 0 · <span style={{ color: groen }}>Analyseer de buitenste schil</span>
        </h2>
      </FadeUp>
      {/* De q licht even op, daarna de twee delen; de − splitst en blijft los */}
      <FadeUp from={t(20)}>
        <div style={{ ...mathStyle, fontSize: 54 }}>
          <span style={{ fontStyle: 'italic' }}>m</span>(
          <Marker from={t(85)} until={t(255)}>
            <Q />
          </Marker>
          ) ={' '}
          <span style={{ margin: '0 18px' }}>
            <Circled from={t(290)} color={groen}>
              <span>1</span>
            </Circled>
          </span>
          <span style={{ margin: '0 36px' }}>−</span>
          <Circled from={t(350)} color={rood}>
            <Kwadraat />
          </Circled>
        </div>
      </FadeUp>
      <Pop from={t(460)}>
        <Chip color={groen} bg={theme.accentLight}>
          Somregel!
        </Chip>
      </Pop>
      <FadeUp from={t(520)}>
        <SomKaart fontSize={40} />
      </FadeUp>
      <AafCorner pose={frame >= t(290) ? 'point' : 'idle'} poseFrame={frame - t(290)} />
    </Scene>
  )
}

/* ── Scène 3 · De somregel, met de hernoeming naar p ────────────────── */
export function Som29Somregel() {
  const frame = useCurrentFrame()
  return (
    <Scene gap={20}>
      <FadeUp from={t(5)}>
        <h2 style={sceneTitelStijl}>
          De <span style={{ color: groen }}>somregel</span>
        </h2>
      </FadeUp>
      <FadeUp from={t(5)}>
        <SomKaart />
      </FadeUp>
      {/* De som met g en h eronder gelabeld (de − splitst en blijft los) */}
      <FadeUp from={t(5)}>
        <div style={{ ...mathStyle, fontSize: 44, paddingBottom: 38 }}>
          <FnQ naam="m" /> ={' '}
          <FactorLabel label="g(q)" from={t(100)}>
            <span>1</span>
          </FactorLabel>
          <span style={{ margin: '0 14px' }}>−</span>
          <FactorLabel label="h(q)" from={t(100)}>
            <Kwadraat />
          </FactorLabel>
        </div>
      </FadeUp>
      {/* Stap 1 */}
      <div style={rijStijl}>
        <Pop from={t(20)}>
          <StapLabel>
            Stap 1 · kies <em>g</em> en <em>h</em>
          </StapLabel>
        </Pop>
        <FadeUp from={t(130)}>
          <div style={{ ...mathStyle, fontSize: 34 }}>
            <FnQ naam="g" /> = 1
            <span style={{ ...captionStyle, fontSize: 26, margin: '0 22px' }}>en</span>
            <FnQ naam="h" /> = <Kwadraat />
          </div>
        </FadeUp>
      </div>
      {/* Stap 2: g′ direct, h krijgt een eigen naam en wordt herschreven */}
      <div style={{ ...rijStijl, alignItems: 'flex-start' }}>
        <Pop from={t(285)}>
          <StapLabel>
            Stap 2 · bereken <em>g</em>′ en <em>h</em>′
          </StapLabel>
        </Pop>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <FadeUp from={t(350)}>
            <div style={{ ...mathStyle, fontSize: 34 }}>
              <FnQ naam="g" accent /> = <span style={{ color: groen }}>0</span>
              <span style={{ ...captionStyle, fontSize: 25, marginLeft: 22 }}>
                (er zit geen <Q /> in)
              </span>
            </div>
          </FadeUp>
          <FadeUp from={t(480)}>
            <div style={{ ...mathStyle, fontSize: 34 }}>
              <FnQ naam="h" /> = <Kwadraat />
            </div>
          </FadeUp>
          <FadeUp from={t(535)}>
            <div style={{ ...captionStyle, fontSize: 28, textAlign: 'left' }}>↓</div>
          </FadeUp>
          <FadeUp from={t(565)}>
            <div style={{ ...mathStyle, fontSize: 34 }}>
              <FnQ naam="h" /> = (3
              <Qp n={2} /> − 2) <span style={{ color: rood }}>·</span> (3
              <Qp n={2} /> − 2)
            </div>
          </FadeUp>
          <FadeUp from={t(615)}>
            <p style={{ ...captionStyle, fontSize: 25, margin: 0, textAlign: 'left' }}>
              handig: schrijf een kwadraat altijd op als de term keer zichzelf
            </p>
          </FadeUp>
        </div>
      </div>
      <Pop from={t(870)}>
        <Chip color={rood} bg={theme.accent2Light}>
          Productregel!
        </Chip>
      </Pop>
      <AafCorner
        pose={frame >= t(350) ? 'nod' : frame >= t(30) ? 'point' : 'idle'}
        poseFrame={frame >= t(350) ? frame - t(350) : frame - t(30)}
      />
    </Scene>
  )
}

/* ── Scène 4 · De productregel: p′ uitrekenen met g en h ────────────── */
export function Som29Productregel() {
  const frame = useCurrentFrame()
  const formuleRegel: CSSProperties = { ...mathStyle, fontSize: 34 }
  return (
    <Scene gap={26}>
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
      {/* Deze pagina begint bij zijn eigen f: het deel dat we meenamen */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <FadeUp from={t(30)}>
          <p style={{ ...captionStyle, fontSize: 25, margin: 0 }}>
            de functie van de vorige pagina noemen we hier <em>f</em>
          </p>
        </FadeUp>
        <FadeUp from={t(130)}>
          <div style={{ ...mathStyle, fontSize: 40 }}>
            <FnQ naam="f" /> = (3<Qp n={2} /> − 2) · (3<Qp n={2} /> − 2)
          </div>
        </FadeUp>
      </div>
      {/* Stap 1 */}
      <div style={rijStijl}>
        <Pop from={t(310)}>
          <StapLabel>
            Stap 1 · kies <em>g</em> en <em>h</em>
          </StapLabel>
        </Pop>
        <FadeUp from={t(345)}>
          <div style={{ ...mathStyle, fontSize: 34 }}>
            <FnQ naam="g" /> = 3<Qp n={2} /> − 2
            <span style={{ ...captionStyle, fontSize: 26, margin: '0 22px' }}>en</span>
            <FnQ naam="h" /> = 3<Qp n={2} /> − 2
          </div>
        </FadeUp>
      </div>
      {/* Stap 2 */}
      <div style={rijStijl}>
        <Pop from={t(510)}>
          <StapLabel>
            Stap 2 · bereken <em>g</em>′ en <em>h</em>′
          </StapLabel>
        </Pop>
        <FadeUp from={t(545)}>
          <div style={{ ...mathStyle, fontSize: 34, color: groen }}>
            <FnQ naam="g" accent /> = 6<Q />
            <span style={{ ...captionStyle, fontSize: 26, margin: '0 22px' }}>en</span>
            <FnQ naam="h" accent /> = 6<Q />
          </div>
        </FadeUp>
      </div>
      {/* Stap 3 */}
      <div style={{ ...rijStijl, alignItems: 'flex-start' }}>
        <Pop from={t(670)}>
          <StapLabel>Stap 3 · vul de formule in</StapLabel>
        </Pop>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <FadeUp from={t(730)}>
            <div style={formuleRegel}>
              <FnQ naam="f" accent /> ={' '}
              <span style={{ color: groen }}>
                <FnQ naam="g" accent /> · <FnQ naam="h" /> + <FnQ naam="g" /> ·{' '}
                <FnQ naam="h" accent />
              </span>
            </div>
          </FadeUp>
          <FadeUp from={t(960)}>
            <div style={formuleRegel}>
              <FnQ naam="f" accent /> ={' '}
              <span style={{ color: groen }}>
                6<Q />
              </span>{' '}
              · (3<Qp n={2} /> − 2) + (3<Qp n={2} /> − 2) ·{' '}
              <span style={{ color: groen }}>
                6<Q />
              </span>
            </div>
          </FadeUp>
          <FadeUp from={t(1200)}>
            <div style={formuleRegel}>
              <FnQ naam="f" accent /> = <span style={{ color: groen }}>2</span> · 6<Q />
              (3<Qp n={2} /> − 2)
            </div>
          </FadeUp>
          <Pop from={t(1320)}>
            <div style={{ ...mathStyle, fontSize: 42 }}>
              <FnQ naam="f" accent /> = <span style={{ color: groen }}>12</span>
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
    <Scene gap={30}>
      <FadeUp from={t(10)}>
        <h2 style={sceneTitelStijl}>
          Voeg alles <span style={{ color: groen }}>samen</span>
        </h2>
      </FadeUp>
      <FadeUp from={t(30)}>
        <Opgave fontSize={50} />
      </FadeUp>
      {/* Koppel het antwoord van de vorige pagina terug aan h */}
      <FadeUp from={t(70)}>
        <div style={{ ...mathStyle, fontSize: 40 }}>
          <FnQ naam="h" accent /> = 12
          <Q />
          (3<Qp n={2} /> − 2)
        </div>
      </FadeUp>
      <FadeUp from={t(255)}>
        <div style={{ ...mathStyle, fontSize: 44 }}>
          <FnQ naam="m" accent /> = <FnQ naam="g" accent /> − <FnQ naam="h" accent />
        </div>
      </FadeUp>
      <FadeUp from={t(370)}>
        <div style={{ ...mathStyle, fontSize: 44 }}>
          <FnQ naam="m" accent /> = <span style={{ color: theme.textMuted }}>0</span> − 12
          <Q />
          (3<Qp n={2} /> − 2)
        </div>
      </FadeUp>
      <Pop from={t(485)}>
        <div style={{ ...mathStyle, fontSize: 56 }}>
          <FnQ naam="m" accent /> = <span style={{ color: groen }}>−12</span>
          <Q />
          (3<Qp n={2} /> − 2)
        </div>
      </Pop>
      <AafCorner pose={frame >= t(510) ? 'jump' : 'idle'} poseFrame={frame - t(510)} />
    </Scene>
  )
}
