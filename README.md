# lerendifferentiëren.nl

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

| Variabele                       | Waar te vinden in Supabase dashboard |
|---------------------------------|--------------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`      | Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API → `anon` public key |
| `SUPABASE_SERVICE_ROLE_KEY`     | Project Settings → API → `service_role` key (**niet** in de browser gebruiken!) |
| `GEMINI_API_KEY`                | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) |
| `NEXT_PUBLIC_SITE_URL`          | Basis-URL van de site (lokaal: `http://localhost:3000`, productie: eigen domein) |

### 4. Start de dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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
   je op je productie-domein, bv. `https://lerendifferentieren.nl`).
4. Deploy → je krijgt een `*.vercel.app`-URL.
5. **Eigen domein koppelen**: in het Vercel-project → **Settings → Domains**
   voeg je `lerendifferentieren.nl` toe. Vercel geeft één A-record en één
   CNAME — vul die in bij je domeinregistrar.
6. **Supabase Auth redirect URLs** updaten: Supabase dashboard →
   **Authentication → URL Configuration** → zet `Site URL` op je productie-URL
   en voeg `https://<domein>/auth/callback` toe aan **Redirect URLs**.
7. **Migraties draaien**: in de Supabase SQL Editor beide files draaien:
   `0001_init.sql`, `0002_question_flags.sql` en daarna `seed.sql`.
8. **Gemini API-key** onder Google AI Studio: zet een HTTP-referrer
   restriction op `https://lerendifferentieren.nl/*` zodat hij niet misbruikt
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
