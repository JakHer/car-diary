alter table public.odometer_readings
drop constraint odometer_readings_source_type_check;

alter table public.odometer_readings
add constraint odometer_readings_source_type_check check (
  source_type in ('vehicle', 'snapshot', 'manual', 'service', 'fuel')
);

with first_manual_batch as (
  select min(created_at) as created_at
  from public.odometer_readings
  where source_type = 'manual'
)
update public.odometer_readings as reading
set source_type = 'snapshot'
from first_manual_batch
where reading.source_type = 'manual'
  and reading.created_at = first_manual_batch.created_at;
