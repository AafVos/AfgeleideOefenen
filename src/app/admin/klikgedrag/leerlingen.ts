import type { MeetApparaat } from '@/lib/meten/gebeurtenis'

import { bouwBezoeken, type Bezoek, type KlikRij, type Stap } from './overzicht'

// =====================================================================
// Eén leerling volgen, zonder naam.
//
// Een ingelogde leerling krijgt in de klikmeting een schuilnaam: een vaste
// code per account (`src/lib/meten/schuilnaam.ts`). Daarmee zijn zijn
// bezoeken over meerdere dagen te volgen. De server rekent dezelfde code uit
// voor de oefenantwoorden, zodat klikken en antwoorden in één tijdlijn
// komen. Op de pagina komt alleen een korte code, nooit een naam,
// e-mailadres of gebruikers-id.
// =====================================================================

/** Een klikrij met de kolommen die nodig zijn om leerlingen te volgen. */
export type LeerlingRij = KlikRij & {
  schuilnaam: string | null
  site: string
}

/** Eén oefenantwoord, al omgezet naar de schuilnaam van de leerling. */
export type Antwoord = {
  schuilnaam: string
  tijdstip: string
  goed: boolean | null
  hints: number
  /** Wat de leerling intypte, ingekort. */
  invoer: string | null
  onderwerp: string | null
  soortSom: string | null
}

export type LeerlingOverzicht = {
  schuilnaam: string
  code: string
  sites: string[]
  eersteKeer: string
  laatsteKeer: string
  dagenActief: number
  bezoeken: number
  antwoorden: number
  goed: number
  /** Onderwerp van het laatste antwoord, of de laatste pagina als er geen antwoord is. */
  laatsteOnderwerp: string | null
  apparaten: MeetApparaat[]
  /** Kwam binnen via de registratie in de gemeten periode. */
  nieuw: boolean
}

/** De korte code die op de pagina staat: de eerste zes tekens. */
export function korteCode(schuilnaam: string): string {
  return schuilnaam.slice(0, 6).toUpperCase()
}

/** Een schuilnaam ziet er altijd zo uit; al het andere is geen geldige code. */
export function isSchuilnaam(waarde: string | null | undefined): waarde is string {
  return typeof waarde === 'string' && /^[0-9a-f]{16}$/.test(waarde)
}

/** De dag in Nederland, als `2026-11-27`. */
export function dagVan(tijdstip: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Amsterdam',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(tijdstip))
}

/**
 * Alle klikrijen van één leerling: elk tabblad waarin zijn schuilnaam
 * voorkomt, en dan het héle tabblad. Zo telt ook mee wat hij deed vóór hij
 * inlogde (proefsom, registreren).
 */
export function rijenVanLeerling<T extends LeerlingRij>(rijen: readonly T[], schuilnaam: string): T[] {
  const sessies = new Set(
    rijen.filter((rij) => rij.schuilnaam === schuilnaam).map((rij) => rij.sessie_id),
  )
  return rijen.filter((rij) => sessies.has(rij.sessie_id))
}

/** Alle leerlingen met klikken of antwoorden, wie het laatst actief was bovenaan. */
export function bouwLeerlingen(
  rijen: readonly LeerlingRij[],
  antwoorden: readonly Antwoord[],
): LeerlingOverzicht[] {
  const namen = new Set<string>()
  for (const rij of rijen) if (rij.schuilnaam) namen.add(rij.schuilnaam)
  for (const antwoord of antwoorden) namen.add(antwoord.schuilnaam)

  const antwoordenPerNaam = new Map<string, Antwoord[]>()
  for (const antwoord of antwoorden) {
    const lijst = antwoordenPerNaam.get(antwoord.schuilnaam)
    if (lijst) lijst.push(antwoord)
    else antwoordenPerNaam.set(antwoord.schuilnaam, [antwoord])
  }

  const overzicht: LeerlingOverzicht[] = []
  for (const naam of namen) {
    const eigenRijen = rijenVanLeerling(rijen, naam)
    const eigenAntwoorden = (antwoordenPerNaam.get(naam) ?? []).toSorted((a, b) =>
      a.tijdstip.localeCompare(b.tijdstip),
    )
    const bezoeken = bouwBezoeken(eigenRijen)
    const tijden = [
      ...eigenRijen.map((rij) => rij.tijdstip),
      ...eigenAntwoorden.map((a) => a.tijdstip),
    ].sort()
    const dagen = new Set(tijden.map(dagVan))
    const laatsteAntwoord = eigenAntwoorden.at(-1)
    const laatsteBezoek = bezoeken[0]

    overzicht.push({
      schuilnaam: naam,
      code: korteCode(naam),
      sites: [...new Set(eigenRijen.map((rij) => rij.site))].sort(),
      eersteKeer: tijden[0],
      laatsteKeer: tijden.at(-1)!,
      dagenActief: dagen.size,
      bezoeken: bezoeken.length,
      antwoorden: eigenAntwoorden.length,
      goed: eigenAntwoorden.filter((a) => a.goed === true).length,
      laatsteOnderwerp: laatsteAntwoord?.onderwerp ?? laatsteBezoek?.laatstePagina ?? null,
      apparaten: [...new Set(bezoeken.map((b) => b.apparaat))],
      nieuw: eigenRijen.some((rij) => rij.soort === 'registratie'),
    })
  }

  return overzicht.sort((a, b) => b.laatsteKeer.localeCompare(a.laatsteKeer))
}

