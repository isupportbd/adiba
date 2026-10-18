/**
 * ================================================================== *
 *  নমুনা ডেটা / SAMPLE DATA  —  সবকিছু পরিবর্তনযোগ্য!                *
 * ================================================================== *
 *
 * This file powers the site when there is no database yet (dev preview
 * with USE_SAMPLE_DATA=1, or before the first migration runs).
 *
 * ➤ To use your daughter's REAL details you have two easy options:
 *   1. Sign in → "পরিবার কক্ষ" (Family area) and edit everything in the UI. ✅
 *   2. Or edit the values below and re-run `npm run db:seed`.
 *
 * Sample photos are tiny SVG placeholders bundled in /public/images/sample.
 * Real uploads go to MinIO and replace them automatically.
 */
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

const img = (n: number, alt: string, extra?: Partial<MediaVM>): MediaVM => ({
  id: `sample-img-${n}`,
  kind: "image",
  src: `/images/sample/photo-${n}.svg`,
  alt,
  isPrivate: false,
  ...extra,
});

// ----------------------------------------------------------- profile

export const SAMPLE_PROFILE: ChildProfileVM = {
  // 🏷️ SAMPLE — replace with your daughter's real name & nickname.
  displayName: "আয়িশা রহমান",
  nickname: "মিষ্টি",
  bio: "আমাদের ছোট্ট মিষ্টি — হাসিখুশি ভরা, সব কিছুতেই আগ্রহী। সকালের আলো আর গোছা গানের মতো সে।",
  parentsMessage:
    "প্রিয় মিষ্টি,\nতোমার হাসিতেই আমাদের সারা জীবনের আলো। প্রতিটি দিন তোমাসঙ্গে কাটানো মুহূর্ত আমাদের সবচেয়ে দামি সম্পদ। এই খাতায় আমরা তোমার ছোট্ট ছোট্ট দিনগুলো সংরক্ষণ করছি — যেন বড় হয়ে তুমি নিজেই দেখতে পারো, তোমাকে কতটা ভালোবাসা হয়েছে।\n\nভালোবাসায়,\nমা ও বাবা",
  familyLines: [
    "মা — রুবিনা রহমান",
    "বাবা — তানভীর আহমেদ",
    "দাদি — শিরিন সুলতানা",
    "দাদা — আবদুল করিম",
    "খালা — নুসরাত জাহান",
  ],
  // 🔒 SAMPLE private details — only visible to signed-in family.
  birthDate: "2024-03-12",
  birthTime: "06:42",
  birthWeightKg: 3.2,
  birthHeightCm: 49.5,
  featured: {
    id: "sample-featured",
    kind: "image",
    src: "/images/placeholder.svg",
    alt: "মিষ্টির ছবির জায়গা — পরিবার কক্ষ থেকে প্রিয় ছবি যোগ করুন",
    isPrivate: false,
  },
  hasPrivateDetails: true,
};

// ------------------------------------------------------------- media

const M = {
  sun: img(1, "জানালা দিয়ে ঢুকে পড়া সকালের রোদে মিষ্টির মুখ"),
  stars: img(2, "রাতের আকাশের নিচে ঘুমপাড়ানো গান শুনছে মিষ্টি"),
  flowers: img(3, "বারান্দার ফুলের গাছের সামনে দাঁড়িয়ে আছে মিষ্টি"),
  moon: img(4, "চাঁদের আলোয় বিকেল কাটাচ্ছে মিষ্টি"),
  rainbow: img(5, "রংধনুর নিচে হাতে হাত ধরে হাঁটছে মা আর মিষ্টি"),
  hills: img(6, "সবুজ পাহাড়ের সামনে প্রথম ভ্রমণের ছবি"),
  video1: {
    id: "sample-video-1",
    kind: "video" as const,
    src: "/images/sample/video-poster.svg",
    alt: "নমুনা ভিডিও — মিষ্টির প্রথম কথা বলার মুহূর্ত",
    isPrivate: false,
    caption: "🎬 নমুনা ভিডিও — পরিবার কক্ষে আসল ভিডিও যোগ করলে এখানে চলবে",
  },
};

// ------------------------------------------------------------ memories

