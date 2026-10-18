# afgeleideoefenen.nl

Nederlandse wiskundewebsite voor VWO-studenten om differentiëren te leren.
Gebouwd met **Next.js (App Router) + Supabase + Gemini**. Afspraken voor
wie aan de code werkt staan in [`AGENTS.md`](./AGENTS.md). In
[`idea.md`](./idea.md) klopt hoofdstuk 3 (de tabellen); de rest is het
plan van april 2026 en is geen bouwopdracht meer.

---

## Tech stack

| Laag        | Technologie                                   |
|-------------|-----------------------------------------------|
| Frontend    | Next.js 16 (App Router) + TypeScript + Tailwind |
| Backend     | Next.js API Routes                            |
| Database    | Supabase (PostgreSQL + Auth)                  |
| AI          | Google Gemini (`gemini-2.5-flash`)            |
| Wiskunde    | KaTeX                                         |
| Hosting     | Cloudflare Workers (OpenNext), worker `afgeleide-oefenen` |

---

## Snelstart

### 0. Node 24 of nieuwer

Dit project heeft **npm 11** nodig, en die zit bij Node 24. Werk je met `nvm`,
dan pakt `nvm use` de juiste versie uit [`.nvmrc`](./.nvmrc):

```bash
nvm use          # of: nvm install 24
node -v          # v24.x of hoger
npm -v           # 11.x of hoger
```

Op Node 22 (npm 10) stopt `npm ci` met een melding die niets over de oorzaak
zegt:

```
npm error code EUSAGE
npm error Missing: @swc/helpers@0.5.23 from lock file
```

Next.js 16.3.8 zet `@swc/helpers` vast op `0.5.23`. Daarnaast vraagt
`@swc/core` (meegeleverd via next-intl) diezelfde hulpfuncties als losse eis
(`>=0.5.17`). npm 11 lost die twee eisen samen op, npm 10 niet. Daarom staat
de eis op twee plekken vastgelegd: `engines.node` (`>=24`) in `package.json`
en `.nvmrc`. Die laatste lezen `nvm` en de automatische controle.

### 1. Installeer dependencies

```bash
npm install
```

### 2. Supabase project opzetten

