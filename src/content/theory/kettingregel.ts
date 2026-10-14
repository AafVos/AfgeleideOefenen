/**
 * Eigen uitlegpagina voor de kettingregel: `/theorie/kettingregel`.
 *
 * De overzichtskaart op `/theorie` blijft staan (anker `kaart-h6-kettingregel`).
 * Deze pagina is het adres dat de regel bij naam noemt.
 */

export const KETTINGREGEL_PAD = '/theorie/kettingregel'

export const KETTINGREGEL_TITEL = 'Kettingregel oefenen'

export const KETTINGREGEL_OMSCHRIJVING =
  'Uitleg van de kettingregel voor wiskunde B. Je ziet het stappenplan en drie uitgewerkte voorbeelden, en je kunt daarna zelf oefenen.'

/** Hoofdstuk 6, onderwerp "De kettingregel". */
export const KETTINGREGEL_OEFENEN = '/oefenen?chapter=h6&topic=h6_kettingregel'

/**
 * f is de functie die je differentieert, g de buitenste, h de binnenste.
 * Twee losse regels, zodat een telefoon ze kan afbreken.
 */
export const KETTINGREGEL_FORMULE = [
  'f(x) = g\\bigl(h(x)\\bigr)',
  "f'(x) = g'\\bigl(h(x)\\bigr) \\cdot h'(x)",
] as const

export type KettingregelStap = {
  n: 0 | 1 | 2 | 3
  tekst: string
}

export const KETTINGREGEL_STAPPEN: KettingregelStap[] = [
  {
    n: 0,
    tekst:
      'Kijk naar de buitenste schil. Zit er een functie in een functie, bijvoorbeeld een macht om haakjes of een wortel om iets met $x$? Dan is het de kettingregel.',
  },
  {
    n: 1,
    tekst:
      'Noem de hele functie $f$, de buitenste functie $g$ en de binnenste $h$. Schrijf $f(x) = g\\bigl(h(x)\\bigr)$.',
  },
  {
    n: 2,
    tekst:
      "Bereken $g'\\bigl(h(x)\\bigr)$ en $h'(x)$. In de afgeleide van de buitenkant laat je $h(x)$ staan.",
  },
  {
    n: 3,
    tekst:
      "Vermenigvuldig: $f'(x) = g'\\bigl(h(x)\\bigr) \\cdot h'(x)$. Werk dat uit tot een net antwoord.",
  },
]

export type KettingregelVoorbeeld = {
  opgave: string
  stappen: string[]
  antwoord: string
}

/**
 * Eigen voorbeelden, nagerekend op 13 oktober 2026.
 *
 * 1. $(2x-5)^4$. Afgeleide $4(2x-5)^3 \\cdot 2 = 8(2x-5)^3$.
 *    Controle via het binomium: $64x^3 - 480x^2 + 1200x - 1000$ is bij $x = 3$ gelijk aan $8$.
 * 2. $(x^2-3x)^5$. Binnenste afgeleide $2x-3$. Bij $x = 1$ is de binnenkant $-2$
 *    en de afgeleide $5 \\cdot 16 \\cdot (-1) = -80$.
 * 3. $\\sqrt{5x-2} = (5x-2)^{1/2}$. Afgeleide $\\tfrac{1}{2}(5x-2)^{-1/2} \\cdot 5 = \\dfrac{5}{2\\sqrt{5x-2}}$.
 *    Bij $x = 2$ is dat $\\dfrac{5}{2\\sqrt{8}} \\approx 0{,}884$.
 */
export const KETTINGREGEL_VOORBEELDEN: KettingregelVoorbeeld[] = [
  {
    opgave: 'f(x) = (2x-5)^4',
    stappen: [
      'Stap 0. De buitenste schil is een vierde macht. Daarin staat $2x-5$. Dat is de kettingregel.',
      'Stap 1. $h(x) = 2x-5$ en $g$ is tot de macht $4$, dus $f(x) = \\bigl(h(x)\\bigr)^4$.',
      "Stap 2. $g'\\bigl(h(x)\\bigr) = 4(2x-5)^3$ en $h'(x) = 2$.",
      "Stap 3. $f'(x) = 4(2x-5)^3 \\cdot 2 = 8(2x-5)^3$.",
    ],
    antwoord: "f'(x) = 8(2x-5)^3",
  },
  {
    opgave: 'f(x) = (x^2-3x)^5',
    stappen: [
      'Stap 0. De buitenste schil is een vijfde macht. Daarin staat $x^2-3x$. Dat is de kettingregel.',
      'Stap 1. $h(x) = x^2-3x$ en $g$ is tot de macht $5$.',
      "Stap 2. $g'\\bigl(h(x)\\bigr) = 5(x^2-3x)^4$ en $h'(x) = 2x-3$.",
      "Stap 3. $f'(x) = 5(x^2-3x)^4 \\cdot (2x-3)$.",
    ],
    antwoord: "f'(x) = 5(x^2-3x)^4(2x-3)",
  },
  {
    opgave: 'f(x) = \\sqrt{5x-2}',
    stappen: [
      'Stap 0. De buitenste schil is een wortel. Daarin staat $5x-2$. Dat is de kettingregel. De wortel bestaat als $5x-2 \\ge 0$, de afgeleide als $5x-2 > 0$.',
      'Stap 1. Schrijf de wortel als macht: $f(x) = (5x-2)^{1/2}$. Dus $h(x) = 5x-2$ en $g$ is tot de macht $\\tfrac{1}{2}$.',
      "Stap 2. $g'\\bigl(h(x)\\bigr) = \\tfrac{1}{2}(5x-2)^{-1/2}$ en $h'(x) = 5$.",
      "Stap 3. $f'(x) = \\tfrac{1}{2}(5x-2)^{-1/2} \\cdot 5 = \\dfrac{5}{2\\sqrt{5x-2}}$.",
    ],
    antwoord: "f'(x) = \\dfrac{5}{2\\sqrt{5x-2}}",
  },
]
