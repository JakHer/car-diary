create or replace function public.refresh_vehicle_odometer_snapshot(
  target_vehicle_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.odometer_readings
  where vehicle_id = target_vehicle_id
    and source_type = 'snapshot';

  insert into public.odometer_readings (
    vehicle_id,
    recorded_at,
    mileage,
    source_type,
    source_id
  )
  select
    vehicle.id,
    current_date,
    vehicle.current_mileage,
    'snapshot',
    vehicle.id
  from public.vehicles as vehicle
  where vehicle.id = target_vehicle_id
    and not exists (
      select 1
      from public.odometer_readings as reading
      where reading.vehicle_id = vehicle.id
        and reading.source_type <> 'snapshot'
        and reading.mileage = vehicle.current_mileage
    );
end;
$$;

revoke execute on function public.refresh_vehicle_odometer_snapshot(uuid)
from public;

create or replace function public.record_current_vehicle_odometer()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if pg_trigger_depth() > 1 then
    perform public.refresh_vehicle_odometer_snapshot(new.id);
    return new;
  end if;

  insert into public.odometer_readings (
    vehicle_id,
    recorded_at,
    mileage,
    source_type
  )
  values (new.id, current_date, new.current_mileage, 'manual');

  perform public.refresh_vehicle_odometer_snapshot(new.id);
  return new;
end;
$$;

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

    perform public.refresh_vehicle_odometer_snapshot(old.vehicle_id);
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

  if tg_op = 'UPDATE' and old.vehicle_id <> new.vehicle_id then
    perform public.refresh_vehicle_odometer_snapshot(old.vehicle_id);
  end if;
  perform public.refresh_vehicle_odometer_snapshot(new.vehicle_id);

  return new;
end;
$$;

do $$
declare
  vehicle_id uuid;
begin
  for vehicle_id in select id from public.vehicles loop
    perform public.refresh_vehicle_odometer_snapshot(vehicle_id);
  end loop;
end;
$$;
