import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, createAdminToken } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const password = String(body?.password || "");

    if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { ok: false, error: "Admin env is not configured" },
        { status: 500 }
      );
    }

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { ok: false, error: "Неверный пароль" },
        { status: 401 }
      );
    }

    const token = await createAdminToken("admin");

    const response = NextResponse.json({
      ok: true,
      data: { authenticated: true },
    });

    response.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
