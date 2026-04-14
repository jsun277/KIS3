create table favorites (
  id bigint generated always as identity primary key,
  user_id text not null,
  title text not null,
  author text not null,
  cover_url text,
  ol_key text not null,
  created_at timestamptz not null default now()
);
