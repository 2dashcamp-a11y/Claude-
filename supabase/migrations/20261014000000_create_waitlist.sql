-- Dash of Digital — early-access waitlist
--
-- Run this once in the Supabase SQL editor (or with `supabase db push`).
-- It is safe to re-run: every statement is idempotent.
--
-- Security model
--   * Row Level Security is ON and there are NO policies, so the public
--     `anon` and `authenticated` roles can neither read nor write the table.
--   * The website writes through `submit_waitlist_entry()`, which only the
--     `service_role` may execute. The service-role key lives server-side only.
--   * Founders view and export entries from the Supabase dashboard.

create extension if not exists pgcrypto;

create table if not exists public.waitlist_entries (
  id                       uuid primary key default gen_random_uuid(),
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),

  -- Contact
  full_name                text not null check (char_length(btrim(full_name)) between 1 and 120),
  email                    text not null check (char_length(email) between 3 and 254),
  -- Lower-cased, trimmed email; the uniqueness key for duplicate handling.
  email_normalized         text generated always as (lower(btrim(email))) stored,
  company_name             text not null check (char_length(btrim(company_name)) between 1 and 160),
  website_url              text check (website_url is null or char_length(website_url) <= 300),

  -- Qualification
  service_interest         text not null check (service_interest in (
                             'digital_infrastructure_audit',
                             'technical_infrastructure_management',
                             'digital_experience_modernization',
                             'brand_creative_direction',
                             'not_sure'
                           )),
  business_stage           text check (business_stage is null or business_stage in (
                             'pre_launch', 'early', 'established', 'scaling'
                           )),
  biggest_challenge        text check (biggest_challenge is null or char_length(biggest_challenge) <= 2000),
  budget_range             text check (budget_range is null or budget_range in (
                             'under_2500', '2500_4999', '5000_9999', '10000_plus', 'not_sure'
                           )),
  timeline                 text check (timeline is null or timeline in (
                             'immediately', 'within_30_days', '1_3_months', 'exploring'
                           )),

  -- Consent
  privacy_acknowledged_at  timestamptz not null,
  privacy_policy_version   text not null,
  marketing_consent        boolean not null default false,
  marketing_consent_at     timestamptz,

  -- Pipeline (edited by the founder in the Supabase dashboard)
  status                   text not null default 'new' check (status in (
                             'new', 'qualified', 'contacted', 'discovery',
                             'proposal', 'client', 'not_a_fit'
                           )),
  internal_notes           text,

  -- Operations
  source                   text not null default 'landing_page',
  submission_count         integer not null default 1,
  last_submitted_at        timestamptz not null default now(),
  founder_notified_at      timestamptz,
  confirmation_sent_at     timestamptz,
  email_delivery_error     text,

  -- Reserved for a future DASH HQ / CRM sync. Nothing writes these yet.
  external_crm_id          text,
  synced_at                timestamptz
);

create unique index if not exists waitlist_entries_email_normalized_key
  on public.waitlist_entries (email_normalized);
create index if not exists waitlist_entries_created_at_idx
  on public.waitlist_entries (created_at desc);
create index if not exists waitlist_entries_status_idx
  on public.waitlist_entries (status);
create index if not exists waitlist_entries_service_interest_idx
  on public.waitlist_entries (service_interest);

-- Keep updated_at current on every change (including dashboard edits).
create or replace function public.waitlist_entries_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists waitlist_entries_touch_updated_at on public.waitlist_entries;
create trigger waitlist_entries_touch_updated_at
  before update on public.waitlist_entries
  for each row execute function public.waitlist_entries_touch_updated_at();

-- Lock the table down.
alter table public.waitlist_entries enable row level security;
revoke all on public.waitlist_entries from anon, authenticated;
grant all on public.waitlist_entries to service_role;

-- Insert a submission, or register a repeat submission for an existing email.
--
-- Duplicate behaviour (documented in README):
--   * The original entry is never overwritten. Anyone can type any email into
--     a public form, so a second submission must not be able to change
--     another person's details or consent.
--   * The repeat is counted (submission_count, last_submitted_at) so the
--     founder can see renewed interest.
--   * The caller learns whether the row is new, but the website returns the
--     same response either way, so visitors cannot discover who is listed.
create or replace function public.submit_waitlist_entry(entry jsonb)
returns table (entry_id uuid, is_new boolean)
language plpgsql
set search_path = ''
as $$
begin
  return query
  insert into public.waitlist_entries as w (
    full_name, email, company_name, website_url, service_interest,
    business_stage, biggest_challenge, budget_range, timeline,
    privacy_acknowledged_at, privacy_policy_version,
    marketing_consent, marketing_consent_at, source
  )
  values (
    entry->>'full_name',
    entry->>'email',
    entry->>'company_name',
    nullif(entry->>'website_url', ''),
    entry->>'service_interest',
    nullif(entry->>'business_stage', ''),
    nullif(entry->>'biggest_challenge', ''),
    nullif(entry->>'budget_range', ''),
    nullif(entry->>'timeline', ''),
    now(),
    entry->>'privacy_policy_version',
    coalesce((entry->>'marketing_consent')::boolean, false),
    case when coalesce((entry->>'marketing_consent')::boolean, false) then now() end,
    coalesce(nullif(entry->>'source', ''), 'landing_page')
  )
  on conflict (email_normalized) do update
    set submission_count  = w.submission_count + 1,
        last_submitted_at = now()
  returning w.id, (w.xmax = 0);
end;
$$;

-- Record what happened with the notification / confirmation emails.
create or replace function public.record_waitlist_email_delivery(
  p_entry_id uuid,
  p_founder_notified boolean,
  p_confirmation_sent boolean,
  p_error text
)
returns void
language plpgsql
set search_path = ''
as $$
begin
  update public.waitlist_entries
     set founder_notified_at  = case when p_founder_notified  then now() else founder_notified_at end,
         confirmation_sent_at = case when p_confirmation_sent then now() else confirmation_sent_at end,
         email_delivery_error = p_error
   where id = p_entry_id;
end;
$$;

revoke all on function public.submit_waitlist_entry(jsonb) from public, anon, authenticated;
revoke all on function public.record_waitlist_email_delivery(uuid, boolean, boolean, text) from public, anon, authenticated;
grant execute on function public.submit_waitlist_entry(jsonb) to service_role;
grant execute on function public.record_waitlist_email_delivery(uuid, boolean, boolean, text) to service_role;
