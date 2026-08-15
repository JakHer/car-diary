create table public.maintenance_reminders (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  due_date date,
  due_mileage bigint check (due_mileage >= 0),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint maintenance_reminders_due_target_check
    check (due_date is not null or due_mileage is not null)
);

create index maintenance_reminders_vehicle_id_idx
  on public.maintenance_reminders (vehicle_id);
create index maintenance_reminders_vehicle_status_idx
  on public.maintenance_reminders (vehicle_id, completed_at, due_date);

create trigger maintenance_reminders_set_updated_at
before update on public.maintenance_reminders
for each row execute function public.set_updated_at();

alter table public.maintenance_reminders enable row level security;

revoke all on table public.maintenance_reminders from anon;
grant select, insert, update, delete
  on table public.maintenance_reminders to authenticated;

create policy "Users can read reminders for their vehicles"
on public.maintenance_reminders
for select
to authenticated
using (
  exists (
    select 1
    from public.vehicles
    where vehicles.id = maintenance_reminders.vehicle_id
      and vehicles.user_id = (select auth.uid())
  )
);

create policy "Users can create reminders for their vehicles"
on public.maintenance_reminders
for insert
to authenticated
with check (
  exists (
    select 1
    from public.vehicles
    where vehicles.id = maintenance_reminders.vehicle_id
      and vehicles.user_id = (select auth.uid())
  )
);

create policy "Users can update reminders for their vehicles"
on public.maintenance_reminders
for update
to authenticated
using (
  exists (
    select 1
    from public.vehicles
    where vehicles.id = maintenance_reminders.vehicle_id
      and vehicles.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.vehicles
    where vehicles.id = maintenance_reminders.vehicle_id
      and vehicles.user_id = (select auth.uid())
  )
);

create policy "Users can delete reminders for their vehicles"
on public.maintenance_reminders
for delete
to authenticated
using (
  exists (
    select 1
    from public.vehicles
    where vehicles.id = maintenance_reminders.vehicle_id
      and vehicles.user_id = (select auth.uid())
  )
);
