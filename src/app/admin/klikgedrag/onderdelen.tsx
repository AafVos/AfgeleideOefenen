import Link from 'next/link'

import { Card, cn } from '@/components/ui'
import type { SiteVariant } from '@/config/site'

import type { Stap } from './overzicht'

// Bouwstenen die de beheerpagina's onder Klikgedrag delen.

export const SITE_NAMEN: Record<SiteVariant, string> = {
  afgeleide: 'AfgeleideOefenen',
  wiskundemetaaf: 'Wiskunde met Aaf',
}

export const tijdNotatie = new Intl.DateTimeFormat('nl-NL', {
  timeZone: 'Europe/Amsterdam',
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

export const dagNotatie = new Intl.DateTimeFormat('nl-NL', {
  timeZone: 'Europe/Amsterdam',
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

export const klokNotatie = new Intl.DateTimeFormat('nl-NL', {
  timeZone: 'Europe/Amsterdam',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

/** De twee weergaven bovenaan: alle bezoeken, of per leerling. */
export function KlikgedragTabs({ actief }: { actief: 'bezoeken' | 'leerlingen' }) {
  const tabs = [
    { sleutel: 'bezoeken', href: '/admin/klikgedrag', label: 'Bezoeken' },
    { sleutel: 'leerlingen', href: '/admin/klikgedrag/leerlingen', label: 'Leerlingen volgen' },
  ] as const
  return (
    <div className="mb-4 flex gap-1 border-b border-border">
      {tabs.map((tab) => (
        <Link
          key={tab.sleutel}
          href={tab.href}
          aria-current={tab.sleutel === actief ? 'page' : undefined}
          className={cn(
            '-mb-px border-b-2 px-3 py-2 text-sm',
            tab.sleutel === actief
              ? 'border-accent font-medium text-text'
              : 'border-transparent text-text-muted hover:text-text',
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  )
}

export function Kiezer<T extends string | number | boolean>({
  label,
  opties,
  huidig,
  href,
}: {
  label: string
  opties: ReadonlyArray<{ waarde: T; label: string }>
  huidig: T
  href: (waarde: T) => string
}) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <span className="mr-1 text-xs uppercase tracking-wider text-text-muted">{label}</span>
      {opties.map((optie) => (
        <Link
          key={String(optie.waarde)}
          href={href(optie.waarde)}
          aria-current={optie.waarde === huidig ? 'page' : undefined}
          className={cn(
            'rounded-md border px-2.5 py-1 text-sm',
            optie.waarde === huidig
              ? 'border-accent bg-accent text-white'
              : 'border-border bg-surface text-text-muted hover:bg-surface-2 hover:text-text',
          )}
        >
          {optie.label}
        </Link>
      ))}
    </div>
  )
}

export function Kerncijfer({ label, waarde, uitleg }: { label: string; waarde: string; uitleg?: string }) {
  return (
    <Card className="h-full">
      <p className="text-xs uppercase tracking-wider text-text-muted">{label}</p>
      <p className="mt-1 font-serif text-3xl text-text">{waarde}</p>
      {uitleg && <p className="mt-1 text-xs text-text-muted">{uitleg}</p>}
    </Card>
  )
}

export function Sectie({ titel, uitleg, children }: { titel: string; uitleg?: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h3 className="font-serif text-lg text-text">{titel}</h3>
      {uitleg && <p className="mb-3 mt-1 max-w-3xl text-sm text-text-muted">{uitleg}</p>}
      {children}
    </section>
  )
}

export function Leeg({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-text-muted">{children}</p>
}

export function Melding({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 rounded-lg border border-amber-700/40 bg-amber-50 px-4 py-3 text-sm text-text">
      {children}
    </p>
  )
}

export function Tabel({ koppen, children }: { koppen: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-surface-2 text-xs uppercase tracking-wider text-text-muted">
          <tr>
            {koppen.map((kop, i) => (
              <th key={kop} className={cn('px-3 py-2 font-medium', i > 0 && 'text-right')}>
                {kop}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">{children}</tbody>
      </table>
    </div>
  )
}

export function Code({ children }: { children: React.ReactNode }) {
  return <code className="break-all rounded bg-surface-2 px-1 py-0.5 text-xs text-text">{children}</code>
}

const STAP_LABEL: Record<Stap['soort'], string> = {
  pagina: 'Pagina',
  klik: 'Klik',
  dode_klik: 'Dode klik',
  woedeklik: 'Woedeklik',
  fout: 'Foutpagina',
  registratie: 'Account aangemaakt',
  inlog: 'Ingelogd',
}

/** Eén regel in een route: tijd, soort en waarop of waar. */
export function StapRegel({ stap }: { stap: Stap }) {
  const probleem = stap.soort === 'dode_klik' || stap.soort === 'woedeklik' || stap.soort === 'fout'
  const mijlpaal = stap.soort === 'registratie' || stap.soort === 'inlog'
  return (
    <li className="flex flex-wrap items-baseline gap-x-2 py-0.5">
      <span className="w-16 shrink-0 font-mono text-xs text-text-muted">
        {klokNotatie.format(new Date(stap.tijdstip))}
      </span>
      <span
        className={cn(
          'text-xs font-medium',
          probleem ? 'text-accent-2' : mijlpaal ? 'text-accent' : 'text-text-muted',
        )}
      >
        {STAP_LABEL[stap.soort]}
      </span>
      {stap.soort === 'pagina' || stap.soort === 'fout' ? (
        <Code>{stap.pad}</Code>
      ) : stap.doel ? (
        <>
          <Code>{stap.doel}</Code>
          <span className="text-xs text-text-muted">op {stap.pad}</span>
        </>
      ) : null}
      {stap.scroll !== null && (
        <span className="text-xs text-text-muted">gescrold tot {stap.scroll}%</span>
      )}
    </li>
  )
}

/** Een getal met het juiste woord erachter: "1 bezoek", "3 bezoeken". */
export function aantal(n: number, enkel: string, meer: string): string {
  return `${n} ${n === 1 ? enkel : meer}`
}
