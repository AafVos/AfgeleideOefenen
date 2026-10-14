/**
 * Eigen uitlegpagina voor de productregel: `/theorie/productregel`.
 *
 * De overzichtskaart op `/theorie` blijft staan (anker `kaart-h2-productregel`).
 * Deze pagina is het adres dat de regel bij naam noemt.
 */

export const PRODUCTREGEL_PAD = '/theorie/productregel'

export const PRODUCTREGEL_TITEL = 'Productregel oefenen'

export const PRODUCTREGEL_OMSCHRIJVING =
  'Uitleg van de productregel voor wiskunde B. Je ziet het stappenplan en drie uitgewerkte voorbeelden, en je kunt daarna zelf oefenen.'

/** Hoofdstuk 2, onderwerp "De productregel". */
export const PRODUCTREGEL_OEFENEN = '/oefenen?chapter=h2&topic=h2_productregel'

/**
 * f is de functie die je differentieert, g de eerste factor, h de tweede.
 * Twee losse regels, zodat een telefoon ze kan afbreken.
 */
export const PRODUCTREGEL_FORMULE = [
  'f(x) = g(x) \\cdot h(x)',
  "f'(x) = g'(x) \\cdot h(x) + g(x) \\cdot h'(x)",
] as const

export type ProductregelStap = {
  n: 0 | 1 | 2 | 3
  tekst: string
}

export const PRODUCTREGEL_STAPPEN: ProductregelStap[] = [
  {
    n: 0,
    tekst:
      'Kijk of twee functies met elkaar vermenigvuldigd worden. Staan er twee delen met $x$ naast elkaar, zonder plus of min ertussen? Dan is het de productregel.',
  },
  {
    n: 1,
    tekst:
      'Noem de hele functie $f$, de eerste factor $g$ en de tweede factor $h$. Schrijf $f(x) = g(x) \\cdot h(x)$.',
  },
  {
    n: 2,
    tekst:
      "Bereken $g'(x)$ en $h'(x)$. Elke factor apart, met de machtsregel of de somregel.",
  },
  {
    n: 3,
    tekst:
      "Tel de twee producten op: $f'(x) = g'(x) \\cdot h(x) + g(x) \\cdot h'(x)$. Werk dat uit tot een net antwoord.",
  },
]

export type ProductregelVoorbeeld = {
  opgave: string
  stappen: string[]
  antwoord: string
}

/**
 * Eigen voorbeelden, nagerekend op 13 oktober 2026.
 * Niet dezelfde sommen als op de overzichtskaart.
 *
 * 1. $(3x+2)(x-4)$. Uitwerken geeft $3x^2-10x-8$, afgeleide $6x-10$.
 *    Via de productregel: $3(x-4)+(3x+2)=6x-10$. Bij $x=2$ is dat $2$.
 * 2. $(x^2+3)(2x-1)$. Uitwerken geeft $2x^3-x^2+6x-3$, afgeleide $6x^2-2x+6$.
 *    Bij $x=1$ is dat $10$.
 * 3. $(x-1)(x^2+x+1)$. Dat is $x^3-1$, afgeleide $3x^2$.
 *    Via de productregel: $(x^2+x+1)+(x-1)(2x+1)=3x^2$.
 */
export const PRODUCTREGEL_VOORBEELDEN: ProductregelVoorbeeld[] = [
  {
    opgave: 'f(x) = (3x+2)(x-4)',
    stappen: [
      'Stap 0. Er staan twee factoren naast elkaar: $3x+2$ en $x-4$. Dat is de productregel.',
      'Stap 1. $g(x) = 3x+2$ en $h(x) = x-4$.',
      "Stap 2. $g'(x) = 3$ en $h'(x) = 1$.",
      "Stap 3. $f'(x) = 3(x-4) + (3x+2) \\cdot 1 = 3x-12+3x+2 = 6x-10$.",
    ],
    antwoord: "f'(x) = 6x-10",
  },
  {
    opgave: 'f(x) = (x^2+3)(2x-1)',
    stappen: [
      'Stap 0. Er staan twee factoren naast elkaar: $x^2+3$ en $2x-1$. Dat is de productregel.',
      'Stap 1. $g(x) = x^2+3$ en $h(x) = 2x-1$.',
      "Stap 2. $g'(x) = 2x$ en $h'(x) = 2$.",
      "Stap 3. $f'(x) = 2x(2x-1) + (x^2+3) \\cdot 2 = 4x^2-2x+2x^2+6 = 6x^2-2x+6$.",
    ],
    antwoord: "f'(x) = 6x^2-2x+6",
  },
  {
    opgave: 'f(x) = (x-1)(x^2+x+1)',
    stappen: [
      'Stap 0. Er staan twee factoren naast elkaar: $x-1$ en $x^2+x+1$. Dat is de productregel.',
      'Stap 1. $g(x) = x-1$ en $h(x) = x^2+x+1$.',
      "Stap 2. $g'(x) = 1$ en $h'(x) = 2x+1$.",
      "Stap 3. $f'(x) = (x^2+x+1) + (x-1)(2x+1)$. Eerst $(x-1)(2x+1) = 2x^2-x-1$. Dan $x^2+x+1+2x^2-x-1 = 3x^2$.",
    ],
    antwoord: "f'(x) = 3x^2",
  },
]
