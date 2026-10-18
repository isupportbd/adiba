"use server";

/**
 * Server actions — every mutation in the family area goes through here.
 *
 * Rules applied everywhere:
 *  • requireFamily() → only signed-in family members can mutate anything.
 *  • revalidatePath() → static pages refresh instantly after a change.
 *  • Bengali, human-readable validation errors via the return value.
 */
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { isSampleMode, requireFamily } from "@/lib/auth";
import { getDb } from "@/lib/db";
import * as s from "@/lib/db/schema";
import { deleteObject } from "@/lib/s3";
import {
  UploadError,
  readFiles,
  splitUploads,
  storeUpload,
  type MediaInput,
  type UploadedFile,
} from "@/lib/upload";

const REVALIDATE_ALL = () => {
  for (const p of ["/", "/about", "/timeline", "/milestones", "/gallery", "/letters", "/favorites", "/growth"]) {
    revalidatePath(p);
  }
};

function assertDb() {
  if (isSampleMode) {
    throw new Error(
      "নমুনা মোডে (USE_SAMPLE_DATA=1) সম্পাদনা সম্ভব নয় — ডেটাবেস ছাড়া কিছু সংরক্ষণ হবে না।",
    );
  }
  return getDb();
}

async function saveMediaRows(
  db: ReturnType<typeof getDb>,
  inputs: MediaInput[],
  link: { memoryId?: string; albumId?: string; milestoneId?: string },
): Promise<string[]> {
  const ids: string[] = [];
  for (const input of inputs) {
    const [row] = await db
      .insert(s.media)
      .values({
        kind: input.file.kind,
        storageKey: input.file.key,
        captionsKey: input.captionsKey,
        mimeType: input.file.mimeType,
        bytes: input.file.bytes,
        width: input.file.width,
        height: input.file.height,
        altText: input.altText,
        caption: input.caption,
        takenOn: input.takenOn,
        isPrivate: input.isPrivate,
        sortOrder: input.sortOrder,
        memoryId: link.memoryId,
        albumId: link.albumId,
        milestoneId: link.milestoneId,
      })
      .returning({ id: s.media.id });
    if (row) ids.push(row.id);
  }
  return ids;
}

/** Collect uploaded files → MediaInput[] (with captions attached to videos). */
async function collectMedia(
  formData: FormData,
  folder: string,
  fallbackTakenOn?: string | null,
): Promise<MediaInput[]> {
  const altText = String(formData.get("altText") ?? "").trim();
  if (!altText) throw new UploadError("ছবির বর্ণনা (alt) দিতে হবে — অ্যাক্সেসিবিলিটির জন্য জরুরি।");
  const caption = String(formData.get("caption") ?? "").trim() || undefined;
  const takenOn = String(formData.get("takenOn") ?? "").trim() || fallbackTakenOn || undefined;
  const isPrivate = formData.get("isPrivate") === "on";

  const { media, captions } = splitUploads(readFiles(formData, "files"));
  const inputs: MediaInput[] = [];
  for (let i = 0; i < media.length; i++) {
    const file = await storeUpload(folder, media[i]);
    const captionFile = captions[i]; // pair .vtt with the i-th video
    inputs.push({
      file,
      altText: media.length > 1 ? `${altText} (${i + 1})` : altText,
      caption,
      takenOn,
      isPrivate,
      sortOrder: i,
      captionsKey: captionFile ? (await storeUpload(`${folder}/captions`, captionFile)).key : undefined,
    });
  }
  return inputs;
}

// ============================================================== profile

const profileSchema = z.object({
  displayName: z.string().trim().max(120).optional(),
  nickname: z.string().trim().max(120).optional(),
  bio: z.string().trim().max(2000).optional(),
  parentsMessage: z.string().trim().max(4000).optional(),
  familyLines: z.string().trim().optional(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/).optional().or(z.literal("")),
  birthWeightKg: z.string().optional(),
  birthHeightCm: z.string().optional(),
});

