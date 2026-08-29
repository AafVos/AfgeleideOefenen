import type { CSSProperties } from 'react'
import { useCurrentFrame } from 'remotion'

import { theme } from './theme'
import {
  FactorLabel,
  kaartStijl,
  RegelKaart,
  sceneTitelStijl,
} from './scenes-regels'
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
} from './ui'

const groen = theme.accent
const rood = theme.accent2

/** Cursieve q, zoals in een boek. */
function Q() {
  return <span style={{ fontStyle: 'italic' }}>q</span>
}

/** q tot de macht n. */
function Qp({ n }: { n: number }) {
  return (
    <span>
      <Q />
      <sup style={{ fontSize: '0.6em' }}>{n}</sup>
    </span>
  )
}

/** m(q), g′(q) enz. — zoals Fn, maar met q als variabele. */
function FnQ({ naam, accent = false }: { naam: string; accent?: boolean }) {
  return (
    <span>
      <span style={{ fontStyle: 'italic' }}>{naam}</span>
      {accent && '′'}
      <span>
        (<Q />)
      </span>
    </span>
  )
}

/** De opgave: m(q) = 1 − (3q² − 2)² */
function Opgave({ fontSize = 76 }: { fontSize?: number }) {
  return (
    <div style={{ ...mathStyle, fontSize }}>
      <FnQ naam="m" /> = 1 − (3<Qp n={2} /> − 2)<sup style={{ fontSize: '0.6em' }}>2</sup>
    </div>
  )
}

/* ── Scène 1 · Intro (16,7 s) ───────────────────────────────────────── */
export function Som29Intro() {
  const frame = useCurrentFrame()
  return (
    <Scene>
      <FadeUp from={10}>
        <h1 style={titleStyle}>
          Uitleg bij <span style={{ color: groen }}>som 29</span>
        </h1>
      </FadeUp>
      <FadeUp from={170}>
        <Opgave />
      </FadeUp>
      <AafCorner pose={frame > 45 ? 'wave' : 'idle'} poseFrame={frame - 45} enterAt={10} />
    </Scene>
  )
}

/* ── Scène 2 · Herkennen (24 s) ─────────────────────────────────────── */
export function Som29Herkennen() {
  const frame = useCurrentFrame()
  return (
    <Scene>
      <FadeUp from={10}>
        <h2 style={sceneTitelStijl}>Kijk goed: wat valt op?</h2>
      </FadeUp>
      <FadeUp from={20}>
        <div style={{ ...mathStyle, fontSize: 64 }}>
          <span style={{ fontStyle: 'italic' }}>m</span>(
          <Circled from={140} color={rood}>
            <Q />
          </Circled>
          ) = 1 −{' '}
          <Circled from={330} color={groen}>
            <span>
              (3<Qp n={2} /> − 2)<sup style={{ fontSize: '0.6em' }}>2</sup>
            </span>
          </Circled>
        </div>
      </FadeUp>
      <FadeUp from={200}>
        <Chip color={rood} bg={theme.accent2Light}>
          de variabele is q — differentieer naar q
        </Chip>
      </FadeUp>
      <FadeUp from={400}>
        <div style={{ ...mathStyle, fontSize: 56 }}>
          (3<Qp n={2} /> − 2)<sup style={{ fontSize: '0.6em' }}>2</sup> = (3<Qp n={2} /> − 2){' '}
          <span style={{ color: groen }}>·</span> (3<Qp n={2} /> − 2)
        </div>
      </FadeUp>
      <Pop from={580}>
        <Chip color={groen} bg={theme.accentLight}>
          een kwadraat is een product → productregel!
        </Chip>
      </Pop>
      <AafCorner pose={frame >= 140 ? 'point' : 'idle'} poseFrame={frame - 140} />
    </Scene>
  )
}

/* ── Scène 3 · De losse delen (21,5 s) ──────────────────────────────── */
export function Som29Delen() {
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
        <h2 style={sceneTitelStijl}>De losse delen</h2>
      </FadeUp>
      <FadeUp from={20}>
        <Opgave fontSize={60} />
      </FadeUp>
      <div style={{ display: 'flex', gap: 150 }}>
        <FadeUp from={110}>
          <div style={deelKaart}>
            <div style={{ ...mathStyle, fontSize: 54 }}>1</div>
            <div style={{ ...captionStyle, fontSize: 44 }}>↓</div>
            <div style={{ ...mathStyle, fontSize: 54, color: theme.textMuted }}>0</div>
            <p style={{ ...captionStyle, fontSize: 32, margin: 0 }}>een getal valt weg</p>
          </div>
        </FadeUp>
        <FadeUp from={300}>
          <div style={deelKaart}>
            <div style={{ ...mathStyle, fontSize: 54 }}>
              <FnQ naam="g" /> = 3<Qp n={2} /> − 2
            </div>
            <div style={{ ...captionStyle, fontSize: 44 }}>↓</div>
            <div style={{ ...mathStyle, fontSize: 54, color: groen }}>
              <FnQ naam="g" accent /> = 6<Q />
            </div>
            <p style={{ ...captionStyle, fontSize: 32, margin: 0 }}>
              beide stukken van het product zijn hetzelfde
            </p>
          </div>
        </FadeUp>
      </div>
      <AafCorner pose={frame >= 480 ? 'nod' : 'idle'} poseFrame={frame - 480} />
    </Scene>
  )
}

