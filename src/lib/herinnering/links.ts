/**
 * De twee links in de herinneringsmail. Allebei paden zonder domein; de mail
 * plakt er `SITE_URL` voor.
 */

/** De naam van de zoekterm in de afmeldlink. */
export const AFMELD_SLEUTEL = 'sleutel'

/**
 * De afmeldlink. Hierin staat het willekeurige nummer uit `profiles`, nooit
 * het gebruikersnummer: zo valt er uit een doorgestuurde mail niets over het
 * account af te leiden.
 */
export function afmeldPad(sleutel: string): string {
  return `/nl/herinnering-uit?${AFMELD_SLEUTEL}=${encodeURIComponent(sleutel)}`
}

/**
 * De soort som op de oefenpagina. Zonder opgavenummer: welke opgave aan de
 * beurt is, hangt af van wat de leerling al goed had, en dat uitrekenen voor
 * iedereen in één nachtelijke taak is duurder dan het waard is. Hij ziet de
 * tegels van deze soort som en kiest er zelf een.
 */
export function oefenPad(
  hoofdstukSlug: string,
  onderwerpSlug: string,
  soortSomSlug: string,
): string {
  const vraagtekst = [
    ['chapter', hoofdstukSlug],
    ['topic', onderwerpSlug],
    ['cluster', soortSomSlug],
  ]
    .map(([naam, waarde]) => `${naam}=${encodeURIComponent(waarde)}`)
    .join('&')

  return `/nl/oefenen?${vraagtekst}`
}
