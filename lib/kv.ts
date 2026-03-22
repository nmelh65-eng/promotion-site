import Redis from "ioredis";

type JsonStoreClient = {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown): Promise<void>;
};

let redisClient: Redis | null = null;

function getRedisUrl(): string | null {
  return (
    process.env.REDIS_URL ||
    process.env.STORAGE_URL ||
    process.env.KV_URL ||
    null
  );
}

export function hasKVConfig(): boolean {
  return Boolean(getRedisUrl());
}

export function getKV(): JsonStoreClient | null {
  const url = getRedisUrl();

  if (!url) {
    return null;
  }

  if (!redisClient) {
    redisClient = new Redis(url, {
      maxRetriesPerRequest: 2,
      connectTimeout: 5000,
      tls: url.startsWith("rediss://") ? {} : undefined,
    });
  }

  return {
    async get<T>(key: string): Promise<T | null> {
      const raw = await redisClient!.get(key);

      if (!raw) return null;

      try {
        return JSON.parse(raw) as T;
      } catch {
        return null;
      }
    },

    async set(key: string, value: unknown): Promise<void> {
      await redisClient!.set(key, JSON.stringify(value));
    },
  };
}
