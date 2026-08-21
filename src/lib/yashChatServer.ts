import "server-only";
import { checkRateLimit as checkRateLimitShared, getRedis } from "./redisClient";

const CACHE_TTL_SECONDS = 60 * 60 * 24 * 7;
const MAX_QUERY_LENGTH = 300;
const MAX_OUTPUT_TOKENS = 220;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

export async function checkRateLimit(ip: string): Promise<{ success: boolean }> {
  return checkRateLimitShared("yash-chat:ratelimit", ip, 8, "10 m");
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
