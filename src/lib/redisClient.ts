import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let redis: Redis | null | undefined;

// Upstash credentials are optional: without them, callers fall back to a
// best-effort in-memory limiter (fine for local dev, not shared across
// serverless instances - see .env.example for why production should set
// these).
export function getRedis(): Redis | null {
  if (redis !== undefined) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  redis = url && token ? new Redis({ url, token }) : null;
  return redis;
}

const limiters = new Map<string, Ratelimit>();

// Per-instance fallback so local dev (no Upstash configured) still has some
// protection. Not shared across instances/regions - not a substitute for
// the real limiter in production. Keyed by prefix so different routes'
// in-memory counters don't collide.
const memoryHits = new Map<string, Map<string, { count: number; resetAt: number }>>();

function checkMemoryRateLimit(prefix: string, key: string, limit: number, windowMs: number): { success: boolean } {
  const now = Date.now();
  const bucket = memoryHits.get(prefix) ?? new Map();
  memoryHits.set(prefix, bucket);
  const entry = bucket.get(key);
  if (!entry || entry.resetAt < now) {
    bucket.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true };
  }
  entry.count += 1;
  return { success: entry.count <= limit };
}

export async function checkRateLimit(
  prefix: string,
  key: string,
  limit: number,
  window: `${number} ${"ms" | "s" | "m" | "h" | "d"}`
): Promise<{ success: boolean }> {
  const client = getRedis();
  if (!client) {
    const [amount, unit] = window.split(" ");
    const unitMs = { ms: 1, s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit] ?? 60_000;
    return checkMemoryRateLimit(prefix, key, limit, Number(amount) * unitMs);
  }
  let limiter = limiters.get(prefix);
  if (!limiter) {
    limiter = new Ratelimit({ redis: client, limiter: Ratelimit.slidingWindow(limit, window), prefix });
    limiters.set(prefix, limiter);
  }
  return limiter.limit(key);
}
