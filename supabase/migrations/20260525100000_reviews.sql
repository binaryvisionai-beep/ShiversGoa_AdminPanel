-- Google review summary settings + website guest reviews

create table if not exists public.google_review_settings (
  id uuid primary key default '00000000-0000-0000-0000-000000000001'::uuid,
  section_heading text not null default 'What Our Guests Say',
  average_rating numeric(2, 1) not null default 4.7 check (average_rating >= 0 and average_rating <= 5),
  review_count_label text not null default 'Based on 1000+ reviews',
  google_profile_url text,
  updated_at timestamptz not null default now()
);

create table if not exists public.website_reviews (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists website_reviews_status_idx on public.website_reviews (status);
create index if not exists website_reviews_created_at_idx on public.website_reviews (created_at desc);

create or replace function public.set_website_reviews_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists website_reviews_updated_at on public.website_reviews;

create trigger website_reviews_updated_at
  before update on public.website_reviews
  for each row
  execute function public.set_website_reviews_updated_at();

create or replace function public.set_google_review_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists google_review_settings_updated_at on public.google_review_settings;

create trigger google_review_settings_updated_at
  before update on public.google_review_settings
  for each row
  execute function public.set_google_review_settings_updated_at();

insert into public.google_review_settings (id)
values ('00000000-0000-0000-0000-000000000001'::uuid)
on conflict (id) do nothing;

alter table public.google_review_settings enable row level security;
alter table public.website_reviews enable row level security;

-- google_review_settings policies
drop policy if exists "google_settings_public_select" on public.google_review_settings;
drop policy if exists "google_settings_admin_select" on public.google_review_settings;
drop policy if exists "google_settings_admin_insert" on public.google_review_settings;
drop policy if exists "google_settings_admin_update" on public.google_review_settings;

create policy "google_settings_public_select"
  on public.google_review_settings for select
  using (true);

create policy "google_settings_admin_select"
  on public.google_review_settings for select
  using (public.is_admin());

create policy "google_settings_admin_insert"
  on public.google_review_settings for insert
  with check (public.is_admin());

create policy "google_settings_admin_update"
  on public.google_review_settings for update
  using (public.is_admin());

-- website_reviews policies
drop policy if exists "website_reviews_public_select_approved" on public.website_reviews;
drop policy if exists "website_reviews_public_insert_pending" on public.website_reviews;
drop policy if exists "website_reviews_admin_select" on public.website_reviews;
drop policy if exists "website_reviews_admin_insert" on public.website_reviews;
drop policy if exists "website_reviews_admin_update" on public.website_reviews;
drop policy if exists "website_reviews_admin_delete" on public.website_reviews;

create policy "website_reviews_public_select_approved"
  on public.website_reviews for select
  using (status = 'approved');

create policy "website_reviews_public_insert_pending"
  on public.website_reviews for insert
  with check (status = 'pending');

create policy "website_reviews_admin_select"
  on public.website_reviews for select
  using (public.is_admin());

create policy "website_reviews_admin_insert"
  on public.website_reviews for insert
  with check (public.is_admin());

create policy "website_reviews_admin_update"
  on public.website_reviews for update
  using (public.is_admin());

create policy "website_reviews_admin_delete"
  on public.website_reviews for delete
  using (public.is_admin());
