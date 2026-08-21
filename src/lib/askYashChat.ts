export class YashChatError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

export async function askYashChat(query: string): Promise<string> {
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
