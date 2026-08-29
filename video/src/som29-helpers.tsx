import { mathStyle } from './ui'

/** Cursieve q, zoals in een boek. */
export function Q() {
  return <span style={{ fontStyle: 'italic' }}>q</span>
}

/** q tot de macht n. */
export function Qp({ n }: { n: number }) {
  return (
    <span>
      <Q />
      <sup style={{ fontSize: '0.6em' }}>{n}</sup>
    </span>
  )
}

/** m(q), g′(q) enz. — functienotatie met q als variabele. */
export function FnQ({ naam, accent = false }: { naam: string; accent?: boolean }) {
  return (
    <span>
      <span style={{ fontStyle: 'italic' }}>{naam}</span>
      {accent && '′'}
      <span>
        (<Q />)
      </span>
    </span>
  )
}

/** De opgave: m(q) = 1 − (3q² − 2)² */
export function Opgave({ fontSize = 76 }: { fontSize?: number }) {
  return (
    <div style={{ ...mathStyle, fontSize }}>
      <FnQ naam="m" /> = 1 − (3<Qp n={2} /> − 2)<sup style={{ fontSize: '0.6em' }}>2</sup>
    </div>
  )
}
