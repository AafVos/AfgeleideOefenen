// =====================================================================
// Dagen tellen voor het dashboard: de balkjes van "Afgelopen 14 dagen"
// en het getal "Dagen op rij".
//
// Twee dingen zijn hier belangrijk:
//
// 1. Een dag loopt van middernacht tot middernacht in Nederlandse tijd,
//    niet in UTC. Wie om 00:30 oefent, hoort dat op die dag te zien en
//    niet op de dag ervoor.
// 2. De reeks breekt pas als je een hele dag overslaat. Vandaag mag dus
//    nog leeg zijn: dan telt de reeks vanaf gisteren.
// =====================================================================

const NEDERLAND = 'Europe/Amsterdam'

const nederlandseKlok = new Intl.DateTimeFormat('en-CA', {
  timeZone: NEDERLAND,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
})

type Klok = {
  jaar: number
  maand: number
  dag: number
  uur: number
  minuut: number
  seconde: number
}

/** De wandklok in Nederland op dat moment. */
function nederlandseTijd(moment: Date): Klok {
  const delen = nederlandseKlok.formatToParts(moment)
  const getal = (soort: Intl.DateTimeFormatPartTypes) =>
    Number(delen.find((d) => d.type === soort)?.value)
  return {
    jaar: getal('year'),
    maand: getal('month'),
    dag: getal('day'),
    uur: getal('hour'),
    minuut: getal('minute'),
    seconde: getal('second'),
  }
}

/** Hoeveel Nederland op dat moment voorloopt op UTC, in milliseconden. */
function voorsprongOpUtc(moment: Date): number {
  const k = nederlandseTijd(moment)
  const wandklok = Date.UTC(k.jaar, k.maand - 1, k.dag, k.uur, k.minuut, k.seconde)
  // Milliseconden doen hier niet mee: de wandklok telt alleen hele seconden.
  return wandklok - Math.floor(moment.getTime() / 1000) * 1000
}

function alsSleutel(jaar: number, maand: number, dag: number): string {
  const tweeCijfers = (n: number) => String(n).padStart(2, '0')
  return `${jaar}-${tweeCijfers(maand)}-${tweeCijfers(dag)}`
}

/** De dag waarop dat moment valt in Nederland, als `jjjj-mm-dd`. */
export function dagSleutel(moment: Date): string {
  const k = nederlandseTijd(moment)
  return alsSleutel(k.jaar, k.maand, k.dag)
}

/** De dag vóór deze dag. */
export function vorigeDag(sleutel: string): string {
  const [jaar, maand, dag] = sleutel.split('-').map(Number)
  const eerder = new Date(Date.UTC(jaar, maand - 1, dag - 1))
  return alsSleutel(
    eerder.getUTCFullYear(),
    eerder.getUTCMonth() + 1,
    eerder.getUTCDate(),
  )
}

/** Middernacht in Nederland aan het begin van die dag. */
export function beginVanDag(sleutel: string): Date {
  const [jaar, maand, dag] = sleutel.split('-').map(Number)
  const middernachtInUtc = Date.UTC(jaar, maand - 1, dag)
  const gok = new Date(middernachtInUtc - voorsprongOpUtc(new Date(middernachtInUtc)))
  // Rond de overgang van zomer- naar wintertijd kan de voorsprong van de
  // gok net anders zijn dan die van het antwoord; dan nog één keer rekenen.
  const beter = middernachtInUtc - voorsprongOpUtc(gok)
  return beter === gok.getTime() ? gok : new Date(beter)
}

/** De laatste `aantal` dagen tot en met `vandaag`, oudste eerst. */
export function laatsteDagen(vandaag: string, aantal: number): string[] {
  const dagen = [vandaag]
  while (dagen.length < aantal) dagen.push(vorigeDag(dagen[dagen.length - 1]))
  return dagen.reverse()
}

/**
 * Hoeveel dagen op rij er geoefend is, geteld vanaf vandaag terug.
 * Heeft vandaag nog geen antwoorden, dan begint de telling bij gisteren:
 * de reeks breekt pas als een hele dag wordt overgeslagen.
 */
export function berekenReeks(
  dagenMetAntwoord: ReadonlySet<string>,
  vandaag: string,
): number {
  let dag = dagenMetAntwoord.has(vandaag) ? vandaag : vorigeDag(vandaag)
  let reeks = 0
  // Elke stap gaat één dag terug en elke getelde dag zit in de verzameling,
  // dus deze lus loopt hoogstens zoveel keer als die groot is.
  while (dagenMetAntwoord.has(dag)) {
    reeks++
    dag = vorigeDag(dag)
  }
  return reeks
}
