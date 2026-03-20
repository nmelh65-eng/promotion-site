import { NextRequest, NextResponse } from "next/server";
import { getPublishedWorks, getWorksByCategory, getWorkById } from "@/lib/works-store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const category = searchParams.get("category");

  if (id) {
    const work = getWorkById(id);
    if (!work) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, data: work });
  }

  if (category === "poetry" || category === "prose") {
    return NextResponse.json({ ok: true, data: getWorksByCategory(category) });
  }

  return NextResponse.json({ ok: true, data: getPublishedWorks() });
}
