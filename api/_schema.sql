-- Run this once in the Neon SQL editor (or via psql) when you wire the real DB.
-- Safe to re-run: uses IF NOT EXISTS guards.

create table if not exists memes (
  id           text primary key,
  image_url    text not null,
  width        integer,
  height       integer,
  template_id  text,
  layers       jsonb,
  created_at   timestamptz not null default now()
);

create table if not exists reactions (
  id          bigint generated always as identity primary key,
  meme_id     text not null references memes(id) on delete cascade,
  emoji       text not null,
  created_at  timestamptz not null default now()
);

create index if not exists reactions_meme_id_idx on reactions(meme_id);
create index if not exists reactions_meme_emoji_idx on reactions(meme_id, emoji);
