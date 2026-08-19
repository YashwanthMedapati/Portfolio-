import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const CACHE_TTL_SECONDS = 60 * 60 * 24 * 60; // 60 days - personal facts rarely change
const MAX_QUERY_LENGTH = 300;
const MAX_OUTPUT_TOKENS = 220;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

let redis: Redis | null | undefined;

// Upstash credentials are optional: without them the route still works, it
// just skips the shared cache and falls back to a best-effort in-memory rate
// limiter (fine for local dev, not reliable across serverless instances -
// see README setup notes for why production should set these).
function getRedis(): Redis | null {
  if (redis !== undefined) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  redis = url && token ? new Redis({ url, token }) : null;
  return redis;
}

let ratelimiter: Ratelimit | null | undefined;
function getRatelimiter(): Ratelimit | null {
  if (ratelimiter !== undefined) return ratelimiter;
  const client = getRedis();
  ratelimiter = client
    ? new Ratelimit({
        redis: client,
        limiter: Ratelimit.slidingWindow(8, "10 m"),
        prefix: "yash-chat:ratelimit",
      })
    : null;
  return ratelimiter;
}

// Per-instance fallback so local dev (no Upstash configured) still has some
// protection. Not shared across instances/regions - not a substitute for the
// real limiter in production.
const memoryHits = new Map<string, { count: number; resetAt: number }>();
const MEMORY_LIMIT = 8;
const MEMORY_WINDOW_MS = 10 * 60 * 1000;

function checkMemoryRateLimit(ip: string): { success: boolean } {
  const now = Date.now();
  const entry = memoryHits.get(ip);
  if (!entry || entry.resetAt < now) {
    memoryHits.set(ip, { count: 1, resetAt: now + MEMORY_WINDOW_MS });
    return { success: true };
  }
  entry.count += 1;
  return { success: entry.count <= MEMORY_LIMIT };
}

export async function checkRateLimit(ip: string): Promise<{ success: boolean }> {
  const limiter = getRatelimiter();
  if (limiter) return limiter.limit(ip);
  return checkMemoryRateLimit(ip);
}

export function normalizeQuery(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, " ").replace(/[?!.]+$/g, "");
}

export function isValidQuery(query: unknown): query is string {
  return typeof query === "string" && query.trim().length > 0 && query.length <= MAX_QUERY_LENGTH;
}

export async function getCachedAnswer(normalizedQuery: string): Promise<string | null> {
  const client = getRedis();
  if (!client) return null;
  const cached = await client.get<string>(`yash-chat:answer:${normalizedQuery}`);
  return cached ?? null;
}

export async function setCachedAnswer(normalizedQuery: string, answer: string): Promise<void> {
  const client = getRedis();
  if (!client) return;
  await client.set(`yash-chat:answer:${normalizedQuery}`, answer, { ex: CACHE_TTL_SECONDS });
}

export class YashChatConfigError extends Error {}
export class YashChatUpstreamError extends Error {}

export async function askGemini(systemPrompt: string, query: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new YashChatConfigError("GEMINI_API_KEY is not configured");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: query }] }],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: MAX_OUTPUT_TOKENS,
          },
        }),
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error(`Gemini API error ${response.status}:`, body);
      throw new YashChatUpstreamError(`Gemini API responded with ${response.status}`);
    }

    const data = await response.json();
    const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new YashChatUpstreamError("Gemini API returned no text");
    return text.trim();
  } finally {
    clearTimeout(timeout);
  }
}
