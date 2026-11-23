import Link from 'next/link'

import { Badge, Card, cn } from '@/components/ui'
import { SITE_CONFIG, SITE_VARIANTEN, type SiteVariant } from '@/config/site'
import { MEET_APPARATEN, type MeetApparaat } from '@/lib/meten/gebeurtenis'
import { createServiceRoleClient } from '@/lib/supabase/server'

import {
  bouwBezoeken,
  duurTekst,
  eindpaginas,
  procent,
  telKlikken,
  trechter,
  type Bezoek,
  type KlikRij,
  type Stap,
} from './overzicht'

// =====================================================================
// Klikgedrag: wat bezoekers op de site doen en waar ze weggaan.
//
// Leest de klikmeting (`site_gebeurtenissen`) met de service-role, net als
// de andere beheerpagina's; het poortje in `../layout.tsx` laat alleen de
// beheerder hier binnen. Er komt geen sessie-id, schuilnaam of andere
// herleidbare waarde op de pagina: een bezoek is alleen een tijd, een
// apparaat, een herkomst en een route.
// =====================================================================

const SITE_NAMEN: Record<SiteVariant, string> = {
  afgeleide: 'AfgeleideOefenen',
  wiskundemetaaf: 'Wiskunde met Aaf',
}

const PERIODES = [
  { dagen: 1, label: 'Vandaag' },
  { dagen: 7, label: '7 dagen' },
  { dagen: 30, label: '30 dagen' },
] as const

/** Zoveel rijen per keer geeft Supabase hoogstens terug. */
const PAGINA_GROOTTE = 1000

/** Noodrem: meer rijen laden we niet in één keer (ruim een maand bij het huidige verkeer). */
const MAX_RIJEN = 30000

/** Zoveel bezoeken staan er uitgeschreven onderaan. */
const MAX_BEZOEKEN_IN_LIJST = 100

type Filters = {
  site: SiteVariant
  dagen: number
  apparaat: MeetApparaat | 'alle'
  metAaf: boolean
}

type SearchParams = Promise<{ [sleutel: string]: string | string[] | undefined }>

function enkel(waarde: string | string[] | undefined): string | undefined {
  return Array.isArray(waarde) ? waarde[0] : waarde
}

function leesFilters(sp: Awaited<SearchParams>): Filters {
  const site = enkel(sp.site)
  const dagen = Number(enkel(sp.dagen))
  const apparaat = enkel(sp.apparaat)
  return {
    site: SITE_VARIANTEN.includes(site as SiteVariant) ? (site as SiteVariant) : SITE_CONFIG.variant,
    dagen: PERIODES.some((p) => p.dagen === dagen) ? dagen : 7,
    apparaat: MEET_APPARATEN.includes(apparaat as MeetApparaat)
      ? (apparaat as MeetApparaat)
      : 'alle',
    metAaf: enkel(sp.aaf) === 'ja',
  }
}

function hrefMet(filters: Filters, wijziging: Partial<Filters>): string {
  const nieuw = { ...filters, ...wijziging }
  const sp = new URLSearchParams()
  if (nieuw.site !== SITE_CONFIG.variant) sp.set('site', nieuw.site)
  if (nieuw.dagen !== 7) sp.set('dagen', String(nieuw.dagen))
  if (nieuw.apparaat !== 'alle') sp.set('apparaat', nieuw.apparaat)
  if (nieuw.metAaf) sp.set('aaf', 'ja')
  const zoek = sp.toString()
  return zoek ? `/admin/klikgedrag?${zoek}` : '/admin/klikgedrag'
}

/** Begin van de periode: middernacht in Nederland, `dagen - 1` dagen terug. */
function beginVanPeriode(dagen: number): Date {
  const nu = new Date()
  const vandaag = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Amsterdam',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(nu)
  // Middernacht Nederlandse tijd ligt 1 of 2 uur vóór middernacht UTC. Een
  // uur te vroeg beginnen is onschuldig: het telt hoogstens een laat bezoek
  // van gisteravond mee.
  const middernacht = new Date(`${vandaag}T00:00:00Z`)
  middernacht.setUTCHours(middernacht.getUTCHours() - 2)
  middernacht.setUTCDate(middernacht.getUTCDate() - (dagen - 1))
  return middernacht
}

