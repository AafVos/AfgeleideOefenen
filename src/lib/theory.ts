/**
 * Centrale bron voor formules + voorbeelden per cluster.
 *
 * Sleutel = `topicSlug/clusterSlug` zoals in de database.
 * Wordt gebruikt door:
 *   - de inline „Uitleg"-hint op de oefenkaart  (`leerpad/cluster-rule.tsx`)
 *   - de overzichtspagina /theorie               (`app/theorie/page.tsx`)
 */

export type ClusterTheory = {
  /** Hoofdregel als KaTeX-string. */
  rule: string
  /** Optioneel: extra korte uitleg in proza (mag inline $...$ bevatten). */
  intro?: string
  example?: {
    /** LaTeX */
    problem: string
    /** LaTeX */
    answer: string
    /** Stap-voor-stap, mag inline `$...$` bevatten */
    steps?: string[]
  }
}

export const CLUSTER_THEORY: Record<string, ClusterTheory> = {
  // ── Basis ────────────────────────────────────────────────────────────────
  'basis/standaard': {
    rule: "f(x) = ax^n \\implies f'(x) = n \\cdot ax^{n-1}",
    intro:
      'De machtsregel is de basis van differentiëren: zet de exponent vooraan en verlaag de exponent met 1.',
    example: {
      problem: 'f(x) = 3x^4',
      answer: "f'(x) = 12x^3",
      steps: ['$n = 4$, $a = 3$', "$f'(x) = 4 \\cdot 3 \\cdot x^{4-1} = 12x^3$"],
    },
  },
  'basis/herschrijven': {
    rule: "\\sqrt{x} = x^{1/2} \\quad \\dfrac{1}{x^n} = x^{-n} \\implies f'(x) = n \\cdot ax^{n-1}",
    intro:
      'Wortels en breuken eerst als macht schrijven, dan past de machtsregel zoals normaal.',
    example: {
      problem: 'f(x) = \\sqrt{x} = x^{1/2}',
      answer: "f'(x) = \\dfrac{1}{2}x^{-1/2} = \\dfrac{1}{2\\sqrt{x}}",
      steps: [
        'Schrijf om: $f(x) = x^{1/2}$',
        "$n = \\tfrac{1}{2}$: $f'(x) = \\tfrac{1}{2} x^{-1/2} = \\dfrac{1}{2\\sqrt{x}}$",
      ],
    },
  },
  'basis/machten_combineren': {
    rule: "x^a \\cdot x^b = x^{a+b} \\qquad \\dfrac{x^a}{x^b} = x^{a-b} \\qquad (x^a)^b = x^{ab}",
    intro:
      'Machten eerst combineren, dan differentiëren — vaak veel sneller dan de product- of quotiëntregel toepassen.',
    example: {
      problem: 'f(x) = x^4 / x = x^3',
      answer: "f'(x) = 3x^2",
      steps: [
        'Vereenvoudig: $x^4/x = x^{4-1} = x^3$',
        "$f'(x) = 3x^2$",
      ],
    },
  },

  // ── Somregel ────────────────────────────────────────────────────────────
  'somregel/optelling': {
    rule: "f(x) = g(x)+h(x) \\implies f'(x) = g'(x)+h'(x)",
    intro:
      'Bij een som leid je elke term apart af en tel je de afgeleides bij elkaar op.',
    example: {
      problem: 'f(x) = 2x^3 + 3x^2',
      answer: "f'(x) = 6x^2 + 6x",
      steps: ['Leid elke term apart af', "$2x^3 \\to 6x^2$ en $3x^2 \\to 6x$"],
    },
  },
  'somregel/haakjes_uitwerken': {
    rule: '\\text{Werk haakjes uit, pas dan de somregel toe}',
    intro:
      'Productvormen met alleen veeltermen kun je uitwerken — daarna is het gewoon een som van termen.',
    example: {
      problem: 'f(x) = (x+1)(x+2)',
      answer: "f'(x) = 2x+3",
      steps: ['Uitwerken: $f(x) = x^2 + 3x + 2$', "$f'(x) = 2x + 3$"],
    },
  },

  // ── Productregel ────────────────────────────────────────────────────────
  'productregel/twee_veeltermen': {
    rule: "f(x) = g(x) \\cdot h(x) \\implies f'(x) = g'h + gh'",
    intro:
      'De productregel: afgeleide van de eerste keer de tweede, plus de eerste keer de afgeleide van de tweede.',
    example: {
      problem: 'f(x) = x^2 \\cdot (x+3)',
      answer: "f'(x) = 2x(x+3) + x^2 = 3x^2 + 6x",
      steps: [
        '$g = x^2,\\ h = x+3$',
        "$g' = 2x,\\ h' = 1$",
        "$f'(x) = 2x(x+3) + x^2 \\cdot 1 = 3x^2+6x$",
      ],
    },
  },
  'productregel/veelterm_macht': {
    rule: "f(x) = g(x) \\cdot h(x) \\implies f'(x) = g'h + gh'",
    example: {
      problem: 'f(x) = x^3 \\cdot (2x+1)',
      answer: "f'(x) = 3x^2(2x+1) + 2x^3 = 8x^3 + 3x^2",
    },
  },
  'productregel/veelterm_wortel': {
    rule: "f(x) = g(x) \\cdot h(x) \\implies f'(x) = g'h + gh'",
    intro: 'Schrijf de wortel eerst als macht; daarna is het gewone productregel.',
    example: {
      problem: 'f(x) = x \\cdot \\sqrt{x}',
      answer: "f'(x) = \\sqrt{x} + \\dfrac{x}{2\\sqrt{x}} = \\dfrac{3}{2}\\sqrt{x}",
      steps: [
        "$g = x,\\ h = \\sqrt{x} = x^{1/2}$",
        "$g' = 1,\\ h' = \\tfrac{1}{2}x^{-1/2}$",
        "$f'(x) = \\sqrt{x} + x \\cdot \\tfrac{1}{2\\sqrt{x}} = \\tfrac{3}{2}\\sqrt{x}$",
      ],
    },
  },
  'productregel/drie_factoren': {
    rule: "f(x) = g \\cdot h \\cdot k \\implies f'(x) = g'hk + gh'k + ghk'",
    intro:
      'Bij drie factoren leid je telkens één factor af en laat je de andere twee staan — drie termen totaal.',
    example: {
      problem: 'f(x) = x \\cdot x^2 \\cdot x^3',
      answer: "f'(x) = 6x^5",
      steps: ["Of eenvoudiger: $f(x) = x^6$, dus $f'(x) = 6x^5$"],
    },
  },

  // ── Quotiëntregel ────────────────────────────────────────────────────────
  'quotientregel/makkelijk': {
    rule: "f(x) = \\dfrac{t(x)}{n(x)} \\implies f'(x) = \\dfrac{t'n - tn'}{n^2}",
    intro:
      'Teller en noemer apart afleiden, kruisproduct met min, en delen door de noemer in het kwadraat. Let goed op de volgorde.',
    example: {
      problem: 'f(x) = \\dfrac{x^2}{x+1}',
      answer:
        "f'(x) = \\dfrac{2x(x+1)-x^2}{(x+1)^2} = \\dfrac{x^2+2x}{(x+1)^2}",
      steps: [
        '$t = x^2,\\ n = x+1$',
        "$t' = 2x,\\ n' = 1$",
        "$f'(x) = \\dfrac{2x(x+1) - x^2 \\cdot 1}{(x+1)^2} = \\dfrac{x^2+2x}{(x+1)^2}$",
      ],
    },
  },
  'quotientregel/polynoom': {
    rule: "f(x) = \\dfrac{t(x)}{n(x)} \\implies f'(x) = \\dfrac{t'n - tn'}{n^2}",
    example: {
      problem: 'f(x) = \\dfrac{x^3}{x^2+1}',
      answer:
        "f'(x) = \\dfrac{3x^2(x^2+1)-2x^4}{(x^2+1)^2} = \\dfrac{x^4+3x^2}{(x^2+1)^2}",
    },
  },
  'quotientregel/combi_somregel': {
    rule: "f(x) = \\dfrac{t(x)}{n(x)} \\implies f'(x) = \\dfrac{t'n - tn'}{n^2}",
    intro:
      'Eerst de quotiëntregel op de breuk, dan de somregel om de andere termen erbij op te tellen.',
    example: {
      problem: 'f(x) = \\dfrac{x^2+1}{x} + 3x',
      answer: "f'(x) = \\dfrac{x^2-1}{x^2} + 3",
      steps: [
        'Leid $\\dfrac{x^2+1}{x}$ af via quotiëntregel',
        'Tel de afgeleide van $3x$ erbij op',
      ],
    },
  },

  // ── Kettingregel ────────────────────────────────────────────────────────
  'kettingregel/macht_lineair': {
    rule: "f(x) = (ax+b)^n \\implies f'(x) = n \\cdot a \\cdot (ax+b)^{n-1}",
    intro:
      'Buitenste keer afgeleide van binnenste. Bij een lineaire binnenste is de afgeleide gewoon de coëfficiënt.',
    example: {
      problem: 'f(x) = (2x+3)^4',
      answer: "f'(x) = 8(2x+3)^3",
      steps: [
        '$n = 4$, binnenste afgeleide $= 2$',
        "$f'(x) = 4 \\cdot 2 \\cdot (2x+3)^3 = 8(2x+3)^3$",
      ],
    },
  },
  'kettingregel/macht_veelterm': {
    rule: "f(x) = [g(x)]^n \\implies f'(x) = n \\cdot g'(x) \\cdot [g(x)]^{n-1}",
    example: {
      problem: 'f(x) = (x^2+1)^3',
      answer: "f'(x) = 6x(x^2+1)^2",
      steps: [
        "$g(x) = x^2+1,\\ g'(x) = 2x$",
        "$f'(x) = 3 \\cdot 2x \\cdot (x^2+1)^2 = 6x(x^2+1)^2$",
      ],
    },
  },
  'kettingregel/wortel': {
    rule: "f(x) = \\sqrt{g(x)} \\implies f'(x) = \\dfrac{g'(x)}{2\\sqrt{g(x)}}",
    intro:
      'Bij een wortel: afgeleide van wat onder de wortel staat, gedeeld door tweemaal de oorspronkelijke wortel.',
    example: {
      problem: 'f(x) = \\sqrt{x^2+4}',
      answer: "f'(x) = \\dfrac{x}{\\sqrt{x^2+4}}",
      steps: [
        "$g(x) = x^2+4,\\ g'(x) = 2x$",
        "$f'(x) = \\dfrac{2x}{2\\sqrt{x^2+4}} = \\dfrac{x}{\\sqrt{x^2+4}}$",
      ],
    },
  },
  'kettingregel/negatieve_macht': {
    rule: "f(x) = [g(x)]^{-n} \\implies f'(x) = -n \\cdot g'(x) \\cdot [g(x)]^{-n-1}",
    example: {
      problem: 'f(x) = \\dfrac{1}{(x+1)^2} = (x+1)^{-2}',
      answer: "f'(x) = \\dfrac{-2}{(x+1)^3}",
      steps: [
        "$g(x) = x+1,\\ g'(x) = 1$",
        "$f'(x) = -2 \\cdot 1 \\cdot (x+1)^{-3} = \\dfrac{-2}{(x+1)^3}$",
      ],
    },
  },
  'kettingregel/combi_somregel': {
    rule: "f(x) = g(x)+h(x) \\implies f'(x) = g'(x)+h'(x) \\quad\\text{(elk lid kettingregel)}",
    example: {
      problem: 'f(x) = (x+1)^2 + (2x-1)^3',
      answer: "f'(x) = 2(x+1) + 6(2x-1)^2",
    },
  },
  'kettingregel/plus_productregel': {
    rule: "f(x) = g(x) \\cdot h(x) \\implies f'(x) = g'h+gh' \\quad\\text{(kettingregel in } g \\text{ of } h\\text{)}",
    intro:
      'Productregel als hoofdstructuur, en pas binnen $g$ of $h$ de kettingregel toe.',
    example: {
      problem: 'f(x) = x \\cdot (x^2+1)^3',
      answer: "f'(x) = (x^2+1)^3 + 6x^2(x^2+1)^2",
      steps: [
        "$g = x,\\ h = (x^2+1)^3$",
        "$g' = 1,\\ h' = 6x(x^2+1)^2$",
        "$f'(x) = (x^2+1)^3 + x \\cdot 6x(x^2+1)^2$",
      ],
    },
  },
  'kettingregel/plus_quotientregel': {
    rule: "f(x) = \\dfrac{t(x)}{n(x)} \\implies f'(x) = \\dfrac{t'n-tn'}{n^2} \\quad\\text{(kettingregel in } t \\text{ of } n\\text{)}",
    intro:
      'Quotiëntregel als hoofdstructuur, en de kettingregel binnen teller of noemer.',
    example: {
      problem: 'f(x) = \\dfrac{x+1}{\\sqrt{2x+1}}',
      answer:
        "f'(x) = \\dfrac{\\sqrt{2x+1} - \\frac{x+1}{\\sqrt{2x+1}}}{2x+1}",
      steps: [
        "$t = x+1,\\ t' = 1$",
        "$n = \\sqrt{2x+1},\\ n' = \\dfrac{1}{\\sqrt{2x+1}}$",
      ],
    },
  },

  // ── e-macht ──────────────────────────────────────────────────────────────
  'emacht/standaard': {
    rule: "f(x) = e^x \\implies f'(x) = e^x",
    intro: 'De e-macht is haar eigen afgeleide — uniek in de wiskunde.',
    example: {
      problem: 'f(x) = 3e^x',
      answer: "f'(x) = 3e^x",
    },
  },
  'emacht/combi_somregel': {
    rule: "f(x) = e^x \\implies f'(x) = e^x \\quad\\text{(combineer met somregel)}",
    example: {
      problem: 'f(x) = x^2 + e^x',
      answer: "f'(x) = 2x + e^x",
    },
  },
  'emacht/combi_productregel': {
    rule: "f(x) = g(x) \\cdot e^x \\implies f'(x) = g'(x)e^x + g(x)e^x",
    example: {
      problem: 'f(x) = x \\cdot e^x',
      answer: "f'(x) = (x+1)e^x",
      steps: [
        "$g = x,\\ g' = 1$",
        "$f'(x) = 1 \\cdot e^x + x \\cdot e^x = (1+x)e^x$",
      ],
    },
  },
  'emacht/combi_kettingregel': {
    rule: "f(x) = e^{g(x)} \\implies f'(x) = g'(x) \\cdot e^{g(x)}",
    intro:
      'Bij $e^{g(x)}$: de e-macht blijft staan, vermenigvuldigd met de afgeleide van de exponent.',
    example: {
      problem: 'f(x) = e^{3x+1}',
      answer: "f'(x) = 3e^{3x+1}",
      steps: [
        "$g(x) = 3x+1,\\ g'(x) = 3$",
        "$f'(x) = 3 \\cdot e^{3x+1}$",
      ],
    },
  },
  'emacht/combi_quotientregel': {
    rule: "f(x) = \\dfrac{t(x)}{n(x)} \\implies f'(x) = \\dfrac{t'n - tn'}{n^2} \\quad\\text{(met } e^x\\text{)}",
    example: {
      problem: 'f(x) = \\dfrac{e^x}{x}',
      answer: "f'(x) = \\dfrac{e^x(x-1)}{x^2}",
      steps: [
        "$t = e^x,\\ t' = e^x;\\ n = x,\\ n' = 1$",
        "$f'(x) = \\dfrac{e^x \\cdot x - e^x}{x^2} = \\dfrac{e^x(x-1)}{x^2}$",
      ],
    },
  },

  // ── Goniometrie ──────────────────────────────────────────────────────────
  'goniometrie/standaard': {
    rule: "f(x)=\\sin x \\Rightarrow f'(x)=\\cos x \\qquad f(x)=\\cos x \\Rightarrow f'(x)=-\\sin x \\qquad f(x)=\\tan x \\Rightarrow f'(x)=1+\\tan^2 x",
    intro:
      'De drie standaardafgeleides: $\\sin \\to \\cos$, $\\cos \\to -\\sin$ (let op het minteken!), $\\tan \\to 1+\\tan^2$.',
    example: {
      problem: 'f(x) = 3\\sin(x) - 2\\cos(x)',
      answer: "f'(x) = 3\\cos(x) + 2\\sin(x)",
    },
  },
  'goniometrie/combi_kettingregel': {
    rule: "f(x) = \\sin(g(x)) \\implies f'(x) = g'(x)\\cos(g(x))",
    example: {
      problem: 'f(x) = \\sin(3x+1)',
      answer: "f'(x) = 3\\cos(3x+1)",
      steps: [
        "$g(x) = 3x+1,\\ g'(x) = 3$",
        "$f'(x) = 3 \\cdot \\cos(3x+1)$",
      ],
    },
  },
  'goniometrie/combi_productregel': {
    rule: "f(x) = g(x) \\cdot h(x) \\implies f'(x) = g'h + gh' \\quad\\text{(met goniometrie)}",
    example: {
      problem: 'f(x) = x \\cdot \\sin(x)',
      answer: "f'(x) = \\sin(x) + x\\cos(x)",
      steps: [
        "$g = x,\\ g' = 1;\\ h = \\sin x,\\ h' = \\cos x$",
        "$f'(x) = \\sin(x) + x\\cos(x)$",
      ],
    },
  },
  'goniometrie/combi_quotientregel': {
    rule: "f(x) = \\dfrac{t(x)}{n(x)} \\implies f'(x) = \\dfrac{t'n - tn'}{n^2} \\quad\\text{(met goniometrie)}",
    example: {
      problem: 'f(x) = \\dfrac{\\sin(x)}{x}',
      answer: "f'(x) = \\dfrac{x\\cos(x) - \\sin(x)}{x^2}",
      steps: [
        "$t = \\sin x,\\ t' = \\cos x;\\ n = x,\\ n' = 1$",
        "$f'(x) = \\dfrac{x\\cos x - \\sin x}{x^2}$",
      ],
    },
  },

  // ── ln en log ────────────────────────────────────────────────────────────
  'lnlog/standaard': {
    rule: "f(x) = \\ln x \\Rightarrow f'(x) = \\dfrac{1}{x} \\qquad f(x) = \\log_g x \\Rightarrow f'(x) = \\dfrac{1}{x \\ln g}",
    intro:
      'De afgeleide van $\\ln x$ is $1/x$. Bij andere grondtallen vermenigvuldig je nog met $1/\\ln g$.',
    example: {
      problem: 'f(x) = 2\\ln(x)',
      answer: "f'(x) = \\dfrac{2}{x}",
    },
  },
  'lnlog/combi_somregel': {
    rule: "f(x) = \\ln x \\Rightarrow f'(x) = \\dfrac{1}{x} \\quad\\text{(combineer met somregel)}",
    example: {
      problem: 'f(x) = x^2 + \\ln(x)',
      answer: "f'(x) = 2x + \\dfrac{1}{x}",
    },
  },
  'lnlog/combi_productregel': {
    rule: "f(x) = g(x) \\cdot \\ln x \\implies f'(x) = g'(x)\\ln x + \\dfrac{g(x)}{x}",
    example: {
      problem: 'f(x) = x^2 \\cdot \\ln(x)',
      answer: "f'(x) = 2x\\ln(x) + x",
      steps: [
        "$g = x^2,\\ g' = 2x;\\ h = \\ln x,\\ h' = \\tfrac{1}{x}$",
        "$f'(x) = 2x\\ln x + x^2 \\cdot \\tfrac{1}{x} = 2x\\ln x + x$",
      ],
    },
  },
  'lnlog/combi_kettingregel': {
    rule: "f(x) = \\ln(g(x)) \\implies f'(x) = \\dfrac{g'(x)}{g(x)}",
    intro:
      'Voor $\\ln$ van iets samengestelds: de afgeleide van wat erin staat, gedeeld door wat erin staat.',
    example: {
      problem: 'f(x) = \\ln(x^2+1)',
      answer: "f'(x) = \\dfrac{2x}{x^2+1}",
      steps: [
        "$g(x) = x^2+1,\\ g'(x) = 2x$",
        "$f'(x) = \\dfrac{2x}{x^2+1}$",
      ],
    },
  },
  'lnlog/combi_quotientregel': {
    rule: "f(x) = \\dfrac{t(x)}{n(x)} \\implies f'(x) = \\dfrac{t'n - tn'}{n^2} \\quad\\text{(met ln)}",
    example: {
      problem: 'f(x) = \\dfrac{\\ln(x)}{x}',
      answer: "f'(x) = \\dfrac{1 - \\ln(x)}{x^2}",
      steps: [
        "$t = \\ln x,\\ t' = \\tfrac{1}{x};\\ n = x,\\ n' = 1$",
        "$f'(x) = \\dfrac{\\frac{x}{x} - \\ln x}{x^2} = \\dfrac{1-\\ln x}{x^2}$",
      ],
    },
  },
}