/* ── Scène 4 · Productregel op het kwadraat (33,3 s) ────────────────── */
export function Som29Productregel() {
  const frame = useCurrentFrame()
  return (
    <Scene>
      <FadeUp from={10}>
        <h2 style={sceneTitelStijl}>
          <span style={{ color: rood }}>Productregel</span> op het kwadraat
        </h2>
      </FadeUp>
      <FadeUp from={80}>
        <RegelKaart fontSize={40}>
          <FnQ naam="f" /> = <FnQ naam="g" /> · <FnQ naam="g" />{' '}
          <span style={{ color: groen }}>⟹</span> <FnQ naam="f" accent /> ={' '}
          <span style={{ color: groen }}>
            <FnQ naam="g" accent /> · <FnQ naam="g" /> + <FnQ naam="g" /> · <FnQ naam="g" accent />
          </span>
        </RegelKaart>
      </FadeUp>
      <FadeUp from={320}>
        <div style={{ ...mathStyle, fontSize: 50, paddingBottom: 40 }}>
          <FactorLabel label="g′(q) · g(q)" from={590}>
            <span>
              6<Q /> · (3<Qp n={2} /> − 2)
            </span>
          </FactorLabel>{' '}
          +{' '}
          <FactorLabel label="g(q) · g′(q)" from={590}>
            <span>
              (3<Qp n={2} /> − 2) · 6<Q />
            </span>
          </FactorLabel>
        </div>
      </FadeUp>
      <Pop from={620}>
        <Chip color={groen} bg={theme.accentLight}>
          twee keer precies dezelfde term!
        </Chip>
      </Pop>
      <Pop from={730}>
        <div style={{ ...mathStyle, fontSize: 58 }}>
          = <span style={{ color: groen }}>2</span> · 6<Q />
          (3<Qp n={2} /> − 2)
        </div>
      </Pop>
      <AafCorner
        pose={frame >= 620 ? 'nod' : frame >= 100 ? 'point' : 'idle'}
        poseFrame={frame >= 620 ? frame - 620 : frame - 100}
      />
    </Scene>
  )
}

/* ── Scène 5 · De min ervoor (17 s) ─────────────────────────────────── */
export function Som29Min() {
  const frame = useCurrentFrame()
  return (
    <Scene>
      <FadeUp from={10}>
        <h2 style={sceneTitelStijl}>Vergeet de min niet</h2>
      </FadeUp>
      <FadeUp from={20}>
        <div style={{ ...mathStyle, fontSize: 56 }}>
          <FnQ naam="m" /> = 1{' '}
          <Circled from={60} color={rood}>
            <span style={{ color: rood }}>−</span>
          </Circled>{' '}
          (3<Qp n={2} /> − 2)<sup style={{ fontSize: '0.6em' }}>2</sup>
        </div>
      </FadeUp>
      <FadeUp from={140}>
        <div style={{ ...mathStyle, fontSize: 58 }}>
          <FnQ naam="m" accent /> = <span style={{ color: rood }}>−</span>2 · 6<Q />
          (3<Qp n={2} /> − 2)
        </div>
      </FadeUp>
      <Pop from={290}>
        <div style={{ ...mathStyle, fontSize: 66 }}>
          <FnQ naam="m" accent /> = <span style={{ color: groen }}>−12</span>
          <Q />
          (3<Qp n={2} /> − 2)
        </div>
      </Pop>
      <AafCorner pose={frame >= 420 ? 'jump' : 'idle'} poseFrame={frame - 420} />
    </Scene>
  )
}

/* ── Scène 6 · Samenvatting (20,5 s) ────────────────────────────────── */
export function Som29Samenvatting() {
  const frame = useCurrentFrame()
  const itemStijl: CSSProperties = {
    fontFamily: theme.fontSans,
    fontSize: 44,
    color: theme.text,
    display: 'flex',
    alignItems: 'center',
    gap: 24,
    textAlign: 'left',
  }
  const nummerStijl: CSSProperties = { fontFamily: theme.fontSerif, color: groen, fontSize: 52 }
  return (
    <Scene>
      <FadeUp from={10}>
        <h2 style={{ ...titleStyle, fontSize: 72 }}>Samengevat</h2>
      </FadeUp>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 30, maxWidth: 1180 }}>
        <FadeUp from={60}>
          <div style={itemStijl}>
            <span style={nummerStijl}>1.</span>
            <span>
              Check de <strong>variabele</strong> — hier is dat <em>q</em>, geen <em>x</em>
            </span>
          </div>
        </FadeUp>
        <FadeUp from={190}>
          <div style={itemStijl}>
            <span style={nummerStijl}>2.</span>
            <span>
              Een <strong>kwadraat is een product</strong> →{' '}
              <strong style={{ color: rood }}>productregel</strong>
            </span>
          </div>
        </FadeUp>
        <FadeUp from={330}>
          <div style={itemStijl}>
            <span style={nummerStijl}>3.</span>
            <span>
              Een <strong>los getal</strong> valt weg bij het differentiëren
            </span>
          </div>
        </FadeUp>
        <FadeUp from={440}>
          <div style={itemStijl}>
            <span style={nummerStijl}>4.</span>
            <span>
              Staat er een <strong style={{ color: rood }}>min</strong> voor? Neem hem mee!
            </span>
          </div>
        </FadeUp>
      </div>
      <FadeUp from={540}>
        <p style={{ ...captionStyle, fontFamily: theme.fontSerif, fontSize: 54, color: theme.text }}>
          Succes!
        </p>
      </FadeUp>
      <AafCorner pose={frame >= 520 ? 'wave' : 'idle'} poseFrame={frame - 520} />
    </Scene>
  )
}
