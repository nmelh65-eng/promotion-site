import type { Metadata } from "next";
import type { WorkItem } from "@/types";

const DEFAULT_SITE_URL = "https://promotion-site-nine.vercel.app";

export const siteConfig = {
  name: "Promotion Site",
  author: "Natalia Melkher",
  defaultDescription:
    "Сайт продвижения авторского бренда, публикаций, ссылок и контента.",
  telegramUrl: "https://t.me/nataliamelkher",
  email: "natalia@melkher.com",
};

type BuildMetadataInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  noIndex?: boolean;
  type?: "website" | "article";
};

type BreadcrumbInput = {
  name: string;
  path: string;
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

function countWords(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length;
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
  const title = work.seo?.title?.trim() || work.title.trim();

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

export function buildWebsiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: getSiteUrl(),
    inLanguage: "ru",
  };
}

export function buildPersonJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.author,
    url: getSiteUrl(),
    email: siteConfig.email,
    sameAs: [siteConfig.telegramUrl],
  };
}

export function buildAboutPageJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "Обо мне",
    url: absoluteUrl("/about"),
    inLanguage: "ru",
    about: {
      "@type": "Person",
      name: siteConfig.author,
      url: getSiteUrl(),
    },
    mainEntity: buildPersonJsonLd(),
  };
}

export function buildContactPageJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Контакты",
    url: absoluteUrl("/contact"),
    inLanguage: "ru",
    mainEntity: {
      "@type": "Person",
      name: siteConfig.author,
      url: getSiteUrl(),
      email: siteConfig.email,
      sameAs: [siteConfig.telegramUrl],
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "author contact",
          email: siteConfig.email,
          url: siteConfig.telegramUrl,
          availableLanguage: ["ru"],
        },
      ],
    },
  };
}

export function buildBreadcrumbJsonLd(
  items: BreadcrumbInput[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildWorkArticleJsonLd(
  work: WorkItem,
  path: string
): Record<string, unknown> {
  const title = work.seo?.title?.trim() || work.title.trim();

  const description =
    work.seo?.description?.trim() ||
    work.excerpt?.trim() ||
    normalizeDescription(work.content);

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url: absoluteUrl(path),
    mainEntityOfPage: absoluteUrl(path),
    author: {
      "@type": "Person",
      name: siteConfig.author,
      url: getSiteUrl(),
    },
    publisher: {
      "@type": "Person",
      name: siteConfig.author,
      url: getSiteUrl(),
    },
    datePublished: work.createdAt,
    dateModified: work.updatedAt || work.createdAt,
    inLanguage: work.language || "ru",
    articleSection: work.category === "poetry" ? "Поэзия" : "Проза",
    genre: work.category === "poetry" ? "Poetry" : "Prose",
    keywords: uniqueKeywords([
      ...(work.tags || []),
      work.category === "poetry" ? "поэзия" : "проза",
      "литература",
      "авторский текст",
    ]).join(", "),
    wordCount: countWords(work.content),
    timeRequired: `PT${Math.max(1, work.readingTime || 1)}M`,
    articleBody: work.content,
  };
}
