"use client";

import { ReactNode, useRef } from "react";
import { motion, useMotionTemplate, useScroll, useTransform, useReducedMotion } from "framer-motion";

// Wraps About -> Contact and paints one continuous, slowly-drifting wash
// behind them - two soft brand-colored blobs that migrate across the
// section as you scroll - instead of six independently-triggered section
// animations sitting on an otherwise flat, identical background. Hero and
// the finale keep their own bespoke treatments; this is scoped to exactly
// this block via useScroll's target ref, so it never bleeds into either.
export function AmbientBackdrop({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.08, 0.92, 1], [0, 1, 1, 0]);
  const blob1X = useTransform(scrollYProgress, [0, 1], ["12%", "68%"]);
  const blob1Y = useTransform(scrollYProgress, [0, 1], ["6%", "88%"]);
  const blob2X = useTransform(scrollYProgress, [0, 1], ["92%", "28%"]);
  const blob2Y = useTransform(scrollYProgress, [0, 1], ["18%", "72%"]);

  const background = useMotionTemplate`
    radial-gradient(38rem circle at ${blob1X} ${blob1Y}, color-mix(in oklch, var(--primary) 13%, transparent), transparent 68%),
    radial-gradient(34rem circle at ${blob2X} ${blob2Y}, color-mix(in oklch, var(--brand-cyan) 11%, transparent), transparent 68%)
  `;

  return (
    <div ref={ref} className="relative">
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={
          reducedMotion
            ? {
                opacity: 0.5,
                background:
                  "radial-gradient(38rem circle at 20% 15%, color-mix(in oklch, var(--primary) 10%, transparent), transparent 68%), radial-gradient(34rem circle at 80% 75%, color-mix(in oklch, var(--brand-cyan) 9%, transparent), transparent 68%)",
              }
            : { opacity, background }
        }
      />
      {children}
    </div>
  );
}
