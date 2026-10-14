/**
 * Eigen uitlegpagina voor de machtsregel: `/theorie/machtsregel`.
 *
 * De overzichtskaart op `/theorie` blijft staan (anker `kaart-h2-machtsregel`).
 * Deze pagina is het adres dat de regel bij naam noemt.
 */

export const MACHTSREGEL_PAD = '/theorie/machtsregel'

export const MACHTSREGEL_TITEL = 'Machtsregel oefenen'

export const MACHTSREGEL_OMSCHRIJVING =
  'Uitleg van de machtsregel voor wiskunde B. Je ziet het stappenplan en drie uitgewerkte voorbeelden, en je kunt daarna zelf oefenen.'

/** Hoofdstuk 2, onderwerp "Termsgewijs differentiëren". Daar oefen je de machtsregel op polynomen. */
export const MACHTSREGEL_OEFENEN = '/oefenen?chapter=h2&topic=h2_termsgewijs'

/**
 * f is de functie, a het getal ervoor, n de macht.
 * Twee losse regels, zodat een telefoon ze kan afbreken.
 */
export const MACHTSREGEL_FORMULE = [
  'f(x) = ax^n',
  "f'(x) = n \\cdot a \\, x^{n-1}",
] as const

export type MachtsregelStap = {
  n: 0 | 1 | 2 | 3
  tekst: string
}

export const MACHTSREGEL_STAPPEN: MachtsregelStap[] = [
  {
    n: 0,
    tekst:
      'Kijk of de functie één macht van $x$ is, eventueel met een getal ervoor. Dan is het de machtsregel. Een los getal, zonder $x$, heeft afgeleide $0$.',
  },
  {
    n: 1,
    tekst:
      'Noem de functie $f$. Schrijf haar als $f(x) = ax^n$. Het getal voor de $x$ is $a$. De macht is $n$.',
  },
  {
    n: 2,
    tekst:
      'Haal de macht naar voren en vermenigvuldig met $a$. De nieuwe macht is $n - 1$, dus één lager.',
  },
  {
    n: 3,
    tekst:
      "Schrijf het antwoord: $f'(x) = n \\cdot a \\, x^{n-1}$. Werk de getallen uit tot één net antwoord.",
  },
]

export type MachtsregelVoorbeeld = {
  opgave: string
  stappen: string[]
  antwoord: string
}

/**
 * Eigen voorbeelden, nagerekend op 14 oktober 2026.
 * Niet dezelfde sommen als op de overzichtskaart ($3x^4$ en de constante $7$).
 *
 * 1. $5x^3$. $n = 3$, $a = 5$. Afgeleide $3 \\cdot 5 \\, x^2 = 15x^2$. Bij $x = 2$ is dat $60$.
 * 2. $-4x^6$. $n = 6$, $a = -4$. Afgeleide $6 \\cdot -4 \\, x^5 = -24x^5$. Bij $x = 1$ is dat $-24$.
 * 3. $\\tfrac{1}{2}x^8$. $n = 8$, $a = \\tfrac{1}{2}$. Afgeleide $8 \\cdot \\tfrac{1}{2} \\, x^7 = 4x^7$. Bij $x = 1$ is dat $4$.
 */
export const MACHTSREGEL_VOORBEELDEN: MachtsregelVoorbeeld[] = [
  {
    opgave: 'f(x) = 5x^3',
    stappen: [
      'Stap 0. Er staat één macht van $x$, met een getal ervoor. Dat is de machtsregel.',
      'Stap 1. $a = 5$ en $n = 3$, dus $f(x) = 5x^3$.',
      'Stap 2. De macht $3$ komt naar voren. De nieuwe macht is $3 - 1 = 2$.',
      "Stap 3. $f'(x) = 3 \\cdot 5 \\, x^2 = 15x^2$.",
    ],
    antwoord: "f'(x) = 15x^2",
  },
  {
    opgave: 'f(x) = -4x^6',
    stappen: [
      'Stap 0. Er staat één macht van $x$, met een negatief getal ervoor. Dat is de machtsregel.',
      'Stap 1. $a = -4$ en $n = 6$, dus $f(x) = -4x^6$.',
      'Stap 2. De macht $6$ komt naar voren. De nieuwe macht is $6 - 1 = 5$. Het minteken blijft staan.',
      "Stap 3. $f'(x) = 6 \\cdot (-4) \\, x^5 = -24x^5$.",
    ],
    antwoord: "f'(x) = -24x^5",
  },
  {
    opgave: 'f(x) = \\dfrac{1}{2}x^8',
    stappen: [
      'Stap 0. Er staat één macht van $x$, met een breuk ervoor. Dat is de machtsregel.',
      'Stap 1. $a = \\dfrac{1}{2}$ en $n = 8$.',
      'Stap 2. De macht $8$ komt naar voren. De nieuwe macht is $8 - 1 = 7$.',
      "Stap 3. $f'(x) = 8 \\cdot \\dfrac{1}{2} \\, x^7 = 4x^7$.",
    ],
    antwoord: "f'(x) = 4x^7",
  },
]
