-- Remembers which application step the retiree was on, so a draft resumes there.
alter table retiree_profiles
  add column if not exists application_step int not null default 1
  check (application_step between 1 and 5);
