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
  X2,
} from './ui'

const groen = theme.accent
const rood = theme.accent2

function Vink() {
  return <span style={{ color: groen, fontWeight: 700 }}>✓</span>
}

function Kruis() {
  return <span style={{ color: theme.textMuted }}>✗</span>
}

/* ── Scène 1 · Intro (10 s) ─────────────────────────────────────────── */
export function SceneIntro() {
  const frame = useCurrentFrame()
  return (
    <Scene>
      <FadeUp from={60}>
        <h1 style={titleStyle}>
          Wanneer kies je de
          <br />
          <span style={{ color: groen }}>som-productmethode</span>?
        </h1>
      </FadeUp>
      <FadeUp from={130}>
        <p style={captionStyle}>kwadratische vergelijkingen oplossen</p>
      </FadeUp>
      <AafCorner pose={frame > 45 ? 'wave' : 'idle'} poseFrame={frame - 45} enterAt={10} />
    </Scene>
  )
}

/* ── Scène 2 · Kijk naar de vergelijking (15 s) ─────────────────────── */
export function SceneKern() {
  const frame = useCurrentFrame()
  const pose = frame >= 110 ? 'point' : 'idle'
  return (
    <Scene>
      <FadeUp from={20}>
        <div style={mathStyle}>
          <Circled from={120}>
            <X2 />
          </Circled>
          <span> + 7</span>
          <X />
          <span> + 12 = 0</span>
        </div>
      </FadeUp>
      <FadeUp from={160}>
        <p style={captionStyle}>
          er staat <strong style={{ color: theme.text }}>geen getal</strong> voor{' '}
          <span style={{ fontFamily: theme.fontSerif }}>x²</span> &nbsp;→&nbsp; som-product kan!
        </p>
      </FadeUp>
      <AafCorner pose={pose} poseFrame={frame - 110} />
    </Scene>
  )
}

/* ── Scène 3 · Zoek twee getallen (20 s) ────────────────────────────── */
export function SceneZoeken() {
  const frame = useCurrentFrame()
  const rijStijl = {
    fontFamily: theme.fontSerif,
    fontSize: 66,
    color: theme.text,
    display: 'flex',
    alignItems: 'baseline',
    gap: 28,
  } as const
  return (
    <Scene>
      <FadeUp from={0}>
        <div style={{ ...mathStyle, fontSize: 84 }}>
          <X2 />
          <span> + </span>
          <span style={{ color: rood }}>7</span>
          <X />
          <span> + </span>
          <span style={{ color: groen }}>12</span>
          <span> = 0</span>
        </div>
      </FadeUp>
      <FadeUp from={60} style={{ display: 'flex', gap: 32 }}>
        <Chip color={groen} bg={theme.accentLight}>
          keer elkaar: 12
        </Chip>
        <Chip color={rood} bg={theme.accent2Light}>
          plus elkaar: 7
        </Chip>
      </FadeUp>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 12 }}>
        <FadeUp from={150}>
          <div style={rijStijl}>
            <span>1 × 12</span>
            <span style={{ ...captionStyle, fontSize: 48 }}>som 13</span>
            <Kruis />
          </div>
        </FadeUp>
        <FadeUp from={260}>
          <div style={rijStijl}>
            <span>2 × 6</span>
            <span style={{ ...captionStyle, fontSize: 48 }}>som 8</span>
            <Kruis />
          </div>
        </FadeUp>
        <FadeUp from={370}>
          <div style={rijStijl}>
            <span style={{ marginRight: 18 }}>
              <Circled from={445}>
                <span>3 × 4</span>
              </Circled>
            </span>
            <span style={{ ...captionStyle, fontSize: 48 }}>som 7</span>
            <Pop from={440}>
              <Vink />
            </Pop>
          </div>
        </FadeUp>
      </div>
      <AafCorner pose={frame >= 440 ? 'nod' : 'idle'} poseFrame={frame - 440} />
    </Scene>
  )
}

/* ── Scène 4 · Oplossen (10 s) ──────────────────────────────────────── */
export function SceneOplossen() {
  const frame = useCurrentFrame()
  return (
    <Scene>
      <FadeUp from={15}>
        <div style={{ ...mathStyle, fontSize: 96 }}>
          (<X /> + <span style={{ color: groen }}>3</span>)(
          <X /> + <span style={{ color: groen }}>4</span>) = 0
        </div>
      </FadeUp>
      <Pop from={110}>
        <div style={{ ...mathStyle, fontSize: 84 }}>
          <X /> = −3 <span style={{ color: theme.textMuted, fontSize: 60 }}>of</span> <X /> = −4
        </div>
      </Pop>
      <FadeUp from={190}>
        <p style={captionStyle}>
          check: 3 × 4 = 12 <Vink /> &nbsp;en&nbsp; 3 + 4 = 7 <Vink />
        </p>
      </FadeUp>
      <AafCorner pose={frame >= 130 ? 'jump' : 'idle'} poseFrame={frame - 130} />
    </Scene>
  )
}

