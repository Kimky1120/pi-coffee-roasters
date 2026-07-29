-- ============================================================================
-- PI Coffee Roasters 회원 시스템 DB - handle_new_user 메타데이터 확장
-- 회원가입 시 phone, nickname, birth, marketing_agree를 함께 저장한다.
-- 기존 테이블 구조 / RLS 정책은 변경하지 않는다.
-- 실행 위치: Supabase SQL Editor
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin

insert into public.profiles(
 id,
 phone,
 nickname,
 birth,
 marketing_agree
)

values(
 new.id,
 new.raw_user_meta_data ->> 'phone',
 new.raw_user_meta_data ->> 'nickname',
 nullif(new.raw_user_meta_data ->> 'birth', '')::date,
 coalesce((new.raw_user_meta_data ->> 'marketing_agree')::boolean, false)
)

on conflict(id) do nothing;


return new;

end;
$$;
