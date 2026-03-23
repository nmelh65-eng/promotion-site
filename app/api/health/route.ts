import { NextResponse } from "next/server";
import { getAdminLoginRateLimitConfig, getEnvStatus } from "@/lib/env";
import { hasKVConfig } from "@/lib/kv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const env = getEnvStatus();
  const kvConfigured = hasKVConfig();
  const ready =
    env.adminPasswordConfigured &&
    env.adminSecretConfigured &&
    kvConfigured;

  const response = NextResponse.json(
    {
      ok: ready,
      data: {
        nodeEnv: process.env.NODE_ENV || "development",
        siteUrlConfigured: env.siteUrlConfigured,
        adminPasswordConfigured: env.adminPasswordConfigured,
        adminSecretConfigured: env.adminSecretConfigured,
        adminSecretWeak: env.adminSecretWeak,
        kvConfigured,
        adminLoginRateLimit: getAdminLoginRateLimitConfig(),
        timestamp: new Date().toISOString(),
      },
    },
    {
      status: ready ? 200 : 503,
    }
  );

  response.headers.set("Cache-Control", "no-store, max-age=0");

  return response;
}
