# AfgeleideOefenen — de app

Dit is de mobiele app bij afgeleideoefenen.nl, gebouwd met
[Expo](https://expo.dev) (Expo Router + TypeScript). Geen eigen backend: de
app praat met dezelfde Supabase en dezelfde nakijk-API als de site in de
hoofdmap van deze repo. Deze map staat los van de site: een eigen
`package.json`, eigen afhankelijkheden, eigen controles.

## Starten

Eenmalig:

```bash
cd mobiel
npm install
cp .env.example .env   # vul de Supabase-gegevens in (vraag ze aan Aaf)
```

Daarna, elke keer:

```bash
npx expo start
```

In de uitvoer staan opties om de app te openen: in de browser (`w`), in
[Expo Go](https://expo.dev/go) op je telefoon (scan de QR-code), of in een
simulator.

### Zo test Aaf het op haar telefoon

1. Installeer [Expo Go](https://expo.dev/go) uit de App Store of Play Store.
2. Eenmalig inloggen vanaf de computer: `npx expo login`.
3. In de map `mobiel/`: `npx expo start`.
4. Scan de QR-code uit het terminalvenster met de camera van je telefoon (of
   met Expo Go zelf op Android). De app opent in Expo Go.

### Testen in de browser (zonder telefoon)

Er is geen Xcode of Android Studio nodig om te kijken of iets werkt:

```bash
npx expo start --web
```

Dit opent de app op `http://localhost:8081`. Zet de breedte van het
browservenster op ongeveer 390 pixels om te zien hoe het op een telefoon
oogt.

## Hoe de map is opgebouwd

Een korte uitleg per map, voor wie (nog) geen React Native kent:

- **`src/app/`** — elk bestand hier is een scherm. Dit heet **Expo Router**:
  de bestandsnaam bepaalt de URL/route, net zoals bij de site. `index.tsx` is
  het startscherm. `_layout.tsx` is geen scherm maar de "lijst om alle
  schermen heen": hij laadt de lettertypen en verbergt het opstartscherm
  zodra de app klaar is.
- **`src/components/`** — herbruikbare stukjes scherm. `poppetje.tsx` is het
  mascotte-poppetje van de site, hertekend met `react-native-svg` (React
  Native kan geen gewone `<svg>`-tags lezen zoals een browser). `math.tsx`
  (met een web-variant `math.web.tsx`) toont een KaTeX-formule; `rich-math.tsx`
  erboven toont tekst met `$...$`-formules erin. `math-keyboard.tsx` zijn de
  wiskundeknoppen (macht, wortel, breuk, pi) bij het antwoordveld.
- **`src/constants/`** — vaste waarden die overal gebruikt worden, hier de
  kleuren en lettertypen uit de huisstijl van de site
  (`src/app/globals.css` in de hoofdmap) en `API_BASE_URL`.
- **`src/lib/api/app-api.ts`** — alle aanroepen naar `/api/app/*` op de site
  (indeling ophalen, een opgave ophalen, een antwoord nakijken). Geen eigen
  backend: dezelfde Supabase-sessie van de leerling gaat als bearer-token mee.
- **`src/lib/practice/`** — pure logica, 1-op-1 gekopieerd uit de hoofdmap
  (zie de uitleg bovenin `input.ts`): het invoegen van tekst op de
  cursorpositie, de live LaTeX-preview, en het uit elkaar halen van tekst met
  `$...$`-formules erin.
- **`assets/images/`** — het app-icoon, het Android-icoon (los voorgrond-
  en achtergrondlaag, zo wil Android dat) en de afbeelding voor het
  opstartscherm. Allemaal afgeleid van hetzelfde poppetje.
- **`app.json`** — de instellingen van de app zelf: naam, icoon,
  opstartscherm, welke Expo-onderdelen ("plugins") meedoen. Dit is geen
  gewone TypeScript/JavaScript-code maar configuratie die Expo inleest.

## Wat er nog niet is

Inloggen (AFG-557) en oefenen/nakijken (AFG-558) staan er. Nog niet: "ik weet
het niet" (de uitwerking rechtstreeks opvragen zonder eerst een antwoord te
typen), de voortgangspagina, en een tegeloverzicht per soort som (de app
toont nu steeds één opgave tegelijk, zoals een setje flashcards — zie de
pull request van AFG-558 voor waarom).