/* ── Scène 5 · Wanneer níét? (20 s) ─────────────────────────────────── */
export function SceneWanneerNiet() {
  const frame = useCurrentFrame()
  const pose = frame >= 430 ? 'point' : frame >= 200 ? 'think' : 'idle'
  const poseFrame = frame >= 430 ? frame - 430 : frame - 200
  return (
    <Scene>
      <FadeUp from={10}>
        <h2 style={{ ...titleStyle, fontSize: 64 }}>Maar soms lukt het niet…</h2>
      </FadeUp>
      <FadeUp from={60}>
        <div style={{ ...mathStyle, fontSize: 84 }}>
          <X2 />
          <span> + </span>
          <span style={{ color: rood }}>5</span>
          <X />
          <span> + </span>
          <span style={{ color: groen }}>3</span>
          <span> = 0</span>
        </div>
      </FadeUp>
      <FadeUp from={170}>
        <div
          style={{
            fontFamily: theme.fontSerif,
            fontSize: 60,
            color: theme.text,
            display: 'flex',
            alignItems: 'baseline',
            gap: 26,
          }}
        >
          <span>1 × 3</span>
          <span style={{ ...captionStyle, fontSize: 44 }}>som 4, geen 5</span>
          <Pop from={230}>
            <span style={{ color: rood, fontWeight: 700 }}>✗</span>
          </Pop>
        </div>
      </FadeUp>
      <FadeUp from={400}>
        <div
          style={{
            backgroundColor: theme.surface2,
            border: `3px solid ${theme.border}`,
            borderRadius: 28,
            padding: '36px 56px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <p style={{ ...captionStyle, color: theme.text, fontWeight: 600, margin: 0 }}>
            geen mooie gehele getallen? → abc-formule
          </p>
          <div style={{ ...mathStyle, fontSize: 64, display: 'flex', alignItems: 'center', gap: 20 }}>
            <span>
              <X /> =
            </span>
            <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ padding: '0 16px' }}>
                −b ± <span style={{ whiteSpace: 'nowrap' }}>√</span>
                <span style={{ borderTop: `4px solid ${theme.text}` }}>
                  b<sup style={{ fontSize: '0.6em' }}>2</sup> − 4ac
                </span>
              </span>
              <span
                style={{
                  borderTop: `4px solid ${theme.text}`,
                  width: '100%',
                  textAlign: 'center',
                  paddingTop: 6,
                }}
              >
                2a
              </span>
            </span>
          </div>
        </div>
      </FadeUp>
      <AafCorner pose={pose} poseFrame={poseFrame} />
    </Scene>
  )
}

/* ── Scène 6 · Samenvatting (20 s) ──────────────────────────────────── */
export function SceneSamenvatting() {
  const frame = useCurrentFrame()
  const itemStijl = {
    fontFamily: theme.fontSans,
    fontSize: 46,
    color: theme.text,
    display: 'flex',
    alignItems: 'center',
    gap: 24,
    textAlign: 'left',
  } as const
  return (
    <Scene>
      <FadeUp from={10}>
        <h2 style={{ ...titleStyle, fontSize: 72 }}>Samengevat</h2>
      </FadeUp>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 34, maxWidth: 1150 }}>
        <FadeUp from={90}>
          <div style={itemStijl}>
            <span style={{ fontFamily: theme.fontSerif, color: groen, fontSize: 54 }}>1.</span>
            <span>
              Staat er <strong>1 (of niets)</strong> voor{' '}
              <span style={{ fontFamily: theme.fontSerif }}>x²</span>?
            </span>
          </div>
        </FadeUp>
        <FadeUp from={210}>
          <div style={itemStijl}>
            <span style={{ fontFamily: theme.fontSerif, color: groen, fontSize: 54 }}>2.</span>
            <span>
              Zie je snel <strong>twee gehele getallen</strong> met het juiste product én de juiste
              som?
            </span>
          </div>
        </FadeUp>
      </div>
      <FadeUp from={340} style={{ display: 'flex', gap: 32, marginTop: 10 }}>
        <Chip color={groen} bg={theme.accentLight}>
          2 × ja → som-product
        </Chip>
        <Chip color={theme.textMuted} bg={theme.surface2}>
          anders → abc-formule
        </Chip>
      </FadeUp>
      <FadeUp from={470}>
        <p style={{ ...captionStyle, fontFamily: theme.fontSerif, fontSize: 54, color: theme.text }}>
          Succes!
        </p>
      </FadeUp>
      <AafCorner pose={frame >= 420 ? 'wave' : 'idle'} poseFrame={frame - 420} />
    </Scene>
  )
}
