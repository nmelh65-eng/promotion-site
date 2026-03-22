export type Language = "ru" | "en";

export type WorkCategory = "poetry" | "prose";

export type LinkKind =
  | "social"
  | "platform"
  | "referral"
  | "support"
  | "music"
  | "video"
  | "book"
  | "store";

export type AnalyticsTargetType = "social" | "platform" | "referral";

export interface SeoFields {
  title?: string;
  description?: string;
  canonical?: string;
  keywords?: string[];
  ogImage?: string;
  noindex?: boolean;
}

export interface WorkTranslation {
  title?: string;
  content?: string;
  excerpt?: string;
  seo?: SeoFields;
}

export interface WorkItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: WorkCategory;
  tags: string[];
  language: Language;
  createdAt: string;
  updatedAt: string;
  readingTime: number;
  views: number;
  likes: number;
  isPublished: boolean;
  isFeatured?: boolean;
  seo?: SeoFields;
  translations?: Partial<Record<Language, WorkTranslation>>;
}

export interface SocialLink {
  id: string;
  label: string;
  href: string;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface PlatformLink {
  id: string;
  title: string;
  description?: string;
  href: string;
  kind: LinkKind;
  icon?: string;
  image?: string;
  buttonLabel?: string;
  badge?: string;
  tags?: string[];
  isActive: boolean;
  isFeatured?: boolean;
  sortOrder: number;
  clicks: number;
}

export interface ReferralLink {
  id: string;
  title: string;
  description?: string;
  href: string;
  code?: string;
  isActive: boolean;
  isFeatured?: boolean;
  sortOrder: number;
  clicks: number;
}

export interface AnalyticsSummary {
  totalClicks: number;
  totalSocialClicks: number;
  totalPlatformClicks: number;
  totalReferralClicks: number;
  topSocialLinks: Array<{
    id: string;
    label: string;
    clicks: number;
  }>;
  topPlatforms: Array<{
    id: string;
    title: string;
    clicks: number;
  }>;
  topReferrals: Array<{
    id: string;
    title: string;
    clicks: number;
  }>;
}

export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

export interface ApiError {
  ok: false;
  error: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
