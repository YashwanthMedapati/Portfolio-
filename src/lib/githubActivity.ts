import "server-only";
import { personal } from "@/data/resume";
import { getRedis } from "./redisClient";

const GITHUB_USERNAME = personal.githubHandle.split("/").pop() ?? "";
const CACHE_TTL_SECONDS = 60 * 60; // 1h - keeps well inside GitHub's 60 req/hr unauthenticated limit
const CACHE_KEY = `github-activity:${GITHUB_USERNAME}`;

export type ActivityItem = {
  id: string;
  text: string;
  repo: string;
  url: string;
  date: string;
};

type GithubEvent = {
  id: string;
  type: string;
  created_at: string;
  repo: { name: string };
  payload: Record<string, unknown>;
};

// Only the event types that actually read as "building something" - skips
// noisier ones (stars, forks, watch) that aren't really Yash's own work.
function describeEvent(event: GithubEvent): string | null {
  const payload = event.payload;
  switch (event.type) {
    case "PushEvent": {
      const commits = Array.isArray(payload.commits) ? payload.commits : [];
      const count = (payload.size as number | undefined) ?? commits.length;
      if (!count) return null;
      return `Pushed ${count} commit${count === 1 ? "" : "s"}`;
    }
    case "CreateEvent":
      if (payload.ref_type === "repository") return "Created the repository";
      if (payload.ref_type === "branch") return `Created branch ${payload.ref}`;
      return null;
    case "PullRequestEvent": {
      const action = payload.action as string | undefined;
      if (action !== "opened" && action !== "merged") return null;
      const pr = payload.pull_request as { title?: string } | undefined;
      return `${action === "merged" ? "Merged" : "Opened"} a pull request${pr?.title ? `: ${pr.title}` : ""}`;
    }
    case "IssuesEvent": {
      if (payload.action !== "opened") return null;
      const issue = payload.issue as { title?: string } | undefined;
      return `Opened an issue${issue?.title ? `: ${issue.title}` : ""}`;
    }
    default:
      return null;
  }
}

async function fetchFromGithub(): Promise<ActivityItem[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=30`, {
      headers: { Accept: "application/vnd.github+json", "User-Agent": "portfolio-site" },
      signal: controller.signal,
    });
    if (!response.ok) return [];

    const events = (await response.json()) as GithubEvent[];
    const items: ActivityItem[] = [];
    for (const event of events) {
      const text = describeEvent(event);
      if (!text) continue;
      items.push({
        id: event.id,
        text,
        repo: event.repo.name,
        url: `https://github.com/${event.repo.name}`,
        date: event.created_at,
      });
      if (items.length >= 5) break;
    }
    return items;
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

export async function getGithubActivity(): Promise<ActivityItem[]> {
  const redis = getRedis();
  if (redis) {
    const cached = await redis.get<ActivityItem[]>(CACHE_KEY);
    if (cached) return cached;
  }

  const items = await fetchFromGithub();
  if (redis && items.length > 0) {
    await redis.set(CACHE_KEY, items, { ex: CACHE_TTL_SECONDS });
  }
  return items;
}
