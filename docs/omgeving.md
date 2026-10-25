# Omgeving van de Worker

Eén lijst van wat de live site nodig heeft. De namen staan in
[`scripts/worker-omgeving.json`](../scripts/worker-omgeving.json). De code en de
ochtendcontrole lezen dat bestand. Hieronder dezelfde lijst, zodat je hem kunt
lezen zonder de code open te doen.

Geen waarden. Een geheim hoort als Worker-secret in Cloudflare, nooit in dit
bestand, in een commit of in een melding.

| Naam | Waarvoor | Wanneer | Geheim | Verplicht |
| --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Adres van Supabase | bouw | nee | ja |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Openbare sleutel van Supabase | bouw | nee | ja |
| `NEXT_PUBLIC_SITE_URL` | Adres van de site | bouw | nee | ja |
| `NEXT_PUBLIC_SITE_VARIANT` | Welke site: `afgeleide` of `wiskundemetaaf`. Leeg = `afgeleide` | bouw | nee | nee |
| `NEXT_PUBLIC_GOOGLE_LOGIN` | Knop Doorgaan met Google (`1` = aan) | bouw | nee | nee |
| `NEXT_PUBLIC_CF_BEACON_TOKEN` | Meetbezoek van Cloudflare | bouw | nee | nee |
| `SUPABASE_SERVICE_ROLE_KEY` | Server mag namens de site in de database | runtime | ja | ja |
| `GEMINI_API_KEY` | Controle van een open antwoord | runtime | ja | ja |
| `RESEND_API_KEY` | Mail die de site zelf stuurt | runtime | ja | ja |
| `NOTIFY_EMAIL` | Ontvanger van seintjes en berichten van leerlingen | runtime | ja | ja |
| `EMAIL_FROM` | Afzender; anders `no-reply` op het domein van de site | runtime | nee | nee |
| `WEBHOOK_SECRET` | Supabase mag de webhooks aanroepen | runtime | ja | ja |
| `MEET_SCHUILNAAM_GEHEIM` | Schuilnaam in de klikmeting; zelfde waarde als `meet_schuilnaam_geheim` in de Vault | runtime | ja | nee |

**Bouw** betekent: Workers Builds zet de naam tijdens het bouwen in de site.
`NEXT_PUBLIC_`-waarden zitten daarna in de pagina die de browser krijgt. Een
wijziging geldt pas na een nieuwe bouw.

**Runtime** betekent: de Worker leest de naam bij elk verzoek. Geheimen zet je
met `npx wrangler secret put <NAAM>`. `EMAIL_FROM` is geen geheim; die mag als
gewone variabele op de Worker.

De ochtendcontrole (`.github/workflows/worker-omgeving.yml`) vergelijkt de
namen van de geheimen op de Worker met de verplichte runtime-geheimen. Ontbreekt
er een, dan komt er een melding in Issues, alleen met de naam.

Ontbreekt `NOTIFY_EMAIL` of `RESEND_API_KEY` terwijl de site draait, dan staat
dat ook op de beheerpagina (`/admin`). Het seintje bij een nieuwe gebruiker
gaat dan niet weg; de webhook antwoordt nog steeds met een geslaagd bericht,
zodat Supabase niet eindeloos opnieuw probeert.
