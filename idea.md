# afgeleideoefenen.nl — Technische Bouwopdracht
**Versie 1.0 — April 2026**

De site heet **afgeleideoefenen.nl**. Alleen hoofdstuk 3 (de tabellen)
beschrijft hoe het nu is. De rest is het plan van april 2026: geen
bouwopdracht meer, en sectie 11 volg je niet.

---

## 1. Projectbeschrijving

Bouw een Nederlandse wiskundewebsite voor VWO-studenten om differentiëren te leren. De site heet **afgeleideoefenen.nl** en volgt de Getal & Ruimte notatie en leerlijn.

De kern van de site is **practice-first**: studenten beginnen direct met oefenen. Theorie is beschikbaar als inklapbaar hulpmiddel. Het systeem is adaptief en zelflerend via AI.

**Doelgroep:** VWO wiskunde studenten (Nederland)
**Taal:** Volledig Nederlands
**Notatie:** Getal & Ruimte. Functies heten `f`, `g` en `h`. Bij de quotiëntregel is dat `g(x)/h(x)`.

---

## 2. Tech Stack

| Laag | Technologie | Reden |
|---|---|---|
| Frontend | Next.js (App Router) | SEO, snelheid, één codebase |
| Backend | Next.js API Routes | Geen aparte server nodig |
| Database | Supabase (PostgreSQL) | Gratis tier, ingebouwde auth |
| AI | Google Gemini API | 1500 req/dag gratis |
| Hosting | Cloudflare Workers | Live op worker `afgeleide-oefenen` |
| Wiskunde rendering | KaTeX | Snelle LaTeX rendering in browser |
| Uiterlijk | Tailwind | Eigen onderdelen in de code |

---

## 3. Database (Supabase / PostgreSQL)

Dit hoofdstuk beschrijft de tabellen zoals ze nu zijn (oktober 2026). De
namen met `_new` komen uit de overstap; er staat geen oude tabel meer naast.
De tabellen zonder `_new` van de eerste opzet (`topics`, `questions`,
`user_progress` en de rest van die reeks) zijn op 12 oktober 2026 van de
echte database af.

De kolommen zelf staan in `supabase/migrations/`. Hier alleen welke tabel
waarvoor dient.

### Oefenstof

Iedereen mag lezen. Alleen een beheerder mag schrijven. Hoofdstukken komen
alleen via een migratie binnen.

| Tabel | Wat erin staat |
|---|---|
| `chapters` | De hoofdstukken |
| `topics_new` | De onderwerpen in een hoofdstuk |
| `topic_clusters_new` | De soorten sommen in een onderwerp |
| `questions_new` | De opgave, het antwoord en de moeilijkheid |
| `question_steps_new` | De tussenstappen bij een opgave |

### Van de leerling

Alleen die leerling, plus een beheerder.

| Tabel | Wat erin staat |
|---|---|
| `profiles` | Naam, gebruikersnaam, klas, rol, of de rondleiding gezien is. Ontstaat vanzelf bij een nieuw account. |
| `user_progress_new` | Per soort som: bezig of gehaald, en de reeks goede antwoorden |
| `user_sessions_new` | Een oefensessie of een zelftoets |
| `custom_test_questions` | Welke opgaven in welke volgorde in een zelftoets zitten |
| `session_answers_new` | Elk antwoord: wat er stond, goed of fout, hoe lang |
| `question_flags_new` | Een melding dat een opgave niet klopt |
| `known_wrong_answers_new` | Een fout antwoord dat vaker voorkomt, met een korte uitleg |
| `welkomstmail_claim` | Eén rij per leerling, zodat de welkomstmail niet twee keer uitgaat |

`auth.users` is de accounttabel van Supabase zelf. Die hoort niet bij deze
lijst. `step_mistakes_new` staat nog in de database, maar de site leest en
schrijft hem niet.

De rest van dit bestand is de bouwopdracht van april 2026. Die beschrijft
het oorspronkelijke plan, niet de tabellen hierboven.

---

