/**
 * Openbare antwoordpagina's: `/voorbeeld/<slug>`.
 *
 * Eén sjabloon leest deze lijst. Een nieuwe functie is een extra object,
 * plus een regel in de test die de afgeleide narekent.
 *
 * `f` is de functie, `df` de afgeleide als getal. De test vergelijkt `df`
 * met een numerieke afgeleide van `f`. De LaTeX hoort daarbij.
 */

export type Voorbeeld = {
  slug: string;
  /** Kop, bijvoorbeeld "De afgeleide van wortel x". */
  kop: string;
  omschrijving: string;
  /** Zin zonder formule, voor de zoekmachine. */
  antwoordTekst: string;
  /** Rechterkant van f(x), als LaTeX. */
  functie: string;
  /** Rechterkant van f'(x), als LaTeX. */
  antwoord: string;
  stappen: readonly [string, string, string, string];
  fout: string;
  /** Oefenlink, inclusief `van=voorbeeld`. */
  oefenen: string;
  theoriePad: string;
  theorieNaam: string;
  /** Drie tot vijf slugs van andere voorbeelden uit dezelfde familie. */
  verwant: readonly string[];
  /**
   * Toont een korte brug naar de examentraining onder "Probeer 3 sommen".
   * Alleen op de drukste voorbeeldpagina's (AFG-623): die staan hoog in
   * Google en geven een bezoeker zo een tweede reden om te blijven.
   */
  examenbrug?: boolean;
  /**
   * Extra FAQ-vraag "Hoe oefen je ...?" in het JSON-LD-schema (AFG-658):
   * alleen op de drukste pagina's uit de zoekcluster die amper klikken
   * krijgt, als kans op een FAQ-rich result naast de belofte-eerste meta.
   */
  faqUitgebreid?: boolean;
  /**
   * Typvorm zonder spatie, bijvoorbeeld "lnx" naast "ln x" (AFG-704):
   * Search Console laat zien dat leerlingen zo zoeken, maar de pagina's
   * scoorden 0 klikken omdat de titel alleen de vorm met spatie toonde.
   * Komt in de titel als "(lnx)" naast de leesbare vorm.
   */
  typVorm?: string;
  f: (x: number) => number;
  df: (x: number) => number;
  punten: readonly number[];
};

function oefen(chapter: string, topic: string, cluster: string): string {
  return `/oefenen?chapter=${chapter}&topic=${topic}&cluster=${cluster}&van=voorbeeld`;
}

const MACHT = "/theorie/machtsregel";
const SOM = "/theorie/somregel";
const PRODUCT = "/theorie/productregel";
const KETTING = "/theorie/kettingregel";
const HERSCHRIJVEN = "/theorie#kaart-h6-machten_herschrijven";
const GONIO = "/theorie#kaart-h7-gonio_basis";
const GONIO_KETTING = "/theorie#kaart-h7-gonio_kettingregel";
const E_MACHT = "/theorie#kaart-h9-e_machten";
const LN = "/theorie#kaart-h9-logaritmes";

