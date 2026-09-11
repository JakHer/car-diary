alter table public.vehicles
  add column insurer_name text not null default '',
  add column policy_number text not null default '',
  add column assistance_phone text not null default '';

alter table public.vehicles
  add constraint vehicles_insurer_name_length
    check (char_length(insurer_name) <= 120),
  add constraint vehicles_policy_number_length
    check (char_length(policy_number) <= 80),
  add constraint vehicles_assistance_phone_length
    check (char_length(assistance_phone) <= 32);
