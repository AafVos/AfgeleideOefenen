import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'

import { theme } from './theme'

export type AafPose = 'idle' | 'wave' | 'point' | 'nod' | 'jump' | 'think'

type Props = {
  size?: number
  pose?: AafPose
  /** Frames sinds de pose begon; stuurt de pose-animatie (spring, demping). */
  poseFrame?: number
}

/**
 * Aaf uit de app (welcome-tour.tsx), maar frame-gestuurd i.p.v. CSS-animaties,
 * zodat Remotion deterministisch kan renderen.
 */
export function Aaf({ size = 190, pose = 'idle', poseFrame = 0 }: Props) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const t = frame / fps
  const p = Math.max(0, poseFrame)

  // Altijd actief: zachtjes deinen en af en toe knipperen (zoals in de app).
  const bobY = 2 * Math.sin((t * 2 * Math.PI) / 3.2)
  const blinkT = t % 4.2
  const blink = interpolate(blinkT, [3.85, 3.95, 4.05, 4.15], [1, 0.08, 0.08, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Pose-afhankelijke waarden
  let jumpY = 0
  let headTilt = 0
  let armRot = 0
  let armPath = 'M49 72 C 42 76, 37 83, 35 91' // rustende linkerarm
  let handDot: [number, number] | null = null

  if (pose === 'wave') {
    armPath = 'M47 72 C 38 66, 31 55, 30 44'
    armRot = 14 * Math.sin((p / fps) * 2 * Math.PI * 0.8)
  } else if (pose === 'point') {
    // Arm zwaait met een spring omhoog tot hij naar de uitleg wijst.
    armPath = 'M47 72 C 36 69, 22 64, 12 60'
    handDot = [12, 60]
    const s = spring({ frame: p, fps, config: { damping: 11 } })
    armRot = interpolate(s, [0, 1], [45, 0])
  } else if (pose === 'think') {
    // Hand krabbelt op het hoofd, hoofd iets schuin.
    armPath = 'M47 72 C 31 62, 28 42, 41 25'
    handDot = [41, 25]
    armRot = 3.5 * Math.sin(p / 3.5)
    headTilt = -7
  } else if (pose === 'nod') {
    headTilt = 5 * Math.sin((p / fps) * 2 * Math.PI * 1.5) * Math.exp(-p / 80)
  } else if (pose === 'jump') {
    // Twee-drie uitdempende hupjes.
    jumpY = -20 * Math.abs(Math.sin((Math.PI * p) / 26)) * Math.exp(-p / 55)
  }

  const mouth =
    pose === 'think'
      ? 'M48 46 C 51 45.2, 54 45.2, 57 46'
      : 'M47 45 C 50 48.5, 55 48.5, 58 45'

  const questionOpacity =
    pose === 'think'
      ? interpolate(p, [10, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
      : 0

  return (
    <svg
      viewBox="0 0 100 130"
      width={size}
      height={size * 1.3}
      style={{ overflow: 'visible', color: theme.text }}
      aria-hidden
    >
      <g transform={`translate(0 ${bobY + jumpY})`}>
        {/* linkerarm (achter het lijf) */}
        <g transform={`rotate(${armRot} 47 72)`}>
          <path
            d={armPath}
            fill="none"
            stroke="currentColor"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          {handDot && <circle cx={handDot[0]} cy={handDot[1]} r="2.8" fill="currentColor" />}
        </g>
        {/* hoofd-groep: staartjes, hoofd, pony, gezicht */}
        <g transform={`rotate(${headTilt} 52 58)`}>
          <path d="M34 33 C 25 35, 20 44, 23 52" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <path d="M70 33 C 79 35, 84 44, 81 52" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <circle cx="23" cy="52" r="2.6" fill="currentColor" />
          <circle cx="81" cy="52" r="2.6" fill="currentColor" />
          <path
            d="M52 18 C 64 17, 73 27, 72 38 C 71 50, 62 58, 51 57.5 C 40 57, 32 48, 32.5 37 C 33 27, 41 18.5, 52 18"
            fill={theme.surface} stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
          />
          <path
            d="M40 23 C 44 18, 50 17, 53 20 M53 20 C 56 16.5, 62 17.5, 64 22"
            fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"
          />
          <g transform={`translate(0 ${36 * (1 - blink)}) scale(1 ${blink})`}>
            <circle cx="46" cy="36" r="2.8" fill="currentColor" />
            <circle cx="59" cy="36" r="2.8" fill="currentColor" />
          </g>
          <path d={mouth} fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="41" cy="43" r="3.5" fill={theme.accent} opacity="0.4" />
          <circle cx="64" cy="43" r="3.5" fill={theme.accent} opacity="0.4" />
        </g>
        {/* hals */}
        <path d="M52 58 L 52 66" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        {/* jurkje */}
        <path
          d="M52 64 L 40 96 L 64 96 Z"
          fill={theme.surface} stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"
        />
        {/* rechterarm (rustend) */}
        <path d="M55 72 C 62 76, 67 83, 69 91" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
        {/* benen en voeten */}
        <path d="M47 96 C 46 104, 45 112, 44 119 M57 96 C 58 104, 59 111, 60 118" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
        <path d="M44 119 L 37 121 M60 118 L 67 119" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
        {/* vraagteken bij denken */}
        <g opacity={questionOpacity} transform={`translate(0 ${-1.5 * Math.sin(t * 2)})`}>
          <path
            d="M63 13 C 62 5.5, 74 4, 74.5 10.5 C 75 15.5, 69.5 15.5, 69.5 20.5"
            fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"
          />
          <circle cx="69.5" cy="27" r="2.2" fill="currentColor" />
        </g>
      </g>
    </svg>
  )
}