## 4. Topics & Clusters (Seed Data)

Voeg deze topics en clusters toe als seed data. Ze volgen de Getal & Ruimte leerlijn.

| # | Topic | Clusters | Unlock na |
|---|---|---|---|
| 1 | Machtsregel | Enkelvoudig / Meerdere termen / Haakjes uitwerken / Negatieve exponent | Altijd beschikbaar |
| 2 | Somregel | Twee termen / Drie+ termen / Constante factor / Genest | Machtsregel gemeesterd |
| 3 | Productregel | Twee veeltermen / Veelterm×macht / Veelterm×wortel / Drie factoren | Somregel gemeesterd |
| 4 | Quotiëntregel | Lineaire noemer / Kwadratische noemer / Macht in noemer / Wortel | Productregel gemeesterd |
| 5 | Kettingregel | Macht+lineair / Macht+veelterm / Wortel / Negatieve macht / +Productregel / +Quotiëntregel | Quotiëntregel gemeesterd |

### Root causes per topic

**Machtsregel:** `n_identificeren`, `coefficient_berekenen`, `exponent_verlaging`, `haakjes_uitwerken`, `notatie_fout`

**Somregel:** `termen_splitsen`, `constante_factor`, `elke_term_apart`, `notatie_fout`

**Productregel:** `fg_identificeren`, `f_differentiëren`, `g_differentiëren`, `formule_invullen`, `volgorde_min`, `vereenvoudigen`

**Quotiëntregel:** `tn_identificeren`, `t_differentiëren`, `n_differentiëren`, `formule_volgorde`, `noemer_kwadraat`, `vereenvoudigen`

**Kettingregel:** `buitenste_identificeren`, `binnenste_identificeren`, `buitenste_differentiëren`, `binnenste_differentiëren`, `vermenigvuldigen`, `herschrijven_machtsvorm`, `regel_combineren`, `vereenvoudigen`

---

## 5. Adaptieve Leerlogica

### 5.1 Mastery Systeem
- **3x correct op rij** binnen een cluster = cluster gemeesterd
- Cluster gemeesterd → volgende cluster unlockt
- Alle clusters gemeesterd → topic gemeesterd → volgend topic unlockt
- Streak wordt **gereset bij een fout antwoord** (tenzij `is_careless = true`)

### 5.2 Vraag Selectie Logica
Gebruik deze volgorde om de volgende vraag te selecteren:

1. Pak vragen uit het huidige cluster van de student
2. Filter op moeilijkheid: begin met `difficulty=1`, dan `2`, dan `3`
3. Sla vragen over die de student al 3x correct heeft beantwoord
4. Prioriteer vragen met `root_cause_tags` die overeenkomen met eerdere fouten van de student
5. Als geen specifieke fouten bekend: random volgorde binnen moeilijkheid

```sql
-- Volgende vraag query
SELECT q.*
FROM questions q
WHERE q.cluster_id = :cluster_id
  AND q.difficulty = :current_difficulty
  AND q.id NOT IN (
    SELECT sa.question_id
    FROM session_answers sa
    JOIN user_sessions us ON sa.session_id = us.id
    WHERE us.user_id = :user_id
    GROUP BY sa.question_id
    HAVING SUM(CASE WHEN sa.is_correct THEN 1 ELSE 0 END) >= 3
  )
ORDER BY RANDOM()
LIMIT 1;
```

### 5.3 Antwoord Nakijken

**Stap 1:** Normaliseer het antwoord:
```javascript
function normalize(answer) {
  return answer
    .toLowerCase()
    .replace(/\s/g, '')
    .replace(/\*/g, '')
    .replace(/x\^1\b/g, 'x')
    .replace(/\+-/g, '-')
}
```

**Stap 2:** Vergelijk `normalize(studentAnswer) === normalize(correctAnswer)`

**Stap 3:** Als fout → check `known_wrong_answers` op exacte match

**Stap 4:** Als geen match → stuur naar Gemini API (zie sectie 6)

---

## 6. AI Integratie (Gemini API)

