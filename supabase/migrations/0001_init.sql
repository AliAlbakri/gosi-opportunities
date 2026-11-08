-- GOSI Opportunities demo: initial schema
-- Run in Supabase SQL editor (or `supabase db push`).
-- All app access goes through Next.js server code using the SERVICE ROLE key.
-- RLS is enabled on every table with NO policies, so the anon key can read nothing.
-- Live updates reach the browser through Supabase Realtime *Broadcast* (sent from the server), not table subscriptions.

create extension if not exists btree_gist;
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type pension_system  as enum ('public', 'private', 'combined');
create type persona_kind    as enum ('gosi_user', 'operator', 'tech');
create type profile_state   as enum ('draft', 'pending_review', 'not_approved', 'active', 'paused');
create type rst_status      as enum ('draft', 'pending', 'approved', 'not_approved');   -- retiree service type
create type pricing_mode    as enum ('free', 'paid');
create type booking_status  as enum ('pending_payment', 'confirmed', 'cancelled', 'completed',
                                     'no_show_seeker', 'no_show_retiree', 'expired');
create type cancel_party    as enum ('seeker', 'retiree', 'gosi', 'system');
create type payment_status  as enum ('held', 'released', 'paid_out', 'refunded', 'failed');
create type payment_method  as enum ('mada', 'apple_pay', 'card');
create type report_kind     as enum ('complaint', 'dispute');
create type report_status   as enum ('open', 'refunded', 'rejected', 'closed');
create type review_status   as enum ('pending', 'approved', 'rejected');
create type doc_kind        as enum ('certificate', 'cv');
create type wave_status     as enum ('draft', 'sent');

-- ---------------------------------------------------------------------------
-- Settings (singleton) + demo clock
-- ---------------------------------------------------------------------------
create table app_settings (
  id                         int primary key default 1 check (id = 1),
  demo_clock_offset_seconds  bigint  not null default 0,      -- app time = real time + offset
  paid_enabled               boolean not null default false,  -- Tech config: paid sessions switch
  price_floor                numeric(10,2) not null default 50,
  price_ceiling              numeric(10,2) not null default 500,
  last_settlement_period     text,                             -- 'YYYY-MM' of last monthly payout run
  updated_at                 timestamptz not null default now()
);
insert into app_settings (id) values (1);

-- Single source of "now" for ALL business rules. Never use now() directly in rule logic.
create or replace function app_now() returns timestamptz
language sql stable as $$
  select now() + make_interval(secs => demo_clock_offset_seconds) from app_settings where id = 1
$$;

-- ---------------------------------------------------------------------------
-- Mock GOSI records (read-only source data, like the real GOSI systems)
-- ---------------------------------------------------------------------------
create table gosi_people (
  id               uuid primary key default gen_random_uuid(),
  national_id      text unique not null,          -- 10 digits, 1xxxxxxxxx citizens / 2xxxxxxxxx residents
  full_name        text not null,
  first_name       text not null,
  birth_date       date not null,
  mobile           text,
  region           text,
  is_retiree       boolean not null default false,
  pension_system   pension_system,                 -- null if not a retiree
  retirement_date  date,
  pension_monthly  numeric(10,2),
  pension_bank     text,                           -- account GOSI pays the pension to (payout destination)
  pension_iban_masked text,                        -- e.g. SA** **** **** **** **** 4821
  created_at       timestamptz not null default now()
);

create table gosi_employment (
  id          uuid primary key default gen_random_uuid(),
  person_id   uuid not null references gosi_people(id) on delete cascade,
  employer    text not null,
  sector      text not null,                       -- e.g. Education, Finance, Construction, Government
  start_date  date not null,
  end_date    date
);
create index on gosi_employment(person_id);

-- ---------------------------------------------------------------------------
-- Demo personas (who you can "log in" as via mock Nafath / ops picker)
-- ---------------------------------------------------------------------------
create table personas (
  id          text primary key,                    -- slug used in URLs, e.g. 'ret-fahad', 'seek-sara', 'op-noura'
  kind        persona_kind not null,
  person_id   uuid references gosi_people(id),     -- set for gosi_user personas
  display_name text not null,
  blurb       text,                                -- one line shown on the demo home / Nafath picker
  sort        int not null default 0
);

-- ---------------------------------------------------------------------------
-- Taxonomy
-- ---------------------------------------------------------------------------
create table categories (
  id               text primary key,               -- 'education', 'accounting'
  name             text not null,
  name_ar          text not null,
  blurb            text not null,
  suggested_price  numeric(10,2) not null default 150,   -- Tech config
  sort             int not null default 0
);

create table service_types (
  id           text primary key,
  category_id  text not null references categories(id),
  name         text not null,
  name_ar      text not null,
  sort         int not null default 0
);

-- ---------------------------------------------------------------------------
-- Invitations
-- ---------------------------------------------------------------------------
create table invitation_waves (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  filters     jsonb not null default '{}'::jsonb,  -- {pension_system:[], sectors:[], min_years:int, regions:[]}
  size_cap    int not null,
  status      wave_status not null default 'draft',
  created_by  text references personas(id),
  created_at  timestamptz not null default now(),
  sent_at     timestamptz
);

