create table public.fuel_entries (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  fueled_at date not null,
  mileage bigint not null check (mileage >= 0),
  volume_milliliters integer not null check (volume_milliliters > 0),
  total_cost_in_cents bigint not null check (total_cost_in_cents > 0),
  station text not null default '' check (char_length(station) <= 160),
  full_tank boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index fuel_entries_vehicle_id_idx
  on public.fuel_entries (vehicle_id);
create index fuel_entries_vehicle_date_idx
  on public.fuel_entries (vehicle_id, fueled_at desc, mileage desc);

create trigger fuel_entries_set_updated_at
before update on public.fuel_entries
for each row execute function public.set_updated_at();

create trigger fuel_entries_sync_vehicle_mileage
after insert or update of mileage, vehicle_id on public.fuel_entries
for each row execute function public.sync_vehicle_current_mileage();

alter table public.fuel_entries enable row level security;

revoke all on table public.fuel_entries from anon;
grant select, insert, update, delete on table public.fuel_entries
  to authenticated;

create policy "Users can read fuel entries for their vehicles"
on public.fuel_entries
for select
to authenticated
using (
  exists (
    select 1
    from public.vehicles
    where vehicles.id = fuel_entries.vehicle_id
      and vehicles.user_id = (select auth.uid())
  )
);

create policy "Users can create fuel entries for their vehicles"
on public.fuel_entries
for insert
to authenticated
with check (
  exists (
    select 1
    from public.vehicles
    where vehicles.id = fuel_entries.vehicle_id
      and vehicles.user_id = (select auth.uid())
  )
);

create policy "Users can update fuel entries for their vehicles"
on public.fuel_entries
for update
to authenticated
using (
  exists (
    select 1
    from public.vehicles
    where vehicles.id = fuel_entries.vehicle_id
      and vehicles.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.vehicles
    where vehicles.id = fuel_entries.vehicle_id
      and vehicles.user_id = (select auth.uid())
  )
);

create policy "Users can delete fuel entries for their vehicles"
on public.fuel_entries
for delete
to authenticated
using (
  exists (
    select 1
    from public.vehicles
    where vehicles.id = fuel_entries.vehicle_id
      and vehicles.user_id = (select auth.uid())
  )
);
