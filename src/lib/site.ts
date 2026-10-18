/** Site-wide constants. Change NEXT_PUBLIC_SITE_NAME in .env to rebrand. */

export const SITE = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "আদিবার স্মৃতিখানা",
  tagline: "ভালোবাসায় জড়িয়ে রাখা ছোট্ট একটি স্মৃতির খাতা",
  privateNote: "এটি একটি ব্যক্তিগত পারিবারিক ওয়েবসাইট। সার্চ ইঞ্জিনে ইনডেক্স করা হয় না।",
} as const;

/** Nav shared by header + footer. */
export const NAV = [
  { href: "/", labelKey: "nav.home" },
  { href: "/about", labelKey: "nav.about" },
  { href: "/timeline", labelKey: "nav.timeline" },
  { href: "/milestones", labelKey: "nav.milestones" },
  { href: "/gallery", labelKey: "nav.gallery" },
  { href: "/growth", labelKey: "nav.growth" },
  { href: "/letters", labelKey: "nav.letters" },
  { href: "/favorites", labelKey: "nav.favorites" },
] as const;
