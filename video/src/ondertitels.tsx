import { useCurrentFrame, useVideoConfig } from 'remotion'

import { theme } from './theme'
import { WOORDEN, type Woord } from './woordtijden'

/** Zinnen die op het scherm passen. Liever afbreken op een punt. */
function groepen(woorden: Woord[], maxTekens: number): Woord[][] {
  const uit: Woord[][] = []
  let huidig: Woord[] = []
  let tekens = 0
  const weg = () => {
    if (huidig.length) uit.push(huidig)
    huidig = []
    tekens = 0
  }
  for (const woord of woorden) {
    const extra = woord.tekst.length + (huidig.length ? 1 : 0)
    if (huidig.length && (tekens + extra > maxTekens || huidig.length >= 5)) weg()
    huidig.push(woord)
    tekens += woord.tekst.length + (huidig.length > 1 ? 1 : 0)
    if (/[.!?]$/.test(woord.tekst)) weg()
  }
  weg()
  return uit
}

function groepNu(woorden: Woord[], t: number, maxTekens: number): Woord[] | null {
  if (t < 0) return null
  const alle = groepen(woorden, maxTekens)
  for (let i = 0; i < alle.length; i++) {
    const groep = alle[i]
    const start = groep[0].start
    const gesprokenEind = groep[groep.length - 1].eind
    const volgende = alle[i + 1]?.[0].start ?? gesprokenEind + 0.45
    // Blijf staan in een korte pauze, zodat de zin niet wegflitst tussen twee zinnen.
    const eind = Math.min(gesprokenEind + 0.7, volgende)
    if (t >= start && t < eind) return groep
  }
  return null
}

/**
 * Ondertitel in beeld, op de woordtijden van de stem.
 * `fragment` is de sleutel in woordtijden.ts, bijvoorbeeld "voiceover-som30/2".
 * `delay` is het aantal frames tussen het begin van deze scène en de stem.
 */
export function Ondertitels({
  fragment,
  delay,
  staand = false,
}: {
  fragment: string
  delay: number
  staand?: boolean
}) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const woorden = WOORDEN[fragment]
  if (!woorden) return null
  const t = (frame - delay) / fps
  const groep = groepNu(woorden, t, staand ? 32 : 22)
  if (!groep) return null

  const tekst = (
    <p
      style={{
        fontFamily: theme.fontSans,
        fontWeight: 700,
        fontSize: staand ? 84 : 120,
        lineHeight: 1.12,
        color: '#ffffff',
        margin: 0,
        textAlign: 'left',
      }}
    >
      {groep.map((woord, i) => {
        const actief = t >= woord.start && t < woord.eind + 0.05
        return (
          <span key={`${woord.start}-${i}`} style={{ color: actief ? '#b7e4c7' : '#ffffff' }}>
            {i ? ' ' : ''}
            {woord.tekst}
          </span>
        )
      })}
    </p>
  )

  if (staand) return tekst

  return (
    <div
      style={{
        position: 'absolute',
        left: 36,
        right: 250,
        bottom: 28,
        zIndex: 40,
        backgroundColor: 'rgba(20, 32, 27, 0.94)',
        borderRadius: 28,
        padding: '18px 28px',
      }}
    >
      {tekst}
    </div>
  )
}