export const VOORBEELDEN: readonly Voorbeeld[] = [
  {
    slug: "wortel-x",
    kop: "De afgeleide van wortel x",
    omschrijving:
      "Oefen gratis de afgeleide van wortel x: drie sommen zonder account, met stappenplan en een veelgemaakte fout.",
    antwoordTekst: "De afgeleide van wortel x is 1 gedeeld door 2 wortel x.",
    functie: "\\sqrt{x}",
    antwoord: "\\dfrac{1}{2\\sqrt{x}}",
    stappen: [
      "Stap 0. Schrijf de wortel als een macht van $x$. Dat is de machtsregel. De wortel bestaat voor $x \\ge 0$, de afgeleide voor $x > 0$.",
      "Stap 1. $f(x) = x^{1/2}$. Het getal ervoor is $a = 1$ en de macht is $n = \\tfrac{1}{2}$.",
      "Stap 2. De macht $\\tfrac{1}{2}$ komt naar voren en wordt één lager: $\\tfrac{1}{2} - 1 = -\\tfrac{1}{2}$.",
      "Stap 3. $f'(x) = \\tfrac{1}{2} \\cdot 1 \\, x^{-1/2} = \\dfrac{1}{2\\sqrt{x}}$.",
    ],
    fout: "Je schrijft $\\dfrac{1}{\\sqrt{x}}$ en vergeet de $2$ in de noemer. De macht $\\tfrac{1}{2}$ blijft als factor staan.",
    oefenen: oefen("h6", "h6_machten", "wortelvorm"),
    theoriePad: HERSCHRIJVEN,
    theorieNaam: "Machten en wortels herschrijven",
    verwant: [
      "een-gedeeld-door-wortel-x",
      "wortel-2x-plus-1",
      "x-kwadraat",
      "een-gedeeld-door-x",
    ],
    examenbrug: true,
    f: (x) => Math.sqrt(x),
    df: (x) => 1 / (2 * Math.sqrt(x)),
    punten: [1, 4, 9],
  },
  {
    slug: "x-kwadraat",
    kop: "De afgeleide van x kwadraat",
    omschrijving:
      "Oefen gratis de afgeleide van x kwadraat: drie sommen zonder account, met stappenplan en een veelgemaakte fout.",
    antwoordTekst: "De afgeleide van x kwadraat is 2x.",
    functie: "x^2",
    antwoord: "2x",
    stappen: [
      "Stap 0. Er staat één macht van $x$. Dat is de machtsregel.",
      "Stap 1. $f(x) = x^2$. Het getal ervoor is $a = 1$ en de macht is $n = 2$.",
      "Stap 2. De macht $2$ komt naar voren en wordt één lager: $2 - 1 = 1$.",
      "Stap 3. $f'(x) = 2 \\cdot 1 \\, x^{1} = 2x$.",
    ],
    fout: "Je haalt de $2$ niet naar voren en schrijft $x$ in plaats van $2x$.",
    oefenen: oefen("h2", "h2_termsgewijs", "polynoom_differentieren"),
    theoriePad: MACHT,
    theorieNaam: "De machtsregel",
    verwant: [
      "x-tot-de-derde",
      "x-kwadraat-plus-3x",
      "wortel-x",
      "een-gedeeld-door-x",
    ],
    f: (x) => x * x,
    df: (x) => 2 * x,
    punten: [-2, 1, 3],
  },
  {
    slug: "x-tot-de-derde",
    kop: "De afgeleide van x tot de derde",
    omschrijving:
      "Oefen gratis de afgeleide van x tot de derde: drie sommen zonder account, met stappenplan en een veelgemaakte fout.",
    antwoordTekst: "De afgeleide van x tot de derde is 3x kwadraat.",
    functie: "x^3",
    antwoord: "3x^2",
    stappen: [
      "Stap 0. Er staat één macht van $x$. Dat is de machtsregel.",
      "Stap 1. $f(x) = x^3$. Het getal ervoor is $a = 1$ en de macht is $n = 3$.",
      "Stap 2. De macht $3$ komt naar voren en wordt één lager: $3 - 1 = 2$.",
      "Stap 3. $f'(x) = 3 \\cdot 1 \\, x^{2} = 3x^2$.",
    ],
    fout: "Je laat de macht op $3$ staan, of je schrijft $3x$ in plaats van $3x^2$.",
    oefenen: oefen("h2", "h2_termsgewijs", "polynoom_differentieren"),
    theoriePad: MACHT,
    theorieNaam: "De machtsregel",
    verwant: [
      "x-kwadraat",
      "twee-x-min-1-tot-de-derde",
      "x-kwadraat-plus-3x",
      "een-gedeeld-door-x-kwadraat",
    ],
    f: (x) => x ** 3,
    df: (x) => 3 * x * x,
    punten: [-2, 1, 2],
  },
  {
    slug: "x-kwadraat-plus-3x",
    kop: "De afgeleide van x kwadraat plus 3x",
    omschrijving:
      "Oefen gratis de afgeleide van x kwadraat plus 3x: drie sommen zonder account, met stappenplan en een veelgemaakte fout.",
    antwoordTekst: "De afgeleide van x kwadraat plus 3x is 2x plus 3.",
    functie: "x^2 + 3x",
    antwoord: "2x + 3",
    stappen: [
      "Stap 0. Er staat een plus tussen de termen. Dat is de somregel: elke term apart.",
      "Stap 1. $f(x) = g(x) + h(x)$ met $g(x) = x^2$ en $h(x) = 3x$.",
      "Stap 2. $g'(x) = 2x$ en $h'(x) = 3$.",
      "Stap 3. $f'(x) = 2x + 3$.",
    ],
    fout: "Je differentieert alleen de eerste term. De $3x$ wordt ook $3$.",
    oefenen: oefen("h2", "h2_termsgewijs", "polynoom_differentieren"),
    theoriePad: SOM,
    theorieNaam: "De somregel",
    verwant: ["x-kwadraat", "x-tot-de-derde", "een-gedeeld-door-x", "wortel-x"],
    f: (x) => x * x + 3 * x,
    df: (x) => 2 * x + 3,
    punten: [-1, 0, 2],
  },
  {
    slug: "twee-tot-de-x",
    kop: "De afgeleide van 2 tot de macht x",
    omschrijving:
      "Oefen gratis de afgeleide van 2 tot de macht x: drie sommen zonder account, met stappenplan en een veelgemaakte fout.",
    antwoordTekst:
      "De afgeleide van 2 tot de macht x is 2 tot de macht x keer de natuurlijke log van 2.",
    functie: "2^x",
    antwoord: "2^x \\cdot \\ln(2)",
    stappen: [
      "Stap 0. Het grondtal staat vast en de $x$ staat in de exponent. Schrijf het als een e-macht: $2^x = e^{x\\ln 2}$.",
      "Stap 1. $f(x) = g\\bigl(h(x)\\bigr)$ met $h(x) = x\\ln 2$ en $g$ de e-macht.",
      "Stap 2. $g'\\bigl(h(x)\\bigr) = e^{x\\ln 2} = 2^x$ en $h'(x) = \\ln 2$.",
      "Stap 3. $f'(x) = 2^x \\cdot \\ln 2$.",
    ],
    fout: "Je gebruikt de machtsregel en schrijft $x \\cdot 2^{x-1}$. Bij een vast grondtal blijft de functie staan en vermenigvuldig je met $\\ln$ van het grondtal.",
    oefenen: oefen("h9", "h9_logaritmes", "basis_gx_glog"),
    theoriePad: E_MACHT,
    theorieNaam: "E-machten",
    verwant: [
      "e-tot-de-x",
      "e-tot-de-2x",
      "e-tot-de-min-x",
      "e-tot-de-x-kwadraat",
    ],
    f: (x) => 2 ** x,
    df: (x) => 2 ** x * Math.log(2),
    punten: [-1, 0, 2],
  },
  {
    slug: "een-gedeeld-door-x",
    kop: "De afgeleide van 1 gedeeld door x",
    omschrijving:
      "Oefen gratis de afgeleide van 1 gedeeld door x: drie sommen zonder account, met stappenplan en een veelgemaakte fout.",
    antwoordTekst:
      "De afgeleide van 1 gedeeld door x is min 1 gedeeld door x kwadraat.",
    functie: "\\dfrac{1}{x}",
    antwoord: "-\\dfrac{1}{x^2}",
    stappen: [
      "Stap 0. Schrijf de breuk als een negatieve macht van $x$. Dat is de machtsregel. Dit mag voor $x \\ne 0$.",
      "Stap 1. $f(x) = x^{-1}$. Het getal ervoor is $a = 1$ en de macht is $n = -1$.",
      "Stap 2. De macht $-1$ komt naar voren en wordt één lager: $-1 - 1 = -2$.",
      "Stap 3. $f'(x) = -1 \\cdot 1 \\, x^{-2} = -\\dfrac{1}{x^2}$.",
    ],
    fout: "Je vergeet het minteken en schrijft $\\dfrac{1}{x^2}$.",
    oefenen: oefen("h6", "h6_machten", "negatieve_macht"),
    theoriePad: HERSCHRIJVEN,
    theorieNaam: "Machten en wortels herschrijven",
    verwant: [
      "een-gedeeld-door-x-kwadraat",
      "een-gedeeld-door-x-plus-1",
      "x-kwadraat",
      "een-gedeeld-door-wortel-x",
    ],
    examenbrug: true,
    faqUitgebreid: true,
    f: (x) => 1 / x,
    df: (x) => -1 / (x * x),
    punten: [-2, 0.5, 3],
  },
  {
    slug: "een-gedeeld-door-x-kwadraat",
    kop: "De afgeleide van 1 gedeeld door x kwadraat",
    omschrijving:
      "Oefen gratis de afgeleide van 1 gedeeld door x kwadraat: drie sommen zonder account, met stappenplan en een veelgemaakte fout.",
    antwoordTekst:
      "De afgeleide van 1 gedeeld door x kwadraat is min 2 gedeeld door x tot de derde.",
    functie: "\\dfrac{1}{x^2}",
    antwoord: "-\\dfrac{2}{x^3}",
    stappen: [
      "Stap 0. Schrijf de breuk als een negatieve macht. Dit mag voor $x \\ne 0$.",
      "Stap 1. $f(x) = x^{-2}$. Dus $h(x) = x$ en $g$ is tot de macht $-2$.",
      "Stap 2. $g'\\bigl(h(x)\\bigr) = -2x^{-3}$ en $h'(x) = 1$.",
      "Stap 3. $f'(x) = -2x^{-3} = -\\dfrac{2}{x^3}$.",
    ],
    fout: "Je laat de macht niet met $1$ dalen en schrijft $-\\dfrac{2}{x^2}$ in plaats van $-\\dfrac{2}{x^3}$.",
    oefenen: oefen("h6", "h6_machten", "negatieve_macht"),
    theoriePad: HERSCHRIJVEN,
    theorieNaam: "Machten en wortels herschrijven",
    verwant: [
      "een-gedeeld-door-x",
      "een-gedeeld-door-wortel-x",
      "x-tot-de-derde",
      "een-gedeeld-door-x-plus-1",
    ],
    f: (x) => 1 / (x * x),
    df: (x) => -2 / (x * x * x),
    punten: [-2, 1, 2],
  },
  {
    slug: "een-gedeeld-door-x-plus-1",
    kop: "De afgeleide van 1 gedeeld door x plus 1",
    omschrijving:
      "Oefen gratis de afgeleide van 1 gedeeld door (x + 1): drie sommen zonder account, met stappenplan en een veelgemaakte fout.",
    antwoordTekst:
      "De afgeleide van 1 gedeeld door (x + 1) is min 1 gedeeld door (x + 1) kwadraat.",
    functie: "\\dfrac{1}{x+1}",
    antwoord: "-\\dfrac{1}{(x+1)^2}",
    stappen: [
      "Stap 0. De buitenste schil is een breuk, of een macht $-1$. Daarin staat $x+1$. Dat is de kettingregel. Dit mag voor $x \\ne -1$.",
      "Stap 1. $f(x) = \\bigl(h(x)\\bigr)^{-1}$ met $h(x) = x+1$. De buitenste functie $g$ is tot de macht $-1$.",
      "Stap 2. $g'\\bigl(h(x)\\bigr) = -(x+1)^{-2}$ en $h'(x) = 1$.",
      "Stap 3. $f'(x) = -(x+1)^{-2} \\cdot 1 = -\\dfrac{1}{(x+1)^2}$.",
    ],
    fout: "Je vergeet het minteken, of je differentieert alsof er alleen $x$ in de noemer staat.",
    oefenen: oefen("h6", "h6_kettingregel", "negatieve_macht_expressie"),
    theoriePad: KETTING,
    theorieNaam: "De kettingregel",
    verwant: [
      "een-gedeeld-door-x",
      "twee-x-min-1-tot-de-derde",
      "een-gedeeld-door-x-kwadraat",
      "wortel-2x-plus-1",
    ],
    f: (x) => 1 / (x + 1),
    df: (x) => -1 / (x + 1) ** 2,
    punten: [-3, 0, 2],
  },
  {
    slug: "wortel-2x-plus-1",
    kop: "De afgeleide van wortel(2x+1)",
    omschrijving:
      "Oefen gratis de afgeleide van de wortel van (2x + 1): drie sommen zonder account, met stappenplan en een veelgemaakte fout.",
    antwoordTekst:
      "De afgeleide van de wortel van (2x + 1) is 1 gedeeld door de wortel van (2x + 1).",
    functie: "\\sqrt{2x+1}",
    antwoord: "\\dfrac{1}{\\sqrt{2x+1}}",
    stappen: [
      "Stap 0. De buitenste schil is een wortel. Daarin staat $2x+1$. Dat is de kettingregel. De wortel bestaat als $2x+1 \\ge 0$, de afgeleide als $2x+1 > 0$.",
      "Stap 1. Schrijf de wortel als macht: $f(x) = (2x+1)^{1/2}$. Dus $h(x) = 2x+1$ en $g$ is tot de macht $\\tfrac{1}{2}$.",
      "Stap 2. $g'\\bigl(h(x)\\bigr) = \\tfrac{1}{2}(2x+1)^{-1/2}$ en $h'(x) = 2$.",
      "Stap 3. $f'(x) = \\tfrac{1}{2}(2x+1)^{-1/2} \\cdot 2 = \\dfrac{1}{\\sqrt{2x+1}}$.",
    ],
    fout: "Je vergeet met de afgeleide van $2x+1$ te vermenigvuldigen. Die $2$ valt weg tegen de $\\tfrac{1}{2}$, dus hij hoort er wel in de tussenstap.",
    oefenen: oefen("h6", "h6_kettingregel", "wortel_lineair"),
    theoriePad: KETTING,
    theorieNaam: "De kettingregel",
    verwant: [
      "wortel-x",
      "wortel-x-kwadraat-plus-1",
      "een-gedeeld-door-x-plus-1",
      "twee-x-min-1-tot-de-derde",
    ],
    f: (x) => Math.sqrt(2 * x + 1),
    df: (x) => 1 / Math.sqrt(2 * x + 1),
    punten: [0, 1.5, 4],
  },
  {
    slug: "wortel-x-kwadraat-plus-1",
    kop: "De afgeleide van wortel(x^2+1)",
    omschrijving:
      "Oefen gratis de afgeleide van de wortel van (x kwadraat + 1): drie sommen zonder account, met stappenplan en een veelgemaakte fout.",
    antwoordTekst:
      "De afgeleide van de wortel van (x kwadraat + 1) is x gedeeld door die wortel.",
    functie: "\\sqrt{x^2+1}",
    antwoord: "\\dfrac{x}{\\sqrt{x^2+1}}",
    stappen: [
      "Stap 0. De buitenste schil is een wortel. Daarin staat $x^2+1$. Dat is de kettingregel. Dit bestaat voor elke $x$, want $x^2+1 > 0$.",
      "Stap 1. $f(x) = (x^2+1)^{1/2}$. Dus $h(x) = x^2+1$ en $g$ is tot de macht $\\tfrac{1}{2}$.",
      "Stap 2. $g'\\bigl(h(x)\\bigr) = \\tfrac{1}{2}(x^2+1)^{-1/2}$ en $h'(x) = 2x$.",
      "Stap 3. $f'(x) = \\tfrac{1}{2}(x^2+1)^{-1/2} \\cdot 2x = \\dfrac{x}{\\sqrt{x^2+1}}$.",
    ],
    fout: "Je zet de $2x$ in de noemer in plaats van in de teller.",
    oefenen: oefen("h6", "h6_kettingregel", "wortel_polynoom"),
    theoriePad: KETTING,
    theorieNaam: "De kettingregel",
    verwant: [
      "wortel-2x-plus-1",
      "ln-x-kwadraat-plus-1",
      "x-kwadraat-plus-1-tot-de-vierde",
      "een-gedeeld-door-wortel-x",
    ],
    f: (x) => Math.sqrt(x * x + 1),
    df: (x) => x / Math.sqrt(x * x + 1),
    punten: [-2, 0, 3],
  },
  {
    slug: "een-gedeeld-door-wortel-x",
    kop: "De afgeleide van 1 gedeeld door wortel x",
    omschrijving:
      "Oefen gratis de afgeleide van 1 gedeeld door wortel x: drie sommen zonder account, met stappenplan en een veelgemaakte fout.",
    antwoordTekst:
      "De afgeleide van 1 gedeeld door wortel x is min 1 gedeeld door 2x wortel x.",
    functie: "\\dfrac{1}{\\sqrt{x}}",
    antwoord: "-\\dfrac{1}{2x\\sqrt{x}}",
    stappen: [
      "Stap 0. Schrijf de breuk als een macht. Dit mag voor $x > 0$.",
      "Stap 1. $f(x) = x^{-1/2}$. Dus $h(x) = x$ en $g$ is tot de macht $-\\tfrac{1}{2}$.",
      "Stap 2. $g'\\bigl(h(x)\\bigr) = -\\tfrac{1}{2}x^{-3/2}$ en $h'(x) = 1$.",
      "Stap 3. $f'(x) = -\\tfrac{1}{2}x^{-3/2} = -\\dfrac{1}{2x\\sqrt{x}}$.",
    ],
    fout: "Je vergeet het minteken. De macht $-\\tfrac{1}{2}$ daalt naar $-\\tfrac{3}{2}$, dus de afgeleide is negatief voor $x > 0$.",
    oefenen: oefen("h6", "h6_machten", "wortelvorm"),
    theoriePad: HERSCHRIJVEN,
    theorieNaam: "Machten en wortels herschrijven",
    verwant: [
      "wortel-x",
      "een-gedeeld-door-x",
      "een-gedeeld-door-x-kwadraat",
      "wortel-2x-plus-1",
    ],
    f: (x) => 1 / Math.sqrt(x),
    df: (x) => -1 / (2 * x * Math.sqrt(x)),
    punten: [1, 4, 9],
  },
  {
    slug: "twee-x-min-1-tot-de-derde",
    kop: "De afgeleide van (2x-1)^3",
    omschrijving:
      "Oefen gratis de afgeleide van (2x min 1) tot de derde: drie sommen zonder account, met stappenplan en een veelgemaakte fout.",
    antwoordTekst:
      "De afgeleide van (2x min 1) tot de derde is 6 keer (2x min 1) kwadraat.",
    functie: "(2x-1)^3",
    antwoord: "6(2x-1)^2",
    stappen: [
      "Stap 0. De buitenste schil is een derde macht. Daarin staat $2x-1$. Dat is de kettingregel.",
      "Stap 1. $h(x) = 2x-1$ en $g$ is tot de macht $3$, dus $f(x) = \\bigl(h(x)\\bigr)^3$.",
      "Stap 2. $g'\\bigl(h(x)\\bigr) = 3(2x-1)^2$ en $h'(x) = 2$.",
      "Stap 3. $f'(x) = 3(2x-1)^2 \\cdot 2 = 6(2x-1)^2$.",
    ],
    fout: "Je schrijft $3(2x-1)^2$ en vergeet keer $2$.",
    oefenen: oefen("h6", "h6_kettingregel", "macht_lineair"),
    theoriePad: KETTING,
    theorieNaam: "De kettingregel",
    verwant: [
      "x-kwadraat-plus-1-tot-de-vierde",
      "een-gedeeld-door-x-plus-1",
      "wortel-2x-plus-1",
      "x-tot-de-derde",
    ],
    f: (x) => (2 * x - 1) ** 3,
    df: (x) => 6 * (2 * x - 1) ** 2,
    punten: [0, 1, 2],
  },
  {
    slug: "x-kwadraat-plus-1-tot-de-vierde",
    kop: "De afgeleide van (x^2+1)^4",
    omschrijving:
      "Oefen gratis de afgeleide van (x kwadraat + 1) tot de vierde: drie sommen zonder account, met stappenplan en een veelgemaakte fout.",
    antwoordTekst:
      "De afgeleide van (x kwadraat + 1) tot de vierde is 8x keer (x kwadraat + 1) tot de derde.",
    functie: "(x^2+1)^4",
    antwoord: "8x(x^2+1)^3",
    stappen: [
      "Stap 0. De buitenste schil is een vierde macht. Daarin staat $x^2+1$. Dat is de kettingregel.",
      "Stap 1. $h(x) = x^2+1$ en $g$ is tot de macht $4$, dus $f(x) = \\bigl(h(x)\\bigr)^4$.",
      "Stap 2. $g'\\bigl(h(x)\\bigr) = 4(x^2+1)^3$ en $h'(x) = 2x$.",
      "Stap 3. $f'(x) = 4(x^2+1)^3 \\cdot 2x = 8x(x^2+1)^3$.",
    ],
    fout: "Je vergeet de binnenste afgeleide $2x$ en schrijft alleen $4(x^2+1)^3$.",
    oefenen: oefen("h6", "h6_kettingregel", "macht_polynoom"),
    theoriePad: KETTING,
    theorieNaam: "De kettingregel",
    verwant: [
      "twee-x-min-1-tot-de-derde",
      "wortel-x-kwadraat-plus-1",
      "een-gedeeld-door-x-plus-1",
      "wortel-2x-plus-1",
    ],
    f: (x) => (x * x + 1) ** 4,
    df: (x) => 8 * x * (x * x + 1) ** 3,
    punten: [-1, 0, 1],
  },
  {
    slug: "e-tot-de-x",
    kop: "De afgeleide van e tot de macht x",
    omschrijving:
      "Oefen gratis de afgeleide van e tot de macht x: drie sommen zonder account, met stappenplan en een veelgemaakte fout.",
    antwoordTekst: "De afgeleide van e tot de macht x is e tot de macht x.",
    functie: "e^x",
    antwoord: "e^x",
    stappen: [
      "Stap 0. Er staat alleen $e^x$. Dat is een standaardafgeleide: die ken je uit je hoofd.",
      "Stap 1. $f(x) = e^x$. In de exponent staat alleen $x$.",
      "Stap 2. De regel voor e-machten: $e^x$ blijft bij differentiëren $e^x$.",
      "Stap 3. $f'(x) = e^x$.",
    ],
    fout: "Je gebruikt de machtsregel en schrijft $x \\cdot e^{x-1}$. De afgeleide van $e^x$ is $e^x$ zelf.",
    oefenen: oefen("h9", "h9_e_machten", "basis_ex"),
    theoriePad: E_MACHT,
    theorieNaam: "E-machten",
    verwant: [
      "e-tot-de-2x",
      "twee-tot-de-x",
      "e-tot-de-min-x",
      "x-keer-e-tot-de-x",
    ],
    examenbrug: true,
    faqUitgebreid: true,
    f: (x) => Math.exp(x),
    df: (x) => Math.exp(x),
    punten: [-1, 0, 1],
  },
  {
    slug: "e-tot-de-2x",
    kop: "De afgeleide van e tot de macht 2x",
    omschrijving:
      "Oefen gratis de afgeleide van e tot de macht 2x: drie sommen zonder account, met stappenplan en een veelgemaakte fout.",
    antwoordTekst:
      "De afgeleide van e tot de macht 2x is 2 keer e tot de macht 2x.",
    functie: "e^{2x}",
    antwoord: "2e^{2x}",
    stappen: [
      "Stap 0. De buitenste schil is een e-macht. Daarin staat $2x$. Dat is de kettingregel.",
      "Stap 1. $h(x) = 2x$ en $g$ is de e-macht, dus $f(x) = e^{h(x)}$.",
      "Stap 2. $g'\\bigl(h(x)\\bigr) = e^{2x}$ en $h'(x) = 2$.",
      "Stap 3. $f'(x) = e^{2x} \\cdot 2 = 2e^{2x}$.",
    ],
    fout: "Je vergeet keer $2$, of je schrijft $2x \\cdot e^{2x-1}$.",
    oefenen: oefen("h9", "h9_e_machten", "ketting_lineair"),
    theoriePad: E_MACHT,
    theorieNaam: "E-machten",
    verwant: [
      "e-tot-de-x",
      "e-tot-de-min-x",
      "e-tot-de-x-kwadraat",
      "twee-tot-de-x",
    ],
    f: (x) => Math.exp(2 * x),
    df: (x) => 2 * Math.exp(2 * x),
    punten: [-1, 0, 0.5],
  },
  {
    slug: "e-tot-de-x-kwadraat",
    kop: "De afgeleide van e tot de macht x kwadraat",
    omschrijving:
      "Oefen gratis de afgeleide van e tot de macht x kwadraat: drie sommen zonder account, met stappenplan en een veelgemaakte fout.",
    antwoordTekst:
      "De afgeleide van e tot de macht x kwadraat is 2x keer e tot de macht x kwadraat.",
    functie: "e^{x^2}",
    antwoord: "2xe^{x^2}",
    stappen: [
      "Stap 0. De buitenste schil is een e-macht. Daarin staat $x^2$. Dat is de kettingregel.",
      "Stap 1. $h(x) = x^2$ en $g$ is de e-macht, dus $f(x) = e^{h(x)}$.",
      "Stap 2. $g'\\bigl(h(x)\\bigr) = e^{x^2}$ en $h'(x) = 2x$.",
      "Stap 3. $f'(x) = e^{x^2} \\cdot 2x = 2xe^{x^2}$.",
    ],
    fout: "Je schrijft $e^{x^2}$ en vergeet keer $2x$.",
    oefenen: oefen("h9", "h9_e_machten", "ketting_polynoom"),
    theoriePad: E_MACHT,
    theorieNaam: "E-machten",
    verwant: ["e-tot-de-2x", "sin-x-kwadraat", "e-tot-de-x", "e-tot-de-min-x"],
    f: (x) => Math.exp(x * x),
    df: (x) => 2 * x * Math.exp(x * x),
    punten: [-0.5, 0, 0.5],
  },
  {
    slug: "e-tot-de-min-x",
    kop: "De afgeleide van e tot de macht min x",
    omschrijving:
      "Oefen gratis de afgeleide van e tot de macht min x: drie sommen zonder account, met stappenplan en een veelgemaakte fout.",
    antwoordTekst:
      "De afgeleide van e tot de macht min x is min e tot de macht min x.",
    functie: "e^{-x}",
    antwoord: "-e^{-x}",
    stappen: [
      "Stap 0. De buitenste schil is een e-macht. Daarin staat $-x$. Dat is de kettingregel.",
      "Stap 1. $h(x) = -x$ en $g$ is de e-macht, dus $f(x) = e^{h(x)}$.",
      "Stap 2. $g'\\bigl(h(x)\\bigr) = e^{-x}$ en $h'(x) = -1$.",
      "Stap 3. $f'(x) = e^{-x} \\cdot (-1) = -e^{-x}$.",
    ],
    fout: "Je vergeet het minteken van de exponent en schrijft $e^{-x}$.",
    oefenen: oefen("h9", "h9_e_machten", "ketting_lineair"),
    theoriePad: E_MACHT,
    theorieNaam: "E-machten",
    verwant: [
      "e-tot-de-x",
      "e-tot-de-2x",
      "twee-tot-de-x",
      "e-tot-de-x-kwadraat",
    ],
    f: (x) => Math.exp(-x),
    df: (x) => -Math.exp(-x),
    punten: [-1, 0, 1],
  },
  {
    slug: "x-keer-e-tot-de-x",
    kop: "De afgeleide van x keer e^x",
    omschrijving:
      "Oefen gratis de afgeleide van x keer e tot de macht x: drie sommen zonder account, met stappenplan en een veelgemaakte fout.",
    antwoordTekst:
      "De afgeleide van x keer e tot de macht x is e tot de macht x keer (x + 1).",
    functie: "x \\cdot e^x",
    antwoord: "e^x(x+1)",
    stappen: [
      "Stap 0. Er staat een keerteken tussen $x$ en $e^x$. Dat is de productregel.",
      "Stap 1. $f(x) = g(x) \\cdot h(x)$ met $g(x) = x$ en $h(x) = e^x$.",
      "Stap 2. $g'(x) = 1$ en $h'(x) = e^x$.",
      "Stap 3. $f'(x) = 1 \\cdot e^x + x \\cdot e^x = e^x(x+1)$.",
    ],
    fout: "Je differentieert maar één factor. Bij een product doen beide factoren mee.",
    oefenen: oefen("h9", "h9_e_machten", "e_plus_product"),
    theoriePad: PRODUCT,
    theorieNaam: "De productregel",
    verwant: ["e-tot-de-x", "x-keer-ln-x", "x-keer-sin-x", "e-tot-de-2x"],
    f: (x) => x * Math.exp(x),
    df: (x) => Math.exp(x) * (x + 1),
    punten: [-1, 0, 1],
  },
  {
    slug: "ln-x",
    kop: "De afgeleide van ln x",
    omschrijving:
      "Oefen gratis de afgeleide van ln x: drie sommen zonder account, met stappenplan en een veelgemaakte fout.",
    antwoordTekst: "De afgeleide van ln(x) is 1 gedeeld door x.",
    functie: "\\ln(x)",
    antwoord: "\\dfrac{1}{x}",
    stappen: [
      "Stap 0. Er staat alleen $\\ln(x)$. Dat is een standaardafgeleide: die ken je uit je hoofd. Dit mag voor $x > 0$.",
      "Stap 1. $f(x) = \\ln(x)$. Tussen de haakjes staat alleen $x$.",
      "Stap 2. De regel voor de natuurlijke logaritme: $\\ln(x)$ geeft $\\dfrac{1}{x}$.",
      "Stap 3. $f'(x) = \\dfrac{1}{x}$.",
    ],
    fout: "Je schrijft $\\dfrac{1}{\\ln(x)}$ of $\\ln(x)$ zelf. De afgeleide is $\\dfrac{1}{x}$.",
    oefenen: oefen("h9", "h9_logaritmes", "basis_ln"),
    theoriePad: LN,
    theorieNaam: "Logaritmes",
    verwant: ["ln-2x", "ln-x-kwadraat", "x-keer-ln-x", "ln-x-kwadraat-plus-1"],
    examenbrug: true,
    faqUitgebreid: true,
    typVorm: "lnx",
    f: (x) => Math.log(x),
    df: (x) => 1 / x,
    punten: [0.5, 1, Math.E],
  },
  {
    slug: "ln-2x",
    kop: "De afgeleide van ln 2x",
    omschrijving:
      "Oefen gratis de afgeleide van ln 2x: drie sommen zonder account, met stappenplan en een veelgemaakte fout.",
    antwoordTekst: "De afgeleide van ln(2x) is 1 gedeeld door x.",
    functie: "\\ln(2x)",
    antwoord: "\\dfrac{1}{x}",
    stappen: [
      "Stap 0. De buitenste schil is een natuurlijke logaritme. Daarin staat $2x$. Dat is de kettingregel. Dit mag voor $x > 0$.",
      "Stap 1. $h(x) = 2x$ en $g$ is de natuurlijke logaritme, dus $f(x) = \\ln\\bigl(h(x)\\bigr)$.",
      "Stap 2. $g'\\bigl(h(x)\\bigr) = \\dfrac{1}{2x}$ en $h'(x) = 2$.",
      "Stap 3. $f'(x) = \\dfrac{1}{2x} \\cdot 2 = \\dfrac{1}{x}$.",
    ],
    fout: "Je schrijft $\\dfrac{1}{2x}$ en vergeet keer $2$. Die $2$ valt weg, dus je houdt $\\dfrac{1}{x}$ over.",
    oefenen: oefen("h9", "h9_logaritmes", "ln_ketting"),
    theoriePad: LN,
    theorieNaam: "Logaritmes",
    verwant: ["ln-x", "ln-x-kwadraat-plus-1", "ln-x-kwadraat", "x-keer-ln-x"],
    f: (x) => Math.log(2 * x),
    df: (x) => 1 / x,
    punten: [0.5, 1, 2],
  },
  {
    slug: "ln-x-kwadraat-plus-1",
    kop: "De afgeleide van ln van x kwadraat plus 1",
    omschrijving:
      "Oefen gratis de afgeleide van ln van (x kwadraat + 1): drie sommen zonder account, met stappenplan en een veelgemaakte fout.",
    antwoordTekst:
      "De afgeleide van ln van (x kwadraat + 1) is 2x gedeeld door (x kwadraat + 1).",
    functie: "\\ln(x^2+1)",
    antwoord: "\\dfrac{2x}{x^2+1}",
    stappen: [
      "Stap 0. De buitenste schil is een natuurlijke logaritme. Daarin staat $x^2+1$. Dat is de kettingregel. Dit mag voor elke $x$, want $x^2+1 > 0$.",
      "Stap 1. $h(x) = x^2+1$ en $g$ is de natuurlijke logaritme, dus $f(x) = \\ln\\bigl(h(x)\\bigr)$.",
      "Stap 2. $g'\\bigl(h(x)\\bigr) = \\dfrac{1}{x^2+1}$ en $h'(x) = 2x$.",
      "Stap 3. $f'(x) = \\dfrac{1}{x^2+1} \\cdot 2x = \\dfrac{2x}{x^2+1}$.",
    ],
    fout: "Je schrijft $\\dfrac{1}{x^2+1}$ en vergeet de binnenste afgeleide $2x$ in de teller.",
    oefenen: oefen("h9", "h9_logaritmes", "ln_ketting"),
    theoriePad: LN,
    theorieNaam: "Logaritmes",
    verwant: ["ln-x", "wortel-x-kwadraat-plus-1", "ln-2x", "ln-x-kwadraat"],
    f: (x) => Math.log(x * x + 1),
    df: (x) => (2 * x) / (x * x + 1),
    punten: [-2, 0, 1],
  },
  {
    slug: "ln-x-kwadraat",
    kop: "De afgeleide van ln van x kwadraat",
    omschrijving:
      "Oefen gratis de afgeleide van ln van x kwadraat: drie sommen zonder account, met stappenplan en een veelgemaakte fout.",
    antwoordTekst: "De afgeleide van ln van x kwadraat is 2 gedeeld door x.",
    functie: "\\ln(x^2)",
    antwoord: "\\dfrac{2}{x}",
    stappen: [
      "Stap 0. De buitenste schil is een natuurlijke logaritme. Daarin staat $x^2$. Dat is de kettingregel. Dit mag voor $x \\ne 0$.",
      "Stap 1. $h(x) = x^2$ en $g$ is de natuurlijke logaritme, dus $f(x) = \\ln\\bigl(h(x)\\bigr)$.",
      "Stap 2. $g'\\bigl(h(x)\\bigr) = \\dfrac{1}{x^2}$ en $h'(x) = 2x$.",
      "Stap 3. $f'(x) = \\dfrac{1}{x^2} \\cdot 2x = \\dfrac{2}{x}$.",
    ],
    fout: "Je schrijft $\\dfrac{1}{x^2}$. De binnenste afgeleide is $2x$, en die deelt $x^2$ tot $\\dfrac{2}{x}$.",
    oefenen: oefen("h9", "h9_logaritmes", "ln_ketting"),
    theoriePad: LN,
    theorieNaam: "Logaritmes",
    verwant: ["ln-x", "ln-x-kwadraat-plus-1", "ln-2x", "x-keer-ln-x"],
    f: (x) => Math.log(x * x),
    df: (x) => 2 / x,
    punten: [-2, -1, 1, 3],
  },
  {
    slug: "x-keer-ln-x",
    kop: "De afgeleide van x keer ln x",
    omschrijving:
      "Oefen gratis de afgeleide van x keer ln x: drie sommen zonder account, met stappenplan en een veelgemaakte fout.",
    antwoordTekst: "De afgeleide van x keer ln(x) is ln(x) plus 1.",
    functie: "x \\cdot \\ln(x)",
    antwoord: "\\ln(x) + 1",
    stappen: [
      "Stap 0. Er staat een keerteken tussen $x$ en $\\ln(x)$. Dat is de productregel. Dit mag voor $x > 0$.",
      "Stap 1. $f(x) = g(x) \\cdot h(x)$ met $g(x) = x$ en $h(x) = \\ln(x)$.",
      "Stap 2. $g'(x) = 1$ en $h'(x) = \\dfrac{1}{x}$.",
      "Stap 3. $f'(x) = 1 \\cdot \\ln(x) + x \\cdot \\dfrac{1}{x} = \\ln(x) + 1$.",
    ],
    fout: "Je schrijft alleen $\\ln(x)$ of alleen $1$. Het is $\\ln(x) + 1$.",
    oefenen: oefen("h9", "h9_logaritmes", "ln_plus_product"),
    theoriePad: PRODUCT,
    theorieNaam: "De productregel",
    verwant: ["ln-x", "x-keer-e-tot-de-x", "x-keer-sin-x", "ln-2x"],
    f: (x) => x * Math.log(x),
    df: (x) => Math.log(x) + 1,
    punten: [0.5, 1, Math.E],
  },
  {
    slug: "sin-x",
    kop: "De afgeleide van sin x",
    omschrijving:
      "Oefen gratis de afgeleide van sin x: drie sommen zonder account, met stappenplan en een veelgemaakte fout.",
    antwoordTekst: "De afgeleide van sin(x) is cos(x).",
    functie: "\\sin(x)",
    antwoord: "\\cos(x)",
    stappen: [
      "Stap 0. Er staat alleen $\\sin(x)$. Dat is een standaardafgeleide: die ken je uit je hoofd.",
      "Stap 1. $f(x) = \\sin(x)$. Tussen de haakjes staat alleen $x$.",
      "Stap 2. De basisformule voor goniometrie: $\\sin(x)$ geeft $\\cos(x)$.",
      "Stap 3. $f'(x) = \\cos(x)$.",
    ],
    fout: "Je zet er een min voor, zoals bij de cosinus. De afgeleide van $\\sin(x)$ is $\\cos(x)$, zonder min.",
    oefenen: oefen("h7", "h7_goniometrie_diff", "basis_sin_cos"),
    theoriePad: GONIO,
    theorieNaam: "Basisformules goniometrie",
    verwant: ["cos-x", "sin-3x", "tan-x", "sin-x-kwadraat"],
    examenbrug: true,
    faqUitgebreid: true,
    typVorm: "sinx",
    f: (x) => Math.sin(x),
    df: (x) => Math.cos(x),
    punten: [0, 0.5, 1],
  },
  {
    slug: "cos-x",
    kop: "De afgeleide van cos x",
    omschrijving:
      "Oefen gratis de afgeleide van cos x: drie sommen zonder account, met stappenplan en een veelgemaakte fout.",
    antwoordTekst: "De afgeleide van cos(x) is min sin(x).",
    functie: "\\cos(x)",
    antwoord: "-\\sin(x)",
    stappen: [
      "Stap 0. Er staat alleen $\\cos(x)$. Dat is een standaardafgeleide: die ken je uit je hoofd.",
      "Stap 1. $f(x) = \\cos(x)$. Tussen de haakjes staat alleen $x$.",
      "Stap 2. De basisformule voor goniometrie: $\\cos(x)$ geeft $-\\sin(x)$. Let op het minteken.",
      "Stap 3. $f'(x) = -\\sin(x)$.",
    ],
    fout: "Je vergeet het minteken. De afgeleide van $\\cos(x)$ is $-\\sin(x)$.",
    oefenen: oefen("h7", "h7_goniometrie_diff", "basis_sin_cos"),
    theoriePad: GONIO,
    theorieNaam: "Basisformules goniometrie",
    verwant: ["sin-x", "cos-2x", "tan-x", "sin-3x"],
    examenbrug: true,
    faqUitgebreid: true,
    typVorm: "cosx",
    f: (x) => Math.cos(x),
    df: (x) => -Math.sin(x),
    punten: [0, 0.5, 1],
  },
  {
    slug: "sin-3x",
    kop: "De afgeleide van sin 3x",
    omschrijving:
      "Oefen gratis de afgeleide van sin 3x: drie sommen zonder account, met stappenplan en een veelgemaakte fout.",
    antwoordTekst: "De afgeleide van sin(3x) is 3 cos(3x).",
    functie: "\\sin(3x)",
    antwoord: "3\\cos(3x)",
    stappen: [
      "Stap 0. De buitenste schil is een sinus. Daarin staat $3x$. Dat is de kettingregel.",
      "Stap 1. $h(x) = 3x$ en $g$ is de sinus, dus $f(x) = \\sin\\bigl(h(x)\\bigr)$.",
      "Stap 2. $g'\\bigl(h(x)\\bigr) = \\cos(3x)$ en $h'(x) = 3$.",
      "Stap 3. $f'(x) = \\cos(3x) \\cdot 3 = 3\\cos(3x)$.",
    ],
    fout: "Je schrijft $\\cos(3x)$ en vergeet keer $3$.",
    oefenen: oefen("h7", "h7_goniometrie_diff", "ketting_lineair"),
    theoriePad: GONIO_KETTING,
    theorieNaam: "Kettingregel met goniometrie",
    verwant: ["sin-x", "cos-2x", "sin-x-kwadraat", "x-keer-sin-x"],
    f: (x) => Math.sin(3 * x),
    df: (x) => 3 * Math.cos(3 * x),
    punten: [0, 0.2, 0.5],
  },
  {
    slug: "cos-2x",
    kop: "De afgeleide van cos 2x",
    omschrijving:
      "Oefen gratis de afgeleide van cos 2x: drie sommen zonder account, met stappenplan en een veelgemaakte fout.",
    antwoordTekst: "De afgeleide van cos(2x) is min 2 sin(2x).",
    functie: "\\cos(2x)",
    antwoord: "-2\\sin(2x)",
    stappen: [
      "Stap 0. De buitenste schil is een cosinus. Daarin staat $2x$. Dat is de kettingregel.",
      "Stap 1. $h(x) = 2x$ en $g$ is de cosinus, dus $f(x) = \\cos\\bigl(h(x)\\bigr)$.",
      "Stap 2. $g'\\bigl(h(x)\\bigr) = -\\sin(2x)$ en $h'(x) = 2$.",
      "Stap 3. $f'(x) = -\\sin(2x) \\cdot 2 = -2\\sin(2x)$.",
    ],
    fout: "Je vergeet het minteken of de factor $2$.",
    oefenen: oefen("h7", "h7_goniometrie_diff", "ketting_lineair"),
    theoriePad: GONIO_KETTING,
    theorieNaam: "Kettingregel met goniometrie",
    verwant: ["cos-x", "sin-3x", "sin-x-kwadraat", "x-keer-sin-x"],
    f: (x) => Math.cos(2 * x),
    df: (x) => -2 * Math.sin(2 * x),
    punten: [0, 0.3, 0.7],
  },
  {
    slug: "tan-x",
    kop: "De afgeleide van tan(x)",
    omschrijving:
      "Oefen gratis de afgeleide van tan x: drie sommen zonder account, met stappenplan en een veelgemaakte fout.",
    antwoordTekst:
      "De afgeleide van tan(x) is 1 gedeeld door cosinus kwadraat x.",
    functie: "\\tan(x)",
    antwoord: "\\dfrac{1}{\\cos^2(x)}",
    stappen: [
      "Stap 0. Er staat alleen $\\tan(x)$. Dat is een standaardafgeleide: die ken je uit je hoofd. Dit mag als $\\cos(x) \\ne 0$.",
      "Stap 1. $f(x) = \\tan(x)$. Tussen de haakjes staat alleen $x$.",
      "Stap 2. De basisformule voor goniometrie: $\\tan(x)$ geeft $\\dfrac{1}{\\cos^2(x)}$.",
      "Stap 3. $f'(x) = \\dfrac{1}{\\cos^2(x)}$.",
    ],
    fout: "Je schrijft $\\dfrac{1}{\\sin^2(x)}$. Het is $\\dfrac{1}{\\cos^2(x)}$.",
    oefenen: oefen("h7", "h7_goniometrie_diff", "basis_tan"),
    theoriePad: GONIO,
    theorieNaam: "Basisformules goniometrie",
    verwant: ["sin-x", "cos-x", "sin-3x", "cos-2x"],
    f: (x) => Math.tan(x),
    df: (x) => 1 / Math.cos(x) ** 2,
    punten: [0, 0.3, -0.4],
  },
  {
    slug: "sin-x-kwadraat",
    kop: "De afgeleide van sin van x kwadraat",
    omschrijving:
      "Oefen gratis de afgeleide van sin van x kwadraat: drie sommen zonder account, met stappenplan en een veelgemaakte fout.",
    antwoordTekst:
      "De afgeleide van sin van x kwadraat is 2x keer cos van x kwadraat.",
    functie: "\\sin(x^2)",
    antwoord: "2x\\cos(x^2)",
    stappen: [
      "Stap 0. De buitenste schil is een sinus. Daarin staat $x^2$. Dat is de kettingregel.",
      "Stap 1. $h(x) = x^2$ en $g$ is de sinus, dus $f(x) = \\sin\\bigl(h(x)\\bigr)$.",
      "Stap 2. $g'\\bigl(h(x)\\bigr) = \\cos(x^2)$ en $h'(x) = 2x$.",
      "Stap 3. $f'(x) = \\cos(x^2) \\cdot 2x = 2x\\cos(x^2)$.",
    ],
    fout: "Je schrijft $\\cos(2x)$ of $\\cos(x^2)$ zonder de $2x$.",
    oefenen: oefen("h7", "h7_goniometrie_diff", "ketting_polynoom"),
    theoriePad: GONIO_KETTING,
    theorieNaam: "Kettingregel met goniometrie",
    verwant: ["sin-x", "e-tot-de-x-kwadraat", "sin-3x", "x-keer-sin-x"],
    f: (x) => Math.sin(x * x),
    df: (x) => 2 * x * Math.cos(x * x),
    punten: [-0.5, 0, 0.8],
  },
  {
    slug: "x-keer-sin-x",
    kop: "De afgeleide van x keer sin x",
    omschrijving:
      "Oefen gratis de afgeleide van x keer sin x: drie sommen zonder account, met stappenplan en een veelgemaakte fout.",
    antwoordTekst:
      "De afgeleide van x keer sin(x) is sin(x) plus x keer cos(x).",
    functie: "x \\cdot \\sin(x)",
    antwoord: "\\sin(x) + x\\cos(x)",
    stappen: [
      "Stap 0. Er staat een keerteken tussen $x$ en $\\sin(x)$. Dat is de productregel.",
      "Stap 1. $f(x) = g(x) \\cdot h(x)$ met $g(x) = x$ en $h(x) = \\sin(x)$.",
      "Stap 2. $g'(x) = 1$ en $h'(x) = \\cos(x)$.",
      "Stap 3. $f'(x) = 1 \\cdot \\sin(x) + x \\cdot \\cos(x) = \\sin(x) + x\\cos(x)$.",
    ],
    fout: "Je schrijft alleen $x\\cos(x)$. De productregel heeft ook $\\sin(x)$ erbij.",
    oefenen: oefen("h7", "h7_goniometrie_diff", "gonio_plus_product"),
    theoriePad: PRODUCT,
    theorieNaam: "De productregel",
    verwant: ["sin-x", "x-keer-e-tot-de-x", "x-keer-ln-x", "sin-3x"],
    f: (x) => x * Math.sin(x),
    df: (x) => Math.sin(x) + x * Math.cos(x),
    punten: [-1, 0, 1.2],
  },
];

