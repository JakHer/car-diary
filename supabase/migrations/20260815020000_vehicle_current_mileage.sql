alter table public.vehicles
add column current_mileage bigint;

update public.vehicles as vehicle
set current_mileage = greatest(
  vehicle.starting_mileage,
  coalesce(
    (
      select max(record.mileage)
      from public.service_records as record
      where record.vehicle_id = vehicle.id
    ),
    vehicle.starting_mileage
  )
);

alter table public.vehicles
alter column current_mileage set not null;

alter table public.vehicles
add constraint vehicles_current_mileage_check
check (current_mileage >= starting_mileage);

create or replace function public.prevent_vehicle_mileage_decrease()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.current_mileage < old.current_mileage then
    raise exception 'Current mileage cannot be lower than the previous mileage.'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger vehicles_prevent_mileage_decrease
before update of current_mileage on public.vehicles
for each row execute function public.prevent_vehicle_mileage_decrease();

create or replace function public.sync_vehicle_current_mileage()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  update public.vehicles
  set current_mileage = greatest(current_mileage, new.mileage)
  where id = new.vehicle_id;

  return new;
end;
$$;

create trigger service_records_sync_vehicle_mileage
after insert or update of mileage, vehicle_id on public.service_records
for each row execute function public.sync_vehicle_current_mileage();
