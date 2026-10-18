#!/usr/bin/env node
/**
 * ================================================================== *
 *  নমুনা ডেটা / SAMPLE DATA SEED — idempotent & dependency-light     *
 * ================================================================== *
 *
 * Seeds PostgreSQL with clearly-labeled sample content that mirrors
 * src/lib/sample-data.ts. Uses only `pg` + `bcryptjs` (already
 * installed), so it runs both in development and inside the Docker
 * container:
 *
 *   Local dev:      npm run db:seed
 *   In the container: docker compose exec app node scripts/seed.mjs
 *
 * Configure via environment (see .env.example):
 *   SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD  → family login account
 *   SEED_CHILD_NAME / SEED_CHILD_NICKNAME   → her name & nickname
 *
 * Never overwrites existing rows — safe to run repeatedly.
 */
import crypto from "node:crypto";
import pg from "pg";
import bcrypt from "bcryptjs";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("✖ DATABASE_URL is not set. Copy .env.example → .env.local first.");
  process.exit(1);
}

const ADMIN_EMAIL = (process.env.SEED_ADMIN_EMAIL || "family@example.com").toLowerCase();
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "change-me-before-going-live";
const CHILD_NAME = process.env.SEED_CHILD_NAME || "আয়িশা রহমান";
const CHILD_NICKNAME = process.env.SEED_CHILD_NICKNAME || "মিষ্টি";

const id = () => crypto.randomUUID();
const img = (n, alt) => ({
  kind: "image",
  key: `local:/images/sample/photo-${n}.svg`,
  alt,
});
const VIDEO = {
  kind: "video",
  key: "local:/images/sample/video-poster.svg",
  alt: "নমুনা ভিডিও — প্রথম কথা বলার মুহূর্ত",
  caption: "🎬 নমুনা ভিডিও — পরিবার কক্ষে আসল ভিডিও যোগ করলে এখানে চলবে",
};

const MEDIA = {
  sun: img(1, "জানালা দিয়ে ঢুকে পড়া সকালের রোদে মিষ্টির মুখ"),
  stars: img(2, "রাতের আকাশের নিচে ঘুমপাড়ানো গান শুনছে মিষ্টি"),
  flowers: img(3, "বারান্দার ফুলের গাছের সামনে দাঁড়িয়ে আছে মিষ্টি"),
  moon: img(4, "চাঁদের আলোয় বিকেল কাটাচ্ছে মিষ্টি"),
  rainbow: img(5, "রংধনুর নিচে হাতে হাত ধরে হাঁটছে মা আর মিষ্টি"),
  hills: img(6, "সবুজ পাহাড়ের সামনে প্রথম ভ্রমণের ছবি"),
  video: VIDEO,
};

const client = new pg.Client({ connectionString: url });

async function insertMedia({ memoryId, albumId, milestoneId, list }) {
  let order = 0;
  const ids = [];
  for (const m of list) {
    const mediaId = id();
    await client.query(
      `INSERT INTO media (id, kind, storage_key, alt_text, caption, is_private, sort_order, memory_id, album_id, milestone_id)
       VALUES ($1,$2,$3,$4,$5,false,$6,$7,$8,$9)`,
      [mediaId, m.kind, m.key, m.alt, m.caption ?? null, order++, memoryId ?? null, albumId ?? null, milestoneId ?? null],
    );
    ids.push(mediaId);
  }
  return ids;
}

