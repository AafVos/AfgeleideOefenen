/**
 * Theorie-content voor afgeleideoefenen.nl: de formules en voorbeelden die op
 * de overzichtspagina /theorie staan (`app/[locale]/theorie/page.tsx`) en in
 * het theoriemenu in de kop van de site.
 */

// =============================================================================
// THEORY_OVERVIEW — gegroepeerd per hoofdstuk, getoond bovenaan de theorie-pagina
// =============================================================================

export type OverviewExample = { problem: string; answer: string; steps?: string[] }

export type OverviewTable = {
  headers: string[]
  rows: string[][] // cellen mogen `$...$` bevatten voor LaTeX
}

export type OverviewCard = {
  id: string
  title: string
  /**
   * Hoofdformule (LaTeX). Hoort er meer dan één regel bij, zet ze dan als
   * losse strings in een lijst in plaats van in één `\begin{gathered}`: een
   * losse regel kan op een telefoon wél afbreken, een gathered-blok niet.
   */
  formula?: string | string[]
  examples?: OverviewExample[] // problem → answer
  table?: OverviewTable
  notes?: string[] // kleine bullets onderaan; mogen `$...$` bevatten
}

export type OverviewChapter = {
  slug: string
  title: string
  cards: OverviewCard[]
}

export const THEORY_OVERVIEW: OverviewChapter[] = [
  {
    slug: 'h2',
    title: 'H2 — De afgeleide functie',
    cards: [
      {
        id: 'machtsregel',
        title: 'Machtsregel',
        formula: "f(x) = ax^n \\implies f'(x) = n \\cdot ax^{n-1}",
        examples: [
          { problem: 'f(x) = 3x^4', answer: "f'(x) = 12x^3", steps: ['$n = 4$, $a = 3$', "$f'(x) = 4 \\cdot 3 \\cdot x^{4-1} = 12x^3$"] },
          { problem: 'f(x) = 7', answer: "f'(x) = 0", steps: ['Constante: $n = 0$', "$f'(x) = 0$"] },
        ],
      },
      {
        id: 'somregel',
        title: 'Somregel',
        formula: "f(x) = g(x) + h(x) \\implies f'(x) = g'(x) + h'(x)",
        examples: [
          {
            problem: 'f(x) = x^3 + 5x^2',
            answer: "f'(x) = 3x^2 + 10x",
            steps: [
              'Differentieer elke term apart: $(x^3)\' = 3x^2$ en $(5x^2)\' = 10x$',
              "Tel op: $f'(x) = 3x^2 + 10x$",
            ],
          },
        ],
      },
      {
        id: 'productregel',
        title: 'Productregel',
        formula:
          "f(x) = g(x) \\cdot h(x) \\implies f'(x) = g'(x)h(x) + g(x)h'(x)",
        examples: [
          {
            problem: 'f(x) = (x^2-4)(x^3+2x)',
            answer: "f'(x) = 2x(x^3+2x) + (x^2-4)(3x^2+2)",
            steps: ["$g = x^2-4,\\ g' = 2x$", "$h = x^3+2x,\\ h' = 3x^2+2$", "$f'(x) = 2x(x^3+2x) + (x^2-4)(3x^2+2)$"],
          },
        ],
      },
      {
        id: 'quotientregel',
        title: 'Quotiëntregel',
        formula:
          "f(x) = \\dfrac{g(x)}{h(x)} \\implies f'(x) = \\dfrac{g'(x)h(x) - g(x)h'(x)}{\\bigl(h(x)\\bigr)^2}",
        examples: [
          {
            problem: 'f(x) = \\dfrac{x-2}{x+5}',
            answer: "f'(x) = \\dfrac{7}{(x+5)^2}",
            steps: ["$g = x-2,\\ g' = 1$", "$h = x+5,\\ h' = 1$", "$f'(x) = \\dfrac{1\\cdot(x+5)-(x-2)\\cdot 1}{(x+5)^2} = \\dfrac{7}{(x+5)^2}$"],
          },
        ],
      },
    ],
  },
  {
    slug: 'h6',
    title: 'H6 — Differentiaalrekening',
    cards: [
      {
        id: 'machten_herschrijven',
        title: 'Machtsfuncties herschrijven',
        formula: "f(x) = \\dfrac{1}{x^n} = x^{-n} \\implies f'(x) = -nx^{-n-1}",
        examples: [
          { problem: 'f(x) = \\sqrt{x} = x^{1/2}', answer: "f'(x) = \\tfrac{1}{2}x^{-1/2}", steps: ["Herschrijf: $f(x) = x^{1/2}$", "$n = \\tfrac{1}{2}$: $f'(x) = \\tfrac{1}{2}x^{\\frac{1}{2}-1} = \\tfrac{1}{2}x^{-1/2}$"] },
          { problem: 'f(x) = \\sqrt[n]{x} = x^{1/n}', answer: "f'(x) = \\tfrac{1}{n}x^{\\tfrac{1}{n}-1}" },
        ],
      },
      {
        id: 'kettingregel',
        title: 'De kettingregel',
        formula: "f\\bigl(g(x)\\bigr)' = f'\\bigl(g(x)\\bigr) \\cdot g'(x)",
        examples: [
          { problem: '(4x+3)^3', answer: "12(4x+3)^2" },
          { problem: '(x^2+1)^3', answer: "6x(x^2+1)^2" },
          { problem: '\\sqrt{3x+1}', answer: "\\dfrac{3}{2\\sqrt{3x+1}}" },
          { problem: '\\sqrt{x^2+1}', answer: "\\dfrac{x}{\\sqrt{x^2+1}}" },
        ],
      },
    ],
  },
  {
    slug: 'h7',
    title: 'H7 — Goniometrische functies',
    cards: [
      {
        id: 'gonio_basis',
        title: 'Basisformules goniometrie',
        formula: [
          "f(x) = \\sin(x) \\implies f'(x) = \\cos(x)",
          "f(x) = \\cos(x) \\implies f'(x) = -\\sin(x)",
          "f(x) = \\tan(x) \\implies f'(x) = \\dfrac{1}{\\cos^2(x)}",
        ],
        examples: [
          {
            problem: 'f(x) = 3\\sin(x) - 2\\cos(x)',
            answer: "f'(x) = 3\\cos(x) + 2\\sin(x)",
            steps: [
              "$(3\\sin(x))' = 3\\cos(x)$",
              "$(-2\\cos(x))' = -2 \\cdot -\\sin(x) = 2\\sin(x)$",
              "$f'(x) = 3\\cos(x) + 2\\sin(x)$",
            ],
          },
        ],
      },
      {
        id: 'gonio_kettingregel',
        title: 'Kettingregel met goniometrie',
        formula: [
          "f(x) = \\cos\\bigl(g(x)\\bigr) \\implies f'(x) = -g'(x) \\cdot \\sin\\bigl(g(x)\\bigr)",
          "f(x) = \\sin\\bigl(g(x)\\bigr) \\implies f'(x) = g'(x) \\cdot \\cos\\bigl(g(x)\\bigr)",
        ],
        examples: [
          {
            problem: 'f(x) = \\sin(3x^2)',
            answer: "f'(x) = 6x\\cos(3x^2)",
            steps: [
              "Binnenste functie: $g(x) = 3x^2$, dus $g'(x) = 6x$",
              "$f'(x) = g'(x) \\cdot \\cos\\bigl(g(x)\\bigr) = 6x\\cos(3x^2)$",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'h9',
    title: 'H9 — Exponentiële en logaritmische functies',
    cards: [
      {
        id: 'e_machten',
        title: 'E-machten',
        formula: [
          "f(x) = e^x \\implies f'(x) = e^x",
          "f(x) = g^x \\implies f'(x) = g^x \\cdot \\ln(g)",
        ],
        examples: [
          { problem: 'f(x) = e^{g(x)}', answer: "f'(x) = g'(x) \\cdot e^{g(x)}", steps: ['Kettingregel: buitenste $e^{\\ldots}$ blijft staan', "Vermenigvuldig met de afgeleide van de exponent: $g'(x)$"] },
          { problem: 'f(x) = e^{2x+3}', answer: "f'(x) = 2e^{2x+3}", steps: ["$g(x) = 2x+3,\\ g'(x) = 2$", "$f'(x) = 2 \\cdot e^{2x+3}$"] },
          { problem: 'f(x) = 3^x', answer: "f'(x) = 3^x \\cdot \\ln(3)" },
        ],
      },
      {
        id: 'logaritmes',
        title: 'Logaritmes',
        formula: "f(x) = \\ln(x) \\implies f'(x) = \\dfrac{1}{x}",
        examples: [
          { problem: 'f(x) = \\ln(g(x))', answer: "f'(x) = \\dfrac{g'(x)}{g(x)}", steps: ['Kettingregel: afgeleide van wat erin staat gedeeld door wat erin staat', "$f'(x) = \\dfrac{g'(x)}{g(x)}$"] },
          { problem: 'f(x) = {}^g\\!\\log(x)', answer: "f'(x) = \\dfrac{1}{x \\cdot \\ln(g)}" },
          { problem: 'f(x) = \\ln(x^2+1)', answer: "f'(x) = \\dfrac{2x}{x^2+1}", steps: ["$g(x) = x^2+1,\\ g'(x) = 2x$", "$f'(x) = \\dfrac{2x}{x^2+1}$"] },
          { problem: 'f(x) = {}^2\\!\\log(x)', answer: "f'(x) = \\dfrac{1}{x\\ln(2)}" },
        ],
      },
    ],
  },
]
