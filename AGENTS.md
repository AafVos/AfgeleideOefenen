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
| Bouw voor Workers   | `npm run cf:build`  | als je servercode, config of pakketten raakt |

Lint, typecontrole, de rekenregels, de Workers-bouw en de e2e-tests draaien ook automatisch
bij elke pull request (`.github/workflows/controle.yml`). Daar start Supabase bewust kaal
(alleen database, inloggen en de data-API) en wordt de e2e-controle
overgeslagen als een pull request alleen tekst verandert. Lokaal start
`npx supabase start` gewoon alles, inclusief Studio.

## Lokaal op Workers

De live site staat nog op Vercel. Dezelfde code kan ook op Cloudflare
Workers, via OpenNext. Zo draai je die versie op je eigen computer:

```bash
cp .dev.vars.example .dev.vars   # één keer; blijft buiten git
npm run cf:preview
```

`npm run cf:preview` bouwt de site en start hem in de Workers-omgeving.
`npm run dev` blijft de gewone ontwikkelserver. Zet de site niet zelf live
met `wrangler` of `opennextjs-cloudflare deploy`.

Botst een pull request met `main`, dan maakt GitHub de samengevoegde versie
niet aan en start die controle helemaal niet. Niet rood en niet "in
afwachting": in `gh pr checks` blijven alleen de Vercel-regels over. De check
"Botst met main" (`.github/workflows/botst-met-main.yml`) draait op de tak
zelf en wordt dan rood, met de bestanden die botsen. Voeg `main` samen of
rebase, en duw opnieuw — daarna start de controle vanzelf.

Ontbreekt de controle-run (omdat `main` na je laatste push is verschoven, of
omdat de rode check hierboven er ook niet is), kijk dan eerst of de pull
request botst:

```bash
gh pr view <nummer> --json mergeable,mergeStateStatus
```

Staat `mergeable` op `false`, of `mergeStateStatus` op `dirty`, dan is dat de
reden. Zelfde stap: `main` erbij halen en opnieuw duwen. Achterlopen zonder
conflict is geen probleem: de controle draait dan gewoon op de samengevoegde
versie.

## Migraties in de titel

Een pull request die een bestand in `supabase/migrations/` toevoegt, zet het
woord "migratie" in de titel. Welke van die bestanden al op de echte database
gedraaid zijn, staat in `supabase_migrations.schema_migrations` (versie en
naam). Migratie `0029_schema_migrations.sql` maakt die tabel aan en vult hem
met 0001 t/m 0028, de bestanden waarvan het resultaat al aanwezig was.

## Een keer per nacht: wijkt het dashboard af?

`.github/workflows/dashboard-vergelijken.yml` draait elke ochtend (en met de
hand vanaf het tabblad Actions) `supabase config diff` tegen het echte project.
Zo valt het op als iemand iets in het Supabase-dashboard heeft veranderd zonder
`supabase/config.toml` bij te werken, of andersom.

* **Alleen lezen.** Deze controle doet nooit `supabase config push`; dat project
  draagt de echte accounts en voortgang van leerlingen.
* **Bij verschil komt er een issue in de repo**, geen rode controle. Een
  waarschuwing in een logboek leest niemand, en een pull request van iemand
  anders hoort niet te blijven hangen door iets wat die persoon niet
  veroorzaakt heeft. Is het verschil weg, dan sluit de controle de melding
  zelf.
* Hij heeft het geheim `SUPABASE_ACCESS_TOKEN` nodig (GitHub → Settings →
  Secrets). Staat dat er niet, dan slaat de controle zichzelf over met uitleg.
* Deze repo is openbaar, en het logboek van de run dus ook. E-mailadressen en
  wachtwoorden worden uit de uitvoer gehaald voordat er iets wordt
  opgeschreven; het hele verschil zie je met `npx supabase config diff` op je
  eigen computer.

## Elke ochtend: wat is er samen live gegaan?

`.github/workflows/dagelijkse-release.yml` maakt elke ochtend (en met de hand
vanaf het tabblad Actions) een GitHub Release met de datum als tag, bijvoorbeeld
`v2026-10-13`. In de tekst staan de titels van wat er sinds de vorige release
op `main` is gemerged.

Elke merge op `main` blijft meteen live. Er komt geen versienummer in
`package.json`. Is er niets nieuws, dan komt er geen release. De eerste keer,
als er nog geen datum-release is, staan alleen de pull requests van de
afgelopen 24 uur erin, en de tag op de huidige `main` is daarna het beginpunt.

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
* een **neppe Resend** (`scripts/nep-resend.mjs`) voor de mail die de site
  zelf stuurt — de welkomstmail. `scripts/e2e.mjs` start dat postkantoortje op
  een vrije poort en wijst `RESEND_BASE_URL` daarheen; `e2e/postbus.ts` haalt
  de opgevangen mail weer op met `wachtOpSitemail`;
* een **neppe AI-controle** (`AI_CHECK_MODE=stub`), zodat er geen Gemini aan
  te pas komt. Die schakelaar doet niets zodra `NODE_ENV` op `production`
  staat — zie `src/lib/ai/stub.ts`.

De welkomstmail van de site zelf gaat via Resend en komt dus **niet** in de
testpostbus van Supabase, maar in de neppe Resend hierboven.
`e2e/nieuwe-leerling.spec.ts` kijkt na dat hij na het eerste inloggen echt
uitgaat, naar het juiste adres, en maar één keer — ook na opnieuw inloggen.
Dezelfde postbus controleert de webhook `/api/webhooks/welkom`: met het juiste
geheim komt de mail, met een verkeerd geheim een 401 en niets. Wat er in de
mail staat, controleert daarnaast `src/lib/email/welkom.test.ts`.

De tests mogen nooit echte mail versturen: wijst `RESEND_BASE_URL` naar iets
anders dan deze computer, dan stopt `scripts/e2e.mjs` met uitleg.

Wat deze tests níét kunnen controleren: of de echte mail in productie ook
aankomt. De instellingen van het echte project staan wel in de repo, onderaan
`supabase/config.toml` onder `[remotes.productie]` — maar ze komen daar pas
terecht als iemand met de hand `supabase config push` draait, en de
SMTP-gegevens bij Resend staan er sowieso niet in. Zie "De instellingen van de
echte site" in `README.md`.

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
  in een migratie. Een migratie draait op de productiedatabase met de echte
  accounts en voortgang van leerlingen; testopgaven horen daar niet thuis.
* Verander je iets in `supabase/config.toml`, dan pikt een draaiende Supabase
  dat niet vanzelf op: `npx supabase stop && npx supabase start`. Bevestigen
  per mail staat daar aan, net als op de echte site.
* Zet geen echte accounts of echte sleutels in de tests.
* Rekent een test op voortgang, bedenk dan dat alle tests dezelfde
  testleerling gebruiken. `e2e/schone-start.ts` zet die voortgang vóór elke
  run terug.
