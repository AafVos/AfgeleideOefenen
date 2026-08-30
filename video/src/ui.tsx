import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'

import { Aaf, type AafPose } from './Aaf'
import { theme } from './theme'

/** Witte scene-achtergrond met gecentreerd uitlegvlak (rechts ruimte voor Aaf). */
export function Scene({ children, gap = 44 }: { children: ReactNode; gap?: number }) {
  return (
    <AbsoluteFill style={{ backgroundColor: theme.surface }}>
      <div
        style={{
          position: 'absolute',
          top: 44,
          right: 64,
          fontFamily: theme.fontSerif,
          fontSize: 38,
          color: theme.text,
        }}
      >
        afgeleide<span style={{ color: theme.accent }}>oefenen</span>.nl
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          paddingLeft: 140,
          paddingRight: 420,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  )
}

/** Aaf rechtsonder, zoals in de app. Met `enterAt` schuift ze het beeld in. */
export function AafCorner({
  pose,
  poseFrame,
  enterAt,
}: {
  pose: AafPose
  poseFrame?: number
  enterAt?: number
}) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  let x = 0
  let opacity = 1
  if (enterAt !== undefined) {
    const s = spring({ frame: frame - enterAt, fps, config: { damping: 14 } })
    x = interpolate(s, [0, 1], [320, 0])
    opacity = frame < enterAt ? 0 : 1
  }
  return (
    <div
      style={{
        position: 'absolute',
        right: 64,
        bottom: 44,
        transform: `translateX(${x}px)`,
        opacity,
      }}
    >
      <Aaf size={190} pose={pose} poseFrame={poseFrame ?? frame - (enterAt ?? 0)} />
    </div>
  )
}

/** Kind verschijnt vanaf frame `from`: fade + omhoogschuiven. */
export function FadeUp({
  from,
  children,
  style,
}: {
  from: number
  children: ReactNode
  style?: CSSProperties
}) {
  const frame = useCurrentFrame()
  const opacity = interpolate(frame, [from, from + 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const y = interpolate(frame, [from, from + 20], [28, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  return <div style={{ opacity, transform: `translateY(${y}px)`, ...style }}>{children}</div>
}

/** Kind verschijnt vanaf frame `from` met een verende pop (voor ✓, antwoorden). */
export function Pop({
  from,
  children,
  style,
}: {
  from: number
  children: ReactNode
  style?: CSSProperties
}) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const s = spring({ frame: frame - from, fps, config: { damping: 10, stiffness: 160 } })
  return (
    <div
      style={{
        opacity: frame < from ? 0 : 1,
        transform: `scale(${frame < from ? 0 : s})`,
        display: 'inline-block',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/**
 * Handgetekende omcirkeling die zichzelf tekent vanaf frame `from`,
 * in de stijl van de app (wiebelige lijn, accentkleur).
 */
export function Circled({
  from,
  color = theme.accent,
  children,
}: {
  from: number
  color?: string
  children: ReactNode
}) {
  const frame = useCurrentFrame()
  const progress = interpolate(frame, [from, from + 28], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      {children}
      <svg
        viewBox="0 0 120 70"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          inset: '-22px -30px',
          width: 'calc(100% + 60px)',
          height: 'calc(100% + 44px)',
          overflow: 'visible',
          pointerEvents: 'none',
        }}
      >
        <path
          d="M60 6 C 95 4, 116 16, 115 34 C 114 54, 88 66, 57 64 C 26 62, 6 52, 7 33 C 8 15, 30 7, 68 8"
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - progress}
          opacity={progress === 0 ? 0 : 1}
        />
      </svg>
    </span>
  )
}

/** Markeerstift-highlight die op `from` verschijnt en op `until` weer vervaagt. */
export function Marker({
  from,
  until,
  color = theme.accent2Light,
  children,
}: {
  from: number
  until: number
  color?: string
  children: ReactNode
}) {
  const frame = useCurrentFrame()
  const opacity = interpolate(frame, [from, from + 15, until, until + 20], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <span
        style={{
          position: 'absolute',
          inset: '-2px -8px',
          backgroundColor: color,
          borderRadius: 12,
          opacity,
        }}
      />
      <span style={{ position: 'relative' }}>{children}</span>
    </span>
  )
}

/** Rood kruis dat zichzelf over het kind heen tekent vanaf frame `from`. */
export function CrossOut({ from, children }: { from: number; children: ReactNode }) {
  const frame = useCurrentFrame()
  const p1 = interpolate(frame, [from, from + 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const p2 = interpolate(frame, [from + 8, from + 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      {children}
      <svg
        viewBox="0 0 100 60"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          inset: '-10px -14px',
          width: 'calc(100% + 28px)',
          height: 'calc(100% + 20px)',
          overflow: 'visible',
          pointerEvents: 'none',
        }}
      >
        <path
          d="M10 7 C 35 22, 65 38, 91 54"
          fill="none" stroke={theme.accent2} strokeWidth="5" strokeLinecap="round"
          pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p1} opacity={p1 === 0 ? 0 : 1}
        />
        <path
          d="M90 8 C 66 23, 36 39, 9 53"
          fill="none" stroke={theme.accent2} strokeWidth="5" strokeLinecap="round"
          pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p2} opacity={p2 === 0 ? 0 : 1}
        />
      </svg>
    </span>
  )
}

/** Gekleurd labeltje, zoals de chips in de app. */
export function Chip({
  color,
  bg,
  children,
}: {
  color: string
  bg: string
  children: ReactNode
}) {
  return (
    <span
      style={{
        fontFamily: theme.fontSans,
        fontSize: 38,
        fontWeight: 600,
        color,
        backgroundColor: bg,
        borderRadius: 999,
        padding: '10px 30px',
      }}
    >
      {children}
    </span>
  )
}

export const titleStyle: CSSProperties = {
  fontFamily: theme.fontSerif,
  fontSize: 88,
  color: theme.text,
  textAlign: 'center',
  lineHeight: 1.15,
  margin: 0,
}

export const mathStyle: CSSProperties = {
  fontFamily: theme.fontSerif,
  fontSize: 110,
  color: theme.text,
  whiteSpace: 'nowrap',
}

export const captionStyle: CSSProperties = {
  fontFamily: theme.fontSans,
  fontSize: 42,
  color: theme.textMuted,
  textAlign: 'center',
  margin: 0,
}

/** Breuk met een echte streep: teller boven, noemer onder. */
export function Breuk({
  teller,
  noemer,
  streepKleur,
}: {
  teller: ReactNode
  noemer: ReactNode
  streepKleur?: string
}) {
  return (
    <span
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        verticalAlign: 'middle',
        margin: '0 8px',
      }}
    >
      <span style={{ padding: '0 12px 4px' }}>{teller}</span>
      <span
        style={{
          width: '100%',
          height: 3,
          borderRadius: 2,
          backgroundColor: streepKleur ?? 'currentColor',
        }}
      />
      <span style={{ padding: '4px 12px 0' }}>{noemer}</span>
    </span>
  )
}

/** Iets tot de macht n, met nette superscript. */
export function Macht({ children, n }: { children: ReactNode; n: number | string }) {
  return (
    <span>
      {children}
      <sup style={{ fontSize: '0.6em' }}>{n}</sup>
    </span>
  )
}

/** Cursieve wiskunde-x zoals in een boek. */
export function X() {
  return <span style={{ fontStyle: 'italic' }}>x</span>
}

/** x² met nette superscript. */
export function X2() {
  return (
    <span>
      <X />
      <sup style={{ fontSize: '0.6em' }}>2</sup>
    </span>
  )
}
