<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

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

## Dagelijkse release: van `volgende` naar `main`

Er zijn twee beschermde takken. `main` is de live site. `volgende` is waar
gewoon werk naartoe gaat.

* **Gewoon werk.** Tak vanaf `origin/volgende`, pull request naar `volgende`
  (`gh pr create --base volgende`). Controles groen → mergen (squash).
* **Eén keer per dag** maakt `.github/workflows/release-pr.yml` om 05:00 UTC
  (of met de hand vanaf het tabblad Actions) de pull request `volgende` →
  `main`, met daarin wat erin zit en welke migraties. Staat hij al open, dan
  wordt alleen de tekst bijgewerkt. Aaf bekijkt hem en merget zelf. **Die ene
  pull request merge je met "Create a merge commit", niet met squash** —
  anders kent `volgende` de commit op `main` niet en lopen de takken uit
  elkaar.
* **Kritiek gaat rechtstreeks naar `main`.** Kritiek is: de site, het
  inloggen of het registreren doet het niet; het nakijken rekent een goed
  antwoord fout of een fout antwoord goed; een beveiligings- of privacylek of
  gegevens die verloren gaan; de bouw of de controles op `main` zijn stuk.
  Verder niets. Twijfel je, dan is het niet kritiek. Tak vanaf `origin/main`,
  pull request naar `main` met `[Kritiek]` vooraan de titel, zelf mergen
  zodra de controles groen zijn.
* **Terug naar `volgende`.** Na elke push op `main` haalt
  `.github/workflows/terug-naar-volgende.yml` die stand terug in `volgende`.
  Na een release is dat gewoon doorschuiven; na een kritieke fix een echte
  samenvoeging. Botst het, dan komt er een melding in Issues met de bestanden
  die botsen — daar moet dan met de hand een pull request naar `volgende`
  voor komen.

### Er is geen voorbeeldversie van `volgende` (en ook niet van een tak)

Eerder stond hier dat Workers Builds de stand van `volgende` op
`volgende-afgeleide-oefenen.alhvos.workers.dev` zet. **Dat adres
bestaat niet.** Het geeft 404, en dat gold ook voor de adressen per tak. Er
werd dus naar een dood adres gelinkt; die links zijn eruit gehaald.

Wat er wél gebeurt: Workers Builds bouwt elke pull request-tak, maar die bouw
**faalt** (zie het bot-bericht "Deploying Preview to Cloudflare" bij een pull
request, en de check `Workers Builds: afgeleide-oefenen`). Zolang die faalt
wordt er geen versie geüpload en is er dus geen voorbeeldversie. De adressen
zelf zijn goed: de worker heeft preview-URL's aanstaan — een onbekend adres
antwoordt met `x-preview-user-error: true`, niet met "worker bestaat niet".

Bekijk je werk dus lokaal: `npm run dev`, of `npm run cf:preview` voor de
Workers-versie.

**Wat er moet gebeuren om het terug te krijgen** (alleen Aaf kan dit; het kan
niet vanuit deze repo, want de instellingen van Workers Builds staan in het
Cloudflare-dashboard en er staat geen `CLOUDFLARE_API_TOKEN` in GitHub):

1. In het dashboard bij de worker `afgeleide-oefenen` → Settings → Builds: de
   bouwlog van een gefaalde tak-bouw lezen en de oorzaak wegnemen. Waarschijnlijk
   ontbreken de bouwvariabelen (`NEXT_PUBLIC_*`, zie `scripts/worker-omgeving.json`)
   voor niet-productietakken, of het commando voor niet-productietakken klopt
   niet — dat hoort `npx wrangler versions upload` te zijn, niet `deploy`.
2. Controleren dat bouwen voor niet-productietakken aan staat, zodat ook de
   tak `volgende` zelf gebouwd wordt (nu staat er op de kop-commit van
   `volgende` geen Workers-Builds-check).
3. Werkt het, zet de link dan weer terug in dit bestand, in `README.md` en in
   `scripts/release-pr.sh`. De inlog-adressen staan al goed: in
   `supabase/config.toml` dekt `https://*-afgeleide-oefenen.alhvos.workers.dev/**`
   elke tak.

### Waarom het zo in elkaar zit

* **`controle.yml` draait ook bij een push op `volgende`.** Een pull request
  die met `GITHUB_TOKEN` gemaakt is, start geen workflows, dus de
  release-pull-request krijgt zelf geen controles. GitHub kijkt voor de
  verplichte checks naar de kop-commit, en die staan er dankzij die push al
  op. Een squash-merge maakt bovendien een nieuwe commit die nog niemand
  getest heeft, dus dubbel werk is het niet. Ontbreken ze toch een keer, dan
  zegt de release-pull-request dat erbij; rechtzetten met
  `gh workflow run controle.yml --ref volgende`.
