import { NextRequest, NextResponse } from "next/server";
import { trackClick } from "@/lib/links-store";
import type { AnalyticsTargetType } from "@/types";

const VALID_TYPES: AnalyticsTargetType[] = ["social", "platform", "referral"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const targetType = String(body?.targetType || "").trim() as AnalyticsTargetType;
    const targetId = String(body?.targetId || "").trim();

    if (!VALID_TYPES.includes(targetType)) {
      return NextResponse.json(
        { ok: false, error: "Invalid targetType" },
        { status: 400 }
      );
    }

    if (!targetId) {
      return NextResponse.json(
        { ok: false, error: "Missing targetId" },
        { status: 400 }
      );
    }

    const clicks = await trackClick(targetType, targetId);

    return NextResponse.json({
      ok: true,
      data: {
        targetType,
        targetId,
        clicks,
      },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
