import { works as baseWorks } from "@/data/works";
import { getKV } from "@/lib/kv";
import type { Language, WorkCategory, WorkItem } from "@/types";

const WORKS_KEY = "promotion-site:works:v1";

export type ModerationState = "draft" | "review" | "published" | "archived";

export type ModeratedWork = WorkItem & {
  moderationState?: ModerationState;
  isHidden?: boolean;
  moderationNotes?: string;
};

declare global {
  var __promotionWorksMemory: ModeratedWork[] | undefined;
}

function normalizeModerationState(
  value: string | undefined,
  fallback: ModerationState
): ModerationState {
  return value === "draft" ||
    value === "review" ||
    value === "published" ||
    value === "archived"
    ? value
    : fallback;
}

function normalizeModerationNotes(value: string | undefined): string {
  return String(value || "").trim();
}

function normalizeWork(item: WorkItem | ModeratedWork): ModeratedWork {
  const fallbackState: ModerationState = item.isPublished ? "published" : "draft";
  const moderationState = normalizeModerationState(
    (item as ModeratedWork).moderationState,
    fallbackState
  );

  const isPublished = moderationState === "published";
  const isFeatured = isPublished ? Boolean(item.isFeatured) : false;
  const isHidden = isPublished ? Boolean((item as ModeratedWork).isHidden) : false;
  const moderationNotes = normalizeModerationNotes(
    (item as ModeratedWork).moderationNotes
  );

  return {
    ...item,
    tags: [...(item.tags || [])],
    seo: item.seo ? { ...item.seo } : undefined,
    translations: item.translations ? { ...item.translations } : undefined,
    isPublished,
    isFeatured,
    moderationState,
    isHidden,
    ...(moderationNotes ? { moderationNotes } : {}),
  };
}

function cloneBaseWorks(): ModeratedWork[] {
  return baseWorks.map((item) => normalizeWork(item));
}

function sortWorks(items: ModeratedWork[]): ModeratedWork[] {
  return [...items].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function getMemoryWorks(): ModeratedWork[] {
  if (!globalThis.__promotionWorksMemory) {
    globalThis.__promotionWorksMemory = cloneBaseWorks();
  }

  return globalThis.__promotionWorksMemory;
}

function normalizeTags(tags?: string[] | string): string[] {
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean);
  }

  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

function estimateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 180));
}

function buildExcerpt(content: string): string {
  return content.replace(/\s+/g, " ").trim().slice(0, 160).trim();
}

function createWorkId(category: WorkCategory): string {
  return `${category}-${Date.now()}`;
}

function isPublicWork(item: ModeratedWork): boolean {
  return (
    item.isPublished === true &&
    item.moderationState === "published" &&
    !item.isHidden
  );
}

export function getAllWorks(): ModeratedWork[] {
  return sortWorks(cloneBaseWorks());
}

export function getPublishedWorks(): ModeratedWork[] {
  return getAllWorks().filter(isPublicWork);
}

export function getWorksByCategory(category: WorkCategory): ModeratedWork[] {
  return getPublishedWorks().filter((item) => item.category === category);
}

export function getWorkById(id: string): ModeratedWork | undefined {
  return getPublishedWorks().find((item) => item.id === id);
}

async function readLiveWorks(): Promise<ModeratedWork[]> {
  const client = getKV();

  if (client) {
    try {
      const stored = await client.get<ModeratedWork[]>(WORKS_KEY);

      if (Array.isArray(stored) && stored.length > 0) {
        return sortWorks(stored.map((item) => normalizeWork(item)));
      }

      const seeded = cloneBaseWorks();
      await client.set(WORKS_KEY, seeded);
      return sortWorks(seeded);
    } catch (error) {
      console.error("KV/Redis read error:", error);
    }
  }

  return sortWorks(getMemoryWorks());
}

async function writeLiveWorks(nextWorks: ModeratedWork[]): Promise<void> {
  const sorted = sortWorks(nextWorks.map((item) => normalizeWork(item)));
  const client = getKV();

  if (client) {
    try {
      await client.set(WORKS_KEY, sorted);
      return;
    } catch (error) {
      console.error("KV/Redis write error:", error);
    }
  }

  globalThis.__promotionWorksMemory = sorted;
}

export async function getAllWorksLive(): Promise<ModeratedWork[]> {
  return readLiveWorks();
}

export async function getPublishedWorksLive(): Promise<ModeratedWork[]> {
  return (await readLiveWorks()).filter(isPublicWork);
}

export async function getWorksByCategoryLive(
  category: WorkCategory
): Promise<ModeratedWork[]> {
  return (await getPublishedWorksLive()).filter(
    (item) => item.category === category
  );
}

