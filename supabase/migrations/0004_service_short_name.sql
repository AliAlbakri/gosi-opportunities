alter table service_types add column if not exists short_name text;
alter table service_types add column if not exists blurb text;

update service_types set short_name = 'English lessons', blurb = 'Lessons and conversation practice' where id = 'edu-english';
update service_types set short_name = 'Arabic for non-Arabic speakers', blurb = 'Learn Arabic from a retired teacher' where id = 'edu-arabic';
update service_types set short_name = 'Other languages', blurb = 'e.g. French' where id = 'edu-other-lang';
update service_types set short_name = 'Language exam prep', blurb = 'Get ready for a language test' where id = 'edu-exam-prep';
update service_types set short_name = 'Small business accounts', blurb = 'Make sense of your business numbers' where id = 'acc-small-biz';
update service_types set short_name = 'Bookkeeping setup', blurb = 'Set up simple, reliable records' where id = 'acc-bookkeeping';
update service_types set short_name = 'Financial statements', blurb = 'Read and understand your statements' where id = 'acc-statements';
update service_types set short_name = 'VAT and Zakat', blurb = 'Understand what you owe and when' where id = 'acc-vat-zakat';

update service_types set short_name = name where short_name is null;
update service_types set blurb = '' where blurb is null;

alter table service_types alter column short_name set not null;
alter table service_types alter column blurb set not null;

-- Bookings are on the hour in Asia/Riyadh. Skip a row when the snapped hour is already taken.
do $$
declare
  row record;
  snapped timestamptz;
begin
  for row in
    select id, retiree_id, status, starts_at
    from bookings
    where extract(minute from starts_at at time zone 'Asia/Riyadh') <> 0
       or extract(second from starts_at at time zone 'Asia/Riyadh') <> 0
  loop
    snapped := date_trunc('hour', row.starts_at at time zone 'Asia/Riyadh') at time zone 'Asia/Riyadh';
    if row.status in ('pending_payment', 'confirmed') and exists (
      select 1 from bookings other
      where other.id <> row.id
        and other.retiree_id = row.retiree_id
        and other.status in ('pending_payment', 'confirmed')
        and tstzrange(other.starts_at, other.ends_at) && tstzrange(snapped, snapped + interval '1 hour')
    ) then
      continue;
    end if;
    update bookings
      set starts_at = snapped,
          ends_at = snapped + interval '1 hour'
      where id = row.id;
  end loop;
end $$;
