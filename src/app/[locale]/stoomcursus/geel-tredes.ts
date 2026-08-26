// Lesladder voor de gele module "Begrijp het verhaaltje".
// Eén denkbeweging: signaalwoord in de vraag → conditie op de afgeleide →
// vast stappenplan. De tredes lopen van makkelijk naar moeilijk; elke trede
// voegt precies één idee toe. Content is Nederlandstalig met KaTeX ($...$),
// direct in TS — geen vertaling nodig (stoomcursus is Nederlandstalig).
//
// Bron/uitleg: docs/stoomcursus-geel-lesladder.md

export type GeelTrede = {
  /** Blok-titel waaronder de trede valt (voor de groepering in het overzicht) */
  blok: string
  titel: string
  /** Signaalwoord in de vraag */
  als: string
  /** Bijbehorende conditie op de afgeleide */
  dan: string
  /** Het algemene stappenplan voor dit type */
  stappen: string[]
  /** Optioneel: een keuzeboom — een ja/nee-vraag met per tak een eigen stappenplan.
   *  Staat dit ingevuld, dan toont de module de vertakking i.p.v. het platte `stappen`. */
  takken?: { vraag: string; opties: Array<{ keuze: string; stappen: string[] }> }
  /** Uitgewerkt schoolvoorbeeld (het "gestileerde" leren) */
  voorbeeld: { vraag: string; uitwerking: string[] }
  /** Zelf-oefening: schrijf je plan, vergelijk met het modelplan (examen indien beschikbaar) */
  oefening: { bron: string; vraag: string; modelplan: string[] }
}

// "Type vraag"-opties: exact geformuleerde vraagtypes die de leerling kiest,
// bedoeld om stap voor stap uit te bouwen tot een keuzeboom. Elke optie wijst
// naar de bijbehorende trede (index in GEEL_TREDES). Voor nu alleen het
// maximum/minimum-type; de overige types volgen later.
// Een type kan bij meerdere vragen horen (meerdere tredes).
export type TypeVraagOptie = { label: string; tredeIndexes: number[] }

export const TYPE_VRAAG_OPTIES: TypeVraagOptie[] = [
  { label: 'Bereken exact dit maximum, minimum of de extreme waarde', tredeIndexes: [0] },
  { label: 'Bewijs dat de grafiek in een punt stijgt of daalt', tredeIndexes: [1] },
  { label: 'Bereken de richtingscoëfficiënt van een raaklijn aan $f(x)$', tredeIndexes: [2] },
  { label: 'De snelheid is gegeven, bereken de bijbehorende tijd of hoogte', tredeIndexes: [3] },
  { label: 'Zoek het punt waar 2 hellingen gelijk zijn / waar de rc\'s gelijk zijn', tredeIndexes: [4] },
  { label: 'Het opstellen van een lijn', tredeIndexes: [5, 6] },
]

// Gedeelde keuzeboom voor "Het opstellen van een lijn" — geldt voor zowel de
// raaklijn-vraag als de verschoven-functie-vraag, dus op beide tredes gebruikt.
const OPSTELLEN_LIJN_TAKKEN: GeelTrede['takken'] = {
  vraag: 'Gaat het om een rechte (lineaire) lijn?',
  opties: [
    {
      keuze: 'Ja',
      stappen: [
        'Bepaal de richtingscoëfficiënt $a$ (uit $f\'$, gegeven, of via twee punten)',
        'Schrijf de lijn: $y = a\\,x + b$',
        'Vul een punt van de lijn in → los $b$ op',
        'Schrijf het voorschrift: $y = a\\,x + b$',
      ],
    },
    {
      keuze: 'Nee — een verschoven functie',
      stappen: [
        'Bereken $f\'(x)$',
        'Los $f\'(x) =$ de gegeven helling op → $x_{opl}$',
        'Vul in: $f(x_{opl})$',
        'Vergelijk $(x_{opl}, f(x_{opl}))$ met het gegeven punt → de verschuiving (naar rechts en omhoog)',
        'Schrijf $g$ op: $g(x) = f(x - \\Delta x) + \\Delta y$',
      ],
    },
  ],
}

