<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

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

## Releaseproces: rechtstreeks naar `main`

Er is één beschermde tak: `main`, de live site. Tak vanaf `origin/main`,
pull request naar `main` (`gh pr create`). Controles groen → mergen
(squash), rechtstreeks op `main`. Gaat het om iets kritieks (de site, het
inloggen of het registreren doet het niet; het nakijken rekent een goed
antwoord fout of een fout antwoord goed; een beveiligings- of privacylek of
gegevens die verloren gaan; de bouw of de controles op `main` zijn stuk), zet
dan `[Kritiek]` vooraan de titel.

Elke merge op `main` is meteen live: Cloudflare Workers Builds bouwt `main`
en zet de nieuwe versie direct op afgeleideoefenen.nl (worker
`afgeleide-oefenen`). Er is geen tussentak en geen aparte
release-pull-request.

### Er is geen voorbeeldversie van een tak

Workers Builds bouwt elke pull request-tak, maar die bouw **faalt** (zie het
bot-bericht "Deploying Preview to Cloudflare" bij een pull request, en de
check `Workers Builds: afgeleide-oefenen`). Zolang die faalt wordt er geen
versie geüpload en is er dus geen voorbeeldversie. De adressen zelf zijn
goed: de worker heeft preview-URL's aanstaan — een onbekend adres antwoordt
met `x-preview-user-error: true`, niet met "worker bestaat niet".

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
2. Controleren dat bouwen voor niet-productietakken aan staat.
3. Werkt het, zet de link dan weer terug in dit bestand en in `README.md`. De
   inlog-adressen staan al goed: in `supabase/config.toml` dekt
   `https://*-afgeleide-oefenen.alhvos.workers.dev/**` elke tak.

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

Botst een pull request met zijn doeltak (`main`), dan maakt GitHub de
samengevoegde versie niet aan en start die controle helemaal niet.
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

## Oefenstof-migraties: de snelle check (`npm run test:oefenstof`)

Een migratie **telt als oefenstof** als zijn bestandsnaam `_oefenstof_` bevat
(bijvoorbeeld `0087_oefenstof_h2_raaklijn_vergelijking.sql`) én hij alleen
`INSERT`/`UPDATE`/`DELETE` op de vraagtabellen bevat (`topics_new`,
`topic_clusters_new`, `questions_new`, `question_steps_new`), plus de
gebruikelijke `DO $$ ... $$`-verificatie en eventuele `pg_temp`-hulpfuncties
(zie migratie 0083 voor dat patroon). Een migratie die schema raakt (nieuwe
tabel, kolom, policy, trigger, extensie, of een `public`-functie) hoort **geen**
`_oefenstof_` in de naam te krijgen, ook niet als hij toevallig ook vragen
bijwerkt — dan telt hij als een gewone migratie en draait de volle controle.

`npm run test:oefenstof` (`src/lib/practice/oefenstof.test.ts`, met de parser
in `oefenstof-migraties.ts`) leest **alle** `_oefenstof_`-migraties in
`supabase/migrations/` — niet alleen die van de huidige pull request — en
controleert zonder database, in seconden:

* het eigen `answer` en elk `answer_alternatives`-item worden door
  `answersMatch` goedgerekend;
* alle LaTeX (de vraag, het antwoord met zijn `answer_prefix`, en elke stap)
  rendert zonder fout met KaTeX;
* er staat geen losse functienaam `u`, `v` of `w` (alleen `f`, `g`, `h`);
* elke (onderwerp, soort)-combinatie die in deze migraties voorkomt heeft
  minstens 8 vragen.

Dit controleert **niet** of het antwoord ook wiskundig klopt — dat blijft een
losse test per migratie die de som onafhankelijk narekent, zoals
`kromme-door-toppen.test.ts` al deed.

**De vaste vorm.** De parser verwacht precies de vorm die recente migraties al
gebruiken (zie bijvoorbeeld `0065_h6_kromme_door_toppen.sql`): een
`INSERT INTO public.questions_new (...) SELECT ... FROM (VALUES (...), (...))
AS v(order_index, difficulty, latex_body, answer, latex_answer,
answer_prefix, alternatives)`, met de teksten tussen dollar-quotes
(`$vraag$...$vraag$`) en de alternatieven als `ARRAY[...]::text[]`, gevolgd
door `JOIN public.topics_new t ON t.slug = '...'` en
`JOIN public.topic_clusters_new c ON ... c.slug = '...'`. Stappen volgen
dezelfde vorm in `public.question_steps_new`, met kolommen
`(q_order, step_order, step_description)`. Wijk je van deze kolomvolgorde af,
dan leest de parser de migratie niet (en faalt de test met een duidelijke
foutmelding in plaats van iets stilletjes verkeerd te lezen).

