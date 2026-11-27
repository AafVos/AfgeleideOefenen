import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Badge, cn } from '@/components/ui'
import type { SiteVariant } from '@/config/site'

import { beginVanPeriode, laadLeerlinggegevens } from '../../laden'
import {
  bouwLeerlingen,
  isSchuilnaam,
  korteCode,
  perOnderwerp,
  rijenVanLeerling,
  tijdlijn,
  type TijdlijnRegel,
} from '../../leerlingen'
import {
  aantal,
  Code,
  dagNotatie,
  Kerncijfer,
  klokNotatie,
  Leeg,
  Melding,
  Sectie,
  SITE_NAMEN,
  StapRegel,
  Tabel,
  tijdNotatie,
} from '../../onderdelen'
import { duurTekst, procent } from '../../overzicht'

// =====================================================================
// Eén leerling, zonder naam: de hele flow over de dagen heen. Elk bezoek,
// elke klik en elke som op tijd, zodat je ziet waar de leerling vastloopt
// of afhaakt. De klikmeting bewaart ruwe rijen 90 dagen; verder terug kan niet.
// =====================================================================

const PERIODE_DAGEN = 90

/** Zoveel foute antwoorden achter elkaar noemen we vastlopen. */
const VASTGELOPEN_NA = 3

function isNakijkKlik(regel: TijdlijnRegel): boolean {
  return regel.soort === 'stap' && regel.stap.soort === 'klik' && regel.stap.doel === 'oefenen-nakijken'
}

function siteNaam(site: string): string {
  return SITE_NAMEN[site as SiteVariant] ?? site
}

function Regel({ regel }: { regel: TijdlijnRegel }) {
  if (regel.soort === 'stap') return <StapRegel stap={regel.stap} />

  if (regel.soort === 'bezoek') {
    const { bezoek } = regel
    return (
      <li className="mt-3 flex flex-wrap items-baseline gap-x-2 rounded-md bg-surface-2 px-2 py-1 text-xs first:mt-0">
        <span className="font-mono text-text-muted">{klokNotatie.format(new Date(bezoek.begin))}</span>
        <span className="font-medium text-text">Nieuw bezoek</span>
        <span className="text-text-muted">
          {siteNaam(regel.site)} · {bezoek.apparaat} · via {bezoek.herkomst}
        </span>
      </li>
    )
  }

  if (regel.soort === 'einde') {
    const { bezoek } = regel
    return (
      <li className="flex flex-wrap items-baseline gap-x-2 py-0.5 text-xs text-text-muted">
        <span className="w-16 shrink-0 font-mono">{klokNotatie.format(new Date(regel.tijdstip))}</span>
        <span>
          Weg na {duurTekst(bezoek.duurSeconden)}
          {bezoek.laatstePagina && (
            <>
              {' '}
              op <Code>{bezoek.laatstePagina}</Code>
            </>
          )}
        </span>
      </li>
    )
  }

  const { antwoord } = regel
  return (
    <li className="flex flex-wrap items-baseline gap-x-2 py-0.5">
      <span className="w-16 shrink-0 font-mono text-xs text-text-muted">
        {klokNotatie.format(new Date(antwoord.tijdstip))}
      </span>
      <span
        className={cn(
          'text-xs font-medium',
          antwoord.goed ? 'text-accent' : antwoord.goed === false ? 'text-accent-2' : 'text-text-muted',
        )}
      >
        {antwoord.goed ? 'Som goed' : antwoord.goed === false ? 'Som fout' : 'Som'}
      </span>
      <span className="text-xs text-text">
        {antwoord.onderwerp ?? 'onbekend onderwerp'}
        {antwoord.soortSom && <span className="text-text-muted"> · {antwoord.soortSom}</span>}
      </span>
      {antwoord.invoer && <Code>{antwoord.invoer}</Code>}
      {antwoord.hints > 0 && (
        <span className="text-xs text-text-muted">{aantal(antwoord.hints, 'hint', 'hints')}</span>
      )}
    </li>
  )
}

export default async function AdminLeerlingVolgenPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  if (!isSchuilnaam(code)) notFound()

  const gegevens = await laadLeerlinggegevens(null, beginVanPeriode(PERIODE_DAGEN))
  const rijen = rijenVanLeerling(gegevens.rijen, code)
  const antwoorden = gegevens.antwoorden.filter((a) => a.schuilnaam === code)
  const [leerling] = bouwLeerlingen(rijen, antwoorden).filter((l) => l.schuilnaam === code)
  if (!leerling) notFound()

  const onderwerpen = perOnderwerp(antwoorden)
  const dagen = tijdlijn(rijen, antwoorden)
  // Elke som zit al als antwoord in de tijdlijn; de klik erop is dan dubbel.
  // Zonder antwoorden (geheim ontbreekt) blijft de klik wel staan.
  const verbergNakijken = antwoorden.length > 0

  return (
    <div>
      <Link href="/admin/klikgedrag/leerlingen" className="text-sm text-accent hover:underline">
        ← Alle leerlingen
      </Link>

      <div className="mt-2 flex flex-wrap items-baseline gap-2">
        <h2 className="font-serif text-xl text-text">
          Leerling <span className="font-mono">{korteCode(code)}</span>
        </h2>
        {leerling.nieuw && <Badge tone="accent">nieuw</Badge>}
        {leerling.sites.map((s) => (
          <Badge key={s}>{siteNaam(s)}</Badge>
        ))}
        {leerling.apparaten.map((a) => (
          <Badge key={a}>{a}</Badge>
        ))}
      </div>
      <p className="mt-1 max-w-3xl text-sm text-text-muted">
        Alles wat deze leerling de afgelopen {PERIODE_DAGEN} dagen deed, zonder naam. Ook wat er
        vóór het inloggen in hetzelfde tabblad gebeurde staat erbij, zoals de proefsom en het
        registreren.
      </p>

      {gegevens.fout && (
        <Melding>Niet alles kon geladen worden. Ververs de pagina om het opnieuw te proberen.</Melding>
      )}
      {gegevens.zonderGeheim && (
        <Melding>
          Het geheim achter de codes ontbreekt hier, dus de oefenantwoorden staan er niet bij.
        </Melding>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kerncijfer label="Eerste keer" waarde={tijdNotatie.format(new Date(leerling.eersteKeer))} />
        <Kerncijfer label="Laatst actief" waarde={tijdNotatie.format(new Date(leerling.laatsteKeer))} />
        <Kerncijfer
          label="Dagen actief"
          waarde={String(leerling.dagenActief)}
          uitleg={aantal(leerling.bezoeken, 'bezoek', 'bezoeken')}
        />
        <Kerncijfer
          label="Sommen"
          waarde={String(leerling.antwoorden)}
          uitleg={leerling.antwoorden ? `${procent(leerling.goed, leerling.antwoorden)} goed` : undefined}
        />
      </div>

      <Sectie
        titel="Per onderwerp"
        uitleg={`'Langste reeks fout' is het grootste aantal foute antwoorden achter elkaar. Vanaf ${VASTGELOPEN_NA} liep de leerling daar vast.`}
      >
        {onderwerpen.length === 0 ? (
          <Leeg>Nog geen sommen gemaakt.</Leeg>
        ) : (
          <Tabel koppen={['Onderwerp', 'Sommen', 'Goed', 'Langste reeks fout']}>
            {onderwerpen.map((regel) => (
              <tr key={regel.onderwerp}>
                <td className="px-3 py-2">{regel.onderwerp}</td>
                <td className="px-3 py-2 text-right tabular-nums">{regel.antwoorden}</td>
                <td className="px-3 py-2 text-right tabular-nums">{procent(regel.goed, regel.antwoorden)}</td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {regel.langsteFoutreeks >= VASTGELOPEN_NA && (
                    <span className="mr-2">
                      <Badge tone="danger">liep vast</Badge>
                    </span>
                  )}
                  {regel.langsteFoutreeks}
                </td>
              </tr>
            ))}
          </Tabel>
        )}
      </Sectie>

      <Sectie
        titel="De flow, dag voor dag"
        uitleg="Van oud naar nieuw. Elk bezoek begint met een grijze regel en eindigt met de pagina waar de leerling wegging; daartussen elke pagina, klik en som. De klik op 'nakijken' staat er niet apart bij: die zie je als de som zelf."
      >
        {dagen.length === 0 ? (
          <Leeg>Niets gemeten in deze periode.</Leeg>
        ) : (
          <div className="space-y-4">
            {dagen.map((dag, i) => (
              <details
                key={dag.dag}
                open={i >= dagen.length - 3}
                className="rounded-lg border border-border bg-surface"
              >
                <summary className="flex cursor-pointer list-none flex-wrap items-baseline gap-x-3 px-3 py-2 text-sm">
                  <span className="font-medium text-text">
                    {dagNotatie.format(new Date(`${dag.dag}T12:00:00Z`))}
                  </span>
                  <span className="text-text-muted">
                    {aantal(dag.regels.filter((r) => r.soort === 'bezoek').length, 'bezoek', 'bezoeken')}
                    {dag.antwoorden > 0 &&
                      ` · ${aantal(dag.antwoorden, 'som', 'sommen')}, ${procent(dag.goed, dag.antwoorden)} goed`}
                  </span>
                </summary>
                <ol className="border-t border-border px-3 py-2">
                  {dag.regels
                    .filter((regel) => !(verbergNakijken && isNakijkKlik(regel)))
                    .map((regel, j) => (
                      <Regel key={j} regel={regel} />
                    ))}
                </ol>
              </details>
            ))}
          </div>
        )}
      </Sectie>
    </div>
  )
}
