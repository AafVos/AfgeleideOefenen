/**
 * Eigen uitlegpagina voor de quotiëntregel: `/theorie/quotientregel`.
 *
 * De overzichtskaart op `/theorie` blijft staan (anker `kaart-h2-quotientregel`).
 * Deze pagina is het adres dat de regel bij naam noemt.
 */

export const QUOTIENTREGEL_PAD = '/theorie/quotientregel'

export const QUOTIENTREGEL_TITEL = 'Quotiëntregel oefenen'

export const QUOTIENTREGEL_OMSCHRIJVING =
  'Uitleg van de quotiëntregel voor wiskunde B. Je ziet het stappenplan en drie uitgewerkte voorbeelden, en je kunt daarna zelf oefenen.'

/** Hoofdstuk 2, onderwerp "De quotiëntregel". */
export const QUOTIENTREGEL_OEFENEN = '/oefenen?chapter=h2&topic=h2_quotientregel'

/**
 * f is de functie die je differentieert, g de teller, h de noemer.
 * Twee losse regels, zodat een telefoon ze kan afbreken.
 */
export const QUOTIENTREGEL_FORMULE = [
  'f(x) = \\dfrac{g(x)}{h(x)}',
  "f'(x) = \\dfrac{g'(x) \\cdot h(x) - g(x) \\cdot h'(x)}{\\bigl(h(x)\\bigr)^2}",
] as const

export type QuotientregelStap = {
  n: 0 | 1 | 2 | 3
  tekst: string
}

export const QUOTIENTREGEL_STAPPEN: QuotientregelStap[] = [
  {
    n: 0,
    tekst:
      'Kijk of de ene functie door de andere gedeeld wordt. Staat er een breukstreep, met $x$ in de teller en in de noemer? Dan is het de quotiëntregel. De noemer mag niet nul zijn.',
  },
  {
    n: 1,
    tekst:
      'Noem de hele functie $f$, de teller $g$ en de noemer $h$. Schrijf $f(x) = \\dfrac{g(x)}{h(x)}$. De teller is altijd $g$, de noemer altijd $h$.',
  },
  {
    n: 2,
    tekst:
      "Bereken $g'(x)$ en $h'(x)$. Elke kant apart, met de machtsregel of de somregel.",
  },
  {
    n: 3,
    tekst:
      "Zet ze in de formule: $f'(x) = \\dfrac{g'(x) \\cdot h(x) - g(x) \\cdot h'(x)}{\\bigl(h(x)\\bigr)^2}$. In de teller staat een min. De noemer laat je staan als het kwadraat van $h$. Werk dat uit tot een net antwoord.",
  },
]

export type QuotientregelVoorbeeld = {
  opgave: string
  stappen: string[]
  antwoord: string
}

/**
 * Eigen voorbeelden, nagerekend op 13 oktober 2026.
 * Niet dezelfde sommen als op de overzichtskaart of in de oefenstof.
 *
 * 1. $(3x+1)/(x-2)$. Schrijf $3x+1 = 3(x-2)+7$, dus $f(x) = 3 + 7(x-2)^{-1}$.
 *    Afgeleide $-7(x-2)^{-2}$. Bij $x=0$ is dat $-7/4$.
 * 2. $(x^2+4)/(2x+1)$. Delen geeft $\tfrac12 x - \tfrac14 + \tfrac{17/4}{2x+1}$.
 *    Afgeleide $\tfrac12 - \tfrac{17/2}{(2x+1)^2} = \dfrac{2(x^2+x-4)}{(2x+1)^2}$.
 *    Bij $x=0$ is dat $-8$.
 * 3. $(x+5)/(x^2+1)$. Teller van de afgeleide: $(x^2+1)-(x+5)\cdot 2x = 1-10x-x^2$.
 *    Bij $x=0$ is de afgeleide $1$. Bij $x=1$ is die $-10/4 = -2{,}5$.
 */
export const QUOTIENTREGEL_VOORBEELDEN: QuotientregelVoorbeeld[] = [
  {
    opgave: 'f(x) = \\dfrac{3x+1}{x-2}',
    stappen: [
      'Stap 0. Er staat een breuk: teller $3x+1$, noemer $x-2$. Dat is de quotiëntregel. De noemer mag niet nul zijn, dus $x \\neq 2$.',
      'Stap 1. $g(x) = 3x+1$ en $h(x) = x-2$.',
      "Stap 2. $g'(x) = 3$ en $h'(x) = 1$.",
      "Stap 3. $f'(x) = \\dfrac{3(x-2) - (3x+1) \\cdot 1}{(x-2)^2} = \\dfrac{3x-6-3x-1}{(x-2)^2} = \\dfrac{-7}{(x-2)^2}$.",
    ],
    antwoord: "f'(x) = \\dfrac{-7}{(x-2)^2}",
  },
  {
    opgave: 'f(x) = \\dfrac{x^2+4}{2x+1}',
    stappen: [
      'Stap 0. Er staat een breuk: teller $x^2+4$, noemer $2x+1$. Dat is de quotiëntregel. De noemer mag niet nul zijn, dus $x \\neq -\\tfrac{1}{2}$.',
      'Stap 1. $g(x) = x^2+4$ en $h(x) = 2x+1$.',
      "Stap 2. $g'(x) = 2x$ en $h'(x) = 2$.",
      "Stap 3. $f'(x) = \\dfrac{2x(2x+1) - (x^2+4) \\cdot 2}{(2x+1)^2} = \\dfrac{4x^2+2x-2x^2-8}{(2x+1)^2} = \\dfrac{2(x^2+x-4)}{(2x+1)^2}$.",
    ],
    antwoord: "f'(x) = \\dfrac{2(x^2+x-4)}{(2x+1)^2}",
  },
  {
    opgave: 'f(x) = \\dfrac{x+5}{x^2+1}',
    stappen: [
      'Stap 0. Er staat een breuk: teller $x+5$, noemer $x^2+1$. Dat is de quotiëntregel. $x^2+1$ is altijd minstens $1$, dus de noemer is nooit nul.',
      'Stap 1. $g(x) = x+5$ en $h(x) = x^2+1$.',
      "Stap 2. $g'(x) = 1$ en $h'(x) = 2x$.",
      "Stap 3. $f'(x) = \\dfrac{(x^2+1) - (x+5) \\cdot 2x}{(x^2+1)^2} = \\dfrac{x^2+1-2x^2-10x}{(x^2+1)^2} = \\dfrac{1-10x-x^2}{(x^2+1)^2}$.",
    ],
    antwoord: "f'(x) = \\dfrac{1-10x-x^2}{(x^2+1)^2}",
  },
]
