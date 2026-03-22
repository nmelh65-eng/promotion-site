import type { MetadataRoute } from "next";
import { getPublishedWorksLive } from "@/lib/works-store";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://your-site.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = ["", "/about", "/contact", "/links", "/poetry", "/prose"];

  const staticEntries = staticPages.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
  }));

  const workEntries = (await getPublishedWorksLive()).map((work) => ({
    url: `${siteUrl}/${work.category}/${work.id}`,
    lastModified: new Date(work.updatedAt),
  }));

  return [...staticEntries, ...workEntries];
}
