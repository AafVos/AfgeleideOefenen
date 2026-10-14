import type { ReactNode } from 'react'
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'

import { Aaf, type AafPose } from './Aaf'
import { theme } from './theme'

/**
 * Staand beeld (1080×1920). YouTube dekt de bovenste 10%, de onderste 20% en
 * de rechter 15% af. Het logo, de som en Aaf blijven daarbinnen. De ondertitel
 * staat rond 60–70% van de hoogte, zodat hij niet onder de knoppen valt.
 */
const BREEDTE = 1080
const HOOGTE = 1920
const VEILIG_BOVEN = Math.round(HOOGTE * 0.1)
const VEILIG_RECHTS = Math.round(BREEDTE * 0.15)
const LINKSMARGE = 36
const RECHTSMARGE = VEILIG_RECHTS + 28
const INHOUD_BREED = BREEDTE - LINKSMARGE - RECHTSMARGE
const ONDERTITEL_TOP = Math.round(HOOGTE * 0.6)
const ONDERTITEL_HOOG = Math.round(HOOGTE * 0.1)

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
          top: VEILIG_BOVEN + 20,
          left: LINKSMARGE,
          width: INHOUD_BREED,
          textAlign: 'center',
          fontFamily: theme.fontSerif,
          fontSize: 52,
          color: theme.text,
        }}
      >
        <Sitenaam />
      </div>
      <div
        style={{
          position: 'absolute',
          top: VEILIG_BOVEN + 110,
          left: LINKSMARGE,
          width: INHOUD_BREED,
          bottom: HOOGTE - ONDERTITEL_TOP + 20,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 28,
          textAlign: 'center',
        }}
      >
        {children}
      </div>
      <div
        style={{
          position: 'absolute',
          top: ONDERTITEL_TOP,
          left: LINKSMARGE,
          width: INHOUD_BREED,
          height: ONDERTITEL_HOOG,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <Caption>{caption}</Caption>
        <Aaf size={140} pose={pose} poseFrame={frame} />
      </div>
    </AbsoluteFill>
  )
}

export function Sitenaam({ groot = false }: { groot?: boolean }) {
  return (
    <span style={{ fontSize: groot ? 92 : undefined, lineHeight: 1.15 }}>
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
        fontSize: 44,
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
        fontSize: 92,
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

/** Groene formulekaart. Groot genoeg om op een telefoon in één oogopslag te lezen. */
export function KorteKaart({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        backgroundColor: theme.accentLight,
        borderRadius: 28,
        padding: '28px 32px',
        fontFamily: theme.fontSerif,
        fontSize: 76,
        lineHeight: 1.3,
        color: theme.text,
        textAlign: 'center',
        maxWidth: '100%',
      }}
    >
      {children}
    </div>
  )
}

export const formuleStijl = {
  fontFamily: theme.fontSerif,
  fontSize: 156,
  lineHeight: 1.2,
  color: theme.text,
} as const

export function PlusC() {
  return <span style={{ color: theme.accent }}> + c</span>
}
