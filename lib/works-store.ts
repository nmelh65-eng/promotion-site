import { works } from "@/data/works";
import type { WorkCategory, WorkItem } from "@/types";

export function getAllWorks(): WorkItem[] {
  return [...works].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
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

export function getFeaturedWorks(limit = 2): WorkItem[] {
  return getPublishedWorks().filter((item) => item.isFeatured).slice(0, limit);
}
