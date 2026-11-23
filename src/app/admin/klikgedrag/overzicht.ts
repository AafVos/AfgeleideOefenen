import type { MeetApparaat, MeetSoort } from '@/lib/meten/gebeurtenis'

// =====================================================================
// Rekenwerk voor de beheerpagina Klikgedrag.
//
// De klikmeting (`site_gebeurtenissen`, zie de README onder "Klikmeting
// zonder koekjes") slaat losse gebeurtenissen op. Hier worden dat bezoeken:
// alles van één tabblad op volgorde, met waar het bezoek begon, waar het
// eindigde en welke stappen van de trechter het haalde. Los van de database,
// zodat het te testen is zonder er een te starten.
// =====================================================================

/** Eén rij uit `site_gebeurtenissen`, alleen de kolommen die we hier gebruiken. */
export type KlikRij = {
  sessie_id: string
  tijdstip: string
  volgnummer: number | null
  soort: MeetSoort
  pad: string
  doel: string | null
  waarde: number | null
  apparaat: MeetApparaat
  verwijzer: string | null
  ingelogd: boolean
}

export type StapSoort = Exclude<MeetSoort, 'scroll'>

/** Eén stap in de route van een bezoek. Scrollen is geen eigen stap. */
export type Stap = {
  soort: StapSoort
  pad: string
  doel: string | null
  tijdstip: string
  /** Alleen bij `pagina`: hoe ver er op die pagina gescrold is (25 tot 100). */
  scroll: number | null
}

export type Trechterstappen = {
  proefsom: boolean
  registratiepagina: boolean
  account: boolean
  oefensom: boolean
}

export type Bezoek = {
  /** Alleen om rijen bij elkaar te houden; komt niet op de pagina. */
  sessieId: string
  begin: string
  eind: string
  duurSeconden: number
  apparaat: MeetApparaat
  /** `van=youtube`, een utm-bron, het domein van de verwijzer, of `direct`. */
  herkomst: string
  /** Was er bij binnenkomst al iemand ingelogd? */
  ingelogdBijBinnenkomst: boolean
  ingelogd: boolean
  /** Klikte op `menu-admin`: dat is Aaf zelf. */
  beheerder: boolean
  stappen: Stap[]
  paginas: number
  kliks: number
  /** De laatste pagina van het bezoek, zonder zoekreeks: waar het eindigde. */
  laatstePagina: string | null
  /** Eén pagina en geen enkele klik. */
  meteenWeg: boolean
  problemen: number
  trechter: Trechterstappen
}

/** Het pad zonder zoekreeks: `/nl/proberen?van=youtube` wordt `/nl/proberen`. */
export function padZonderZoek(pad: string): string {
  const vraagteken = pad.indexOf('?')
  return vraagteken === -1 ? pad : pad.slice(0, vraagteken)
}

/** Eén parameter uit de zoekreeks van een opgeslagen pad. */
export function parameterUitPad(pad: string, naam: string): string | null {
  const vraagteken = pad.indexOf('?')
  if (vraagteken === -1) return null
  const waarde = new URLSearchParams(pad.slice(vraagteken + 1)).get(naam)
  return waarde ? waarde : null
}

/** De startpagina: `/nl`, eventueel met een zoekreeks. Zelfde regel als `meet_trechter`. */
export function isStartpagina(pad: string): boolean {
  return /^\/[a-z]{2}($|\?)/.test(pad)
}

/** Volgorde binnen een tabblad: het volgnummer van de database, anders de tijd. */
function opVolgorde(a: KlikRij, b: KlikRij): number {
  if (a.volgnummer !== null && b.volgnummer !== null && a.volgnummer !== b.volgnummer) {
    return a.volgnummer - b.volgnummer
  }
  if (a.tijdstip !== b.tijdstip) return a.tijdstip < b.tijdstip ? -1 : 1
  return (a.volgnummer ?? 0) - (b.volgnummer ?? 0)
}

/** Waar kwam dit bezoek vandaan? `van=` gaat voor, dan utm, dan de verwijzer. */
export function herkomstVan(rijen: readonly KlikRij[]): string {
  for (const rij of rijen) {
    const van = parameterUitPad(rij.pad, 'van')
    if (van) return `van=${van}`
  }
  for (const rij of rijen) {
    const utm = parameterUitPad(rij.pad, 'utm_source')
    if (utm) return utm
  }
  return rijen.find((rij) => rij.verwijzer)?.verwijzer ?? 'direct'
}

