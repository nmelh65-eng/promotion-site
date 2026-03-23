import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, createAdminToken } from "@/lib/admin-auth";
import {
  assertAdminEnvConfigured,
  getAdminLoginRateLimitConfig,
  isProduction,
} from "@/lib/env";
import {
  consumeRateLimit,
  getAdminLoginRateLimitKey,
} from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonResponse(
  body: unknown,
  status = 200,
  extraHeaders: Record<string, string> = {}
) {
  const response = NextResponse.json(body, { status });
  response.headers.set("Cache-Control", "no-store, max-age=0");

  for (const [key, value] of Object.entries(extraHeaders)) {
    response.headers.set(key, value);
  }

  return response;
}

export async function POST(req: NextRequest) {
  try {
    const { password: adminPassword } = assertAdminEnvConfigured();
    const rateConfig = getAdminLoginRateLimitConfig();

    const rate = await consumeRateLimit({
      key: getAdminLoginRateLimitKey(req),
      max: rateConfig.max,
      windowSeconds: rateConfig.windowSeconds,
    });

    const rateHeaders = {
      "RateLimit-Limit": String(rate.limit),
      "RateLimit-Remaining": String(rate.remaining),
      "RateLimit-Reset": String(Math.ceil(rate.resetAt / 1000)),
    };

    if (!rate.ok) {
      return jsonResponse(
        {
          ok: false,
          error: "Too many login attempts. Try again later.",
        },
        429,
        {
          ...rateHeaders,
          "Retry-After": String(rate.retryAfter),
        }
      );
    }

    const body = await req.json().catch(() => null);
    const password = String(body?.password || "");

    if (password !== adminPassword) {
      return jsonResponse(
        { ok: false, error: "Неверный пароль" },
        401,
        rateHeaders
      );
    }

    const token = await createAdminToken("admin");

    const response = jsonResponse(
      { ok: true, data: { authenticated: true } },
      200,
      rateHeaders
    );

    response.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction(),
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    return jsonResponse(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Server error",
      },
      500
    );
  }
}
