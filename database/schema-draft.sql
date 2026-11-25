-- Review-only SQL draft. Do not run against AutoForecast or production.
begin;
create table public.astralis_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 locale text not null default 'en' check(locale in ('en','es')),
 created_at timestamptz not null default now()
);
create table public.astralis_matches (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 relationship text not null check(relationship in ('partner','crush','friendship')),
 engine_version text not null,
 symbolic_index integer not null check(symbolic_index between 0 and 100),
 created_at timestamptz not null default now(),
 unique(id,user_id)
);
create table public.astralis_orders (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete restrict,
 match_id uuid not null,
 product text not null check(product='match-premium'),
 amount_cents integer not null check(amount_cents>0),
 currency text not null check(currency='USD'),
 status text not null default 'pending' check(status in ('pending','paid','failed','refunded')),
 provider_reference text unique,
 created_at timestamptz not null default now(),
 foreign key(match_id,user_id) references public.astralis_matches(id,user_id) on delete restrict,
 unique(id,user_id)
);
create table public.astralis_reports (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete restrict,
 order_id uuid not null unique,
 locale text not null check(locale in ('en','es')),
 content jsonb not null check(jsonb_typeof(content)='object'),
 created_at timestamptz not null default now(),
 foreign key(order_id,user_id) references public.astralis_orders(id,user_id) on delete restrict
);
create index on public.astralis_matches(user_id);
create index on public.astralis_orders(user_id);
create index on public.astralis_orders(match_id,user_id);
create index on public.astralis_reports(user_id);
alter table public.astralis_profiles enable row level security;
alter table public.astralis_matches enable row level security;
alter table public.astralis_orders enable row level security;
alter table public.astralis_reports enable row level security;
revoke all on public.astralis_profiles,public.astralis_matches,public.astralis_orders,public.astralis_reports from public,anon,authenticated;
grant select on public.astralis_profiles,public.astralis_matches,public.astralis_reports to authenticated;
grant select(id,user_id,match_id,product,amount_cents,currency,status,created_at) on public.astralis_orders to authenticated;
create policy profile_owner_read on public.astralis_profiles for select to authenticated using ((select auth.uid())=user_id);
create policy match_owner_read on public.astralis_matches for select to authenticated using ((select auth.uid())=user_id);
create policy order_owner_read on public.astralis_orders for select to authenticated using ((select auth.uid())=user_id);
create policy paid_report_owner_read on public.astralis_reports for select to authenticated using ((select auth.uid())=user_id and exists(select 1 from public.astralis_orders o where o.id=order_id and o.user_id=astralis_reports.user_id and o.status='paid'));
-- No client writes. Trusted server must authenticate, recompute results,
-- verify payment webhooks, and enforce idempotency before creating records.
-- No raw birth dates, names, locations, or birth times persisted.
-- Account deletion/financial retention procedure is required before launch.
commit;