/**
 * De kernformule per topic voor het compacte formule-overzicht bovenaan
 * de theoriepagina. Sleutel = topic-slug.
 */
export const TOPIC_FORMULA: Record<string, string> = {
  basis:         "f(x) = ax^n \\implies f'(x) = n \\cdot ax^{n-1}",
  somregel:      "f(x) = g(x)+h(x) \\implies f'(x) = g'(x)+h'(x)",
  productregel:  "f(x) = g(x) \\cdot h(x) \\implies f'(x) = g'(x)h(x) + g(x)h'(x)",
  quotientregel: "f(x) = \\dfrac{g(x)}{h(x)} \\implies f'(x) = \\dfrac{g'(x)h(x) - g(x)h'(x)}{h(x)^2}",
  kettingregel:  "f\\bigl(g(x)\\bigr)' = f'\\bigl(g(x)\\bigr) \\cdot g'(x)",
  emacht:        "f(x) = e^{g(x)} \\implies f'(x) = g'(x) \\cdot e^{g(x)}",
  goniometrie:   "\\begin{gathered} f(x) = \\sin x \\implies f'(x) = \\cos x \\\\ f(x) = \\cos x \\implies f'(x) = -\\sin x \\end{gathered}",
  lnlog:         "f(x) = \\ln\\bigl(g(x)\\bigr) \\implies f'(x) = \\dfrac{g'(x)}{g(x)}",
}