export type TijdlijnRegel =
  | { soort: 'bezoek'; tijdstip: string; bezoek: Bezoek; site: string }
  | { soort: 'stap'; tijdstip: string; stap: Stap }
  | { soort: 'antwoord'; tijdstip: string; antwoord: Antwoord }
  | { soort: 'einde'; tijdstip: string; bezoek: Bezoek }

/** Zo lang na de laatste klik telt een antwoord nog bij hetzelfde bezoek. */
const ANTWOORD_SPELING_MS = 60_000

export type TijdlijnDag = {
  dag: string
  regels: TijdlijnRegel[]
  antwoorden: number
  goed: number
}

/**
 * De hele flow van één leerling, per dag en op tijd: het begin van elk
 * bezoek, alles wat hij aanklikte, en elk oefenantwoord ertussen.
 */
export function tijdlijn(
  rijen: readonly LeerlingRij[],
  antwoorden: readonly Antwoord[],
): TijdlijnDag[] {
  const sitePerSessie = new Map<string, string>()
  for (const rij of rijen) if (!sitePerSessie.has(rij.sessie_id)) sitePerSessie.set(rij.sessie_id, rij.site)

  const regels: TijdlijnRegel[] = []
  for (const bezoek of bouwBezoeken(rijen)) {
    regels.push({
      soort: 'bezoek',
      tijdstip: bezoek.begin,
      bezoek,
      site: sitePerSessie.get(bezoek.sessieId) ?? '',
    })
    for (const stap of bezoek.stappen) regels.push({ soort: 'stap', tijdstip: stap.tijdstip, stap })
    // De klikmeting stuurt per paar seconden; een antwoord kan dus net na
    // de laatste gemeten klik vallen. Wat binnen een minuut daarna komt,
    // hoort nog bij dit bezoek.
    const begin = Date.parse(bezoek.begin)
    const grens = Date.parse(bezoek.eind) + ANTWOORD_SPELING_MS
    const laatsteAntwoord = antwoorden
      .map((a) => Date.parse(a.tijdstip))
      .filter((t) => t >= begin && t <= grens)
      .reduce((max, t) => Math.max(max, t), Date.parse(bezoek.eind))
    regels.push({ soort: 'einde', tijdstip: new Date(laatsteAntwoord).toISOString(), bezoek })
  }
  for (const antwoord of antwoorden) {
    regels.push({ soort: 'antwoord', tijdstip: antwoord.tijdstip, antwoord })
  }

  // Op tijd; bij gelijke tijd eerst het begin van het bezoek, dan de stappen
  // in hun eigen volgorde (stabiel sorteren), dan het antwoord, en het einde
  // van het bezoek als laatste.
  const volgorde = { bezoek: 0, stap: 1, antwoord: 2, einde: 3 } as const
  const gesorteerd = regels
    .map((regel, i) => ({ regel, i }))
    .sort(
      (a, b) =>
        Date.parse(a.regel.tijdstip) - Date.parse(b.regel.tijdstip) ||
        volgorde[a.regel.soort] - volgorde[b.regel.soort] ||
        a.i - b.i,
    )
    .map(({ regel }) => regel)

  const dagen: TijdlijnDag[] = []
  for (const regel of gesorteerd) {
    const dag = dagVan(regel.tijdstip)
    let huidig = dagen.at(-1)
    if (!huidig || huidig.dag !== dag) {
      huidig = { dag, regels: [], antwoorden: 0, goed: 0 }
      dagen.push(huidig)
    }
    huidig.regels.push(regel)
    if (regel.soort === 'antwoord') {
      huidig.antwoorden++
      if (regel.antwoord.goed) huidig.goed++
    }
  }
  return dagen
}

export type OnderwerpRegel = {
  onderwerp: string
  antwoorden: number
  goed: number
  /** Het langste aantal foute antwoorden achter elkaar. */
  langsteFoutreeks: number
}

/** Per onderwerp: hoeveel sommen, hoeveel goed, en waar hij vastliep. */
export function perOnderwerp(antwoorden: readonly Antwoord[]): OnderwerpRegel[] {
  const regels = new Map<string, OnderwerpRegel & { reeks: number }>()
  const opTijd = antwoorden.toSorted((a, b) => a.tijdstip.localeCompare(b.tijdstip))
  for (const antwoord of opTijd) {
    const naam = antwoord.onderwerp ?? '(onbekend onderwerp)'
    let regel = regels.get(naam)
    if (!regel) {
      regel = { onderwerp: naam, antwoorden: 0, goed: 0, langsteFoutreeks: 0, reeks: 0 }
      regels.set(naam, regel)
    }
    regel.antwoorden++
    if (antwoord.goed) {
      regel.goed++
      regel.reeks = 0
    } else {
      regel.reeks++
      regel.langsteFoutreeks = Math.max(regel.langsteFoutreeks, regel.reeks)
    }
  }
  return [...regels.values()].map((regel) => ({
    onderwerp: regel.onderwerp,
    antwoorden: regel.antwoorden,
    goed: regel.goed,
    langsteFoutreeks: regel.langsteFoutreeks,
  }))
}

/** Wat iemand intypte, kort genoeg voor de tijdlijn. */
export function korteInvoer(invoer: string | null | undefined): string | null {
  if (!invoer) return null
  const een = invoer.replace(/\s+/g, ' ').trim()
  if (!een) return null
  return een.length > 40 ? `${een.slice(0, 40)}…` : een
}