export async function saveProfile(formData: FormData) {
  await requireFamily();
  const db = assertDb();

  const parsed = profileSchema.safeParse({
    displayName: String(formData.get("displayName") ?? "") || undefined,
    nickname: String(formData.get("nickname") ?? "") || undefined,
    bio: String(formData.get("bio") ?? "") || undefined,
    parentsMessage: String(formData.get("parentsMessage") ?? "") || undefined,
    familyLines: String(formData.get("familyLines") ?? ""),
    birthDate: String(formData.get("birthDate") ?? ""),
    birthTime: String(formData.get("birthTime") ?? ""),
    birthWeightKg: String(formData.get("birthWeightKg") ?? ""),
    birthHeightCm: String(formData.get("birthHeightCm") ?? ""),
  });
  if (!parsed.success) throw new Error("তথ্যগুলো ঠিকমতো লিখুন।");

  const familyLines = (parsed.data.familyLines ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // Featured photo (optional new upload).
  let featuredMediaId: string | undefined;
  const [featuredFile] = readFiles(formData, "featured");
  if (featuredFile) {
    const [id] = await saveMediaRows(db, [
      {
        file: await storeUpload("profile", featuredFile),
        altText:
          String(formData.get("featuredAlt") ?? "").trim() ||
          "মেয়ের প্রিয় ছবি",
        isPrivate: false,
        sortOrder: 0,
      },
    ], {});
    featuredMediaId = id;
  }

  const values = {
    displayName: parsed.data.displayName ?? null,
    nickname: parsed.data.nickname ?? null,
    bio: parsed.data.bio ?? null,
    parentsMessage: parsed.data.parentsMessage ?? null,
    familyLines,
    birthDate: parsed.data.birthDate || null,
    birthTime: parsed.data.birthTime || null,
    birthWeightKg: parsed.data.birthWeightKg || null,
    birthHeightCm: parsed.data.birthHeightCm || null,
    ...(featuredMediaId ? { featuredMediaId } : {}),
    updatedAt: new Date(),
  };

  const [existing] = await db.select().from(s.childProfile).limit(1);
  if (existing) {
    await db.update(s.childProfile).set(values).where(eq(s.childProfile.id, existing.id));
  } else {
    await db.insert(s.childProfile).values({ ...values, id: crypto.randomUUID() });
  }

  REVALIDATE_ALL();
  redirect("/family?saved=profile");
}

// ============================================================= memories

export async function createMemory(formData: FormData) {
  await requireFamily();
  const db = assertDb();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("স্মৃতির শিরোনাম দিতে হবে।");

  const inputs = await collectMedia(formData, "memories", String(formData.get("occurredOn") ?? "") || null);

  const [memory] = await db
    .insert(s.memories)
    .values({
      title,
      story: String(formData.get("story") ?? "").trim() || null,
      occurredOn: String(formData.get("occurredOn") ?? "").trim() || null,
      type: (String(formData.get("type") ?? "mixed") as "photo" | "video" | "story" | "mixed") ?? "mixed",
      tags: String(formData.get("tags") ?? "")
        .split(/[,\n]/)
        .map((t) => t.trim())
        .filter(Boolean),
      isPrivate: formData.get("isPrivate") === "on",
      createdBy: (await requireFamily()).user.id,
    })
    .returning({ id: s.memories.id });

  if (memory && inputs.length) await saveMediaRows(db, inputs, { memoryId: memory.id });

  REVALIDATE_ALL();
  redirect("/family?saved=memory");
}

export async function deleteMemory(formData: FormData) {
  await requireFamily();
  const db = assertDb();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const mediaRows = await db.select().from(s.media).where(eq(s.media.memoryId, id));
  for (const m of mediaRows) {
    if (!m.storageKey.startsWith("local:")) {
      await deleteObject(m.storageKey).catch(() => {});
      if (m.captionsKey) await deleteObject(m.captionsKey).catch(() => {});
    }
    await db.delete(s.media).where(eq(s.media.id, m.id));
  }
  await db.delete(s.memories).where(eq(s.memories.id, id));

  REVALIDATE_ALL();
  redirect("/family?deleted=1");
}

// ============================================================ albums

export async function createAlbum(formData: FormData) {
  await requireFamily();
  const db = assertDb();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("অ্যালবামের নাম দিতে হবে।");

  const inputs = await collectMedia(formData, "albums");

  const [album] = await db
    .insert(s.albums)
    .values({
      title,
      description: String(formData.get("description") ?? "").trim() || null,
      eventName: String(formData.get("eventName") ?? "").trim() || null,
      ageBucket: (String(formData.get("ageBucket") ?? "unknown") as "0-6" | "6-12" | "1-3" | "3+" | "unknown") ?? "unknown",
      isPrivate: formData.get("isPrivate") === "on",
    })
    .returning({ id: s.albums.id });

  if (album && inputs.length) {
    await saveMediaRows(db, inputs, { albumId: album.id });
    // Use the first photo as cover.
    const [first] = await db
      .select()
      .from(s.media)
      .where(eq(s.media.albumId, album.id))
      .orderBy(asc(s.media.sortOrder))
      .limit(1);
    if (first) await db.update(s.albums).set({ coverMediaId: first.id }).where(eq(s.albums.id, album.id));
  }

  REVALIDATE_ALL();
  redirect("/family?saved=album");
}

// ========================================================= milestones

export async function createMilestone(formData: FormData) {
  await requireFamily();
  const db = assertDb();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("মুহূর্তের নাম দিতে হবে।");

  const inputs = await collectMedia(formData, "milestones", String(formData.get("occurredOn") ?? "") || null);

  const [ms] = await db
    .insert(s.milestones)
    .values({
      milestoneType:
        (String(formData.get("milestoneType") ?? "custom") as
          | "first_smile"
          | "first_crawl"
          | "first_steps"
          | "first_word"
          | "first_tooth"
          | "first_food"
          | "first_birthday"
          | "custom") ?? "custom",
      title,
      occurredOn: String(formData.get("occurredOn") ?? "").trim() || null,
      description: String(formData.get("description") ?? "").trim() || null,
      isPrivate: formData.get("isPrivate") === "on",
    })
    .returning({ id: s.milestones.id });

  if (ms && inputs.length) await saveMediaRows(db, inputs, { milestoneId: ms.id });

  REVALIDATE_ALL();
  redirect("/family?saved=milestone");
}

export async function deleteMilestone(formData: FormData) {
  await requireFamily();
  const db = assertDb();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const mediaRows = await db.select().from(s.media).where(eq(s.media.milestoneId, id));
  for (const m of mediaRows) {
    if (!m.storageKey.startsWith("local:")) await deleteObject(m.storageKey).catch(() => {});
    await db.delete(s.media).where(eq(s.media.id, m.id));
  }
  await db.delete(s.milestones).where(eq(s.milestones.id, id));

  REVALIDATE_ALL();
  redirect("/family?deleted=1");
}

// ============================================================ letters

const letterSchema = z.object({
  title: z.string().trim().min(1, "চিঠির শিরোনাম দিতে হবে।"),
  authorName: z.string().trim().min(1, "লেখকের নাম দিতে হবে।"),
  relationship: z.string().trim().optional(),
  body: z.string().trim().min(1, "চিঠির লেখা দিতে হবে।"),
  writtenOn: z.string().optional(),
});

export async function createLetter(formData: FormData) {
  await requireFamily();
  const db = assertDb();

  const parsed = letterSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    authorName: String(formData.get("authorName") ?? ""),
    relationship: String(formData.get("relationship") ?? "") || undefined,
    body: String(formData.get("body") ?? ""),
    writtenOn: String(formData.get("writtenOn") ?? "") || undefined,
  });
  if (!parsed.success) throw new Error(parsed.error.errors[0]?.message ?? "তথ্যগুলো ঠিক করুন।");

  await db.insert(s.letters).values({
    ...parsed.data,
    writtenOn: parsed.data.writtenOn || null,
    isPrivate: formData.get("isPrivate") !== "off", // letters default to private
  });

  REVALIDATE_ALL();
  redirect("/family?saved=letter");
}

