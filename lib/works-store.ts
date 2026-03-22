import { works as baseWorks } from "@/data/works";
import { getKV } from "@/lib/kv";
import type { Language, WorkCategory, WorkItem } from "@/types";

const WORKS_KEY = "promotion-site:works:v1";

declare global {
  var __promotionWorksMemory: WorkItem[] | undefined;
}

function cloneBaseWorks(): WorkItem[] {
  return baseWorks.map((item) => ({
    ...item,
    tags: [...item.tags],
    seo: item.seo ? { ...item.seo } : undefined,
    translations: item.translations ? { ...item.translations } : undefined,
  }));
}

function sortWorks(items: WorkItem[]): WorkItem[] {
  return [...items].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function getMemoryWorks(): WorkItem[] {
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

export function getAllWorks(): WorkItem[] {
  return sortWorks(cloneBaseWorks());
}

export function getPublishedWorks(): WorkItem[] {
  return getAllWorks().filter((item) => item.isPublished);
}

export function getWorksByCategory(category: WorkCategory): WorkItem[] {
  return getPublishedWorks().filter((item) => item.category === category);
}

export function getWorkById(id: string): WorkItem | undefined {
  return getPublishedWorks().find((item) => item.id === id);
}

async function readLiveWorks(): Promise<WorkItem[]> {
  const client = getKV();

  if (client) {
    try {
      const stored = await client.get<WorkItem[]>(WORKS_KEY);

      if (Array.isArray(stored) && stored.length > 0) {
        return sortWorks(stored);
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

async function writeLiveWorks(nextWorks: WorkItem[]): Promise<void> {
  const sorted = sortWorks(nextWorks);
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

export async function getAllWorksLive(): Promise<WorkItem[]> {
  return readLiveWorks();
}

export async function getPublishedWorksLive(): Promise<WorkItem[]> {
  return (await readLiveWorks()).filter((item) => item.isPublished);
}

export async function getWorksByCategoryLive(
  category: WorkCategory
): Promise<WorkItem[]> {
  return (await getPublishedWorksLive()).filter(
    (item) => item.category === category
  );
}

export async function getWorkByIdLive(
  id: string
): Promise<WorkItem | undefined> {
  return (await getPublishedWorksLive()).find((item) => item.id === id);
}

export async function getAnyWorkByIdLive(
  id: string
): Promise<WorkItem | undefined> {
  return (await readLiveWorks()).find((item) => item.id === id);
}

async function updateWork(
  id: string,
  updater: (item: WorkItem) => Partial<WorkItem>
): Promise<WorkItem | null> {
  const allWorks = await readLiveWorks();
  const index = allWorks.findIndex((item) => item.id === id);

  if (index === -1) {
    return null;
  }

  const current = allWorks[index];
  const updated: WorkItem = {
    ...current,
    ...updater(current),
    updatedAt: new Date().toISOString(),
  };

  const nextWorks = [...allWorks];
  nextWorks[index] = updated;

  await writeLiveWorks(nextWorks);

  return updated;
}

export async function incrementViews(id: string): Promise<WorkItem | null> {
  return updateWork(id, (item) => ({
    views: (item.views || 0) + 1,
  }));
}

export async function incrementLikes(id: string): Promise<WorkItem | null> {
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
}): Promise<WorkItem> {
  const allWorks = await readLiveWorks();
  const now = new Date().toISOString();
  const normalizedTags = normalizeTags(input.tags);
  const normalizedExcerpt =
    (input.excerpt || "").trim() || buildExcerpt(input.content);

  if (input.id) {
    const index = allWorks.findIndex((item) => item.id === input.id);

    if (index !== -1) {
      const current = allWorks[index];
      const updated: WorkItem = {
        ...current,
        title: input.title.trim(),
        excerpt: normalizedExcerpt,
        content: input.content,
        category: input.category,
        tags: normalizedTags,
        language: input.language || current.language || "ru",
        readingTime: estimateReadingTime(input.content),
        isPublished:
          typeof input.isPublished === "boolean"
            ? input.isPublished
            : current.isPublished,
        isFeatured:
          typeof input.isFeatured === "boolean"
            ? input.isFeatured
            : current.isFeatured,
        updatedAt: now,
      };

      const nextWorks = [...allWorks];
      nextWorks[index] = updated;

      await writeLiveWorks(nextWorks);
      return updated;
    }
  }

  const id = createWorkId(input.category);

  const created: WorkItem = {
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
    isPublished: Boolean(input.isPublished),
    isFeatured: Boolean(input.isFeatured),
  };

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
