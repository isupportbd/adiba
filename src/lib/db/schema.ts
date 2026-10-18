/**
 * Drizzle ORM schema — PostgreSQL
 * ------------------------------------------------------------------
 * আদিবার স্মৃতিখানা data model.
 *
 * PRIVACY RULES baked into the schema:
 *  - `child_profile` keeps public fields (name, nickname, bio, parents'
 *    message, featured photo) separate from private ones (birth date,
 *    birth time, birth measurements). Private columns are only ever
 *    served to logged-in family members.
 *  - Every content table has `is_private` so single items can be hidden
 *    from the public view of the site.
 *  - There are deliberately NO columns for home address, school or daily
 *    routine. Please keep it that way. 🙏
 *
 * All IDs are uuid text so seeded sample rows and rows created by the
 * app look identical.
 */
import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  time,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const createdAt = () =>
  timestamp("created_at", { mode: "date" }).notNull().defaultNow();

// ---------------------------------------------------------------- auth

export const users = pgTable(
  "users",
  {
    id: id(),
    name: text("name"),
    email: text("email").notNull(),
    emailVerified: timestamp("email_verified", { mode: "date" }),
    image: text("image"),
    /** bcrypt hash. Never returned to the client. */
    passwordHash: text("password_hash"),
    /** parent = full control · family = can add content · viewer = read-only */
    role: text("role", { enum: ["parent", "family", "viewer"] })
      .notNull()
      .default("family"),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email)],
);

// Standard Auth.js adapter tables (kept for compatibility; sessions are JWTs).
export const accounts = pgTable("accounts", {
  id: id(),
  userId: text("user_id").notNull(),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});

export const sessions = pgTable("sessions", {
  id: id(),
  sessionToken: text("session_token").notNull(),
  userId: text("user_id").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

// -------------------------------------------------------- child profile

export const childProfile = pgTable("child_profile", {
  id: id(),
  /** PUBLIC — her display name (can include a placeholder while undecided). */
  displayName: text("display_name"),
  /** PUBLIC — nickname shown on the home hero. */
  nickname: text("nickname"),
  /** PUBLIC — short bio in her own little story. */
  bio: text("bio"),
  /** PUBLIC — the message of love from parents, shown on the home page. */
  parentsMessage: text("parents_message"),
  /** PUBLIC — one line per relation, e.g. "মা — রুবিনা রহমান". */
  familyLines: text("family_lines").array().default([]),
  /** 🔒 PRIVATE — ISO date, visible to logged-in family only. */
  birthDate: date("birth_date", { mode: "string" }),
  /** 🔒 PRIVATE — "HH:MM" 24h. */
  birthTime: time("birth_time"),
  /** 🔒 PRIVATE — measurements at birth. */
  birthWeightKg: numeric("birth_weight_kg", { precision: 4, scale: 2 }),
  birthHeightCm: numeric("birth_height_cm", { precision: 5, scale: 1 }),
  /** media.id of the featured hero photo on the home page. */
  featuredMediaId: text("featured_media_id"),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

// ---------------------------------------------------------------- media

/**
 * Photos & videos. Files live in MinIO under `storageKey`; the web app
 * streams them through /api/media/** so private media can be gated.
 * A key of the form "local:/images/..." points at a bundled sample
 * placeholder in /public instead (used by the seed script).
 */
export const media = pgTable("media", {
  id: id(),
  kind: text("kind", { enum: ["image", "video", "audio"] }).notNull(),
  storageKey: text("storage_key").notNull(),
  /** Optional WebVTT captions file (uploaded next to the video). */
  captionsKey: text("captions_key"),
  mimeType: text("mime_type"),
  bytes: integer("bytes"),
  width: integer("width"),
  height: integer("height"),
  /** Accessible description — REQUIRED by the upload forms. */
  altText: text("alt_text"),
  caption: text("caption"),
  /** Date the photo/video was taken, if known (ISO date). */
  takenOn: date("taken_on", { mode: "string" }),
  isPrivate: boolean("is_private").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  // Polymorphic-ish link: exactly one of these is usually set.
  memoryId: text("memory_id"),
  albumId: text("album_id"),
  milestoneId: text("milestone_id"),
  createdAt: createdAt(),
});

// ------------------------------------------------------------- memories

export const memories = pgTable(
  "memories",
  {
    id: id(),
    title: text("title").notNull(),
    story: text("story"),
    occurredOn: date("occurred_on", { mode: "string" }),
    type: text("type", { enum: ["photo", "video", "story", "mixed"] })
      .notNull()
      .default("mixed"),
    tags: text("tags").array().default([]),
    isPrivate: boolean("is_private").notNull().default(false),
    createdBy: text("created_by"),
    createdAt: createdAt(),
  },
  (t) => [index("memories_occurred_on_idx").on(t.occurredOn)],
);

export const albums = pgTable(
  "albums",
  {
    id: id(),
    title: text("title").notNull(),
    description: text("description"),
    /** e.g. "জন্মদিন", "প্রথম ভ্রমণ" */
    eventName: text("event_name"),
    /** "0-6" | "6-12" | "1-3" | "3+" — set when the album is created. */
    ageBucket: text("age_bucket", {
      enum: ["0-6", "6-12", "1-3", "3+", "unknown"],
    }).default("unknown"),
    coverMediaId: text("cover_media_id"),
    isPrivate: boolean("is_private").notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [index("albums_age_bucket_idx").on(t.ageBucket)],
);

export const milestones = pgTable(
  "milestones",
  {
    id: id(),
    /** preset keys keep filtering reliable; `custom` is free-form. */
    milestoneType: text("milestone_type", {
      enum: [
        "first_smile",
        "first_crawl",
        "first_steps",
        "first_word",
        "first_tooth",
        "first_food",
        "first_birthday",
        "custom",
      ],
    })
      .notNull()
      .default("custom"),
    title: text("title").notNull(),
    occurredOn: date("occurred_on", { mode: "string" }),
    description: text("description"),
    isPrivate: boolean("is_private").notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [index("milestones_occurred_on_idx").on(t.occurredOn)],
);

export const letters = pgTable(
  "letters",
  {
    id: id(),
    title: text("title").notNull(),
    authorName: text("author_name").notNull(),
    relationship: text("relationship"),
    body: text("body").notNull(),
    writtenOn: date("written_on", { mode: "string" }),
    /** Letters start private — she reads them when she is older. */
    isPrivate: boolean("is_private").notNull().default(true),
    createdAt: createdAt(),
  },
  (t) => [index("letters_written_on_idx").on(t.writtenOn)],
);

export const favorites = pgTable(
  "favorites",
  {
    id: id(),
    category: text("category", {
      enum: ["toy", "food", "song", "cartoon", "book", "other"],
    }).notNull(),
    name: text("name").notNull(),
    note: text("note"),
    sinceOn: date("since_on", { mode: "string" }),
    isCurrent: boolean("is_current").notNull().default(true),
    createdAt: createdAt(),
  },
  (t) => [index("favorites_category_idx").on(t.category)],
);

export const growthEntries = pgTable(
  "growth_entries",
  {
    id: id(),
    measuredOn: date("measured_on", { mode: "string" }).notNull(),
    heightCm: numeric("height_cm", { precision: 5, scale: 1 }),
    weightKg: numeric("weight_kg", { precision: 4, scale: 2 }),
    headCircumferenceCm: numeric("head_circumference_cm", { precision: 5, scale: 1 }),
    note: text("note"),
    createdAt: createdAt(),
  },
  (t) => [index("growth_measured_on_idx").on(t.measuredOn)],
);
