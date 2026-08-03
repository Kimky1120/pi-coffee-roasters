-- ============================================================================
-- PI Coffee Roasters 주문·결제 기반
-- 브라우저가 아닌 서버에서만 주문 생성·결제 갱신을 수행한다.
-- 실행 위치: Supabase SQL Editor
-- ============================================================================

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique
    check (order_number ~ '^[A-Za-z0-9_-]{6,64}$'),
  user_id uuid references auth.users(id) on delete set null,
  lookup_token_hash text not null,
  confirm_idempotency_key uuid not null default gen_random_uuid(),

  status text not null default 'payment_pending'
    check (status in (
      'payment_pending', 'awaiting_deposit', 'paid', 'payment_failed',
      'canceled', 'partially_refunded', 'refunded'
    )),
  payment_status text not null default 'pending'
    check (payment_status in (
      'pending', 'confirming', 'awaiting_deposit', 'paid', 'failed',
      'canceled', 'partially_refunded', 'refunded'
    )),

  orderer_name text not null,
  orderer_email text not null,
  orderer_phone text not null,
  recipient_name text not null,
  recipient_phone text not null,
  postal_code text not null,
  address_line1 text not null,
  address_line2 text not null,
  delivery_memo text,

  subtotal integer not null check (subtotal >= 0),
  shipping_fee integer not null check (shipping_fee >= 0),
  total_amount integer not null check (total_amount = subtotal + shipping_fee),
  currency text not null default 'KRW' check (currency = 'KRW'),

  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_slug text not null,
  product_name text not null,
  weight text not null,
  grind text not null,
  unit_price integer not null check (unit_price >= 0),
  quantity integer not null check (quantity between 1 and 10),
  line_total integer not null check (line_total = unit_price * quantity),
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  payment_key text not null unique,
  status text not null default 'confirming'
    check (status in (
      'confirming', 'confirmed', 'awaiting_deposit', 'failed', 'canceled',
      'partially_refunded', 'refunded'
    )),
  toss_status text,
  method text,
  amount integer not null check (amount >= 0),
  approved_at timestamptz,
  receipt_url text,
  failure_code text,
  failure_message text,
  confirmation_attempts integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_user_id_created_at_idx
  on public.orders(user_id, created_at desc);
create index orders_status_created_at_idx
  on public.orders(status, created_at desc);
create index order_items_order_id_idx on public.order_items(order_id);

create trigger update_orders_updated_at
before update on public.orders
for each row execute function public.update_updated_at();

create trigger update_payments_updated_at
before update on public.payments
for each row execute function public.update_updated_at();

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;

create or replace function public.is_order_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('staff', 'admin')
  );
$$;

revoke all on function public.is_order_staff() from public;
grant execute on function public.is_order_staff() to authenticated;

create policy "Customers can view own orders"
on public.orders for select to authenticated
using (auth.uid() = user_id);

create policy "Staff can view orders"
on public.orders for select to authenticated
using (public.is_order_staff());

create policy "Staff can update orders"
on public.orders for update to authenticated
using (public.is_order_staff())
with check (public.is_order_staff());

create policy "Customers can view own order items"
on public.order_items for select to authenticated
using (
  exists (
    select 1 from public.orders
    where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
  )
);

create policy "Staff can view order items"
on public.order_items for select to authenticated
using (public.is_order_staff());

create policy "Staff can view payments"
on public.payments for select to authenticated
using (public.is_order_staff());

create or replace function public.create_checkout_order(
  p_order jsonb,
  p_items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_item_total integer;
begin
  if jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) < 1
     or jsonb_array_length(p_items) > 50 then
    raise exception 'INVALID_ORDER_ITEMS';
  end if;

  select coalesce(sum((item->>'line_total')::integer), 0)
    into v_item_total
  from jsonb_array_elements(p_items) item;

  if v_item_total <> (p_order->>'subtotal')::integer then
    raise exception 'ORDER_TOTAL_MISMATCH';
  end if;

  insert into public.orders (
    order_number, user_id, lookup_token_hash,
    orderer_name, orderer_email, orderer_phone,
    recipient_name, recipient_phone, postal_code,
    address_line1, address_line2, delivery_memo,
    subtotal, shipping_fee, total_amount
  ) values (
    p_order->>'order_number', nullif(p_order->>'user_id', '')::uuid,
    p_order->>'lookup_token_hash',
    p_order->>'orderer_name', p_order->>'orderer_email',
    p_order->>'orderer_phone', p_order->>'recipient_name',
    p_order->>'recipient_phone', p_order->>'postal_code',
    p_order->>'address_line1', p_order->>'address_line2',
    nullif(p_order->>'delivery_memo', ''),
    (p_order->>'subtotal')::integer,
    (p_order->>'shipping_fee')::integer,
    (p_order->>'total_amount')::integer
  ) returning id into v_order_id;

  insert into public.order_items (
    order_id, product_slug, product_name, weight, grind,
    unit_price, quantity, line_total
  )
  select
    v_order_id,
    item.product_slug,
    item.product_name,
    item.weight,
    item.grind,
    item.unit_price,
    item.quantity,
    item.line_total
  from jsonb_to_recordset(p_items) as item(
    product_slug text,
    product_name text,
    weight text,
    grind text,
    unit_price integer,
    quantity integer,
    line_total integer
  )
  where item.line_total = item.unit_price * item.quantity;

  if (select count(*) from public.order_items where order_id = v_order_id)
     <> jsonb_array_length(p_items) then
    raise exception 'INVALID_ORDER_ITEM_TOTAL';
  end if;

  return v_order_id;
end;
$$;