/**
 * Welke stappen van de trechter haalde dit bezoek?
 *
 * * proefsom: de proefsom op `/proberen` of op de startpagina nagekeken,
 *   zoals in `meet_trechter`;
 * * registratiepagina: `/registreren` geopend;
 * * account: de aanmelding is gelukt (gebeurtenis `registratie`);
 * * oefensom: een som nagekeken op de oefenpagina (`oefenen-nakijken`).
 */
export function trechterVan(rijen: readonly KlikRij[]): Trechterstappen {
  const stappen: Trechterstappen = {
    proefsom: false,
    registratiepagina: false,
    account: false,
    oefensom: false,
  }
  for (const rij of rijen) {
    if (
      (rij.soort === 'pagina' && rij.pad.includes('/proberen')) ||
      (rij.soort === 'klik' &&
        (rij.doel === 'home-proefsom-nakijken' ||
          rij.doel === 'proefsom-nakijken' ||
          (rij.doel === 'button:Nakijken' && isStartpagina(rij.pad))))
    ) {
      stappen.proefsom = true
    }
    if (rij.soort === 'pagina' && rij.pad.includes('/registreren')) {
      stappen.registratiepagina = true
    }
    if (rij.soort === 'registratie') stappen.account = true
    if (rij.soort === 'klik' && rij.doel === 'oefenen-nakijken') stappen.oefensom = true
  }
  return stappen
}

function stappenVan(rijen: readonly KlikRij[]): Stap[] {
  const stappen: Stap[] = []
  let huidigePagina: Stap | null = null
  for (const rij of rijen) {
    if (rij.soort === 'scroll') {
      // Scrollen hoort bij de pagina waar iemand op dat moment is.
      if (
        huidigePagina &&
        padZonderZoek(huidigePagina.pad) === padZonderZoek(rij.pad) &&
        rij.waarde !== null
      ) {
        huidigePagina.scroll = Math.max(huidigePagina.scroll ?? 0, rij.waarde)
      }
      continue
    }
    const stap: Stap = {
      soort: rij.soort,
      pad: rij.pad,
      doel: rij.doel,
      tijdstip: rij.tijdstip,
      scroll: null,
    }
    if (rij.soort === 'pagina') huidigePagina = stap
    stappen.push(stap)
  }
  return stappen
}

/** Zet de losse gebeurtenissen om in bezoeken, het nieuwste bezoek eerst. */
export function bouwBezoeken(rijen: readonly KlikRij[]): Bezoek[] {
  const perSessie = new Map<string, KlikRij[]>()
  for (const rij of rijen) {
    const lijst = perSessie.get(rij.sessie_id)
    if (lijst) lijst.push(rij)
    else perSessie.set(rij.sessie_id, [rij])
  }

  const bezoeken: Bezoek[] = []
  for (const [sessieId, lijst] of perSessie) {
    const opRij = [...lijst].sort(opVolgorde)
    const eerste = opRij[0]
    const tijden = opRij.map((rij) => Date.parse(rij.tijdstip))
    const begin = Math.min(...tijden)
    const eind = Math.max(...tijden)
    const stappen = stappenVan(opRij)
    const paginas = stappen.filter((stap) => stap.soort === 'pagina')
    const kliks = opRij.filter(
      (rij) => rij.soort === 'klik' || rij.soort === 'dode_klik' || rij.soort === 'woedeklik',
    ).length
    const laatste = paginas.at(-1)

    bezoeken.push({
      sessieId,
      begin: new Date(begin).toISOString(),
      eind: new Date(eind).toISOString(),
      duurSeconden: Math.round((eind - begin) / 1000),
      apparaat: eerste.apparaat,
      herkomst: herkomstVan(opRij),
      ingelogdBijBinnenkomst: eerste.ingelogd,
      ingelogd: opRij.some((rij) => rij.ingelogd),
      beheerder: opRij.some((rij) => rij.doel === 'menu-admin'),
      stappen,
      paginas: paginas.length,
      kliks,
      laatstePagina: laatste ? padZonderZoek(laatste.pad) : null,
      meteenWeg: paginas.length <= 1 && kliks === 0,
      problemen: opRij.filter(
        (rij) => rij.soort === 'dode_klik' || rij.soort === 'woedeklik' || rij.soort === 'fout',
      ).length,
      trechter: trechterVan(opRij),
    })
  }

  return bezoeken.sort((a, b) => (a.begin < b.begin ? 1 : a.begin > b.begin ? -1 : 0))
}

export type TrechterRegel = { label: string; aantal: number }