Gebruik **Google Gemini API** (gratis tier: 1500 req/dag).
Sla de API key op als omgevingsvariabele: `GEMINI_API_KEY`

> **BELANGRIJK:** Roep Gemini **nooit** direct vanuit de frontend aan. Altijd via een Next.js API route (`/api/check-answer`).

### 6.1 Wanneer AI aanroepen
- Alleen als het foute antwoord **niet** in `known_wrong_answers` staat
- Nooit bij correcte antwoorden
- Nooit bij slordigheidsfoutjes

### 6.2 Gemini Prompt

```
Je bent een wiskundeleraar voor VWO studenten die differentiëren leren.
De site volgt de Getal & Ruimte notatie.

Vraag: {question.body}
Juist antwoord: {question.answer}
Antwoord van de student: {studentAnswer}
Topic: {topic.title}
Cluster: {cluster.title}
Bekende root causes voor dit topic: {rootCauses.join(', ')}

Al beschikbare vragen met dezelfde root cause per moeilijkheid:
- difficulty 1: {count}
- difficulty 2: {count}
- difficulty 3: {count}

Analyseer de fout en geef je antwoord ALLEEN als JSON, geen uitleg erbuiten:

{
  "root_cause": "<slug uit de bekende root causes, of nieuw als het er niet bij staat>",
  "error_explanation": "<uitleg in max 2 zinnen, spreek de student aan met 'je', Nederlands>",
  "needs_new_questions": <true als er per moeilijkheid minder dan 1 beschikbare vraag is>,
  "generated_questions": [
    {
      "body": "<vraag in platte tekst>",
      "latex_body": "<KaTeX versie>",
      "answer": "<genormaliseerd antwoord>",
      "latex_answer": "<KaTeX versie>",
      "difficulty": <1, 2 of 3>
    }
  ]
}

Genereer alleen vragen voor moeilijkheden die nog geen beschikbare vraag hebben.
Genereer maximaal 3 vragen (één per moeilijkheid).
```

### 6.3 Na AI response
1. Sla het foute antwoord op in `known_wrong_answers`
2. Voeg gegenereerde vragen toe aan `questions` met `is_ai_generated = true`
3. Tag de vragen met de `root_cause`
4. Toon de `error_explanation` direct aan de student

---

## 7. Stappenplan Systeem

Als een student een fout antwoord geeft, toont de UI een stappenplan. De student klikt per stap aan of het goed of fout ging.

Elke vraag heeft `question_steps` in de database. Elke stap heeft een `root_cause_id`. Als de student aangeeft dat stap X fout ging, sla je een `step_mistake` op met de bijbehorende root cause.

### Slordigheidsfoutje
De student kan aangeven: "Slordigheidsfoutje — ik wist het wel". Dan:
- Sla `is_careless = true` op in `session_answers`
- Geen nieuwe vragen genereren
- Streak **niet** resetten
- Na 3 slordigheidsfoutjes op rij: toon melding *"Je maakt vaak slordigheidsfoutjes! Tip: controleer altijd je antwoord."*

### Voorbeeld stappenplan — Productregel
```
Stap 1: Identificeer f(x) en g(x)          → root_cause: fg_identificeren
Stap 2: Differentieer f(x)                  → root_cause: f_differentiëren
Stap 3: Differentieer g(x)                  → root_cause: g_differentiëren
Stap 4: Vul in: f'·g + f·g'                → root_cause: formule_invullen
Stap 5: Vereenvoudig het antwoord           → root_cause: vereenvoudigen
```

---

## 8. Pagina Structuur (Next.js App Router)

