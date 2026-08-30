# Voice-over: Uitleg bij som 29 (H2)

Ingesproken door ElevenLabs-stem **Pauline**. De tekst per scène staat (als
bron) in `scripts/genereer-voiceover-som29.sh`; na een tekstwijziging: script
draaien, fragmentduren checken en de scèneduren + beats bijstellen.

## Notatie-afspraken

- **Overal `f`, `g` en `h`**, net als in het boek — voor élke regel. Zie
  GUIDELINES.md.
- **De opgave houdt zijn eigen naam**: `m(q)`, met `q` als variabele.
- **Botsende letters:** de somregel-pagina blijft gewoon `f`, `g` en `h`. De
  productregel-pagina begint bij zijn eigen `f`: "de functie van de vorige
  pagina noemen we hier f". Geen extra letters, geen zin over verwarring.
- **In beeld altijd mét `(q)`** (`g(q) = 1`), terwijl de stem de letters kaal
  uitspreekt ("g is één").

## Opbouw (vijf scènes)

**Scène 1 · H2 · #29** — hoofdstuk + somnummer en de opgave in beeld, Aaf zwaait.

**Scène 2 · Stap 0: Analyseer de buitenste schil** — q licht even op (marker,
verdwijnt weer), dan groene cirkel om de 1 en rode om (3q²−2)²; het minteken
splitst en blijft buiten de cirkels. Chip: "Somregel!", daarna de regelkaart.

**Scène 3 · De somregel** — stap 1: g(q) = 1 en h(q) = (3q²−2)² (labels onder de
som). Stap 2: g′(q) = 0 (geen q in g); dan h herschreven als (3q²−2)·(3q²−2).
Chip: "Productregel!".

**Scène 4 · De productregel** — de kaart, dan "de functie van de vorige pagina
noemen we hier f" met `f(q) = (3q²−2)·(3q²−2)`; stap 1 (g en h), stap 2
(afgeleiden), stap 3: eerst `f′(q) = g′(q)·h(q) + g(q)·h′(q)`, dan ingevuld,
dan uitgerekend → f′(q) = 12q(3q²−2).

**Scène 5 · Voeg alles samen** — dat antwoord hoorde bij h, dus
`h′(q) = 12q(3q²−2)`; dan m′(q) = g′(q) − h′(q), dan ingevuld, en de uitkomst
groot in beeld.

## Zelf inspreken in plaats van Pauline?

Haal de `Stem`-blokken uit `src/Som29Video.tsx`, zet `TEMPO` in
`src/scenes-som29.tsx` op ±1.35 voor ademruimte, en gebruik de presenter
(`npm run presenter`) als leidraad. Lever per scène een opname aan
(`scene-1` t/m `scene-5`), dan wordt de timing op jouw tempo afgestemd.
