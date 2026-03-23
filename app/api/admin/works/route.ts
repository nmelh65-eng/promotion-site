import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import {
  deleteWorkLive,
  getAllWorksLive,
  getAnyWorkByIdLive,
  upsertWorkLive,
} from "@/lib/works-store";
import type { WorkCategory } from "@/types";

const VALID_CATEGORIES: WorkCategory[] = ["poetry", "prose"];

function unauthorized() {
  return NextResponse.json(
    { ok: false, error: "Unauthorized" },
    { status: 401 }
  );
}

function invalid(message: string) {
  return NextResponse.json(
    { ok: false, error: message },
    { status: 400 }
  );
}

export async function GET(req: NextRequest) {
  const session = await getAdminSession();

  if (!session) {
    return unauthorized();
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    const work = await getAnyWorkByIdLive(id);

    if (!work) {
      return NextResponse.json(
        { ok: false, error: "Not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: work });
  }

  const works = await getAllWorksLive();
  return NextResponse.json({ ok: true, data: works });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();

  if (!session) {
    return unauthorized();
  }

  try {
    const body = await req.json();

    const title = String(body?.title || "").trim();
    const excerpt = String(body?.excerpt || "").trim();
    const content = String(body?.content || "").trim();
    const category = String(body?.category || "").trim() as WorkCategory;
    const tags = body?.tags;
    const isPublished = Boolean(body?.isPublished);
    const isFeatured = Boolean(body?.isFeatured);

    if (!title) return invalid("Укажите заголовок");
    if (!content) return invalid("Укажите текст");
    if (!VALID_CATEGORIES.includes(category)) {
      return invalid("Некорректная категория");
    }

    const work = await upsertWorkLive({
      title,
      excerpt,
      content,
      category,
      tags,
      language: "ru",
      isPublished,
      isFeatured,
    });

    return NextResponse.json({ ok: true, data: work });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession();

  if (!session) {
    return unauthorized();
  }

  try {
    const body = await req.json();

    const id = String(body?.id || "").trim();
    const title = String(body?.title || "").trim();
    const excerpt = String(body?.excerpt || "").trim();
    const content = String(body?.content || "").trim();
    const category = String(body?.category || "").trim() as WorkCategory;
    const tags = body?.tags;
    const isPublished = Boolean(body?.isPublished);
    const isFeatured = Boolean(body?.isFeatured);

    if (!id) return invalid("Не указан id");
    if (!title) return invalid("Укажите заголовок");
    if (!content) return invalid("Укажите текст");
    if (!VALID_CATEGORIES.includes(category)) {
      return invalid("Некорректная категория");
    }

    const existing = await getAnyWorkByIdLive(id);

    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "Not found" },
        { status: 404 }
      );
    }

    const work = await upsertWorkLive({
      id,
      title,
      excerpt,
      content,
      category,
      tags,
      language: existing.language || "ru",
      isPublished,
      isFeatured,
    });

    return NextResponse.json({ ok: true, data: work });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();

  if (!session) {
    return unauthorized();
  }

  try {
    const body = await req.json();

    const id = String(body?.id || "").trim();

    if (!id) {
      return invalid("Не указан id");
    }

    const existing = await getAnyWorkByIdLive(id);

    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "Not found" },
        { status: 404 }
      );
    }

    const nextIsPublished =
      typeof body?.isPublished === "boolean"
        ? body.isPublished
        : existing.isPublished;

    const nextIsFeatured =
      typeof body?.isFeatured === "boolean"
        ? body.isFeatured
        : existing.isFeatured;

    const work = await upsertWorkLive({
      id: existing.id,
      title: existing.title,
      excerpt: existing.excerpt,
      content: existing.content,
      category: existing.category,
      tags: existing.tags,
      language: existing.language || "ru",
      isPublished: nextIsPublished,
      isFeatured: nextIsPublished ? nextIsFeatured : false,
    });

    return NextResponse.json({ ok: true, data: work });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();

  if (!session) {
    return unauthorized();
  }

  const { searchParams } = new URL(req.url);
  const id = String(searchParams.get("id") || "").trim();

  if (!id) {
    return invalid("Не указан id");
  }

  const ok = await deleteWorkLive(id);

  if (!ok) {
    return NextResponse.json(
      { ok: false, error: "Not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, data: { deleted: true } });
}
