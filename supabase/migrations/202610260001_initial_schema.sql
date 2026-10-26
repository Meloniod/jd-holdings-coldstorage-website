-- Draft production schema. Review with a qualified security engineer before applying.
-- Browser-local demo does not connect to this migration.
create extension if not exists pgcrypto;

create type public.app_role as enum ('administrator','mortuary_staff','release_officer','finance');
create type public.case_status as enum ('awaiting_allocation','in_storage','release_pending','released');
create type public.position_status as enum ('available','occupied','maintenance');
create type public.release_status as enum ('pending','approved','rejected','completed');
create type public.invoice_status as enum ('outstanding','paid','overdue');

create table public.facilities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  address text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role public.app_role not null default 'mortuary_staff',
  facility_id uuid references public.facilities(id),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.refrigeration_units (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facilities(id),
  name text not null,
  code text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (facility_id, code)
);

create table public.storage_positions (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facilities(id),
  unit_id uuid not null references public.refrigeration_units(id),
  position_code text not null,
  status public.position_status not null default 'available',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (unit_id, position_code),
  unique (id, facility_id)
);

create table public.cases (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facilities(id),
  case_number text not null,
  legal_name text,
  unidentified_designation text,
  status public.case_status not null default 'awaiting_allocation',
  referring_institution text,
  received_at timestamptz not null default now(),
  received_by uuid not null references public.profiles(id),
  administrative_notes text,
  daily_storage_rate numeric(12,2) not null default 0 check (daily_storage_rate >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null references public.profiles(id),
  unique (facility_id, case_number),
  check (legal_name is not null or unidentified_designation is not null)
);
create index cases_facility_status_idx on public.cases(facility_id, status);
create index cases_received_at_idx on public.cases(facility_id, received_at desc);

create table public.intake_records (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id),
  received_at timestamptz not null,
  received_by uuid not null references public.profiles(id),
  referring_institution text,
  identification_reference text,
  notes text,
  created_at timestamptz not null default now(),
  created_by uuid not null references public.profiles(id)
);
create index intake_records_case_idx on public.intake_records(case_id, created_at desc);

create table public.storage_allocations (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facilities(id),
  case_id uuid not null references public.cases(id),
  position_id uuid not null references public.storage_positions(id),
  allocated_at timestamptz not null default now(),
  allocated_by uuid not null references public.profiles(id),
  released_at timestamptz,
  released_by uuid references public.profiles(id),
  transfer_reason text,
  created_at timestamptz not null default now(),
  check (released_at is null or released_at >= allocated_at)
);
create unique index one_active_allocation_per_position
  on public.storage_allocations(position_id) where released_at is null;
create unique index one_active_position_per_case
  on public.storage_allocations(case_id) where released_at is null;
create index allocations_facility_active_idx on public.storage_allocations(facility_id, released_at);

create table public.release_requests (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facilities(id),
  case_id uuid not null references public.cases(id),
  requesting_party text not null,
  receiving_party text not null,
  requested_release_at timestamptz not null,
  required_documents_complete boolean not null default false,
  identity_authority_verified boolean not null default false,
  status public.release_status not null default 'pending',
  requested_by uuid not null references public.profiles(id),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  review_notes text,
  completed_by uuid references public.profiles(id),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status not in ('approved','completed')) or
    (required_documents_complete and identity_authority_verified and reviewed_by is not null and reviewed_at is not null)),
  check ((status <> 'completed') or (completed_by is not null and completed_at is not null))
);
create index release_requests_facility_status_idx on public.release_requests(facility_id, status);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facilities(id),
  case_id uuid not null references public.cases(id),
  category text not null,
  original_filename text not null,
  storage_object_path text not null unique,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0),
  uploaded_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  retention_until timestamptz
);
create index documents_case_idx on public.documents(case_id, created_at desc);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facilities(id),
  invoice_number text not null,
  case_id uuid not null references public.cases(id),
  period_start date not null,
  period_end date not null,
  currency char(3) not null default 'ZAR',
  subtotal numeric(12,2) not null default 0 check (subtotal >= 0),
  tax_amount numeric(12,2) not null default 0 check (tax_amount >= 0),
  total_amount numeric(12,2) generated always as (subtotal + tax_amount) stored,
  status public.invoice_status not null default 'outstanding',
  issued_at timestamptz not null default now(),
  due_at timestamptz,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (facility_id, invoice_number),
  check (period_end >= period_start)
);
create index invoices_facility_status_idx on public.invoices(facility_id, status);
-- Overlap prevention for non-void invoices must be enforced transactionally in the server workflow.

