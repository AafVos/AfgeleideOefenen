import { KETTINGREGEL_PAD, KETTINGREGEL_TITEL } from '@/content/theory/kettingregel'
import { MACHTSREGEL_PAD, MACHTSREGEL_TITEL } from '@/content/theory/machtsregel'
import { PRODUCTREGEL_PAD, PRODUCTREGEL_TITEL } from '@/content/theory/productregel'
import { QUOTIENTREGEL_PAD, QUOTIENTREGEL_TITEL } from '@/content/theory/quotientregel'
import { SOMREGEL_PAD, SOMREGEL_TITEL } from '@/content/theory/somregel'

/**
 * Overzichtspagina `/theorie/differentieerregels`: de zoekzin "differentieer
 * regels" komt voor in Search Console, maar leidde nergens naartoe. Deze
 * pagina bundelt de vijf regelpagina's zelf.
 */

export const DIFFERENTIEERREGELS_PAD = '/theorie/differentieerregels'

export const DIFFERENTIEERREGELS_TITEL = 'Differentieerregels'

export const DIFFERENTIEERREGELS_OMSCHRIJVING =
  'Overzicht van de differentieerregels voor wiskunde B: somregel, machtsregel, productregel, quotiëntregel en kettingregel. Met uitleg en losse oefenpagina per regel.'

/** Hoofdstuk 2, onderwerp "Termsgewijs differentiëren": de basis voor elke regel hieronder. */
export const DIFFERENTIEERREGELS_OEFENEN = '/oefenen?chapter=h2&topic=h2_termsgewijs'

export type DifferentieerregelKaart = {
  titel: string
  pad: string
  omschrijving: string
}

export const DIFFERENTIEERREGELS_OVERZICHT: DifferentieerregelKaart[] = [
  {
    titel: SOMREGEL_TITEL,
    pad: SOMREGEL_PAD,
    omschrijving: 'Voor een functie die uit losse termen bestaat: differentieer elke term apart.',
  },
  {
    titel: MACHTSREGEL_TITEL,
    pad: MACHTSREGEL_PAD,
    omschrijving: 'Voor één macht van x: de macht komt naar voren en wordt daarna één lager.',
  },
  {
    titel: PRODUCTREGEL_TITEL,
    pad: PRODUCTREGEL_PAD,
    omschrijving: 'Voor twee functies die met elkaar vermenigvuldigd zijn.',
  },
  {
    titel: QUOTIENTREGEL_TITEL,
    pad: QUOTIENTREGEL_PAD,
    omschrijving: 'Voor een breuk met een functie boven én onder de streep.',
  },
  {
    titel: KETTINGREGEL_TITEL,
    pad: KETTINGREGEL_PAD,
    omschrijving: 'Voor een functie binnen een functie: eerst de buitenste, dan de binnenste.',
  },
]
