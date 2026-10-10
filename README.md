# afgeleideoefenen.nl

Nederlandse wiskundewebsite voor VWO-studenten om differentiëren te leren.
Gebouwd met **Next.js (App Router) + Supabase + Gemini**. Zie
[`idea.md`](./idea.md) voor de volledige bouwopdracht.

---

## Tech stack

| Laag        | Technologie                                   |
|-------------|-----------------------------------------------|
| Frontend    | Next.js 16 (App Router) + TypeScript + Tailwind |
| Backend     | Next.js API Routes                            |
| Database    | Supabase (PostgreSQL + Auth)                  |
| AI          | Google Gemini (`gemini-2.5-flash`)            |
| Wiskunde    | KaTeX                                         |
| Hosting     | Vercel                                        |

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

Dat komt doordat `next@16.2.4` `@swc/helpers` tegelijk opgeeft als gewone
afhankelijkheid (`0.5.15`) en als losse eis (`>=0.5.17`). npm 11 lost die
tegenspraak op, npm 10 niet. Daarom staat de eis op twee plekken vastgelegd:
`engines.node` (`>=24`) in `package.json`, dat Vercel leest voor de bouw-Node,
en `.nvmrc`, dat `nvm` en de automatische controle lezen.

### 1. Installeer dependencies

```bash
npm install
```

### 2. Supabase project opzetten

1. Maak een gratis project aan op [supabase.com](https://supabase.com).
2. Open in het dashboard **SQL Editor** en draai de volgende bestanden in
   deze volgorde:
   1. [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql) — schema + RLS
   2. [`supabase/seed.sql`](./supabase/seed.sql) — topics, clusters, root causes, startvragen
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
| `WEBHOOK_SECRET`                | Zelf te verzinnen; zelfde waarde als de header `x-webhook-secret` in Supabase → Database → Webhooks. Zonder match: 401 |

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
| Bevestig je e-mailadres, wachtwoord vergeten | **Supabase**, niet de site | Supabase → **Authentication → Emails → SMTP Settings** |

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
(`confirm-signup.html`, `reset-password-nl.html`, `reset-password-en.html`).
Die staan níét automatisch in Supabase: je plakt ze er met de hand in onder
**Authentication → Emails**.

---

## Projectstructuur

```
.
├── idea.md                         # Volledige bouwopdracht (bron van waarheid)
├── src/
│   ├── app/                        # Next.js App Router pagina's
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts           # Browser Supabase client
│   │       ├── server.ts           # Server + service-role client
│   │       ├── middleware.ts       # Session refresh + admin guard (helper)
│   │       └── types.ts            # Database TypeScript types
│   └── proxy.ts                    # Next.js 16 proxy (voorheen middleware)
├── supabase/
│   ├── migrations/
│   │   └── 0001_init.sql           # Schema uit sectie 3
│   └── seed.sql                    # Seed data uit sectie 4 + 13
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

Tests staan naast de code die ze controleren (`src/**/*.test.ts`) en draaien
zonder database en zonder AI — alleen pure rekenregels, zoals het nakijken van
antwoorden in `src/lib/practice/engine.ts`.

### Automatische controle

Bij elke pull request draait `.github/workflows/controle.yml` met `npm run lint`,
`npm run typecheck` en `npm test`. Dat is nodig omdat `next build` sinds
Next.js 16 zelf geen lint meer draait; zonder deze workflow zou een lintfout of
een kapotte rekenregel ongezien door de Vercel-build komen. De build zelf laten
we aan Vercel over.

---

## Bouwvolgorde

Zie `idea.md` sectie 11 — volg de vier fasen:

1. **Fundament** — scaffolding + Supabase + admin CRUD ✓
2. **Leerlogica** — oefenpagina, vraag­selectie, mastery tracking ✓
3. **AI laag** — Gemini-integratie, fout­type­detectie, vraag­generatie ✓
4. **Polish** — wiskundig toetsenbord, mobiel, extra statistieken ✓

---

## Deploy naar productie (Vercel)

1. **Push je code naar een Git-remote** (GitHub / GitLab / Bitbucket). Check
   dat `.env.local` níét gecommit is (`git status` → zou leeg moeten zijn qua
   secrets).
2. Ga naar [vercel.com/new](https://vercel.com/new), koppel je repo en kies
   **Next.js** als framework (wordt automatisch gedetecteerd).
3. Vul onder **Environment Variables** alle keys uit `.env.local.example` in
   voor zowel Production als Preview (behalve `NEXT_PUBLIC_SITE_URL`, die zet
   je op je productie-domein, bv. `https://afgeleideoefenen.nl`).
4. Deploy → je krijgt een `*.vercel.app`-URL.
5. **Eigen domein koppelen**: in het Vercel-project → **Settings → Domains**
   voeg je `afgeleideoefenen.nl` toe. Vercel geeft één A-record en één
   CNAME — vul die in bij je domeinregistrar.
6. **Supabase Auth redirect URLs** updaten: Supabase dashboard →
   **Authentication → URL Configuration** → zet `Site URL` op je productie-URL
   en voeg `https://<domein>/auth/callback` toe aan **Redirect URLs**.
7. **Eigen SMTP aanzetten in Supabase**: dashboard → **Authentication →
   Emails → SMTP Settings** → "Enable Custom SMTP" aan, met de SMTP-gegevens
   van Resend en een afzender op een bij Resend geverifieerd domein. Zonder
   deze stap laat Supabase maar een paar bevestigingsmails per uur door — zie
   [Mail gaat langs twee wegen](#mail-gaat-langs-twee-wegen).
8. **Migraties draaien**: in de Supabase SQL Editor beide files draaien:
   `0001_init.sql`, `0002_question_flags.sql` en daarna `seed.sql`.
9. **Gemini API-key** onder Google AI Studio: zet een HTTP-referrer
   restriction op `https://afgeleideoefenen.nl/*` zodat hij niet misbruikt
   wordt als hij lekt.

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

Privéproject — nog geen open-source licentie toegevoegd.
