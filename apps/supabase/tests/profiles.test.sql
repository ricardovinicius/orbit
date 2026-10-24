begin;
create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;
select no_plan();

insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-4111-8111-111111111111', 'a@example.test', '{"full_name":" Alice ", "avatar_url":"https://example.test/a.png"}'),
  ('22222222-2222-4222-8222-222222222222', 'b@example.test', '{"full_name":12,"name":"Bob","avatar_url":false}');
insert into auth.sessions (id, user_id) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '22222222-2222-4222-8222-222222222222');

select is((select name from public.profiles where id='11111111-1111-4111-8111-111111111111'), 'Alice', 'normalizes metadata');
select is((select name from public.profiles where id='22222222-2222-4222-8222-222222222222'), 'Bob', 'falls back when preferred metadata is not a string');
select is((select avatar_url from public.profiles where id='22222222-2222-4222-8222-222222222222'), null, 'ignores malformed avatar');
update auth.users set email='changed@example.test', raw_user_meta_data='{"name":"Updated","picture":"https://example.test/b.png"}' where id='22222222-2222-4222-8222-222222222222';
select is((select email from public.profiles where id='22222222-2222-4222-8222-222222222222'), 'changed@example.test', 'synchronizes email');
select is((select name from public.profiles where id='22222222-2222-4222-8222-222222222222'), 'Updated', 'synchronizes metadata');
select is((select count(*)::integer from public.profiles where id='22222222-2222-4222-8222-222222222222'), 1, 'updates do not duplicate profiles');
select ok(not has_table_privilege('anon', 'public.profiles', 'SELECT'), 'anonymous has no profile read privilege');
select ok(not has_table_privilege('authenticated', 'public.profiles', 'INSERT,UPDATE,DELETE'), 'authenticated has no write privileges');
select ok(not has_function_privilege('anon', 'public.has_active_session()', 'EXECUTE'), 'anonymous cannot execute session check');
select ok(not has_schema_privilege('authenticated', 'private', 'USAGE'), 'private trigger helpers are inaccessible');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","session_id":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"}', true);
select ok(public.has_active_session(), 'valid caller session accepted');
select is((select count(*)::integer from public.profiles), 1, 'caller sees only own profile');
select is((select count(*)::integer from public.profiles where id='22222222-2222-4222-8222-222222222222'), 0, 'foreign profile hidden');
select throws_ok($$update public.profiles set name='tampered'$$, '42501', null, 'direct writes rejected');
select set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","session_id":"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"}', true);
select ok(not public.has_active_session(), 'another user session cannot authorize caller');
select set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","session_id":"invalid"}', true);
select ok(not public.has_active_session(), 'malformed session fails closed');
select set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111"}', true);
select ok(not public.has_active_session(), 'missing session fails closed');
select is((select count(*)::integer from public.profiles), 0, 'missing session cannot read profile');
reset role;
delete from auth.sessions where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","session_id":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"}', true);
select ok(not public.has_active_session(), 'deleted session rejected');
select is((select count(*)::integer from public.profiles), 0, 'revoked JWT cannot read profile');
reset role;

alter table public.profiles add constraint test_profile_failure check (name <> 'Blocked');
select throws_ok($$insert into auth.users (id, email, raw_user_meta_data) values ('33333333-3333-4333-8333-333333333333', 'failure@example.test', '{"name":"Blocked"}')$$, '23514', null, 'profile write failure aborts provisioning');
select is((select count(*)::integer from auth.users where id='33333333-3333-4333-8333-333333333333'), 0, 'failed provisioning leaves no orphan account');
delete from auth.users where id='22222222-2222-4222-8222-222222222222';
select is((select count(*)::integer from public.profiles where id='22222222-2222-4222-8222-222222222222'), 0, 'profile cascades with Auth user');
select * from finish();
rollback;
