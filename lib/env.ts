const PLACEHOLDER_PASSWORDS = new Set(["", "change-me-now"]);
const PLACEHOLDER_SECRETS = new Set(["", "replace-with-a-long-random-secret"]);

function readEnv(name: string): string {
  return String(process.env[name] || "").trim();
}

function toPositiveInt(value: string, fallback: number): number {
  const normalized = Number(value);
  return Number.isFinite(normalized) && normalized > 0
    ? Math.floor(normalized)
    : fallback;
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export function getEnvStatus() {
  const adminPassword = readEnv("ADMIN_PASSWORD");
  const adminSecret = readEnv("ADMIN_SECRET");
  const siteUrl = readEnv("NEXT_PUBLIC_SITE_URL");

  const adminPasswordConfigured =
    Boolean(adminPassword) && !PLACEHOLDER_PASSWORDS.has(adminPassword);

  const adminSecretConfigured =
    Boolean(adminSecret) && !PLACEHOLDER_SECRETS.has(adminSecret);

  return {
    siteUrlConfigured: Boolean(siteUrl),
    adminPasswordConfigured,
    adminSecretConfigured,
    adminSecretWeak: Boolean(adminSecret) && adminSecret.length < 24,
  };
}

export function assertAdminEnvConfigured(): {
  password: string;
  secret: string;
} {
  const password = readEnv("ADMIN_PASSWORD");
  const secret = readEnv("ADMIN_SECRET");
  const status = getEnvStatus();

  if (!status.adminPasswordConfigured || !status.adminSecretConfigured) {
    throw new Error("Admin env is not configured");
  }

  return { password, secret };
}

export function getAdminLoginRateLimitConfig() {
  return {
    max: toPositiveInt(readEnv("ADMIN_LOGIN_RATE_LIMIT_MAX"), 5),
    windowSeconds: toPositiveInt(
      readEnv("ADMIN_LOGIN_RATE_LIMIT_WINDOW_SECONDS"),
      300
    ),
  };
}
