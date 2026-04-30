# Planning — wat nog op de rol staat

Live document: aangevuld naarmate je features afrondt. Zie ook [`idea.md`](./idea.md) voor de volledige bouwopdracht.

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

## Operationeel checklist (dev / deploy)

- [ ] **`0003_onboarding.sql`** in Supabase waar nog niet gedraaid.
- [ ] Testaccount reset of testusers in Auth.
- [ ] **`NEXT_PUBLIC_SITE_URL`** + Supabase redirects.

---

*Laatste update: pad, toets en vrij oefenen geïmplementeerd.*
