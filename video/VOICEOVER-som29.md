# Voice-over: Uitleg bij som 29

Ingesproken door ElevenLabs-stem Emma. De tekst per scène staat (als bron) in
`scripts/genereer-voiceover-som29.sh`; na een tekstwijziging: script draaien,
fragmentduren checken en de scèneduren in `src/Som29Video.tsx` bijstellen.

## Zelf inspreken met de presenter

Wil je Emma vervangen door je eigen stem? Start de presenter:

```bash
cd video && npm run presenter
```

Er opent een pagina met de video die per animatiestap pauzeert: **spatie** (of
"Volgende") speelt tot de volgende stap, ←/→ werken ook. Het geluid staat uit.

1. Start per scène een audio-opname (bijv. Spraakmemo's) en klik al pratend
   door de stappen van die scène (de balk onderin zegt wat er komt).
2. Bewaar de opnames als `scene-1`, `scene-2`, `scene-3` (mp3 of m4a).
3. Lever ze aan — dan worden ze gemonteerd en de scèneduren en beeldmomenten
   op jouw tempo afgestemd.

De cue-punten staan in `src/cues.ts`; houd ze synchroon met de `from`-waardes
in `src/scenes-som29.tsx` als je scènes aanpast.

## Opbouw

**Scène 1 · #29 (0:00 – 0:07)** — de opgave in beeld, Aaf zwaait.

**Scène 2 · Herkennen en herschrijven (0:07 – 0:46)**
- de q licht even op (marker, verdwijnt weer): q i.p.v. x maakt niet uit
- groene cirkel om de 1, rode om −(3q²−2)²: twee delen, maar geen q in deel één
- pijl omlaag: de 1 doorgestreept
- pijl omlaag: kwadraat uitgeschreven als (3q²−2)·(3q²−2) → "Productregel!"

**Scène 3 · De productregel (0:46 – 1:43)**
- de regel in het vaste format (met x) + het stappenplan meteen in beeld
- "zelfde regel — bij ons is de variabele q"
- de drie stap-chips poppen groot en groen op zodra hun stap aan de beurt is
- stap 3 in drie regels: eerst met g′(q)/h(q), dan ingevuld, dan −12q(3q²−2)
