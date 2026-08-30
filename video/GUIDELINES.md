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

## Vaste opzet: uitlegvideo bij een som

Video's die één opgave uitwerken (op verzoek van een leerling) hebben altijd
dezelfde ruggengraat: **intro → analyseer → regel toepassen (zo vaak als
nodig) → alles samenvoegen**. Zo herkent de kijker de structuur terug, ongeacht
welke som het is. Zie `scenes-som29.tsx` / `scenes-som30.tsx` als sjabloon.

1. **Intro** — hoofdstuk en somnummer groot in beeld (`H2 · #29`), met het
   hoofdstuk in de tekstkleur en het somnummer in de accentkleur, en de opgave
   eronder. Het hoofdstuk hoort er altijd bij: leerlingen zoeken op "som 29 van
   H2", niet op "som 29". Aaf schuift in beeld en zwaait. Verder niets: geen
   titel, geen uitleg.
2. **Stap 0 · Analyseer de buitenste schil** — de opgave in beeld, en dan
   handgetekende cirkels om de delen waar het om draait: groen om het eerste
   deel, terracotta om het tweede. Het teken dat de delen scheidt (`+`, `−`,
   `·`, breukstreep, macht) blijft búiten de cirkels staan — dát teken bepaalt
   welke regel je pakt. Daarna een chip met de conclusie — "Somregel!",
   "Productregel!", "Quotiëntregel!", "Kettingregel!", wat er ook uitkomt — en
   pas dán de bijbehorende regelkaart.
3. **Eén scène per regel, tot de som opgelost is.** Elke scène pakt het deel
   dat nog niet af is, past daar één regel op toe, en eindigt óf met een
   antwoord óf met een chip die naar de volgende regel wijst. Dat kan één
   scène zijn (som klaar na de somregel) of drie of vier (regel binnen regel
   binnen regel). Je stopt pas als er niets onuitgewerkts meer staat, en de
   laatste regelscène eindigt altijd met het antwoord groot in beeld. Hoe zo'n
   scène eruitziet per regel: zie "Layout per regel" hieronder.
4. **Voeg alles samen — alleen als er iets samen te voegen valt.** Heb je
   meerdere regels gestapeld, dan sluit je af met: de oorspronkelijke opgave
   nog eens, de afgeleide symbolisch (`k′(x) = g′(x) − h′(x)`), dan ingevuld
   met wat je onderweg hebt uitgerekend, dan de uitkomst groot in de
   accentkleur. Aaf springt.
   **Was één regel genoeg, dan sla je deze scène over.** Het eindantwoord
   staat dan al aan het eind van die regelscène in beeld; het nog een keer
   herhalen voegt niets toe en maakt de video onnodig lang. Aaf springt dan aan
   het eind van de regelscène.

### Layout per regel

Elke regelscène heeft dezelfde opbouw — titel, regelkaart, het deel waar we aan
rekenen, en dan genummerde stap-labels met de uitwerking ernaast. Wat per regel
vastligt, zijn de **letters** en de **stappen**.

**Somregel-scène** (`f(x) = g(x) + h(x) ⟹ f′(x) = g′(x) + h′(x)`)

- Titel "De **somregel**" (somregel groen), daaronder de groene regelkaart.
- De som met de delen gelabeld: `g(x)` en `h(x)` onder de termen, het `+` of
  `−` blijft ertussen staan.
