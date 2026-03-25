import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import {
  deleteWorkLive,
  getAllWorksLive,
  getAnyWorkByIdLive,
  upsertWorkLive,
} from "@/lib/works-store";
import type { ModerationState } from "@/lib/works-store";
import type { WorkCategory } from "@/types";

const VALID_CATEGORIES: WorkCategory[] = ["poetry", "prose"];
const VALID_STATES: ModerationState[] = [
  "draft",
  "review",
  "published",
  "archived",
];

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

function parseState(value: unknown): ModerationState | undefined {
  const normalized = String(value || "").trim();
  return VALID_STATES.includes(normalized as ModerationState)
    ? (normalized as ModerationState)
    : undefined;
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
    const moderationStateInput = String(body?.moderationState || "").trim();
    const moderationState = parseState(moderationStateInput);
    const isHidden =
      typeof body?.isHidden === "boolean" ? body.isHidden : false;
    const moderationNotes = String(body?.moderationNotes || "").trim();

    if (!title) return invalid("Укажите заголовок");
    if (!content) return invalid("Укажите текст");
    if (!VALID_CATEGORIES.includes(category)) {
      return invalid("Некорректная категория");
    }
    if (moderationStateInput && !moderationState) {
      return invalid("Некорректный moderationState");
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
      moderationState,
      isHidden,
      moderationNotes,
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
    const moderationStateInput = String(body?.moderationState || "").trim();
    const moderationState = parseState(moderationStateInput);
    const isHidden =
      typeof body?.isHidden === "boolean" ? body.isHidden : false;
    const moderationNotes = String(body?.moderationNotes || "").trim();

    if (!id) return invalid("Не указан id");
    if (!title) return invalid("Укажите заголовок");
    if (!content) return invalid("Укажите текст");
    if (!VALID_CATEGORIES.includes(category)) {
      return invalid("Некорректная категория");
    }
    if (moderationStateInput && !moderationState) {
      return invalid("Некорректный moderationState");
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
      moderationState,
      isHidden,
      moderationNotes,
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
    const moderationStateInput = String(body?.moderationState || "").trim();
    const moderationState = moderationStateInput
      ? parseState(moderationStateInput)
      : undefined;

    if (!id) {
      return invalid("Не указан id");
    }

    if (moderationStateInput && !moderationState) {
      return invalid("Некорректный moderationState");
    }

    const existing = await getAnyWorkByIdLive(id);

    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "Not found" },
        { status: 404 }
      );
    }

    const nextState =
      moderationState ||
      existing.moderationState ||
      (existing.isPublished ? "published" : "draft");

    const nextFeatured =
      typeof body?.isFeatured === "boolean"
        ? body.isFeatured
        : existing.isFeatured;

    const nextHidden =
      typeof body?.isHidden === "boolean"
        ? body.isHidden
        : existing.isHidden;

    const moderationNotes =
      body?.moderationNotes !== undefined
        ? String(body.moderationNotes || "").trim()
        : String(existing.moderationNotes || "").trim();

    const work = await upsertWorkLive({
      id: existing.id,
      title: existing.title,
      excerpt: existing.excerpt,
      content: existing.content,
      category: existing.category,
      tags: existing.tags,
      language: existing.language || "ru",
      isPublished: nextState === "published",
      isFeatured: nextState === "published" ? Boolean(nextFeatured) : false,
      moderationState: nextState,
      isHidden: nextState === "published" ? Boolean(nextHidden) : false,
      moderationNotes,
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
