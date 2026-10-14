/**
 * Eigen uitlegpagina voor de raaklijn: `/theorie/raaklijn`.
 *
 * De overzichtskaart op `/theorie` staat in hoofdstuk 15 (anker `kaart-h15-raaklijn`).
 * Deze pagina is het adres dat de raaklijn bij naam noemt.
 */

export const RAAKLIJN_PAD = '/theorie/raaklijn'

export const RAAKLIJN_TITEL = 'Raaklijn oefenen'

export const RAAKLIJN_OMSCHRIJVING =
  'Uitleg van de raaklijn voor wiskunde B. Je ziet het stappenplan en drie uitgewerkte voorbeelden, en je kunt daarna zelf oefenen.'

/**
 * Hoofdstuk 15, onderwerp "Hoeken en rakende grafieken".
 * De examentraining blijft dicht.
 */
export const RAAKLIJN_OEFENEN = '/oefenen?chapter=h15&topic=h15_raakproblemen'

/**
 * f is de functie, a de x van het raakpunt.
 * Twee losse regels, zodat een telefoon ze kan afbreken.
 */
export const RAAKLIJN_FORMULE = [
  "\\text{helling in } x = a \\text{ is } f'(a)",
  "y = f(a) + f'(a)\\,(x - a)",
] as const

export type RaaklijnStap = {
  n: 0 | 1 | 2 | 3
  tekst: string
}

export const RAAKLIJN_STAPPEN: RaaklijnStap[] = [
  {
    n: 0,
    tekst:
      'Je zoekt de raaklijn in één punt van de grafiek. Die lijn raakt de grafiek daar en heeft dezelfde helling als de grafiek.',
  },
  {
    n: 1,
    tekst:
      'Noem de $x$ van het raakpunt $a$. Reken $f(a)$ uit, dat is de $y$ van het punt. Bepaal ook $f\'(x)$.',
  },
  {
    n: 2,
    tekst: "Reken de helling uit: vul $a$ in de afgeleide in. Die helling is $f'(a)$.",
  },
  {
    n: 3,
    tekst:
      "Schrijf de lijn: $y = f(a) + f'(a)\\,(x - a)$. Werk de haakjes uit tot een vorm $y = px + q$.",
  },
]

export type RaaklijnVoorbeeld = {
  opgave: string
  stappen: string[]
  antwoord: string
}

/**
 * Eigen voorbeelden, nagerekend op 14 oktober 2026.
 * Niet dezelfde sommen als op de overzichtskaart ($x^2$ in $x = 3$ en $x^3$ in $x = 1$).
 *
 * 1. $f(x) = x^2 + 3x$ in $x = 1$. $f(1) = 4$, $f'(x) = 2x + 3$, $f'(1) = 5$.
 *    $y = 4 + 5(x - 1) = 5x - 1$.
 * 2. $f(x) = x^3 - 4x$ in $x = 2$. $f(2) = 0$, $f'(x) = 3x^2 - 4$, $f'(2) = 8$.
 *    $y = 8(x - 2) = 8x - 16$.
 * 3. $f(x) = 2x^2 - x + 1$ in $x = 0$. $f(0) = 1$, $f'(x) = 4x - 1$, $f'(0) = -1$.
 *    $y = 1 - x$.
 */
export const RAAKLIJN_VOORBEELDEN: RaaklijnVoorbeeld[] = [
  {
    opgave: 'f(x) = x^2 + 3x \\text{ in } x = 1',
    stappen: [
      'Stap 0. Je zoekt de raaklijn aan de grafiek van $f$ in het punt met $x = 1$.',
      "Stap 1. $f(1) = 1 + 3 = 4$. En $f'(x) = 2x + 3$.",
      "Stap 2. De helling is $f'(1) = 2 + 3 = 5$.",
      'Stap 3. $y = 4 + 5(x - 1) = 4 + 5x - 5 = 5x - 1$.',
    ],
    antwoord: 'y = 5x - 1',
  },
  {
    opgave: 'f(x) = x^3 - 4x \\text{ in } x = 2',
    stappen: [
      'Stap 0. Je zoekt de raaklijn aan de grafiek van $f$ in het punt met $x = 2$.',
      "Stap 1. $f(2) = 8 - 8 = 0$. En $f'(x) = 3x^2 - 4$.",
      "Stap 2. De helling is $f'(2) = 12 - 4 = 8$.",
      'Stap 3. $y = 0 + 8(x - 2) = 8x - 16$.',
    ],
    antwoord: 'y = 8x - 16',
  },
  {
    opgave: 'f(x) = 2x^2 - x + 1 \\text{ in } x = 0',
    stappen: [
      'Stap 0. Je zoekt de raaklijn aan de grafiek van $f$ in het punt met $x = 0$.',
      "Stap 1. $f(0) = 1$. En $f'(x) = 4x - 1$.",
      "Stap 2. De helling is $f'(0) = -1$.",
      'Stap 3. $y = 1 + (-1)(x - 0) = 1 - x$.',
    ],
    antwoord: 'y = 1 - x',
  },
]
