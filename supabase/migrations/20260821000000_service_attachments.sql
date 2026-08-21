create table public.service_attachments (
  id uuid primary key default gen_random_uuid(),
  service_record_id uuid not null
    references public.service_records (id) on delete cascade,
  storage_path text not null unique,
  file_name text not null check (char_length(file_name) between 1 and 255),
  mime_type text not null check (
    mime_type in ('image/jpeg', 'image/png', 'image/webp', 'application/pdf')
  ),
  size_bytes bigint not null check (size_bytes between 1 and 10485760),
  created_at timestamptz not null default now()
);

create index service_attachments_record_id_idx
  on public.service_attachments (service_record_id);

alter table public.service_attachments enable row level security;

revoke all on table public.service_attachments from anon;
grant select, insert, delete on table public.service_attachments
  to authenticated;

create policy "Users can read attachments for their service records"
on public.service_attachments
for select
to authenticated
using (
  exists (
    select 1
    from public.service_records
    join public.vehicles
      on vehicles.id = service_records.vehicle_id
    where service_records.id = service_attachments.service_record_id
      and vehicles.user_id = (select auth.uid())
  )
);

create policy "Users can create attachments for their service records"
on public.service_attachments
for insert
to authenticated
with check (
  exists (
    select 1
    from public.service_records
    join public.vehicles
      on vehicles.id = service_records.vehicle_id
    where service_records.id = service_attachments.service_record_id
      and vehicles.user_id = (select auth.uid())
  )
);

create policy "Users can delete attachments for their service records"
on public.service_attachments
for delete
to authenticated
using (
  exists (
    select 1
    from public.service_records
    join public.vehicles
      on vehicles.id = service_records.vehicle_id
    where service_records.id = service_attachments.service_record_id
      and vehicles.user_id = (select auth.uid())
  )
);

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'service-attachments',
  'service-attachments',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Users can upload their service attachments"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'service-attachments'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "Users can read their service attachments"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'service-attachments'
  and owner_id = (select auth.uid()::text)
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "Users can delete their service attachments"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'service-attachments'
  and owner_id = (select auth.uid()::text)
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);
