-- De stoomcursus hoort bij de oude gedeelde database. Deze site leest
-- de tabel nergens: geen code, geen functie, geen view. Hij heeft een
-- kolom site (afgeleiden of integralen) en een primaire sleutel op
-- (user_id, site). Integralen heeft hier geen rijen; die site heeft
-- sinds 9 oktober 2026 een eigen database.
--
-- Alleen de kolom site weghalen laat een tabel staan die niemand
-- gebruikt, en de sleutel moet dan toch opnieuw. Daarom gaat de hele
-- tabel weg, inclusief de leesregels die eraan hangen. Twee keer
-- draaien haalt niets extra weg.

DROP TABLE IF EXISTS public.stoomcursus_progress;
