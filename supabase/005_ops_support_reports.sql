-- Fortify Cloud V3 — suporte operacional e relatórios self-service
-- Migration additive. Execute after 001..004.

alter table public.cloud_support_tickets
  add column if not exists category text not null default 'support',
  add column if not exists assigned_to uuid references auth.users(id) on delete set null,
  add column if not exists resolution_note text,
  add column if not exists resolved_at timestamptz,
  add column if not exists closed_at timestamptz,
  add column if not exists last_reply_at timestamptz;

create index if not exists cloud_support_tickets_org_status_idx
  on public.cloud_support_tickets(organization_id, status, updated_at desc);

create table if not exists public.cloud_support_ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.cloud_support_tickets(id) on delete cascade,
  organization_id uuid not null references public.cloud_organizations(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  author_role text not null default 'customer',
  body text not null,
  is_internal boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists cloud_support_ticket_messages_ticket_idx
  on public.cloud_support_ticket_messages(ticket_id, created_at asc);

alter table public.cloud_support_ticket_messages enable row level security;

drop policy if exists support_messages_read on public.cloud_support_ticket_messages;
create policy support_messages_read on public.cloud_support_ticket_messages
for select using (
  public.cloud_is_org_member(organization_id)
  and (is_internal = false or public.cloud_is_admin())
);

drop policy if exists support_messages_customer_insert on public.cloud_support_ticket_messages;
create policy support_messages_customer_insert on public.cloud_support_ticket_messages
for insert with check (
  public.cloud_is_org_member(organization_id)
  and author_id = auth.uid()
  and is_internal = false
  and author_role = 'customer'
);

drop policy if exists support_messages_admin_all on public.cloud_support_ticket_messages;
create policy support_messages_admin_all on public.cloud_support_ticket_messages
for all using(public.cloud_is_admin()) with check(public.cloud_is_admin());

grant select, insert on public.cloud_support_ticket_messages to authenticated;

alter table public.cloud_monthly_reports
  add column if not exists generation_status text not null default 'ready',
  add column if not exists source text not null default 'admin',
  add column if not exists generated_by uuid references auth.users(id) on delete set null,
  add column if not exists generated_at timestamptz,
  add column if not exists summary jsonb not null default '{}'::jsonb;

create index if not exists cloud_monthly_reports_org_month_idx
  on public.cloud_monthly_reports(organization_id, reference_month desc);
