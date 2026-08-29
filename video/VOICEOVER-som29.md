# Voice-over: Uitleg bij som 29

Ingesproken door ElevenLabs-stem **Pauline**. De tekst per scène staat (als
bron) in `scripts/genereer-voiceover-som29.sh`; na een tekstwijziging: script
draaien, fragmentduren checken en de scèneduren + beats bijstellen.

## Opbouw (vijf scènes)

**Scène 1 · #29** — de opgave in beeld, Aaf zwaait.

**Scène 2 · Stap 0: Analyseer de vorm** — q licht even op (marker, verdwijnt
weer; q i.p.v. x maakt niet uit, met pauze erna), groene cirkel om de 1 en
rode om −(3q²−2)²: twee delen met een − ertussen → somregel, en de
somregel-kaart komt in beeld.

**Scène 3 · De somregel** — stap 1: g(q) = 1 en h(q) = −(3q²−2)² (met labels
onder de som). Stap 2: g′(q) = 0 (geen q in g); h herschrijven als
−(3q²−2)·(3q²−2) ("schrijf een kwadraat altijd op als de term keer
zichzelf") → een product → productregel!

**Scène 4 · De productregel** — kaart + h(q) staan klaar; stap 1 (factoren),
stap 2 (afgeleiden, pratend langs: "g van q is …, en h van q is …"), stap 3
invullen met de − ervoor → eindantwoord h′(q) = −12q(3q²−2).

**Scène 5 · Voeg alles samen** — m(q), m′(q) = g′(q) + h′(q),
m′(q) = 0 − 12q(3q²−2), en de uitkomst groot in beeld.

## Zelf inspreken in plaats van Pauline?

Haal de `Stem`-blokken uit `src/Som29Video.tsx`, zet `TEMPO` in
`src/scenes-som29.tsx` op ±1.35 voor ademruimte, en gebruik de presenter
(`npm run presenter`) als leidraad. Lever per scène een opname aan
(`scene-1` t/m `scene-5`), dan wordt de timing op jouw tempo afgestemd.
