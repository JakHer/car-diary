update public.odometer_readings as reading
set
  source_id = vehicle.id,
  recorded_at = current_date,
  mileage = vehicle.current_mileage
from public.vehicles as vehicle
where reading.source_type = 'snapshot'
  and reading.vehicle_id = vehicle.id;

create or replace function public.record_current_vehicle_odometer()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if pg_trigger_depth() > 1 then
    insert into public.odometer_readings (
      vehicle_id,
      recorded_at,
      mileage,
      source_type,
      source_id
    )
    values (
      new.id,
      current_date,
      new.current_mileage,
      'snapshot',
      new.id
    )
    on conflict (source_type, source_id) where source_id is not null
    do update set
      recorded_at = excluded.recorded_at,
      mileage = excluded.mileage;

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
