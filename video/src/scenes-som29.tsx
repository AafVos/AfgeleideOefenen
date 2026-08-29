import type { CSSProperties, ReactNode } from 'react'
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'

import { theme } from './theme'
import { FnQ, Opgave, Q, Qp } from './som29-helpers'
import { Fn, kaartStijl, RegelKaart, sceneTitelStijl } from './scenes-regels'
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

/* ── Scène 1 · #29 (7 s) ────────────────────────────────────────────── */
export function Som29Intro() {
  const frame = useCurrentFrame()
  return (
    <Scene>
      <FadeUp from={10}>
        <h1 style={{ ...titleStyle, color: groen }}>#29</h1>
      </FadeUp>
      <FadeUp from={40}>
        <Opgave />
      </FadeUp>
      <AafCorner pose={frame > 45 ? 'wave' : 'idle'} poseFrame={frame - 45} enterAt={10} />
    </Scene>
  )
}

/* ── Scène 2 · Herkennen en herschrijven (39 s) ─────────────────────── */
export function Som29Herkennen() {
  const frame = useCurrentFrame()
  const pijl = <div style={{ ...captionStyle, fontSize: 40 }}>↓</div>
  return (
    <Scene>
      {/* De som bovenaan; de q licht even op en de twee delen worden omcirkeld */}
      <FadeUp from={20}>
        <div style={{ ...mathStyle, fontSize: 60 }}>
          <span style={{ fontStyle: 'italic' }}>m</span>(
          <Marker from={30} until={195}>
            <Q />
          </Marker>
          ) ={' '}
          <span style={{ margin: '0 18px' }}>
            <Circled from={240} color={groen}>
              <span>1</span>
            </Circled>
          </span>
          <span style={{ marginLeft: 10 }}>
            <Circled from={300} color={rood}>
              <span>
                − (3<Qp n={2} /> − 2)<sup style={{ fontSize: '0.6em' }}>2</sup>
              </span>
            </Circled>
          </span>
        </div>
      </FadeUp>
      <FadeUp from={610}>{pijl}</FadeUp>
      {/* De 1 doet niet meer mee */}
      <FadeUp from={635}>
        <div style={{ ...mathStyle, fontSize: 56 }}>
          <FnQ naam="m" /> ={' '}
          <CrossOut from={660}>
            <span style={{ color: theme.textMuted }}>1</span>
          </CrossOut>{' '}
          − (3<Qp n={2} /> − 2)<sup style={{ fontSize: '0.6em' }}>2</sup>
        </div>
      </FadeUp>
      <FadeUp from={860}>{pijl}</FadeUp>
      {/* Kwadraat uitgeschreven als product */}
      <FadeUp from={885}>
        <div style={{ ...mathStyle, fontSize: 56 }}>
          <FnQ naam="m" /> ={' '}
          <CrossOut from={885}>
            <span style={{ color: theme.textMuted }}>1</span>
          </CrossOut>{' '}
          − (3<Qp n={2} /> − 2) <span style={{ color: rood }}>·</span> (3<Qp n={2} /> − 2)
        </div>
      </FadeUp>
      <Pop from={1090}>
        <Chip color={rood} bg={theme.accent2Light}>
          Productregel!
        </Chip>
      </Pop>
      <AafCorner pose={frame >= 240 ? 'point' : 'idle'} poseFrame={frame - 240} />
    </Scene>
  )
}

/**
 * Stap-chipje voor het stappenplan: verschijnt klein, en popt groot en
 * groen op zodra de stap aan de beurt is (`activeAt`).
 */
function StapChip({
  n,
  activeAt,
  children,
}: {
  n: number
  activeAt: number
  children: ReactNode
}) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const actief = frame >= activeAt
  const s = actief ? spring({ frame: frame - activeAt, fps, config: { damping: 9, stiffness: 190 } }) : 0
  const scale = 1 + 0.16 * s
  return (
    <span
      style={{
        display: 'inline-block',
        transform: `scale(${scale})`,
        fontFamily: theme.fontSans,
        fontSize: 27,
        fontWeight: 600,
        color: actief ? '#ffffff' : groen,
        backgroundColor: actief ? groen : theme.accentLight,
        borderRadius: 999,
        padding: '8px 22px',
        transition: 'none',
      }}
    >
      Stap {n} · {children}
    </span>
  )
}

