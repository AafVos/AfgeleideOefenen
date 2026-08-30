# Voice-over: Uitleg bij som 30 (H2)

Ingesproken door ElevenLabs-stem **Pauline**. De tekst per scène staat (als
bron) in `scripts/genereer-voiceover-som30.sh`; na een tekstwijziging: script
draaien, fragmentduren checken en de scèneduren + beats bijstellen.

De opgave: **k(x) = 5 − 3(x⁴ − x)(x + 1)** (boek H2, opgave 53d).

## Notatie-afspraken

- **Somregel: u en v** — zowel in de regelkaart (`f(x) = u(x) + v(x) ⟹ f′(x) =
  u′(x) + v′(x)`) als in de uitwerking. Zo botst het niet met de productregel.
- **Productregel: g en h** — daar rekenen we `v′(x)` uit.
- **In beeld altijd mét `(x)`** (`u(x) = 5`), terwijl de stem de letters kaal
  uitspreekt ("u is vijf"). Stap 3 spiegelt exact de groene regelkaart.
- De factor 3 gaat mee naar binnen bij de eerste factor: `v(x) = (3x⁴ − 3x)(x + 1)`.
  Zo blijft het bij twee factoren en is er geen extra regel nodig.

## Opbouw (vijf scènes)

**Scène 1 · H2 · #30** — hoofdstuk + somnummer en de opgave in beeld, Aaf zwaait.

**Scène 2 · Stap 0: Analyseer de buitenste schil** — groene cirkel om de 5,
rode om 3(x⁴ − x)(x + 1); het minteken splitst en blijft buiten de cirkels.
Chip: "Somregel!", daarna de somregel-kaart.

**Scène 3 · De somregel** — stap 1: u(x) = 5 en v(x) = 3(x⁴ − x)(x + 1)
(labels onder de som). Stap 2: u′(x) = 0 (geen x in u); v herschrijven als
(3x⁴ − 3x)·(x + 1) ("handig: haal de 3 naar binnen, dan zie je twee losse
factoren staan"), pauze, dan chip "Productregel!".

**Scène 4 · De productregel** — kaart + v(x) staan klaar; stap 1 (g(x) = 3x⁴ − 3x
en h(x) = x + 1), stap 2 (g′(x) = 12x³ − 3 en h′(x) = 1), stap 3: eerst
`v′(x) = g′(x)·h(x) + g(x)·h′(x)`, dan ingevuld, dan haakjes weggewerkt
(12x⁴ + 12x³ − 3x − 3 + 3x⁴ − 3x) → v′(x) = 15x⁴ + 12x³ − 6x − 3.

**Scène 5 · Voeg alles samen** — k(x), k′(x) = u′(x) − v′(x),
k′(x) = 0 − (15x⁴ + 12x³ − 6x − 3) met de tip dat de min over álle termen
gaat, en de uitkomst groot in beeld: k′(x) = −15x⁴ − 12x³ + 6x + 3.

## Zelf inspreken in plaats van Pauline?

Haal de `Stem`-blokken uit `src/Som30Video.tsx`, zet `TEMPO` in
`src/scenes-som30.tsx` op ±1.35 voor ademruimte, en gebruik de presenter
(`npm run presenter`, dan `?video=som30` in de URL) als leidraad. Lever per
scène een opname aan (`scene-1` t/m `scene-5`), dan wordt de timing op jouw
tempo afgestemd.
