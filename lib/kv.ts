import Redis from "ioredis";

type JsonStoreClient = {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown): Promise<void>;
};

function getRedisUrl(): string | null {
  return (
    process.env.REDIS_URL ||
    process.env.STORAGE_URL ||
    process.env.KV_URL ||
    null
  );
}

function createRedisClient(url: string): Redis {
  return new Redis(url, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    connectTimeout: 5000,
    tls: url.startsWith("rediss://") ? {} : undefined,
  });
}

async function withRedis<T>(fn: (redis: Redis) => Promise<T>): Promise<T> {
  const url = getRedisUrl();

  if (!url) {
    throw new Error("KV is not configured");
  }

  const redis = createRedisClient(url);

  try {
    await redis.connect();
    return await fn(redis);
  } finally {
    try {
      await redis.quit();
    } catch {
      redis.disconnect();
    }
  }
}

export function hasKVConfig(): boolean {
  return Boolean(getRedisUrl());
}

export function getKV(): JsonStoreClient | null {
  const url = getRedisUrl();

  if (!url) {
    return null;
  }

  return {
    async get<T>(key: string): Promise<T | null> {
      return withRedis(async (redis) => {
        const raw = await redis.get(key);

        if (!raw) {
          return null;
        }

        try {
          return JSON.parse(raw) as T;
        } catch {
          return null;
        }
      });
    },

    async set(key: string, value: unknown): Promise<void> {
      await withRedis(async (redis) => {
        await redis.set(key, JSON.stringify(value));
      });
    },
  };
}
