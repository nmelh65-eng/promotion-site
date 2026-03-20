export type Language = "ru" | "en" | "de" | "fr" | "zh" | "ko";

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag?: string;
}

export type WorkCategory =
  | "poetry"
  | "prose"
  | "article"
  | "project"
  | "announcement";

export type LinkKind =
  | "social"
  | "platform"
  | "referral"
  | "support"
  | "music"
  | "video"
  | "book"
  | "store";

export type ClickTargetType = "work" | "link" | "referral" | "social";

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface SeoFields {
  title?: string;
  description?: string;
  canonical?: string;
  keywords?: string[];
  ogImage?: string;
  noindex?: boolean;
}

export interface UTMParams {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

export interface WorkTranslation {
  title?: string;
  content?: string;
  excerpt?: string;
  seo?: SeoFields;
}

export interface WorkItem extends BaseEntity {
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  category: WorkCategory;
  tags: string[];
  language: Language;
  readingTime: number;
  views: number;
  likes: number;
  isPublished: boolean;
  isFeatured?: boolean;
  coverImage?: string;
  heroImage?: string;
  seo?: SeoFields;
  translations?: Partial<Record<Language, WorkTranslation>>;
}

export interface SocialLink extends BaseEntity {
  name: string;
  label: string;
  href: string;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
  utm?: UTMParams;
}

export interface PlatformLink extends BaseEntity {
  slug: string;
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
  utm?: UTMParams;
  seo?: SeoFields;
}

export interface ReferralLink extends BaseEntity {
  slug: string;
  title: string;
  description?: string;
  href: string;
  code?: string;
  disclosure?: string;
  icon?: string;
  buttonLabel?: string;
  tags?: string[];
  isActive: boolean;
  isFeatured?: boolean;
  sortOrder: number;
  clicks: number;
  utm?: UTMParams;
  seo?: SeoFields;
}

export interface SeoEntry extends BaseEntity {
  path: string;
  seo: SeoFields;
}

export interface AdminCredentials {
  password: string;
}

export interface AdminSession {
  isAuthenticated: boolean;
  username: string;
  expiresAt: number;
}

export interface ClickEvent extends BaseEntity {
  targetId: string;
  targetType: ClickTargetType;
  href?: string;
  pathname?: string;
  referrer?: string;
  userAgent?: string;
}

export interface DashboardSummary {
  totalWorks: number;
  publishedWorks: number;
  totalViews: number;
  totalLikes: number;
  totalLinkClicks: number;
  totalReferralClicks: number;
  topWorks: Array<{
    id: string;
    title: string;
    slug: string;
    views: number;
    likes: number;
  }>;
  topLinks: Array<{
    id: string;
    title: string;
    clicks: number;
  }>;
}

export interface SiteSettings {
  siteName: string;
  siteUrl: string;
  defaultLanguage: Language;
  authorName: string;
  authorTagline?: string;
  authorDescription?: string;
  defaultSeo: SeoFields;
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
