create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,

  role text not null default 'customer'
    check (role in ('customer','staff','admin')),

  name text,
  phone text,

  marketing_agree boolean default false,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);


create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin

insert into public.profiles(
 id,
 phone
)

values(
 new.id,
 new.raw_user_meta_data ->> 'phone'
)

on conflict(id) do nothing;


return new;

end;
$$;



create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();



create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
 new.updated_at = now();
 return new;
end;
$$;


create trigger update_profiles_updated_at
before update on public.profiles
for each row
execute function public.update_updated_at();



alter table public.profiles enable row level security;



create policy "Users can view own profile"
on public.profiles
for select
using(
 auth.uid() = id
);



create policy "Users can update own profile"
on public.profiles
for update
using(
 auth.uid() = id
);