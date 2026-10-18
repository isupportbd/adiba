/**
 * View-model types.
 *
 * Components render from these shapes — never from raw database rows —
 * so the bundled sample data and the database can be swapped freely.
 */

export interface MediaVM {
  id: string;
  kind: "image" | "video" | "audio";
  /** Ready-to-use URL (bundled placeholder, or /api/media/** proxy). */
  src: string;
  /** WebVTT captions URL for videos, when uploaded. */
  captionsSrc?: string;
  alt: string;
  caption?: string;
  takenOn?: string;
  isPrivate: boolean;
  width?: number;
  height?: number;
  bytes?: number;
}

export interface MemoryVM {
  id: string;
  title: string;
  story?: string;
  occurredOn?: string;
  type: "photo" | "video" | "story" | "mixed";
  tags: string[];
  isPrivate: boolean;
  media: MediaVM[];
}

export interface AlbumVM {
  id: string;
  title: string;
  description?: string;
  eventName?: string;
  ageBucket: "0-6" | "6-12" | "1-3" | "3+" | "unknown";
  isPrivate: boolean;
  mediaCount: number;
  cover?: MediaVM;
}

export interface AlbumDetailVM extends AlbumVM {
  media: MediaVM[];
}

export interface MilestoneVM {
  id: string;
  milestoneType:
    | "first_smile"
    | "first_crawl"
    | "first_steps"
    | "first_word"
    | "first_tooth"
    | "first_food"
    | "first_birthday"
    | "custom";
  title: string;
  occurredOn?: string;
  description?: string;
  isPrivate: boolean;
  media: MediaVM[];
}

export interface LetterVM {
  id: string;
  title: string;
  authorName: string;
  relationship?: string;
  body: string;
  writtenOn?: string;
  isPrivate: boolean;
}

export interface FavoriteVM {
  id: string;
  category: "toy" | "food" | "song" | "cartoon" | "book" | "other";
  name: string;
  note?: string;
  sinceOn?: string;
  isCurrent: boolean;
}

export interface GrowthVM {
  id: string;
  measuredOn: string;
  heightCm?: number;
  weightKg?: number;
  headCircumferenceCm?: number;
  note?: string;
}

export interface ChildProfileVM {
  displayName?: string;
  nickname?: string;
  bio?: string;
  parentsMessage?: string;
  familyLines: string[];
  /** 🔒 private */
  birthDate?: string;
  /** 🔒 private */
  birthTime?: string;
  /** 🔒 private */
  birthWeightKg?: number;
  /** 🔒 private */
  birthHeightCm?: number;
  featured?: MediaVM;
  /** True when any private field has been filled in. */
  hasPrivateDetails: boolean;
}

export interface UserVM {
  id: string;
  name?: string;
  email: string;
  role: "parent" | "family" | "viewer";
}
