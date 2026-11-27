import Link from 'next/link'

import { Badge } from '@/components/ui'
import { SITE_VARIANTEN, type SiteVariant } from '@/config/site'

import { beginVanPeriode, laadLeerlinggegevens } from '../laden'
import { bouwLeerlingen } from '../leerlingen'
import {
  Code,
  Kerncijfer,
  Kiezer,
  KlikgedragTabs,
  Leeg,
  Melding,
  SITE_NAMEN,
  Tabel,
  tijdNotatie,
} from '../onderdelen'
import { procent } from '../overzicht'

// =====================================================================
// Leerlingen volgen: iedereen die in de periode ingelogd iets deed, met een
// vaste code in plaats van een naam. Klik op een code voor de hele flow.
// =====================================================================

const PERIODES = [
  { dagen: 7, label: '7 dagen' },
  { dagen: 30, label: '30 dagen' },
  { dagen: 90, label: '90 dagen' },
] as const

/** Zo lang weg en je bent misschien afgehaakt. */
const WEG_NA_DAGEN = 7

type Filters = { site: SiteVariant | 'alle'; dagen: number }

type SearchParams = Promise<{ [sleutel: string]: string | string[] | undefined }>

function enkel(waarde: string | string[] | undefined): string | undefined {
  return Array.isArray(waarde) ? waarde[0] : waarde
}

function leesFilters(sp: Awaited<SearchParams>): Filters {
  const site = enkel(sp.site)
  const dagen = Number(enkel(sp.dagen))
  return {
    site: SITE_VARIANTEN.includes(site as SiteVariant) ? (site as SiteVariant) : 'alle',
    dagen: PERIODES.some((p) => p.dagen === dagen) ? dagen : 30,
  }
}

function hrefMet(filters: Filters, wijziging: Partial<Filters>): string {
  const nieuw = { ...filters, ...wijziging }
  const sp = new URLSearchParams()
  if (nieuw.site !== 'alle') sp.set('site', nieuw.site)
  if (nieuw.dagen !== 30) sp.set('dagen', String(nieuw.dagen))
  const zoek = sp.toString()
  return zoek ? `/admin/klikgedrag/leerlingen?${zoek}` : '/admin/klikgedrag/leerlingen'
}

export default async function AdminLeerlingenVolgenPage({ searchParams }: { searchParams: SearchParams }) {
  const filters = leesFilters(await searchParams)
  const gegevens = await laadLeerlinggegevens(
    filters.site === 'alle' ? null : filters.site,
    beginVanPeriode(filters.dagen),
  )

  let leerlingen = bouwLeerlingen(gegevens.rijen, gegevens.antwoorden)
  // Bij één site: alleen wie daar ook echt klikte.
  if (filters.site !== 'alle') {
    leerlingen = leerlingen.filter((l) => l.sites.includes(filters.site))
  }

  const nu = gegevens.geladenOp
  const terug = leerlingen.filter((l) => l.dagenActief >= 2).length
  const nieuw = leerlingen.filter((l) => l.nieuw).length
  const sommen = leerlingen.reduce((som, l) => som + l.antwoorden, 0)
  const goed = leerlingen.reduce((som, l) => som + l.goed, 0)

  return (
    <div>
      <h2 className="font-serif text-xl text-text">Klikgedrag</h2>
      <p className="mb-4 mt-1 max-w-3xl text-sm text-text-muted">
        Elke leerling die ingelogd iets deed, met een vaste code in plaats van een naam. Klik op
        een code om de hele flow van die leerling te zien: elk bezoek, elke klik en elke som, over de dagen heen.
        Jij en testaccounts staan er niet tussen.
      </p>

      <KlikgedragTabs actief="leerlingen" />

      <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-3">
        <Kiezer
          label="Site"
          opties={[
            { waarde: 'alle' as const, label: 'Alle' },
            ...SITE_VARIANTEN.map((s) => ({ waarde: s, label: SITE_NAMEN[s] })),
          ]}
          huidig={filters.site}
          href={(site) => hrefMet(filters, { site })}
        />
        <Kiezer
          label="Periode"
          opties={PERIODES.map((p) => ({ waarde: p.dagen as number, label: p.label }))}
          huidig={filters.dagen}
          href={(dagen) => hrefMet(filters, { dagen })}
        />
      </div>

      {gegevens.fout && (
        <Melding>
          Niet alles kon geladen worden. Ververs de pagina om het opnieuw te proberen.
        </Melding>
      )}
      {gegevens.zonderGeheim && (
        <Melding>
          Het geheim achter de codes (<code>MEET_SCHUILNAAM_GEHEIM</code>) ontbreekt hier. Je ziet
          alleen klikken; de oefenantwoorden kunnen niet aan een leerling gekoppeld worden.
        </Melding>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kerncijfer label="Leerlingen" waarde={String(leerlingen.length)} uitleg="Ingelogd actief in deze periode" />
        <Kerncijfer
          label="Kwam terug"
          waarde={procent(terug, leerlingen.length)}
          uitleg={`${terug} van ${leerlingen.length} op meer dan één dag`}
        />
        <Kerncijfer label="Nieuw" waarde={String(nieuw)} uitleg="Account aangemaakt in deze periode" />
        <Kerncijfer
          label="Sommen gemaakt"
          waarde={String(sommen)}
          uitleg={sommen ? `${procent(goed, sommen)} goed` : undefined}
        />
      </div>

      <div className="mt-8">
        {leerlingen.length === 0 ? (
          <Leeg>Geen ingelogde leerlingen in deze periode.</Leeg>
        ) : (
          <Tabel koppen={['Leerling', 'Laatst actief', 'Dagen', 'Bezoeken', 'Sommen', 'Goed', 'Laatst bezig met']}>
            {leerlingen.map((l) => {
              const dagenWeg = Math.floor((nu - Date.parse(l.laatsteKeer)) / 86_400_000)
              return (
                <tr key={l.schuilnaam}>
                  <td className="px-3 py-2">
                    <Link
                      href={`/admin/klikgedrag/leerlingen/${l.schuilnaam}`}
                      className="font-mono font-medium text-accent hover:underline"
                    >
                      {l.code}
                    </Link>
                    <span className="ml-2 inline-flex flex-wrap gap-1 align-middle">
                      {l.nieuw && <Badge tone="accent">nieuw</Badge>}
                      {dagenWeg >= WEG_NA_DAGEN && <Badge tone="warn">{dagenWeg} dagen weg</Badge>}
                      {filters.site === 'alle' &&
                        l.sites.map((s) => (
                          <Badge key={s}>{SITE_NAMEN[s as SiteVariant] ?? s}</Badge>
                        ))}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-right">
                    {tijdNotatie.format(new Date(l.laatsteKeer))}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{l.dagenActief}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{l.bezoeken}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{l.antwoorden}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{procent(l.goed, l.antwoorden)}</td>
                  <td className="px-3 py-2 text-right">
                    {l.laatsteOnderwerp ? (
                      l.laatsteOnderwerp.startsWith('/') ? (
                        <Code>{l.laatsteOnderwerp}</Code>
                      ) : (
                        l.laatsteOnderwerp
                      )
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              )
            })}
          </Tabel>
        )}
      </div>
    </div>
  )
}
