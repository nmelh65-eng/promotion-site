import { getKV } from "@/lib/kv";
import { socialLinks as baseSocialLinks } from "@/data/social-links";
import { platformLinks as basePlatformLinks } from "@/data/links";
import { referrals as baseReferrals } from "@/data/referrals";
import type {
  AnalyticsSummary,
  AnalyticsTargetType,
} from "@/types";

export type SocialLinkItem = (typeof baseSocialLinks)[number];
export type PlatformLinkItem = (typeof basePlatformLinks)[number];
export type ReferralLinkItem = (typeof baseReferrals)[number];
export type LinkCollectionType = AnalyticsTargetType;

type LinkCollections = {
  social: SocialLinkItem[];
  platform: PlatformLinkItem[];
  referral: ReferralLinkItem[];
};

const LINK_KEYS: Record<LinkCollectionType, string> = {
  social: "promotion-site:links:social:v1",
  platform: "promotion-site:links:platform:v1",
  referral: "promotion-site:links:referral:v1",
};

const CLICK_KEYS: Record<AnalyticsTargetType, string> = {
  social: "promotion-site:clicks:social:v1",
  platform: "promotion-site:clicks:platform:v1",
  referral: "promotion-site:clicks:referral:v1",
};

declare global {
  var __promotionLinksMemory: LinkCollections | undefined;
  var __promotionClickMemory:
    | Record<AnalyticsTargetType, Record<string, number>>
    | undefined;
}

function cloneSocialLinks(): SocialLinkItem[] {
  return baseSocialLinks.map((item) => ({ ...item }));
}

function clonePlatformLinks(): PlatformLinkItem[] {
  return basePlatformLinks.map((item) => ({ ...item }));
}

function cloneReferralLinks(): ReferralLinkItem[] {
  return baseReferrals.map((item) => ({ ...item }));
}

function cloneCollections(): LinkCollections {
  return {
    social: cloneSocialLinks(),
    platform: clonePlatformLinks(),
    referral: cloneReferralLinks(),
  };
}

function sortCollection<K extends LinkCollectionType>(
  items: LinkCollections[K]
): LinkCollections[K] {
  return [...items].sort(
    (a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0)
  ) as LinkCollections[K];
}

function sortLoose<T extends { sortOrder?: number }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0)
  );
}

function getMemoryCollections(): LinkCollections {
  if (!globalThis.__promotionLinksMemory) {
    globalThis.__promotionLinksMemory = cloneCollections();
  }

  return globalThis.__promotionLinksMemory;
}

function getMemoryClickStore(): Record<
  AnalyticsTargetType,
  Record<string, number>
> {
  if (!globalThis.__promotionClickMemory) {
    globalThis.__promotionClickMemory = {
      social: {},
      platform: {},
      referral: {},
    };
  }

  return globalThis.__promotionClickMemory;
}

function toTrimmedString(value: unknown): string {
  return String(value ?? "").trim();
}

function toSortOrder(value: unknown, fallback: number): number {
  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : fallback;
}

function toBoolean(value: unknown, fallback = true): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48);
}

function buildId(prefix: string, source: string, index: number): string {
  const slug = slugify(source);
  return slug ? `${prefix}-${slug}` : `${prefix}-${Date.now()}-${index + 1}`;
}

function toObjectRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? { ...(value as Record<string, unknown>) }
    : {};
}

function omitKeys(
  value: Record<string, unknown>,
  keys: string[]
): Record<string, unknown> {
  const next = { ...value };

  for (const key of keys) {
    delete next[key];
  }

  return next;
}

async function readCollection<K extends LinkCollectionType>(
  type: K
): Promise<LinkCollections[K]> {
  const client = getKV();

  if (client) {
    try {
      const stored = await client.get<LinkCollections[K]>(LINK_KEYS[type]);

      if (Array.isArray(stored)) {
        return sortCollection(stored as LinkCollections[K]);
      }

      const seeded = sortCollection(
        cloneCollections()[type] as LinkCollections[K]
      );

      await client.set(LINK_KEYS[type], seeded);
      return seeded;
    } catch (error) {
      console.error(`Link store read error (${type}):`, error);
    }
  }

  return sortCollection(getMemoryCollections()[type] as LinkCollections[K]);
}

async function writeCollection<K extends LinkCollectionType>(
  type: K,
  items: LinkCollections[K]
): Promise<void> {
  const sorted = sortCollection(items);
  const client = getKV();

  if (client) {
    try {
      await client.set(LINK_KEYS[type], sorted);
      return;
    } catch (error) {
      console.error(`Link store write error (${type}):`, error);
    }
  }

  getMemoryCollections()[type] = sorted;
}

function normalizeSocialItems(input: unknown[]): SocialLinkItem[] {
  return sortLoose(
    input.map((raw, index) => {
      const rawRecord = toObjectRecord(raw);
      const item = rawRecord as Partial<SocialLinkItem>;
      const preserved = omitKeys(rawRecord, [
        "id",
        "label",
        "href",
        "sortOrder",
        "isActive",
        "icon",
      ]);

      const label = toTrimmedString(item.label) || `Social Link ${index + 1}`;
      const href = toTrimmedString(item.href) || "#";
      const icon = toTrimmedString(item.icon);
      const id =
        toTrimmedString(item.id) || buildId("social", label, index);

      return {
        ...preserved,
        id,
        label,
        href,
        sortOrder: toSortOrder(item.sortOrder, index + 1),
        isActive: toBoolean(item.isActive, true),
        ...(icon ? { icon } : {}),
      } as SocialLinkItem;
    })
  );
}