export async function deleteLetter(formData: FormData) {
  await requireFamily();
  const db = assertDb();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await db.delete(s.letters).where(eq(s.letters.id, id));
  REVALIDATE_ALL();
  redirect("/family?deleted=1");
}

// ========================================================== favorites

export async function createFavorite(formData: FormData) {
  await requireFamily();
  const db = assertDb();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("নাম দিতে হবে।");

  await db.insert(s.favorites).values({
    category: (String(formData.get("category") ?? "other") as "toy" | "food" | "song" | "cartoon" | "book" | "other") ?? "other",
    name,
    note: String(formData.get("note") ?? "").trim() || null,
    sinceOn: String(formData.get("sinceOn") ?? "").trim() || null,
    isCurrent: formData.get("isCurrent") !== "off",
  });

  REVALIDATE_ALL();
  redirect("/family?saved=favorite");
}

export async function toggleFavorite(formData: FormData) {
  await requireFamily();
  const db = assertDb();
  const id = String(formData.get("id") ?? "");
  const current = formData.get("current") === "true";
  if (!id) return;
  await db.update(s.favorites).set({ isCurrent: !current }).where(eq(s.favorites.id, id));
  REVALIDATE_ALL();
  redirect("/family?saved=favorite");
}

export async function deleteFavorite(formData: FormData) {
  await requireFamily();
  const db = assertDb();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await db.delete(s.favorites).where(eq(s.favorites.id, id));
  REVALIDATE_ALL();
  redirect("/family?deleted=1");
}

