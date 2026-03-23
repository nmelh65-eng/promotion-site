import type { Metadata } from "next";
import type { WorkItem } from "@/types";

const DEFAULT_SITE_URL = "https://promotion-site-nine.vercel.app";

export const siteConfig = {
  name: "Promotion Site",
  author: "Natalia Melkher",
  defaultDescription:
    "Сайт продвижения авторского бренда, публикаций, ссылок и контента.",
};

type BuildMetadataInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  noIndex?: boolean;
  type?: "website" | "article";
};

function normalizeSiteUrl(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getSiteUrl(): string {
  return normalizeSiteUrl(
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL
  );
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

function normalizeDescription(value: string): string {
  return value.replace(/\s+/g, " ").trim().slice(0, 180);
}

function uniqueKeywords(items: string[]): string[] {
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
}

export function buildMetadata({
  title,
  description,
  path,
  keywords = [],
  noIndex = false,
  type = "website",
}: BuildMetadataInput): Metadata {
  const normalizedTitle = title.trim();
  const normalizedDescription = normalizeDescription(description);
  const url = absoluteUrl(path);

  return {
    metadataBase: new URL(getSiteUrl()),
    title: normalizedTitle,
    description: normalizedDescription,
    alternates: {
      canonical: url,
    },
    keywords: uniqueKeywords(keywords),
    authors: [{ name: siteConfig.author }],
    creator: siteConfig.author,
    publisher: siteConfig.author,
    openGraph: {
      title: normalizedTitle,
      description: normalizedDescription,
      url,
      siteName: siteConfig.name,
      locale: "ru_RU",
      type,
    },
    twitter: {
      card: "summary",
      title: normalizedTitle,
      description: normalizedDescription,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          nocache: true,
          googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
          },
        },
  };
}

export function buildNoIndexMetadata(
  title: string,
  description: string,
  path: string
): Metadata {
  return buildMetadata({
    title,
    description,
    path,
    noIndex: true,
  });
}

export function buildWorkMetadata(
  work: WorkItem,
  path: string
): Metadata {
  const title =
    work.seo?.title?.trim() || work.title.trim();

  const description =
    work.seo?.description?.trim() ||
    work.excerpt?.trim() ||
    normalizeDescription(work.content);

  const categoryKeyword =
    work.category === "poetry" ? "поэзия" : "проза";

  return buildMetadata({
    title,
    description,
    path,
    type: "article",
    keywords: uniqueKeywords([
      categoryKeyword,
      "литература",
      "авторский текст",
      ...(work.tags || []),
    ]),
  });
}