* **Terug naar `volgende` duwt met een deploy-key**, niet met
  `GITHUB_TOKEN`. De app GitHub Actions kan alleen in een organisatie
  uitzondering in een ruleset worden, en deze repo staat op een persoonlijk
  account. In de ruleset "volgende beschermen" staat daarom één
  uitzondering: deploy-keys. De enige die er is, is
  `terug-naar-volgende (workflow)`; de privésleutel staat in het geheim
  `TERUG_NAAR_VOLGENDE_SLEUTEL`. Ontbreekt dat geheim, dan slaat de workflow
  zichzelf over met uitleg. Alle andere wegen naar `volgende` lopen gewoon
  via een pull request.

## Lokaal op Workers

De live site draait op Cloudflare Workers (worker `afgeleide-oefenen`), via
OpenNext. Zo draai je die versie op je eigen computer:

```bash
cp .dev.vars.example .dev.vars   # één keer; blijft buiten git
npm run cf:preview
```

`npm run cf:preview` bouwt de site en start hem in de Workers-omgeving.
`npm run dev` blijft de gewone ontwikkelserver. Zet de site niet zelf live
met `wrangler` of `opennextjs-cloudflare deploy`. Na een merge doet Workers
Builds dat.

Botst een pull request met zijn doeltak (meestal `volgende`), dan maakt
GitHub de samengevoegde versie niet aan en start die controle helemaal niet.
Niet rood en niet "in afwachting": in `gh pr checks` blijven dan alleen de
controles over die op de tak zelf draaien, zoals Workers Builds. De check
"Botst met de doeltak" (`.github/workflows/botst-met-doeltak.yml`) draait op
de tak zelf en wordt dan rood, met de bestanden die botsen. Voeg de doeltak
samen of rebase erop, en duw opnieuw — daarna start de controle vanzelf.

Ontbreekt de controle-run (omdat de doeltak na je laatste push is verschoven,
of omdat de rode check hierboven er ook niet is), kijk dan eerst of de pull
request botst:

```bash
gh pr view <nummer> --json mergeable,mergeStateStatus
```

Staat `mergeable` op `false`, of `mergeStateStatus` op `dirty`, dan is dat de
reden. Zelfde stap: de doeltak erbij halen en opnieuw duwen. Achterlopen
zonder conflict is geen probleem: de controle draait dan gewoon op de
samengevoegde versie.

## Indeling van de oefenpagina

Leerlingen zien op `/oefenen` de indeling van het boek: hoofdstuk, paragraaf,
theorieblok. Daaronder staan de soorten sommen als kopjes boven de tegels.
Hoofdstukken zonder boekparagrafen (Beweging, Examentraining) houden hun
eigen indeling.

De oude indeling per onderwerp staat uit. Om hem weer aan te zetten: in
`src/lib/practice/oefenen-indeling.ts` laat `oefenIndeling()` `'onderwerp'`
teruggeven in plaats van `'blok'`. Standaard is `'blok'`. Dezelfde
schakelaar geldt voor het dashboard en de zelf-toets.

## Migraties in de titel

Een pull request die een bestand in `supabase/migrations/` toevoegt, zet het
woord "migratie" in de titel. Welke van die bestanden al op de echte database
gedraaid zijn, staat in `supabase_migrations.schema_migrations` (versie en
naam). Migratie `0029_schema_migrations.sql` maakt die tabel aan en vult hem
met 0001 t/m 0028, de bestanden waarvan het resultaat al aanwezig was.

Mergen is niet hetzelfde als draaien: zie "Elke ochtend: is elke migratie ook
echt gedraaid?" hieronder.

## Elke ochtend: is elke migratie ook echt gedraaid?

`.github/workflows/migraties-vergelijken.yml` vergelijkt de bestanden in
`supabase/migrations/` op `main` met de rijen in
`supabase_migrations.schema_migrations` op de echte database. Staat er een
bestand in de repo dat daar niet in voorkomt, dan komt er een issue met alleen
die bestandsnamen erin. Is alles alsnog gedraaid, dan sluit de controle de
melding zelf.

Dit is nodig omdat "Weg van een leerling" alle migraties op een verse lokale
database draait: daar klopt het altijd. Een migratie die gemerged is maar nooit
op productie gezet, viel zo nergens op — bij `0071_eindexamenvragen_aanvulling`
stonden zestien eindexamenvragen maandenlang wel in de repo en niet op de site,
en bij `0061` ging het daarvoor net zo.

