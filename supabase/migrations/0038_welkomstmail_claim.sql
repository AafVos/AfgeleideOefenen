-- Eén welkomstmail per leerling.
--
-- De mail gaat uit vanaf twee kanten die elkaar kunnen inhalen: de
-- bevestigingspagina én de webhook op het moment dat het adres bevestigd
-- wordt. De vlag in de metagegevens van de gebruiker is dan te laat: beide
-- kanten lezen "nog niet verstuurd" en sturen allebei.
--
-- Deze tabel is de afspraak. De eerste aanroep zet een rij, de tweede
-- botst op de primaire sleutel en stuurt niets. Lukt het versturen niet,
-- dan haalt de code de rij weer weg, zodat een volgende poging het
-- opnieuw mag proberen.
--
-- Geen beleid: een leerling hoort hier niet bij te kunnen. Alleen de
-- service-role, die het beleid overslaat, schrijft hier.
--
-- Twee keer draaien maakt niets stuk en voegt niets dubbel toe.

create table if not exists public.welkomstmail_claim (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  geclaimd_op timestamptz not null default now()
);

alter table public.welkomstmail_claim enable row level security;

revoke all on table public.welkomstmail_claim from public, anon, authenticated;
