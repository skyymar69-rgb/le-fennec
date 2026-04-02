const SQL = `
create extension if not exists "uuid-ossp";
create table if not exists public.profiles (id uuid primary key references auth.users on delete cascade, name text default '', phone text, avatar text, member_since text default extract(year from now())::text, is_email_verified boolean default false, is_phone_verified boolean default false, is_identity_verified boolean default false, trust_score integer default 10, badges text[] default '{}', created_at timestamptz default now());
create table if not exists public.listings (id uuid primary key default uuid_generate_v4(), title text not null, description text default '', price bigint default 0, currency text default 'DZD', negotiable boolean default false, category_id text default '', category text default '', wilaya_id text default '', wilaya_name text default '', commune text, condition text default 'good', images text[] default '{}', image_url text default '', attributes jsonb default '{}', user_id uuid references auth.users on delete cascade, status text default 'active', views integer default 0, contacts integer default 0, is_premium boolean default false, is_urgent boolean default false, boost_level integer default 0, trust_score integer default 50, quality_score integer default 50, phone text, whatsapp boolean default true, created_at timestamptz default now(), updated_at timestamptz default now());
create index if not exists idx_listings_status on public.listings(status);
create index if not exists idx_listings_category on public.listings(category_id);
create index if not exists idx_listings_created on public.listings(created_at desc);
create table if not exists public.threads (id uuid primary key default uuid_generate_v4(), listing_id text not null, buyer_id uuid references auth.users on delete cascade, seller_id uuid, listing_title text default '', listing_image text, listing_price bigint, unread_buyer integer default 0, unread_seller integer default 0, last_message text, last_ts timestamptz, created_at timestamptz default now());
create table if not exists public.messages (id uuid primary key default uuid_generate_v4(), thread_id uuid references public.threads on delete cascade, from_user uuid references auth.users on delete cascade, text text not null, read boolean default false, type text default 'text', created_at timestamptz default now());
create index if not exists idx_messages_thread on public.messages(thread_id);
create table if not exists public.favorites (id uuid primary key default uuid_generate_v4(), user_id uuid references auth.users on delete cascade, listing_id text not null, created_at timestamptz default now(), unique(user_id, listing_id));
create table if not exists public.boosts (id uuid primary key default uuid_generate_v4(), listing_id text not null, user_id uuid references auth.users on delete cascade, plan text not null, price_da integer not null, duration_days integer not null, status text default 'pending', expires_at timestamptz, created_at timestamptz default now());
alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.threads enable row level security;
alter table public.messages enable row level security;
alter table public.favorites enable row level security;
alter table public.boosts enable row level security;
create or replace function public.handle_new_user() returns trigger as $$ begin insert into public.profiles(id,name,avatar) values(new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1),'Utilisateur'), coalesce(new.raw_user_meta_data->>'avatar_url','')) on conflict(id) do nothing; return new; end; $$ language plpgsql security definer;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
`;

module.exports = async (req, res) => {
  const token = req.query.token;
  if (token !== 'fennec2024') {
    return res.status(401).json({ error: 'Invalid token. Use ?token=fennec2024' });
  }

  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return res.status(200).json({
      status: 'manual_required',
      message: 'Add SUPABASE_SERVICE_ROLE_KEY to Vercel env vars, then call this endpoint again.',
      supabase_dashboard: 'https://supabase.com/dashboard/project/eubqfxedbxsdcvvzwqzp/settings/api',
    });
  }

  // Use Supabase SQL API
  const response = await fetch(`${url}/rest/v1/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Prefer': 'params=single-object',
    },
    body: JSON.stringify({ query: SQL }),
  });

  // Also try via pg endpoint
  const pg = await fetch(`${url}/pg/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': key,
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({ query: SQL }),
  });

  const result = await pg.json().catch(() => ({}));

  return res.status(200).json({
    success: true,
    message: 'Schema setup attempted. Check Supabase dashboard to confirm.',
    result,
  });
};