export const GEEL_TREDES: GeelTrede[] = [
  // ---- Blok A — De afgeleide = 0 (iets is optimaal) ----
  {
    blok: 'Blok A · Optimaliseren (afgeleide = 0)',
    titel: 'Maximum / minimum',
    als: 'Als er staat: maximum, minimum, grootste, kleinste, optimaal, top of extreme waarde',
    dan: '$f\'(x) = 0$',
    stappen: [
      'Bereken $f\'(x)$',
      'Stel $f\'(x) = 0$',
      'Los op → dit geeft de $x_{opl}$ van de top/dal',
      'Vul in: $f(x_{opl})$ → dit geeft de extreme waarde / maximum / minimum',
    ],
    voorbeeld: {
      vraag:
        'De opbrengst is $O(x) = -x^2 + 6x + 1$. Voor welke $x$ is de opbrengst maximaal, en hoe groot is die dan?',
      uitwerking: [
        '„maximaal” → $O\'(x) = 0$',
        '$O\'(x) = -2x + 6$',
        '$-2x + 6 = 0$, dus $x = 3$',
        '$O(3) = -9 + 18 + 1 = 10$ → maximale opbrengst is $10$',
      ],
    },
    oefening: {
      bron: 'Examen 2023, tijdvak 1, vraag 1',
      vraag:
        '$f(x) = 2x + \\frac{1}{x}$ (voor $x > 0$) heeft een minimum. Bereken exact dit minimum.',
      modelplan: [
        '„minimum” → $f\'(x) = 0$',
        'Herschrijf $f(x) = 2x + x^{-1}$, dus $f\'(x) = 2 - x^{-2}$',
        '$2 - \\frac{1}{x^2} = 0$, dus $x^2 = \\frac{1}{2}$, dus $x = \\frac{1}{2}\\sqrt{2}$',
        'Invullen in $f$ geeft het minimum $= 2\\sqrt{2}$',
      ],
    },
  },
  {
    blok: 'Blok A · Optimaliseren (afgeleide = 0)',
    titel: 'Stijgen / dalen',
    als: 'Als er staat: waar stijgt of daalt $f$, aantonen dat $f$ stijgt, is $f$ monotoon',
    dan: 'bekijk het teken van $f\'(x)$ ($f\' > 0$ stijgt, $f\' < 0$ daalt)',
    stappen: [
      'Bereken $f\'(x)$',
      'Vul de x-coördinaat van het punt in: $f\'(x_A)$',
      '$f\'(x_A) > 0$ → stijgend, $f\'(x_A) < 0$ → dalend',
    ],
    voorbeeld: {
      vraag: 'Toon aan dat $f(x) = x^3 + x$ overal stijgt.',
      uitwerking: [
        '$f\'(x) = 3x^2 + 1$',
        '$3x^2 \\ge 0$, dus $f\'(x) \\ge 1 > 0$ voor alle $x$',
        'Dus $f$ stijgt overal',
      ],
    },
    oefening: {
      bron: 'Examen 2024, tijdvak 1, vraag 1',
      vraag:
        '$f(x) = x^5 - 3x\\sqrt{x}$, met $A(1, -2)$ op de grafiek. Bewijs dat de grafiek in $A$ stijgt.',
      modelplan: [
        '„stijgt” → teken van $f\'$ in $A$',
        'Schrijf $f(x) = x^5 - 3x^{3/2}$, dus $f\'(x) = 5x^4 - \\frac{9}{2}x^{1/2}$',
        '$f\'(1) = 5 - \\frac{9}{2} = \\frac{1}{2} > 0$',
        'Dus de grafiek stijgt in $A$',
      ],
    },
  },

  // ---- Blok B — De afgeleide invullen ----
  {
    blok: 'Blok B · De afgeleide invullen',
    titel: 'Helling in een punt',
    als: 'Als er staat: de helling of richtingscoëfficiënt in het punt met $x = a$',
    dan: 'bereken $f\'(x)$ en vul $a$ in: $f\'(a)$',
    stappen: [
      'Bereken $f\'(x)$',
      'Vind het punt waar ze elkaar raken, noem het $A(x_A, y_A)$',
      'Vul $x_A$ in: $f\'(x_A)$ → dit is de rc van de raaklijn',
    ],
    voorbeeld: {
      vraag: 'Wat is de helling van $f(x) = x^2$ in het punt $x = 3$?',
      uitwerking: ['$f\'(x) = 2x$', '$f\'(3) = 6$ → de helling is $6$'],
    },
    oefening: {
      bron: 'Examen 2021, tijdvak 1, vraag 1',
      vraag:
        '$f(x) = x - x^2$. Lijn $l$ raakt de grafiek in de oorsprong. Bereken de richtingscoëfficiënt van $l$.',
      modelplan: [
        'helling in $x = 0$ → $f\'(0)$',
        '$f\'(x) = 1 - 2x$',
        '$f\'(0) = 1$ → de rc van $l$ is $1$',
      ],
    },
  },
  {
    blok: 'Blok B · De afgeleide invullen',
    titel: 'Snelheid / versnelling',
    als: 'Als er staat: de snelheid of versnelling op tijdstip $t$',
    dan: 'snelheid $v(t) = s\'(t)$, versnelling $a(t) = s\'\'(t)$, dan invullen',
    stappen: [
      'Bereken $Z\'(t)$',
      'Stel $Z\'(t) =$ de snelheid gegeven in de vraag',
      'Los op → dit geeft $t$ → de bijbehorende tijd',
      'Vul $t$ in $Z(t)$ → de bijbehorende hoogte',
    ],
    voorbeeld: {
      vraag: 'Hoogte $h(t) = -5t^2 + 20t$. Wat is de snelheid op $t = 1$?',
      uitwerking: [
        'snelheid → $h\'(t) = -10t + 20$',
        '$h\'(1) = 10$ → de snelheid is $10$ m/s',
      ],
    },
    oefening: {
      bron: 'Examen 2025, tijdvak 1, vraag 12',
      vraag:
        '$Z(t) = 150 - 100\\cos(4t)$ (hoogte in cm). Er zijn twee hoogtes waarop de snelheid $255$ cm/s is. Beschrijf hoe je die hoogtes vindt.',
      modelplan: [
        '„snelheid” → $v(t) = Z\'(t)$',
        '$Z\'(t) = 400\\sin(4t)$ (kettingregel)',
        'Snelheid gegeven → los $400\\sin(4t) = 255$ op',
        'Vul de gevonden $t$ terug in $Z(t)$ voor de hoogtes',
      ],
    },
  },
  {
    blok: 'Blok B · De afgeleide invullen',
    titel: 'Gemiddelde toename — de valkuil',
    als: 'Als er staat: de gemiddelde snelheid of gemiddelde toename over $[a, b]$',
    dan: 'differentiequotiënt $\\frac{f(b) - f(a)}{b - a}$ — dus géén $f\'$!',
    stappen: [
      'Vind de rc met de 2 gegeven punten → $rc_{AB}$',
      'Vind $f\'(x)$',
      'Los op: $f\'(x) = rc_{AB}$ → $x_{opl}$',
      'Vul in: $f(x_{opl})$',
    ],
    voorbeeld: {
      vraag: '$f(x) = x^2$. Wat is de gemiddelde toename over $[1, 3]$?',
      uitwerking: [
        '„gemiddeld” → differentiequotiënt',
        '$\\frac{f(3) - f(1)}{3 - 1} = \\frac{9 - 1}{2} = 4$',
      ],
    },
    oefening: {
      bron: 'Examen 2026, tijdvak 2, vraag 12',
      vraag:
        '$f(x) = \\frac{3}{\\sqrt{x}}$ met $A(1, 3)$ en $B(9, 1)$. Zoek het punt waar de helling van $f$ gelijk is aan de helling van koorde $AB$.',
      modelplan: [
        'helling van koorde $AB$ = differentiequotiënt: $\\frac{1 - 3}{9 - 1} = -\\frac{1}{4}$',
        'helling van $f$ = afgeleide: $f(x) = 3x^{-1/2}$, dus $f\'(x) = -\\frac{3}{2}x^{-3/2}$',
        'Stel gelijk: $f\'(x) = -\\frac{1}{4}$ en los op',
        'Let op het verschil: koorde = differentiequotiënt, punt = afgeleide',
      ],
    },
  },

  // ---- Blok C — De afgeleide = een getal oplossen ----
  {
    blok: 'Blok C · De afgeleide = een getal oplossen',
    titel: 'Helling is gegeven',
    als: 'Als er staat: rc $= \\dots$, evenwijdig aan $\\dots$, of de helling is gelijk aan $\\dots$ (en je zoekt het punt)',
    dan: 'los $f\'(x) = c$ op',
    stappen: [
      'Bepaal de richtingscoëfficiënt $a$ (uit $f\'$, gegeven, of via twee punten)',
      'Schrijf de lijn: $y = a\\,x + b$',
      'Vul een punt van de lijn in → los $b$ op',
      'Schrijf het voorschrift: $y = a\\,x + b$',
    ],
    takken: OPSTELLEN_LIJN_TAKKEN,
    voorbeeld: {
      vraag: '$f(x) = x^2$. In welk punt is de helling gelijk aan $6$?',
      uitwerking: ['$f\'(x) = 2x$', '$2x = 6$, dus $x = 3$ → in het punt $x = 3$'],
    },
    oefening: {
      bron: 'Examen 2024, tijdvak 1, vraag 6',
      vraag:
        '$g$ ontstaat door $f(x) = (3x - 7)^2$ te verschuiven; $g$ gaat door $A(5, 40)$ en de raaklijnhelling in $A$ is $-6$. Beschrijf hoe je $g$ opstelt.',
      modelplan: [
        '„helling $= -6$” → gebruik $g\'(x) = -6$',
        '$f\'(x) = 2(3x - 7)\\cdot 3 = 6(3x - 7)$ (kettingregel)',
        'Bepaal met de helling $-6$ en het punt $A(5, 40)$ de verschuiving',
        'Schrijf daarmee het voorschrift van $g$ op',
      ],
    },
  },
  {
    blok: 'Blok C · De afgeleide = een getal oplossen',
    titel: 'Raaklijn opstellen',
    als: 'Als er staat: stel de raaklijn op in het gegeven punt $A$',
    dan: 'rc $= f\'(a)$, daarna $b$ berekenen met het punt',
    stappen: [
      'rc van de raaklijn $= f\'(a)$',
      'Raaklijn: $y = \\text{rc}\\cdot x + b$',
      'Vul $A(a, f(a))$ in om $b$ te vinden',
    ],
    takken: OPSTELLEN_LIJN_TAKKEN,
    voorbeeld: {
      vraag: 'Stel de raaklijn op aan $f(x) = x^2$ in $A(3, 9)$.',
      uitwerking: [
        'rc $= f\'(3) = 6$, dus $y = 6x + b$',
        '$9 = 6\\cdot 3 + b$, dus $b = -9$',
        'raaklijn: $y = 6x - 9$',
      ],
    },
    oefening: {
      bron: 'Examen 2021, tijdvak 2, vraag 6',
      vraag:
        '$f_p(x) = \\frac{1}{4}x^4 - x^3 + px$. Lijn $l$ is de raaklijn in het punt $A$ met $x = 2$. Beschrijf hoe je $l$ opstelt.',
      modelplan: [
        'rc van $l$ $= f_p\'(2)$',
        'Bereken $f_p\'(x) = x^3 - 3x^2 + p$ en vul $x = 2$ in',
        'Stel $y = \\text{rc}\\cdot x + b$ op',
        'Vul het punt $A(2, f_p(2))$ in om $b$ te vinden',
      ],
    },
  },

  // ---- Blok D — De tweede afgeleide ----
  {
    blok: 'Blok D · De tweede afgeleide',
    titel: 'Buigpunt',
    als: 'Als er staat: buigpunt, bolle of holle kant, waar verandert de kromming',
    dan: '$f\'\'(x) = 0$',
    stappen: [
      'Bereken $f\'(x)$, dan $f\'\'(x)$',
      'Stel $f\'\'(x) = 0$',
      'Los op → de $x$ van het buigpunt (vul in $f$ in voor de $y$)',
    ],
    voorbeeld: {
      vraag: 'Bepaal het buigpunt van $f(x) = x^3 - 3x^2$.',
      uitwerking: [
        '$f\'(x) = 3x^2 - 6x$, $f\'\'(x) = 6x - 6$',
        '$6x - 6 = 0$, dus $x = 1$',
        '$f(1) = 1 - 3 = -2$ → buigpunt $(1, -2)$',
      ],
    },
    oefening: {
      bron: 'Examen 2025, tijdvak 1, vraag 1',
      vraag:
        '$f(x) = x^4 - 30x^2$. Bewijs dat de $y$-coördinaat van de buigpunten $-125$ is.',
      modelplan: [
        '„buigpunten” → $f\'\'(x) = 0$',
        '$f\'(x) = 4x^3 - 60x$, $f\'\'(x) = 12x^2 - 60$',
        '$12x^2 - 60 = 0$, dus $x^2 = 5$',
        'Vul in $f$ in: $25 - 150 = -125$',
      ],
    },
  },
  {
    blok: 'Blok D · De tweede afgeleide',
    titel: 'Buigraaklijn',
    als: 'Als er staat: de raaklijn in het buigpunt (buigraaklijn)',
    dan: 'eerst $f\'\'(x) = 0$ (buigpunt), dan $f\'$ invullen voor de rc',
    stappen: [
      '$f\'\'(x) = 0$ → de $x$ van het buigpunt',
      'rc van de buigraaklijn $= f\'(\\text{die } x)$',
      '$b$ via het buigpunt (net als bij raaklijn opstellen)',
    ],
    voorbeeld: {
      vraag: 'Stel de buigraaklijn op aan $f(x) = x^3 - 3x^2$ (buigpunt $(1, -2)$).',
      uitwerking: [
        'rc $= f\'(1) = 3 - 6 = -3$, dus $y = -3x + b$',
        '$-2 = -3\\cdot 1 + b$, dus $b = 1$',
        'buigraaklijn: $y = -3x + 1$',
      ],
    },
    oefening: {
      bron: 'Examen 2022, tijdvak 2, vraag 2',
      vraag:
        '$f(x) = 2(2x - 1)^3 + 3(2x - 1)^2$ met $f\'(x) = 48x^2 - 24x$. Lijn $k$ raakt in het buigpunt. Beschrijf hoe je $k$ opstelt.',
      modelplan: [
        '„buigpunt” → $f\'\'(x) = 0$',
        '$f\'\'(x) = 96x - 24 = 0$, dus $x = \\frac{1}{4}$',
        'rc $= f\'(\\frac{1}{4})$',
        '$b$ via het buigpunt $(\\frac{1}{4},\\, f(\\frac{1}{4}))$',
      ],
    },
  },

  // ---- Blok E — Werken met een parameter ----
  {
    blok: 'Blok E · Werken met een parameter',
    titel: 'Parameter berekenen uit een raaklijn',
    als: 'Als er staat: een raaklijn of helling is gegeven en je moet de parameter ($p$, $a$, …) berekenen',
    dan: '$f_p\'(x_A) = \\text{rc}$, oplossen voor de parameter',
    stappen: [
      'Bereken $f_p\'(x)$ (de parameter blijft erin staan)',
      'Vul het raakpunt in en stel gelijk aan de gegeven rc',
      'Los op naar de parameter',
    ],
    voorbeeld: {
      vraag: '$f_a(x) = ax^2$. De helling in $x = 1$ is $6$. Bepaal $a$.',
      uitwerking: ['$f_a\'(x) = 2ax$, dus $f_a\'(1) = 2a$', '$2a = 6$, dus $a = 3$'],
    },
    oefening: {
      bron: 'Examen 2024, tijdvak 2, vraag 9',
      vraag:
        '$f(x) = ax^2 + bx + c$ gaat door $S(0, 2)$; de raaklijn in $S$ snijdt de $x$-as in $(\\frac{2}{3}\\sqrt{3}, 0)$. Beschrijf hoe je $a$, $b$ en $c$ vindt.',
      modelplan: [
        'raaklijn in $S$ → $f\'(0) = b$ = de rc van die raaklijn',
        'Bepaal de rc uit de twee punten van de raaklijn',
        'Gebruik $S(0, 2)$ → $c = 2$',
        'Combineer met de overige gegevens om $a$ op te lossen',
      ],
    },
  },
  {
    blok: 'Blok E · Werken met een parameter',
    titel: 'Kromme waarop alle toppen liggen',
    als: 'Als er staat: de lijn of kromme waarop alle toppen liggen (voor elke $p$)',
    dan: '$f_p\'(x) = 0$, maak $p$ vrij, vul terug in',
    stappen: [
      '$f_p\'(x) = 0$ → de $x$ van de top (met $p$ erin)',
      'Druk de top-coördinaten uit in $p$',
      'Elimineer $p$ → de vergelijking van de kromme door de toppen',
    ],
    voorbeeld: {
      vraag: '$f_p(x) = x^2 - 2px$. Op welke kromme liggen alle toppen?',
      uitwerking: [
        '$f_p\'(x) = 2x - 2p = 0$, dus $x = p$',
        'top: $y = f_p(p) = p^2 - 2p^2 = -p^2$',
        'met $x = p$ → $y = -x^2$; alle toppen liggen op $y = -x^2$',
      ],
    },
    oefening: {
      bron: 'Examen 2021, tijdvak 1, vraag 12',
      vraag:
        '$f_p(x) = \\frac{x^3 + 4p}{x^2}$ ($p > 0$) heeft één top. Bewijs dat er een lijn is waarop al die toppen liggen.',
      modelplan: [
        '$f_p\'(x) = 0$ → de $x$ van de top in termen van $p$',
        'Druk de top-coördinaten uit in $p$',
        'Elimineer $p$',
        'Er blijft een rechte lijn over ($y = \\frac{3}{2}x$)',
      ],
    },
  },
  {
    blok: 'Blok E · Werken met een parameter',
    titel: 'Aantal extremen bij een parameter',
    als: 'Als er staat: voor welke $p$ heeft $f$ twee, één of geen extremen',
    dan: 'onderzoek de discriminant van $f_p\'(x) = 0$',
    stappen: [
      'Stel $f_p\'(x) = 0$',
      'Dit is een vergelijking in $x$ met parameter $p$ → bekijk de discriminant $D$',
      '$D > 0$: twee · $D = 0$: één · $D < 0$: geen',
    ],
    voorbeeld: {
      vraag: 'Voor welke $p$ heeft $f(x) = x^3 + px + 1$ twee extremen?',
      uitwerking: [
        '$f\'(x) = 3x^2 + p = 0$',
        'twee oplossingen ⇔ $x^2 = -\\frac{p}{3} > 0$',
        'dus $p < 0$',
      ],
    },
    oefening: {
      bron: 'Oefenvraag (dit type kwam in de examens 2021–2026 niet los voor)',
      vraag: 'Voor welke $p$ heeft $f(x) = \\frac{1}{3}x^3 - px$ precies twee extremen?',
      modelplan: [
        'extremen → $f\'(x) = 0$',
        '$f\'(x) = x^2 - p = 0$',
        'twee oplossingen ⇔ $x^2 = p > 0$',
        'dus $p > 0$',
      ],
    },
  },
  {
    blok: 'Blok E · Werken met een parameter',
    titel: 'Aantal buigpunten bij een parameter',
    als: 'Als er staat: voor welke $p$ heeft $f$ twee of geen buigpunten',
    dan: 'onderzoek de discriminant van $f_p\'\'(x) = 0$',
    stappen: [
      'Bereken $f_p\'\'(x)$',
      'Stel $f_p\'\'(x) = 0$ → vergelijking in $x$ met parameter',
      'Discriminant: $D > 0$ twee buigpunten, $D < 0$ geen',
    ],
    voorbeeld: {
      vraag: 'Voor welke $p$ heeft $f(x) = x^4 + px^2$ twee buigpunten?',
      uitwerking: [
        '$f\'\'(x) = 12x^2 + 2p = 0$, dus $x^2 = -\\frac{p}{6}$',
        'twee oplossingen ⇔ $-\\frac{p}{6} > 0$',
        'dus $p < 0$',
      ],
    },
    oefening: {
      bron: 'Oefenvraag (dit type kwam in de examens 2021–2026 niet los voor)',
      vraag: 'Voor welke $p$ heeft $f(x) = x^4 - px^2 + x$ twee buigpunten?',
      modelplan: [
        'buigpunten → $f\'\'(x) = 0$',
        '$f\'\'(x) = 12x^2 - 2p = 0$, dus $x^2 = \\frac{p}{6}$',
        'twee oplossingen ⇔ $\\frac{p}{6} > 0$',
        'dus $p > 0$',
      ],
    },
  },

  // ---- Blok F — Terugredeneren & aantallen oplossingen ----
  {
    blok: 'Blok F · Terugredeneren & aantallen',
    titel: 'Van de afgeleide terug naar $f$',
    als: 'Als er staat: de afgeleide- of hellinggrafiek is gegeven en je moet iets over $f$ zeggen',
    dan: 'terugredeneren: waar $f\' = 0$ zit een top; teken van $f\'$ = stijgen/dalen van $f$',
    stappen: [
      'Zoek de nulpunten van $f\'$ → daar heeft $f$ toppen',
      'Teken van $f\'$ links/rechts → stijgt of daalt $f$',
      'Combineer tot een uitspraak of schets van $f$',
    ],
    voorbeeld: {
      vraag: '$f\'(x) = x - 2$ is gegeven. Wat weet je over $f$?',
      uitwerking: [
        '$f\' = 0$ bij $x = 2$',
        'links $f\' < 0$ (daalt), rechts $f\' > 0$ (stijgt)',
        'dus $f$ heeft een minimum bij $x = 2$',
      ],
    },
    oefening: {
      bron: 'Oefenvraag (dit type kwam in de examens 2021–2026 niet los voor)',
      vraag:
        'Van $f$ is de hellinggrafiek $f\'(x) = x^2 - 1$ gegeven. Waar heeft $f$ toppen, en wat voor toppen?',
      modelplan: [
        '$f\' = 0$ bij $x = -1$ en $x = 1$',
        'teken van $f\'$: links van $-1$ positief, tussen $-1$ en $1$ negatief, rechts van $1$ positief',
        'bij $x = -1$: van stijgen naar dalen → maximum',
        'bij $x = 1$: van dalen naar stijgen → minimum',
      ],
    },
  },
  {
    blok: 'Blok F · Terugredeneren & aantallen',
    titel: 'Aantal oplossingen van $f(x) = p$',
    als: 'Als er staat: voor welke $p$ heeft $f(x) = p$ drie, twee of één oplossing(en)',
    dan: 'bepaal de toppen ($f\'(x) = 0$) en lees af hoe vaak de lijn $y = p$ de grafiek snijdt',
    stappen: [
      'Toppen bepalen met $f\'(x) = 0$ → de top-hoogtes (max- en min-waarde)',
      'Denk de grafiek; $y = p$ is een horizontale lijn',
      'Tel de snijpunten afhankelijk van $p$ t.o.v. de top-hoogtes',
    ],
    voorbeeld: {
      vraag: '$f(x) = x^3 - 3x$. Voor welke $p$ heeft $f(x) = p$ drie oplossingen?',
      uitwerking: [
        '$f\'(x) = 3x^2 - 3 = 0$, dus $x = \\pm 1$',
        '$f(-1) = 2$ (max), $f(1) = -2$ (min)',
        'drie snijpunten ⇔ $-2 < p < 2$',
      ],
    },
    oefening: {
      bron: 'Oefenvraag (dit type kwam in de examens 2021–2026 niet los voor)',
      vraag: '$f(x) = x^3 - 12x$. Voor welke $p$ heeft $f(x) = p$ precies één oplossing?',
      modelplan: [
        '$f\'(x) = 3x^2 - 12 = 0$, dus $x = \\pm 2$',
        '$f(-2) = 16$ (max), $f(2) = -16$ (min)',
        'één oplossing ⇔ $p > 16$ of $p < -16$',
      ],
    },
  },
  {
    blok: 'Blok F · Terugredeneren & aantallen',
    titel: 'Aantal raaklijnen vanuit een punt',
    als: 'Als er staat: het aantal oplossingen van $f(x) = ax$, of het aantal raaklijnen vanuit een gegeven punt',
    dan: 'stel de raaklijn door dat punt op en onderzoek hoeveel er zijn',
    stappen: [
      'Raakpunt $(a, f(a))$; rc $= f\'(a)$',
      'Eis dat de raaklijn door het gegeven punt gaat → vergelijking in $a$',
      'Aantal oplossingen voor $a$ = aantal raaklijnen',
    ],
    voorbeeld: {
      vraag: 'Hoeveel raaklijnen aan $f(x) = x^2$ gaan door $(0, -1)$?',
      uitwerking: [
        'raaklijn in $a$: $y = 2a\\,x - a^2$',
        'door $(0, -1)$: $-1 = -a^2$, dus $a = \\pm 1$',
        'twee raaklijnen',
      ],
    },
    oefening: {
      bron: 'Oefenvraag (dit type kwam in de examens 2021–2026 niet los voor)',
      vraag: 'Hoeveel raaklijnen aan $f(x) = x^2$ gaan door het punt $(2, 3)$?',
      modelplan: [
        'raaklijn in $a$: $y = 2a\\,x - a^2$',
        'door $(2, 3)$: $3 = 4a - a^2$',
        '$a^2 - 4a + 3 = 0$, dus $a = 1$ of $a = 3$',
        'twee raaklijnen',
      ],
    },
  },
  {
    blok: 'Blok F · Terugredeneren & aantallen',
    titel: 'Afgeleide via de definitie',
    als: 'Als er staat: bereken de afgeleide met de definitie / het differentiequotiënt / de limiet $h \\to 0$',
    dan: '$f\'(x) = \\lim_{h \\to 0} \\frac{f(x + h) - f(x)}{h}$ uitwerken',
    stappen: [
      'Zet $\\frac{f(x + h) - f(x)}{h}$ op',
      'Werk de teller uit en deel weg door $h$',
      'Neem de limiet $h \\to 0$',
    ],
    voorbeeld: {
      vraag: 'Bepaal $f\'(x)$ voor $f(x) = x^2$ met de definitie.',
      uitwerking: [
        '$\\frac{(x + h)^2 - x^2}{h} = \\frac{2xh + h^2}{h} = 2x + h$',
        '$\\lim_{h \\to 0}(2x + h) = 2x$',
      ],
    },
    oefening: {
      bron: 'Oefenvraag (dit type kwam in de examens 2021–2026 niet los voor)',
      vraag: 'Bepaal $f\'(x)$ voor $f(x) = x^2 + 3x$ met de definitie.',
      modelplan: [
        '$\\frac{f(x+h) - f(x)}{h} = \\frac{(x+h)^2 + 3(x+h) - x^2 - 3x}{h}$',
        'teller $= 2xh + h^2 + 3h$, dus quotiënt $= 2x + h + 3$',
        '$\\lim_{h \\to 0}(2x + h + 3) = 2x + 3$',
      ],
    },
  },
]
