export class YashChatError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

async function requestOnce(query: string): Promise<string> {
  const response = await fetch("/api/yash-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new YashChatError(body?.error || "Yash chat request failed", response.status);
  }

  const data = await response.json();
  if (typeof data?.text !== "string") throw new YashChatError("Yash chat returned no answer");
  return data.text;
}

// A 502 (upstream Gemini hiccup) or a raw network failure is usually a
// one-off blip worth retrying once - unlike a 429 (rate limited, retrying
// immediately just gets limited again) or 503 (AI chat not configured,
// retrying can't fix a missing API key), which fail the same way every time.
export async function askYashChat(query: string): Promise<string> {
  try {
    return await requestOnce(query);
  } catch (error) {
    const worthRetrying = !(error instanceof YashChatError) || error.status === 502;
    if (!worthRetrying) throw error;
    await new Promise((resolve) => setTimeout(resolve, 600));
    return requestOnce(query);
  }
}
