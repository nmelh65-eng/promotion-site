import { getKV } from "@/lib/kv";

const SUBSCRIBERS_KEY = "promotion-site:subscribers:v1";

export interface SubscriberRecord {
  email: string;
  source: string;
  createdAt: string;
}

export interface SubscribeResult {
  status: "created" | "duplicate";
  subscriber: SubscriberRecord;
}

declare global {
  var __promotionSubscribersMemory: SubscriberRecord[] | undefined;
}

function getMemorySubscribers(): SubscriberRecord[] {
  if (!globalThis.__promotionSubscribersMemory) {
    globalThis.__promotionSubscribersMemory = [];
  }

  return globalThis.__promotionSubscribersMemory;
}

function normalizeEmail(value: string): string {
  return String(value || "").trim().toLowerCase();
}

function normalizeSource(value: string): string {
  return String(value || "").trim() || "unknown";
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeSubscriber(value: unknown): SubscriberRecord | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const item = value as Partial<SubscriberRecord>;
  const email = normalizeEmail(String(item.email || ""));
  const source = normalizeSource(String(item.source || "unknown"));
  const createdAt = String(item.createdAt || "").trim();

  if (!email || !isValidEmail(email) || !createdAt) {
    return null;
  }

  return {
    email,
    source,
    createdAt,
  };
}

function sortSubscribers(items: SubscriberRecord[]): SubscriberRecord[] {
  return [...items].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

async function readSubscribers(): Promise<SubscriberRecord[]> {
  const client = getKV();

  if (client) {
    try {
      const stored = await client.get<SubscriberRecord[]>(SUBSCRIBERS_KEY);

      if (Array.isArray(stored)) {
        return sortSubscribers(
          stored
            .map((item) => normalizeSubscriber(item))
            .filter(Boolean) as SubscriberRecord[]
        );
      }
    } catch (error) {
      console.error("Subscribers read error:", error);
    }
  }

  return sortSubscribers(getMemorySubscribers());
}

async function writeSubscribers(next: SubscriberRecord[]): Promise<void> {
  const sorted = sortSubscribers(next);
  const client = getKV();

  if (client) {
    try {
      await client.set(SUBSCRIBERS_KEY, sorted);
      return;
    } catch (error) {
      console.error("Subscribers write error:", error);
    }
  }

  globalThis.__promotionSubscribersMemory = sorted;
}

export async function getAllSubscribersLive(): Promise<SubscriberRecord[]> {
  return readSubscribers();
}

export async function subscribeEmailLive(input: {
  email: string;
  source?: string;
}): Promise<SubscribeResult> {
  const email = normalizeEmail(input.email);
  const source = normalizeSource(input.source || "unknown");

  if (!email || !isValidEmail(email)) {
    throw new Error("Некорректный email");
  }

  const all = await readSubscribers();
  const existing = all.find((item) => item.email === email);

  if (existing) {
    return {
      status: "duplicate",
      subscriber: existing,
    };
  }

  const created: SubscriberRecord = {
    email,
    source,
    createdAt: new Date().toISOString(),
  };

  await writeSubscribers([created, ...all]);

  return {
    status: "created",
    subscriber: created,
  };
}
