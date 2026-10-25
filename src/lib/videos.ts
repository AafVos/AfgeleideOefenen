/**
 * `algemeen` legt een onderwerp of regelkeuze uit; `vraaguitwerking` werkt één
 * opgave uit, meestal op verzoek van een leerling.
 */
export type VideoSoort = 'algemeen' | 'vraaguitwerking'

/**
 * Korte eigen uitleg onder het filmpje. `leer` is gewone tekst. `regel` en
 * `antwoord` zijn LaTeX. `stappen` mogen `$...$` bevatten.
 */
export type VideoUitleg = {
  leer: string
  regel: string[]
  stappen: string[]
  antwoord: string
}

export type UitlegVideo = {
  slug: string
  title: string
  description: string
  uitleg: VideoUitleg
  soort: VideoSoort
  /** Hoofdstuk waar de video bij hoort, bv. "H2". Null = niet hoofdstukgebonden. */
  chapter: string | null
  /** Weergaveduur, bv. "2:21". */
  duration: string
  /** Publieke mp4-URL (Supabase Storage, bucket `videos` op prod). */
  src: string
  /**
   * Clusters (topic_clusters_new.id) waar de oefenvragen bij deze video
   * vandaan komen. Leeg = geen oefensectie tonen.
   */
  clusterIds: string[]
  /**
   * Oefenlink van de eerste soort som bij deze video (`chapter`, `topic`,
   * `cluster`). Zonder account wordt die omgezet naar drie proefsommen.
   */
  oefenen: string
  /** Geschreven uitleg die bij deze video hoort. Leeg = geen teruglink. */
  theoriePad?: string
}

/**
 * Basis-URL van de publieke Storage-bucket `videos`. Volgt de omgeving: lokaal
 * en dev lezen uit hun eigen bucket, productie uit die van prod. Zet een nieuwe
 * mp4 dus in de bucket van élke omgeving waar je hem wilt zien.
 */
