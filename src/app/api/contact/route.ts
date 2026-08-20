import { NextRequest, NextResponse } from "next/server";
import {
  checkContactRateLimit,
  ContactConfigError,
  isValidContactPayload,
  sendContactEmail,
} from "@/lib/contactServer";

export const runtime = "nodejs";

function clientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

// Same protection as /api/yash-chat: a page on another origin can still
// POST here from a visitor's browser even though it can't read the
// response, which would otherwise let it trigger real emails against a
// metered quota for free.
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

  if (!isValidContactPayload(body)) {
    return NextResponse.json({ error: "Please fill in a valid name, email, and message" }, { status: 400 });
  }

  const { success } = await checkContactRateLimit(clientIp(req));
  if (!success) {
    return NextResponse.json(
      { error: "Too many messages right now - please try again in a few minutes" },
      { status: 429 }
    );
  }

  try {
    await sendContactEmail(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ContactConfigError) {
      return NextResponse.json({ error: "Contact form is not configured" }, { status: 503 });
    }
    return NextResponse.json({ error: "Message could not be sent right now" }, { status: 502 });
  }
}
