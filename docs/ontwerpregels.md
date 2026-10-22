# Ontwerpregels — afgeleideoefenen.nl

Vastgelegd op basis van wat er nu al staat in `src/app/globals.css` en
`src/components/ui.tsx`. Bij twijfel: de variant die het vaakst voorkomt wint.
Wijzig je deze regels later, zet er dan een datum en een reden bij.

## Kleuren en hun betekenis
- Achtergrond `--color-bg` (`#f7f6f3`), kaarten `--color-surface` (wit),
  een tint donkerder `--color-surface-2` voor rustige vlakken.
- **Goed/actie**: `--color-accent` (groen, `#2d6a4f`), lichte variant
  `--color-accent-light` voor vlakken.
- **Fout/gevaar**: `--color-accent-2` (terracotta, `#be444a`), lichte
  variant `--color-accent-2-light`.
- Tekst: `--color-text`, gedempt `--color-text-muted`, rand `--color-border`.
- Gebruik deze tokens, geen losse Tailwind-kleuren als `emerald-50` of
  `rose-300`. Dat is al een keer gebeurd in `exercise-tile-grid.tsx` — niet
  herhalen.

## Lettergrootte en koppen
- Koppen **en** getoonde formules: `font-serif`. Lopende tekst en knoppen:
  `font-sans` (standaard).
- `h1`: `font-serif text-4xl` (grotere pagina's ook `sm:text-5xl`).
- `h2`: `font-serif text-2xl`. `h3`: `font-serif text-lg` of `text-xl`.
- Eyebrow/label boven een kop: `text-xs font-medium uppercase tracking-wider
  text-text-muted`.

## Knoppen
Gebruik de gedeelde `Button` uit `src/components/ui.tsx`:
`primary` (hoofdknop, groene vlakke knop), `secondary` (rand, witte
achtergrond), `ghost` (geen rand, voor een minder belangrijke actie),
`danger` (voor iets dat niet terug te draaien is).

- **Altijd minstens 44 pixels hoog**: `min-h-11` erbij, ook al dwingt de
  component dat nu niet zelf af. Voorbeeld:
  `<Button variant="primary" className="min-h-11 px-5">Opslaan</Button>`.
- Eén hoofdknop per scherm/stap. Twee knoppen die precies hetzelfde doen of
  er hetzelfde uitzien maar iets anders doen: niet doen.
- Een tekstlink (geen kader, geen achtergrond) gebruik je voor iets dat geen
  knop-gewicht verdient — een "annuleren" of "ik weet het later wel". Er is
  nog geen aparte variant voor; gebruik `ghost` met duidelijke tekst, geen
  kale `<a>` die op gewone tekst lijkt.
- Taal op knoppen: kort, je-vorm, een werkwoord. "Controleren", niet
  "Controleer je antwoord hier".

## Afstanden, kaarten en tegels
- Kaarten: `rounded-xl border border-border bg-surface p-5`, geen schaduw —
  diepte komt van rand + achtergrondtint, niet van `box-shadow`.
- Rondingen: `rounded-md` voor velden/kleine knoppen, `rounded-lg` voor
  losstaande knoppen, `rounded-xl` voor kaarten/tegels, `rounded-2xl` alleen
  voor een gespreksballon of pop-over (zoals het poppetje).
- Ruimte: `px-4`/`px-5` samen met `py-2`/`py-3` voor knoppen en kaarten,
  `gap-2`/`gap-3` tussen tegels, `mt-6`/`mt-8`/`mt-10` tussen secties op een
  pagina.

## Wat is klikbaar?
Iets dat geen knop, link of tegel is, mag er ook niet zo uitzien: geen
onderstreepte tekst, geen rand-met-schaduw, geen handje-cursor-gevoel zonder
dat er iets gebeurt. Een tegel die klikbaar is, krijgt een hover-tint in de
eigen status-kleur (zie `exercise-tile-grid.tsx`: groen bij laatst goed,
terracotta bij laatst fout, grijs anders) — nooit alleen een schaduw die bij
niet-klikbare kaarten ook kan voorkomen.

## Formules
Nooit afgekapt op 390 pixels. Twee bestaande hulpmiddelen, geen harde
max-breedte:
- Lange formule in een `overflow-x-auto`-vlak, zodat hij desnoods opzij
  scrolt in plaats van over de rand te lopen.
- De `wrap`-optie op `Math`/`RichMath` (`src/components/math.tsx`) dwingt een
  formule om netjes af te breken op een smal scherm, in plaats van over de
  rand te lopen.

## Het poppetje (Aaf)
In rust: rechtsonder in beeld (`fixed bottom-4 right-4`), 44 pixels. Tijdens
de rondleiding verplaatst hij zich en mijdt daarbij actief het element waar
hij naar wijst. Andere content houdt rechtsonder ruimte vrij voor hem (zie
`site-footer.tsx`, die daar met `pr-20` voor plaats vrijhoudt) — nieuwe
content rechtsonder in beeld doet dat ook.

## Meldingen, lege schermen en laden
- Echte fout: `ErrorBanner` — rand en achtergrond in de fout-kleur, rol
  `alert`.
- Klein, niet-fataal haapje (bijvoorbeeld bij nakijken): `NakijkMelding` —
  rustiger, grijze toon, geen alarm.
- Geslaagd/bevestiging: groene toon (`bg-accent/10 text-accent` of
  `accent-light`).
- Goed/fout bij een antwoord: alleen kleur en tekst (groen/terracotta), geen
  icoontjes.
- Laden: de gedeelde `PageSpinner`, geen eigen spinner of skelet bouwen.
- Lege of kapotte pagina: zie `fout-pagina.tsx` — kop, korte uitleg, een
  knop terug naar oefenen.