/**
 * Korte introtekst per topic, voor de overzichtspagina.
 * Sleutel = topic-slug zoals in `topics.slug`.
 */
export const TOPIC_INTROS: Record<string, string> = {
  basis:
    'Het fundament: de machtsregel en hoe je wortels en breuken eerst herschrijft tot een macht zodat je gewoon de machtsregel kunt toepassen.',
  somregel:
    'Een functie als optelling van termen leid je term-voor-term af. Soms moet je eerst haakjes uitwerken om bij een nette som te komen.',
  productregel:
    'Bij een product van twee (of meer) factoren gebruik je $f\' = g\'h + gh\'$. Identificeer eerst $g$ en $h$, leid ze apart af, en vul in.',
  quotientregel:
    'Voor een breuk geldt $f\' = \\dfrac{t\'n - tn\'}{n^2}$. Let op de volgorde van de termen in de teller en op het kwadraat van de noemer.',
  kettingregel:
    'Bij een samenstelling (functie ín functie) leid je de buitenste functie af en vermenigvuldig je met de afgeleide van de binnenste.',
  emacht:
    "De e-macht is haar eigen afgeleide. Combinaties met de som-, product-, ketting- of quotiëntregel komen veel voor.",
  goniometrie:
    'Sinus en cosinus wisselen elkaar af bij differentiëren. Bij combinaties met andere regels blijven de standaardafgeleides je vertrekpunt.',
  lnlog:
    'De afgeleide van $\\ln x$ is $1/x$. In samengestelde uitdrukkingen pas je de kettingregel toe en kom je vaak op $g\'/g$ uit.',
}
