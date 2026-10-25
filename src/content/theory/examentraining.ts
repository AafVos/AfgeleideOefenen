/**
 * Openbare uitlegpagina voor de examentraining: `/theorie/examentraining`.
 *
 * Het oefendeel zelf staat op `/oefenen` en blijft achter de inlog.
 * `robots.txt` blokkeert `/nl/oefenen`. Deze pagina staat bewust niet op
 * `/examentraining`, zodat een zoekmachine haar wel mag lezen.
 *
 * Eigen tekst. Geen officiële examenopgaven.
 * Examendatum nagekeken op Examenblad, 14 oktober 2026: cse 1e tijdvak
 * wiskunde B vwo, vrijdag 28 mei 2027, 13.30–16.30.
 */

export const EXAMENTRAINING_PAD = '/theorie/examentraining'

export const EXAMENTRAINING_TITEL = 'Examentraining wiskunde B vwo gratis oefenen'

export const EXAMENTRAINING_OMSCHRIJVING =
  'Oefen gratis differentiëren voor het centraal examen wiskunde B vwo. Eigen oefenopgaven, geen officiële examenvragen. Je ziet wanneer het examen is.'

/** Vakpagina op Examenblad, examenjaar 2027. */
export const EXAMENTRAINING_EXAMENBLAD =
  'https://www.examenblad.nl/2027/vwo/vakken/exacte-vakken/wiskunde-b-vwo'

export const EXAMENTRAINING_MOMENT = 'vrijdag 28 mei 2027, van 13.30 tot 16.30 uur'

/**
 * Hoofdstuk 16. De opgaven staan achter de inlog; `/oefenen` stuurt
 * een bezoeker zonder account door naar inloggen.
 */
export const EXAMENTRAINING_OEFENEN =
  '/oefenen?chapter=h16&topic=h16_examentraining'

/**
 * De echte examenvragen: het hoofdstuk na H16 (migratie 0070). Ook deze
 * opgaven staan achter de inlog.
 */
export const EXAMENVRAGEN_OEFENEN = '/oefenen?chapter=examen&topic=examen_vragen'

/** De zeven soorten in hoofdstuk 16, in de volgorde van het hoofdstuk. */
export const EXAMENTRAINING_ONDERDELEN = [
  'de helling van de grafiek in een punt',
  'de vergelijking van de raaklijn',
  'bij een gegeven helling de bijbehorende x zoeken',
  'een top van de grafiek',
  'een kleinste of een grootste waarde',
  'een lijn die loodrecht op de raaklijn staat',
  'een buigpunt en de buigraaklijn',
] as const
