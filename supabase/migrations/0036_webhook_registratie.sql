-- =============================================================================
-- Seintje bij een nieuwe registratie, zonder geheim in de triggertekst.
--
-- De dashboard-trigger "new-user-notification" zette de header
-- x-webhook-secret letterlijk in de triggerdefinitie. Iedereen die de
-- database mag lezen, zag dat geheim. Deze migratie haalt die trigger weg.
-- Het seintje gaat nu via public.stuur_webhook (migratie 0035), die het
-- geheim uit de Vault leest:
--
--   webhook_nieuwe_gebruiker   auth.users INSERT   → /api/webhooks/new-user
--
-- Hetzelfde webhook_secret en dezelfde webhook_basis_url als de
-- welkomstmail. Het geheim staat niet in dit bestand. Lokaal zet seed.sql
-- een verzonnen waarde; op de echte site staat hij alleen in de Vault.
--
-- Alleen de velden die de route nodig heeft gaan mee, niet de hele
-- gebruikersrij (daar zit ook de wachtwoordhash in).
--
-- Idempotent: twee keer draaien maakt niets stuk en voegt niets dubbel toe.
-- =============================================================================

drop trigger if exists "new-user-notification" on auth.users;

create or replace function public.webhook_nieuwe_gebruiker()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.stuur_webhook('/api/webhooks/new-user', jsonb_build_object(
    'type', 'INSERT',
    'table', 'users',
    'schema', 'auth',
    'record', jsonb_build_object(
      'id', new.id,
      'email', new.email,
      'created_at', new.created_at,
      'raw_user_meta_data', new.raw_user_meta_data
    ),
    'old_record', null
  ));
  return new;
end;
$$;

drop trigger if exists webhook_nieuwe_gebruiker on auth.users;
create trigger webhook_nieuwe_gebruiker
  after insert on auth.users
  for each row execute function public.webhook_nieuwe_gebruiker();