export async function getWorkByIdLive(
  id: string
): Promise<ModeratedWork | undefined> {
  return (await getPublishedWorksLive()).find((item) => item.id === id);
}

export async function getAnyWorkByIdLive(
  id: string
): Promise<ModeratedWork | undefined> {
  return (await readLiveWorks()).find((item) => item.id === id);
}

async function updateWork(
  id: string,
  updater: (item: ModeratedWork) => Partial<ModeratedWork>
): Promise<ModeratedWork | null> {
  const allWorks = await readLiveWorks();
  const index = allWorks.findIndex((item) => item.id === id);

  if (index === -1) {
    return null;
  }

  const current = allWorks[index];
  const updated: ModeratedWork = normalizeWork({
    ...current,
    ...updater(current),
    updatedAt: new Date().toISOString(),
  });

  const nextWorks = [...allWorks];
  nextWorks[index] = updated;

  await writeLiveWorks(nextWorks);

  return updated;
}

export async function incrementViews(id: string): Promise<ModeratedWork | null> {
  return updateWork(id, (item) => ({
    views: (item.views || 0) + 1,
  }));
}

export async function incrementLikes(id: string): Promise<ModeratedWork | null> {
  return updateWork(id, (item) => ({
    likes: (item.likes || 0) + 1,
  }));
}

export async function upsertWorkLive(input: {
  id?: string;
  title: string;
  excerpt?: string;
  content: string;
  category: WorkCategory;
  tags?: string[] | string;
  language?: Language;
  isPublished?: boolean;
  isFeatured?: boolean;
  moderationState?: ModerationState | string;
  isHidden?: boolean;
  moderationNotes?: string;
}): Promise<ModeratedWork> {
  const allWorks = await readLiveWorks();
  const now = new Date().toISOString();
  const normalizedTags = normalizeTags(input.tags);
  const normalizedExcerpt =
    (input.excerpt || "").trim() || buildExcerpt(input.content);
  const normalizedNotes = normalizeModerationNotes(input.moderationNotes);

  if (input.id) {
    const index = allWorks.findIndex((item) => item.id === input.id);

    if (index !== -1) {
      const current = allWorks[index];
      const nextState = normalizeModerationState(
        typeof input.moderationState === "string" ? input.moderationState : undefined,
        current.moderationState || (current.isPublished ? "published" : "draft")
      );

      const nextPublished = nextState === "published";
      const nextFeatured = nextPublished
        ? typeof input.isFeatured === "boolean"
          ? input.isFeatured
          : Boolean(current.isFeatured)
        : false;

      const nextHidden = nextPublished
        ? typeof input.isHidden === "boolean"
          ? input.isHidden
          : Boolean(current.isHidden)
        : false;

      const updated: ModeratedWork = normalizeWork({
        ...current,
        title: input.title.trim(),
        excerpt: normalizedExcerpt,
        content: input.content,
        category: input.category,
        tags: normalizedTags,
        language: input.language || current.language || "ru",
        readingTime: estimateReadingTime(input.content),
        isPublished: nextPublished,
        isFeatured: nextFeatured,
        moderationState: nextState,
        isHidden: nextHidden,
        moderationNotes: normalizedNotes || undefined,
        updatedAt: now,
      });

      const nextWorks = [...allWorks];
      nextWorks[index] = updated;

      await writeLiveWorks(nextWorks);
      return updated;
    }
  }

  const id = createWorkId(input.category);
  const nextState = normalizeModerationState(
    typeof input.moderationState === "string" ? input.moderationState : undefined,
    input.isPublished ? "published" : "draft"
  );

  const nextPublished = nextState === "published";
  const nextFeatured = nextPublished ? Boolean(input.isFeatured) : false;
  const nextHidden = nextPublished ? Boolean(input.isHidden) : false;

  const created: ModeratedWork = normalizeWork({
    id,
    slug: id,
    title: input.title.trim(),
    excerpt: normalizedExcerpt,
    content: input.content,
    category: input.category,
    tags: normalizedTags,
    language: input.language || "ru",
    createdAt: now,
    updatedAt: now,
    readingTime: estimateReadingTime(input.content),
    views: 0,
    likes: 0,
    isPublished: nextPublished,
    isFeatured: nextFeatured,
    moderationState: nextState,
    isHidden: nextHidden,
    ...(normalizedNotes ? { moderationNotes: normalizedNotes } : {}),
  });

  await writeLiveWorks([created, ...allWorks]);

  return created;
}

export async function deleteWorkLive(id: string): Promise<boolean> {
  const allWorks = await readLiveWorks();
  const nextWorks = allWorks.filter((item) => item.id !== id);

  if (nextWorks.length === allWorks.length) {
    return false;
  }

  await writeLiveWorks(nextWorks);
  return true;
}