| Route | Pagina | Beschrijving |
|---|---|---|
| `/` | Homepage | Uitleg + CTA naar registreren/inloggen |
| `/oefenen` | Oefenpagina | Hoofdpagina — sidebar + oefenkaart |
| `/oefenen/[topicSlug]` | Topic pagina | Redirect naar eerste actieve cluster |
| `/dashboard` | Dashboard | Voortgangsoverzicht per topic |
| `/inloggen` | Login | Supabase Auth login form |
| `/registreren` | Registratie | Supabase Auth signup form |
| `/admin` | Admin dashboard | Alleen toegankelijk voor `role=admin` |
| `/admin/topics` | Topics beheren | CRUD voor topics en clusters |
| `/admin/questions` | Vragen beheren | CRUD voor vragenbank |
| `/admin/users` | Gebruikers | Voortgang per student inzien |
| `/api/check-answer` | API Route | Antwoord nakijken + Gemini aanroepen |
| `/api/next-question` | API Route | Volgende vraag selecteren |

### Admin beveiliging
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Check Supabase session + role === 'admin'
    // Redirect naar / als niet admin
  }
}
```

---

## 9. UI Richtlijnen

De UI is minimalistisch en licht. Zie de bijgeleverde HTML schets voor referentie.

### Kleurenpalet
```css
--bg:           #f7f6f3;   /* Pagina achtergrond */
--surface:      #ffffff;   /* Kaarten en sidebar */
--surface2:     #f0efe9;   /* Lichte achtergrond elementen */
--border:       #e4e2d9;   /* Borders */
--text:         #1a1a18;   /* Primaire tekst */
--text-muted:   #7a7870;   /* Secundaire tekst */
--accent:       #2d6a4f;   /* Primair — correct, CTA knoppen */
--accent-light: #e8f5ee;   /* Lichte versie accent */
--accent2:      #e76f51;   /* Fout feedback, waarschuwingen */
--accent2-light:#fdf0ec;   /* Lichte versie accent2 */
--warn:         #f4a261;   /* Theorie blokken */
```

### Typografie
- **Display font:** DM Serif Display — voor vragen en titels
- **Body font:** DM Sans — voor alles overige
- **Wiskunde:** KaTeX rendering

### Layout
- Desktop: sidebar (260px vast) + main content (max 760px)
- Mobiel: sidebar verbergen achter hamburger menu
- Sticky navigatiebalk bovenaan (56px hoog)

### Componenten
- Beheer gebruikt dezelfde Tailwind-onderdelen als de rest van de site
- Streak indicator: 3 bolletjes die opvullen naarmate de student goed antwoord geeft
- Progress bar per cluster bovenaan de oefenpagina

---

## 10. Wiskundige Invoer

Combinatie van **vrij typen** + **wiskundig toetsenbord** met knoppen.

### Automatische conversies
| Student typt | Resultaat |
|---|---|
| `x^2` | `x²` |
| `x^3` | `x³` |
| `x^n` | `xⁿ` |
| `sqrt(x)` | `√x` |
| `*` | `·` |
| `(3x+2)^4` | `(3x+2)⁴` |

### Toetsenbord knoppen
Voeg onder het invoerveld een rij knoppen toe:
`x` `^` `√` `(` `)` `·` `⁻¹` `π` `+` `−`

Elke knop injecteert het symbool op de cursorpositie:
```javascript
function insertSymbol(symbol) {
  const pos = input.selectionStart
  input.value = input.value.slice(0, pos) + symbol + input.value.slice(pos)
  input.focus()
  input.setSelectionRange(pos + symbol.length, pos + symbol.length)
}
```

### Live KaTeX preview
```javascript
import katex from 'katex'

