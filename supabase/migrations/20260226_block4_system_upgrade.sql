-- ═══════════════════════════════════════════════════════
-- 20260226_block4_system_upgrade.sql
-- ═══════════════════════════════════════════════════════


-- STEP 1: ALTER PROPERTIES
alter table properties add column if not exists amenities text[] default '{}';
alter table properties add column if not exists image_urls text[] default '{}';
alter table properties alter column amenities set default '{}';
alter table properties alter column image_urls set default '{}';
update properties set amenities = '{}' where amenities is null;
update properties set image_urls = '{}' where image_urls is null;
alter table properties add column if not exists lat double precision;
alter table properties add column if not exists lng double precision;
alter table properties add column if not exists rating_avg numeric default 0;
alter table properties add column if not exists rating_count integer default 0;
alter table properties add column if not exists is_verified boolean default false;


-- STEP 2: ENABLE RLS ON PROPERTIES
alter table properties enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'properties'
    and policyname = 'Public read properties'
  ) then
    execute 'create policy "Public read properties" on properties for select using (true)';
  end if;
end;
$$;


-- STEP 3: COLLEGES TABLE
create table if not exists colleges (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  city text not null,
  lat double precision not null,
  lng double precision not null,
  created_at timestamptz default now()
);

insert into colleges (name, city, lat, lng) values
  ('IIT Delhi',                      'Delhi',    28.5450, 77.1926),
  ('Delhi Technological University', 'Delhi',    28.7499, 77.1170),
  ('IIIT Delhi',                     'Delhi',    28.5449, 77.2727),
  ('NSUT',                           'Delhi',    28.6091, 77.0384),
  ('Jamia Millia Islamia',           'Delhi',    28.5622, 77.2800),
  ('University of Delhi',            'Delhi',    28.6889, 77.2099),
  ('Gargi College',                  'Delhi',    28.5568, 77.1987),
  ('Hansraj College',                'Delhi',    28.6836, 77.2066),
  ('Miranda House',                  'Delhi',    28.6871, 77.2088),
  ('Lady Shri Ram College',          'Delhi',    28.5637, 77.2128),
  ('St. Stephen''s College',         'Delhi',    28.6863, 77.2038),
  ('Ramjas College',                 'Delhi',    28.6819, 77.2092),
  ('SRCC',                           'Delhi',    28.6866, 77.2106),
  ('NIT Delhi',                      'Delhi',    28.7330, 77.1200),
  ('NIFT Delhi',                     'Delhi',    28.5505, 77.2226),
  ('IP University',                  'Delhi',    28.6700, 77.0500),
  ('Jamia Hamdard',                  'Delhi',    28.5412, 77.3024),
  ('AIIMS Delhi',                    'Delhi',    28.5672, 77.2100),
  ('Jesus and Mary College',         'Delhi',    28.5707, 77.2073),
  ('Amity University Noida',         'Noida',    28.5430, 77.3340),
  ('Shiv Nadar University',          'Noida',    28.5270, 77.5770),
  ('Bennett University',             'Noida',    28.4507, 77.5840),
  ('Galgotias University',           'Noida',    28.3820, 77.5024),
  ('BITS Pilani',                    'Pilani',   28.3624, 75.5870),
  ('Manipal University Jaipur',      'Jaipur',   26.8425, 75.5650)
on conflict (name) do nothing;


-- STEP 4: REVIEWS TABLE
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (property_id, user_id)
);


-- STEP 5: REVIEW IMAGES TABLE
create table if not exists review_images (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references reviews(id) on delete cascade,
  image_url text not null,
  created_at timestamptz default now()
);


-- STEP 6: PROFILE ENHANCEMENT
alter table profiles add column if not exists avatar_url text;


-- STEP 7: INDEXES
create index if not exists idx_properties_rating_avg on properties(rating_avg);
create index if not exists idx_properties_is_verified on properties(is_verified);
create index if not exists idx_properties_lat_lng on properties(lat, lng);
create index if not exists idx_reviews_property on reviews(property_id);
create index if not exists idx_reviews_user on reviews(user_id);
create index if not exists idx_review_images_review on review_images(review_id);
create index if not exists idx_colleges_name on colleges(name);
create index if not exists idx_colleges_city on colleges(city);


-- STEP 8: RLS — COLLEGES
alter table colleges enable row level security;

create policy "colleges_select_public"
  on colleges for select using (true);


-- STEP 9: RLS — REVIEWS
alter table reviews enable row level security;

create policy "reviews_select_public"
  on reviews for select using (true);

create policy "reviews_insert_authenticated"
  on reviews for insert
  with check (
    auth.uid() = user_id
    and not exists (
      select 1 from properties
      where properties.id = property_id
      and properties.owner_id = auth.uid()
    )
  );

create policy "reviews_update_own"
  on reviews for update
  using (auth.uid() = user_id);

create policy "reviews_delete_own"
  on reviews for delete
  using (auth.uid() = user_id);


-- STEP 10: RLS — REVIEW IMAGES
alter table review_images enable row level security;

create policy "review_images_select_public"
  on review_images for select using (true);

create policy "review_images_manage_own"
  on review_images for all using (
    exists (
      select 1 from reviews
      where reviews.id = review_images.review_id
      and reviews.user_id = auth.uid()
    )
  );


-- STEP 11: PROPERTIES UPDATE POLICY
drop policy if exists "Owner can update own property" on properties;

create policy "properties_update_own_non_rating"
  on properties for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);


-- STEP 12: RATING AGGREGATION TRIGGER
create or replace function recalculate_property_rating()
returns trigger as $$
declare
  target_id uuid;
