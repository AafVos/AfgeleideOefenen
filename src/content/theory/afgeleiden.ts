/**
 * Theorie-content voor afgeleideoefenen.nl: de formules en voorbeelden die op
 * de overzichtspagina /theorie staan (`app/[locale]/(paginas)/theorie/page.tsx`) en in
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
  /** Eigen uitlegpagina, bijvoorbeeld `/theorie/kettingregel`. */
  uitlegPad?: string
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
        uitlegPad: '/theorie/machtsregel',
        formula: ['f(x) = ax^n', "f'(x) = n \\cdot a \\, x^{n-1}"],
        examples: [
          { problem: 'f(x) = 3x^4', answer: "f'(x) = 12x^3", steps: ['$n = 4$, $a = 3$', "$f'(x) = 4 \\cdot 3 \\cdot x^{4-1} = 12x^3$"] },
          { problem: 'f(x) = 7', answer: "f'(x) = 0", steps: ['Constante: $n = 0$', "$f'(x) = 0$"] },
        ],
      },
      {
        id: 'somregel',
        title: 'Somregel',
        uitlegPad: '/theorie/somregel',
        formula: ['f(x) = g(x) + h(x)', "f'(x) = g'(x) + h'(x)"],
        examples: [
          {
            problem: 'f(x) = x^3 + 5x^2',
            answer: "f'(x) = 3x^2 + 10x",
            steps: [
              'Differentieer elke term apart: $(x^3)\' = 3x^2$ en $(5x^2)\' = 10x$',
              "Tel op: $f'(x) = 3x^2 + 10x$",
            ],
          },
          {
            problem: 'f(x) = 4x^2 - 6x',
            answer: "f'(x) = 8x - 6",
            steps: ['$(4x^2)\' = 8x$', '$(-6x)\' = -6$', "Tel op: $f'(x) = 8x - 6$"],
          },
        ],
      },
      {
        id: 'productregel',
        title: 'De productregel',
        uitlegPad: '/theorie/productregel',
        // Zelfde letters als de uitlegpagina: f de hele functie, g de eerste factor, h de tweede.
        formula: [
          'f(x) = g(x) \\cdot h(x)',
          "f'(x) = g'(x) \\cdot h(x) + g(x) \\cdot h'(x)",
        ],
        examples: [
          {
            problem: 'f(x) = (x^2-4)(x^3+2x)',
            answer: "f'(x) = 2x(x^3+2x) + (x^2-4)(3x^2+2)",
            steps: ["$g = x^2-4,\\ g' = 2x$", "$h = x^3+2x,\\ h' = 3x^2+2$", "$f'(x) = 2x(x^3+2x) + (x^2-4)(3x^2+2)$"],
          },
          {
            problem: 'f(x) = (2x+1)(x-3)',
            answer: "f'(x) = 4x - 5",
            steps: ["$g = 2x+1,\\ g' = 2$", "$h = x-3,\\ h' = 1$", "$f'(x) = 2(x-3) + (2x+1)\\cdot 1 = 4x - 5$"],
          },
        ],
      },
      {
        id: 'quotientregel',
        title: 'De quotiëntregel',
        uitlegPad: '/theorie/quotientregel',
        // Zelfde letters als de uitlegpagina: f de hele functie, g de teller, h de noemer.
        // Het id blijft `quotientregel`, zodat het anker `kaart-h2-quotientregel` blijft.
        formula: [
          'f(x) = \\dfrac{g(x)}{h(x)}',
          "f'(x) = \\dfrac{g'(x) \\cdot h(x) - g(x) \\cdot h'(x)}{\\bigl(h(x)\\bigr)^2}",
        ],
        examples: [
          {
            problem: 'f(x) = \\dfrac{x-2}{x+5}',
            answer: "f'(x) = \\dfrac{7}{(x+5)^2}",
            steps: ["$g = x-2,\\ g' = 1$", "$h = x+5,\\ h' = 1$", "$f'(x) = \\dfrac{1\\cdot(x+5)-(x-2)\\cdot 1}{(x+5)^2} = \\dfrac{7}{(x+5)^2}$"],
          },
          {
            problem: 'f(x) = \\dfrac{2x}{x+1}',
            answer: "f'(x) = \\dfrac{2}{(x+1)^2}",
            steps: ["$g = 2x,\\ g' = 2$", "$h = x+1,\\ h' = 1$", "$f'(x) = \\dfrac{2(x+1)-2x\\cdot 1}{(x+1)^2} = \\dfrac{2}{(x+1)^2}$"],
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
          { problem: 'f(x) = \\sqrt[n]{x} = x^{1/n}', answer: "f'(x) = \\tfrac{1}{n}x^{\\tfrac{1}{n}-1}", steps: ["Herschrijf: $f(x) = x^{1/n}$", "$f'(x) = \\tfrac{1}{n}x^{\\tfrac{1}{n}-1}$"] },
        ],
      },
      {
        id: 'kettingregel',
        title: 'De kettingregel',
        uitlegPad: '/theorie/kettingregel',
        // Zelfde letters als de uitlegpagina: f de hele functie, g buiten, h binnen.
        formula: [
          'f(x) = g\\bigl(h(x)\\bigr)',
          "f'(x) = g'\\bigl(h(x)\\bigr) \\cdot h'(x)",
        ],
        examples: [
          { problem: 'f(x) = (4x+3)^3', answer: "f'(x) = 12(4x+3)^2", steps: ['Binnenste: $h(x) = 4x+3$, dus $h\'(x) = 4$', 'Buitenste macht 3: $3(4x+3)^2 \\cdot 4 = 12(4x+3)^2$'] },
          { problem: 'f(x) = (x^2+1)^3', answer: "f'(x) = 6x(x^2+1)^2", steps: ['Binnenste: $h(x) = x^2+1$, dus $h\'(x) = 2x$', "$f'(x) = 3(x^2+1)^2 \\cdot 2x = 6x(x^2+1)^2$"] },
          { problem: 'f(x) = \\sqrt{3x+1}', answer: "f'(x) = \\dfrac{3}{2\\sqrt{3x+1}}", steps: ['Herschrijf: $(3x+1)^{1/2}$, dus $h(x) = 3x+1$ en $h\'(x) = 3$', "Afgeleide: $\\tfrac{1}{2}(3x+1)^{-1/2} \\cdot 3 = \\dfrac{3}{2\\sqrt{3x+1}}$"] },
          {
            problem: 'f(x) = \\sqrt{x^2+1}',
            answer: "f'(x) = \\dfrac{x}{\\sqrt{x^2+1}}",
            steps: ['Herschrijf: $(x^2+1)^{1/2}$, dus $h(x) = x^2+1$ en $h\'(x) = 2x$', "Afgeleide: $\\tfrac{1}{2}(x^2+1)^{-1/2} \\cdot 2x = \\dfrac{x}{\\sqrt{x^2+1}}$"],
          },
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
          {
            problem: 'f(x) = \\sin(x) + 4\\cos(x)',
            answer: "f'(x) = \\cos(x) - 4\\sin(x)",
            steps: ['$(\\sin(x))\' = \\cos(x)$', '$(4\\cos(x))\' = -4\\sin(x)$', "$f'(x) = \\cos(x) - 4\\sin(x)$"],
          },
        ],
      },
      {
        id: 'gonio_kettingregel',
        title: 'Kettingregel met goniometrie',
        // Zelfde letters als de kettingregel: f de hele functie, h de binnenste.
        formula: [
          "f(x) = \\cos\\bigl(h(x)\\bigr) \\implies f'(x) = -h'(x) \\cdot \\sin\\bigl(h(x)\\bigr)",
          "f(x) = \\sin\\bigl(h(x)\\bigr) \\implies f'(x) = h'(x) \\cdot \\cos\\bigl(h(x)\\bigr)",
        ],
        examples: [
          {
            problem: 'f(x) = \\sin(3x^2)',
            answer: "f'(x) = 6x\\cos(3x^2)",
            steps: [
              "Binnenste functie: $h(x) = 3x^2$, dus $h'(x) = 6x$",
              "$f'(x) = h'(x) \\cdot \\cos\\bigl(h(x)\\bigr) = 6x\\cos(3x^2)$",
            ],
          },
          {
            problem: 'f(x) = \\cos(2x)',
            answer: "f'(x) = -2\\sin(2x)",
            steps: ['Binnenste: $h(x) = 2x$, dus $h\'(x) = 2$', "$f'(x) = -h'(x)\\sin(2x) = -2\\sin(2x)$"],
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
          "f(x) = a^x \\implies f'(x) = a^x \\cdot \\ln(a)",
        ],
        examples: [
          { problem: 'f(x) = e^{h(x)}', answer: "f'(x) = h'(x) \\cdot e^{h(x)}", steps: ['Kettingregel: buitenste $e^{\\ldots}$ blijft staan', "Vermenigvuldig met de afgeleide van de exponent: $h'(x)$"] },
          { problem: 'f(x) = e^{2x+3}', answer: "f'(x) = 2e^{2x+3}", steps: ["$h(x) = 2x+3,\\ h'(x) = 2$", "$f'(x) = 2 \\cdot e^{2x+3}$"] },
          { problem: 'f(x) = 3^x', answer: "f'(x) = 3^x \\cdot \\ln(3)", steps: ['$a = 3$', "$f'(x) = 3^x \\cdot \\ln(3)$"] },
        ],
      },
      {
        id: 'logaritmes',
        title: 'Logaritmes',
        formula: "f(x) = \\ln(x) \\implies f'(x) = \\dfrac{1}{x}",
        examples: [
          { problem: 'f(x) = \\ln(h(x))', answer: "f'(x) = \\dfrac{h'(x)}{h(x)}", steps: ['Kettingregel: afgeleide van wat erin staat gedeeld door wat erin staat', "$f'(x) = \\dfrac{h'(x)}{h(x)}$"] },
          { problem: 'f(x) = {}^2\\!\\log(5x)', answer: "f'(x) = \\dfrac{1}{x\\ln(2)}", steps: ['Schrijf ${}^2\\!\\log(5x) = {}^2\\!\\log(5) + {}^2\\!\\log(x)$', 'De constante valt weg. ${}^2\\!\\log(x)$ heeft afgeleide $\\dfrac{1}{x\\ln(2)}$'] },
          { problem: 'f(x) = \\ln(x^2+1)', answer: "f'(x) = \\dfrac{2x}{x^2+1}", steps: ["$h(x) = x^2+1,\\ h'(x) = 2x$", "$f'(x) = \\dfrac{2x}{x^2+1}$"] },
          { problem: 'f(x) = {}^2\\!\\log(x)', answer: "f'(x) = \\dfrac{1}{x\\ln(2)}", steps: ['De formule voor ${}^a\\!\\log(x)$ met $a = 2$', "$f'(x) = \\dfrac{1}{x\\ln(2)}$"] },
        ],
      },
    ],
  },
  {
    slug: 'beweging',
    title: 'Beweging',
    cards: [
      {
        id: 'snelheid_vlak',
        title: 'Snelheid in het vlak',
        formula: [
          "x'(t),\\ y'(t)",
          "\\text{snelheid} = \\sqrt{\\left(x'(t)\\right)^2 + \\left(y'(t)\\right)^2}",
        ],
        examples: [
          {
            problem: 'x(t) = 8t,\\ y(t) = 15t',
            answer: '\\text{snelheid } 17',
            steps: [
              "$x'(t) = 8$ en $y'(t) = 15$",
              'De snelheid is $\\sqrt{8^2 + 15^2} = \\sqrt{289} = 17$',
            ],
          },
          {
            problem: 'x(t) = 3t,\\ y(t) = 4t',
            answer: '\\text{snelheid } 5',
            steps: ["$x'(t) = 3$ en $y'(t) = 4$", '$\\sqrt{9 + 16} = \\sqrt{25} = 5$'],
          },
        ],
        notes: [
          'De snelheid is de lengte van de snelheidsvector. Die is nooit negatief.',
        ],
      },
      {
        id: 'versnelling_vlak',
        title: 'Versnelling in het vlak',
        formula: [
          "x''(t),\\ y''(t)",
          "\\text{grootte} = \\sqrt{\\left(x''(t)\\right)^2 + \\left(y''(t)\\right)^2}",
        ],
        examples: [
          {
            problem: 'x(t) = t^2,\\ y(t) = 3t',
            answer: '\\text{grootte versnelling } 2',
            steps: ["$x''(t) = 2$ en $y''(t) = 0$", '$\\sqrt{4 + 0} = 2$'],
          },
          {
            problem: 'x(t) = t^3,\\ y(t) = t^2',
            answer: '2\\sqrt{9t^2 + 1}',
            steps: ["$x''(t) = 6t$ en $y''(t) = 2$", '$\\sqrt{36t^2 + 4} = 2\\sqrt{9t^2 + 1}$'],
          },
        ],
        notes: [
          'Differentieer de plaats twee keer. Daarna neem je weer de lengte.',
        ],
      },
      {
        id: 'kleinste_snelheid',
        title: 'Kleinste snelheid',
        formula: "x'(t)\\,x''(t) + y'(t)\\,y''(t) = 0",
        examples: [
          {
            problem: 'x(t) = t,\\ y(t) = t^3 - 3t,\\ t \\geq 0',
            answer: '\\text{kleinste snelheid } 1 \\text{ op } t = 1',
            steps: [
              "$x' = 1$, $x'' = 0$, $y' = 3t^2 - 3$, $y'' = 6t$",
              'Het inproduct is $18t(t^2 - 1) = 0$, dus $t = 0$ of $t = 1$',
              'Op $t = 1$ is de snelheid $1$. Op $t = 0$ is die $\\sqrt{10}$, groter',
            ],
          },
          {
            problem: 'x(t) = 2t,\\ y(t) = t^2,\\ t \\geq 0',
            answer: '\\text{kleinste snelheid } 2 \\text{ op } t = 0',
            steps: [
              "$x' = 2$, $x'' = 0$, $y' = 2t$, $y'' = 2$",
              'Het inproduct is $4t = 0$, dus $t = 0$',
              'De snelheid is daar $\\sqrt{4 + 0} = 2$',
            ],
          },
        ],
        notes: [
          'Vergelijk de tijdstippen die je vindt. Het inproduct nul geeft een kleinste of een grootste snelheid.',
        ],
      },
      {
        id: 'cirkel',
        title: 'Eenparige cirkelbeweging',
        formula: [
          'x(t) = R\\cos(\\omega t),\\ y(t) = R\\sin(\\omega t)',
          '\\text{snelheid} = R|\\omega|',
          '\\text{versnelling} = R\\omega^2',
        ],
        examples: [
          {
            problem: 'x(t) = 9\\cos(2t),\\ y(t) = 9\\sin(2t)',
            answer: '\\text{snelheid } 18,\\ \\text{versnelling } 36',
            steps: [
              "$x'(t) = -18\\sin(2t)$ en $y'(t) = 18\\cos(2t)$",
              'De lengte is $18$. Nog een keer differentiëren geeft lengte $36$',
            ],
          },
          {
            problem: 'x(t) = 5\\cos(t),\\ y(t) = 5\\sin(t)',
            answer: '\\text{snelheid } 5,\\ \\text{versnelling } 5',
            steps: ['$R = 5$ en $\\omega = 1$', 'Snelheid $R|\\omega| = 5$. Versnelling $R\\omega^2 = 5$'],
          },
        ],
        notes: [
          'De snelheid is constant. De versnelling wijst naar het middelpunt.',
        ],
      },
      {
        id: 'trilling',
        title: 'Grootste snelheid van een trilling',
        formula: [
          'f(t) = A\\sin(\\omega t)',
          "f'(t) = A\\omega\\cos(\\omega t)",
          '\\text{grootste snelheid} = |A\\omega|',
        ],
        examples: [
          {
            problem: 'f(t) = 5\\sin(2t)',
            answer: '\\text{grootste snelheid } 10',
            steps: [
              "$f'(t) = 10\\cos(2t)$",
              'Een cosinus zit tussen $-1$ en $1$, dus de grootste $|f\'(t)|$ is $10$',
            ],
          },
          {
            problem: 'f(t) = 3\\sin(4t)',
            answer: '\\text{grootste snelheid } 12',
            steps: ["$f'(t) = 12\\cos(4t)$", 'De grootste waarde van $|12\\cos(4t)|$ is $12$'],
          },
        ],
      },
      {
        id: 'som_sin_cos',
        title: 'Som van sinus en cosinus',
        formula: [
          'f(t) = A\\cos(\\omega t) + B\\sin(\\omega t)',
          'R = \\sqrt{A^2 + B^2}',
          '\\text{grootste snelheid} = R|\\omega|',
        ],
        examples: [
          {
            problem: 'f(t) = 12\\cos(t) + 16\\sin(t)',
            answer: '\\text{grootste snelheid } 20',
            steps: [
              '$R = \\sqrt{144 + 256} = 20$',
              "$f(t) = 20\\cos(t - \\varphi)$, dus $f'(t)$ wordt hoogstens $20$",
            ],
          },
          {
            problem: 'f(t) = 3\\cos(2t) + 4\\sin(2t)',
            answer: '\\text{grootste snelheid } 10',
            steps: ['$R = \\sqrt{9 + 16} = 5$ en $\\omega = 2$', 'Grootste snelheid $R|\\omega| = 10$'],
          },
        ],
        notes: [
          'Dit is een beweging over een rechte lijn. In het vlak, met een aparte $x(t)$ en $y(t)$, geldt deze formule niet.',
        ],
      },
    ],
  },
  {
    slug: 'h15',
    title: 'H15 — Hellingen, raaklijnen en optimaliseren',
    cards: [
      {
        id: 'raaklijn',
        title: 'De raaklijn',
        uitlegPad: '/theorie/raaklijn',
        formula: [
          "\\text{helling in } x = a \\text{ is } f'(a)",
          "y = f(a) + f'(a)\\,(x - a)",
        ],
        examples: [
          {
            problem: 'f(x) = x^2 \\text{ in } x = 3',
            answer: 'y = 6x - 9',
            steps: [
              "$f(3) = 9$ en $f'(x) = 2x$, dus $f'(3) = 6$",
              '$y = 9 + 6(x - 3) = 6x - 9$',
            ],
          },
          {
            problem: 'f(x) = x^3 \\text{ in } x = 1',
            answer: 'y = 3x - 2',
            steps: [
              "$f(1) = 1$ en $f'(x) = 3x^2$, dus $f'(1) = 3$",
              '$y = 1 + 3(x - 1) = 3x - 2$',
            ],
          },
        ],
      },
      {
        id: 'stijgen_dalen',
        title: 'Soorten stijgen en dalen',
        notes: [
          'Kijk eerst naar het teken van $f\'(x)$, daarna naar het teken van $f\'\'(x)$.',
        ],
        examples: [
          {
            problem: 'f(x) = x^3 \\text{ in } x = 1',
            answer: '\\text{toenemend stijgend}',
            steps: ["$f'(1) = 3 > 0$", "$f''(1) = 6 > 0$", 'Positief en positief: toenemend stijgend'],
          },
          {
            problem: 'f(x) = -x^2 \\text{ in } x = 1',
            answer: '\\text{toenemend dalend}',
            steps: ["$f'(1) = -2 < 0$", "$f''(x) = -2 < 0$", 'Negatief en negatief: toenemend dalend'],
          },
        ],
        table: {
          headers: ['Eerste afgeleide', 'Tweede afgeleide', 'De grafiek is'],
          rows: [
            ["$f'(x) > 0$", "$f''(x) > 0$", 'toenemend stijgend'],
            ["$f'(x) > 0$", "$f''(x) < 0$", 'afnemend stijgend'],
            ["$f'(x) < 0$", "$f''(x) < 0$", 'toenemend dalend'],
            ["$f'(x) < 0$", "$f''(x) > 0$", 'afnemend dalend'],
          ],
        },
      },
      {
        id: 'buigpunt',
        title: 'Buigpunt',
        formula: "f''(x) = 0 \\text{ en } f'' \\text{ wisselt van teken}",
        examples: [
          {
            problem: 'f(x) = x^3 - 3x^2 + x',
            answer: '\\text{buigpunt bij } x = 1',
            steps: [
              "$f'(x) = 3x^2 - 6x + 1$",
              "$f''(x) = 6x - 6$",
              "$f''(1) = 0$ en $f''$ wisselt daar van negatief naar positief",
            ],
          },
          {
            problem: 'f(x) = x^3',
            answer: '\\text{buigpunt bij } x = 0',
            steps: ["$f''(x) = 6x$", "$f''(0) = 0$ en $f''$ wisselt van teken"],
          },
        ],
        notes: [
          'In een buigpunt gaat de grafiek over van de ene soort stijgen of dalen naar de andere. Dan wisselt $f\'\'$ van teken.',
        ],
      },
      {
        id: 'top_tweede',
        title: 'Top met de tweede afgeleide',
        uitlegPad: '/theorie/extreme-waarden',
        formula: [
          "f'(x) = 0",
          "f''(x) < 0 \\implies \\text{maximum}",
          "f''(x) > 0 \\implies \\text{minimum}",
        ],
        examples: [
          {
            problem: 'f(x) = x^3 - 3x',
            answer: '\\text{maximum bij } x = -1,\\ \\text{minimum bij } x = 1',
            steps: [
              "$f'(x) = 3x^2 - 3$, dus $x = -1$ of $x = 1$",
              "$f''(x) = 6x$",
              "$f''(-1) = -6 < 0$: maximum. $f''(1) = 6 > 0$: minimum",
            ],
          },
          {
            problem: 'f(x) = x^2 + 2',
            answer: '\\text{minimum bij } x = 0',
            steps: ["$f'(x) = 2x = 0$ geeft $x = 0$", "$f''(x) = 2 > 0$, dus een minimum"],
          },
        ],
      },
      {
        id: 'afstand_o',
        title: 'Afstand van een top tot O',
        formula: 'OA^{2} = x_A^{2} + y_A^{2}',
        notes: [
          'Voor twee toppen $A$ en $B$ stel je $OA^2 = OB^2$. Dan hoef je de wortel niet te trekken.',
        ],
        examples: [
          {
            problem: 'f(x) = 4 - x^2',
            answer: 'OA = 4',
            steps: ["$f'(x) = -2x = 0$ geeft de top $(0, 4)$", '$OA = \\sqrt{0 + 16} = 4$'],
          },
          {
            problem: 'f(x) = x^2 - 1',
            answer: 'OA = 1',
            steps: ['De top is $(0, -1)$', '$OA = \\sqrt{0 + 1} = 1$'],
          },
        ],
      },
      {
        id: 'hoek_grafieken',
        title: 'Hoek tussen twee grafieken',
        formula: [
          "\\tan(\\alpha) = f'(x)",
          "\\tan(\\beta) = g'(x)",
          "|\\alpha - \\beta|",
          "\\text{groter dan } 90^{\\circ}?\\ \\text{dan } 180^{\\circ} - |\\alpha - \\beta|",
        ],
        examples: [
          {
            problem: 'f(x) = x^2 \\text{ en } y = 1 \\text{ in } (1, 1)',
            answer: '63{,}4^{\\circ}',
            steps: [
              "$f'(x) = 2x$, dus in $(1, 1)$ is de helling $2$. De horizontale lijn heeft helling $0$.",
              "$\\tan(\\alpha) = 2$ geeft $\\alpha \\approx 63{,}43^{\\circ}$. $\\tan(\\beta) = 0$ geeft $\\beta = 0^{\\circ}$.",
              "Het verschil is $63{,}43^{\\circ}$. Dat is kleiner dan $90^{\\circ}$, dus de hoek is $63{,}4^{\\circ}$.",
            ],
          },
          {
            problem: 'f(x) = x \\text{ en } y = 0 \\text{ in } (0, 0)',
            answer: '45^{\\circ}',
            steps: [
              "$f'(x) = 1$, dus $\\alpha = 45^{\\circ}$. De $x$-as heeft helling $0$.",
              'Het verschil is $45^{\\circ}$. Dat is kleiner dan $90^{\\circ}$.',
            ],
          },
        ],
        notes: [
          'De hoek tussen twee grafieken in een snijpunt is de hoek tussen de raaklijnen daar.',
          'Zet je rekenmachine op graden. Een richtingshoek ligt tussen $-90^{\\circ}$ en $90^{\\circ}$.',
        ],
      },
      {
        id: 'grafieken_raken',
        title: 'Grafieken die elkaar raken',
        formula: ["f(x) = g(x)", "f'(x) = g'(x)"],
        examples: [
          {
            problem: 'f(x) = x^2 \\text{ en } g(x) = 2x - 1',
            answer: '\\text{raakpunt } (1, 1)',
            steps: [
              "$f'(x) = 2x$ en $g'(x) = 2$. Gelijkstellen geeft $x = 1$.",
              "$f(1) = 1$ en $g(1) = 1$. Ze snijden elkaar en hebben dezelfde helling.",
            ],
          },
          {
            problem: 'f(x) = x^2 + 1 \\text{ en } g(x) = 2x',
            answer: '\\text{raakpunt } (1, 2)',
            steps: ["$f'(x) = 2x$ en $g'(x) = 2$, dus $x = 1$", '$f(1) = 2$ en $g(1) = 2$'],
          },
        ],
        notes: [
          'Eerst de hellingen gelijkstellen, dan controleren of de grafieken daar ook echt samenkomen.',
        ],
      },
      {
        id: 'loodrecht_snijden',
        title: 'Loodrecht snijdende grafieken',
        formula: ["f(x) = g(x)", "f'(x) \\cdot g'(x) = -1"],
        examples: [
          {
            problem: 'f(x) = x^2 \\text{ en } g(x) = -x + \\dfrac{3}{4}',
            answer: '\\text{loodrecht in } \\left(\\dfrac{1}{2}, \\dfrac{1}{4}\\right)',
            steps: [
              "$f'(x) = 2x$ en $g'(x) = -1$. Het product is $-1$ bij $x = \\dfrac{1}{2}$.",
              "Daar zijn $f$ en $g$ allebei $\\dfrac{1}{4}$.",
            ],
          },
          {
            problem: 'f(x) = x \\text{ en } g(x) = -x + 2',
            answer: '\\text{loodrecht in } (1, 1)',
            steps: ["$f'(x) \\cdot g'(x) = 1 \\cdot -1 = -1$", 'Ze snijden bij $x = 1$, en daar is $y = 1$'],
          },
        ],
        notes: [
          'Een verticale raaklijn heeft geen helling. Dan werkt het product $-1$ niet.',
        ],
      },
      {
        id: 'optimaliseren',
        title: 'Grootste of kleinste waarde',
        formula: [
          "f'(x) = 0",
          "f''(x) < 0 \\implies \\text{grootste waarde}",
          "f''(x) > 0 \\implies \\text{kleinste waarde}",
        ],
        examples: [
          {
            problem: 'f(x) = 10x - x^2 \\text{ met } 0 < x < 10',
            answer: '\\text{grootst } 25 \\text{ bij } x = 5',
            steps: [
              "Stap 0. Je zoekt de grootste waarde van $f$ op het gegeven domein.",
              "Stap 1. $f'(x) = 10 - 2x$.",
              "Stap 2. Stel $f'(x) = 0$. Dan is $x = 5$, en dat ligt in het domein.",
              "Stap 3. $f''(x) = -2 < 0$, dus een grootste waarde. $f(5) = 25$.",
            ],
          },
          {
            problem: 'f(x) = x^2 - 4x + 7',
            answer: '\\text{kleinst } 3 \\text{ bij } x = 2',
            steps: ["$f'(x) = 2x - 4 = 0$ geeft $x = 2$", "$f''(x) = 2 > 0$, dus een kleinste waarde. $f(2) = 3$"],
          },
        ],
        notes: [
          'Een oplossing van $f\'(x) = 0$ telt alleen mee als die in het domein ligt.',
          'Je mag ook naar het teken van $f\'$ kijken: plus daarna min is een grootste waarde, min daarna plus een kleinste.',
        ],
      },
      {
        id: 'afstand_tussen_grafieken',
        title: 'Afstand tussen twee grafieken',
        formula: 'h(x) = g(x) - f(x)',
        examples: [
          {
            problem: 'g(x) = 4 - x^2 \\text{ boven } f(x) = x',
            answer: '\\text{grootste afstand } \\dfrac{17}{4} \\text{ bij } x = -\\dfrac{1}{2}',
            steps: [
              "$h(x) = 4 - x^2 - x$",
              "$h'(x) = -2x - 1 = 0$ geeft $x = -\\dfrac{1}{2}$",
              "$h''(-\\dfrac{1}{2}) = -2 < 0$ en $h(-\\dfrac{1}{2}) = \\dfrac{17}{4}$",
            ],
          },
          {
            problem: 'g(x) = x + 5 \\text{ boven } f(x) = x^2',
            answer: '\\text{grootste afstand } \\dfrac{21}{4} \\text{ bij } x = \\dfrac{1}{2}',
            steps: [
              '$h(x) = x + 5 - x^2$',
              "$h'(x) = 1 - 2x = 0$ geeft $x = \\dfrac{1}{2}$",
              "$h(\\dfrac{1}{2}) = \\dfrac{21}{4}$ en $h'' = -2 < 0$",
            ],
          },
        ],
        notes: [
          'Trek de onderste grafiek van de bovenste af. Zo blijft de afstand positief.',
        ],
      },
      {
        id: 'kosten_ax_b_over_x',
        title: 'Kosten van de vorm ax + b/x',
        formula: [
          "f(x) = ax + \\dfrac{b}{x} \\text{ met } x > 0",
          "f'(x) = a - \\dfrac{b}{x^2}",
          "x = \\sqrt{\\dfrac{b}{a}}",
        ],
        examples: [
          {
            problem: 'f(x) = x + \\dfrac{4}{x} \\text{ met } x > 0',
            answer: '\\text{kleinst } 4 \\text{ bij } x = 2',
            steps: [
              "$f'(x) = 1 - \\dfrac{4}{x^2}$",
              "Stel $f'(x) = 0$. Dan is $x^2 = 4$. Omdat $x > 0$ neem je $x = 2$.",
              "$f''(x) = \\dfrac{8}{x^3} > 0$ voor $x > 0$, dus een kleinste waarde. $f(2) = 4$.",
            ],
          },
          {
            problem: 'f(x) = 2x + \\dfrac{8}{x} \\text{ met } x > 0',
            answer: '\\text{kleinst } 8 \\text{ bij } x = 2',
            steps: [
              "$f'(x) = 2 - \\dfrac{8}{x^2} = 0$ geeft $x = 2$",
              '$f(2) = 4 + 4 = 8$. De tweede afgeleide is positief voor $x > 0$',
            ],
          },
        ],
        notes: [
          'Bij $x > 0$ laat je de negatieve oplossing van $x^2 = \\dfrac{b}{a}$ weg.',
        ],
      },
    ],
  },
]