export const SAMPLE_MEMORIES: MemoryVM[] = [
  {
    id: "sample-memory-1",
    title: "প্রথম বর্ষার ভেজা বিকেল",
    story:
      "বৃষ্টির প্রথম ফোঁটা দেখে মিষ্টি এত খুশি হয়েছিল যে জানালার কাছে এক ঘণ্টা অপেক্ষা করেছিল। শেষে বারান্দায় নিয়ে গেলাম — হাত পেতে বৃষ্টি ধরতে চেষ্টা করে, আর হেসে হেসে ভেজে গেছে।",
    occurredOn: "2024-07-23",
    type: "mixed",
    tags: ["বর্ষা", "বাড়ি", "হাসি"],
    isPrivate: false,
    media: [M.rainbow, M.flowers],
  },
  {
    id: "sample-memory-2",
    title: "দাদার কোলে বিকেলের গল্প",
    story:
      "দাদা রোজ বিকেলে ছোট্ট ছোট্ট গল্প বলেন। আজকের গল্পটা ছিল একটা কোমল খরগোশ আর তার বোনের — মিষ্টি শুনতে শুনতে চোখ বুজে ঘুমিয়ে পড়েছে।",
    occurredOn: "2024-06-11",
    type: "story",
    tags: ["দাদা", "গল্প", "বিকেল"],
    isPrivate: false,
    media: [M.moon],
  },
  {
    id: "sample-memory-3",
    title: "সকালের রোদ আর প্রথম চলা",
    story:
      "সকালের রোদ ঢুকে পড়েছিল ঘরে। সেই আলোর মধ্যে মিষ্টি প্রথমবার একটু একটু হেঁটেছে — তিনটে পা পা, তারপর বাবার বুকে আটকে গেছে।",
    occurredOn: "2024-11-05",
    type: "mixed",
    tags: ["প্রথম পদক্ষেপ", "সকাল"],
    isPrivate: false,
    media: [M.sun, M.video1, M.stars],
  },
  {
    id: "sample-memory-4",
    title: "গোছা গানের সঙ্গে ঘুম",
    story: "প্রতি রাতে মা যে গানটা গায়, সেটাই এখন মিষ্টির সবচেয়ে প্রিয়।",
    occurredOn: "2025-01-18",
    type: "video",
    tags: ["গান", "ঘুম"],
    isPrivate: true, // 🔒 family-only example
    media: [M.stars],
  },
  {
    id: "sample-memory-5",
    title: "প্রথম ভ্রমণ — সবুজ পাহাড়ের পাদে",
    story:
      "প্রথমবার বাড়ি থেকে দূরে গেলাম। গাড়িতে সারাপথ মিষ্টি জানালার বাইরে তাকিয়ে ছিল, আর পাহাড় দেখে চিৎকার করে হাসেছিল।",
    occurredOn: "2025-02-09",
    type: "mixed",
    tags: ["ভ্রমণ", "পাহাড়"],
    isPrivate: false,
    media: [M.hills, M.flowers],
  },
  {
    id: "sample-memory-6",
    title: "জন্মদিনের প্রথম মোমবাতি",
    story:
      "এক বছর পূর্ণ! ছোট্ট কেক, ছোট্ট মোমবাতি, আর তার চেয়েও ছোট্ট হাত দিয়ে মোমবাতি নেভানোর চেষ্টা।",
    occurredOn: "2025-03-12",
    type: "photo",
    tags: ["জন্মদিন", "উৎসব"],
    isPrivate: false,
    media: [M.rainbow, M.moon, M.sun],
  },
];

// --------------------------------------------------------- milestones

export const SAMPLE_MILESTONES: MilestoneVM[] = [
  {
    id: "sample-ms-1",
    milestoneType: "first_smile",
    title: "প্রথম হাসি",
    occurredOn: "2024-04-20",
    description: "সকালের খাবারের সময় হঠাৎ একটা মনোরম হাসি — পুরো ঘর আলোকিত হয়ে গেছিল।",
    isPrivate: false,
    media: [M.sun],
  },
  {
    id: "sample-ms-2",
    milestoneType: "first_word",
    title: "প্রথম কথা — ‘মা’",
    occurredOn: "2024-08-14",
    description: "রাতে ঘুমের আগে প্রথমবার স্পষ্ট করে বলেছিল ‘মা’। মায়ের চোখে তখন কতটা আনন্দ!",
    isPrivate: false,
    media: [M.stars],
  },
  {
    id: "sample-ms-3",
    milestoneType: "first_crawl",
    title: "প্রথম ঘোরা",
    occurredOn: "2024-09-30",
    description: "মেঝেতে হাত-গোড়ালি টেনে প্রথমবার ঘরের এক প্রান্ত থেকে অন্য প্রান্ত পর্যন্ত।",
    isPrivate: false,
    media: [M.flowers],
  },
  {
    id: "sample-ms-4",
    milestoneType: "first_steps",
    title: "প্রথম পদক্ষেপ",
    occurredOn: "2024-11-05",
    description: "তিনটে পা পা — তারপর বাবার বুকে। ভিডিওটা এখনও সবচেয়ে বেশি দেখা হয় আমাদের।",
    isPrivate: false,
    media: [M.video1],
  },
  {
    id: "sample-ms-5",
    milestoneType: "first_tooth",
    title: "প্রথম দাঁত",
    occurredOn: "2025-01-08",
    description: "নিচের চোয়ালে ছোট্ট সাদা একটা দাঁত — কেউ ধরতে পারেনি, সে নিজেই ধরিয়ে দিয়েছিল।",
    isPrivate: false,
    media: [M.moon],
  },
  {
    id: "sample-ms-6",
    milestoneType: "first_birthday",
    title: "প্রথম জন্মদিন",
    occurredOn: "2025-03-12",
    description: "ঘর জুড়ে ফুল আর বেলুন, ছোট্ট কেক, আর হাতে কলার পিঠে খাওয়ানোর আনন্দ।",
    isPrivate: false,
    media: [M.rainbow, M.sun],
  },
];

