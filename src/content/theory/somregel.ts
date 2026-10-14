/**
 * Eigen uitlegpagina voor de somregel: `/theorie/somregel`.
 *
 * De overzichtskaart op `/theorie` blijft staan (anker `kaart-h2-somregel`).
 * Deze pagina is het adres dat de regel bij naam noemt.
 */

export const SOMREGEL_PAD = '/theorie/somregel'

export const SOMREGEL_TITEL = 'Somregel oefenen'

export const SOMREGEL_OMSCHRIJVING =
  'Uitleg van de somregel voor wiskunde B. Je ziet het stappenplan en drie uitgewerkte voorbeelden, en je kunt daarna zelf oefenen.'

/** Hoofdstuk 2, onderwerp "Termsgewijs differentiëren". Daar oefen je de somregel. */
export const SOMREGEL_OEFENEN = '/oefenen?chapter=h2&topic=h2_termsgewijs'

/**
 * f is de functie die je differentieert, g de eerste term, h de tweede.
 * Twee losse regels, zodat een telefoon ze kan afbreken.
 */
export const SOMREGEL_FORMULE = [
  'f(x) = g(x) + h(x)',
  "f'(x) = g'(x) + h'(x)",
] as const

export type SomregelStap = {
  n: 0 | 1 | 2 | 3
  tekst: string
}

export const SOMREGEL_STAPPEN: SomregelStap[] = [
  {
    n: 0,
    tekst:
      'Kijk of er een plus of een min tussen de delen staat. Elke term mag je apart differentiëren. Een min blijft een min: je trekt de afgeleiden van elkaar af.',
  },
  {
    n: 1,
    tekst:
      'Noem de hele functie $f$. Noem de eerste term $g$ en de tweede $h$. Schrijf $f(x) = g(x) + h(x)$. Bij een min schrijf je $f(x) = g(x) - h(x)$.',
  },
  {
    n: 2,
    tekst:
      "Bereken $g'(x)$ en $h'(x)$. Elke term apart, met de machtsregel. Een los getal, zonder $x$, heeft afgeleide $0$.",
  },
  {
    n: 3,
    tekst:
      "Tel de afgeleiden op: $f'(x) = g'(x) + h'(x)$. Bij een min trek je ze af. Werk dat uit tot een net antwoord.",
  },
]

export type SomregelVoorbeeld = {
  opgave: string
  stappen: string[]
  antwoord: string
}

/**
 * Eigen voorbeelden, nagerekend op 14 oktober 2026.
 * Niet dezelfde sommen als op de overzichtskaart.
 *
 * 1. $2x^5 - 3x^2 + 7$. Afgeleide $10x^4 - 6x$. Bij $x = 1$ is dat $4$.
 * 2. $x^4 + 6x - 1$. Afgeleide $4x^3 + 6$. Bij $x = 0$ is dat $6$, bij $x = 1$ is dat $10$.
 * 3. $5x^3 - x^2 + 4x$. Afgeleide $15x^2 - 2x + 4$. Bij $x = 1$ is dat $17$.
 */
export const SOMREGEL_VOORBEELDEN: SomregelVoorbeeld[] = [
  {
    opgave: 'f(x) = 2x^5 - 3x^2 + 7',
    stappen: [
      'Stap 0. Er staan een min en een plus tussen de termen. Dat is de somregel. Elke term apart.',
      'Stap 1. Drie termen: $2x^5$, $-3x^2$ en $7$.',
      "Stap 2. $(2x^5)' = 10x^4$, $(-3x^2)' = -6x$ en $(7)' = 0$.",
      "Stap 3. $f'(x) = 10x^4 - 6x + 0 = 10x^4 - 6x$.",
    ],
    antwoord: "f'(x) = 10x^4 - 6x",
  },
  {
    opgave: 'f(x) = x^4 + 6x - 1',
    stappen: [
      'Stap 0. Er staan een plus en een min tussen de termen. Dat is de somregel.',
      'Stap 1. Drie termen: $x^4$, $6x$ en $-1$.',
      "Stap 2. $(x^4)' = 4x^3$, $(6x)' = 6$ en $(-1)' = 0$.",
      "Stap 3. $f'(x) = 4x^3 + 6$.",
    ],
    antwoord: "f'(x) = 4x^3 + 6",
  },
  {
    opgave: 'f(x) = 5x^3 - x^2 + 4x',
    stappen: [
      'Stap 0. Er staan een min en een plus tussen de termen. Dat is de somregel.',
      'Stap 1. Drie termen: $5x^3$, $-x^2$ en $4x$.',
      "Stap 2. $(5x^3)' = 15x^2$, $(-x^2)' = -2x$ en $(4x)' = 4$.",
      "Stap 3. $f'(x) = 15x^2 - 2x + 4$.",
    ],
    antwoord: "f'(x) = 15x^2 - 2x + 4",
  },
]
