-- FortifySec V7.13 — assinatura recorrente (Mercado Pago Preapproval)
-- Safe to run after migrations 001-005.

-- 1) Cursos passam a poder ser vendidos como assinatura mensal ou pagamento único.
alter table public.courses
  add column if not exists billing_type text not null default 'one_time'
  check (billing_type in ('one_time','subscription'));

-- A Formação FortifySec (R$ 99,90) é a assinatura recorrente mensal.
update public.courses
set billing_type = 'subscription',
    updated_at = now()
where slug = 'formacao-fortifysec';

-- 2) Tabela de assinaturas — espelha o preapproval do Mercado Pago.
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  provider text not null default 'mercadopago',
  preapproval_id text unique,
  external_reference text not null,
  status text not null default 'pending', -- pending | authorized | paused | cancelled
  amount_cents integer not null check (amount_cents >= 0),
  next_payment_date timestamptz,
  last_payment_status text,
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, course_id)
);

create index if not exists subscriptions_preapproval_idx on public.subscriptions(preapproval_id);
create index if not exists subscriptions_reference_idx on public.subscriptions(external_reference);
create index if not exists subscriptions_user_idx on public.subscriptions(user_id, status);

-- 3) RLS: o próprio aluno pode ver a assinatura dele; escrita só via service_role (server actions/webhook).
alter table public.subscriptions enable row level security;

drop policy if exists subscriptions_select_self on public.subscriptions;
create policy subscriptions_select_self on public.subscriptions
for select to authenticated
using (user_id = auth.uid());