- *Stap 1 · kies g en h* — `g(x) = …` en `h(x) = …` naast elkaar.
- *Stap 2 · bereken g′ en h′* — één voor één. Is een deel meteen klaar, zet het
  antwoord er direct achter met een korte reden ("er zit geen x in"). Moet een
  deel eerst herschreven worden voor de volgende regel, doe dat zichtbaar: het
  deel, een `↓`, en de herschreven vorm, met één regel eronder die verklaart
  wat je deed ("handig: haal de 3 naar binnen, dan zie je twee losse
  factoren").
- Sluit af met een chip in de kleur van het deel dat nog werk kost. Is de som
  hier al af, dan vervalt de chip en ga je door naar "Voeg alles samen".

**Productregel-scène** (`f(x) = g(x) · h(x) ⟹ f′(x) = g′(x)·h(x) + g(x)·h′(x)`)

- Titel "De **productregel**" (productregel terracotta), daaronder de kaart, en
  daaronder het deel dat we uitrekenen (`p(x) = …`) — alle drie staan er al bij
  frame 5.
- *Stap 1 · kies g en h* — `g(x) = …` en `h(x) = …` naast elkaar.
- *Stap 2 · bereken g′ en h′* — allebei in het groen.
- *Stap 3 · vul de formule in* — regel voor regel, nooit twee tegelijk: eerst
  symbolisch (exact de kaart overgeschreven), dan ingevuld, dan uitgewerkt, dan
  het antwoord met een `Pop`.

**Quotiëntregel-scène** (`f(x) = g(x)/h(x) ⟹ f′(x) = (g′(x)h(x) − g(x)h′(x)) / (h(x))²`)

Bijna hetzelfde als de productregel — zelfde letters, zelfde drie stappen — dus
bouw hem ook zo op. Wat afwijkt zit hem in de details, en juist daar gaat het
mis bij leerlingen.

- Titel "De **quotiëntregel**", daaronder de kaart, daaronder het deel dat we
  uitrekenen (`f(x) = …`) — alle drie staan er al bij frame 5.
- *Stap 1 · kies g en h* — **g is de teller, h is de noemer**; die volgorde
  ligt vast. Label ze in beeld boven en onder de breukstreep, dan zie je het
  meteen. De stem zegt "g is de teller" en "h is de noemer"; verder geen
  uitleg op het scherm.
- *Stap 2 · bereken g′ en h′* — allebei in het groen.
- *Stap 3 · vul de formule in* — regel voor regel, nooit twee tegelijk: eerst
  symbolisch (exact de kaart overgeschreven), dan ingevuld, dan uitgewerkt, dan
  het antwoord met een `Pop`.
- **Zet het minteken in de teller in terracotta**, niet in het groen van de
  rest van de formule. Dat is het enige zichtbare verschil met de productregel
  (`g′h − gh′` in plaats van `g′h + gh′`). De kleur doet het werk — geen
  waarschuwende tekst eronder.
- **De noemer blijft `(h(x))²` staan** — niet uitwerken, ook niet als het kan.
  De video gaat over de regelkeuze.

### Botsende letters: hernoem, en zeg dat hardop

**Elke regel gebruikt gewoon `f`, `g` en `h`** — precies zoals in het boek, zodat
video en boek dezelfde taal spreken. De opgave zelf houdt de naam die het boek
eraan geeft (`k(x)`, `m(q)`).

Dat botst zodra je een deel meeneemt naar een volgende scène en dáár weer een
regel toepast: de `h(x)` van de somregel zou dan ineens de `f(x)` van de
productregel zijn, met een nieuwe `g` en `h` eronder. Los dat niet op met een
apart letterpaar, maar **geef dat deel eerst een eigen naam — in beeld én in de
voice-over**:

> "Om verwarring te voorkomen noemen we onze subfunctie p van x."

Zet die hernoeming als losse regel in beeld (`p(x) = 3(x⁴ − x)(x + 1)`) vóórdat
de nieuwe regelkaart verschijnt, zodat de kijker de overstap ziet gebeuren.
Daarna pas je de nieuwe regel gewoon toe: `p(x) = g(x) · h(x)`, met een verse
`g` en `h`.

- **Subfuncties heten `p`, dan `q`, dan `r`** — in die volgorde, zodat je altijd
  weet welke bij welke stap hoort.
- **Sla een letter over** als hij al in de opgave voorkomt, als functienaam of
  als variabele (bij `m(q)` gebruik je dus geen `q`, maar `p` en dan `r`).
- In de slotscène reken je terug naar de oorspronkelijke letters: eerst
  `p′(x) = …`, dan `h′(x) = p′(x)`, dan pas `k′(x) = g′(x) − h′(x)`. Zo sluit de
  cirkel en snapt de kijker waar zijn subfunctie gebleven is.

Komt er een regel bij die hier nog niet staat (kettingregel), geef die dan een
eigen vaste letters en stappen volgens hetzelfde patroon, en leg hem hier vast
zodra hij één keer gebruikt is.

### Afspraken binnen die opzet

- **Overal `f`, `g` en `h`**, net als in het boek — voor élke regel. Stapel je
  regels, hernoem het deel dan naar `p`, `q`, `r` en zeg dat hardop (zie
  "Botsende letters" hierboven). Nooit stilzwijgend twee betekenissen voor
  dezelfde letter op één pagina.
- **In beeld altijd mét variabele** (`g(x) = 5`), terwijl de stem de letters
  kaal uitspreekt ("u is vijf").
- **Groen = het deel dat af is, terracotta = het deel dat nog werk kost.** De
  chip die naar een volgende regel wijst, krijgt de kleur van het deel waar hij
  over gaat.
- **Elke scène begint met wat er al staat**: regelkaart en het deel waar we
  aan rekenen staan er op frame 5 al, zodat de kijker niet wacht.
- **Eén nieuw ding per beat.** Nooit twee regels tegelijk laten verschijnen.
- **Een bijschrift verklaart een stap, het waarschuwt niet.** Voer je op dat
  moment een bewerking uit die de kijker niet vanzelf ziet, dan mag daar één
  regel onder: *"handig: haal de 3 naar binnen, dan zie je twee losse factoren
  staan"*, *"(er zit geen x in)"*, *"de min gaat over álle termen heen"*. Die
  vertellen wat er nét gebeurde en waarom.
  Wat niet mag: waarschuwingen en geheugensteuntjes die alleen herhalen wat de
  stem toch al zegt — *"let op de min in de teller"*, *"bij een breuk mag je ze
  niet omdraaien"*, *"de noemer laat je staan"*. Wil je daar de aandacht op
  vestigen, doe dat met kleur (het minteken in terracotta), een omcirkeling of
  een label bij de formule zelf, en laat de stem het zeggen.
  Vuistregel: kun je het bijschrift weglaten zonder dat de kijker de stap
  kwijtraakt? Dan weg ermee.
- **Let op de hoogte.** Een regelscène met kaart, opgave, drie stap-rijen en
  vier formuleregels past niet op 1080 px met de standaardruimte. Zet `Scene`
  dan op een kleinere `gap` en breng de formules terug naar ±30 px in plaats
  van het beeld te laten overlopen. Render altijd een still van de vólste
  scène voor je de video rendert.
- **Bestanden per video**: `src/scenes-som<N>.tsx` (scènes + `TEMPO`),
  `src/Som<N>Video.tsx` (scèneduren + voice-over), `src/som<N>-helpers.tsx`
  (de opgave en de notatie), `src/cues-som<N>.ts` (presenter),
  `scripts/genereer-voiceover-som<N>.sh` en `VOICEOVER-som<N>.md`.
  Registreer de compositie in `src/Root.tsx` en zet er een `render:som<N>`
  script bij in `package.json`.

## Voice-over

- **ElevenLabs, stem Pauline** (`6UGZSawYvSTRIMHxH2uW`, native NL) — de stem
  van de som-video's; houd de hele reeks op dezelfde stem. Geen Engelse
  premade-stemmen: de r en de l klinken dan Engels. (De eerdere video's
  gebruikten Emma, `OlBRrVAItyi00MuGMbna`.)
- **Zeg nooit "accent"** ("g-accent") — zeg "de afgeleide van g".
- **Nooit "Gelukt!"** (of iets anders zelffelicitatie-achtigs) aan het eind.
  De video stopt bij het antwoord; de uitkomst groot in beeld is de afsluiting.
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
