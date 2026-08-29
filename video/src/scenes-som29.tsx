import type { CSSProperties, ReactNode } from 'react'
import { useCurrentFrame } from 'remotion'

import { theme } from './theme'
import { FnQ, Opgave, Q, Qp } from './som29-helpers'
import { Fn, RegelKaart, sceneTitelStijl } from './scenes-regels'
import {
  AafCorner,
  captionStyle,
  Chip,
  Circled,
  CrossOut,
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
 * Tempo-knop: 1 = het oorspronkelijke (Pauline-)tempo. Hoger = ruimer,
 * zodat je bij het zelf inspreken genoeg tijd hebt. Scèneduren in
 * Som29Video.tsx en de cues in cues.ts schalen mee via dezelfde factor.
 */
export const TEMPO = 1.35
export const t = (n: number) => Math.round(n * TEMPO)

/* ── Scène 1 · #29 (7 s) ────────────────────────────────────────────── */
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

/* ── Scène 2 · Stap 0: analyseer de vorm (40 s) ─────────────────────── */
export function Som29Herkennen() {
  const frame = useCurrentFrame()
  const pijl = <div style={{ ...captionStyle, fontSize: 36 }}>↓</div>
  return (
    <Scene>
      <FadeUp from={t(10)}>
        <h2 style={sceneTitelStijl}>
          Stap 0 · <span style={{ color: groen }}>analyseer de vorm</span>
        </h2>
      </FadeUp>
      {/* De som bovenaan; de q licht even op en de twee delen worden omcirkeld */}
      <FadeUp from={t(20)}>
        <div style={{ ...mathStyle, fontSize: 54 }}>
          <span style={{ fontStyle: 'italic' }}>m</span>(
          <Marker from={t(80)} until={t(265)}>
            <Q />
          </Marker>
          ) ={' '}
          <span style={{ margin: '0 18px' }}>
            <Circled from={t(300)} color={groen}>
              <span>1</span>
            </Circled>
          </span>
          <span style={{ marginLeft: 10 }}>
            <Circled from={t(375)} color={rood}>
              <span>
                − (3<Qp n={2} /> − 2)<sup style={{ fontSize: '0.6em' }}>2</sup>
              </span>
            </Circled>
          </span>
        </div>
      </FadeUp>
      <FadeUp from={t(680)}>{pijl}</FadeUp>
      {/* De 1 doet niet meer mee */}
      <FadeUp from={t(705)}>
        <div style={{ ...mathStyle, fontSize: 50 }}>
          <FnQ naam="m" /> ={' '}
          <CrossOut from={t(735)}>
            <span style={{ color: theme.textMuted }}>1</span>
          </CrossOut>{' '}
          − (3<Qp n={2} /> − 2)<sup style={{ fontSize: '0.6em' }}>2</sup>
        </div>
      </FadeUp>
      <FadeUp from={t(915)}>{pijl}</FadeUp>
      {/* Kwadraat uitgeschreven als product */}
      <FadeUp from={t(940)}>
        <div style={{ ...mathStyle, fontSize: 50 }}>
          <FnQ naam="m" /> ={' '}
          <CrossOut from={t(940)}>
            <span style={{ color: theme.textMuted }}>1</span>
          </CrossOut>{' '}
          − (3<Qp n={2} /> − 2) <span style={{ color: rood }}>·</span> (3<Qp n={2} /> − 2)
        </div>
      </FadeUp>
      <Pop from={t(1105)}>
        <Chip color={rood} bg={theme.accent2Light}>
          Productregel!
        </Chip>
      </Pop>
      <AafCorner pose={frame >= t(300) ? 'point' : 'idle'} poseFrame={frame - t(300)} />
    </Scene>
  )
}

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

/* ── Scène 3 · Productregel + stappenplan (56 s) ────────────────────── */
export function Som29Productregel() {
  const frame = useCurrentFrame()
  const formuleRegel: CSSProperties = { ...mathStyle, fontSize: 36 }
  const rijStijl: CSSProperties = { display: 'flex', alignItems: 'center', gap: 40, width: 1180 }
  return (
    <Scene>
      {/* Regel en onze som staan klaar zodra de scène begint */}
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
          <FnQ naam="m" /> ={' '}
          <CrossOut from={t(5)}>
            <span style={{ color: theme.textMuted }}>1</span>
          </CrossOut>{' '}
          − (3<Qp n={2} /> − 2) · (3<Qp n={2} /> − 2)
        </div>
      </FadeUp>
      {/* Stap 1: label links, g en h rechts ernaast */}
      <div style={rijStijl}>
        <Pop from={t(210)}>
          <StapLabel>
            Stap 1 · kies <em>g</em> en <em>h</em>
          </StapLabel>
        </Pop>
        <FadeUp from={t(260)}>
          <div style={{ ...mathStyle, fontSize: 38 }}>
            <FnQ naam="g" /> = 3<Qp n={2} /> − 2
            <span style={{ ...captionStyle, fontSize: 30, margin: '0 26px' }}>en</span>
            <FnQ naam="h" /> = 3<Qp n={2} /> − 2
          </div>
        </FadeUp>
      </div>
      {/* Stap 2: de afgeleiden ernaast */}
      <div style={rijStijl}>
        <Pop from={t(400)}>
          <StapLabel>
            Stap 2 · bereken <em>g</em>′ en <em>h</em>′
          </StapLabel>
        </Pop>
        <FadeUp from={t(450)}>
          <div style={{ ...mathStyle, fontSize: 38, color: groen }}>
            <FnQ naam="g" accent /> = 6<Q />
            <span style={{ ...captionStyle, fontSize: 30, margin: '0 26px' }}>en</span>
            <FnQ naam="h" accent /> = 6<Q />
          </div>
        </FadeUp>
      </div>
      {/* Stap 3: uitschrijven, invullen, uitrekenen, uitkomst */}
      <div style={{ ...rijStijl, alignItems: 'flex-start' }}>
        <Pop from={t(560)}>
          <StapLabel>Stap 3 · vul de formule in</StapLabel>
        </Pop>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <FadeUp from={t(620)}>
            <div style={formuleRegel}>
              <FnQ naam="m" accent /> = <span style={{ color: theme.textMuted }}>0</span> − (
              <span style={{ color: groen }}>
                <FnQ naam="g" accent />
              </span>{' '}
              · <FnQ naam="h" /> + <FnQ naam="g" /> ·{' '}
              <span style={{ color: groen }}>
                <FnQ naam="h" accent />
              </span>
              )
            </div>
          </FadeUp>
          <FadeUp from={t(905)}>
            <div style={formuleRegel}>
              <FnQ naam="m" accent /> = <span style={{ color: theme.textMuted }}>0</span> − (
              <span style={{ color: groen }}>
                6<Q />
              </span>{' '}
              · (3<Qp n={2} /> − 2) + (3<Qp n={2} /> − 2) ·{' '}
              <span style={{ color: groen }}>
                6<Q />
              </span>
              )
            </div>
          </FadeUp>
          <FadeUp from={t(1300)}>
            <div style={formuleRegel}>
              <FnQ naam="m" accent /> = −<span style={{ color: groen }}>2</span> · 6<Q />
              (3<Qp n={2} /> − 2)
            </div>
          </FadeUp>
          <Pop from={t(1450)}>
            <div style={{ ...mathStyle, fontSize: 48 }}>
              <FnQ naam="m" accent /> = <span style={{ color: groen }}>−12</span>
              <Q />
              (3<Qp n={2} /> − 2)
            </div>
          </Pop>
        </div>
      </div>
      <AafCorner
        pose={frame >= t(1470) ? 'jump' : frame >= t(450) ? 'nod' : frame >= t(30) ? 'point' : 'idle'}
        poseFrame={frame >= t(1470) ? frame - t(1470) : frame >= t(450) ? frame - t(450) : frame - t(30)}
      />
    </Scene>
  )
}
