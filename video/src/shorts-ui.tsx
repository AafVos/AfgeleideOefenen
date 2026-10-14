import type { ReactNode } from 'react'
import { AbsoluteFill, Sequence, Audio, staticFile } from 'remotion'

import { Aaf, type AafPose } from './Aaf'
import { theme } from './theme'

/**
 * Staand beeld 1080×1920.
 * YouTube dekt de bovenste 10% (zoekicoon), de onderste 20% (titel en kanaal)
 * en de rechter 15% (knoppen). Ondertitel zit op 60–70% van de hoogte.
 * Logo en Aaf blijven links daarvan, niets belangrijks onderaan of rechts.
 */
const HOOGTE = 1920
const RECHTS_VRIJ = Math.round(1080 * 0.15) + 16
const ONDERTITEL_TOP = Math.round(HOOGTE * 0.6)
const ONDERTITEL_HOOG = Math.round(HOOGTE * 0.1)

export function ShortShell({
  titel,
  caption,
  pose,
  poseFrame,
  children,
}: {
  titel?: ReactNode
  caption: string
  pose: AafPose
  poseFrame: number
  children?: ReactNode
}) {
  return (
    <AbsoluteFill style={{ backgroundColor: theme.surface }}>
      <div
        style={{
          position: 'absolute',
          top: Math.round(HOOGTE * 0.1) + 16,
          left: 40,
          fontFamily: theme.fontSerif,
          fontSize: 40,
          color: theme.text,
        }}
      >
        afgeleide<span style={{ color: theme.accent }}>oefenen</span>.nl
      </div>
      <div
        style={{
          position: 'absolute',
          top: Math.round(HOOGTE * 0.1) + 88,
          left: 36,
          right: RECHTS_VRIJ,
          bottom: HOOGTE - ONDERTITEL_TOP + 12,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 22,
          textAlign: 'center',
        }}
      >
        {titel ? (
          <h1
            style={{
              fontFamily: theme.fontSerif,
              fontSize: 72,
              lineHeight: 1.1,
              color: theme.text,
              margin: 0,
            }}
          >
            {titel}
          </h1>
        ) : null}
        {children}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 20,
          right: RECHTS_VRIJ,
          top: ONDERTITEL_TOP,
          height: ONDERTITEL_HOOG,
          backgroundColor: theme.surface2,
          borderRadius: 28,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 20px 12px 12px',
        }}
      >
        <Aaf size={118} pose={pose} poseFrame={poseFrame} />
        <p
          style={{
            fontFamily: theme.fontSans,
            fontSize: 46,
            fontWeight: 700,
            lineHeight: 1.2,
            color: theme.text,
            margin: 0,
            textAlign: 'left',
            flex: 1,
          }}
        >
          {caption}
        </p>
      </div>
    </AbsoluteFill>
  )
}

/** Groene regelkaart die op een telefoon mag afbreken. */
export function KorteKaart({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        backgroundColor: theme.accentLight,
        borderRadius: 28,
        padding: '28px 36px',
        fontFamily: theme.fontSerif,
        fontSize: 80,
        lineHeight: 1.3,
        color: theme.text,
        maxWidth: '100%',
      }}
    >
      {children}
    </div>
  )
}

export function Formule({
  children,
  groot = false,
  kleur,
}: {
  children: ReactNode
  groot?: boolean
  kleur?: string
}) {
  return (
    <div
      style={{
        fontFamily: theme.fontSerif,
        fontSize: groot ? 148 : 116,
        lineHeight: 1.25,
        color: kleur ?? theme.text,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        flexWrap: 'wrap',
      }}
    >
      {children}
    </div>
  )
}

export function Eindbeeld() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ fontFamily: theme.fontSerif, fontSize: 92, color: theme.text, lineHeight: 1.05 }}>
        afgeleide
      </div>
      <div style={{ fontFamily: theme.fontSerif, fontSize: 92, lineHeight: 1.05 }}>
        <span style={{ color: theme.accent }}>oefenen</span>
        <span style={{ color: theme.text }}>.nl</span>
      </div>
    </div>
  )
}

export function beatIndex(frame: number, duren: number[]) {
  let acc = 0
  for (let i = 0; i < duren.length; i++) {
    if (frame < acc + duren[i]) return i
    acc += duren[i]
  }
  return duren.length - 1
}

export function beatStart(duren: number[], index: number) {
  let acc = 0
  for (let i = 0; i < index; i++) acc += duren[i]
  return acc
}

export function totaal(duren: number[]) {
  return duren.reduce((a, b) => a + b, 0)
}

/** Fragmenten starten 15 frames na het begin van hun beat. */
export function Stemmen({ map, duren }: { map: string; duren: number[] }) {
  let from = 0
  return (
    <>
      {duren.map((dur, i) => {
        const start = from
        from += dur
        return (
          <Sequence key={i} from={start + 15} durationInFrames={Math.max(1, dur - 15)}>
            <Audio src={staticFile(`voiceover-shorts/${map}/scene-${i + 1}.mp3`)} />
          </Sequence>
        )
      })}
    </>
  )
}