const OP_SLUG = new Map(
  VOORBEELDEN.map((voorbeeld) => [voorbeeld.slug, voorbeeld]),
);

export function voorbeeldPad(slug: string): string {
  return `/voorbeeld/${slug}`;
}

/**
 * Titel voor `<title>` en `og:title`: de kop zonder "De" ervoor, met
 * "oefenen" erachter. Leerlingen zoeken op "afgeleide ln x", niet op "de
 * afgeleide van", en een naslagkaart-titel wint geen klik naast "oefenen".
 * De kop zelf (de `h1` op de pagina) blijft ongemoeid.
 *
 * Heeft het voorbeeld een `typVorm` (AFG-704), dan komt die erbij tussen
 * haakjes, bijvoorbeeld "Afgeleide van ln x (lnx) oefenen": leerlingen die
 * zonder spatie zoeken, zien dan toch hun eigen zoekwoord terug.
 */
export function voorbeeldTitel(voorbeeld: Voorbeeld): string {
  const zonderDe = voorbeeld.kop.replace(/^De /, "");
  const metHoofdletter = zonderDe.charAt(0).toUpperCase() + zonderDe.slice(1);
  const typVorm = voorbeeld.typVorm ? ` (${voorbeeld.typVorm})` : "";
  return `${metHoofdletter}${typVorm} oefenen`;
}

/**
 * Tweede FAQ-vraag voor pagina's met `faqUitgebreid` (AFG-658), in
 * spreektaal en zonder het kant-en-klare antwoord: "Hoe oefen je de
 * afgeleide van ln x?" Het antwoord is `omschrijving`, die al belofte-eerst
 * is voor de meta.
 */
export function voorbeeldOefenVraag(voorbeeld: Voorbeeld): string {
  const metKleineLetter = voorbeeld.kop.charAt(0).toLowerCase() + voorbeeld.kop.slice(1);
  return `Hoe oefen je ${metKleineLetter}?`;
}

export function getVoorbeelden(): readonly Voorbeeld[] {
  return VOORBEELDEN;
}

export function getVoorbeeld(slug: string): Voorbeeld | null {
  const schoon = slug.trim();
  if (!schoon) return null;
  return OP_SLUG.get(schoon) ?? null;
}
