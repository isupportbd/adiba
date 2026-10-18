-- =====================================================================
-- আদিবার স্মৃতিখানা — initial schema (idempotent: safe to re-run)
-- Applied automatically at container start by migrate.mjs.
-- Generate new migrations after schema changes: npm run db:generate
-- =====================================================================

CREATE TABLE IF NOT EXISTS users (
  id            text PRIMARY KEY,
  name          text,
  email         text NOT NULL,
  email_verified timestamptz,
  image         text,
  password_hash text,
  role          text NOT NULL DEFAULT 'family',
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON users (email);

CREATE TABLE IF NOT EXISTS accounts (
  id                text PRIMARY KEY,
  user_id           text NOT NULL,
  type              text NOT NULL,
  provider          text NOT NULL,
  provider_account_id text NOT NULL,
  refresh_token     text,
  access_token      text,
  expires_at        integer,
  token_type        text,
  scope             text,
  id_token          text,
  session_state     text
);

CREATE TABLE IF NOT EXISTS sessions (
  id           text PRIMARY KEY,
  session_token text NOT NULL,
  user_id      text NOT NULL,
  expires      timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier text NOT NULL,
  token      text NOT NULL,
  expires    timestamptz NOT NULL,
  PRIMARY KEY (identifier, token)
);

CREATE TABLE IF NOT EXISTS child_profile (
  id                text PRIMARY KEY,
  display_name      text,
  nickname          text,
  bio               text,
  parents_message   text,
  family_lines      text[],
  birth_date        date,          -- 🔒 private
  birth_time        time,          -- 🔒 private
  birth_weight_kg   numeric(4,2),  -- 🔒 private
  birth_height_cm   numeric(5,1),  -- 🔒 private
  featured_media_id text,
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS media (
  id            text PRIMARY KEY,
  kind          text NOT NULL,
  storage_key   text NOT NULL,
  captions_key  text,
  mime_type     text,
  bytes         integer,
  width         integer,
  height        integer,
  alt_text      text,
  caption       text,
  taken_on      date,
  is_private    boolean NOT NULL DEFAULT false,
  sort_order    integer NOT NULL DEFAULT 0,
  memory_id     text,
  album_id      text,
  milestone_id  text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS memories (
  id           text PRIMARY KEY,
  title        text NOT NULL,
  story        text,
  occurred_on  date,
  type         text NOT NULL DEFAULT 'mixed',
  tags         text[],
  is_private   boolean NOT NULL DEFAULT false,
  created_by   text,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS memories_occurred_on_idx ON memories (occurred_on);

CREATE TABLE IF NOT EXISTS albums (
  id             text PRIMARY KEY,
  title          text NOT NULL,
  description    text,
  event_name     text,
  age_bucket     text DEFAULT 'unknown',
  cover_media_id text,
  is_private     boolean NOT NULL DEFAULT false,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS albums_age_bucket_idx ON albums (age_bucket);

CREATE TABLE IF NOT EXISTS milestones (
  id            text PRIMARY KEY,
  milestone_type text NOT NULL DEFAULT 'custom',
  title         text NOT NULL,
  occurred_on   date,
  description   text,
  is_private    boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS milestones_occurred_on_idx ON milestones (occurred_on);

CREATE TABLE IF NOT EXISTS letters (
  id           text PRIMARY KEY,
  title        text NOT NULL,
  author_name  text NOT NULL,
  relationship text,
  body         text NOT NULL,
  written_on   date,
  is_private   boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS letters_written_on_idx ON letters (written_on);

CREATE TABLE IF NOT EXISTS favorites (
  id         text PRIMARY KEY,
  category   text NOT NULL,
  name       text NOT NULL,
  note       text,
  since_on   date,
  is_current boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS favorites_category_idx ON favorites (category);

CREATE TABLE IF NOT EXISTS growth_entries (
  id                     text PRIMARY KEY,
  measured_on            date NOT NULL,
  height_cm              numeric(5,1),
  weight_kg              numeric(4,2),
  head_circumference_cm  numeric(5,1),
  note                   text,
  created_at             timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS growth_measured_on_idx ON growth_entries (measured_on);