async function laadRijen(
  site: SiteVariant,
  sinds: Date,
): Promise<{ rijen: KlikRij[]; afgekapt: boolean; fout: boolean }> {
  const admin = createServiceRoleClient()
  const rijen: KlikRij[] = []
  for (let van = 0; van < MAX_RIJEN; van += PAGINA_GROOTTE) {
    const { data, error } = await admin
      .from('site_gebeurtenissen')
      .select('sessie_id, tijdstip, volgnummer, soort, pad, doel, waarde, apparaat, verwijzer, ingelogd')
      .eq('site', site)
      .gte('tijdstip', sinds.toISOString())
      .order('id', { ascending: true })
      .range(van, van + PAGINA_GROOTTE - 1)
    if (error) {
      console.error('Klikgedrag ophalen mislukt', error)
      return { rijen, afgekapt: false, fout: true }
    }
    if (!data || data.length === 0) break
    for (const rij of data) rijen.push(rij)
    if (data.length < PAGINA_GROOTTE) return { rijen, afgekapt: false, fout: false }
  }
  return { rijen, afgekapt: rijen.length >= MAX_RIJEN, fout: false }
}

const tijdNotatie = new Intl.DateTimeFormat('nl-NL', {
  timeZone: 'Europe/Amsterdam',
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

const klokNotatie = new Intl.DateTimeFormat('nl-NL', {
  timeZone: 'Europe/Amsterdam',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

function Kiezer<T extends string | number | boolean>({
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

function Kerncijfer({ label, waarde, uitleg }: { label: string; waarde: string; uitleg?: string }) {
  return (
    <Card className="h-full">
      <p className="text-xs uppercase tracking-wider text-text-muted">{label}</p>
      <p className="mt-1 font-serif text-3xl text-text">{waarde}</p>
      {uitleg && <p className="mt-1 text-xs text-text-muted">{uitleg}</p>}
    </Card>
  )
}

function Sectie({ titel, uitleg, children }: { titel: string; uitleg?: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h3 className="font-serif text-lg text-text">{titel}</h3>
      {uitleg && <p className="mb-3 mt-1 max-w-3xl text-sm text-text-muted">{uitleg}</p>}
      {children}
    </section>
  )
}

function Leeg({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-text-muted">{children}</p>
}

function Tabel({ koppen, children }: { koppen: string[]; children: React.ReactNode }) {
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

function Code({ children }: { children: React.ReactNode }) {
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

function StapRegel({ stap }: { stap: Stap }) {
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

function BezoekRegel({ bezoek }: { bezoek: Bezoek }) {
  return (
    <details className="group rounded-lg border border-border bg-surface">
      <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-sm">
        <span className="font-medium text-text">{tijdNotatie.format(new Date(bezoek.begin))}</span>
        <span className="text-text-muted">{bezoek.apparaat}</span>
        <span className="text-text-muted">via {bezoek.herkomst}</span>
        <span className="text-text-muted">
          {bezoek.paginas} {bezoek.paginas === 1 ? 'pagina' : "pagina's"} · {bezoek.kliks}{' '}
          {bezoek.kliks === 1 ? 'klik' : 'klikken'} · {duurTekst(bezoek.duurSeconden)}
        </span>
        {bezoek.laatstePagina && (
          <span className="text-text-muted">
            eindigde op <Code>{bezoek.laatstePagina}</Code>
          </span>
        )}
        <span className="flex flex-wrap gap-1">
          {bezoek.trechter.account && <Badge tone="accent">account aangemaakt</Badge>}
          {bezoek.ingelogdBijBinnenkomst && <Badge>was ingelogd</Badge>}
          {bezoek.meteenWeg && <Badge tone="warn">meteen weg</Badge>}
          {bezoek.problemen > 0 && (
            <Badge tone="danger">
              {bezoek.problemen} {bezoek.problemen === 1 ? 'probleem' : 'problemen'}
            </Badge>
          )}
          {bezoek.beheerder && <Badge>jij</Badge>}
        </span>
      </summary>
      <ol className="border-t border-border px-3 py-2">
        {bezoek.stappen.map((stap, i) => (
          <StapRegel key={i} stap={stap} />
        ))}
        <li className="py-0.5 pl-[4.5rem] text-xs text-text-muted">Einde bezoek</li>
      </ol>
    </details>
  )
}

export default async function AdminKlikgedragPage({ searchParams }: { searchParams: SearchParams }) {
  const filters = leesFilters(await searchParams)
  const { rijen, afgekapt, fout } = await laadRijen(filters.site, beginVanPeriode(filters.dagen))

  const alleBezoeken = bouwBezoeken(rijen)
  const vanAaf = alleBezoeken.filter((b) => b.beheerder).length
  const bezoeken = alleBezoeken.filter(
    (b) =>
      (filters.metAaf || !b.beheerder) &&
      (filters.apparaat === 'alle' || b.apparaat === filters.apparaat),
  )

  const trechterRegels = trechter(bezoeken)
  const eind = eindpaginas(bezoeken).slice(0, 15)
  const problemen = telKlikken(bezoeken, ['dode_klik', 'woedeklik'], { perPagina: true }).slice(0, 15)
  const fouten = telKlikken(
    bezoeken.map((b) => ({
      ...b,
      // Bij een foutpagina is het pad de naam die ertoe doet.
      stappen: b.stappen.map((s) => (s.soort === 'fout' ? { ...s, doel: s.pad } : s)),
    })),
    ['fout'],
  ).slice(0, 10)
  const topKlikken = telKlikken(bezoeken, ['klik']).slice(0, 20)

  const telefoon = bezoeken.filter((b) => b.apparaat === 'telefoon').length
  const meteenWeg = bezoeken.filter((b) => b.meteenWeg).length
  const accounts = bezoeken.filter((b) => b.trechter.account).length
  const binnengekomen = trechterRegels[0].aantal

  return (
    <div>
      <h2 className="font-serif text-xl text-text">Klikgedrag</h2>
      <p className="mt-1 max-w-3xl text-sm text-text-muted">
        Wat bezoekers doen en waar ze weggaan, uit de eigen klikmeting zonder koekjes. Een bezoek
        is één tabblad. Er staan geen namen, e-mailadressen of accounts in. Jouw eigen apparaten
        meten niet mee zodra je bent ingelogd.
      </p>

      <div className="mt-4 flex flex-col gap-2 rounded-xl border border-border bg-surface p-3">
        <Kiezer
          label="Site"
          opties={SITE_VARIANTEN.map((s) => ({ waarde: s, label: SITE_NAMEN[s] }))}
          huidig={filters.site}
          href={(site) => hrefMet(filters, { site })}
        />
        <Kiezer
          label="Periode"
          opties={PERIODES.map((p) => ({ waarde: p.dagen as number, label: p.label }))}
          huidig={filters.dagen}
          href={(dagen) => hrefMet(filters, { dagen })}
        />
        <Kiezer
          label="Apparaat"
          opties={[
            { waarde: 'alle' as const, label: 'Alle' },
            ...MEET_APPARATEN.map((a) => ({ waarde: a, label: a[0].toUpperCase() + a.slice(1) })),
          ]}
          huidig={filters.apparaat}
          href={(apparaat) => hrefMet(filters, { apparaat })}
        />
        {vanAaf > 0 && (
          <Kiezer
            label={`Jouw bezoeken (${vanAaf})`}
            opties={[
              { waarde: false, label: 'Verbergen' },
              { waarde: true, label: 'Tonen' },
            ]}
            huidig={filters.metAaf}
            href={(metAaf) => hrefMet(filters, { metAaf })}
          />
        )}
      </div>

      {fout && (
        <p className="mt-4 rounded-lg border border-amber-700/40 bg-amber-50 px-4 py-3 text-sm text-text">
          De klikmeting kon niet (helemaal) geladen worden. Ververs de pagina om het opnieuw te
          proberen.
        </p>
      )}
      {afgekapt && (
        <p className="mt-4 rounded-lg border border-amber-700/40 bg-amber-50 px-4 py-3 text-sm text-text">
          Er waren meer dan {MAX_RIJEN.toLocaleString('nl-NL')} gebeurtenissen; alleen de eerste
          zijn meegeteld. Kies een kortere periode.
        </p>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kerncijfer label="Bezoeken" waarde={String(bezoeken.length)} />
        <Kerncijfer
          label="Op een telefoon"
          waarde={procent(telefoon, bezoeken.length)}
          uitleg={`${telefoon} van ${bezoeken.length}`}
        />
        <Kerncijfer
          label="Meteen weg"
          waarde={procent(meteenWeg, bezoeken.length)}
          uitleg="Eén pagina en geen enkele klik"
        />
        <Kerncijfer label="Nieuwe accounts" waarde={String(accounts)} />
      </div>

      <Sectie
        titel="De weg van een nieuwe bezoeker"
        uitleg="Alleen bezoeken die niet ingelogd binnenkwamen. Elke regel telt de bezoeken die die stap haalden; het percentage is ten opzichte van de stap erboven. Waar het het hardst daalt, haken de meeste mensen af."
      >
        {binnengekomen === 0 ? (
          <Leeg>Geen nieuwe bezoekers in deze periode.</Leeg>
        ) : (
          <ol className="space-y-2">
            {trechterRegels.map((regel, i) => {
              const vorige = i === 0 ? regel.aantal : trechterRegels[i - 1].aantal
              return (
                // Op een telefoon staat de balk onder de tekst; naast elkaar
                // blijft er op 390 pixels geen balk over.
                <li
                  key={regel.label}
                  className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 text-sm sm:grid-cols-[14rem_1fr_auto]"
                >
                  <span className="text-text">{regel.label}</span>
                  <span className="w-24 text-right tabular-nums text-text sm:col-start-3 sm:row-start-1">
                    {regel.aantal}
                    {i > 0 && (
                      <span className="ml-1 text-xs text-text-muted">({procent(regel.aantal, vorige)})</span>
                    )}
                  </span>
                  <span className="col-span-2 h-3 overflow-hidden rounded-full bg-surface-2 sm:col-span-1 sm:col-start-2 sm:row-start-1">
                    <span
                      className="block h-full rounded-full bg-accent"
                      style={{ width: `${binnengekomen ? (regel.aantal / binnengekomen) * 100 : 0}%` }}
                    />
                  </span>
                </li>
              )
            })}
          </ol>
        )}
      </Sectie>

      <Sectie
        titel="Waar het bezoek eindigt"
        uitleg="De laatste pagina van elk bezoek. 'Van wie er kwam' zegt hoe vaak het bezoek eindigde van iedereen die die pagina zag: hoog op een pagina midden in de route (zoals registreren) wijst op een probleem."
      >
        {eind.length === 0 ? (
          <Leeg>Geen bezoeken in deze periode.</Leeg>
        ) : (
          <Tabel koppen={['Pagina', 'Eindigde hier', 'Bezocht', 'Van wie er kwam']}>
            {eind.map((regel) => (
              <tr key={regel.pad}>
                <td className="px-3 py-2"><Code>{regel.pad}</Code></td>
                <td className="px-3 py-2 text-right tabular-nums">{regel.eindigdeHier}</td>
                <td className="px-3 py-2 text-right tabular-nums">{regel.bezocht}</td>
                <td className="px-3 py-2 text-right tabular-nums">{procent(regel.eindigdeHier, regel.bezocht)}</td>
              </tr>
            ))}
          </Tabel>
        )}
      </Sectie>

      <Sectie
        titel="Dode klikken en woedeklikken"
        uitleg="Een dode klik is een klik op iets dat niet klikbaar is; een woedeklik is snel een paar keer op dezelfde plek klikken omdat er niets gebeurt. Bijna altijd verwarring of een fout."
      >
        {problemen.length === 0 ? (
          <Leeg>Geen dode klikken of woedeklikken in deze periode.</Leeg>
        ) : (
          <Tabel koppen={['Waarop', 'Pagina', 'Keer', 'Bezoeken']}>
            {problemen.map((regel) => (
              <tr key={`${regel.pad} ${regel.doel}`}>
                <td className="px-3 py-2"><Code>{regel.doel}</Code></td>
                <td className="px-3 py-2 text-right"><Code>{regel.pad}</Code></td>
                <td className="px-3 py-2 text-right tabular-nums">{regel.keer}</td>
                <td className="px-3 py-2 text-right tabular-nums">{regel.bezoeken}</td>
              </tr>
            ))}
          </Tabel>
        )}
        {fouten.length > 0 && (
          <div className="mt-4">
            <Tabel koppen={['Foutpagina (404 of fout)', 'Keer', 'Bezoeken']}>
              {fouten.map((regel) => (
                <tr key={regel.doel}>
                  <td className="px-3 py-2"><Code>{regel.doel}</Code></td>
                  <td className="px-3 py-2 text-right tabular-nums">{regel.keer}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{regel.bezoeken}</td>
                </tr>
              ))}
            </Tabel>
          </div>
        )}
      </Sectie>

      <Sectie
        titel="Meest aangeklikt"
        uitleg="Knoppen en links, op hoeveel bezoeken erop geklikt werd. Een naam zonder dubbele punt is een vaste naam uit de code (data-meet); 'button:Nakijken' is het soort element plus de tekst erop."
      >
        {topKlikken.length === 0 ? (
          <Leeg>Geen klikken in deze periode.</Leeg>
        ) : (
          <Tabel koppen={['Waarop', 'Keer', 'Bezoeken']}>
            {topKlikken.map((regel) => (
              <tr key={regel.doel}>
                <td className="px-3 py-2"><Code>{regel.doel}</Code></td>
                <td className="px-3 py-2 text-right tabular-nums">{regel.keer}</td>
                <td className="px-3 py-2 text-right tabular-nums">{regel.bezoeken}</td>
              </tr>
            ))}
          </Tabel>
        )}
      </Sectie>

      <Sectie
        titel="Elk bezoek"
        uitleg={`Het nieuwste bovenaan${bezoeken.length > MAX_BEZOEKEN_IN_LIJST ? `, de laatste ${MAX_BEZOEKEN_IN_LIJST}` : ''}. Klik op een bezoek om de hele route te zien, tot het moment dat iemand weggaat.`}
      >
        {bezoeken.length === 0 ? (
          <Leeg>Geen bezoeken in deze periode.</Leeg>
        ) : (
          <div className="space-y-2">
            {/* Sleutel op volgorde, niet op sessie-id: sleutels gaan mee naar de browser. */}
            {bezoeken.slice(0, MAX_BEZOEKEN_IN_LIJST).map((bezoek, i) => (
              <BezoekRegel key={`${bezoek.begin}-${i}`} bezoek={bezoek} />
            ))}
          </div>
        )}
      </Sectie>
    </div>
  )
}