/* ── Scène 3 · Productregel + stappenplan (57 s) ────────────────────── */
export function Som29Productregel() {
  const frame = useCurrentFrame()
  const deelKaart: CSSProperties = {
    ...kaartStijl,
    backgroundColor: theme.surface,
    borderColor: groen,
    padding: '18px 48px',
    gap: 10,
  }
  const formuleRegel: CSSProperties = { ...mathStyle, fontSize: 40 }
  return (
    <Scene>
      <FadeUp from={10}>
        <h2 style={sceneTitelStijl}>
          De <span style={{ color: rood }}>productregel</span>
        </h2>
      </FadeUp>
      {/* De regel altijd in hetzelfde format, met x */}
      <FadeUp from={30}>
        <RegelKaart fontSize={40}>
          <Fn naam="f" vanX /> = <Fn naam="g" vanX /> · <Fn naam="h" vanX />{' '}
          <span style={{ color: groen }}>⟹</span> <Fn naam="f" accent vanX /> ={' '}
          <span style={{ color: groen }}>
            <Fn naam="g" accent vanX /> · <Fn naam="h" vanX /> + <Fn naam="g" vanX /> ·{' '}
            <Fn naam="h" accent vanX />
          </span>
        </RegelKaart>
      </FadeUp>
      {/* Stappenplan: meteen in beeld, popt per stap groot op */}
      <div style={{ display: 'flex', gap: 20 }}>
        <Pop from={100}>
          <StapChip n={1} activeAt={610}>
            kies <span style={{ fontStyle: 'italic' }}>g</span> en{' '}
            <span style={{ fontStyle: 'italic' }}>h</span>
          </StapChip>
        </Pop>
        <Pop from={140}>
          <StapChip n={2} activeAt={760}>
            bepaal de afgeleiden
          </StapChip>
        </Pop>
        <Pop from={180}>
          <StapChip n={3} activeAt={860}>
            vul de formule in
          </StapChip>
        </Pop>
      </div>
      {/* Onze eigen functie: zelfde regel, maar met q */}
      <FadeUp from={330}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{ ...mathStyle, fontSize: 44 }}>
            <FnQ naam="m" /> ={' '}
            <CrossOut from={330}>
              <span style={{ color: theme.textMuted }}>1</span>
            </CrossOut>{' '}
            − (3<Qp n={2} /> − 2) · (3<Qp n={2} /> − 2)
          </div>
          <p style={{ ...captionStyle, fontSize: 32, margin: 0 }}>
            zelfde regel — bij ons is de variabele <em>q</em> in plaats van <em>x</em>
          </p>
        </div>
      </FadeUp>
      <div style={{ display: 'flex', gap: 120 }}>
        <FadeUp from={630}>
          <div style={deelKaart}>
            <div style={{ ...mathStyle, fontSize: 44 }}>
              <FnQ naam="g" /> = 3<Qp n={2} /> − 2
            </div>
            <FadeUp from={780}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ ...captionStyle, fontSize: 34 }}>↓</div>
                <div style={{ ...mathStyle, fontSize: 44, color: groen }}>
                  <FnQ naam="g" accent /> = 6<Q />
                </div>
              </div>
            </FadeUp>
          </div>
        </FadeUp>
        <FadeUp from={670}>
          <div style={deelKaart}>
            <div style={{ ...mathStyle, fontSize: 44 }}>
              <FnQ naam="h" /> = 3<Qp n={2} /> − 2
            </div>
            <FadeUp from={820}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ ...captionStyle, fontSize: 34 }}>↓</div>
                <div style={{ ...mathStyle, fontSize: 44, color: groen }}>
                  <FnQ naam="h" accent /> = 6<Q />
                </div>
              </div>
            </FadeUp>
          </div>
        </FadeUp>
      </div>
      {/* Stap 3: eerst de formule met g en h, dan ingevuld, dan het resultaat */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <FadeUp from={890}>
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
        <FadeUp from={1170}>
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
        <Pop from={1460}>
          <div style={{ ...mathStyle, fontSize: 54 }}>
            <FnQ naam="m" accent /> = <span style={{ color: groen }}>−12</span>
            <Q />
            (3<Qp n={2} /> − 2)
          </div>
        </Pop>
      </div>
      <AafCorner
        pose={frame >= 1620 ? 'jump' : frame >= 780 ? 'nod' : frame >= 50 ? 'point' : 'idle'}
        poseFrame={frame >= 1620 ? frame - 1620 : frame >= 780 ? frame - 780 : frame - 50}
      />
    </Scene>
  )
}
