import type { ReactNode } from 'react'
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'

import { Aaf, type AafPose } from './Aaf'
import { theme } from './theme'

/**
 * Staand beeld (1080×1920) voor een Short. Letters zijn groot genoeg voor een
 * telefoon: 1080 px breed wordt op een scherm ongeveer een derde.
 * De ondertitel en Aaf staan boven de knoppen van YouTube.
 */
export function ShortScene({
  children,
  caption,
  pose,
}: {
  children: ReactNode
  caption: string
  pose: AafPose
}) {
  const frame = useCurrentFrame()
  return (
    <AbsoluteFill style={{ backgroundColor: theme.surface }}>
      <div
        style={{
          position: 'absolute',
          top: 96,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: theme.fontSerif,
          fontSize: 44,
          color: theme.text,
        }}
      >
        <Sitenaam />
      </div>
      <div
        style={{
          position: 'absolute',
          top: 200,
          left: 48,
          right: 48,
          bottom: 640,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 36,
          textAlign: 'center',
        }}
      >
        {children}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 40,
          right: 40,
          bottom: 400,
          display: 'flex',
          alignItems: 'flex-end',
          gap: 20,
        }}
      >
        <Caption>{caption}</Caption>
        <Aaf size={168} pose={pose} poseFrame={frame} />
      </div>
    </AbsoluteFill>
  )
}

export function Sitenaam({ groot = false }: { groot?: boolean }) {
  return (
    <span style={{ fontSize: groot ? 78 : undefined, lineHeight: 1.15 }}>
      integraal
      <span style={{ color: theme.accent }}>oefenen</span>
      .nl
    </span>
  )
}

function Caption({ children }: { children: string }) {
  const frame = useCurrentFrame()
  const opacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  return (
    <div
      style={{
        flex: 1,
        opacity,
        backgroundColor: theme.surface2,
        borderRadius: 28,
        padding: '22px 28px',
        fontFamily: theme.fontSans,
        fontSize: 46,
        fontWeight: 600,
        lineHeight: 1.25,
        color: theme.text,
        textAlign: 'left',
      }}
    >
      {children}
    </div>
  )
}

export function KortTitel({ children }: { children: ReactNode }) {
  return (
    <h1
      style={{
        fontFamily: theme.fontSerif,
        fontSize: 78,
        lineHeight: 1.12,
        color: theme.text,
        margin: 0,
        textAlign: 'center',
      }}
    >
      {children}
    </h1>
  )
}

/** Groene formulekaart, zoals in de uitlegvideo's, maar kleiner voor 9:16. */
export function KorteKaart({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        backgroundColor: theme.accentLight,
        borderRadius: 28,
        padding: '28px 36px',
        fontFamily: theme.fontSerif,
        fontSize: 48,
        lineHeight: 1.35,
        color: theme.text,
        textAlign: 'center',
        maxWidth: 980,
      }}
    >
      {children}
    </div>
  )
}

export const formuleStijl = {
  fontFamily: theme.fontSerif,
  fontSize: 84,
  lineHeight: 1.25,
  color: theme.text,
} as const

export function PlusC() {
  return <span style={{ color: theme.accent }}> + c</span>
}
