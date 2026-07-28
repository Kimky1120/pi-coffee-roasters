-- ============================================================================
-- PI Coffee Roasters 회원 시스템 DB - profiles 컬럼 추가
-- nickname, birth 컬럼만 추가한다.
-- 기존 profiles 테이블 구조 / RLS 정책은 변경하지 않는다.
-- 미래 생년월일 등 값 검증은 애플리케이션(Server Action)에서 처리한다.
-- 실행 위치: Supabase SQL Editor
-- ============================================================================

alter table public.profiles
  add column if not exists nickname text,
  add column if not exists birth date;

comment on column public.profiles.nickname is '닉네임';
comment on column public.profiles.birth is '생년월일';