/**
 * De weg van een nieuwe bezoeker, in bezoeken. Alleen wie niet ingelogd
 * binnenkwam telt mee: een leerling met een account hoeft niet meer te
 * registreren.
 */
export function trechter(bezoeken: readonly Bezoek[]): TrechterRegel[] {
  const nieuw = bezoeken.filter((bezoek) => !bezoek.ingelogdBijBinnenkomst)
  return [
    { label: 'Binnengekomen (niet ingelogd)', aantal: nieuw.length },
    { label: 'Proefsom nagekeken', aantal: nieuw.filter((b) => b.trechter.proefsom).length },
    {
      label: 'Registratiepagina geopend',
      aantal: nieuw.filter((b) => b.trechter.registratiepagina).length,
    },
    { label: 'Account aangemaakt', aantal: nieuw.filter((b) => b.trechter.account).length },
    { label: 'Eerste oefensom nagekeken', aantal: nieuw.filter((b) => b.trechter.oefensom).length },
  ]
}

export type EindRegel = {
  pad: string
  /** In zoveel bezoeken kwam deze pagina voor. */
  bezocht: number
  /** In zoveel bezoeken was dit de laatste pagina. */
  eindigdeHier: number
}

/** Op welke pagina eindigen de bezoeken, en hoe vaak is dat van wie er kwam? */
export function eindpaginas(bezoeken: readonly Bezoek[]): EindRegel[] {
  const regels = new Map<string, EindRegel>()
  const regel = (pad: string) => {
    let gevonden = regels.get(pad)
    if (!gevonden) {
      gevonden = { pad, bezocht: 0, eindigdeHier: 0 }
      regels.set(pad, gevonden)
    }
    return gevonden
  }
  for (const bezoek of bezoeken) {
    const gezien = new Set(
      bezoek.stappen
        .filter((stap) => stap.soort === 'pagina')
        .map((stap) => padZonderZoek(stap.pad)),
    )
    for (const pad of gezien) regel(pad).bezocht++
    if (bezoek.laatstePagina) regel(bezoek.laatstePagina).eindigdeHier++
  }
  return [...regels.values()]
    .filter((r) => r.eindigdeHier > 0)
    .sort((a, b) => b.eindigdeHier - a.eindigdeHier || b.bezocht - a.bezocht)
}

export type KlikRegel = {
  doel: string
  /** Leeg als de regel over alle pagina's samen gaat. */
  pad: string | null
  keer: number
  bezoeken: number
}

/**
 * Tel klikken van één of meer soorten. Met `perPagina` telt dezelfde knop op
 * twee pagina's als twee regels; dat is handig bij dode klikken, waar de plek
 * ertoe doet.
 */
export function telKlikken(
  bezoeken: readonly Bezoek[],
  soorten: readonly StapSoort[],
  { perPagina = false }: { perPagina?: boolean } = {},
): KlikRegel[] {
  const regels = new Map<string, KlikRegel & { sessies: Set<string> }>()
  for (const bezoek of bezoeken) {
    for (const stap of bezoek.stappen) {
      if (!soorten.includes(stap.soort)) continue
      const doel = stap.doel ?? '(zonder naam)'
      const pad = perPagina ? padZonderZoek(stap.pad) : null
      const sleutel = `${pad ?? ''} ${doel}`
      let regel = regels.get(sleutel)
      if (!regel) {
        regel = { doel, pad, keer: 0, bezoeken: 0, sessies: new Set() }
        regels.set(sleutel, regel)
      }
      regel.keer++
      regel.sessies.add(bezoek.sessieId)
    }
  }
  return [...regels.values()]
    .map(({ sessies, ...regel }) => ({ ...regel, bezoeken: sessies.size }))
    .sort((a, b) => b.bezoeken - a.bezoeken || b.keer - a.keer)
}

/** "45 s", "2 min 10 s", "1 u 5 min". */
export function duurTekst(seconden: number): string {
  if (seconden < 60) return `${seconden} s`
  const minuten = Math.floor(seconden / 60)
  if (minuten < 60) {
    const rest = seconden % 60
    return rest ? `${minuten} min ${rest} s` : `${minuten} min`
  }
  const uren = Math.floor(minuten / 60)
  const restMinuten = minuten % 60
  return restMinuten ? `${uren} u ${restMinuten} min` : `${uren} u`
}

/** Percentage als heel getal, of een streepje als er niets te delen is. */
export function procent(deel: number, geheel: number): string {
  if (geheel === 0) return '—'
  return `${Math.round((deel / geheel) * 100)}%`
}
