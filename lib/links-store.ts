import { getKV } from "@/lib/kv";
import { socialLinks } from "@/data/social-links";
import { platformLinks } from "@/data/links";
import { referrals } from "@/data/referrals";
import type {
  AnalyticsSummary,
  AnalyticsTargetType,
} from "@/types";

const CLICK_KEYS: Record<AnalyticsTargetType, string> = {
  social: "promotion-site:clicks:social:v1",
  platform: "promotion-site:clicks:platform:v1",
  referral: "promotion-site:clicks:referral:v1",
};

declare global {
  var __promotionClickMemory:
    | Record<AnalyticsTargetType, Record<string, number>>
    | undefined;
}

function getMemoryStore(): Record<AnalyticsTargetType, Record<string, number>> {
  if (!globalThis.__promotionClickMemory) {
    globalThis.__promotionClickMemory = {
      social: {},
      platform: {},
      referral: {},
    };
  }

  return globalThis.__promotionClickMemory;
}

async function readClickMap(
  targetType: AnalyticsTargetType
): Promise<Record<string, number>> {
  const client = getKV();

  if (client) {
    try {
      const stored = await client.get<Record<string, number>>(CLICK_KEYS[targetType]);
      if (stored && typeof stored === "object") {
        return stored;
      }
    } catch (error) {
      console.error("Click store read error:", error);
    }
  }

  return getMemoryStore()[targetType];
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

  getMemoryStore()[targetType] = value;
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
  const [socialMap, platformMap, referralMap] = await Promise.all([
    readClickMap("social"),
    readClickMap("platform"),
    readClickMap("referral"),
  ]);

  const totalSocialClicks = Object.values(socialMap).reduce((a, b) => a + b, 0);
  const totalPlatformClicks = Object.values(platformMap).reduce((a, b) => a + b, 0);
  const totalReferralClicks = Object.values(referralMap).reduce((a, b) => a + b, 0);

  return {
    totalClicks: totalSocialClicks + totalPlatformClicks + totalReferralClicks,
    totalSocialClicks,
    totalPlatformClicks,
    totalReferralClicks,
    topSocialLinks: socialLinks
      .map((item) => ({
        id: item.id,
        label: item.label,
        clicks: socialMap[item.id] || 0,
      }))
      .sort((a, b) => b.clicks - a.clicks),
    topPlatforms: platformLinks
      .map((item) => ({
        id: item.id,
        title: item.title,
        clicks: platformMap[item.id] || 0,
      }))
      .sort((a, b) => b.clicks - a.clicks),
    topReferrals: referrals
      .map((item) => ({
        id: item.id,
        title: item.title,
        clicks: referralMap[item.id] || 0,
      }))
      .sort((a, b) => b.clicks - a.clicks),
  };
}
