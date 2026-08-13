-- ============================================================================
-- 회원 성명 저장, 본인확인 기반 정보 변경, 마케팅 동의 이력
-- 신규 회원은 name을 함께 저장한다.
-- 회원정보 수정은 비밀번호·이메일·소셜 계정 재인증을 확인하는 서버 API로만 처리한다.
-- ============================================================================

alter table public.profiles
add column if not exists marketing_agree_updated_at timestamptz;

update public.profiles
set marketing_agree_updated_at = coalesce(updated_at, created_at, now())
where marketing_agree_updated_at is null;

alter table public.profiles
alter column marketing_agree_updated_at set default now(),
alter column marketing_agree_updated_at set not null;

create table if not exists public.marketing_consent_history (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  consented boolean not null,
  source text not null default 'account'
    check (source in ('signup', 'account', 'migration')),
  changed_at timestamptz not null default now()
);

create index if not exists marketing_consent_history_user_changed_idx
on public.marketing_consent_history(user_id, changed_at desc);

alter table public.marketing_consent_history enable row level security;

drop policy if exists "Users can view own marketing consent history"
on public.marketing_consent_history;

create policy "Users can view own marketing consent history"
on public.marketing_consent_history
for select to authenticated
using (auth.uid() = user_id);

insert into public.marketing_consent_history(
  user_id,
  consented,
  source,
  changed_at
)
select
  profiles.id,
  coalesce(profiles.marketing_agree, false),
  'migration',
  profiles.marketing_agree_updated_at
from public.profiles
where not exists (
  select 1
  from public.marketing_consent_history history
  where history.user_id = profiles.id
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles(
    id,
    name,
    phone,
    nickname,
    birth,
    marketing_agree,
    marketing_agree_updated_at
  )
  values(
    new.id,
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'phone'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'nickname'), ''),
    nullif(new.raw_user_meta_data ->> 'birth', '')::date,
    coalesce((new.raw_user_meta_data ->> 'marketing_agree')::boolean, false),
    now()
  )
  on conflict(id) do nothing;

  insert into public.marketing_consent_history(
    user_id,
    consented,
    source
  )
  values(
    new.id,
    coalesce((new.raw_user_meta_data ->> 'marketing_agree')::boolean, false),
    'signup'
  );

  return new;
end;
$$;

drop trigger if exists protect_profile_identity_fields on public.profiles;
drop function if exists public.protect_profile_identity_fields();

create or replace function public.log_marketing_consent_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.marketing_agree is distinct from old.marketing_agree then
    new.marketing_agree_updated_at = now();

    insert into public.marketing_consent_history(
      user_id,
      consented,
      source,
      changed_at
    )
    values(
      new.id,
      coalesce(new.marketing_agree, false),
      'account',
      new.marketing_agree_updated_at
    );
  end if;

  return new;
end;
$$;

drop trigger if exists log_marketing_consent_change on public.profiles;

create trigger log_marketing_consent_change
before update of marketing_agree on public.profiles
for each row
execute function public.log_marketing_consent_change();

comment on table public.marketing_consent_history is
  '마케팅 정보 수신 동의 및 철회 이력을 변경 시각과 함께 보관한다.';

-- 브라우저에서 직접 수정하지 못하게 하고, 재인증을 검사하는 서버 API만 허용한다.
drop policy if exists "Users can update own profile" on public.profiles;
