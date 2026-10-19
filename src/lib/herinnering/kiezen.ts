/**
 * Wie krijgt er vandaag een herinnering? (zie AFG-487)
 *
 * Van de leerlingen die ooit begonnen kwam 72% maar op één dag terug, en er
 * was niets dat hen terughaalde. Deze regels bepalen wie er één mailtje krijgt
 * — opzettelijk karig, want een mail die te vaak komt is erger dan geen mail.
 *
 * Alles hier is rekenwerk zonder database, zodat de regels zonder Supabase te
 * controleren zijn. De route haalt de rijen op en doet het versturen.
 */

/** Zoveel dagen stil, dan mag er een herinnering. */
export const STIL_DAGEN = 7

/** Zoveel dagen tussen twee herinneringen. */
export const AFKOEL_DAGEN = 14

/** Meer dan dit krijgt niemand ooit. Wie echt gestopt is, laten we met rust. */
export const MAX_HERINNERINGEN = 3

/**
 * Hoogstens zoveel mails per ronde. De taak draait op een Worker met een
 * beperkte rekentijd; loopt het aantal leerlingen op, dan gaat de rest de
 * volgende nacht mee.
 */
export const MAX_PER_RONDE = 50

const DAG_MS = 24 * 60 * 60 * 1000

export type HerinneringKandidaat = {
  userId: string
  /** Staat de herinnering aan? Standaard uit; alleen de leerling zet hem aan. */
  aan: boolean
  /** Wanneer de leerling de herinnering aanzette. */
  aanSinds: string | null
  /** Het laatste antwoord dat de leerling gaf, of null als hij nooit oefende. */
  laatsteActiviteit: string | null
  /** Wanneer de vorige herinnering de deur uit ging. */
  laatsteHerinnering: string | null
  /** Hoeveel herinneringen deze leerling al kreeg. */
  aantal: number
}

function alsTijd(waarde: string | null): number | null {
  if (!waarde) return null
  const tijd = Date.parse(waarde)
  return Number.isNaN(tijd) ? null : tijd
}

/**
 * Vanaf wanneer het stil is.
 *
 * Normaal is dat het laatste antwoord. Heeft de leerling nog nooit geoefend,
 * dan telt de stilte vanaf het moment dat hij de herinnering aanzette — anders
 * krijgt iemand die zich vandaag aanmeldt en de schakelaar omzet volgende week
 * meteen een mail over iets wat hij nog niet begonnen is.
 */
export function stilSinds(kandidaat: HerinneringKandidaat): number | null {
  return alsTijd(kandidaat.laatsteActiviteit) ?? alsTijd(kandidaat.aanSinds)
}

/** Hele dagen tussen twee tijdstippen, naar beneden afgerond. */
export function dagenTussen(van: number, tot: number): number {
  return Math.floor((tot - van) / DAG_MS)
}

/**
 * De drie horden waar je niets voor hoeft op te zoeken: de schakelaar staat
 * aan, er zijn er nog niet te veel geweest, en de vorige is lang genoeg
 * geleden. De taak gebruikt dit om eerst af te vallen wie sowieso niets
 * krijgt, zodat hij alleen voor de rest hoeft uit te zoeken wanneer die voor
 * het laatst een antwoord gaf.
 */
export function magNogEenRonde(kandidaat: HerinneringKandidaat, nu: Date): boolean {
  if (!kandidaat.aan) return false
  if (kandidaat.aantal >= MAX_HERINNERINGEN) return false

  const vorige = alsTijd(kandidaat.laatsteHerinnering)
  if (vorige !== null && dagenTussen(vorige, nu.getTime()) < AFKOEL_DAGEN) return false

  return true
}

/**
 * Mag deze leerling nu een herinnering krijgen?
 *
 * Vier horden: de schakelaar staat aan, hij heeft er nog niet te veel gehad,
 * de vorige is lang genoeg geleden, en het is lang genoeg stil. Of er ook
 * echt iets te oefenen valt, beslist de route: is alles beheerst, dan is er
 * niets om naartoe te wijzen en gaat er geen mail uit.
 */
export function magHerinnering(kandidaat: HerinneringKandidaat, nu: Date): boolean {
  if (!magNogEenRonde(kandidaat, nu)) return false

  const stil = stilSinds(kandidaat)
  // Zonder begintijd weten we niet hoelang het stil is. Dan maar geen mail.
  if (stil === null) return false

  return dagenTussen(stil, nu.getTime()) >= STIL_DAGEN
}

/**
 * De leerlingen die vandaag een herinnering mogen krijgen, de langst stille
 * eerst, en nooit meer dan `MAX_PER_RONDE` tegelijk.
 */
export function kiesOntvangers(
  kandidaten: readonly HerinneringKandidaat[],
  nu: Date,
): HerinneringKandidaat[] {
  return kandidaten
    .filter((kandidaat) => magHerinnering(kandidaat, nu))
    .sort((a, b) => (stilSinds(a) ?? 0) - (stilSinds(b) ?? 0))
    .slice(0, MAX_PER_RONDE)
}
