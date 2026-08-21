import "server-only";
import { personal } from "@/data/resume";
import { checkRateLimit } from "./redisClient";

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 2000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ContactPayload = { name: string; email: string; message: string };

export function isValidContactPayload(body: unknown): body is ContactPayload {
  if (typeof body !== "object" || body === null) return false;
  const { name, email, message } = body as Record<string, unknown>;
  return (
    typeof name === "string" &&
    name.trim().length > 0 &&
    name.length <= MAX_NAME_LENGTH &&
    typeof email === "string" &&
    email.length <= MAX_EMAIL_LENGTH &&
    EMAIL_PATTERN.test(email) &&
    typeof message === "string" &&
    message.trim().length > 0 &&
    message.length <= MAX_MESSAGE_LENGTH
  );
}

export async function checkContactRateLimit(ip: string): Promise<{ success: boolean }> {
  return checkRateLimit("contact:ratelimit", ip, 3, "10 m");
}

export class ContactConfigError extends Error {}
export class ContactUpstreamError extends Error {}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendContactEmail({ name, email, message }: ContactPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new ContactConfigError("RESEND_API_KEY is not configured");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        // Resend's shared sending domain - works without owning/verifying a
        // custom domain. Swap to a verified address once one exists.
        from: "Portfolio Contact Form <onboarding@resend.dev>",
        to: personal.email,
        reply_to: email,
        subject: `Portfolio contact from ${name}`,
        html: `<p><strong>From:</strong> ${escapeHtml(name)} (${escapeHtml(email)})</p><p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>`,
        text: `From: ${name} (${email})\n\n${message}`,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error(`Resend API error ${response.status}:`, body);
      throw new ContactUpstreamError(`Resend API responded with ${response.status}`);
    }
  } finally {
    clearTimeout(timeout);
  }
}
