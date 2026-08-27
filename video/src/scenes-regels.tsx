import type { CSSProperties, ReactNode } from 'react'
import { useCurrentFrame } from 'remotion'

import { theme } from './theme'
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

/** x tot de macht n, in boekstijl. */
function Xp({ n }: { n: number }) {
  return (
    <span>
      <X />
      <sup style={{ fontSize: '0.6em' }}>{n}</sup>
    </span>
  )
}

/** f(x), g′, h′(x) enz.: naam + optioneel accent + optioneel (x). */
function Fn({ naam, accent = false, vanX = false }: { naam: string; accent?: boolean; vanX?: boolean }) {
  return (
    <span>
      <span style={{ fontStyle: 'italic' }}>{naam}</span>
      {accent && '′'}
      {vanX && (
        <span>
          (<X />)
        </span>
      )}
    </span>
  )
}

const kaartStijl: CSSProperties = {
  backgroundColor: theme.surface2,
  border: `3px solid ${theme.border}`,
  borderRadius: 28,
  padding: '32px 48px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 22,
}

/** Groene regel-reminder, zoals de formulekaarten in de app. */
function RegelKaart({ fontSize = 48, children }: { fontSize?: number; children: ReactNode }) {
  return (
    <div
      style={{
        backgroundColor: theme.accentLight,
        borderRadius: 24,
        padding: '22px 52px',
        fontFamily: theme.fontSerif,
        fontSize,
        color: theme.text,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </div>
  )
}

const sceneTitelStijl: CSSProperties = {
  ...titleStyle,
  fontSize: 60,
}

/* ── Scène 1 · Intro (10 s) ─────────────────────────────────────────── */
export function RegelsIntro() {
  const frame = useCurrentFrame()
  return (
    <Scene>
      <FadeUp from={60}>
        <h1 style={titleStyle}>
          <span style={{ color: groen }}>Somregel</span> of{' '}
          <span style={{ color: rood }}>productregel</span>?
        </h1>
      </FadeUp>
      <FadeUp from={130}>
        <p style={captionStyle}>kijk hoe de functie is geplakt</p>
      </FadeUp>
      <AafCorner pose={frame > 45 ? 'wave' : 'idle'} poseFrame={frame - 45} enterAt={10} />
    </Scene>
  )
}

/* ── Scène 2 · De lijm (15 s) ───────────────────────────────────────── */
export function RegelsLijm() {
  const frame = useCurrentFrame()
  return (
    <Scene>
      <FadeUp from={10}>
        <h2 style={{ ...titleStyle, fontSize: 60 }}>Hoe zijn de stukken geplakt?</h2>
      </FadeUp>
      <div style={{ display: 'flex', gap: 56, alignItems: 'stretch' }}>
        <FadeUp from={70}>
          <div style={kaartStijl}>
            <div style={{ ...mathStyle, fontSize: 72 }}>
              <Xp n={3} />{' '}
              <Circled from={130} color={groen}>
                <span style={{ color: groen }}>+</span>
              </Circled>{' '}
              5<Xp n={2} />
            </div>
            <Chip color={groen} bg={theme.accentLight}>
              plus → somregel
            </Chip>
          </div>
        </FadeUp>
        <FadeUp from={210}>
          <div style={kaartStijl}>
            <div style={{ ...mathStyle, fontSize: 72 }}>
              (<Xp n={2} /> − 4){' '}
              <Circled from={270} color={rood}>
                <span style={{ color: rood }}>·</span>
              </Circled>{' '}
              (<Xp n={3} /> + 2<X />)
            </div>
            <Chip color={rood} bg={theme.accent2Light}>
              keer → productregel
            </Chip>
          </div>
        </FadeUp>
      </div>
      <AafCorner pose={frame >= 110 ? 'point' : 'idle'} poseFrame={frame - 110} />
    </Scene>
  )
}

/* ── Scène 3 · Somregel (43 s) ──────────────────────────────────────── */
export function RegelsSom() {
  const frame = useCurrentFrame()
  const termKaart: CSSProperties = {
    ...kaartStijl,
    backgroundColor: theme.surface,
    borderColor: groen,
    padding: '20px 48px',
    gap: 14,
  }
  return (
    <Scene>
      <FadeUp from={10}>
        <h2 style={sceneTitelStijl}>
          <span style={{ color: groen }}>Somregel</span>
        </h2>
      </FadeUp>
      <FadeUp from={40}>
        <RegelKaart>
          <Fn naam="f" vanX /> = <Fn naam="g" vanX /> + <Fn naam="h" vanX />{' '}
          <span style={{ color: groen }}>⟹</span> <Fn naam="f" accent vanX /> ={' '}
          <Fn naam="g" accent vanX /> + <Fn naam="h" accent vanX />
        </RegelKaart>
      </FadeUp>
      <FadeUp from={430}>
        <div style={{ ...mathStyle, fontSize: 68, paddingBottom: 40 }}>
          <Fn naam="f" vanX /> ={' '}
          <FactorLabel label="g(x)" from={560}>
            <Xp n={3} />
          </FactorLabel>{' '}
          +{' '}
          <FactorLabel label="h(x)" from={560}>
            5<Xp n={2} />
          </FactorLabel>
        </div>
      </FadeUp>
      <div style={{ display: 'flex', gap: 150 }}>
        <FadeUp from={760}>
          <div style={termKaart}>
            <div style={{ ...mathStyle, fontSize: 54 }}>
              <Fn naam="g" vanX /> = <Xp n={3} />
            </div>
            <div style={{ ...captionStyle, fontSize: 44 }}>↓</div>
            <div style={{ ...mathStyle, fontSize: 54, color: groen }}>
              <Fn naam="g" accent vanX /> = 3<Xp n={2} />
            </div>
          </div>
        </FadeUp>
        <FadeUp from={860}>
          <div style={termKaart}>
            <div style={{ ...mathStyle, fontSize: 54 }}>
              <Fn naam="h" vanX /> = 5<Xp n={2} />
            </div>
            <div style={{ ...captionStyle, fontSize: 44 }}>↓</div>
            <div style={{ ...mathStyle, fontSize: 54, color: groen }}>
              <Fn naam="h" accent vanX /> = 10<X />
            </div>
          </div>
        </FadeUp>
      </div>
      <Pop from={1050}>
        <div style={{ ...mathStyle, fontSize: 64 }}>
          <Fn naam="f" accent vanX /> = 3<Xp n={2} />{' '}
          <span style={{ color: groen }}>+</span> 10<X />
        </div>
      </Pop>
      <AafCorner pose={frame >= 1070 ? 'nod' : 'idle'} poseFrame={frame - 1070} />
    </Scene>
  )
}

/** Factor met een gekleurd naamlabel (g of h) eronder, verschijnt op `from`. */
function FactorLabel({
  label,
  from,
  children,
}: {
  label: string
  from: number
  children: ReactNode
}) {
  const frame = useCurrentFrame()
  const opacity = frame < from ? 0 : Math.min(1, (frame - from) / 20)
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      {children}
      <span
        style={{
          position: 'absolute',
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: theme.fontSerif,
          fontStyle: 'italic',
          fontSize: 44,
          color: groen,
          opacity,
        }}
      >
        {label}
      </span>
    </span>
  )
}

/** Klein groen badge'tje: hier duikt de somregel weer op. */
function SomBadge({ from }: { from: number }) {
  return (
    <Pop from={from}>
      <span
        style={{
          fontFamily: theme.fontSans,
          fontSize: 30,
          fontWeight: 600,
          color: groen,
          backgroundColor: theme.accentLight,
          borderRadius: 999,
          padding: '6px 20px',
        }}
      >
        een som → somregel!
      </span>
    </Pop>
  )
}

/* ── Scène 4 · Productregel (57 s) ──────────────────────────────────── */
export function RegelsProduct() {
  const frame = useCurrentFrame()
  const deelKaart: CSSProperties = {
    ...kaartStijl,
    backgroundColor: theme.surface,
    borderColor: groen,
    padding: '22px 56px',
    gap: 14,
  }
  return (
    <Scene>
      <FadeUp from={10}>
        <h2 style={sceneTitelStijl}>
          <span style={{ color: rood }}>Productregel</span>
        </h2>
      </FadeUp>
      <FadeUp from={50}>
        <RegelKaart fontSize={42}>
          <Fn naam="f" vanX /> = <Fn naam="g" vanX /> · <Fn naam="h" vanX />{' '}
          <span style={{ color: groen }}>⟹</span> <Fn naam="f" accent vanX /> ={' '}
          <span style={{ color: groen }}>
            <Fn naam="g" accent vanX /> · <Fn naam="h" vanX /> + <Fn naam="g" vanX /> ·{' '}
            <Fn naam="h" accent vanX />
          </span>
        </RegelKaart>
      </FadeUp>
      <FadeUp from={470}>
        <div style={{ ...mathStyle, fontSize: 60, paddingBottom: 40 }}>
          <Fn naam="f" vanX /> ={' '}
          <FactorLabel label="g(x)" from={530}>
            (<Xp n={2} /> − 4)
          </FactorLabel>{' '}
          ·{' '}
          <FactorLabel label="h(x)" from={530}>
            (<Xp n={3} /> + 2<X />)
          </FactorLabel>
        </div>
      </FadeUp>
      <div style={{ display: 'flex', gap: 150 }}>
        <FadeUp from={870}>
          <div style={deelKaart}>
            <div style={{ ...mathStyle, fontSize: 50 }}>
              <Fn naam="g" vanX /> = <Xp n={2} /> − 4
            </div>
            <SomBadge from={960} />
            <div style={{ ...captionStyle, fontSize: 44 }}>↓</div>
            <div style={{ ...mathStyle, fontSize: 50, color: groen }}>
              <Fn naam="g" accent vanX /> = 2<X />
            </div>
          </div>
        </FadeUp>
        <FadeUp from={1170}>
          <div style={deelKaart}>
            <div style={{ ...mathStyle, fontSize: 50 }}>
              <Fn naam="h" vanX /> = <Xp n={3} /> + 2<X />
            </div>
            <SomBadge from={1290} />
            <div style={{ ...captionStyle, fontSize: 44 }}>↓</div>
            <div style={{ ...mathStyle, fontSize: 50, color: groen }}>
              <Fn naam="h" accent vanX /> = 3<Xp n={2} /> + 2
            </div>
          </div>
        </FadeUp>
      </div>
      <Pop from={1550}>
        <div style={{ ...mathStyle, fontSize: 54 }}>
          <Fn naam="f" accent vanX /> = <span style={{ color: groen }}>2<X /></span>(<Xp n={3} /> + 2
          <X />) + (<Xp n={2} /> − 4)<span style={{ color: groen }}>(3<Xp n={2} /> + 2)</span>
        </div>
      </Pop>
      <AafCorner
        pose={frame >= 1580 ? 'jump' : frame >= 70 ? 'point' : 'idle'}
        poseFrame={frame >= 1580 ? frame - 1580 : frame - 70}
      />
    </Scene>
  )
}

/* ── Scène 5 · Samenvatting (16 s) ──────────────────────────────────── */
export function RegelsSamenvatting() {
  const frame = useCurrentFrame()
  const itemStijl: CSSProperties = {
    fontFamily: theme.fontSans,
    fontSize: 46,
    color: theme.text,
    display: 'flex',
    alignItems: 'center',
    gap: 24,
    textAlign: 'left',
  }
  const nummerStijl: CSSProperties = { fontFamily: theme.fontSerif, color: groen, fontSize: 54 }
  return (
    <Scene>
      <FadeUp from={10}>
        <h2 style={{ ...titleStyle, fontSize: 72 }}>Samengevat</h2>
      </FadeUp>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 34, maxWidth: 1180 }}>
        <FadeUp from={40}>
          <div style={itemStijl}>
            <span style={nummerStijl}>1.</span>
            <span>
              Geplakt met <strong>+ of −</strong>? → <strong style={{ color: groen }}>somregel</strong>:
              term voor term differentiëren, en optellen
            </span>
          </div>
        </FadeUp>
        <FadeUp from={250}>
          <div style={itemStijl}>
            <span style={nummerStijl}>2.</span>
            <span>
              Twee stukken <strong>mét x</strong> keer elkaar? →{' '}
              <strong style={{ color: rood }}>productregel</strong>
            </span>
          </div>
        </FadeUp>
      </div>
      <FadeUp from={400}>
        <p style={{ ...captionStyle, fontFamily: theme.fontSerif, fontSize: 54, color: theme.text }}>
          Succes!
        </p>
      </FadeUp>
      <AafCorner pose={frame >= 380 ? 'wave' : 'idle'} poseFrame={frame - 380} />
    </Scene>
  )
}