create table invitations (
  id          uuid primary key default gen_random_uuid(),
  person_id   uuid not null unique references gosi_people(id),
  wave_id     uuid references invitation_waves(id),   -- null = manual addition
  invited_by  text references personas(id),
  invited_at  timestamptz not null,
  opened_at   timestamptz                            -- first time the retiree opened the Opportunities entry
);

-- ---------------------------------------------------------------------------
-- Retiree application / profile
-- ---------------------------------------------------------------------------
create table retiree_profiles (
  person_id              uuid primary key references gosi_people(id),
  state                  profile_state not null default 'draft',
  -- Layer 1 display choices (GOSI-verified data the retiree chooses to show)
  show_employers         boolean not null default true,
  show_dates             boolean not null default true,
  show_sector            boolean not null default true,
  -- Layer 2 (self-declared, moderated)
  discipline_role        text,
  specializations        text,
  intro                  text,
  languages              text[] not null default '{}',
  -- lifecycle
  terms_accepted_at      timestamptz,
  submitted_at           timestamptz,
  first_approved_at      timestamptz,
  readiness_passed_at    timestamptz,
  onboarding_watched_at  timestamptz,
  accepting_bookings     boolean not null default true,   -- self-service pause (state stays 'active')
  paused_at              timestamptz,                     -- ops pause
  paused_reason          text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create table retiree_documents (
  id          uuid primary key default gen_random_uuid(),
  person_id   uuid not null references retiree_profiles(person_id) on delete cascade,
  kind        doc_kind not null,
  file_path   text not null,                       -- Supabase Storage path in bucket 'retiree-docs'
  file_name   text not null,
  uploaded_at timestamptz not null default now()
);

create table retiree_service_types (
  id               uuid primary key default gen_random_uuid(),
  person_id        uuid not null references retiree_profiles(person_id) on delete cascade,
  service_type_id  text not null references service_types(id),
  description      text not null default '',
  status           rst_status not null default 'draft',
  reason_code      text,                           -- see REASON_CODES in DEMO-SPEC
  reason_note      text,
  decided_by       text references personas(id),
  decided_at       timestamptz,
  pricing_mode     pricing_mode not null default 'free',
  price            numeric(10,2),                  -- required when pricing_mode = 'paid'
  created_at       timestamptz not null default now(),
  unique (person_id, service_type_id),
  check (pricing_mode = 'free' or price is not null)
);

-- Weekly recurring availability windows; slots are derived (1-hour, on the hour)
create table availability_windows (
  id          uuid primary key default gen_random_uuid(),
  person_id   uuid not null references retiree_profiles(person_id) on delete cascade,
  weekday     int not null check (weekday between 0 and 6),   -- 0 = Sunday (Saudi week starts Sunday)
  start_time  time not null,
  end_time    time not null,
  check (end_time > start_time)
);

-- ---------------------------------------------------------------------------
-- Bookings and sessions
-- ---------------------------------------------------------------------------
create table bookings (
  id                    uuid primary key default gen_random_uuid(),
  seeker_id             uuid not null references gosi_people(id),
  retiree_id            uuid not null references retiree_profiles(person_id),
  retiree_service_type_id uuid not null references retiree_service_types(id),
  starts_at             timestamptz not null,
  ends_at               timestamptz not null,
  status                booking_status not null,
  is_paid               boolean not null default false,
  price                 numeric(10,2),
  seeker_need           text not null,             -- "What do you need?" (required)
  seeker_goal           text not null,             -- "What do you want out of the session?" (required)
  terms_accepted_at     timestamptz not null,
  hold_expires_at       timestamptz,               -- pending_payment only: created + 10 min
  daily_room_name       text,
  cancelled_by          cancel_party,
  cancelled_at          timestamptz,
  late_cancel           boolean not null default false,   -- cancelled within 3h of start
  completed_at          timestamptz,                       -- both left after scheduled duration
  reminders_sent        text[] not null default '{}',      -- '24h', '1h'
  created_at            timestamptz not null default now(),
  check (seeker_id <> retiree_id),
  check (ends_at = starts_at + interval '1 hour')
);
-- No double booking for a retiree (holds count too)
alter table bookings add constraint no_double_booking
  exclude using gist (retiree_id with =, tstzrange(starts_at, ends_at) with &&)
  where (status in ('pending_payment', 'confirmed'));
create index on bookings(seeker_id);
create index on bookings(retiree_id, starts_at);

create table session_events (
  id          uuid primary key default gen_random_uuid(),
  booking_id  uuid not null references bookings(id) on delete cascade,
  person_id   uuid not null references gosi_people(id),
  event       text not null check (event in ('joined', 'left')),
  at          timestamptz not null                -- app_now() at the moment of the event
);
create index on session_events(booking_id);

create table feedback (
  booking_id    uuid primary key references bookings(id),
  rating        int not null check (rating between 1 and 5),
  helped        boolean,
  tags          text[] not null default '{}',
  review_text   text,
  review_status review_status,                     -- null if no written review
  created_at    timestamptz not null
);

-- Report a problem (complaint) or dispute (paid session, within 48h)
create table reports (
  id             uuid primary key default gen_random_uuid(),
  booking_id     uuid not null references bookings(id),
  reporter_id    uuid not null references gosi_people(id),
  kind           report_kind not null,
  reason         text not null,                   -- see DISPUTE_REASONS / COMPLAINT_REASONS
  description    text not null,
  status         report_status not null default 'open',
  upheld         boolean,                          -- dispute decided in seeker's favour
  due_by         timestamptz,                      -- disputes: created + 10 working days (Sun–Thu)
  decided_by     text references personas(id),
  decided_at     timestamptz,
  decision_note  text,
  created_at     timestamptz not null
);
create unique index one_dispute_per_booking on reports(booking_id) where kind = 'dispute';

-- ---------------------------------------------------------------------------
-- Money (mock PSP ledger)
-- ---------------------------------------------------------------------------
create table payouts (
  id            uuid primary key default gen_random_uuid(),
  retiree_id    uuid not null references retiree_profiles(person_id),
  period        text not null,                    -- 'YYYY-MM'
  amount        numeric(10,2) not null,
  bank          text,
  iban_masked   text,
  paid_at       timestamptz not null,
  unique (retiree_id, period)
);

create table payments (
  id              uuid primary key default gen_random_uuid(),
  booking_id      uuid not null unique references bookings(id),
  amount          numeric(10,2) not null,
  method          payment_method not null,
  psp_ref         text not null,                  -- fake PSP reference, e.g. 'PSP-OPP-8F3K2Q'
  merchant_id     text not null default 'GOSI-OPP-001',
  status          payment_status not null,
  held_at         timestamptz,
  release_due_at  timestamptz,                    -- completed_at + 48h
  released_at     timestamptz,
  refunded_at     timestamptz,
  refund_reason   text,
  paid_out_at     timestamptz,
  payout_id       uuid references payouts(id),
  created_at      timestamptz not null
);

-- ---------------------------------------------------------------------------
-- Notifications, ops notes, audit
-- ---------------------------------------------------------------------------
create table notifications (
  id          uuid primary key default gen_random_uuid(),
  persona_id  text not null references personas(id),
  title       text not null,
  body        text not null,
  link        text,                                -- in-app route to open on tap
  created_at  timestamptz not null,                -- app time
  read_at     timestamptz
);
create index on notifications(persona_id, created_at desc);

create table ops_notes (
  id           uuid primary key default gen_random_uuid(),
  retiree_id   uuid not null references retiree_profiles(person_id),
  template_id  text not null,
  body         text not null,
  sent_by      text not null references personas(id),
  sent_at      timestamptz not null
);

create table audit_log (
  id          bigint generated always as identity primary key,
  actor       text not null,                       -- persona id or 'system'
  action      text not null,                       -- e.g. 'wave.sent', 'rst.approved', 'retiree.paused'
  entity      text not null,
  entity_id   text not null,
  details     jsonb not null default '{}'::jsonb,
  at          timestamptz not null
);

-- ---------------------------------------------------------------------------
-- RLS: on everywhere, no policies (server uses service role)
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Taxonomy seed (from PRD)
-- ---------------------------------------------------------------------------
insert into categories (id, name, name_ar, blurb, suggested_price, sort) values
 ('education',  'Education and Training', 'التعليم والتدريب',
  'Retired teachers deliver remote teaching through the GOSI app to users and residents who want to learn a specific language.', 120, 1),
 ('accounting', 'Accounting and Finance', 'المحاسبة والمالية',
  'Retired accountants share accounting guidance with users who need it. Sessions are guidance only, with no review, filing, or deliverable on the seeker''s behalf.', 180, 2);

insert into service_types (id, category_id, name, name_ar, sort) values
 ('edu-english',   'education',  'English language lessons and conversation practice', 'دروس اللغة الإنجليزية وممارسة المحادثة', 1),
 ('edu-arabic',    'education',  'Arabic language lessons for non-Arabic speakers',     'دروس اللغة العربية لغير الناطقين بها',    2),
 ('edu-other-lang','education',  'Other language lessons (e.g. French)',                'دروس لغات أخرى (مثل الفرنسية)',           3),
 ('edu-exam-prep', 'education',  'Language exam preparation',                           'الاستعداد لاختبارات اللغة',               4),
 ('acc-small-biz', 'accounting', 'Understanding small business accounts',               'فهم حسابات المنشآت الصغيرة',              1),
 ('acc-bookkeeping','accounting','Guidance on setting up bookkeeping',                  'إرشادات إعداد الحسابات ومسك الدفاتر',     2),
 ('acc-statements','accounting', 'Understanding financial statements',                  'فهم القوائم المالية وقراءتها',            3),
 ('acc-vat-zakat', 'accounting', 'Understanding VAT and Zakat obligations',             'فهم التزامات ضريبة القيمة المضافة والزكاة', 4);
