create table public.odometer_readings (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  recorded_at date not null,
  mileage bigint not null check (mileage >= 0),
  source_type text not null check (
    source_type in ('vehicle', 'manual', 'service', 'fuel')
  ),
  source_id uuid,
  created_at timestamptz not null default now()
);

create index odometer_readings_vehicle_date_idx
  on public.odometer_readings (vehicle_id, recorded_at, mileage);

create unique index odometer_readings_source_idx
  on public.odometer_readings (source_type, source_id)
  where source_id is not null;

insert into public.odometer_readings (
  vehicle_id,
  recorded_at,
  mileage,
  source_type,
  source_id
)
select
  vehicle.id,
  vehicle.created_at::date,
  vehicle.starting_mileage,
  'vehicle',
  vehicle.id
from public.vehicles as vehicle;

insert into public.odometer_readings (
  vehicle_id,
  recorded_at,
  mileage,
  source_type,
  source_id
)
select
  record.vehicle_id,
  record.service_date,
  record.mileage,
  'service',
  record.id
from public.service_records as record;

insert into public.odometer_readings (
  vehicle_id,
  recorded_at,
  mileage,
  source_type,
  source_id
)
select
  entry.vehicle_id,
  entry.fueled_at,
  entry.mileage,
  'fuel',
  entry.id
from public.fuel_entries as entry;

insert into public.odometer_readings (
  vehicle_id,
  recorded_at,
  mileage,
  source_type
)
select
  vehicle.id,
  current_date,
  vehicle.current_mileage,
  'manual'
from public.vehicles as vehicle;

create or replace function public.record_initial_vehicle_odometer()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.odometer_readings (
    vehicle_id,
    recorded_at,
    mileage,
    source_type,
    source_id
  )
  values (
    new.id,
    new.created_at::date,
    new.starting_mileage,
    'vehicle',
    new.id
  );

  return new;
end;
$$;

create trigger vehicles_record_initial_odometer
after insert on public.vehicles
for each row execute function public.record_initial_vehicle_odometer();

create or replace function public.record_current_vehicle_odometer()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if pg_trigger_depth() > 1 then
    return new;
  end if;

  insert into public.odometer_readings (
    vehicle_id,
    recorded_at,
    mileage,
    source_type
  )
  values (new.id, current_date, new.current_mileage, 'manual');

  return new;
end;
$$;

create trigger vehicles_record_current_odometer
after update of current_mileage on public.vehicles
for each row
when (old.current_mileage is distinct from new.current_mileage)
execute function public.record_current_vehicle_odometer();

create or replace function public.sync_source_odometer_reading()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  reading_date date;
  reading_mileage bigint;
  reading_source_type text;
begin
  if tg_table_name = 'service_records' then
    reading_source_type := 'service';
  elsif tg_table_name = 'fuel_entries' then
    reading_source_type := 'fuel';
  else
    raise exception 'Unsupported odometer reading source: %', tg_table_name;
  end if;

  if tg_op = 'DELETE' then
    delete from public.odometer_readings
    where source_type = reading_source_type
      and source_id = old.id;

    return old;
  end if;

  if reading_source_type = 'service' then
    reading_date := new.service_date;
  else
    reading_date := new.fueled_at;
  end if;
  reading_mileage := new.mileage;

  insert into public.odometer_readings (
    vehicle_id,
    recorded_at,
    mileage,
    source_type,
    source_id
  )
  values (
    new.vehicle_id,
    reading_date,
    reading_mileage,
    reading_source_type,
    new.id
  )
  on conflict (source_type, source_id) where source_id is not null
  do update set
    vehicle_id = excluded.vehicle_id,
    recorded_at = excluded.recorded_at,
    mileage = excluded.mileage;

  return new;
end;
$$;

create trigger service_records_sync_odometer_reading
after insert or delete or update of mileage, service_date, vehicle_id
on public.service_records
for each row execute function public.sync_source_odometer_reading();

create trigger fuel_entries_sync_odometer_reading
after insert or delete or update of mileage, fueled_at, vehicle_id
on public.fuel_entries
for each row execute function public.sync_source_odometer_reading();

alter table public.odometer_readings enable row level security;

revoke all on table public.odometer_readings from anon;
revoke all on table public.odometer_readings from authenticated;
grant select on table public.odometer_readings to authenticated;

create policy "Users can read odometer readings for their vehicles"
on public.odometer_readings
for select
to authenticated
using (
  exists (
    select 1
    from public.vehicles
    where vehicles.id = odometer_readings.vehicle_id
      and vehicles.user_id = (select auth.uid())
  )
);
