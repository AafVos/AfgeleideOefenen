# Voice-over: Uitleg bij #34 (H2)

Ingesproken door ElevenLabs-stem **Pauline**. De tekst per scène staat (als
bron) in `scripts/genereer-voiceover-som34.sh`; na een tekstwijziging: script
draaien (`SCENES=3` voor één fragment), fragmentduren checken en de scèneduren
+ beats bijstellen.

De opgave: **f(x) = (x − 2) / (x + 5)**, antwoord **f′(x) = 7 / (x + 5)²**.
Cluster "Eenvoudige breuk" onder De quotiëntregel.

## Notatie-afspraken

- **Overal `f`, `g` en `h`**, net als in het boek — zie GUIDELINES.md.
- **g is de teller, h is de noemer.** Dat blijkt uit de labels boven en onder
  de breukstreep; de stem zegt het erbij. Geen bijschriften op het scherm.
- Er is maar één regel nodig, dus geen subfunctie, geen hernoeming en geen
  slotscène.

## Opbouw (drie scènes)

**Scène 1 · H2 · #34** — hoofdstuk + somnummer en de opgave in beeld, Aaf zwaait.

**Scène 2 · Stap 0: Analyseer de buitenste schil** — groene cirkel om de teller,
rode om de noemer; de breukstreep splitst en steekt aan weerszijden buiten de
cirkels uit. Chip: "Quotiëntregel!", daarna de regelkaart.

**Scène 3 · De quotiëntregel** — kaart en de breuk staan klaar; `g(x)` boven en
`h(x)` onder de breukstreep. Stap 1: g(x) = x − 2 en h(x) = x + 5. Stap 2:
g′(x) = 1 en h′(x) = 1. Stap 3 regel voor regel: symbolisch, ingevuld, teller
uitgewerkt, en het antwoord. Het minteken in de teller staat in terracotta —
verder geen uitleg op het scherm, dat doet de stem.

Een slotscène "Voeg alles samen" is er niet: één regel was genoeg, dus het
eindantwoord staat aan het eind van scène 3 al groot in beeld. Aaf springt daar.

## Zelf inspreken in plaats van Pauline?

Haal de `Stem`-blokken uit `src/Som34Video.tsx`, zet `TEMPO` in
`src/scenes-som34.tsx` op ±1.35 voor ademruimte, en gebruik de presenter
(`npm run presenter`, dan `?video=som34` in de URL). Lever per scène een opname
aan (`scene-1` t/m `scene-3`).
