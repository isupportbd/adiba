/**
 * Data access layer.
 *
 * Every function returns view-models (see types.ts) and — crucially —
 * falls back to the bundled sample data whenever the database is not
 * reachable. That means:
 *   • `npm run dev` works with zero services.
 *   • `next build` never requires a live database.
 *
 * `sampleMode` is remembered so pages can show a "নমুনা ডেটা" banner.
 */
import { asc, desc, eq, or, isNotNull } from "drizzle-orm";
import { getDb } from "./db";
import * as dbSchema from "./db/schema";
import { toMediaVM } from "./media";
import {
  SAMPLE_ALBUMS,
  SAMPLE_FAVORITES,
  SAMPLE_GROWTH,
  SAMPLE_LETTERS,
  SAMPLE_MEMORIES,
  SAMPLE_MILESTONES,
  SAMPLE_PROFILE,
  SAMPLE_USERS,
} from "./sample-data";
import type {
  AlbumDetailVM,
  AlbumVM,
  ChildProfileVM,
  FavoriteVM,
  GrowthVM,
  LetterVM,
  MediaVM,
  MemoryVM,
  MilestoneVM,
  UserVM,
} from "./types";

let sampleModeDetected = false;

/** True when the site is rendering bundled sample data (env flag or DB down). */
export async function usingSampleData(): Promise<boolean> {
  return process.env.USE_SAMPLE_DATA === "1" || sampleModeDetected;
}

async function run<T>(query: () => Promise<T>, fallback: () => T): Promise<T> {
  if (process.env.USE_SAMPLE_DATA === "1") {
    sampleModeDetected = true;
    return fallback();
  }
  try {
    return await query();
  } catch (err) {
    // Database not reachable (first boot, build time, local preview…).
    // Log it, then quietly serve sample data so the site stays usable.
    if (!sampleModeDetected) {
      console.warn("[queries] database unavailable, using sample data:", (err as Error).message);
    }
    sampleModeDetected = true;
    return fallback();
  }
}

const num = (v: unknown): number | undefined => {
  if (v === null || v === undefined || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

// ------------------------------------------------------------- profile

export async function getChildProfile(): Promise<ChildProfileVM> {
  return run(
    async () => {
      const db = getDb();
      const [row] = await db.select().from(dbSchema.childProfile).limit(1);
      if (!row) return SAMPLE_PROFILE;
      let featured: MediaVM | undefined;
      if (row.featuredMediaId) {
        const [m] = await db
          .select()
          .from(dbSchema.media)
          .where(eq(dbSchema.media.id, row.featuredMediaId))
          .limit(1);
        if (m) featured = toMediaVM(m);
      }
      return {
        displayName: row.displayName ?? undefined,
        nickname: row.nickname ?? undefined,
        bio: row.bio ?? undefined,
        parentsMessage: row.parentsMessage ?? undefined,
        familyLines: row.familyLines ?? [],
        birthDate: row.birthDate ?? undefined,
        birthTime: row.birthTime ?? undefined,
        birthWeightKg: num(row.birthWeightKg),
        birthHeightCm: num(row.birthHeightCm),
        featured,
        hasPrivateDetails: !!(row.birthDate || row.birthTime || row.birthWeightKg),
      };
    },
    () => SAMPLE_PROFILE,
  );
}

// ------------------------------------------------------------- memories

async function loadMemories(): Promise<MemoryVM[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(dbSchema.memories)
    .orderBy(desc(dbSchema.memories.occurredOn), desc(dbSchema.memories.createdAt));
  const mediaRows = await db
    .select()
    .from(dbSchema.media)
    .where(isNotNull(dbSchema.media.memoryId))
    .orderBy(asc(dbSchema.media.sortOrder));

  const byMemory = new Map<string, MediaVM[]>();
  for (const m of mediaRows) {
    if (!m.memoryId) continue;
    const list = byMemory.get(m.memoryId) ?? [];
    list.push(toMediaVM(m));
    byMemory.set(m.memoryId, list);
  }

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    story: r.story ?? undefined,
    occurredOn: r.occurredOn ?? undefined,
    type: r.type as MemoryVM["type"],
    tags: r.tags ?? [],
    isPrivate: r.isPrivate,
    media: byMemory.get(r.id) ?? [],
  }));
}

export async function getMemories(): Promise<MemoryVM[]> {
  return run(loadMemories, () => SAMPLE_MEMORIES);
}

export async function getRecentMemories(limit = 3): Promise<MemoryVM[]> {
  const all = await getMemories();
  return all.slice(0, limit);
}

// ------------------------------------------------------------- albums