create or replace function public.claim_payment_confirmation(
  p_order_number text,
  p_payment_key text,
  p_amount integer,
  p_lookup_token_hash text,
  p_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_payment public.payments%rowtype;
begin
  select * into v_order
  from public.orders
  where order_number = p_order_number
  for update;

  if not found then raise exception 'ORDER_NOT_FOUND'; end if;
  if v_order.total_amount <> p_amount then raise exception 'AMOUNT_MISMATCH'; end if;
  if not (
    (p_user_id is not null and v_order.user_id = p_user_id)
    or v_order.lookup_token_hash = p_lookup_token_hash
  ) then
    raise exception 'ORDER_ACCESS_DENIED';
  end if;

  if v_order.payment_status = 'paid' then
    select * into v_payment from public.payments where order_id = v_order.id;
    if v_payment.payment_key = p_payment_key then
      return jsonb_build_object('state', 'already_confirmed');
    end if;
    raise exception 'ORDER_ALREADY_PAID';
  end if;

  insert into public.payments(order_id, payment_key, amount)
  values (v_order.id, p_payment_key, p_amount)
  on conflict (order_id) do nothing;

  select * into v_payment
  from public.payments
  where order_id = v_order.id
  for update;

  if v_payment.payment_key <> p_payment_key then
    raise exception 'PAYMENT_KEY_MISMATCH';
  end if;

  if v_payment.status in ('confirmed', 'awaiting_deposit') then
    return jsonb_build_object('state', 'already_confirmed');
  end if;

  if v_payment.status = 'confirming'
     and v_payment.confirmation_attempts > 1
     and v_payment.updated_at > now() - interval '30 seconds' then
    return jsonb_build_object('state', 'processing');
  end if;

  update public.payments
  set status = 'confirming',
      confirmation_attempts = confirmation_attempts + 1,
      failure_code = null,
      failure_message = null
  where id = v_payment.id;

  update public.orders
  set payment_status = 'confirming'
  where id = v_order.id;

  return jsonb_build_object(
    'state', 'claimed',
    'idempotency_key', v_order.confirm_idempotency_key::text
  );
end;
$$;

create or replace function public.sync_toss_payment(
  p_order_number text,
  p_payment_key text,
  p_amount integer,
  p_toss_status text,
  p_method text,
  p_approved_at timestamptz,
  p_receipt_url text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_payment_status text;
  v_order_status text;
begin
  select * into v_order
  from public.orders
  where order_number = p_order_number
  for update;

  if not found then raise exception 'ORDER_NOT_FOUND'; end if;
  if v_order.total_amount <> p_amount then raise exception 'AMOUNT_MISMATCH'; end if;

  case p_toss_status
    when 'DONE' then
      v_payment_status := 'confirmed';
      v_order_status := 'paid';
    when 'WAITING_FOR_DEPOSIT' then
      v_payment_status := 'awaiting_deposit';
      v_order_status := 'awaiting_deposit';
    when 'CANCELED' then
      v_payment_status := 'canceled';
      v_order_status := 'canceled';
    when 'PARTIAL_CANCELED' then
      v_payment_status := 'partially_refunded';
      v_order_status := 'partially_refunded';
    when 'ABORTED', 'EXPIRED' then
      v_payment_status := 'failed';
      v_order_status := 'payment_failed';
    else
      v_payment_status := 'confirming';
      v_order_status := 'payment_pending';
  end case;

  insert into public.payments(
    order_id, payment_key, amount, status, toss_status,
    method, approved_at, receipt_url
  ) values (
    v_order.id, p_payment_key, p_amount, v_payment_status, p_toss_status,
    p_method, p_approved_at, p_receipt_url
  )
  on conflict (order_id) do update
  set status = excluded.status,
      toss_status = excluded.toss_status,
      method = excluded.method,
      approved_at = excluded.approved_at,
      receipt_url = excluded.receipt_url,
      failure_code = null,
      failure_message = null
  where public.payments.payment_key = excluded.payment_key;

  if not found then raise exception 'PAYMENT_KEY_MISMATCH'; end if;

  update public.orders
  set status = v_order_status,
      payment_status = case v_payment_status
        when 'confirmed' then 'paid'
        else v_payment_status
      end,
      paid_at = case
        when p_toss_status = 'DONE' then coalesce(p_approved_at, now())
        else paid_at
      end
  where id = v_order.id;

  return v_order_status;
end;
$$;

create or replace function public.mark_payment_failure(
  p_order_number text,
  p_payment_key text,
  p_failure_code text,
  p_failure_message text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.payments p
  set status = 'failed',
      failure_code = left(p_failure_code, 100),
      failure_message = left(p_failure_message, 500)
  from public.orders o
  where p.order_id = o.id
    and o.order_number = p_order_number
    and p.payment_key = p_payment_key
    and o.payment_status <> 'paid';

  update public.orders
  set status = 'payment_failed', payment_status = 'failed'
  where order_number = p_order_number
    and payment_status <> 'paid';
end;
$$;

revoke all on function public.create_checkout_order(jsonb, jsonb) from public, anon, authenticated;
revoke all on function public.claim_payment_confirmation(text, text, integer, text, uuid) from public, anon, authenticated;
revoke all on function public.sync_toss_payment(text, text, integer, text, text, timestamptz, text) from public, anon, authenticated;
revoke all on function public.mark_payment_failure(text, text, text, text) from public, anon, authenticated;

grant execute on function public.create_checkout_order(jsonb, jsonb) to service_role;
grant execute on function public.claim_payment_confirmation(text, text, integer, text, uuid) to service_role;
grant execute on function public.sync_toss_payment(text, text, integer, text, text, timestamptz, text) to service_role;
grant execute on function public.mark_payment_failure(text, text, text, text) to service_role;