function normalizePlatformItems(input: unknown[]): PlatformLinkItem[] {
  return sortLoose(
    input.map((raw, index) => {
      const rawRecord = toObjectRecord(raw);
      const item = rawRecord as Partial<PlatformLinkItem>;
      const preserved = omitKeys(rawRecord, [
        "id",
        "title",
        "description",
        "href",
        "sortOrder",
        "isActive",
      ]);

      const title = toTrimmedString(item.title) || `Platform ${index + 1}`;
      const href = toTrimmedString(item.href) || "#";
      const description = toTrimmedString(item.description);
      const id =
        toTrimmedString(item.id) || buildId("platform", title, index);

      return {
        ...preserved,
        id,
        title,
        href,
        sortOrder: toSortOrder(item.sortOrder, index + 1),
        isActive: toBoolean(item.isActive, true),
        ...(description ? { description } : {}),
      } as PlatformLinkItem;
    })
  );
}

function normalizeReferralItems(input: unknown[]): ReferralLinkItem[] {
  return sortLoose(
    input.map((raw, index) => {
      const rawRecord = toObjectRecord(raw);
      const item = rawRecord as Partial<ReferralLinkItem>;
      const preserved = omitKeys(rawRecord, [
        "id",
        "title",
        "description",
        "href",
        "sortOrder",
        "isActive",
      ]);

      const title = toTrimmedString(item.title) || `Referral ${index + 1}`;
      const href = toTrimmedString(item.href) || "#";
      const description = toTrimmedString(item.description);
      const id =
        toTrimmedString(item.id) || buildId("referral", title, index);

      return {
        ...preserved,
        id,
        title,
        href,
        sortOrder: toSortOrder(item.sortOrder, index + 1),
        isActive: toBoolean(item.isActive, true),
        ...(description ? { description } : {}),
      } as ReferralLinkItem;
    })
  );
}

export async function getSocialLinksLive(): Promise<SocialLinkItem[]> {
  return readCollection("social");
}

export async function getPlatformLinksLive(): Promise<PlatformLinkItem[]> {
  return readCollection("platform");
}

export async function getReferralLinksLive(): Promise<ReferralLinkItem[]> {
  return readCollection("referral");
}

export async function replaceSocialLinksLive(
  items: unknown[]
): Promise<SocialLinkItem[]> {
  const next = normalizeSocialItems(items);
  await writeCollection("social", next);
  return next;
}

export async function replacePlatformLinksLive(
  items: unknown[]
): Promise<PlatformLinkItem[]> {
  const next = normalizePlatformItems(items);
  await writeCollection("platform", next);
  return next;
}

export async function replaceReferralLinksLive(
  items: unknown[]
): Promise<ReferralLinkItem[]> {
  const next = normalizeReferralItems(items);
  await writeCollection("referral", next);
  return next;
}

async function readClickMap(
  targetType: AnalyticsTargetType
): Promise<Record<string, number>> {
  const client = getKV();

  if (client) {
    try {
      const stored = await client.get<Record<string, number>>(
        CLICK_KEYS[targetType]
      );

      if (stored && typeof stored === "object") {
        return stored;
      }
    } catch (error) {
      console.error("Click store read error:", error);
    }
  }

  return getMemoryClickStore()[targetType];
}

async function writeClickMap(
  targetType: AnalyticsTargetType,
  value: Record<string, number>
): Promise<void> {
  const client = getKV();

  if (client) {
    try {
      await client.set(CLICK_KEYS[targetType], value);
      return;
    } catch (error) {
      console.error("Click store write error:", error);
    }
  }

  getMemoryClickStore()[targetType] = value;
}

export async function trackClick(
  targetType: AnalyticsTargetType,
  targetId: string
): Promise<number> {
  const map = await readClickMap(targetType);
  const next = {
    ...map,
    [targetId]: (map[targetId] || 0) + 1,
  };

  await writeClickMap(targetType, next);

  return next[targetId];
}

export async function getClickCount(
  targetType: AnalyticsTargetType,
  targetId: string
): Promise<number> {
  const map = await readClickMap(targetType);
  return map[targetId] || 0;
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const [socialMap, platformMap, referralMap, social, platforms, referral] =
    await Promise.all([
      readClickMap("social"),
      readClickMap("platform"),
      readClickMap("referral"),
      getSocialLinksLive(),
      getPlatformLinksLive(),
      getReferralLinksLive(),
    ]);

  const totalSocialClicks = Object.values(socialMap).reduce((a, b) => a + b, 0);
  const totalPlatformClicks = Object.values(platformMap).reduce(
    (a, b) => a + b,
    0
  );
  const totalReferralClicks = Object.values(referralMap).reduce(
    (a, b) => a + b,
    0
  );

  return {
    totalClicks:
      totalSocialClicks + totalPlatformClicks + totalReferralClicks,
    totalSocialClicks,
    totalPlatformClicks,
    totalReferralClicks,
    topSocialLinks: social
      .map((item) => ({
        id: item.id,
        label: item.label,
        clicks: socialMap[item.id] || 0,
      }))
      .sort((a, b) => b.clicks - a.clicks),
    topPlatforms: platforms
      .map((item) => ({
        id: item.id,
        title: item.title,
        clicks: platformMap[item.id] || 0,
      }))
      .sort((a, b) => b.clicks - a.clicks),
    topReferrals: referral
      .map((item) => ({
        id: item.id,
        title: item.title,
        clicks: referralMap[item.id] || 0,
      }))
      .sort((a, b) => b.clicks - a.clicks),
  };
}