input.addEventListener('input', (e) => {
  const latex = toLatex(e.target.value)  // jouw conversie functie
  try {
    katex.render(latex, previewEl, { throwOnError: false })
  } catch {}
})
```

---

## 11. Aanbevolen Bouwvolgorde

Dit is het oude plan. De vinkjes hieronder staan leeg en zijn geen
werklijst. De site is al gebouwd; nieuw werk volgt `AGENTS.md` en de README.

### Fase 1 — Fundament (zonder AI)
- [ ] Next.js project aanmaken (`npx create-next-app@latest`)
- [ ] Supabase project aanmaken + alle tabellen aanmaken
- [ ] Supabase Auth instellen (email/password)
- [ ] Login + registreer pagina bouwen
- [ ] Admin panel: topics en vragen kunnen toevoegen/bewerken
- [ ] Seed data invoeren (topics, clusters, root causes, eerste vragen)

### Fase 2 — Leerlogica
- [ ] Oefenpagina bouwen (sidebar + vraagkaart)
- [ ] Vraag selectie logica implementeren
- [ ] Antwoord nakijken (normalisatie)
- [ ] Stappenplan UI (stap-voor-stap foutaanduiding)
- [ ] Mastery tracking (streak, cluster unlock)
- [ ] Dashboard met voortgangsoverzicht

### Fase 3 — AI laag
- [ ] Gemini API route bouwen (`/api/check-answer`)
- [ ] Fouttype detectie via Gemini
- [ ] Vraag generatie via Gemini
- [ ] Opslaan in `known_wrong_answers` en `questions`

### Fase 4 — Polish
- [ ] Wiskundig toetsenbord implementeren
- [ ] KaTeX live preview
- [ ] Mobiel responsive maken
- [ ] Dashboard statistieken uitbreiden
- [ ] Student "klopt niet" flag knop op vragen

---

## 12. Omgevingsvariabelen

Maak een `.env.local` bestand aan in de root van het project:

```env
NEXT_PUBLIC_SUPABASE_URL=<jouw supabase url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<jouw supabase anon key>
SUPABASE_SERVICE_ROLE_KEY=<jouw supabase service role key>
GEMINI_API_KEY=<jouw gemini api key>
```

> **BELANGRIJK:** Zorg dat `.env.local` **altijd** in `.gitignore` staat. Zet **nooit** API keys hardcoded in de code.

---

## 13. Seed Data — Eerste Vragen (Machtsregel)

Voeg minimaal deze startvragen toe voor topic 1 (Machtsregel):

| Vraag | Antwoord | Difficulty | Cluster |
|---|---|---|---|
| Bepaal f'(x) als f(x) = x⁵ | `5x^4` | 1 | Enkelvoudig |
| Bepaal f'(x) als f(x) = 4x³ | `12x^2` | 1 | Enkelvoudig |
| Bepaal f'(x) als f(x) = 7x² | `14x` | 1 | Enkelvoudig |
| Differentieer f(x) = −5x⁷ + 2x⁴ − x − 9 | `-35x^6+8x^3-1` | 2 | Meerdere termen |
| Differentieer h(t) = 2t³ − 4t² + 3t − 2 | `6t^2-8t+3` | 2 | Meerdere termen |
| Differentieer g(x) = (3x⁴ − 1)(5x² + 2) | `90x^5+24x^3-10x` | 3 | Haakjes uitwerken |
| Bepaal f'(x) als f(x) = 1/x² | `-2x^-3` | 3 | Negatieve exponent |
| Bepaal f'(x) als f(x) = √x | `(1/2)x^(-1/2)` | 3 | Negatieve exponent |

### Stappenplan voor vraag: f(x) = 4x³

```
Stap 1: Identificeer de exponent n        (n = 3)
Stap 2: Schrijf de exponent als coëfficiënt ervoor  (3 · 4x³)
Stap 3: Bereken de nieuwe coëfficiënt     (3 · 4 = 12)
Stap 4: Verlaag de exponent met 1         (3 - 1 = 2)
Stap 5: Schrijf het antwoord op           (f'(x) = 12x²)
```

---

## 14. Overige Notities

- Alle tekst op de site is **Nederlands**
- Volg de **Getal & Ruimte notatie** strikt
- Supabase Auth beheert gebruikersaccounts — maak geen eigen auth systeem
- Gemini model: `gemini-1.5-flash` (snel en binnen gratis tier)
- KaTeX importeren via npm: `npm install katex`
- Het uiterlijk is Tailwind, zoals in de README
- Student kan een vraag flaggen als "klopt niet" — sla dit op in een aparte `question_flags` tabel
- De site moet later kunnen uitbreiden naar andere wiskunde topics (integreren, limieten)