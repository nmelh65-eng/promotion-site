import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import {
  getPlatformLinksLive,
  getReferralLinksLive,
  getSocialLinksLive,
  replacePlatformLinksLive,
  replaceReferralLinksLive,
  replaceSocialLinksLive,
} from "@/lib/links-store";
import type { AnalyticsTargetType } from "@/types";

const VALID_TYPES: AnalyticsTargetType[] = ["social", "platform", "referral"];

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

function parseType(value: string | null): AnalyticsTargetType | null {
  if (!value) return null;
  return VALID_TYPES.includes(value as AnalyticsTargetType)
    ? (value as AnalyticsTargetType)
    : null;
}

async function getByType(type: AnalyticsTargetType) {
  switch (type) {
    case "social":
      return getSocialLinksLive();
    case "platform":
      return getPlatformLinksLive();
    case "referral":
      return getReferralLinksLive();
  }
}

async function replaceByType(type: AnalyticsTargetType, items: unknown[]) {
  switch (type) {
    case "social":
      return replaceSocialLinksLive(items);
    case "platform":
      return replacePlatformLinksLive(items);
    case "referral":
      return replaceReferralLinksLive(items);
  }
}

export async function GET(req: NextRequest) {
  const session = await getAdminSession();

  if (!session) {
    return unauthorized();
  }

  const { searchParams } = new URL(req.url);
  const type = parseType(searchParams.get("type"));

  if (searchParams.get("type") && !type) {
    return invalid("Некорректный тип коллекции");
  }

  if (type) {
    const data = await getByType(type);
    return NextResponse.json({ ok: true, data });
  }

  const [social, platform, referral] = await Promise.all([
    getSocialLinksLive(),
    getPlatformLinksLive(),
    getReferralLinksLive(),
  ]);

  return NextResponse.json({
    ok: true,
    data: { social, platform, referral },
  });
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession();

  if (!session) {
    return unauthorized();
  }

  try {
    const body = await req.json();
    const type = parseType(String(body?.type || "").trim());

    if (!type) {
      return invalid("Некорректный тип коллекции");
    }

    if (!Array.isArray(body?.items)) {
      return invalid("Ожидается массив items");
    }

    const data = await replaceByType(type, body.items);

    return NextResponse.json({ ok: true, data });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