* **Alleen lezen.** De controle draait zelf nooit een migratie; dat blijft
  mensenwerk, met een reservekopie erbij als er iets weggehaald of veranderd
  wordt (zie `scripts/controleer-migraties.mjs`).
* Hij kijkt naar `main`, dus naar wat live staat. Een migratie die nog in een
  pull request zit, hoort nog niet gedraaid te zijn.
* Hij heeft het geheim `SUPABASE_DB_URL` nodig (GitHub → Settings → Secrets):
  de verbindingsgegevens van de echte database, de variant die over IPv4 werkt
  (de "session pooler"), want een GitHub-runner heeft geen IPv6. Staat dat
  geheim er niet, dan slaat de controle zichzelf over met uitleg.
* Deze repo is openbaar, en het logboek van de run dus ook. In de uitvoer staan
  alleen bestandsnamen van migraties; de verbindingsgegevens worden eruit
  gehaald en er wordt nooit iets uit de tabellen zelf gelezen.

Zelf nakijken kan ook:
`SUPABASE_DB_URL="$AFG_DB_URL" node scripts/controleer-migraties.mjs`.

## Een keer per nacht: wijkt het dashboard af?

`.github/workflows/dashboard-vergelijken.yml` draait elke ochtend (en met de
hand vanaf het tabblad Actions) `supabase config diff` tegen het echte project.
Zo valt het op als iemand iets in het Supabase-dashboard heeft veranderd zonder
`supabase/config.toml` bij te werken, of andersom.

* **Alleen lezen.** Deze controle doet nooit `supabase config push`; dat project
  draagt de echte accounts en voortgang van leerlingen.
* Hij kijkt naar `main`, dus naar wat live staat. Verander je
  `supabase/config.toml` (of `scripts/worker-omgeving.json`) in `volgende`,
  dan kan er één ochtend een verschil gemeld worden dat na de release vanzelf
  weer weg is.
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

## Elke ochtend: staan de geheimen op de Worker?

`.github/workflows/worker-omgeving.yml` vergelijkt de namen van de geheimen
op de Worker `afgeleide-oefenen` met `scripts/worker-omgeving.json`. Ontbreekt
er een, dan komt er een issue met alleen die naam. De controle slaat zichzelf
over als het geheim `CLOUDFLARE_API_TOKEN` niet in GitHub staat.

## Elke ochtend: wat is er samen live gegaan?

`.github/workflows/dagelijkse-release.yml` maakt een GitHub Release met de
datum als tag, bijvoorbeeld `v2026-10-13`. In de tekst staan de titels van de
pull requests die sinds de vorige release op `main` terecht zijn gekomen. Dat
is het lijstje achteraf; de release-pull-request hierboven is het lijstje
vooraf.

Hij draait zodra er iets op `main` gemerged wordt — dus meteen nadat Aaf de
release-pull-request merget — en daarnaast elke ochtend als vangnet, plus met
de hand vanaf het tabblad Actions. Bestaat de tag van vandaag al, dan doet een
tweede run niets.

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
* **vaste testleerlingen** uit die seed, één per werker:
  `leerling1@test.local` t/m `leerling4@test.local`, en daarnaast
  `nieuw1@test.local` t/m `nieuw4@test.local` voor wie de rondleiding nog
  nooit gezien heeft. Wachtwoord `oefenen123` (lokaal, dus geen geheim);
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
E2E_WORKERS=1 npm run test:e2e           # één browser tegelijk, rustiger kijken
```

De tests draaien op computerformaat (1280×800); de belangrijkste weg draait
daarnaast nog een keer op telefoonformaat (390×844).

### Vier browsers tegelijk, vier testleerlingen

De tests draaien met vier werkers naast elkaar. Elke werker krijgt zijn eigen
paar accounts uit de seed via de fixtures `leerling` en `nieuweLeerling`
(`e2e/leerling.ts`), zodat twee tests nooit in dezelfde voortgang zitten te
schrijven. Binnen één bestand blijven de tests wél op volgorde
(`fullyParallel: false`): in `leerling-pad.spec.ts` bouwt de ene test de reeks
op waar de volgende op rekent.

Wat dat betekent als je een test schrijft:

* pak de leerling uit de fixture, nooit een vast adres:
  `test('…', async ({ page, leerling }) => { await logIn(page, leerling) })`;
* gebruik `leerling.id` in een database-controle, zodat je de rijen van je
  eigen werker leest;
* hoort je test bij een andere al bestaande test (dezelfde voortgang, dezelfde
  opgave), zet hem dan in hetzelfde bestand. Twee bestanden kunnen tegelijk
  draaien.

Het aantal staat in `e2e/werkers.ts` en in de lus bovenaan
`supabase/seed.sql`. Die twee horen gelijk te zijn.

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
