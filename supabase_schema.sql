-- Enable Row Level Security (RLS) is done per table, but we'll do it after creating them.

-- 1. PROFILES
create table public.profiles (
  id uuid references auth.users not null primary key,
  display_name text,
  dog_name text,
  avatar_url text,
  location text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. WALKS
create table public.walks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  started_at timestamp with time zone,
  ended_at timestamp with time zone,
  distance_meters int,
  duration_seconds int,
  bones_earned int,
  path jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. BONE_WALLETS
create table public.bone_wallets (
  user_id uuid references public.profiles(id) not null primary key,
  balance int default 0
);

-- 4. BONE_TRANSACTIONS
create table public.bone_transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  amount int not null,
  type text not null, -- 'walk_earn', 'store_redeem', etc.
  meta jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. STORE_DEALS
create table public.store_deals (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  price_usd numeric,
  bones_cost int,
  description text,
  image_url text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. FEED_POSTS
create table public.feed_posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  text text,
  image_url text,
  type text, -- 'walk_summary', 'manual'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ENABLE RLS
alter table public.profiles enable row level security;
alter table public.walks enable row level security;
alter table public.bone_wallets enable row level security;
alter table public.bone_transactions enable row level security;
alter table public.store_deals enable row level security;
alter table public.feed_posts enable row level security;

-- POLICIES

-- Profiles: Users can see and edit their own profile.
-- (Note: For a social app, you usually want profiles to be publicly viewable, but following "user_id = auth.uid()" strictly for now as requested for "user-data tables")
-- Actually, for profiles, usually "id" is the user_id.
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Walks
create policy "Users can view own walks" on public.walks
  for select using (auth.uid() = user_id);

create policy "Users can insert own walks" on public.walks
  for insert with check (auth.uid() = user_id);

create policy "Users can update own walks" on public.walks
  for update using (auth.uid() = user_id);

-- Bone Wallets
create policy "Users can view own wallet" on public.bone_wallets
  for select using (auth.uid() = user_id);

-- (Wallets usually shouldn't be directly writable by client, but for prototype/simple RLS):
create policy "Users can update own wallet" on public.bone_wallets
  for update using (auth.uid() = user_id);

create policy "Users can insert own wallet" on public.bone_wallets
  for insert with check (auth.uid() = user_id);

-- Bone Transactions
create policy "Users can view own transactions" on public.bone_transactions
  for select using (auth.uid() = user_id);

create policy "Users can insert own transactions" on public.bone_transactions
  for insert with check (auth.uid() = user_id);

-- Feed Posts
-- (Again, strictly following "user_id = auth.uid()" means you only see your own posts)
create policy "Users can view own posts" on public.feed_posts
  for select using (auth.uid() = user_id);

create policy "Users can insert own posts" on public.feed_posts
  for insert with check (auth.uid() = user_id);

create policy "Users can update own posts" on public.feed_posts
  for update using (auth.uid() = user_id);

-- Store Deals
-- "allow public select"
create policy "Public can view store deals" on public.store_deals
  for select using (true);

-- "restrict writes to admin role later or just leave open for now" -> allowing authenticated users to write for now to keep it simple/prototypable
create policy "Authenticated users can manage store deals" on public.store_deals
  for all using (auth.role() = 'authenticated');

-- 7. PACKS
create table public.packs (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  city text,
  lat float8,
  lng float8,
  radius_meters int,
  member_count int default 0,
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. PACK_MEMBERS
create table public.pack_members (
  id uuid default gen_random_uuid() primary key,
  pack_id uuid references public.packs(id) not null,
  user_id uuid references public.profiles(id) not null,
  role text default 'member',
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(pack_id, user_id)
);

-- 9. PACK_QUESTIONS
create table public.pack_questions (
  id uuid default gen_random_uuid() primary key,
  pack_id uuid references public.packs(id) not null,
  user_id uuid references public.profiles(id) not null,
  title text not null,
  body text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. PACK_ANSWERS
create table public.pack_answers (
  id uuid default gen_random_uuid() primary key,
  question_id uuid references public.pack_questions(id) not null,
  user_id uuid references public.profiles(id) not null,
  body text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. PACK_WALKS
create table public.pack_walks (
  id uuid default gen_random_uuid() primary key,
  pack_id uuid references public.packs(id) not null,
  created_by uuid references public.profiles(id) not null,
  title text not null,
  description text,
  start_time timestamp with time zone not null,
  location_name text,
  lat float8,
  lng float8,
  status text default 'upcoming',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 12. PACK_WALK_RSVPS
create table public.pack_walk_rsvps (
  id uuid default gen_random_uuid() primary key,
  walk_id uuid references public.pack_walks(id) not null,
  user_id uuid references public.profiles(id) not null,
  status text default 'going',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(walk_id, user_id)
);

-- RLS FOR PACKS
alter table public.packs enable row level security;
alter table public.pack_members enable row level security;
alter table public.pack_questions enable row level security;
alter table public.pack_answers enable row level security;
alter table public.pack_walks enable row level security;
alter table public.pack_walk_rsvps enable row level security;

-- Packs Policies
create policy "Public can view packs" on public.packs
  for select using (true);

create policy "Authenticated users can create packs" on public.packs
  for insert with check (auth.role() = 'authenticated');

-- Pack Members Policies
create policy "Public can view pack members" on public.pack_members
  for select using (true);

create policy "Users can join packs" on public.pack_members
  for insert with check (auth.uid() = user_id);

create policy "Users can leave packs" on public.pack_members
  for delete using (auth.uid() = user_id);

-- Questions Policies
create policy "Public can view questions" on public.pack_questions
  for select using (true);

create policy "Members can insert questions" on public.pack_questions
  for insert with check (
    auth.uid() = user_id and
    exists (
      select 1 from public.pack_members
      where pack_id = public.pack_questions.pack_id
      and user_id = auth.uid()
    )
  );

-- Answers Policies
create policy "Public can view answers" on public.pack_answers
  for select using (true);

create policy "Members can insert answers" on public.pack_answers
  for insert with check (
    auth.uid() = user_id and
    exists (
      select 1 from public.pack_members pm
      join public.pack_questions pq on pm.pack_id = pq.pack_id
      where pq.id = public.pack_answers.question_id
      and pm.user_id = auth.uid()
    )
  );

-- Walks Policies
create policy "Public can view walks" on public.pack_walks
  for select using (true);

create policy "Members can create walks" on public.pack_walks
  for insert with check (
    auth.uid() = created_by and
    exists (
      select 1 from public.pack_members
      where pack_id = public.pack_walks.pack_id
      and user_id = auth.uid()
    )
  );

-- RSVPs Policies
create policy "Public can view rsvps" on public.pack_walk_rsvps
  for select using (true);

create policy "Members can rsvp" on public.pack_walk_rsvps
  for insert with check (
    auth.uid() = user_id and
    exists (
      select 1 from public.pack_members pm
      join public.pack_walks pw on pm.pack_id = pw.pack_id
      where pw.id = public.pack_walk_rsvps.walk_id
      and pm.user_id = auth.uid()
    )
  );

-- BONE DROPS (Geofenced Collection)
create table public.bone_drops (
  id uuid default gen_random_uuid() primary key,
  type text not null check (type in ('shared', 'personal')),
  latitude decimal(10, 8) not null,
  longitude decimal(11, 8) not null,
  location_name text,
  bone_value int not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone not null,
  user_id uuid references public.profiles(id), -- Only for personal drops
  collected_by uuid references public.profiles(id),
  collected_at timestamp with time zone
);

-- Enable RLS
alter table public.bone_drops enable row level security;

-- Indexes for performance
create index bone_drops_type_idx on public.bone_drops(type);
create index bone_drops_location_idx on public.bone_drops(latitude, longitude);
create index bone_drops_expires_at_idx on public.bone_drops(expires_at);
create index bone_drops_user_id_idx on public.bone_drops(user_id);

-- Bone Drops Policies
create policy "Users can view uncollected shared drops" on public.bone_drops
  for select using (
    type = 'shared' and 
    collected_by is null and 
    expires_at > now()
  );

create policy "Users can view their own personal drops" on public.bone_drops
  for select using (
    type = 'personal' and 
    user_id = auth.uid() and 
    collected_by is null and 
    expires_at > now()
  );

create policy "Users can collect drops" on public.bone_drops
  for update using (
    collected_by is null and 
    expires_at > now() and
    (type = 'shared' or user_id = auth.uid())
  );

create policy "System can create drops" on public.bone_drops
  for insert with check (true); -- Will be restricted to service role in production


-- 13. SCRAPED_COUPONS (Coupon Hunter Agent)
create table public.scraped_coupons (
  id uuid default gen_random_uuid() primary key,
  store_name text not null,
  description text not null,
  code text not null,
  discount_value text not null,
  bones_cost int not null,
  source_url text,
  expires_at timestamp with time zone not null,
  is_redeemed boolean default false,
  redeemed_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.scraped_coupons enable row level security;

-- Policies
create policy "Public can view available coupons" on public.scraped_coupons
  for select using (is_redeemed = false);

create policy "Authenticated users can redeem coupons" on public.scraped_coupons
  for update using (auth.role() = 'authenticated');

create policy "System can insert coupons" on public.scraped_coupons
  for insert with check (true);