async function loadAlbums(): Promise<AlbumDetailVM[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(dbSchema.albums)
    .orderBy(desc(dbSchema.albums.createdAt));
  const mediaRows = await db
    .select()
    .from(dbSchema.media)
    .where(isNotNull(dbSchema.media.albumId))
    .orderBy(asc(dbSchema.media.sortOrder));

  const byAlbum = new Map<string, MediaVM[]>();
  for (const m of mediaRows) {
    if (!m.albumId) continue;
    const list = byAlbum.get(m.albumId) ?? [];
    list.push(toMediaVM(m));
    byAlbum.set(m.albumId, list);
  }

  const covers = await db.select().from(dbSchema.media);
  const coverById = new Map(covers.map((c) => [c.id, toMediaVM(c)]));

  return rows.map((r) => {
    const media = byAlbum.get(r.id) ?? [];
    return {
      id: r.id,
      title: r.title,
      description: r.description ?? undefined,
      eventName: r.eventName ?? undefined,
      ageBucket: (r.ageBucket ?? "unknown") as AlbumVM["ageBucket"],
      isPrivate: r.isPrivate,
      mediaCount: media.length,
      cover: r.coverMediaId ? coverById.get(r.coverMediaId) : media[0],
      media,
    };
  });
}

export async function getAlbums(): Promise<AlbumDetailVM[]> {
  return run(loadAlbums, () => SAMPLE_ALBUMS);
}

export async function getAlbum(id: string): Promise<AlbumDetailVM | null> {
  const albums = await getAlbums();
  return albums.find((a) => a.id === id) ?? null;
}

// ---------------------------------------------------------- milestones

async function loadMilestones(): Promise<MilestoneVM[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(dbSchema.milestones)
    .orderBy(asc(dbSchema.milestones.occurredOn));
  const mediaRows = await db.select().from(dbSchema.media);

  const byId = new Map<string, MediaVM[]>();
  for (const m of mediaRows) {
    if (!m.milestoneId) continue;
    const list = byId.get(m.milestoneId) ?? [];
    list.push(toMediaVM(m));
    byId.set(m.milestoneId, list);
  }

  return rows.map((r) => ({
    id: r.id,
    milestoneType: r.milestoneType as MilestoneVM["milestoneType"],
    title: r.title,
    occurredOn: r.occurredOn ?? undefined,
    description: r.description ?? undefined,
    isPrivate: r.isPrivate,
    media: byId.get(r.id) ?? [],
  }));
}

export async function getMilestones(): Promise<MilestoneVM[]> {
  return run(loadMilestones, () => SAMPLE_MILESTONES);
}

// ------------------------------------------------------------- letters

async function loadLetters(): Promise<LetterVM[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(dbSchema.letters)
    .orderBy(desc(dbSchema.letters.writtenOn));
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    authorName: r.authorName,
    relationship: r.relationship ?? undefined,
    body: r.body,
    writtenOn: r.writtenOn ?? undefined,
    isPrivate: r.isPrivate,
  }));
}

export async function getLetters(): Promise<LetterVM[]> {
  return run(loadLetters, () => SAMPLE_LETTERS);
}

// ---------------------------------------------------------- favorites

async function loadFavorites(): Promise<FavoriteVM[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(dbSchema.favorites)
    .orderBy(desc(dbSchema.favorites.sinceOn));
  return rows.map((r) => ({
    id: r.id,
    category: r.category as FavoriteVM["category"],
    name: r.name,
    note: r.note ?? undefined,
    sinceOn: r.sinceOn ?? undefined,
    isCurrent: r.isCurrent,
  }));
}

export async function getFavorites(): Promise<FavoriteVM[]> {
  return run(loadFavorites, () => SAMPLE_FAVORITES);
}

// ------------------------------------------------------------- growth

async function loadGrowth(): Promise<GrowthVM[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(dbSchema.growthEntries)
    .orderBy(asc(dbSchema.growthEntries.measuredOn));
  return rows.map((r) => ({
    id: r.id,
    measuredOn: r.measuredOn,
    heightCm: num(r.heightCm),
    weightKg: num(r.weightKg),
    headCircumferenceCm: num(r.headCircumferenceCm),
    note: r.note ?? undefined,
  }));
}

export async function getGrowthEntries(): Promise<GrowthVM[]> {
  return run(loadGrowth, () => SAMPLE_GROWTH);
}

// --------------------------------------------------------------- user

export async function listUsers(): Promise<UserVM[]> {
  return run(
    async () => {
      const db = getDb();
      const rows = await db.select().from(dbSchema.users).orderBy(asc(dbSchema.users.email));
      return rows.map((r) => ({
        id: r.id,
        name: r.name ?? undefined,
        email: r.email,
        role: r.role as UserVM["role"],
      }));
    },
    () => SAMPLE_USERS,
  );
}

/** Used by the media proxy to enforce privacy on MinIO objects. */
export async function findMediaByKey(key: string): Promise<{ is_private: boolean } | null> {
  return run(
    async () => {
      const db = getDb();
      const [row] = await db
        .select({ is_private: dbSchema.media.isPrivate })
        .from(dbSchema.media)
        .where(or(eq(dbSchema.media.storageKey, key), eq(dbSchema.media.captionsKey, key)))
        .limit(1);
      return row ?? null;
    },
    () => null,
  );
}

export { dbSchema };