In `.github/workflows/controle.yml` slaat de job `Weg van een leerling` de
browser over als **alle** gewijzigde bestanden ofwel tekst zijn (zoals nu al)
ofwel oefenstof-migraties die met bovenstaande filenaam-regel overeenkomen
**en** geen schema-trefwoorden bevatten (`CREATE TABLE`, `ALTER TABLE`, een
`public`-functie, enzovoort) — dat laatste is een veiligheidsnet voor een
migratie die per ongeluk toch `_oefenstof_` heet.

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
* Hij kijkt naar `main`, dus naar wat live staat.
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
pull requests die sinds de vorige release op `main` terecht zijn gekomen.

Hij draait zodra er iets op `main` gemerged wordt, en daarnaast elke ochtend
als vangnet, plus met de hand vanaf het tabblad Actions. Bestaat de tag van
vandaag al, dan doet een tweede run niets.

Elke merge op `main` blijft meteen live. Er komt geen versienummer in
`package.json`. Is er niets nieuws, dan komt er geen release. De eerste keer,
als er nog geen datum-release is, staan alleen de pull requests van de
afgelopen 24 uur erin, en de tag op de huidige `main` is daarna het beginpunt.

## Elke dag om 16:00 UTC: de herinneringsmail en het onderhoud van de klikmeting

De eerste geplande taak die niet op GitHub draait maar op de Worker zelf
(AFG-487). `triggers.crons` in `wrangler.jsonc` laat Cloudflare elke dag de
`scheduled`-ingang aanroepen; die staat in de ingang-sjabloon bovenin
`scripts/statische-cache.mjs` en geeft het door aan `/api/cron/herinneringen`
en `/api/cron/meting-onderhoud`, met het geheim `WEBHOOK_SECRET` in de kop.
Er komt dus geen nieuw geheim bij. Faalt één van de twee routes, dan draait
de andere gewoon door.

`/api/cron/meting-onderhoud` roept `site_meting_onderhoud()` aan (AFG-667):
die werkt `site_dagtotalen` bij tot gisteren en ruimt rijen ouder dan 90 dagen
op. Eerder liftte dat mee op 1% van de verzoeken aan `/api/meet`; bij weinig
verkeer (een schoolvakantie) kon dat dagenlang niet gebeuren.

* **Opt-in.** `profiles.herinnering_mail` staat standaard uit. De leerling zet
  hem zelf aan op het dashboard, en krijgt daarbij eerst de vraag of hij 16 of
  ouder is. Onder de 16 hoort toestemming van een ouder; zolang daar niets
  voor is, blijft hij uit.
* **De regels staan los van de database** in `src/lib/herinnering/kiezen.ts`:
  zeven dagen stil, hoogstens één mail per veertien dagen, nooit meer dan drie
  in totaal, en hoogstens vijftig per ronde. Is alles beheerst, dan is er
  niets om naartoe te wijzen en gaat er niets uit.
* **De tellers zijn van de server.** `herinnering_laatst_op`,
  `herinnering_aantal` en `herinnering_sleutel` kan een leerling niet zelf
  zetten; een trigger in migratie 0082 zet ze terug. Anders kon hij zichzelf
  eindeloos mail laten sturen.
* **Afmelden kan zonder in te loggen**, via `/nl/herinnering-uit` met het
  willekeurige nummer uit `herinnering_sleutel` — nooit het gebruikersnummer.
* **Lokaal nalopen** hoeft niet op een cron te wachten:

  ```bash
  curl -X POST -H "x-webhook-secret: $WEBHOOK_SECRET" \
    http://localhost:3000/api/cron/herinneringen
  ```

  In het antwoord staan alleen aantallen, nooit adressen. `e2e/herinnering.spec.ts`
  doet precies dit, met de neppe Resend ervoor.

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

### In de controle: drie machines, elk een derde van de tests

Op je eigen computer draait de hele suite achter elkaar. In GitHub Actions
staat hij sinds AFG-491 over drie machines verdeeld
(`npm run test:e2e -- --shard=<n>/3`). Achter elkaar op één machine duurde hij
9 minuten en 56 seconden, met een grens van tien: één test die een tweede
poging nodig had, liet de hele stap al omvallen terwijl er niets stuk was.

Waarom drie machines en niet drie browsers naast elkaar op één machine: dat
laatste is geprobeerd en het hielp nauwelijks. Een runner heeft vier kernen,
en die zitten al vol met de ontwikkelserver van Next plus één browser. Vier
browsers tegelijk maakte elke losse test drie keer zo langzaam en leverde
onder de twintig procent tijdwinst op.

Wat dat betekent als je een test schrijft:

* Playwright verdeelt per **testbestand**, niet per test — tests uit hetzelfde
  bestand blijven bij elkaar zolang `fullyParallel` uit staat. Hoort je test
  bij een bestaande test (dezelfde voortgang, dezelfde opgave), zet hem dan in
  hetzelfde bestand;
* elk deel heeft zijn eigen wegwerp-Supabase, dus twee delen kunnen elkaar
  niet in de weg zitten;
* de verplichte check heet `Weg van een leerling` en draait zelf geen tests:
  hij kijkt alleen of `Weg van een leerling (deel 1/2/3)` alle drie geslaagd
  zijn. Zoek bij rood dus eerst op welk deel.

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
