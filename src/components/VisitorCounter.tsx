"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "yash-portfolio-local-visit-count";

export function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const previous = Number(window.localStorage.getItem(STORAGE_KEY) ?? "0");
    const next = Number.isFinite(previous) ? previous + 1 : 1;
    window.localStorage.setItem(STORAGE_KEY, String(next));
    const timer = window.setTimeout(() => setCount(next), 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 font-mono text-[11px] text-muted-foreground">
      <span className="size-1.5 rounded-full bg-brand-cyan shadow-[0_0_10px_var(--brand-cyan)]" aria-hidden />
      {count === null ? "Counting visit..." : `Your visit #${String(count).padStart(4, "0")}`}
    </span>
  );
}
