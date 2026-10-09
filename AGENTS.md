<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Controles vóór je mergt

| Wat                 | Commando            | Wanneer                         |
| ------------------- | ------------------- | ------------------------------- |
| Lint                | `npm run lint`      | altijd                          |
| Typecontrole        | `npm run typecheck` | altijd                          |
| Rekenregels (snel)  | `npm test`          | als je aan nakijken/voortgang zit |
| Weg van een leerling| `npm run test:e2e`  | als je aan inloggen, oefenen, nakijken of het dashboard zit |

Lint, typecontrole en de e2e-tests draaien ook automatisch bij elke pull
request (`.github/workflows/controle.yml`).

## De e2e-tests: een echte browser door de site

In `e2e/` staan Playwright-tests die de weg van een leerling nalopen:
inloggen → hoofdstuk, onderwerp en soort som kiezen → opgave openen →
antwoord typen → nakijken → voortgang op het dashboard.

Ze draaien **nooit** tegen de echte site of de echte database. Alles is
lokaal:

* een **lokale Supabase** met de migraties en `supabase/seed.sql`;
* een **vaste testleerling** uit die seed: `leerling@test.local` /
  `oefenen123` (lokaal, dus geen geheim);
* **vaste testopgaven** in een eigen testhoofdstuk uit die seed, zodat de
  tests niet omvallen als de echte oefenstof verandert;
* een **neppe AI-controle** (`AI_CHECK_MODE=stub`), zodat er geen Gemini aan
  te pas komt. Die schakelaar doet niets zodra `NODE_ENV` op `production`
  staat — zie `src/lib/ai/stub.ts`.

### Eén keer klaarzetten

```bash
npm ci
npx playwright install chromium
npx supabase start          # Docker moet draaien
```

### Elke keer

```bash
npx supabase db reset       # verse database: migraties + seed
npm run test:e2e
```

`npm run test:e2e` start zelf een ontwikkelserver op `localhost:3177` en
haalt de sleutels van de lokale Supabase op. Draait er geen lokale Supabase,
dan stopt het commando met uitleg in plaats van ergens anders te testen.

Handig:

```bash
npm run test:e2e -- --project=computer   # alleen computerformaat
npm run test:e2e -- --headed             # meekijken in de browser
npm run test:e2e -- --ui                 # klikken door de testuitslag
E2E_PORT=3178 npm run test:e2e           # als poort 3177 bezet is
```

De tests draaien op computerformaat (1280×800); de belangrijkste weg draait
daarnaast nog een keer op telefoonformaat (390×844).

### Regels bij het uitbreiden

* Nieuwe testopgaven horen in het testhoofdstuk in `supabase/seed.sql`, niet
  in een migratie. De database is gedeeld met integraaloefenen.nl; een
  migratie raakt die site ook.
* Zet geen echte accounts of echte sleutels in de tests.
* Rekent een test op voortgang, bedenk dan dat alle tests dezelfde
  testleerling gebruiken. `e2e/schone-start.ts` zet die voortgang vóór elke
  run terug.
