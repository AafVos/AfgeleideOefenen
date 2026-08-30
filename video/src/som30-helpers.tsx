import { mathStyle, X } from './ui'

/** x tot de macht n. */
export function Xp({ n }: { n: number }) {
  return (
    <span>
      <X />
      <sup style={{ fontSize: '0.6em' }}>{n}</sup>
    </span>
  )
}

/** k(x), g′(x) enz. — functienotatie met x als variabele. */
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

/** De opgave: k(x) = 5 − 3(x⁴ − x)(x + 1) */
export function Opgave({ fontSize = 76 }: { fontSize?: number }) {
  return (
    <div style={{ ...mathStyle, fontSize }}>
      <FnX naam="k" /> = 5 − 3(
      <Xp n={4} /> − <X />)(<X /> + 1)
    </div>
  )
}

/** v(x) na het naar binnen halen van de 3: (3x⁴ − 3x)(x + 1) */
export function VHerschreven() {
  return (
    <span>
      (3
      <Xp n={4} /> − 3<X />) · (<X /> + 1)
    </span>
  )
}
