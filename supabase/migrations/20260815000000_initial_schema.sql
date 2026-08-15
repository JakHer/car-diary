create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  make text not null check (char_length(make) between 1 and 80),
  model text not null check (char_length(model) between 1 and 80),
  year integer not null check (year between 1886 and 2100),
  registration_number text not null default '',
  vin text not null default '' check (vin = '' or char_length(vin) = 17),
  starting_mileage bigint not null check (starting_mileage >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.service_records (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  category text not null check (
    category in ('Maintenance', 'Repair', 'Inspection', 'Tires', 'Other')
  ),
  service_date date not null,
  mileage bigint not null check (mileage >= 0),
  workshop text not null default '',
  cost_in_cents bigint not null check (cost_in_cents >= 0),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index vehicles_user_id_idx on public.vehicles (user_id);
create index service_records_vehicle_id_idx
  on public.service_records (vehicle_id);
create index service_records_vehicle_date_idx
  on public.service_records (vehicle_id, service_date desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger vehicles_set_updated_at
before update on public.vehicles
for each row execute function public.set_updated_at();

create trigger service_records_set_updated_at
before update on public.service_records
for each row execute function public.set_updated_at();

alter table public.vehicles enable row level security;
alter table public.service_records enable row level security;

revoke all on table public.vehicles from anon;
revoke all on table public.service_records from anon;
grant select, insert, update, delete on table public.vehicles to authenticated;
grant select, insert, update, delete on table public.service_records to authenticated;

create policy "Users can read their vehicles"
on public.vehicles
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their vehicles"
on public.vehicles
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their vehicles"
on public.vehicles
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their vehicles"
on public.vehicles
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can read service records for their vehicles"
on public.service_records
for select
to authenticated
using (
  exists (
    select 1
    from public.vehicles
    where vehicles.id = service_records.vehicle_id
      and vehicles.user_id = (select auth.uid())
  )
);

create policy "Users can create service records for their vehicles"
on public.service_records
for insert
to authenticated
with check (
  exists (
    select 1
    from public.vehicles
    where vehicles.id = service_records.vehicle_id
      and vehicles.user_id = (select auth.uid())
  )
);

create policy "Users can update service records for their vehicles"
on public.service_records
for update
to authenticated
using (
  exists (
    select 1
    from public.vehicles
    where vehicles.id = service_records.vehicle_id
      and vehicles.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.vehicles
    where vehicles.id = service_records.vehicle_id
      and vehicles.user_id = (select auth.uid())
  )
);

create policy "Users can delete service records for their vehicles"
on public.service_records
for delete
to authenticated
using (
  exists (
    select 1
    from public.vehicles
    where vehicles.id = service_records.vehicle_id
      and vehicles.user_id = (select auth.uid())
  )
);
