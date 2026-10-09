import type { ReactNode } from 'react'

import { X } from './ui'

/** x tot een macht; de exponent mag ook een tekst als "−3" of "1/2" zijn. */
export function XTot({ n }: { n: ReactNode }) {
  return (
    <span>
      <X />
      <sup style={{ fontSize: '0.6em', marginLeft: 2 }}>{n}</sup>
    </span>
  )
}

/** Wortelteken met een streep over de inhoud; met `index` een n-de machtswortel. */
export function Wortel({ children, index }: { children: ReactNode; index?: ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'flex-end', whiteSpace: 'nowrap' }}>
      {index != null && (
        <sup style={{ fontSize: '0.5em', marginRight: '-0.1em', alignSelf: 'flex-start', paddingTop: '0.25em' }}>
          {index}
        </sup>
      )}
      <span style={{ fontSize: '1.1em', lineHeight: 1 }}>√</span>
      <span
        style={{
          borderTop: '0.06em solid currentColor',
          padding: '0.04em 0.12em 0',
          marginLeft: '-0.02em',
          lineHeight: 1.05,
        }}
      >
        {children}
      </span>
    </span>
  )
}
