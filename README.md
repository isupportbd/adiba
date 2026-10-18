# 🌸 আদিবার স্মৃতিখানা — A private memory book for our daughter

A lovingly curated, **private** family website: photos, videos, first words,
milestones, growth charts, letters of love and a favourites board —
primarily in **বাংলা**, mobile-first, accessible, and self-hosted so only your
family can see it.

**Stack:** Next.js 14 (App Router, SSG + ISR, standalone output) · TypeScript ·
Tailwind CSS · PostgreSQL + Drizzle ORM · MinIO (S3) · Auth.js (NextAuth v5) ·
Docker Compose (Coolify-ready).

---

## ✨ Pages

| Page | Route | Notes |
|---|---|---|
| হোম (Home) | `/` | nickname, featured photo, parents' message, age 🔒, recent memories — **static (SSG+ISR)** |
| আমার সম্পর্কে (About) | `/about` | name, nickname, bio, family; birth details 🔒 — **static** |
| স্মৃতিপথ (Timeline) | `/timeline` | memories by date, filter by year/tag (plain links — works without JS) |
| প্রথম মুহূর্ত (Firsts) | `/milestones` | first smile, first steps, first word… |
| ছবি–ভিডিও (Gallery) | `/gallery` | albums by age bucket / event, accessible lightbox |
| বৃদ্ধি (Growth) | `/growth` | 🔒 height/weight chart + data table |
| চিঠিপত্র (Letters) | `/letters` | 🔒 dated letters from family |
| প্রিয় জিনিস (Favourites) | `/favorites` | toys, food, songs, cartoons — current & former |
| পরিবার কক্ষ (Family area) | `/family` | 🔒 add/edit/delete everything, manage members |

🔒 = requires sign-in.

---

## 🚀 Quick start (no database, instant preview)

```bash
npm install
npm run dev          # http://localhost:3000 — shows clearly-labeled SAMPLE data
```

`.env.local` ships with `USE_SAMPLE_DATA=1`. A small banner reminds you it is
sample content. **You can click through every page, the family area and the
login (any password works in sample mode).**

To try the real database locally:

```bash
cp .env.example .env.local      # edit values
docker compose up -d db minio minio-init
# in .env.local: set DATABASE_URL, remove USE_SAMPLE_DATA=1
npm run db:migrate              # apply SQL migrations
npm run db:seed                 # load sample content into PostgreSQL
npm run dev
```

Sign in at `/login` with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`
(default: `family@example.com` / `change-me-before-going-live` — **change them**).

---

## 🐳 Production (your own server / Coolify)

```bash
cp .env.example .env
#  🔑 change EVERY password & secret:
#     POSTGRES_PASSWORD, MINIO_ACCESS_KEY, MINIO_SECRET_KEY,
#     AUTH_SECRET (openssl rand -base64 32), SEED_ADMIN_PASSWORD
#  🌐 set NEXT_PUBLIC_APP_URL + AUTH_URL to your domain, e.g. https://memories.example.com

docker compose up -d --build
docker compose exec app node scripts/seed.mjs     # optional sample content
```

On **Coolify**: add a new resource → point at your repo → use this
`docker-compose.yml` → attach your domain to the `app` service (port 3000).
The container applies pending migrations on start (`node migrate.mjs`).

Backups = the two named volumes: `pgdata` (database) and `miniodata` (media).

---

## 📝 Where to put your daughter's real data

1. **Easiest:** sign in → **পরিবার কক্ষ** → edit profile / add memories /
   milestones / letters / favourites / growth entries. Everything is editable
   in the UI; no code changes needed.
2. **Or** edit the sample files and re-seed:
   * UI strings → `src/lib/i18n/bn.ts`
   * Sample content preview → `src/lib/sample-data.ts`
   * Seed data → `scripts/seed.mjs` (then `npm run db:seed`)
   * Name/nickname used by the seed → `SEED_CHILD_NAME`, `SEED_CHILD_NICKNAME`

Uploads go to MinIO and appear instantly (server actions call
`revalidatePath`, so static pages refresh without waiting for ISR).

---

## 🔐 Privacy & security

* `X-Robots-Tag: noindex, nofollow` on **every** response + `<meta robots>`
  + `robots.txt` disallow-all.
* Family-only routes (`/family`, `/growth`, `/letters`) are blocked by
  middleware (JWT) and again in each page/route (defence in depth).
* Birth date/time/measurements are **never** in public HTML — signed-in
  visitors fetch them from `/api/family/profile` (401 when signed out).
* Photos/videos are served through `/api/media/<key>`, which checks the
  item's privacy flag and streams from MinIO — the MinIO endpoint is never
  exposed to browsers and the bucket is private.
* Passwords are bcrypt-hashed. Roles: `parent` (full control),
  `family` (can add content), `viewer` (read-only).
* **There are deliberately no fields for home address, school or daily
  routine.** Please keep it that way. 🙏
* Set a strong `AUTH_SECRET` and put the site behind HTTPS (Coolify/Let's
  Encrypt does this automatically).

---

## 🗂 Project structure

```
src/
  app/                 pages (App Router) + api routes
  components/          UI (Photo, MediaGrid+Lightbox, GrowthChart, forms…)
  lib/
    db/schema.ts       Drizzle schema (users, child_profile, media, memories,
                       albums, milestones, letters, favorites, growth_entries)
    db/index.ts        lazy Postgres client (build never needs the DB)
    queries.ts         data access + automatic sample-data fallback
    actions.ts         all mutations (server actions) with auth + revalidation
    auth.ts            Auth.js config (credentials + DrizzleAdapter)
    upload.ts, s3.ts   MinIO upload/streaming helpers
    i18n/              Bengali (primary) + English strings
drizzle/0001_init.sql  migrations (applied by migrate.mjs)
migrate.mjs            zero-dep migration runner
scripts/seed.mjs       sample-data seed
```

## 🛠 Common tasks

```bash
npm run typecheck        # TypeScript check
npm run db:generate      # make SQL from schema changes → drizzle/*.sql
npm run db:migrate       # apply pending migrations
npm run db:studio        # browse the database
npm run db:seed          # insert sample data (idempotent)
```

* **Video captions:** when uploading a video, also pick a `.vtt` file — it is
  attached automatically (in the order files were chosen) and rendered as a
  `<track kind="captions">`.
* **Manual revalidation:** `curl -X POST https://your-domain/api/revalidate`
  with header `x-revalidate-secret: $REVALIDATE_SECRET`.
* **English UI:** set `NEXT_PUBLIC_LOCALE=en` (missing strings fall back to
  Bengali).

---

## ♿ Accessibility notes

Semantic landmarks, skip link, keyboard-operable filters & lightbox
(←/→/Esc, focus trap), visible focus rings, alt text **required** on upload,
caption tracks for videos, an accessible data table alongside the growth
chart, and full `prefers-reduced-motion` support.