// ============================================================ growth

export async function createGrowthEntry(formData: FormData) {
  await requireFamily();
  const db = assertDb();

  const measuredOn = String(formData.get("measuredOn") ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(measuredOn)) throw new Error("তারিখ দিতে হবে।");

  await db.insert(s.growthEntries).values({
    measuredOn,
    heightCm: String(formData.get("heightCm") ?? "").trim() || null,
    weightKg: String(formData.get("weightKg") ?? "").trim() || null,
    headCircumferenceCm: String(formData.get("headCircumferenceCm") ?? "").trim() || null,
    note: String(formData.get("note") ?? "").trim() || null,
  });

  revalidatePath("/growth");
  REVALIDATE_ALL();
  redirect("/family?saved=growth");
}

export async function deleteGrowthEntry(formData: FormData) {
  await requireFamily();
  const db = assertDb();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await db.delete(s.growthEntries).where(eq(s.growthEntries.id, id));
  revalidatePath("/growth");
  REVALIDATE_ALL();
  redirect("/family?deleted=1");
}

// ============================================================== users

const userSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8, "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।"),
  role: z.enum(["parent", "family", "viewer"]),
});

export async function createUser(formData: FormData) {
  const session = await requireFamily();
  if (session.user.role !== "parent") throw new Error("শুধু বাবা–মা সদস্য যোগ করতে পারেন।");
  const db = assertDb();

  const parsed = userSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    role: String(formData.get("role") ?? "family"),
  });
  if (!parsed.success) throw new Error(parsed.error.errors[0]?.message ?? "তথ্যগুলো ঠিক করুন।");

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await db.insert(s.users).values({
    name: parsed.data.name,
    email: parsed.data.email,
    passwordHash,
    role: parsed.data.role,
  });

  redirect("/family/users?saved=1");
}

export async function resetUserPassword(formData: FormData) {
  const session = await requireFamily();
  if (session.user.role !== "parent") throw new Error("অনুমতি নেই।");
  const db = assertDb();

  const id = String(formData.get("id") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!id || password.length < 8) return;

  const passwordHash = await bcrypt.hash(password, 10);
  await db.update(s.users).set({ passwordHash }).where(and(eq(s.users.id, id)));
  redirect("/family/users?saved=1");
}

export async function deleteUser(formData: FormData) {
  const session = await requireFamily();
  if (session.user.role !== "parent") throw new Error("অনুমতি নেই।");
  const db = assertDb();
  const id = String(formData.get("id") ?? "");
  if (!id || id === session.user.id) return; // never delete yourself
  await db.delete(s.users).where(eq(s.users.id, id));
  redirect("/family/users?deleted=1");
}

export type { UploadedFile };
