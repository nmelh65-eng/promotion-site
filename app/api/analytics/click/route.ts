import { NextRequest, NextResponse } from "next/server";
import { trackClick } from "@/lib/links-store";
import type { AnalyticsTargetType } from "@/types";

const ALLOWED_TARGETS: AnalyticsTargetType[] = ["social", "platform", "referral"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetType, targetId } = body ?? {};

    if (
      !targetType ||
      !targetId ||
      !ALLOWED_TARGETS.includes(targetType as AnalyticsTargetType)
    ) {
      return NextResponse.json(
        { ok: false, error: "Invalid payload" },
        { status: 400 }
      );
    }

    const clicks = await trackClick(targetType as AnalyticsTargetType, targetId);

    return NextResponse.json({
      ok: true,
      data: {
        targetType,
        targetId,
        clicks,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
