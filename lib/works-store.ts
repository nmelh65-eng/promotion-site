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

function slugifyTitle(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}\s-]+/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 96);
}

function shouldRegenerateSlug(slug: string | undefined, id: string): boolean {
  const normalized = String(slug || "").trim();

  if (!normalized) return true;
  if (normalized === id) return true;
  if (/^(poem|poetry|prose)-\d+$/i.test(normalized)) return true;
  if (/^(poetry|prose)-\d{10,}$/i.test(normalized)) return true;

  return false;
}

function ensureUniqueSlug(
  baseSlug: string,
  used: Set<string>,
  fallbackId: string
): string {
  const safeBase = baseSlug || slugifyTitle(fallbackId) || fallbackId.toLowerCase();

  if (!used.has(safeBase)) {
    used.add(safeBase);
    return safeBase;
  }

  let index = 2;
  let next = `${safeBase}-${index}`;

  while (used.has(next)) {
    index += 1;
    next = `${safeBase}-${index}`;
  }

  used.add(next);
  return next;
}

function cloneRawWork(item: WorkItem | ModeratedWork): ModeratedWork {
  return {
    ...item,
    tags: [...(item.tags || [])],
    seo: item.seo ? { ...item.seo } : undefined,
    translations: item.translations ? { ...item.translations } : undefined,
  };
}

function normalizeWorkShape(item: WorkItem | ModeratedWork): ModeratedWork {
  const raw = cloneRawWork(item);
  const fallbackState: ModerationState = raw.isPublished ? "published" : "draft";

  const moderationState = normalizeModerationState(
    (raw as ModeratedWork).moderationState,
    fallbackState
  );

  const isPublished = moderationState === "published";
  const isFeatured = isPublished ? Boolean(raw.isFeatured) : false;
  const isHidden = isPublished ? Boolean((raw as ModeratedWork).isHidden) : false;
  const moderationNotes = normalizeModerationNotes(
    (raw as ModeratedWork).moderationNotes
  );

  return {
    ...raw,
    isPublished,
    isFeatured,
    moderationState,
    isHidden,
    ...(moderationNotes ? { moderationNotes } : {}),
  };
}

function normalizeWorksCollection(
  items: Array<WorkItem | ModeratedWork>
): ModeratedWork[] {
  const usedSlugs = new Set<string>();

  return items.map((rawItem) => {
    const item = normalizeWorkShape(rawItem);

    const currentSlug = String(item.slug || "").trim();
    const baseSlug = shouldRegenerateSlug(currentSlug, item.id)
      ? slugifyTitle(item.title)
      : slugifyTitle(currentSlug);

    const slug = ensureUniqueSlug(baseSlug, usedSlugs, item.id);

    return {
      ...item,
      slug,
    };
  });
}

function cloneBaseWorks(): ModeratedWork[] {
  return normalizeWorksCollection(baseWorks);
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
        return sortWorks(normalizeWorksCollection(stored));
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
  const normalized = sortWorks(normalizeWorksCollection(nextWorks));
  const client = getKV();

  if (client) {
    try {
      await client.set(WORKS_KEY, normalized);
      return;
    } catch (error) {
      console.error("KV/Redis write error:", error);
    }
  }

  globalThis.__promotionWorksMemory = normalized;
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

export async function getWorkBySlugLive(
  slug: string
): Promise<ModeratedWork | undefined> {
  return (await getPublishedWorksLive()).find((item) => item.slug === slug);
}

export async function getAnyWorkByIdLive(
  id: string
): Promise<ModeratedWork | undefined> {
  return (await readLiveWorks()).find((item) => item.id === id);
}

export async function getAnyWorkBySlugLive(
  slug: string
): Promise<ModeratedWork | undefined> {
  return (await readLiveWorks()).find((item) => item.slug === slug);
}

export async function getPublicWorkBySlugOrIdLive(
  slugOrId: string
): Promise<ModeratedWork | undefined> {
  const published = await getPublishedWorksLive();

  return published.find(
    (item) => item.slug === slugOrId || item.id === slugOrId
  );
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
  const updated: ModeratedWork = {
    ...current,
    ...updater(current),
    updatedAt: new Date().toISOString(),
  };

  const nextWorks = [...allWorks];
  nextWorks[index] = updated;

  await writeLiveWorks(nextWorks);

  return (await readLiveWorks()).find((item) => item.id === id) || null;
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

      const updated: ModeratedWork = {
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
      };

      const nextWorks = [...allWorks];
      nextWorks[index] = updated;

      await writeLiveWorks(nextWorks);

      return (await readLiveWorks()).find((item) => item.id === current.id)!;
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

  const created: ModeratedWork = {
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
  };

  await writeLiveWorks([created, ...allWorks]);

  return (await readLiveWorks()).find((item) => item.id === id)!;
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
