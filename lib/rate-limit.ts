import type { NextRequest } from "next/server";
import { getKV } from "@/lib/kv";
import { getAdminLoginRateLimitConfig } from "@/lib/env";

type RateLimitState = {
  count: number;
  resetAt: number;
};

type ConsumeRateLimitInput = {
  key: string;
  max?: number;
  windowSeconds?: number;
};

type ConsumeRateLimitResult = {
  ok: boolean;
  key: string;
  limit: number;
  remaining: number;
  retryAfter: number;
  resetAt: number;
};

declare global {
  var __promotionRateLimitMemory:
    | Record<string, RateLimitState>
    | undefined;
}

function getMemoryStore(): Record<string, RateLimitState> {
  if (!globalThis.__promotionRateLimitMemory) {
    globalThis.__promotionRateLimitMemory = {};
  }

  return globalThis.__promotionRateLimitMemory;
}

async function readState(storageKey: string): Promise<RateLimitState | null> {
  const client = getKV();

  if (client) {
    try {
      const stored = await client.get<RateLimitState>(storageKey);

      if (
        stored &&
        typeof stored === "object" &&
        typeof stored.count === "number" &&
        typeof stored.resetAt === "number"
      ) {
        return stored;
      }
    } catch (error) {
      console.error("Rate limit read error:", error);
    }
  }

  return getMemoryStore()[storageKey] || null;
}

async function writeState(
  storageKey: string,
  value: RateLimitState
): Promise<void> {
  const client = getKV();

  if (client) {
    try {
      await client.set(storageKey, value);
      return;
    } catch (error) {
      console.error("Rate limit write error:", error);
    }
  }

  getMemoryStore()[storageKey] = value;
}

export function getRequestIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

export function getAdminLoginRateLimitKey(req: NextRequest): string {
  return `admin-login:${getRequestIp(req)}`;
}

export async function consumeRateLimit({
  key,
  max = getAdminLoginRateLimitConfig().max,
  windowSeconds = getAdminLoginRateLimitConfig().windowSeconds,
}: ConsumeRateLimitInput): Promise<ConsumeRateLimitResult> {
  const storageKey = `promotion-site:rate-limit:v1:${key}`;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  let state = await readState(storageKey);

  if (!state || state.resetAt <= now) {
    state = {
      count: 0,
      resetAt: now + windowMs,
    };
  }

  const retryAfter = Math.max(1, Math.ceil((state.resetAt - now) / 1000));

  if (state.count >= max) {
    return {
      ok: false,
      key,
      limit: max,
      remaining: 0,
      retryAfter,
      resetAt: state.resetAt,
    };
  }

  state.count += 1;
  await writeState(storageKey, state);

  return {
    ok: true,
    key,
    limit: max,
    remaining: Math.max(0, max - state.count),
    retryAfter,
    resetAt: state.resetAt,
  };
}
