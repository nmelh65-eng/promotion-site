import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { getPublishedWorksLive } from "@/lib/works-store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const works = await getPublishedWorksLive();

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/about"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/contact"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: absoluteUrl("/links"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/poetry"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/prose"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const workEntries: MetadataRoute.Sitemap = works.map((work) => ({
    url: absoluteUrl(`/${work.category}/${work.id}`),
    lastModified: new Date(work.updatedAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...workEntries];
}
