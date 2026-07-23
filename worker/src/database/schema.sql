-- accounts table
create extension if not exists "uuid-ossp";

create table if not exists accounts (
  id uuid primary key default uuid_generate_v4(),
  username text unique not null,
  display_name text,
  profile_image_url text,
  collection_source text,
  active boolean default true,
  added_at timestamptz default now(),
  last_collected_at timestamptz
);

create index if not exists idx_accounts_username on accounts(username);

create table if not exists account_snapshots (
  id uuid primary key default uuid_generate_v4(),
  account_id uuid references accounts(id) on delete cascade,
  collected_at timestamptz default now(),
  followers integer,
  following integer,
  media_count integer
);

create index if not exists idx_account_snapshots_account_id_collected_at on account_snapshots(account_id, collected_at);

create table if not exists posts (
  id uuid primary key default uuid_generate_v4(),
  instagram_post_id text unique,
  account_id uuid references accounts(id) on delete cascade,
  published_at timestamptz,
  post_type text,
  caption text,
  post_url text,
  thumbnail_url text,
  primary_category text,
  secondary_category text,
  category_source text,
  category_confidence numeric,
  created_at timestamptz default now()
);

create index if not exists idx_posts_account_id on posts(account_id);
create index if not exists idx_posts_published_at on posts(published_at);

create table if not exists post_snapshots (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references posts(id) on delete cascade,
  collected_at timestamptz default now(),
  views integer,
  likes integer,
  comments integer
);

create index if not exists idx_post_snapshots_post_id_collected_at on post_snapshots(post_id, collected_at);

create table if not exists collection_runs (
  id uuid primary key default uuid_generate_v4(),
  started_at timestamptz,
  finished_at timestamptz,
  accounts_attempted integer,
  accounts_successful integer,
  accounts_failed integer,
  status text,
  error_message text
);