create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete restrict,
  description text not null,
  quantity numeric(12,2) not null check (quantity >= 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  line_total numeric(12,2) generated always as (quantity * unit_price) stored
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facilities(id),
  invoice_id uuid not null references public.invoices(id),
  amount numeric(12,2) not null check (amount > 0),
  paid_at timestamptz not null default now(),
  payment_reference text,
  recorded_by uuid not null references public.profiles(id),
  notes text,
  created_at timestamptz not null default now()
);
create index payments_invoice_idx on public.payments(invoice_id, paid_at desc);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid references public.facilities(id),
  actor_id uuid references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index audit_events_facility_created_idx on public.audit_events(facility_id, created_at desc);

-- Security-definer helpers read the authenticated user's database-backed profile.
create or replace function public.current_app_role()
returns public.app_role language sql stable security definer set search_path = public
as $$ select role from public.profiles where id = auth.uid() and active = true limit 1 $$;

create or replace function public.current_facility_id()
returns uuid language sql stable security definer set search_path = public
as $$ select facility_id from public.profiles where id = auth.uid() and active = true limit 1 $$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select coalesce(public.current_app_role() = 'administrator', false) $$;

create or replace function public.can_access_facility(target_facility uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select public.is_admin() or (public.current_facility_id() is not null and public.current_facility_id() = target_facility) $$;

alter table public.facilities enable row level security;
alter table public.profiles enable row level security;
alter table public.refrigeration_units enable row level security;
alter table public.storage_positions enable row level security;
alter table public.cases enable row level security;
alter table public.intake_records enable row level security;
alter table public.storage_allocations enable row level security;
alter table public.release_requests enable row level security;
alter table public.documents enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.payments enable row level security;
alter table public.audit_events enable row level security;

create policy "profiles read self or admin" on public.profiles for select
using (id = auth.uid() or public.is_admin());
create policy "profiles admin manages" on public.profiles for all
using (public.is_admin()) with check (public.is_admin());

create policy "facilities scoped read" on public.facilities for select
using (public.can_access_facility(id));
create policy "facilities admin manages" on public.facilities for all
using (public.is_admin()) with check (public.is_admin());

create policy "units scoped read" on public.refrigeration_units for select
using (public.can_access_facility(facility_id));
create policy "units admin manages" on public.refrigeration_units for all
using (public.is_admin()) with check (public.is_admin());

create policy "positions scoped read" on public.storage_positions for select
using (public.can_access_facility(facility_id));
create policy "positions operational writes" on public.storage_positions for update
using (public.can_access_facility(facility_id) and public.current_app_role() in ('administrator','mortuary_staff'))
with check (public.can_access_facility(facility_id) and public.current_app_role() in ('administrator','mortuary_staff'));
create policy "positions admin inserts deletes" on public.storage_positions for all
using (public.is_admin()) with check (public.is_admin());

create policy "cases scoped read" on public.cases for select
using (public.can_access_facility(facility_id));
create policy "cases staff inserts" on public.cases for insert
with check (public.can_access_facility(facility_id) and public.current_app_role() in ('administrator','mortuary_staff') and created_by = auth.uid() and received_by = auth.uid());
create policy "cases staff updates" on public.cases for update
using (public.can_access_facility(facility_id) and public.current_app_role() in ('administrator','mortuary_staff'))
with check (public.can_access_facility(facility_id) and public.current_app_role() in ('administrator','mortuary_staff'));

create policy "intake scoped read" on public.intake_records for select
using (exists(select 1 from public.cases c where c.id = case_id and public.can_access_facility(c.facility_id)));
create policy "intake staff writes" on public.intake_records for insert
with check (public.current_app_role() in ('administrator','mortuary_staff') and created_by = auth.uid() and exists(select 1 from public.cases c where c.id = case_id and public.can_access_facility(c.facility_id)));

create policy "allocations scoped read" on public.storage_allocations for select
using (public.can_access_facility(facility_id));
create policy "allocations staff writes" on public.storage_allocations for insert
with check (public.can_access_facility(facility_id) and public.current_app_role() in ('administrator','mortuary_staff') and allocated_by = auth.uid());
create policy "allocations staff updates" on public.storage_allocations for update
using (public.can_access_facility(facility_id) and public.current_app_role() in ('administrator','mortuary_staff'))
with check (public.can_access_facility(facility_id) and public.current_app_role() in ('administrator','mortuary_staff'));

create policy "release scoped read" on public.release_requests for select
using (public.can_access_facility(facility_id) and public.current_app_role() in ('administrator','mortuary_staff','release_officer'));
create policy "release staff submits" on public.release_requests for insert
with check (public.can_access_facility(facility_id) and public.current_app_role() in ('administrator','mortuary_staff') and requested_by = auth.uid());
create policy "release officer reviews" on public.release_requests for update
using (public.can_access_facility(facility_id) and public.current_app_role() in ('administrator','release_officer'))
with check (public.can_access_facility(facility_id) and public.current_app_role() in ('administrator','release_officer'));

create policy "documents scoped read" on public.documents for select
using (public.can_access_facility(facility_id));
create policy "documents staff inserts" on public.documents for insert
with check (public.can_access_facility(facility_id) and public.current_app_role() in ('administrator','mortuary_staff') and uploaded_by = auth.uid());

create policy "invoices finance read" on public.invoices for select
using (public.can_access_facility(facility_id) and public.current_app_role() in ('administrator','finance'));
create policy "invoices finance inserts" on public.invoices for insert
with check (public.can_access_facility(facility_id) and public.current_app_role() in ('administrator','finance') and created_by = auth.uid());
create policy "invoices finance updates" on public.invoices for update
using (public.can_access_facility(facility_id) and public.current_app_role() in ('administrator','finance'))
with check (public.can_access_facility(facility_id) and public.current_app_role() in ('administrator','finance'));

create policy "invoice items finance read" on public.invoice_items for select
using (exists(select 1 from public.invoices i where i.id = invoice_id and public.can_access_facility(i.facility_id) and public.current_app_role() in ('administrator','finance')));
create policy "invoice items finance writes" on public.invoice_items for all
using (exists(select 1 from public.invoices i where i.id = invoice_id and public.can_access_facility(i.facility_id) and public.current_app_role() in ('administrator','finance')))
with check (exists(select 1 from public.invoices i where i.id = invoice_id and public.can_access_facility(i.facility_id) and public.current_app_role() in ('administrator','finance')));

create policy "payments finance read" on public.payments for select
using (public.can_access_facility(facility_id) and public.current_app_role() in ('administrator','finance'));
create policy "payments finance inserts" on public.payments for insert
with check (public.can_access_facility(facility_id) and public.current_app_role() in ('administrator','finance') and recorded_by = auth.uid());

create policy "audit scoped read" on public.audit_events for select
using (public.can_access_facility(facility_id) and public.current_app_role() = 'administrator');
create policy "audit authenticated insert" on public.audit_events for insert
with check (actor_id = auth.uid() and (facility_id is null or public.can_access_facility(facility_id)));
-- Deliberately no update/delete policy on audit_events: events should be append-only for application roles.