const STORAGE_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/videos`

const VIDEOS: UitlegVideo[] = [
  {
    slug: 'somregel-of-productregel',
    title: 'Somregel of productregel?',
    description:
      'Wanneer gebruik je welke regel, en hoe de somregel binnen de productregel terugkomt.',
    uitleg: {
      leer: 'Je leert aan het teken tussen de delen zien welke regel je pakt. Een plus of een min is de somregel: elke term apart, en daarna weer optellen of aftrekken. Een keerteken is de productregel. Zit er in een factor zelf een som, dan gebruik je de somregel daar nog een keer.',
      regel: [
        "f(x) = g(x) + h(x) \\implies f'(x) = g'(x) + h'(x)",
        "f(x) = g(x) \\cdot h(x) \\implies f'(x) = g'(x)\\cdot h(x) + g(x)\\cdot h'(x)",
      ],
      stappen: [
        'Neem $f(x) = (x^2 - 4)(x^3 + 2x)$. Er staat een keerteken, dus de productregel.',
        '$g(x) = x^2 - 4$. Dat is een som, dus $g\'(x) = 2x$.',
        '$h(x) = x^3 + 2x$. Ook een som: $h\'(x) = 3x^2 + 2$.',
        'Vul in: eerst de afgeleide van $g$ keer $h$, plus $g$ keer de afgeleide van $h$.',
      ],
      antwoord: "f'(x) = 2x(x^3 + 2x) + (x^2 - 4)(3x^2 + 2)",
    },
    soort: 'algemeen',
    chapter: 'H2',
    duration: '2:20',
    src: `${STORAGE_BASE}/somregel-of-productregel.mp4`,
    clusterIds: [
      // Termsgewijs differentiëren · Polynoom differentiëren (somregel)
      '606ef177-ecdb-4291-a8d0-ce667cc9d65c',
      // De productregel · Twee polynomen
      'faa995e4-1e45-4d93-8145-ee749232725d',
    ],
    oefenen: '/oefenen?chapter=h2&topic=h2_termsgewijs&cluster=polynoom_differentieren',
    theoriePad: '/theorie/productregel',
  },
  {
    slug: 'productregel-bij-een-kwadraat',
    title: 'Productregel bij een kwadraat',
    description:
      'm(q) = 1 − (3q² − 2)² differentiëren. Eerst de somregel, en de productregel voor het kwadraat.',
    uitleg: {
      leer: 'Je leert eerst naar de buitenste schil kijken. Hier staat een min tussen twee delen, dus je begint met de somregel. Het tweede deel is een kwadraat: dat is twee keer dezelfde factor, dus daar gebruik je de productregel.',
      regel: [
        "f(q) = g(q) - h(q) \\implies f'(q) = g'(q) - h'(q)",
        "f(q) = g(q) \\cdot h(q) \\implies f'(q) = g'(q)\\cdot h(q) + g(q)\\cdot h'(q)",
      ],
      stappen: [
        '$m(q) = 1 - (3q^2 - 2)^2$. De $1$ heeft geen $q$, dus die afgeleide is $0$.',
        'Schrijf het kwadraat als product: $(3q^2 - 2) \\cdot (3q^2 - 2)$.',
        'Van $3q^2 - 2$ is de afgeleide $6q$. Twee keer $6q$ maal de factor geeft $12q(3q^2 - 2)$.',
        'Trek dat af van $0$.',
      ],
      antwoord: "m'(q) = -12q(3q^2 - 2)",
    },
    soort: 'vraaguitwerking',
    chapter: 'H2',
    duration: '2:14',
    src: `${STORAGE_BASE}/som-29.mp4`,
    clusterIds: [
      // De productregel · Kwadraat van een polynoom (het cluster van som 29)
      'd622e23a-4112-4eca-81fa-69187f8d48a1',
    ],
    oefenen: '/oefenen?chapter=h2&topic=h2_productregel&cluster=kwadraat_van_polynoom',
  },
  {
    slug: 'productregel-bij-twee-polynomen',
    title: 'Productregel bij twee polynomen',
    description:
      'k(x) = 5 − 3(x⁴ − x)(x + 1) differentiëren. Eerst de somregel, daarna de productregel voor het tweede deel.',
    uitleg: {
      leer: 'Je leert een verschil differentiëren waarvan het tweede deel een product is. Een getal zonder x heeft afgeleide nul. De factor 3 haal je naar binnen, zodat je twee factoren ziet. De min aan het eind gaat over elke term.',
      regel: [
        "f(x) = g(x) - h(x) \\implies f'(x) = g'(x) - h'(x)",
        "f(x) = g(x) \\cdot h(x) \\implies f'(x) = g'(x)\\cdot h(x) + g(x)\\cdot h'(x)",
      ],
      stappen: [
        '$k(x) = 5 - 3(x^4 - x)(x + 1)$. De $5$ heeft geen $x$, dus die afgeleide is $0$.',
        'Haal de $3$ naar binnen: $(3x^4 - 3x)(x + 1)$.',
        '$g(x) = 3x^4 - 3x$, dus $g\'(x) = 12x^3 - 3$. $h(x) = x + 1$, dus $h\'(x) = 1$.',
        'Productregel: $(12x^3 - 3)(x + 1) + (3x^4 - 3x) = 15x^4 + 12x^3 - 6x - 3$.',
        'Trek dat af van $0$. De min draait het teken van elke term om.',
      ],
      antwoord: "k'(x) = -15x^4 - 12x^3 + 6x + 3",
    },
    soort: 'vraaguitwerking',
    chapter: 'H2',
    duration: '2:35',
    src: `${STORAGE_BASE}/som-30.mp4`,
    clusterIds: [
      // Productregel: twee polynomen (het cluster van som 30)
      'faa995e4-1e45-4d93-8145-ee749232725d',
    ],
    oefenen: '/oefenen?chapter=h2&topic=h2_productregel&cluster=twee_polynomen',
  },
  {
    slug: 'quotientregel-bij-een-breuk',
    title: 'Quotiëntregel bij een breuk',
    description:
      'f(x) = (x − 2)/(x + 5) differentiëren met de quotiëntregel.',
    uitleg: {
      leer: 'Je leert een eenvoudige breuk differentiëren. De teller noem je g en de noemer h. Er is maar één regel nodig. De noemer van het antwoord laat je staan als een kwadraat.',
      regel: [
        'f(x) = \\dfrac{g(x)}{h(x)}',
        "f'(x) = \\dfrac{g'(x)\\,h(x) - g(x)\\,h'(x)}{(h(x))^2}",
      ],
      stappen: [
        '$g(x) = x - 2$, dus $g\'(x) = 1$. $h(x) = x + 5$, dus $h\'(x) = 1$.',
        'Teller: $1 \\cdot (x + 5) - (x - 2) \\cdot 1 = x + 5 - x + 2 = 7$.',
        'De noemer blijft $(x + 5)^2$.',
      ],
      antwoord: "f'(x) = \\dfrac{7}{(x + 5)^2}",
    },
    soort: 'vraaguitwerking',
    chapter: 'H2',
    duration: '1:22',
    src: `${STORAGE_BASE}/som-34-aaf.mp4`,
    clusterIds: [
      // De quotiëntregel · Eenvoudige breuk (het cluster van som 34)
      'a56f5e6f-4637-4087-98a4-6a60cec1deec',
    ],
    oefenen: '/oefenen?chapter=h2&topic=h2_quotientregel&cluster=eenvoudige_breuk',
  },
  {
    slug: 'quotientregel',
    title: 'De quotiëntregel',
    description:
      'De quotiëntregel en het stappenplan dat je erbij volgt, meteen toegepast op #36 uit H2.',
    uitleg: {
      leer: 'Je leert een breuk differentiëren met de quotiëntregel. De teller noem je g en de noemer h. Die volgorde ligt vast. In de teller van de afgeleide staat een min. De noemer laat je staan als het kwadraat van h.',
      regel: [
        'f(x) = \\dfrac{g(x)}{h(x)}',
        "f'(x) = \\dfrac{g'(x)\\,h(x) - g(x)\\,h'(x)}{(h(x))^2}",
      ],
      stappen: [
        'Neem $f(x) = \\dfrac{2x + 1}{3x - 1}$.',
        '$g(x) = 2x + 1$, dus $g\'(x) = 2$. $h(x) = 3x - 1$, dus $h\'(x) = 3$.',
        'Teller: $2(3x - 1) - (2x + 1) \\cdot 3 = 6x - 2 - 6x - 3 = -5$.',
        'De noemer blijft $(3x - 1)^2$.',
      ],
      antwoord: "f'(x) = \\dfrac{-5}{(3x - 1)^2}",
    },
    soort: 'algemeen',
    chapter: 'H2',
    duration: '1:50',
    src: `${STORAGE_BASE}/quotientregel-aaf.mp4`,
    clusterIds: [
      // De quotiëntregel · Eenvoudige breuk (het cluster van #36)
      'a56f5e6f-4637-4087-98a4-6a60cec1deec',
    ],
    oefenen: '/oefenen?chapter=h2&topic=h2_quotientregel&cluster=eenvoudige_breuk',
    theoriePad: '/theorie/quotientregel',
  },
  {
    slug: 'machten-herschrijven',
    title: 'Machten en wortels herschrijven',
    description:
      'Een macht in de noemer of een wortel van x? Eerst herschrijven als macht van x, dan de machtsregel, en het antwoord terugschrijven.',
    uitleg: {
      leer: 'Je leert een macht in de noemer of een wortel van x eerst om te schrijven naar een macht van x. Pas dan werkt de machtsregel. Daarna schrijf je het antwoord weer terug, bijvoorbeeld als een breuk. Zit er onder de wortel nog een som, dan is dit herschrijven niet genoeg.',
      regel: [
        '\\dfrac{1}{x^n} = x^{-n}',
        '\\sqrt{x} = x^{1/2}',
        "f(x) = ax^n \\implies f'(x) = n \\cdot a \\, x^{n-1}",
      ],
      stappen: [
        'Neem $f(x) = \\dfrac{6}{x^3}$. Schrijf om: $6x^{-3}$.',
        'De macht $-3$ komt naar voren en wordt één lager: $-3 \\cdot 6x^{-4} = -18x^{-4}$.',
        'Schrijf terug als breuk.',
      ],
      antwoord: "f'(x) = -\\dfrac{18}{x^4}",
    },
    soort: 'algemeen',
    chapter: 'H6',
    duration: '2:59',
    src: `${STORAGE_BASE}/machten-herschrijven.mp4`,
    oefenen: '/oefenen?chapter=h6&topic=h6_machten&cluster=negatieve_macht',
    clusterIds: [
      // Machten en wortels herschrijven · Negatieve machten (voorbeeld 6/x³)
      'fa5bef5c-3c41-46d2-a009-6bec675b78b5',
      // Machten en wortels herschrijven · Wortels als macht
      'c819dec0-62a4-4895-a693-bffcb4c037c1',
      // Machten en wortels herschrijven · Gemengde machten en wortels (voorbeeld x·√x)
      '0dd866d6-3ec7-4c2f-88ba-47c10299048d',
    ],
  },
]

export function getUitlegVideos(): UitlegVideo[] {
  return VIDEOS
}

/** Oude adressen die het somnummer noemden. Blijven werken en sturen door. */
const OUDE_SLUGS: Record<string, string> = {
  'som-29': 'productregel-bij-een-kwadraat',
  'som-30': 'productregel-bij-twee-polynomen',
  'som-34': 'quotientregel-bij-een-breuk',
}

/** Eén video op slug, of null als die naam niet bestaat. */
export function getUitlegVideo(slug: string): UitlegVideo | null {
  const schoon = slug.trim()
  if (!schoon) return null
  return VIDEOS.find((v) => v.slug === schoon) ?? null
}

/**
 * Huidige slug, of de nieuwe slug als dit een oud adres is.
 * Onbekend → null.
 */
export function losVideoSlugOp(slug: string): string | null {
  const schoon = slug.trim()
  if (!schoon) return null
  if (getUitlegVideo(schoon)) return schoon
  return OUDE_SLUGS[schoon] ?? null
}

/**
 * Permanent pad voor een oud video-adres, met taalcode.
 * `som-29` onder `/`, `/nl` of `/en` → `/nl/uitleg-videos/productregel-bij-een-kwadraat`.
 * Iets anders → null.
 */
export function oudVideoAdres(pathname: string): string | null {
  const match = pathname.match(
    /^\/(?:nl|en)\/uitleg-videos\/(som-29|som-30|som-34)\/?$|^\/uitleg-videos\/(som-29|som-30|som-34)\/?$/,
  )
  const oud = match?.[1] ?? match?.[2]
  if (!oud) return null
  return `/nl${uitlegVideoPad(OUDE_SLUGS[oud])}`
}

/**
 * Pad van één uitlegvideo, zonder taalcode.
 * `uitlegVideoPad('quotientregel')` → `/uitleg-videos/quotientregel`
 */
export function uitlegVideoPad(slug: string): string {
  return `/uitleg-videos/${encodeURIComponent(slug)}`
}

/** Weergaveduur "2:20" als duur die zoekmachines lezen: "PT2M20S". */
export function duurAlsKaartje(duur: string): string {
  const [minuten, seconden] = duur.split(':')
  return `PT${Number(minuten)}M${Number(seconden)}S`
}

/**
 * De uitlegvideo die bij een cluster hoort, of null. Zo kan de oefenpagina bij
 * een vraag laten zien dat er uitleg over dat onderwerp klaarstaat.
 * Hoort een cluster bij meerdere video's, dan wint de laatst toegevoegde.
 */
export function getVideoForCluster(clusterId: string | null): UitlegVideo | null {
  if (!clusterId) return null
  for (let i = VIDEOS.length - 1; i >= 0; i--) {
    if (VIDEOS[i].clusterIds.includes(clusterId)) return VIDEOS[i]
  }
  return null
}
