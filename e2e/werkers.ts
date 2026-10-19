/**
 * Hoeveel testleerlingen er klaarstaan: één per werker.
 *
 * De e2e-tests draaien naast elkaar. Deelden twee werkers één leerling, dan
 * schreven ze door elkaars voortgang heen en werd de uitslag een gok. Daarom
 * krijgt elke werker zijn eigen paar accounts; zie de fixtures `leerling` en
 * `nieuweLeerling` in `e2e/leerling.ts`.
 *
 * Dezelfde hoeveelheid staat in de lus bovenaan `supabase/seed.sql`, die de
 * accounts aanmaakt. Zet je het hier hoger, zet het daar dan ook hoger — en
 * blijf onder de tien: het nummer wordt daar als één cijfer in de uuid
 * geplakt.
 *
 * Dit bestand staat bewust los van `e2e/leerling.ts`: playwright.config.ts
 * leest het, en dat moet niet de halve testhulp (en Supabase) binnenhalen.
 */
export const AANTAL_TESTLEERLINGEN = 4
