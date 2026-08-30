# Voice-over: Uitleg bij som 29 (H2)

Ingesproken door ElevenLabs-stem **Pauline**. De tekst per scène staat (als
bron) in `scripts/genereer-voiceover-som29.sh`; na een tekstwijziging: script
draaien, fragmentduren checken en de scèneduren + beats bijstellen.

## Notatie-afspraken

- **Somregel: u en v** — zowel in de regelkaart (`f(x) = u(x) + v(x) ⟹ f′(x) =
  u′(x) + v′(x)`) als in de uitwerking. Zo botst het niet met de productregel.
- **Productregel: g en h** — daar rekenen we `v′(q)` uit.
- **In beeld altijd mét `(q)`** (`u(q) = 1`), terwijl de stem de letters kaal
  uitspreekt ("u is één"). Stap 3 spiegelt exact de groene regelkaart.

## Opbouw (vijf scènes)

**Scène 1 · H2 · #29** — hoofdstuk + somnummer en de opgave in beeld, Aaf zwaait.

**Scène 2 · Stap 0: Analyseer de vorm** — q licht even op (marker, verdwijnt
weer), dan groene cirkel om de 1 en rode om (3q²−2)²; het minteken splitst en
blijft buiten de cirkels. Chip: "Somregel!", daarna de somregel-kaart.

**Scène 3 · De somregel** — stap 1: u(q) = 1 en v(q) = (3q²−2)² (labels onder
de som). Stap 2: u′(q) = 0 (geen q in u); v herschrijven als
(3q²−2)·(3q²−2) ("handig: schrijf een kwadraat altijd op als de term keer
zichzelf"), pauze, dan chip "Productregel!".

**Scène 4 · De productregel** — kaart + v(q) staan klaar; stap 1 (g en h),
stap 2 (afgeleiden), stap 3: eerst `v′(q) = g′(q)·h(q) + g(q)·h′(q)`, dan
ingevuld, dan uitgerekend → v′(q) = 12q(3q²−2).

**Scène 5 · Voeg alles samen** — m(q), m′(q) = u′(q) − v′(q),
m′(q) = 0 − 12q(3q²−2), en de uitkomst groot in beeld.

## Zelf inspreken in plaats van Pauline?

Haal de `Stem`-blokken uit `src/Som29Video.tsx`, zet `TEMPO` in
`src/scenes-som29.tsx` op ±1.35 voor ademruimte, en gebruik de presenter
(`npm run presenter`) als leidraad. Lever per scène een opname aan
(`scene-1` t/m `scene-5`), dan wordt de timing op jouw tempo afgestemd.
