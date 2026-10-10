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

Lint, typecontrole, de rekenregels en de e2e-tests draaien ook automatisch
bij elke pull request (`.github/workflows/controle.yml`). Daar start Supabase bewust kaal
(alleen database, inloggen en de data-API) en wordt de e2e-controle
overgeslagen als een pull request alleen tekst verandert. Lokaal start
`npx supabase start` gewoon alles, inclusief Studio.

## De e2e-tests: een echte browser door de site

In `e2e/` staan Playwright-tests die de weg van een leerling nalopen:
inloggen → hoofdstuk, onderwerp en soort som kiezen → opgave openen →
antwoord typen → nakijken → voortgang op het dashboard.

Daarnaast loopt `e2e/nieuwe-leerling.spec.ts` de weg van iemand die hier nog
nooit geweest is: registreren → de bevestigingsmail openmaken → op de link
klikken → inloggen → eerste opgave. Plus de foutpaden: een adres dat al
bestaat, een te kort wachtwoord, inloggen vóór bevestigen, en wachtwoord
vergeten.

Ze draaien **nooit** tegen de echte site of de echte database. Alles is
lokaal:

* een **lokale Supabase** met de migraties en `supabase/seed.sql`;
* een **vaste testleerling** uit die seed: `leerling@test.local` /
  `oefenen123` (lokaal, dus geen geheim);
* **vaste testopgaven** in een eigen testhoofdstuk uit die seed, zodat de
  tests niet omvallen als de echte oefenstof verandert;
* **wegwerpaccounts** die de tests zelf aanmaken (`nieuw-<tijd>@test.local`);
  `e2e/schone-start.ts` ruimt ze vóór elke run op;
* een **testpostbus** (Mailpit, poort 54324) waar de mail van Supabase in
  blijft hangen. `e2e/postbus.ts` maakt hem daar open via de HTTP-API, dus er
  gaat nooit echt een mail de deur uit;
* een **neppe AI-controle** (`AI_CHECK_MODE=stub`), zodat er geen Gemini aan
  te pas komt. Die schakelaar doet niets zodra `NODE_ENV` op `production`
  staat — zie `src/lib/ai/stub.ts`.

De welkomstmail van de site zelf gaat via Resend en komt dus **niet** in de
testpostbus. `scripts/e2e.mjs` zet `RESEND_API_KEY` leeg, zodat hij lokaal
stil overgeslagen wordt; wat erin staat, controleert
`src/lib/email/welkom.test.ts`.

Wat deze tests níét kunnen controleren: of de echte mail in productie ook
aankomt. Dat hangt aan de instellingen in het Supabase-dashboard en bij
Resend, niet aan code in deze repo.

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
* Verander je iets in `supabase/config.toml`, dan pikt een draaiende Supabase
  dat niet vanzelf op: `npx supabase stop && npx supabase start`. Bevestigen
  per mail staat daar aan, net als op de echte site.
* Zet geen echte accounts of echte sleutels in de tests.
* Rekent een test op voortgang, bedenk dan dat alle tests dezelfde
  testleerling gebruiken. `e2e/schone-start.ts` zet die voortgang vóór elke
  run terug.
