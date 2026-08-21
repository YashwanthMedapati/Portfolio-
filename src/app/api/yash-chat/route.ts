import { NextRequest, NextResponse } from "next/server";
import { buildYashSystemPrompt } from "@/lib/yashSystemPrompt";
import {
  askGemini,
  checkRateLimit,
  getCachedAnswer,
  isValidQuery,
  normalizeQuery,
  setCachedAnswer,
  YashChatConfigError,
} from "@/lib/yashChatServer";

export const runtime = "nodejs";

function clientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

// A page on another origin can still POST here from a visitor's browser -
// it just can't read the response (blocked by CORS). Without this check
// that request would run anyway, burning rate-limit quota and Gemini cost
// for nothing. Only enforced when an Origin/Referer header is present:
// same-origin fetches always send one, so this only ever blocks a
// cross-origin sender, never a legitimate same-origin request that lacks
// the header for some other reason.
function isSameOrigin(req: NextRequest): boolean {
  const host = req.headers.get("host");
  if (!host) return true;
  const origin = req.headers.get("origin") ?? req.headers.get("referer");
  if (!origin) return true;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const query = (body as { query?: unknown })?.query;
  if (!isValidQuery(query)) {
    return NextResponse.json({ error: "Question must be between 1 and 300 characters" }, { status: 400 });
  }

  const normalized = normalizeQuery(query);

  const cached = await getCachedAnswer(normalized);
  if (cached) {
    return NextResponse.json({ text: cached, cached: true });
  }

  const { success } = await checkRateLimit(clientIp(req));
  if (!success) {
    return NextResponse.json(
      { error: "Too many questions right now - please try again in a few minutes" },
      { status: 429 }
    );
  }

  try {
    const answer = await askGemini(buildYashSystemPrompt(), query);
    await setCachedAnswer(normalized, answer);
    return NextResponse.json({ text: answer, cached: false });
  } catch (error) {
    if (error instanceof YashChatConfigError) {
      return NextResponse.json({ error: "Yash chat is not configured" }, { status: 503 });
    }
    return NextResponse.json({ error: "Yash chat is temporarily unavailable" }, { status: 502 });
  }
}