1. Maak een gratis project aan op [supabase.com](https://supabase.com).
2. Zet de database klaar met **alle** bestanden in
   [`supabase/migrations/`](./supabase/migrations/), op bestandsnaam. Dat doet
   de Supabase-CLI (`npx supabase db push` tegen dat project). Twee losse
   bestanden in de SQL-editor laten de rest liggen: de latere migraties
   horen er net zo bij.
   [`supabase/seed.sql`](./supabase/seed.sql) hoort hier niet bij. Dat zijn
   alleen vaste testopgaven voor een lokale database.
3. Onder **Authentication → Providers** is "Email" standaard aan. Dat is
   voldoende voor Fase 1 van de bouwopdracht.

> **Admin rol toekennen**
> Na registratie heeft elke gebruiker `role = 'student'`. Om iemand admin
> te maken, draai in de SQL editor:
> ```sql
> update public.profiles set role = 'admin' where username = 'jouw_naam';
> -- óf op basis van het user id uit auth.users
> ```

### 3. Omgevingsvariabelen

Wat de live Worker nodig heeft, staat in [`docs/omgeving.md`](./docs/omgeving.md).
Hieronder hetzelfde voor je eigen computer.

Kopieer het voorbeeld en vul je eigen keys in:

```bash
cp .env.local.example .env.local
```

| Variabele                       | Waar te vinden |
|---------------------------------|--------------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → `anon` public key |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase → Project Settings → API → `service_role` key (**niet** in de browser gebruiken!) |
| `GEMINI_API_KEY`                | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) |
| `NEXT_PUBLIC_SITE_URL`          | Basis-URL van de site (lokaal: `http://localhost:3000`, productie: eigen domein) |
| `RESEND_API_KEY`                | [resend.com/api-keys](https://resend.com/api-keys) — zonder deze key gaat de mail die de site zelf stuurt er stil niet uit. De mail van het inloggen gaat niet hierlangs, zie [Mail gaat langs twee wegen](#mail-gaat-langs-twee-wegen) |
| `EMAIL_FROM`                    | Afzender van de mail die de site zelf stuurt; moet op een bij Resend geverifieerd domein staan. Standaard: `no-reply@afgeleideoefenen.nl` |
| `NOTIFY_EMAIL`                  | Adres waar alle post van de site heen gaat: het seintje "nieuwe gebruiker", feedback, een vraag via Aaf en een video-verzoek. Geen standaardwaarde: zonder deze regel gaan die berichten niet weg en ziet de leerling "Versturen is niet gelukt" |
| `WEBHOOK_SECRET`                | Zelf te verzinnen. Dezelfde waarde staat in de Vault als `webhook_secret`. De welkomstmail (migratie 0035) en het seintje bij een nieuwe registratie (migratie 0036) lezen hem daar. Zonder match: 401 |
| `NEXT_PUBLIC_GOOGLE_LOGIN`      | Zet op `1` om de knop "Doorgaan met Google" te tonen. Alleen als de provider in Supabase al aan staat. Live: bouwvariabele van Workers Builds, daarna een nieuwe bouw |

### 4. Start de dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Mail gaat langs twee wegen

Er zijn twee soorten mail, en ze worden door verschillende partijen verstuurd.
Wie een mail niet ziet aankomen, moet dus eerst weten wélke mail het is.

| Soort mail | Wie verstuurt | Waar instellen |
|------------|---------------|----------------|
| Welkomstmail, seintje "nieuwe gebruiker", feedbackformulier, video-verzoek | De site zelf, via Resend | `RESEND_API_KEY`, `EMAIL_FROM` en `NOTIFY_EMAIL` in de omgevingsvariabelen |
| Bevestig je e-mailadres, wachtwoord vergeten | **Supabase**, niet de site | `supabase/config.toml` (zie [De instellingen van de echte site](#de-instellingen-van-de-echte-site)); de SMTP-gegevens in Supabase → **Authentication → Emails → SMTP Settings** |

De mail van het inloggen loopt via `supabase.auth.signUp()`, `supabase.auth.resend()`
en `supabase.auth.resetPasswordForEmail()`. Die roepen de code van Resend niet
aan: Supabase verstuurt ze zelf. `RESEND_API_KEY` doet daar dus niets.

**Staat "Enable Custom SMTP" in Supabase uit, dan gebruikt Supabase zijn eigen
testmailer, en die laat maar een paar mails per uur door.** Meldt een hele klas
zich in hetzelfde lesuur aan, dan krijgen de meesten geen bevestigingsmail — en
zonder die mail kunnen ze niet inloggen. Op het scherm van de leerling is daar
niets van te zien.

Voor productie hoort "Enable Custom SMTP" daarom **aan** te staan, met de
SMTP-gegevens van Resend (host, poort en wachtwoord krijg je van Resend onder
*SMTP*). Het afzenderadres moet op een domein staan dat bij Resend op
*Verified* staat — `afgeleideoefenen.nl`. Staat het afzenderadres op een domein
dat Resend níét kent, dan komt er helemáál geen mail meer aan in plaats van een
paar per uur. Test na het omzetten dus meteen één aanmelding met een echt adres.

De sjablonen van die mails staan in [`supabase/email-templates/`](./supabase/email-templates/)
(`confirm-signup.html` en `reset-password-nl.html`).
Zolang ze nog niet één keer naar het echte project zijn geschreven, staan ze
daar met de hand in geplakt onder **Authentication → Emails** — zie de volgende
paragraaf.

---

## Klikmeting zonder koekjes

De site meet zelf wat bezoekers doen, ook zonder account. Dat gaat buiten
Cloudflare Web Analytics om: die telt alleen paginabezoeken.

* **Wat er in gaat** (tabel `site_gebeurtenissen`, migraties 0072 en 0073):
  tijdstip, een willekeurig id per tabblad uit `sessionStorage`, het
  volgnummer binnen dat tabblad, het soort gebeurtenis (`pagina`, `klik`,
  `dode_klik`, `woedeklik`, `fout`, `scroll`, `registratie`, `inlog`), het pad
  zonder queryparameters — op `van` en `utm_source` na —, de vaste naam van
  wat er aangeklikt is, telefoon/tablet/computer op schermbreedte, het domein
  van de verwijzer, of iemand is ingelogd, en de schuilnaam hieronder.
* **Wat er nooit in gaat:** geen koekje, geen IP-adres, geen user-agent, geen
  e-mailadres of gebruikers-id, niets uit een invoerveld, en niets op `/admin`.
* **Routes:** de database deelt het `volgnummer` uit, niet de browser — dan
  klopt de volgorde ook na een herlaadactie. `registratie` meldt de site zelf
  met `meldMeting()` zodra de aanmelding gelukt is; `inlog` zet `meet_opslaan`
  erbij op het moment dat een tabblad van uitgelogd naar ingelogd gaat.
* **Schuilnaam:** alleen bij een ingelogde leerling, en alleen om zijn klikken
  over meerdere dagen te kunnen volgen. Het is HMAC-SHA256 van het
  gebruikers-id, als hex, de eerste 16 tekens. Het gebruikers-id zelf komt
  nergens in de tabel. Het geheim staat op twee plekken, net als
  `WEBHOOK_SECRET`: als Worker-secret `MEET_SCHUILNAAM_GEHEIM` (daar rekent de
  site mee, `src/lib/meten/schuilnaam.ts`) en in de Vault als
  `meet_schuilnaam_geheim` (daar rekenen de overzichten mee,
  `meet_schuilnaam()`). **Dezelfde waarde**, anders sluiten de twee kanten
  niet op elkaar aan; `schuilnaam.test.ts` legt de rekensom vast. Ontbreekt
  het geheim, dan blijft de kolom leeg en werkt de rest gewoon. Wie niet is
  ingelogd krijgt niets blijvends — alleen het sessie-id van dat tabblad.
* **Hoe:** `src/lib/meten/meter.ts` verzamelt in de browser en stuurt elke drie
  seconden één pakketje met `navigator.sendBeacon` naar `/api/meet`. Dat
  scriptje laadt pas als de pagina er staat (`src/components/meten.tsx`). De
  rekenregels staan los in `src/lib/meten/gebeurtenis.ts`, met tests.
* **Namen van knoppen:** zet `data-meet="..."` op een knop of link. Staat die
  er niet, dan wordt het het soort element plus een korte tekst. De namen zijn
  op telefoon en computer hetzelfde, zodat de totalen optellen.
* **Grenzen:** hoogstens 300 gebeurtenissen per tabblad per uur, bekende
  crawlers en testbrowsers (`navigator.webdriver`) meten niet mee, en lokaal
  staat het meten uit. Wil je het op je eigen computer bekijken, zet dan
  `NEXT_PUBLIC_MEET_LOKAAL=1` in `.env.local`.
* **Opruimen:** ruwe rijen blijven 90 dagen staan. `site_meting_onderhoud()`
  schrijft de dagtotalen weg en gooit de rest weg, hoogstens één keer per dag.
  Deze database heeft geen pg_cron, dus roept `/api/meet` die functie af en toe
  mee aan.
* **Kijken wat eruit komt:** de views `meet_bezoekers_per_dag`,
  `meet_apparaat_per_dag`, `meet_trechter` (startpagina → proefsom →
  registreren → eerste som; de proefsom telt zowel op `/proberen` als op de
  startpagina zelf), `meet_doelen_top`, `meet_dode_klikken`,
  `meet_woedeklikken`, `meet_fouten`, `meet_scroll_per_pagina`,
  `meet_routes_top` (de twintig meestgelopen routes, eerste zes stappen),
  `meet_route_naar_registratie`, `meet_per_schuilnaam` (sessies en dagen
  actief) en `meet_voortgang_per_schuilnaam` (opgetelde voortgang naast de
  schuilnaam). De alleen-lezen analistrol mag daar bij; het geheim achter de
  schuilnaam kan die rol niet opvragen.

---

## De instellingen van de echte site

Alles wat bepaalt hoe de mail van het inloggen eruitziet en werkt — het
onderwerp, de tekst, hoeveel mail per uur, hoe lang een link geldig is, waar de
link heen mag wijzen — hoorde tot nu toe op twee plekken die niets van elkaar
wisten: `supabase/config.toml` voor de lokale Supabase, en het Supabase-dashboard
voor de echte site. Verander je er één, dan verandert de andere niet mee, en de
e2e-controle blijft gewoon groen.

Onderaan [`supabase/config.toml`](./supabase/config.toml) staat daarom een blok
`[remotes.productie]` met de instellingen van het echte project. De lokale
instellingen staan er los van: `npx supabase start`, `npx supabase db reset` en
`npm run test:e2e` lezen dat blok niet.

### Kijken waar het dashboard afwijkt

Dit leest alleen; het verandert niets, lokaal noch in het echt:

```bash
npx supabase login                      # eenmalig
npx supabase config diff --project-ref <projectcode>
```

De projectcode zijn de twintig letters uit `NEXT_PUBLIC_SUPABASE_URL`
(`https://<projectcode>.supabase.co`), ook te zien in de adresbalk van het
dashboard; hij staat ook in het blok zelf. Pak de code van de echte site, niet
die van het ontwikkelproject — de CLI pakt het blok waarvan `project_id` bij
`--project-ref` past, en vergelijkt zonder zo'n blok gewoon met de lokale
instellingen.

### Wegschrijven: alleen met de hand, en alleen door Aaf

```bash
npx supabase config push --project-ref <projectcode>
```

Dit staat met opzet in **geen enkel** script, geen `npm run` en geen
GitHub-controle. Draai het nooit blind, en lees eerst de uitkomst van
`config diff`. Hij vraagt per instelling om bevestiging en laat zien wat er
verandert; instellingen die het blok niet noemt, blijft hij af. Drie redenen om
toch op te letten:

* **Een lijst die het blok wél noemt, vervangt hij in zijn geheel.** Staan er in
  het dashboard nu nog andere adressen bij *Redirect URLs* — bijvoorbeeld een
  extra voorbeeldadres — dan haalt `push` die weg, en werkt de link in
  de bevestigingsmail daar niet meer. Zet ze eerst bij
  `additional_redirect_urls` in het blok.
* **Hij schrijft álles weg wat het bestand noemt, niet alleen het blok
  `[remotes.productie]`.** Dat blok is een laagje bovenop de rest: wat er niet
  in staat, komt uit de instellingen erboven — die van de lokale Supabase. Staat
  daar iets dat alleen voor de tests bedoeld is, dan gaat dat mee. Daarom staan
  de drie die er het meest toe doen (`additional_redirect_urls`, `email_sent`,
  `max_frequency`) expliciet in het blok. Loop `config diff` regel voor regel na
  op dingen die daar nog niet in staan.
* **Je schrijft naar het project met de echte accounts en de echte voortgang
  van leerlingen.** Een verkeerde `site_url` of een te korte geldigheidsduur
  merk je pas als een leerling niet meer binnenkomt.
* **De grens van 100 mails per uur laat Supabase pas toe als "Enable Custom
  SMTP" aanstaat.** Zolang de ingebouwde testmailer aanstaat, blijft het een
  paar per uur, wat er ook in de repo staat.

### Wat er bewust níét in staat

De SMTP-gegevens van Resend. Daar hoort een wachtwoord bij, en deze repo is
openbaar. Die blijven in het dashboard onder **Authentication → Emails → SMTP
Settings**.

---

## Projectstructuur

```
.
├── idea.md                         # Oorspronkelijke bouwopdracht; hoofdstuk 3 is de huidige tabellen
├── src/
│   ├── app/[locale]/               # Pagina's voor de leerling, onder /nl
│   ├── app/admin/                  # Beheer: onderwerpen, opgaven, accounts, meldingen
│   ├── app/api/webhooks/           # Welkomstmail en seintje bij een nieuw account
│   ├── app/auth/                   # Terugkeer na de link in de mail
│   ├── components/                 # Knoppen, menu, formules, wiskundetoetsenbord
│   ├── content/theory/             # Theorietekst in de code
│   ├── i18n/                       # Taal: alleen Nederlands
│   ├── lib/                        # Oefenen, nakijken, mail, database
│   └── proxy.ts                    # Sessie en taalcode
├── messages/nl.json                # De Nederlandse zinnen
├── supabase/
│   ├── migrations/                 # Databasewijzigingen, op volgorde
│   ├── email-templates/            # Mails van Supabase: bevestigen en wachtwoord
│   └── seed.sql                    # Alleen de vaste testopgaven
├── e2e/                            # Weg van een leerling in de browser
├── scripts/                        # Hulpjes voor controles
└── .env.local.example
```

---

## Scripts

| Commando          | Actie                                     |
|-------------------|-------------------------------------------|
| `npm run dev`     | Start dev server                          |
| `npm run build`   | Productie build                           |
| `npm run start`   | Start productie build                     |
| `npm run lint`    | ESLint                                    |
| `npm run typecheck` | TypeScript-controle (`tsc --noEmit`)    |
| `npm test`        | Vitest (unit tests, eenmalig)             |
| `npm run test:watch` | Vitest in watch-modus                  |
| `npm run test:e2e`   | Playwright e2e-tests (weg van een leerling) |
| `npm run cf:build`   | Bouw voor Cloudflare Workers           |
| `npm run cf:preview` | Die bouw lokaal starten in Workers     |

Tests staan naast de code die ze controleren (`src/**/*.test.ts`) en draaien
zonder database en zonder AI — alleen pure rekenregels, zoals het nakijken van
antwoorden in `src/lib/practice/engine.ts`.

### Automatische controle

Bij elke pull request draait `.github/workflows/controle.yml` met `npm run lint`,
`npm run typecheck`, `npm test` en `npm run cf:build`. Dat is nodig omdat
`next build` sinds Next.js 16 zelf geen lint meer draait. De bouw voor
Cloudflare Workers draait in deze controle, zodat een pull request die die
bouw breekt meteen rood wordt. Cloudflare bouwt daarnaast zelf elke pull
request (Workers Builds) en zet `main` live.

### Lokaal op Workers

De live site draait op Cloudflare Workers. Zo kijk je of dezelfde code in die
omgeving start:

```bash
cp .dev.vars.example .dev.vars   # één keer; blijft buiten git
npm run cf:preview
```

`.dev.vars` zet de preview op je `.env.local`. Zonder dat bestand leest de
preview de productie-stand. Zet de site niet zelf live met `wrangler` of
`opennextjs-cloudflare deploy`: na een merge doet Workers Builds dat.

---

## Wat al staat

De site is live. Sectie 11 in `idea.md` (vier fasen met lege vinkjes) is het
oude plan van april 2026. Die fasen volg je niet meer. Nieuw werk gaat via
een pull request, zoals hieronder.

---

## Hoe iets live komt

1. Eigen tak vanaf de nieuwste `volgende`, pull request met
   `gh pr create --base volgende`.
2. De controles in GitHub moeten groen zijn.
3. Merge naar `volgende`.
4. Eén keer per dag maakt een workflow de pull request `volgende` → `main`.
   Die merget Aaf zelf, met **Create a merge commit**. Workers Builds zet die
   versie live op afgeleideoefenen.nl (worker `afgeleide-oefenen`).

Er is **geen voorbeeldversie** van een tak of van `volgende` op een
`*.workers.dev`-adres: Workers Builds bouwt wel elke tak, maar die bouw faalt,
dus er komt geen versie te staan. Bekijk je werk lokaal met `npm run dev` of
`npm run cf:preview`. Wat er moet gebeuren om het terug te krijgen staat onder
"Er is geen voorbeeldversie van `volgende`" in `AGENTS.md`.

Alleen iets kritieks (de site of het inloggen doet het niet, het nakijken
rekent verkeerd, een lek, of `main` is stuk) gaat rechtstreeks naar `main`.
Zie "Dagelijkse release: van `volgende` naar `main`" in `AGENTS.md`.

Deployen met `wrangler` of `opennextjs-cloudflare deploy` doe je niet.

### Wat er op de echte site al staat

- **Omgevingsvariabelen** horen bij de bouwvariabelen van Workers Builds
  (waaronder alles wat met `NEXT_PUBLIC_` begint) en als Worker-secrets. Niet
  in git.
- **Aanmelden met Google:** de knop staat uit tot `NEXT_PUBLIC_GOOGLE_LOGIN=1`
  bij de bouwvariabelen staat én Google als provider in Supabase aan staat.
  Zonder die twee blijft inloggen met e-mail en wachtwoord zoals het was.
- **Bezoekersteller:** `NEXT_PUBLIC_CF_BEACON_TOKEN` is het publieke token van
  Cloudflare Web Analytics. Leeg of weg: de site laadt geen tellerscript.
  Omdat de naam met `NEXT_PUBLIC_` begint, moet hij bij de bouwvariabelen
  staan.
- **Supabase Auth:** site-URL `https://www.afgeleideoefenen.nl`, en bij
  Redirect URLs de adressen uit `[remotes.productie.auth]` in
  `supabase/config.toml`, inclusief de voorbeeldversies op `workers.dev`.
- **SMTP** in Supabase: Authentication → Emails → SMTP Settings, met Resend.
  Zonder die stap laat Supabase maar een paar bevestigingsmails per uur door
  — zie [Mail gaat langs twee wegen](#mail-gaat-langs-twee-wegen).
- **Database:** de bestanden in `supabase/migrations/`, op bestandsnaam.
  `seed.sql` hoort alleen op de lokale testdatabase.

### SEO & vindbaarheid

- `robots.ts` en `sitemap.ts` staan al in het project — na deploy bereikbaar op
  `/robots.txt` en `/sitemap.xml`.
- Dien je sitemap in bij **Google Search Console** (voeg je domein toe,
  verifieer via DNS-TXT, submit `sitemap.xml`).
- Voeg het domein ook toe aan **Bing Webmaster Tools**.
- Open Graph metadata is al gezet; een `og-image.png` (1200×630) in `public/`
  wordt automatisch opgepikt door `metadataBase`.

---

## Licentie

De code staat openbaar op GitHub. Er is nog geen open-source-licentie gekozen.
