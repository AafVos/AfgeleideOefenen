# Guidelines voor uitlegvideo's

Waar elke nieuwe video aan moet voldoen. Gebaseerd op de eerste twee video's
(som-productmethode en somregel/productregel) en de feedbackrondes daarop.

## Vormgeving

- **Witte achtergrond**, alles in de stijl van de app: DM Serif Display voor
  koppen en wiskunde, DM Sans voor lopende tekst, kleuren uit `globals.css`
  (groen `#2d6a4f`, terracotta `#c94f4a`) — zie `src/theme.ts`.
- **Aaf rechtsonder** op elke scène; zij "geeft" de uitleg. Gebruik haar poses
  functioneel: zwaaien (intro/afsluiting), wijzen (naar wat besproken wordt),
  knikken (bevestiging), springen (eindresultaat), hoofdkrabben + vraagteken
  (twijfelgeval).
- **Logo `afgeleideoefenen.nl` rechtsboven** op elke scène (zit in `Scene` in
  `src/ui.tsx`, komt vanzelf mee).
- **Titel bovenaan** elke inhoudelijke scène ("Somregel", "Productregel"),
  zodat de kijker altijd weet waar hij is.
- Handgetekende accenten (wiebelige omcirkeling, pijltjes) in de accentkleur —
  spaarzaam, alleen om te wijzen waar de voice-over over praat.

## Didactiek

- **De regel zelf altijd als reminder-kaart** in beeld (groene kaart, zoals de
  formulekaarten in de app), direct onder de scènetitel.
- **Volledige notatie**: schrijf `f(x)`, `g(x)`, `h(x)` — geen kale `f`, `g`, `h`.
- **Geen "fout!"-routes** met een kruis erdoor; laat de goede weg stap voor
  stap zien in plaats van de valkuil te demonstreren.
- **Rustig tempo**: losse delen één voor één opbouwen, links/rechts gescheiden
  kaarten met pijltjes omlaag naar het resultaat (g links, h rechts).
- **Laat regels stapelen zien**: als binnen een stap een eerdere regel
  terugkomt (bijv. de somregel binnen de productregel), benoem dat expliciet
  ("een som → somregel!").
- **Voorbeelden uit de app-kaartjes hergebruiken**, zodat video en theorie
  naadloos op elkaar aansluiten.
- Werk het eindantwoord niet verder uit dan nodig; de video gaat over de
  regelkeuze, niet over uitwerken.
- **Eindig met een samenvatting** als genummerde checklist + "Succes!".

## Voice-over

- **ElevenLabs, stem Emma** (`OlBRrVAItyi00MuGMbna`, native NL). Geen Engelse
  premade-stemmen: de r en de l klinken dan Engels.
- **Zeg nooit "accent"** ("g-accent") — zeg "de afgeleide van g".
- Spreek formules voluit: "x tot de derde", "x kwadraat", "plus vijf x".
- Schrijf het script uit als volledige uitleg ("Als je f kunt opsplitsen in
  twee delen…"), niet als losse steekwoorden bij het beeld.
- Per scène één los fragment (`scripts/genereer-voiceover*.sh`); het script in
  dat bestand is de bron, houd het synchroon met de scènes.

## Timing

- **Beeld iets vóór de stem**: een element verschijnt vlak vóórdat de
  voice-over het noemt, nooit erna.
- Audio start 15 frames (0,5 s) na de scènestart; geef elke scène 1–3 s
  uitloop na het einde van het fragment.
- Werkvolgorde: ① voice-over genereren → ② fragmentduren meten (`afinfo`) →
  ③ scèneduren en beeldmomenten daarop maten → ④ stills renderen en checken →
  ⑤ video renderen.

## Techniek

- Remotion, 1920×1080, 30 fps; per video een eigen scènebestand + compositie
  in `src/Root.tsx` (zie `README.md` voor de commando's).
- Publiceren: mp4 uploaden naar de publieke Supabase Storage-bucket `videos`
  (prod) en een blokje toevoegen in `src/lib/videos.ts` van de app, inclusief
  cluster-id's voor de oefenvraagtegels.
