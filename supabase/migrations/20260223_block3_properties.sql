-- 1. Create Tables

create table properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references hostel_owners(id) on delete cascade,
  title text not null,
  description text,
  city text not null,
  area text,
  college_nearby text,
  address text not null,
  price_per_month integer not null check (price_per_month > 0),
  thumbnail_url text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index idx_properties_owner on properties(owner_id);
create index idx_properties_city on properties(city);
create index idx_properties_price on properties(price_per_month);

create table amenities (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  category text not null
);

create table property_amenities (
  property_id uuid references properties(id) on delete cascade,
  amenity_id uuid references amenities(id) on delete cascade,
  is_highlighted boolean default false,
  primary key (property_id, amenity_id)
);

-- 2. Seed Initial Amenities
insert into amenities (name, category) values
  ('WiFi', 'Basic'),
  ('AC', 'Room'),
  ('Geyser', 'Room'),
  ('Laundry', 'Facilities'),
  ('Meals Included', 'Food'),
  ('CCTV', 'Safety'),
  ('Power Backup', 'Basic'),
  ('RO Water', 'Basic'),
  ('Gym', 'Facilities')
on conflict (name) do nothing;

-- 3. Enable RLS
alter table properties enable row level security;
alter table property_amenities enable row level security;

-- 4. Properties Policies
create policy "Owner can insert property"
on properties for insert
with check (auth.uid() = owner_id);

create policy "Owner can update own property"
on properties for update
using (auth.uid() = owner_id);

create policy "Owner can delete own property"
on properties for delete
using (auth.uid() = owner_id);

create policy "Public read properties"
on properties for select
using (true);

-- 5. Property Amenities Policies
create policy "Owner manage own property amenities"
on property_amenities for all
using (
  exists (
    select 1 from properties
    where properties.id = property_amenities.property_id
    and properties.owner_id = auth.uid()
  )
);

create policy "Public read property amenities"
on property_amenities for select
using (true);

-- 6. Storage Bucket setup (Note: Run via UI or SQL if superuser)
insert into storage.buckets (id, name, public) 
values ('property-images', 'property-images', true)
on conflict (id) do nothing;

create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'property-images' );

create policy "Owner Upload"
on storage.objects for insert
with check ( bucket_id = 'property-images' and auth.uid()::text = (storage.foldername(name))[1] );

create policy "Owner Update"
on storage.objects for update
using ( bucket_id = 'property-images' and auth.uid()::text = (storage.foldername(name))[1] );

create policy "Owner Delete"
on storage.objects for delete
using ( bucket_id = 'property-images' and auth.uid()::text = (storage.foldername(name))[1] );
