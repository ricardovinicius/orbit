begin;
create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;
select plan(4);

-- Recreate the pre-feature state transactionally, preserving the test stack.
insert into auth.users (id, email, raw_user_meta_data) values
  ('44444444-4444-4444-8444-444444444444', 'existing@example.test', '{"full_name":"Existing user","picture":"https://example.test/existing.png"}');
drop trigger sync_auth_profile on auth.users;
drop table public.profiles;
drop function public.has_active_session();
drop function private.sync_profile();
drop function private.metadata_string(jsonb, text);
\ir ../migrations/20261023234702_private_profiles.sql

select is((select name from public.profiles where id='44444444-4444-4444-8444-444444444444'), 'Existing user', 'migration backfills pre-existing Auth users');
select is((select email from public.profiles where id='44444444-4444-4444-8444-444444444444'), 'existing@example.test', 'backfill preserves Auth email');
select is((select avatar_url from public.profiles where id='44444444-4444-4444-8444-444444444444'), 'https://example.test/existing.png', 'backfill uses legacy picture metadata');
select ok((select relrowsecurity from pg_class where oid='public.profiles'::regclass), 'backfilled table has RLS enabled');
select * from finish();
rollback;
