import { NextResponse } from "next/server";
import { getGithubActivity } from "@/lib/githubActivity";

export const runtime = "nodejs";

export async function GET() {
  const items = await getGithubActivity().catch(() => []);
  return NextResponse.json(
    { items },
    { headers: { "Cache-Control": "public, max-age=0, s-maxage=1800, stale-while-revalidate=3600" } }
  );
}
