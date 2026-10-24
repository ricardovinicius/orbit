create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  avatar_url text,
  email text
);

alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create function private.metadata_string(metadata jsonb, key text)
returns text language sql immutable set search_path = '' as $$
  select case when jsonb_typeof(metadata -> key) = 'string'
    then nullif(btrim(metadata ->> key), '') else null end;
$$;

create function private.sync_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, name, avatar_url, email)
  values (
    new.id,
    coalesce(private.metadata_string(new.raw_user_meta_data, 'full_name'), private.metadata_string(new.raw_user_meta_data, 'name')),
    coalesce(private.metadata_string(new.raw_user_meta_data, 'avatar_url'), private.metadata_string(new.raw_user_meta_data, 'picture')),
    nullif(btrim(new.email), '')
  ) on conflict (id) do update set
    name = excluded.name, avatar_url = excluded.avatar_url, email = excluded.email;
  return new;
end;
$$;
revoke all on function private.metadata_string(jsonb, text) from public, anon, authenticated;
revoke all on function private.sync_profile() from public, anon, authenticated;

create trigger sync_auth_profile
  after insert or update of raw_user_meta_data, email on auth.users
  for each row execute function private.sync_profile();

insert into public.profiles (id, name, avatar_url, email)
select id,
  coalesce(private.metadata_string(raw_user_meta_data, 'full_name'), private.metadata_string(raw_user_meta_data, 'name')),
  coalesce(private.metadata_string(raw_user_meta_data, 'avatar_url'), private.metadata_string(raw_user_meta_data, 'picture')),
  nullif(btrim(email), '')
from auth.users on conflict (id) do nothing;

-- A valid JWT alone can outlive sign-out. Check only the caller's session.
create function public.has_active_session()
returns boolean language plpgsql stable security definer set search_path = '' as $$
declare
  caller uuid;
  session uuid;
begin
  caller := auth.uid();
  session := (auth.jwt() ->> 'session_id')::uuid;
  if caller is null or session is null then return false; end if;
  return exists (select 1 from auth.sessions s where s.id = session and s.user_id = caller);
exception when invalid_text_representation then
  return false;
end;
$$;
revoke all on function public.has_active_session() from public, anon, authenticated;
grant execute on function public.has_active_session() to authenticated;

create policy profiles_owner_read on public.profiles for select to authenticated
using ((select auth.uid()) = id and (select public.has_active_session()));
