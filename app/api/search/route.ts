import { NextRequest, NextResponse } from "next/server";
import { searchPublishedWorks } from "@/lib/search";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const result = await searchPublishedWorks({
      q: searchParams.get("q") || "",
      category: searchParams.get("category") || "",
      tag: searchParams.get("tag") || "",
      sort: searchParams.get("sort") || "",
      limit: searchParams.get("limit") || "",
    });

    const response = NextResponse.json({
      ok: true,
      data: result,
    });

    response.headers.set("Cache-Control", "no-store, max-age=0");

    return response;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
