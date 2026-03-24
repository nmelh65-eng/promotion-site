import { getPublishedWorksLive } from "@/lib/works-store";
import type { WorkCategory, WorkItem } from "@/types";

export type SearchSort = "latest" | "views" | "likes";

export interface SearchQueryInput {
  q?: string;
  category?: string;
  tag?: string;
  sort?: string;
  limit?: string | number;
}

export interface SearchTagFacet {
  tag: string;
  count: number;
}

export interface SearchResult {
  query: {
    q: string;
    category: WorkCategory | "all";
    tag: string;
    sort: SearchSort;
    limit: number;
  };
  totals: {
    all: number;
    matched: number;
    poetry: number;
    prose: number;
  };
  facets: {
    tags: SearchTagFacet[];
  };
  items: WorkItem[];
}

function normalizeText(value: unknown): string {
  return String(value || "").trim();
}

function normalizeCategory(value: string): WorkCategory | "all" {
  return value === "poetry" || value === "prose" ? value : "all";
}

function normalizeSort(value: string): SearchSort {
  return value === "views" || value === "likes" ? value : "latest";
}

function normalizeLimit(value: string | number | undefined): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 20;
  return Math.min(50, Math.max(1, Math.floor(parsed)));
}

function buildHaystack(work: WorkItem): string {
  return [
    work.id,
    work.slug,
    work.title,
    work.excerpt,
    work.content,
    ...(work.tags || []),
  ]
    .join(" ")
    .toLowerCase();
}

function sortWorks(items: WorkItem[], sort: SearchSort): WorkItem[] {
  const next = [...items];

  if (sort === "views") {
    return next.sort((a, b) => (b.views || 0) - (a.views || 0));
  }

  if (sort === "likes") {
    return next.sort((a, b) => (b.likes || 0) - (a.likes || 0));
  }

  return next.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function buildTagFacets(items: WorkItem[]): SearchTagFacet[] {
  const tagMap = new Map<string, number>();

  for (const item of items) {
    for (const tag of item.tags || []) {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    }
  }

  return [...tagMap.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.tag.localeCompare(b.tag, "ru");
    })
    .slice(0, 20);
}

export async function searchPublishedWorks(
  input: SearchQueryInput
): Promise<SearchResult> {
  const allPublished = await getPublishedWorksLive();

  const q = normalizeText(input.q);
  const qLower = q.toLowerCase();
  const category = normalizeCategory(normalizeText(input.category));
  const tag = normalizeText(input.tag);
  const sort = normalizeSort(normalizeText(input.sort));
  const limit = normalizeLimit(input.limit);

  const matched = allPublished.filter((work) => {
    if (category !== "all" && work.category !== category) {
      return false;
    }

    if (tag && !(work.tags || []).includes(tag)) {
      return false;
    }

    if (qLower) {
      const haystack = buildHaystack(work);
      if (!haystack.includes(qLower)) {
        return false;
      }
    }

    return true;
  });

  const sorted = sortWorks(matched, sort);
  const items = sorted.slice(0, limit);

  return {
    query: {
      q,
      category,
      tag,
      sort,
      limit,
    },
    totals: {
      all: allPublished.length,
      matched: matched.length,
      poetry: matched.filter((item) => item.category === "poetry").length,
      prose: matched.filter((item) => item.category === "prose").length,
    },
    facets: {
      tags: buildTagFacets(matched),
    },
    items,
  };
}
