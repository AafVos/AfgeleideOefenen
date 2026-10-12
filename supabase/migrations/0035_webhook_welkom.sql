-- =============================================================================
-- Welkomstmail zodra een leerling het e-mailadres bevestigt.
--
-- De route /api/webhooks/welkom lag klaar, maar het seintje stond niet aan:
-- de mail ging pas mee met het inloggen. Deze trigger vuurt op de database
-- zelf, op het moment dat email_confirmed_at van leeg naar gevuld gaat, ook
-- als de leerling het tabblad daarna dichtdoet.
--
--   webhook_welkom   auth.users UPDATE   → /api/webhooks/welkom
--
-- Alleen id en email_confirmed_at gaan mee, niet de hele gebruikersrij
-- (daar zit ook de wachtwoordhash in).
--
-- Het geheim staat niet in dit bestand. De functie leest het uit de Vault,
-- samen met het adres:
--
--   webhook_secret     de header x-webhook-secret. Zelfde waarde als
--                      WEBHOOK_SECRET van de site. Lokaal zet seed.sql
--                      een verzonnen waarde; op de echte site wordt hij
--                      apart in de Vault gezet, nooit in de repo.
--   webhook_basis_url  waar /api/webhooks/* staat. Hieronder het echte
--                      domein, alleen als die waarde er nog niet is.
--                      Lokaal zet seed.sql hem daarna op de testserver.
--
-- Ontbreekt een van de twee, dan gaat er niets de deur uit en blijft het
-- bij een waarschuwing. Een lokale database mag nooit per ongeluk de
-- echte site aanroepen.
--
-- Idempotent: twee keer draaien maakt niets stuk en voegt niets dubbel toe.
-- =============================================================================

create extension if not exists pg_net;

-- ── Waar de webhook heen gaat ────────────────────────────────────────────────
do $$
begin
  if to_regclass('vault.secrets') is null then
    raise warning 'Geen Vault in deze database; webhook_basis_url niet gezet.';
    return;
  end if;
  if not exists (select 1 from vault.secrets where name = 'webhook_basis_url') then
    perform vault.create_secret(
      -- Het kale domein stuurt door naar www.
      'https://www.afgeleideoefenen.nl',
      'webhook_basis_url',
      'Waar /api/webhooks/* staat'
    );
  end if;
end
$$;

-- ── Versturen ────────────────────────────────────────────────────────────────
create or replace function public.stuur_webhook(pad text, payload jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  geheim text;
  basis  text;
begin
  select decrypted_secret into geheim from vault.decrypted_secrets where name = 'webhook_secret';
  select decrypted_secret into basis  from vault.decrypted_secrets where name = 'webhook_basis_url';

  if geheim is null or basis is null then
    raise warning 'webhook_secret of webhook_basis_url ontbreekt in de Vault; webhook % niet verstuurd', pad;
    return;
  end if;

  perform net.http_post(
    url := rtrim(basis, '/') || pad,
    body := payload,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', geheim
    ),
    timeout_milliseconds := 5000
  );
exception
  -- Bevestigen van een e-mailadres mag nooit stuklopen op een webhook.
  when others then
    raise warning 'webhook % niet verstuurd: %', pad, sqlerrm;
end;
$$;

revoke all on function public.stuur_webhook(text, jsonb) from public, anon, authenticated;

-- ── Bij het bevestigen van het e-mailadres ───────────────────────────────────
create or replace function public.webhook_welkom()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email_confirmed_at is not null and old.email_confirmed_at is null then
    perform public.stuur_webhook('/api/webhooks/welkom', jsonb_build_object(
      'type', 'UPDATE',
      'table', 'users',
      'schema', 'auth',
      'record', jsonb_build_object('id', new.id, 'email_confirmed_at', new.email_confirmed_at),
      'old_record', jsonb_build_object('id', old.id, 'email_confirmed_at', old.email_confirmed_at)
    ));
  end if;
  return new;
end;
$$;

drop trigger if exists webhook_welkom on auth.users;
create trigger webhook_welkom
  after update of email_confirmed_at on auth.users
  for each row execute function public.webhook_welkom();
