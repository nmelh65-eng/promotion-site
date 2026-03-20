import type { MetadataRoute } from "next";
import { getPublishedWorks } from "@/lib/works-store";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://your-site.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["", "/about", "/contact", "/links", "/poetry", "/prose"];

  const staticEntries = staticPages.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
  }));

  const workEntries = getPublishedWorks().map((work) => ({
    url: `${siteUrl}/${work.category}/${work.id}`,
    lastModified: new Date(work.updatedAt),
  }));

  return [...staticEntries, ...workEntries];
}
