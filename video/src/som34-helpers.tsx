import type { ReactNode } from 'react'
import { useCurrentFrame } from 'remotion'

import { theme } from './theme'
import { Breuk, Macht, mathStyle, X } from './ui'

/** f(x), g′(x) enz. — functienotatie met x als variabele. */
export function FnX({ naam, accent = false }: { naam: string; accent?: boolean }) {
  return (
    <span>
      <span style={{ fontStyle: 'italic' }}>{naam}</span>
      {accent && '′'}
      <span>
        (<X />)
      </span>
    </span>
  )
}

/** De teller van de opgave: x − 2 */
export function Teller() {
  return (
    <span>
      <X /> − 2
    </span>
  )
}

/** De noemer van de opgave: x + 5 */
export function Noemer() {
  return (
    <span>
      <X /> + 5
    </span>
  )
}

/** (x + 5)² — de noemer van het antwoord, blijft zo staan. */
export function NoemerKwadraat() {
  return (
    <Macht n={2}>
      (<Noemer />)
    </Macht>
  )
}

/** De opgave: f(x) = (x − 2) / (x + 5) */
export function Opgave({ fontSize = 68 }: { fontSize?: number }) {
  return (
    <div style={{ ...mathStyle, fontSize }}>
      <FnX naam="f" /> = <Breuk teller={<Teller />} noemer={<Noemer />} />
    </div>
  )
}

/** Het antwoord: f′(x) = 7 / (x + 5)² */
export function Antwoord({ fontSize = 58, kleur }: { fontSize?: number; kleur?: string }) {
  return (
    <div style={{ ...mathStyle, fontSize }}>
      <FnX naam="f" accent /> ={' '}
      <span style={{ color: kleur }}>
        <Breuk teller={<span>7</span>} noemer={<NoemerKwadraat />} />
      </span>
    </div>
  )
}

/**
 * Labeltje dat boven of onder de breukstreep verschijnt — zo ziet de kijker
 * meteen dat g de teller is en h de noemer.
 */
export function BreukLabel({
  positie,
  label,
  from,
  children,
}: {
  positie: 'boven' | 'onder'
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
          [positie === 'boven' ? 'bottom' : 'top']: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: theme.fontSerif,
          fontStyle: 'italic',
          fontSize: 28,
          color: theme.accent,
          opacity,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
    </span>
  )
}
