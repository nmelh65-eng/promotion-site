import { NextResponse } from "next/server";
import { getAnalyticsSummary } from "@/lib/links-store";

export async function GET() {
  try {
    const summary = await getAnalyticsSummary();
    return NextResponse.json({ ok: true, data: summary });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