// ------------------------------------------------------------ albums

const album = (
  id: string,
  title: string,
  eventName: string,
  ageBucket: AlbumVM["ageBucket"],
  mediaIds: string[],
  cover: MediaVM,
): AlbumDetailVM => {
  const all = [M.sun, M.stars, M.flowers, M.moon, M.rainbow, M.hills, M.video1];
  const media = mediaIds
    .map((mid, i) => {
      const found = all.find((m) => m.id === mid) ?? all[i % all.length];
      return { ...found, id: `${id}-${i}`, takenOn: undefined };
    });
  return {
    id,
    title,
    eventName,
    ageBucket,
    description: undefined,
    isPrivate: false,
    mediaCount: media.length,
    cover,
    media,
  };
};

export const SAMPLE_ALBUMS: AlbumDetailVM[] = [
  album("sample-album-1", "জন্মের প্রথম সপ্তাহ", "জন্ম", "0-6", ["sample-img-1", "sample-img-4"], M.moon),
  album("sample-album-2", "ছোট্ট বাইরের বিশ্ব", "প্রথম ভ্রমণ", "0-6", ["sample-img-3", "sample-img-6"], M.flowers),
  album("sample-album-3", "এক বছরের আনন্দ", "জন্মদিন", "1-3", ["sample-img-5", "sample-img-1", "sample-video-1"], M.rainbow),
  album("sample-album-4", "বর্ষার গল্প", "বাড়ি", "0-6", ["sample-img-5", "sample-img-2"], M.rainbow),
  album("sample-album-5", "হাঁটা শেখার দিনগুলো", "বাড়ি", "6-12", ["sample-img-6", "sample-img-3"], M.hills),
];

// ------------------------------------------------------------- letters

export const SAMPLE_LETTERS: LetterVM[] = [
  {
    id: "sample-letter-1",
    title: "মায়ের চিঠি — তোমার প্রথম বছরে",
    authorName: "রুবিনা রহমান",
    relationship: "মা",
    body: "প্রিয় মিষ্টি,\n\nআজ তুমি এক বছরের হয়ে গেছ। মনে আছে, তোমাকে প্রথমবার কোলে নেওয়ার সেই মুহূর্ত — তোমার হাতটা কত ছোট ছিল, আর আমার হৃদয়টা কত বড় হয়ে গিয়েছিল।\n\nতুমি শুধু আমাদের সন্তান নও, তুমি আমাদের সবচেয়ে ভালো বন্ধু। তোমার প্রতিটি হাসিতে আমি ভবিষ্যতের স্বপ্ন দেখি। যেদিন তুমি এই চিঠিটা পড়বে, সেদিন জেনে রেখো — তুমি জন্মের আগে থেকেই আমাদের সবচেয়ে প্রিয় মানুষ ছিলে।\n\nভালোবাসার সঙ্গে,\nতোমার মা",
    writtenOn: "2025-03-12",
    isPrivate: true,
  },
  {
    id: "sample-letter-2",
    title: "বাবার চিঠি — প্রথম পদক্ষেপের দিনে",
    authorName: "তানভীর আহমেদ",
    relationship: "বাবা",
    body: "প্রিয় মিষ্টি,\n\nআজ তুমি হেঁটেছিলে — মাত্র তিন পা পা, কিন্তু আমার কাছে সেটা ইতিহাসের সবচেয়ে সুন্দর যাত্রা। তোমার পা দুটো কাঁপছিল, আর তুমি হাসছিলে সেই ভয়ের হাসি।\n\nজীবনে তুমি অনেক বাট হেঁটে যাবে। প্রতিটি বাটে পড়বে, আবার উঠে দাঁড়াবে। কিন্তু মনে রেখো — তোমার পিছনে আমরা সবসময় আছি, হাত পেতে।\n\nভালোবাসা,\nতোমার বাবা",
    writtenOn: "2024-11-05",
    isPrivate: true,
  },
  {
    id: "sample-letter-3",
    title: "দাদির আশীর্বাদ",
    authorName: "শিরিন সুলতানা",
    relationship: "দাদি",
    body: "আল্লাহ তোমাকে সুস্থ–সুন্দর রাখুক, জ্ঞানের আলো দিয়ে তোমার পথ আলোকিত করুক। যেদিন তুমি এই চিঠিটা পড়বে, সেদিন জেনে রেখো — তোমার দাদি তোমাকে প্রতিদিন মনে মনে ভালোবাসেন।",
    writtenOn: "2024-03-19",
    isPrivate: true,
  },
];

