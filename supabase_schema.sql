-- ═══════════════════════════════════════════════════════════════════════
-- LE FENNEC DZ MARKET — Schéma Supabase
-- Exécutez ce fichier dans Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Users (extends Supabase auth.users) ──────────────────────────────────
create table if not exists public.profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  name                  text not null default '',
  phone                 text,
  avatar                text,
  member_since          text default extract(year from now())::text,
  is_email_verified     boolean default false,
  is_phone_verified     boolean default false,
  is_identity_verified  boolean default false,
  trust_score           integer default 10 check (trust_score >= 0 and trust_score <= 100),
  badges                text[] default '{}',
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "Users can view all profiles"    on public.profiles for select using (true);
create policy "Users can update own profile"   on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile"   on public.profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, avatar)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Listings ──────────────────────────────────────────────────────────────
create table if not exists public.listings (
  id              uuid primary key default uuid_generate_v4(),
  title           text not null,
  description     text not null default '',
  price           bigint not null default 0,
  currency        text not null default 'DZD',
  negotiable      boolean default false,
  category_id     text not null,
  category        text not null,
  wilaya_id       text not null,
  wilaya_name     text not null,
  commune         text,
  condition       text default 'good',
  images          text[] default '{}',
  image_url       text default '',
  attributes      jsonb default '{}',
  user_id         uuid references auth.users(id) on delete cascade not null,
  status          text default 'pending' check (status in ('active','pending','sold','expired','rejected')),
  views           integer default 0,
  contacts        integer default 0,
  is_premium      boolean default false,
  is_urgent       boolean default false,
  is_verified     boolean default false,
  boost_level     integer default 0,
  boost_expires_at timestamptz,
  trust_score     integer default 50,
  quality_score   integer default 50,
  phone           text,
  whatsapp        boolean default true,
  moderation_score float,
  moderation_flags text[],
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_listings_status       on public.listings(status);
create index if not exists idx_listings_category     on public.listings(category_id);
create index if not exists idx_listings_wilaya       on public.listings(wilaya_id);
create index if not exists idx_listings_user         on public.listings(user_id);
create index if not exists idx_listings_created      on public.listings(created_at desc);
create index if not exists idx_listings_price        on public.listings(price);
create index if not exists idx_listings_search       on public.listings using gin(to_tsvector('french', title || ' ' || description));

-- RLS
alter table public.listings enable row level security;
create policy "Anyone can view active listings"     on public.listings for select using (status = 'active' or auth.uid() = user_id);
create policy "Users can create listings"           on public.listings for insert with check (auth.uid() = user_id);
create policy "Users can update own listings"       on public.listings for update using (auth.uid() = user_id);
create policy "Users can delete own listings"       on public.listings for delete using (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$ begin new.updated_at = now(); return new; end; $$ language plpgsql;
create trigger listings_updated_at before update on public.listings
  for each row execute function update_updated_at();

-- ── Favorites ────────────────────────────────────────────────────────────
create table if not exists public.favorites (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  listing_id  uuid references public.listings(id) on delete cascade not null,
  created_at  timestamptz default now(),
  unique(user_id, listing_id)
);

alter table public.favorites enable row level security;
create policy "Users manage own favorites" on public.favorites using (auth.uid() = user_id);

-- ── Threads ───────────────────────────────────────────────────────────────
create table if not exists public.threads (
  id              uuid primary key default uuid_generate_v4(),
  listing_id      uuid references public.listings(id) on delete cascade not null,
  buyer_id        uuid references auth.users(id) on delete cascade not null,
  seller_id       uuid references auth.users(id) on delete cascade not null,
  listing_title   text not null default '',
  listing_image   text,
  listing_price   bigint,
  unread_buyer    integer default 0,
  unread_seller   integer default 0,
  last_message    text,
  last_ts         timestamptz,
  created_at      timestamptz default now(),
  unique(listing_id, buyer_id)
);

create index if not exists idx_threads_buyer  on public.threads(buyer_id);
create index if not exists idx_threads_seller on public.threads(seller_id);

alter table public.threads enable row level security;
create policy "Thread participants can access" on public.threads
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

-- ── Messages ──────────────────────────────────────────────────────────────
create table if not exists public.messages (
  id          uuid primary key default uuid_generate_v4(),
  thread_id   uuid references public.threads(id) on delete cascade not null,
  from_user   uuid references auth.users(id) on delete cascade not null,
  text        text not null,
  read        boolean default false,
  type        text default 'text' check (type in ('text','offer','system')),
  created_at  timestamptz default now()
);

create index if not exists idx_messages_thread on public.messages(thread_id);
create index if not exists idx_messages_from   on public.messages(from_user);

alter table public.messages enable row level security;
create policy "Thread participants can read messages" on public.messages
  for select using (
    exists (
      select 1 from public.threads t
      where t.id = thread_id
      and (t.buyer_id = auth.uid() or t.seller_id = auth.uid())
    )
  );
create policy "Users can insert messages" on public.messages
  for insert with check (auth.uid() = from_user);

-- Auto-update thread on new message
create or replace function update_thread_on_message()
returns trigger as $$
begin
  update public.threads set
    last_message  = new.text,
    last_ts       = new.created_at,
    unread_buyer  = case when buyer_id != new.from_user  then unread_buyer  + 1 else 0 end,
    unread_seller = case when seller_id != new.from_user then unread_seller + 1 else 0 end
  where id = new.thread_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_new_message after insert on public.messages
  for each row execute function update_thread_on_message();

-- ── Payments / Boosts ────────────────────────────────────────────────────
create table if not exists public.boosts (
  id          uuid primary key default uuid_generate_v4(),
  listing_id  uuid references public.listings(id) on delete cascade not null,
  user_id     uuid references auth.users(id) on delete cascade not null,
  plan        text not null check (plan in ('urgent','top','premium','pack')),
  price_da    integer not null,
  duration_days integer not null,
  status      text default 'pending' check (status in ('pending','active','expired')),
  payment_ref text,
  starts_at   timestamptz default now(),
  expires_at  timestamptz,
  created_at  timestamptz default now()
);

alter table public.boosts enable row level security;
create policy "Users manage own boosts" on public.boosts using (auth.uid() = user_id);

-- ── Moderation logs ───────────────────────────────────────────────────────
create table if not exists public.moderation_logs (
  id              uuid primary key default uuid_generate_v4(),
  listing_id      uuid references public.listings(id) on delete cascade,
  ai_decision     text,
  ai_confidence   float,
  ai_flags        text[],
  human_decision  text,
  reviewed_by     uuid references auth.users(id),
  note            text,
  created_at      timestamptz default now()
);

-- ── Enable Realtime ───────────────────────────────────────────────────────
-- Run these in Supabase Dashboard → Database → Replication
-- alter publication supabase_realtime add table public.messages;
-- alter publication supabase_realtime add table public.threads;

-- ── Storage buckets ───────────────────────────────────────────────────────
-- Create in Supabase Dashboard → Storage:
-- Bucket: "listings" (public) — for listing photos
-- Bucket: "avatars"  (public) — for user profile photos

select 'Schema created successfully ✓' as status;
