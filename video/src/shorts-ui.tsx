import type { ReactNode } from 'react'
import { AbsoluteFill, Sequence, Audio, staticFile } from 'remotion'

import { Aaf, type AafPose } from './Aaf'
import { Ondertitels } from './ondertitels'
import { theme } from './theme'

/** Staand beeld voor een Short: 1080×1920. Logo, ondertitel, Aaf rechtsonder. */
export function ShortShell({
  titel,
  fragment,
  delay,
  pose,
  poseFrame,
  children,
}: {
  titel?: ReactNode
  fragment: string
  delay: number
  pose: AafPose
  poseFrame: number
  children?: ReactNode
}) {
  return (
    <AbsoluteFill style={{ backgroundColor: theme.surface }}>
      <div
        style={{
          position: 'absolute',
          top: 56,
          right: 48,
          fontFamily: theme.fontSerif,
          fontSize: 36,
          color: theme.text,
        }}
      >
        afgeleide<span style={{ color: theme.accent }}>oefenen</span>.nl
      </div>
      <div
        style={{
          position: 'absolute',
          top: 140,
          left: 48,
          right: 48,
          bottom: 300,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 28,
          textAlign: 'center',
        }}
      >
        {titel ? (
          <h1
            style={{
              fontFamily: theme.fontSerif,
              fontSize: 84,
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
          left: 0,
          right: 0,
          bottom: 0,
          minHeight: 300,
          backgroundColor: 'rgba(20, 32, 27, 0.94)',
          display: 'flex',
          alignItems: 'center',
          padding: '28px 210px 40px 44px',
        }}
      >
        <Ondertitels fragment={fragment} delay={delay} staand />
      </div>
      <div style={{ position: 'absolute', right: 36, bottom: 28 }}>
        <Aaf size={155} pose={pose} poseFrame={poseFrame} />
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
        padding: '22px 32px',
        fontFamily: theme.fontSerif,
        fontSize: 42,
        lineHeight: 1.35,
        color: theme.text,
        maxWidth: 960,
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
        fontSize: groot ? 78 : 60,
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