begin
  target_id := coalesce(NEW.property_id, OLD.property_id);

  perform set_config('app.rating_update', 'true', true);

  update properties set
    rating_avg = coalesce((
      select avg(rating)::numeric
      from reviews where property_id = target_id
    ), 0),
    rating_count = (
      select count(*)::integer
      from reviews where property_id = target_id
    )
  where id = target_id;

  perform set_config('app.rating_update', '', true);

  return coalesce(NEW, OLD);
end;
$$ language plpgsql security definer;

drop trigger if exists trg_review_rating_recalc on reviews;

create trigger trg_review_rating_recalc
  after insert or update or delete on reviews
  for each row execute function recalculate_property_rating();


-- STEP 13: RATING PROTECTION TRIGGER
create or replace function prevent_manual_rating_update()
returns trigger as $$
begin
  if current_setting('app.rating_update', true) is distinct from 'true' then
    if NEW.rating_avg is distinct from OLD.rating_avg
       or NEW.rating_count is distinct from OLD.rating_count
       or NEW.is_verified is distinct from OLD.is_verified then
      raise exception 'Direct modification of rating or verification fields not allowed';
    end if;
  end if;
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists trg_prevent_rating_manual_update on properties;

create trigger trg_prevent_rating_manual_update
  before update on properties
  for each row
  execute function prevent_manual_rating_update();


-- STEP 14: HAVERSINE RPC
create or replace function search_properties_near_college(
  p_college_lat double precision default null,
  p_college_lng double precision default null,
  p_search_query text default null,
  p_sort_by text default 'created_at_desc',
  p_min_rating integer default null,
  p_min_price integer default null,
  p_max_price integer default null,
  p_max_distance double precision default null,
  p_verified_only boolean default false,
  p_page_size integer default 12,
  p_page_offset integer default 0
)
returns table (
  id uuid,
  owner_id uuid,
  title text,
  description text,
  city text,
  area text,
  address text,
  price_per_month integer,
  thumbnail_url text,
  amenities text[],
  image_urls text[],
  rating_avg numeric,
  rating_count integer,
  is_verified boolean,
  lat double precision,
  lng double precision,
  distance_km double precision,
  total_count bigint
)
language plpgsql stable as $$
begin
  if p_page_size > 50 then
    p_page_size := 50;
  end if;
  if p_page_size < 1 then
    p_page_size := 12;
  end if;
  if p_page_offset < 0 then
    p_page_offset := 0;
  end if;

  return query
  with computed as (
    select
      p.*,
      case
        when p.lat is not null
          and p.lng is not null
          and p_college_lat is not null
          and p_college_lng is not null
        then
          6371.0 * acos(
            least(1.0, greatest(-1.0,
              cos(radians(p_college_lat))
              * cos(radians(p.lat))
              * cos(radians(p.lng) - radians(p_college_lng))
              + sin(radians(p_college_lat))
              * sin(radians(p.lat))
            ))
          )
        else null
      end as calc_distance,
      count(*) over() as cnt
    from properties p
    where
      (p_search_query is null or p_search_query = '' or
        p.title ilike '%' || p_search_query || '%' or
        p.address ilike '%' || p_search_query || '%' or
        p.city ilike '%' || p_search_query || '%' or
        p.area ilike '%' || p_search_query || '%')
      and (p_min_rating is null or p.rating_avg >= p_min_rating)
      and (p_min_price is null or p.price_per_month >= p_min_price)
      and (p_max_price is null or p.price_per_month <= p_max_price)
      and (p_verified_only = false or p.is_verified = true)
  )
  select
    c.id, c.owner_id, c.title, c.description, c.city, c.area,
    c.address, c.price_per_month, c.thumbnail_url,
    c.amenities, c.image_urls,
    c.rating_avg, c.rating_count, c.is_verified,
    c.lat, c.lng,
    c.calc_distance as distance_km,
    c.cnt as total_count
  from computed c
  where (p_max_distance is null or c.calc_distance is null
         or c.calc_distance <= p_max_distance)
  order by
    case when p_sort_by = 'distance_asc'  then c.calc_distance end asc nulls last,
    case when p_sort_by = 'distance_desc' then c.calc_distance end desc nulls last,
    case when p_sort_by = 'price_asc'     then c.price_per_month end asc,
    case when p_sort_by = 'price_desc'    then c.price_per_month end desc,
    case when p_sort_by = 'rating_asc'    then c.rating_avg end asc nulls last,
    case when p_sort_by = 'rating_desc'   then c.rating_avg end desc nulls last,
    c.created_at desc
  limit p_page_size
  offset p_page_offset;
end;
$$;


-- STEP 15: STORAGE BUCKETS
-- review-images: path = {auth.uid()}/{review_id}/image.ext
insert into storage.buckets (id, name, public)
  values ('review-images', 'review-images', true)
  on conflict (id) do nothing;

create policy "review_images_bucket_select"
  on storage.objects for select
  using (bucket_id = 'review-images');
create policy "review_images_bucket_insert"
  on storage.objects for insert
  with check (bucket_id = 'review-images'
    and auth.uid()::text = (storage.foldername(name))[1]);
create policy "review_images_bucket_delete"
  on storage.objects for delete
  using (bucket_id = 'review-images'
    and auth.uid()::text = (storage.foldername(name))[1]);

-- avatars: path = {auth.uid()}/avatar.ext
insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
  on conflict (id) do nothing;

create policy "avatars_bucket_select"
  on storage.objects for select
  using (bucket_id = 'avatars');
create policy "avatars_bucket_insert"
  on storage.objects for insert
  with check (bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]);
create policy "avatars_bucket_update"
  on storage.objects for update
  using (bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]);
