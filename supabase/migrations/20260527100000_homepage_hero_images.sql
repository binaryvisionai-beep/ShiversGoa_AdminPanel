-- Hero image library: multiple URLs stored; hero_image remains the live/selected URL.
alter table public.homepage_content
  add column if not exists hero_images jsonb not null default '[]'::jsonb;

-- Backfill library from existing single hero image where library is empty.
update public.homepage_content
set hero_images = jsonb_build_array(hero_image)
where hero_image is not null
  and hero_image <> ''
  and (hero_images = '[]'::jsonb or hero_images is null);
