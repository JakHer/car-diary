create table public.fuel_attachments (
  id uuid primary key default gen_random_uuid(),
  fuel_entry_id uuid not null
    references public.fuel_entries (id) on delete cascade,
  storage_path text not null unique,
  file_name text not null check (char_length(file_name) between 1 and 255),
  mime_type text not null check (
    mime_type in ('image/jpeg', 'image/png', 'image/webp', 'application/pdf')
  ),
  size_bytes bigint not null check (size_bytes between 1 and 10485760),
  created_at timestamptz not null default now()
);

create index fuel_attachments_entry_id_idx
  on public.fuel_attachments (fuel_entry_id);

alter table public.fuel_attachments enable row level security;

revoke all on table public.fuel_attachments from anon;
grant select, insert, delete on table public.fuel_attachments
  to authenticated;

create policy "Users can read attachments for their fuel entries"
on public.fuel_attachments
for select
to authenticated
using (
  exists (
    select 1
    from public.fuel_entries
    join public.vehicles
      on vehicles.id = fuel_entries.vehicle_id
    where fuel_entries.id = fuel_attachments.fuel_entry_id
      and vehicles.user_id = (select auth.uid())
  )
);

create policy "Users can create attachments for their fuel entries"
on public.fuel_attachments
for insert
to authenticated
with check (
  exists (
    select 1
    from public.fuel_entries
    join public.vehicles
      on vehicles.id = fuel_entries.vehicle_id
    where fuel_entries.id = fuel_attachments.fuel_entry_id
      and vehicles.user_id = (select auth.uid())
  )
);

create policy "Users can delete attachments for their fuel entries"
on public.fuel_attachments
for delete
to authenticated
using (
  exists (
    select 1
    from public.fuel_entries
    join public.vehicles
      on vehicles.id = fuel_entries.vehicle_id
    where fuel_entries.id = fuel_attachments.fuel_entry_id
      and vehicles.user_id = (select auth.uid())
  )
);