async function main() {
  await client.connect();
  try {
    // --- account ---------------------------------------------------
    const existing = await client.query("SELECT id FROM users WHERE email = $1", [ADMIN_EMAIL]);
    if (existing.rowCount === 0) {
      const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
      await client.query(
        `INSERT INTO users (id, name, email, password_hash, role) VALUES ($1,$2,$3,$4,'parent')`,
        [id(), "পরিবার (নমুনা)", ADMIN_EMAIL, passwordHash],
      );
      console.log(`✓ family account: ${ADMIN_EMAIL}`);
    } else {
      console.log(`• family account already exists: ${ADMIN_EMAIL}`);
    }

    // --- profile ---------------------------------------------------
    const profile = await client.query("SELECT id FROM child_profile LIMIT 1");
    if (profile.rowCount === 0) {
      const featuredId = id();
      await client.query(
        `INSERT INTO media (id, kind, storage_key, alt_text, is_private, sort_order)
         VALUES ($1,'image','local:/images/placeholder.svg',$2,false,0)`,
        [featuredId, "ছবির জায়গা — পরিবার কক্ষ থেকে প্রিয় ছবি যোগ করুন"],
      );
      await client.query(
        `INSERT INTO child_profile (id, display_name, nickname, bio, parents_message, family_lines,
                                    birth_date, birth_time, birth_weight_kg, birth_height_cm, featured_media_id)
         VALUES ($1,$2,$3,$4,$5,$6,'2024-03-12','06:42',3.2,49.5,$7)`,
        [
          id(),
          CHILD_NAME,
          CHILD_NICKNAME,
          "আমাদের ছোট্ট মিষ্টি — হাসিখুশি ভরা, সব কিছুতেই আগ্রহী। সকালের আলো আর গোছা গানের মতো সে।",
          "প্রিয় মিষ্টি,\nতোমার হাসিতেই আমাদের সারা জীবনের আলো। প্রতিটি দিন তোমাসঙ্গে কাটানো মুহূর্ত আমাদের সবচেয়ে দামি সম্পদ।\n\nভালোবাসায়,\nমা ও বাবা",
          ["মা — রুবিনা রহমান", "বাবা — তানভীর আহমেদ", "দাদি — শিরিন সুলতানা", "দাদা — আবদুল করিম"],
          featuredId,
        ],
      );
      console.log("✓ child profile");
    } else {
      console.log("• child profile already exists");
    }

    // --- memories --------------------------------------------------
    if ((await client.query("SELECT count(*) FROM memories")).rows[0].count === "0") {
      const memories = [
        {
          title: "প্রথম বর্ষার ভেজা বিকেল",
          story:
            "বৃষ্টির প্রথম ফোঁটা দেখে মিষ্টি এত খুশি হয়েছিল যে জানালার কাছে এক ঘণ্টা অপেক্ষা করেছিল। শেষে বারান্দায় নিয়ে গেলাম — হাত পেতে বৃষ্টি ধরতে চেষ্টা করে, আর হেসে হেসে ভেজে গেছে।",
          occurredOn: "2024-07-23",
          tags: ["বর্ষা", "বাড়ি", "হাসি"],
          media: [MEDIA.rainbow, MEDIA.flowers],
        },
        {
          title: "দাদার কোলে বিকেলের গল্প",
          story:
            "দাদা রোজ বিকেলে ছোট্ট ছোট্ট গল্প বলেন। আজকের গল্পটা ছিল একটা কোমল খরগোশ আর তার বোনের — মিষ্টি শুনতে শুনতে চোখ বুজে ঘুমিয়ে পড়েছে।",
          occurredOn: "2024-06-11",
          tags: ["দাদা", "গল্প", "বিকেল"],
          media: [MEDIA.moon],
        },
        {
          title: "সকালের রোদ আর প্রথম চলা",
          story:
            "সকালের রোদ ঢুকে পড়েছিল ঘরে। সেই আলোর মধ্যে মিষ্টি প্রথমবার একটু একটু হেঁটেছে — তিনটে পা পা, তারপর বাবার বুকে আটকে গেছে।",
          occurredOn: "2024-11-05",
          tags: ["প্রথম পদক্ষেপ", "সকাল"],
          media: [MEDIA.sun, MEDIA.video, MEDIA.stars],
        },
        {
          title: "গোছা গানের সঙ্গে ঘুম",
          story: "প্রতি রাতে মা যে গানটা গায়, সেটাই এখন মিষ্টির সবচেয়ে প্রিয়।",
          occurredOn: "2025-01-18",
          tags: ["গান", "ঘুম"],
          isPrivate: true,
          media: [MEDIA.stars],
        },
        {
          title: "প্রথম ভ্রমণ — সবুজ পাহাড়ের পাদে",
          story:
            "প্রথমবার বাড়ি থেকে দূরে গেলাম। গাড়িতে সারাপথ মিষ্টি জানালার বাইরে তাকিয়ে ছিল, আর পাহাড় দেখে চিৎকার করে হাসেছিল।",
          occurredOn: "2025-02-09",
          tags: ["ভ্রমণ", "পাহাড়"],
          media: [MEDIA.hills, MEDIA.flowers],
        },
        {
          title: "জন্মদিনের প্রথম মোমবাতি",
          story:
            "এক বছর পূর্ণ! ছোট্ট কেক, ছোট্ট মোমবাতি, আর তার চেয়েও ছোট্ট হাত দিয়ে মোমবাতি নেভানোর চেষ্টা।",
          occurredOn: "2025-03-12",
          tags: ["জন্মদিন", "উৎসব"],
          media: [MEDIA.rainbow, MEDIA.moon, MEDIA.sun],
        },
      ];
      for (const m of memories) {
        const memoryId = id();
        await client.query(
          `INSERT INTO memories (id, title, story, occurred_on, type, tags, is_private, created_by)
           VALUES ($1,$2,$3,$4,'mixed',$5,$6,NULL)`,
          [memoryId, m.title, m.story, m.occurredOn, m.tags, m.isPrivate ?? false],
        );
        await insertMedia({ memoryId, list: m.media });
      }
      console.log(`✓ ${memories.length} memories`);
    } else {
      console.log("• memories already exist");
    }

    // --- milestones ------------------------------------------------
    if ((await client.query("SELECT count(*) FROM milestones")).rows[0].count === "0") {
      const milestones = [
        ["first_smile", "প্রথম হাসি", "2024-04-20", "সকালের খাবারের সময় হঠাৎ একটা মনোরম হাসি — পুরো ঘর আলোকিত হয়ে গিয়েছিল।", [MEDIA.sun]],
        ["first_word", "প্রথম কথা — ‘মা’", "2024-08-14", "রাতে ঘুমের আগে প্রথমবার স্পষ্ট করে বলেছিল ‘মা’।", [MEDIA.stars]],
        ["first_crawl", "প্রথম ঘোরা", "2024-09-30", "মেঝেতে হাত-গোড়ালি টেনে প্রথমবার ঘরের এক প্রান্ত থেকে অন্য প্রান্ত পর্যন্ত।", [MEDIA.flowers]],
        ["first_steps", "প্রথম পদক্ষেপ", "2024-11-05", "তিনটে পা পা — তারপর বাবার বুকে।", [MEDIA.video]],
        ["first_tooth", "প্রথম দাঁত", "2025-01-08", "নিচের চোয়ালে ছোট্ট সাদা একটা দাঁত।", [MEDIA.moon]],
        ["first_birthday", "প্রথম জন্মদিন", "2025-03-12", "ঘর জুড়ে ফুল আর বেলুন, ছোট্ট কেক, আর হাতে কলার পিঠে খাওয়ানোর আনন্দ।", [MEDIA.rainbow, MEDIA.sun]],
      ];
      for (const [type, title, date, description, media] of milestones) {
        const msId = id();
        await client.query(
          `INSERT INTO milestones (id, milestone_type, title, occurred_on, description)
           VALUES ($1,$2,$3,$4,$5)`,
          [msId, type, title, date, description],
        );
        await insertMedia({ milestoneId: msId, list: media });
      }
      console.log(`✓ ${milestones.length} milestones`);
    } else {
      console.log("• milestones already exist");
    }

    // --- albums ----------------------------------------------------
    if ((await client.query("SELECT count(*) FROM albums")).rows[0].count === "0") {
      const albums = [
        ["জন্মের প্রথম সপ্তাহ", "জন্ম", "0-6", [MEDIA.moon, MEDIA.sun]],
        ["ছোট্ট বাইরের বিশ্ব", "প্রথম ভ্রমণ", "0-6", [MEDIA.flowers, MEDIA.hills]],
        ["এক বছরের আনন্দ", "জন্মদিন", "1-3", [MEDIA.rainbow, MEDIA.sun, MEDIA.video]],
        ["বর্ষার গল্প", "বাড়ি", "0-6", [MEDIA.rainbow, MEDIA.stars]],
        ["হাঁটা শেখার দিনগুলো", "বাড়ি", "6-12", [MEDIA.hills, MEDIA.flowers]],
      ];
      for (const [title, eventName, bucket, media] of albums) {
        const albumId = id();
        const ids = await insertMedia({ albumId, list: media });
        await client.query(
          `INSERT INTO albums (id, title, event_name, age_bucket, cover_media_id)
           VALUES ($1,$2,$3,$4,$5)`,
          [albumId, title, eventName, bucket, ids[0] ?? null],
        );
      }
      console.log(`✓ ${albums.length} albums`);
    } else {
      console.log("• albums already exist");
    }

    // --- letters ---------------------------------------------------
    if ((await client.query("SELECT count(*) FROM letters")).rows[0].count === "0") {
      const letters = [
        [
          "মায়ের চিঠি — তোমার প্রথম বছরে",
          "রুবিনা রহমান",
          "মা",
          "2025-03-12",
          "প্রিয় মিষ্টি,\n\nআজ তুমি এক বছরের হয়ে গেছ। মনে আছে, তোমাকে প্রথমবার কোলে নেওয়ার সেই মুহূর্ত — তোমার হাতটা কত ছোট ছিল, আর আমার হৃদয়টা কত বড় হয়ে গিয়েছিল।\n\nযেদিন তুমি এই চিঠিটা পড়বে, সেদিন জেনে রেখো — তুমি জন্মের আগে থেকেই আমাদের সবচেয়ে প্রিয় মানুষ ছিলে।\n\nভালোবাসার সঙ্গে,\nতোমার মা",
        ],
        [
          "বাবার চিঠি — প্রথম পদক্ষেপের দিনে",
          "তানভীর আহমেদ",
          "বাবা",
          "2024-11-05",
          "প্রিয় মিষ্টি,\n\nআজ তুমি হেঁটেছিলে — মাত্র তিন পা পা, কিন্তু আমার কাছে সেটা ইতিহাসের সবচেয়ে সুন্দর যাত্রা।\n\nজীবনে তুমি অনেক বাট হেঁটে যাবে। প্রতিটি বাটে পড়বে, আবার উঠে দাঁড়াবে। কিন্তু মনে রেখো — তোমার পিছনে আমরা সবসময় আছি।\n\nভালোবাসা,\nতোমার বাবা",
        ],
        [
          "দাদির আশীর্বাদ",
          "শিরিন সুলতানা",
          "দাদি",
          "2024-03-19",
          "আল্লাহ তোমাকে সুস্থ–সুন্দর রাখুক, জ্ঞানের আলো দিয়ে তোমার পথ আলোকিত করুক। যেদিন তুমি এই চিঠিটা পড়বে, সেদিন জেনে রেখো — তোমার দাদি তোমাকে প্রতিদিন মনে মনে ভালোবাসেন।",
        ],
      ];
      for (const [title, author, relationship, date, body] of letters) {
        await client.query(
          `INSERT INTO letters (id, title, author_name, relationship, body, written_on, is_private)
           VALUES ($1,$2,$3,$4,$5,$6,true)`,
          [id(), title, author, relationship, body, date],
        );
      }
      console.log(`✓ ${letters.length} letters (private)`);
    } else {
      console.log("• letters already exist");
    }

    // --- favorites -------------------------------------------------
    if ((await client.query("SELECT count(*) FROM favorites")).rows[0].count === "0") {
      const favorites = [
        ["toy", "নরম খরগোশ রুফি", "ঘুমের আগে অবশ্যই লাগবে", "2024-05-01", true],
        ["toy", "সবুজ গাড়ি", "টেনে টেনে ঘর ঘুরে বেড়ায়", "2024-12-10", true],
        ["food", "কলার পিঠে", "একটু খেলেই চোখ ঝলমলে", "2024-10-02", true],
        ["food", "ডিমের ভুর্জি", "সকালের নাস্তার প্রিয়", "2025-01-15", true],
        ["song", "‘চাঁদ মামা’", "শুনলেই ঘুম আসে", "2024-04-01", true],
        ["song", "‘আমি কি সত্যিই ছোট্ট?’", "সকালে হাসিতে গাই", "2025-02-20", true],
        ["cartoon", "মিকি মাউস", "শুরু হলেই নাচতে থাকে", "2025-01-05", true],
        ["cartoon", "ছোট্ট হাঁড়িচাঁদ", "আগে ভালো লাগত, এখন কম", "2024-06-01", false],
        ["book", "‘টুকিটাকি কবিতা’", "রাতে পড়ে শোনায় বাবা", "2024-09-10", true],
      ];
      for (const [category, name, note, sinceOn, isCurrent] of favorites) {
        await client.query(
          `INSERT INTO favorites (id, category, name, note, since_on, is_current) VALUES ($1,$2,$3,$4,$5,$6)`,
          [id(), category, name, note, sinceOn, isCurrent],
        );
      }
      console.log(`✓ ${favorites.length} favorites`);
    } else {
      console.log("• favorites already exist");
    }

    // --- growth ----------------------------------------------------
    if ((await client.query("SELECT count(*) FROM growth_entries")).rows[0].count === "0") {
      const growth = [
        ["2024-03-12", 49.5, 3.2, null, "জন্মের দিন"],
        ["2024-05-12", 56.0, 5.4, null, null],
        ["2024-07-12", 61.5, 7.1, 41.0, null],
        ["2024-09-12", 66.0, 8.3, 42.5, null],
        ["2024-11-12", 70.0, 9.2, null, "সারাদিন হাঁটাহাঁটি!"],
        ["2025-01-12", 73.5, 9.8, 44.5, null],
        ["2025-03-12", 76.5, 10.4, null, "এক বছর পূর্ণ"],
      ];
      for (const [date, height, weight, head, note] of growth) {
        await client.query(
          `INSERT INTO growth_entries (id, measured_on, height_cm, weight_kg, head_circumference_cm, note)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [id(), date, height, weight, head, note],
        );
      }
      console.log(`✓ ${growth.length} growth entries`);
    } else {
      console.log("• growth entries already exist");
    }

    console.log("\n🌸 Done! Sign in with:", ADMIN_EMAIL, "/", ADMIN_PASSWORD);
    if (ADMIN_PASSWORD === "change-me-before-going-live") {
      console.log("⚠️  Change SEED_ADMIN_PASSWORD before going live!");
    }
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("✖ seed failed:", err.message);
  process.exit(1);
});
