import { works as baseWorks } from "@/data/works";
import { getKV } from "@/lib/kv";
import type { WorkCategory, WorkItem } from "@/types";

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
      console.error("KV read error:", error);
    }
  }

  return sortWorks(getMemoryWorks());
}

async function writeLiveWorks(nextWorks: WorkItem[]): Promise<void> {
  const client = getKV();

  if (client) {
    try {
      await client.set(WORKS_KEY, nextWorks);
      return;
    } catch (error) {
      console.error("KV write error:", error);
    }
  }

  globalThis.__promotionWorksMemory = nextWorks;
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
