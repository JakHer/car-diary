alter table public.vehicles
add column distance_unit text not null default 'km';

alter table public.vehicles
add constraint vehicles_distance_unit_check
check (distance_unit in ('km', 'mi'));

create or replace function public.prevent_vehicle_distance_unit_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.distance_unit <> old.distance_unit then
    raise exception 'Vehicle distance unit cannot be changed after creation.'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger vehicles_prevent_distance_unit_change
before update of distance_unit on public.vehicles
for each row execute function public.prevent_vehicle_distance_unit_change();
