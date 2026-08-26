# Planning — wat nog op de rol staat

Live document: aangevuld naarmate je features afrondt. Zie ook [`idea.md`](./idea.md) voor de volledige bouwopdracht.

---

## Stoomcursus — routekaart (`/stoomcursus`)

Doorklik-cursus rond het idee: elke afgeleide-vraag bestaat uit maximaal drie
onderdelen — 🟡 begrijp het verhaaltje, 🟢 vind de afgeleide, 🔴 gebruik
oplosmethodes. Eerst los oefenen per onderdeel, daarna combineren.

**Vier fases**

1. **Intro** *(af)* — welkom → drie blokken → voorbeeldopgave → als-dan-uitleg
   (slots-model met view transitions) → methode-uitleg → keuzescherm.
2. **Los oefenen per onderdeel** — elk onderdeel dezelfde tweetraps-opbouw:
   - 🟡 als→dan-overzicht *(af)* + MC "welke aanpak?" *(af, 16 vragen in
     [`quiz-data.ts`](./src/app/%5Blocale%5D/stoomcursus/quiz-data.ts))*
   - 🟢 kaart per differentieerregel + open oefenen ("differentieer …") via
     hergebruik van de bestaande oefen-engine/vragenbank
   - 🔴 als→dan voor oplosmethodes (ontbinden/abc, teller = 0, wortels,
     substitutie) + vergelijkingen $f'(x)=0$ oplossen
3. **Finale** — volledige verhaaltjes-opgaven in drie stappen (aanpak kiezen →
   afgeleide invoeren → oplossen), de drie kleuren als stappenbalk. Ontgrendelt
   als alle onderdelen af zijn.
4. **Afsluiting** — eindscherm + doorverwijzing leerpad/zelf-toets;
   dashboard-kaartje "Stoomcursus: X%".

**Voortgang** — `stoomcursus_progress` (0026) + jsonb-kolom `data` (0027):
`{ geel: { klaar, quizIndex, score, foutTypes }, groen: …, rood: …, finale: { ontgrendeld, opgaveIndex } }`.
Ingelogd = per account; anoniem = localStorage. `foutTypes` → herhaalronde
(mastery) later.

**Bouwvolgorde**

- [x] 1. Hub met voortgangsindicatie per tegel + jsonb-migratie
- [ ] 2. Quizvoortgang persisteren + fout gegane types laten terugkomen
- [ ] 3. 🔴 Oplosmethodes: overzicht + oefenen
- [ ] 4. 🟢 Vind de afgeleide: koppeling bestaande vragenbank
- [ ] 5. Finale (drie-stappen-opgaven)
- [ ] 6. Afsluitscherm + dashboard-kaartje

---

## Recent af (ter referentie)

- **Routes split:** adaptief leren op **`/leerpad`**; **vrij oefenen** op **`/oefenen`** (topic-nav + `PracticeCard`; deelt `user_progress` met het leerpad).
- **Onboarding-wizard** (`/onboarding`): klas, voornaam, leermodus → `profiles`.
- **Topic-pad** (`/onboarding/pad`): tabel ken ik / wil ik → `applyPadSelections` (`bulk-progress.ts`).
- **Diagnostische toets** (`/onboarding/toets`): 5 vragen (`diagnostic.ts`) → `applyDiagnosticResults`; alleen als `learning_mode === 'diagnostic'`.
- **Bulk progress:** `masterAllClustersInTopic`, `clearProgressForTopic`, pad- en toets-logica in [`src/lib/practice/bulk-progress.ts`](./src/lib/practice/bulk-progress.ts).
- **Migratie:** [`supabase/migrations/0003_onboarding.sql`](./supabase/migrations/0003_onboarding.sql).
- **Middleware:** onboarding-guard; `/onboarding/*` uitgezonderd voor incomplete flow.

---

## Hoog — volgende stappen (optioneel verfijnen)

| # | Idee | Opmerking |
|---|------|-----------|
| 1 | **Pad-UX** | Default “alles wil oefenen” is logisch; eventueel tooltips of voorbeelden per topic. |
| 2 | **Toets** | Math-keyboard /zelfde invoer als leerpad; nu plain `Input`. |
| 3 | **Vrij oefenen** | Cluster-kiezer binnen topic als eerste cluster “op” is; nu volgende cluster automatisch via `pickNextQuestion`. |

---

## Midden — product & UX

| Item | Beschrijving |
|------|----------------|
| **Header / navigatie** | Twee modi (`Leerpad` / `Vrij oefenen`); eventueel hint op dashboard. |
| **`learning_mode` gebruiken** | Dashboard/welkom op basis van modus. |
| **`display_name`** | Persoonlijke copy (“Hoi …”). |

---

## Later / backlog

| Item | Opmerking |
|------|-----------|
| **Examen Training-modus** | Eigen mix-stroom; nu alleen `grade`. |
| **Visueel leerpad (B)** | Variant op `/onboarding/pad`. |
| **Adaptieve toets (B)** | i.p.v. 5 vaste vragen. |
| **Redirects** | Bookmark `/oefenen` → vrij oefenen i.p.v. leerpad. |

---

## Dev/prod-database (Supabase)

- **Prod**: cloudproject "LerenDifferentieren" (`dccjsuyuolxwqqcjxtqe`) — alleen
  nog via Vercel-env-vars; lokaal komt er niets meer bij prod binnen.
- **Dev**: lokaal via `supabase start` (Docker). `.env.local` wijst naar
  `http://127.0.0.1:54321`; de prod-keys staan daar als `*_PROD` (alleen voor
  het contentscript). Studio: http://127.0.0.1:54323, mail: http://127.0.0.1:54324.
- **Content verversen**: `npx tsx scripts/copy-content-to-local.ts` kopieert de
  contenttabellen (géén user-data) van prod naar lokaal.
- **Migraties**: nieuw bestand in `supabase/migrations/` → lokaal testen met
  `supabase migration up` (of `supabase db reset` voor een verse database) →
  daarna naar prod met `supabase link --project-ref dccjsuyuolxwqqcjxtqe` (eenmalig,
  vraagt db-wachtwoord) en `supabase db push`.
- `seed.sql` staat uit in `config.toml` (verouderd: `questions.body` bestaat
  niet meer sinds 0011); dev-content komt uit de prod-kopie.
- Lokaal bevestigen registratiemails automatisch; testaccount:
  `devtest@example.com` / `testtest123`.

---

## Operationeel checklist (dev / deploy)

- [ ] **`0026` + `0027` + `0028`** nog op prod draaien (SQL-editor of
      `supabase db push`); 0028 (grants) is daar een no-op maar houdt de
      omgevingen gelijk.
- [ ] **`0003_onboarding.sql`** in Supabase waar nog niet gedraaid.
- [ ] Testaccount reset of testusers in Auth.
- [ ] **`NEXT_PUBLIC_SITE_URL`** + Supabase redirects.

---

*Laatste update: pad, toets en vrij oefenen geïmplementeerd.*
