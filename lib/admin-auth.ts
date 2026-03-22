import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify, SignJWT } from "jose";

export const ADMIN_COOKIE_NAME = "promotion_admin_session";

function getAdminSecretKey() {
  const secret = process.env.ADMIN_SECRET;

  if (!secret) {
    throw new Error("Missing ADMIN_SECRET");
  }

  return new TextEncoder().encode(secret);
}

export async function createAdminToken(username = "admin") {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(username)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getAdminSecretKey());
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getAdminSecretKey());

    return {
      username: String(payload.sub || "admin"),
      role: String(payload.role || "admin"),
    };
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return session;
}
