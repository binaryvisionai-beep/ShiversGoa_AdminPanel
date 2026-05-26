-- =============================================================================
-- RUN THIS IN SUPABASE: Dashboard → SQL Editor → New query → Paste → Run
-- Fixes: "Could not find the 'hero_images' column of 'homepage_content'"
-- After running, refresh Admin → Homepage CMS and upload/select hero images again.
-- =============================================================================

alter table public.homepage_content
  add column if not exists hero_images jsonb not null default '[]'::jsonb;

-- Backfill library from existing single hero image where library is empty.
update public.homepage_content
set hero_images = jsonb_build_array(hero_image)
where hero_image is not null
  and hero_image <> ''
  and (hero_images = '[]'::jsonb or hero_images is null);

-- Verify (optional): should show hero_images column with at least [] or [hero_url]
-- select id, hero_image, hero_images from public.homepage_content;