// ---------------------------------------------------------- favorites

export const SAMPLE_FAVORITES: FavoriteVM[] = [
  { id: "sample-fav-1", category: "toy", name: "নরম খরগোশ রুফি", note: "ঘুমের আগে অবশ্যই লাগবে", sinceOn: "2024-05-01", isCurrent: true },
  { id: "sample-fav-2", category: "toy", name: "সবুজ গাড়ি", note: "টেনে টেনে ঘর ঘুরে বেড়ায়", sinceOn: "2024-12-10", isCurrent: true },
  { id: "sample-fav-3", category: "food", name: "কলার পিঠে", note: "একটু খেলেই চোখ ঝলমলে", sinceOn: "2024-10-02", isCurrent: true },
  { id: "sample-fav-4", category: "food", name: "ডিমের ভুর্জি", note: "সকালের নাস্তার প্রিয়", sinceOn: "2025-01-15", isCurrent: true },
  { id: "sample-fav-5", category: "song", name: "‘চাঁদ মামা’", note: "শুনলেই ঘুম আসে", sinceOn: "2024-04-01", isCurrent: true },
  { id: "sample-fav-6", category: "song", name: "‘আমি কি সত্যিই ছোট্ট?’", note: "সকালে হাসিতে গাই", sinceOn: "2025-02-20", isCurrent: true },
  { id: "sample-fav-7", category: "cartoon", name: "মিকি মাউস", note: "শুরু হলেই নাচতে থাকে", sinceOn: "2025-01-05", isCurrent: true },
  { id: "sample-fav-8", category: "cartoon", name: "ছোট্ট হাঁড়িচাঁদ", note: "আগে ভালো লাগত, এখন কম", sinceOn: "2024-06-01", isCurrent: false },
  { id: "sample-fav-9", category: "book", name: "‘টুকিটাকি কবিতা’", note: "রাতে পড়ে শোনায় বাবা", sinceOn: "2024-09-10", isCurrent: true },
];

// ------------------------------------------------------------- growth

export const SAMPLE_GROWTH: GrowthVM[] = [
  { id: "sample-growth-1", measuredOn: "2024-03-12", heightCm: 49.5, weightKg: 3.2, note: "জন্মের দিন" },
  { id: "sample-growth-2", measuredOn: "2024-05-12", heightCm: 56.0, weightKg: 5.4 },
  { id: "sample-growth-3", measuredOn: "2024-07-12", heightCm: 61.5, weightKg: 7.1, headCircumferenceCm: 41.0 },
  { id: "sample-growth-4", measuredOn: "2024-09-12", heightCm: 66.0, weightKg: 8.3, headCircumferenceCm: 42.5 },
  { id: "sample-growth-5", measuredOn: "2024-11-12", heightCm: 70.0, weightKg: 9.2, note: "সারাদিন হাঁটাহাঁটি!" },
  { id: "sample-growth-6", measuredOn: "2025-01-12", heightCm: 73.5, weightKg: 9.8, headCircumferenceCm: 44.5 },
  { id: "sample-growth-7", measuredOn: "2025-03-12", heightCm: 76.5, weightKg: 10.4, note: "এক বছর পূর্ণ" },
];

// --------------------------------------------------------------- users

export const SAMPLE_USERS: UserVM[] = [
  { id: "sample-user-1", name: "রুবিনা রহমান (মা)", email: "family@example.com", role: "parent" },
  { id: "sample-user-2", name: "তানভীর আহমেদ (বাবা)", email: "baba@example.com", role: "parent" },
  { id: "sample-user-3", name: "দাদি", email: "dadi@example.com", role: "viewer" },
];
