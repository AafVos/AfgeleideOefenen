/**
 * Eigen uitlegpagina voor extreme waarden: `/theorie/extreme-waarden`.
 *
 * De overzichtskaart op `/theorie` blijft staan (anker `kaart-h15-top_tweede`).
 * Deze pagina is het adres dat extreme waarden bij naam noemt.
 */

export const EXTREME_WAARDEN_PAD = '/theorie/extreme-waarden'

export const EXTREME_WAARDEN_TITEL = 'Extreme waarden oefenen'

export const EXTREME_WAARDEN_OMSCHRIJVING =
  'Uitleg van extreme waarden voor wiskunde B. Je ziet het stappenplan en drie uitgewerkte voorbeelden, en je kunt daarna zelf oefenen.'

/**
 * Hoofdstuk 15, onderwerp "Hellingen, buigpunten en toppen".
 * Daar zitten de toppen: de x en de waarde.
 */
export const EXTREME_WAARDEN_OEFENEN = '/oefenen?chapter=h15&topic=h15_hellingen'

/**
 * f is de functie. Drie losse regels, zodat een telefoon ze kan afbreken.
 */
export const EXTREME_WAARDEN_FORMULE = [
  "f'(x) = 0",
  "f''(x) < 0 \\implies \\text{maximum}",
  "f''(x) > 0 \\implies \\text{minimum}",
] as const

export type ExtremeWaardenStap = {
  n: 0 | 1 | 2 | 3
  tekst: string
}

export const EXTREME_WAARDEN_STAPPEN: ExtremeWaardenStap[] = [
  {
    n: 0,
    tekst:
      'Een extreme waarde is een top van de grafiek: een grootste of een kleinste waarde in de buurt. In zo\'n top is de helling nul.',
  },
  {
    n: 1,
    tekst: "Bereken de afgeleide $f'(x)$.",
  },
  {
    n: 2,
    tekst:
      "Stel $f'(x) = 0$ en los $x$ op. Alleen een oplossing die bij de functie hoort telt mee.",
  },
  {
    n: 3,
    tekst:
      "Kijk naar $f''(x)$ in dat punt. Is die negatief, dan is het een maximum. Is die positief, dan is het een minimum. Reken $f$ daar uit: dat getal is de extreme waarde. Je mag ook naar het teken van $f'$ kijken: plus daarna min is een maximum, min daarna plus een minimum.",
  },
]

export type ExtremeWaardenVoorbeeld = {
  opgave: string
  stappen: string[]
  antwoord: string
}

/**
 * Eigen voorbeelden, nagerekend op 14 oktober 2026.
 * Niet dezelfde sommen als op de overzichtskaart.
 *
 * 1. $x^2 - 6x + 5 = (x - 1)(x - 5)$. Top op $x = 3$. $f(3) = 9 - 18 + 5 = -4$.
 *    $f''(x) = 2 > 0$, dus een minimum.
 * 2. $-x^2 + 4x + 1 = 5 - (x - 2)^2$. Top op $x = 2$, waarde $5$.
 *    $f''(x) = -2 < 0$, dus een maximum.
 * 3. $x^3 - 12x$. $f'(x) = 3x^2 - 12 = 3(x - 2)(x + 2)$.
 *    $f(-2) = -8 + 24 = 16$ (maximum, want $f''(-2) = -12$).
 *    $f(2) = 8 - 24 = -16$ (minimum, want $f''(2) = 12$).
 */
export const EXTREME_WAARDEN_VOORBEELDEN: ExtremeWaardenVoorbeeld[] = [
  {
    opgave: 'f(x) = x^2 - 6x + 5',
    stappen: [
      'Stap 0. Je zoekt de extreme waarde van $f$. In een top is de helling nul.',
      "Stap 1. $f'(x) = 2x - 6$.",
      "Stap 2. $2x - 6 = 0$ geeft $x = 3$.",
      "Stap 3. $f''(x) = 2 > 0$, dus een minimum. $f(3) = 9 - 18 + 5 = -4$.",
    ],
    antwoord: '\\text{minimum } -4 \\text{ bij } x = 3',
  },
  {
    opgave: 'f(x) = -x^2 + 4x + 1',
    stappen: [
      'Stap 0. Je zoekt de extreme waarde van $f$. In een top is de helling nul.',
      "Stap 1. $f'(x) = -2x + 4$.",
      "Stap 2. $-2x + 4 = 0$ geeft $x = 2$.",
      "Stap 3. $f''(x) = -2 < 0$, dus een maximum. $f(2) = -4 + 8 + 1 = 5$.",
    ],
    antwoord: '\\text{maximum } 5 \\text{ bij } x = 2',
  },
  {
    opgave: 'f(x) = x^3 - 12x',
    stappen: [
      'Stap 0. Je zoekt de extreme waarden van $f$. In een top is de helling nul.',
      "Stap 1. $f'(x) = 3x^2 - 12$.",
      "Stap 2. $3x^2 - 12 = 0$ geeft $x^2 = 4$, dus $x = -2$ of $x = 2$.",
      "Stap 3. $f''(x) = 6x$. $f''(-2) = -12 < 0$, dus een maximum: $f(-2) = -8 + 24 = 16$. $f''(2) = 12 > 0$, dus een minimum: $f(2) = 8 - 24 = -16$.",
    ],
    antwoord:
      '\\text{maximum } 16 \\text{ bij } x = -2,\\ \\text{minimum } -16 \\text{ bij } x = 2',
  },
]
