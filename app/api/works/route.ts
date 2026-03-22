import { NextRequest, NextResponse } from "next/server";
import {
  getPublishedWorksLive,
  getWorksByCategoryLive,
  getWorkByIdLive,
  incrementViews,
} from "@/lib/works-store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const category = searchParams.get("category");

  if (id) {
    const work = await getWorkByIdLive(id);

    if (!work) {
      return NextResponse.json(
        { ok: false, error: "Not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: work });
  }

  if (category === "poetry" || category === "prose") {
    const works = await getWorksByCategoryLive(category);
    return NextResponse.json({ ok: true, data: works });
  }

  const works = await getPublishedWorksLive();
  return NextResponse.json({ ok: true, data: works });
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, action } = body;

    if (!id || action !== "view") {
      return NextResponse.json(
        { ok: false, error: "Invalid payload" },
        { status: 400 }
      );
    }

    const updated = await incrementViews(id);

    if (!updated) {
      return NextResponse.json(
        { ok: false, error: "Not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
