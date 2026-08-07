"use client";

import { useEffect, useState } from "react";

const COMMAND = "whoami";
const TYPE_INTERVAL_MS = 70;
const POST_TYPE_DELAY_MS = 320;

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useHeroBoot() {
  const [reduced] = useState(prefersReducedMotion);
  const [typed, setTyped] = useState(reduced ? COMMAND : "");
  const [resolved, setResolved] = useState(reduced);

  useEffect(() => {
    if (reduced) return;

    let i = 0;
    const typeTimer = setInterval(() => {
      i += 1;
      setTyped(COMMAND.slice(0, i));
      if (i >= COMMAND.length) {
        clearInterval(typeTimer);
        setTimeout(() => setResolved(true), POST_TYPE_DELAY_MS);
      }
    }, TYPE_INTERVAL_MS);

    return () => clearInterval(typeTimer);
  }, [reduced]);

  return { typed, resolved, done: typed === COMMAND };
}

export function HeroBootLine({ typed, done }: { typed: string; done: boolean }) {
  return (
    <div className="mb-7 font-mono text-sm text-muted-foreground select-none">
      <span className="text-brand-cyan">yash</span>
      <span className="text-muted-foreground">@</span>
      <span className="text-primary">portfolio</span>
      <span className="text-muted-foreground">:~$ </span>
      <span className="text-foreground">{typed}</span>
      <span
        aria-hidden
        className={`inline-block w-[7px] h-[1em] -mb-[1px] ml-0.5 bg-primary align-middle ${
          done ? "animate-caret" : ""
        }`}
      />
    </div>
  );
}
