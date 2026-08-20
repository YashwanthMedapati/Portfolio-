"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CircleDot, GitBranch, GitCommitHorizontal, GitPullRequest } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type ActivityItem = { id: string; text: string; repo: string; url: string; date: string };

function iconFor(text: string) {
  if (text.startsWith("Pushed")) return GitCommitHorizontal;
  if (text.startsWith("Created")) return GitBranch;
  if (text.includes("pull request")) return GitPullRequest;
  return CircleDot;
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `${Math.max(mins, 1)}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

// Renders nothing at all when there's no activity to show (loading, error,
// or a genuinely quiet stretch) - an empty "recent activity" panel reads
// worse than no panel.
export function GithubActivity() {
  const [items, setItems] = useState<ActivityItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/github-activity")
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data) => {
        if (!cancelled) setItems(Array.isArray(data.items) ? data.items : []);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!items || items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, delay: 0.24 }}
      className="mt-5"
    >
      <Card className="ring-0 border border-border">
        <CardContent>
          <h3 className="text-sm font-semibold text-muted-foreground mb-4 tracking-wide uppercase flex items-center gap-2">
            <GitCommitHorizontal size={15} className="text-primary" />
            Recent GitHub Activity
          </h3>
          <ul className="flex flex-col gap-3">
            {items.map((item) => {
              const Icon = iconFor(item.text);
              return (
                <li key={item.id} className="flex items-start gap-2.5 text-sm">
                  <Icon size={15} className="mt-0.5 shrink-0 text-primary" aria-hidden />
                  <span className="min-w-0 text-muted-foreground">
                    {item.text} in{" "}
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-foreground underline decoration-border underline-offset-2 hover:text-primary"
                    >
                      {item.repo}
                    </a>
                    <span className="text-xs text-muted-foreground/70"> - {relativeTime(item.date)}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}
