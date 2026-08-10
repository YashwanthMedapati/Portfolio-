"use client";

import { useEffect, useState } from "react";

export type ActiveSectionIntro = { id: string; text: string };

// Watches each keyed section element and reports whichever one just became
// the most-visible - debounced briefly so a fast scroll-through doesn't
// fire an announcement for every section it passes.
export function useActiveSectionIntro(
  blurbs: Record<string, string>,
  options?: { enabled?: boolean }
): ActiveSectionIntro | null {
  const [active, setActive] = useState<ActiveSectionIntro | null>(null);
  const enabled = options?.enabled ?? true;

  useEffect(() => {
    if (!enabled) return;
    const entries = Object.keys(blurbs)
      .map((id) => ({ id, el: document.getElementById(id) }))
      .filter((e): e is { id: string; el: HTMLElement } => !!e.el);
    if (entries.length === 0) return;

    let pending: { id: string; timer: ReturnType<typeof setTimeout> } | null = null;

    const observer = new IntersectionObserver(
      (observed) => {
        const best = observed
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!best) return;
        const id = best.target.id;
        if (pending?.id === id) return;
        if (pending) clearTimeout(pending.timer);
        const timer = setTimeout(() => {
          pending = null;
          setActive({ id, text: blurbs[id] });
        }, 260);
        pending = { id, timer };
      },
      // Matches Nav's own active-section tracking: a thin band near the top
      // of the viewport, not "50% of the section visible" - the latter
      // mathematically can't be reached by a section taller than ~1.4x the
      // viewport (exactly what was silently dropping the Projects intro).
      { threshold: [0, 0.25, 0.5, 1], rootMargin: "-30% 0px -55% 0px" }
    );

    entries.forEach(({ el }) => observer.observe(el));
    return () => {
      observer.disconnect();
      if (pending) clearTimeout(pending.timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- blurbs is a stable module-level object
  }, [enabled]);

  return active;
}
