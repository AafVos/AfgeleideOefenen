# Voice-over: Uitleg bij som 29 (zelf inspreken)

De compositie staat nu **zonder audio** en op een ruimer tempo (`TEMPO = 1.35`
in `src/scenes-som29.tsx` — hoger = nog langzamer). Spreek per scène in aan de
hand van het script hieronder; als leidraad kun je `out/som-29-stil.mp4`
laten meelopen of de presenter gebruiken.

## Script (leidraad per scène)

**Scène 1 · #29 (±8 s)**
> Deze uitlegvideo gaat over som 29.

**Scène 2 · Stap 0: analyseer de vorm (±54 s)**
> Stap nul: analyseer de vorm. In deze som werken we met q in plaats van x —
> maar dat maakt voor het differentiëren niets uit. (pauze) Je ziet duidelijk
> dat de som uit twee delen bestaat [groene en rode cirkel]. Het lijkt op de
> somregel, maar er zit geen q in het eerste deel, dus we kijken alleen naar
> deel twee. De één strepen we door. Een term tussen haakjes tot de macht twee
> schrijf je altijd op als de term keer zichzelf. Twee termen met een
> keer-teken ertussen — de productregel!

**Scène 3 · De productregel (±75 s)**
> Hier zie je de productregel en onze som, met de één al doorgestreept.
> Stap één: kies g en h — allebei drie q kwadraat min twee.
> Stap twee: bereken de afgeleiden — allebei zes q.
> Stap drie: vul de formule in. Eerst uitgeschreven, dan alles ingevuld, dan
> één stap uitgerekend, en dan de uitkomst: min twaalf q keer drie q kwadraat
> min twee. Gelukt!

## Opnemen en aanleveren

1. Neem per scène op (bijv. Spraakmemo's) en exporteer als `scene-1`,
   `scene-2`, `scene-3` (mp3 of m4a) in `public/voiceover-som29/`.
2. Meld het — dan monteer ik de audio, stem ik alle beeldmomenten op jouw
   tempo af en vervang ik de video op de site (daar staat nu de
   Pauline-versie).

## Terug naar een AI-stem?

De Pauline-teksten staan als bron in `scripts/genereer-voiceover-som29.sh`
(standaardstem: Pauline; wissel via `VOICE_ID=...`).

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
