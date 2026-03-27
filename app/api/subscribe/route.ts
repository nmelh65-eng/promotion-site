import { NextRequest, NextResponse } from "next/server";
import { subscribeEmailLive } from "@/lib/subscribers-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(body: unknown, status = 200) {
  const response = NextResponse.json(body, { status });
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    const email = String(body?.email || "").trim();
    const source = String(body?.source || "").trim();
    const website = String(body?.website || "").trim();

    if (website) {
      return json({
        ok: true,
        data: {
          status: "created",
        },
      });
    }

    if (!email) {
      return json(
        { ok: false, error: "Укажите email" },
        400
      );
    }

    const result = await subscribeEmailLive({
      email,
      source: source || "homepage",
    });

    return json({
      ok: true,
      data: result,
    });
  } catch (error) {
    return json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Server error",
      },
      400
    );
  }
}
