"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ReactNode, useRef } from "react";
import { cn } from "@/lib/utils";

export function Section({
  id,
  children,
  className,
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  // Scroll-linked, not viewport-triggered-once: the reveal is a direct
  // function of scroll position, so it plays out exactly as the section
  // crosses into frame (and reverses if you scroll back up past it) instead
  // of firing once off an IntersectionObserver callback that can finish
  // before a normal scroll speed even brings the section into view.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 90%", "start 40%"],
  });

  const opacity = useTransform(scrollYProgress, [0.15, 0.9], [0, 1]);
  const y = useTransform(scrollYProgress, [0.15, 0.9], [26, 0]);
  const scale = useTransform(scrollYProgress, [0.15, 0.9], [0.99, 1]);
  const blurPx = useTransform(scrollYProgress, [0.15, 0.9], [5, 0]);
  const filter = useTransform(blurPx, (v) => `blur(${v}px)`);

  const stemScaleY = useTransform(scrollYProgress, [0, 0.32], [0, 1]);
  const nodeScale = useTransform(scrollYProgress, [0.26, 0.36, 0.46], [0, 1.4, 1]);
  const nodeOpacity = useTransform(scrollYProgress, [0.26, 0.34], [0, 1]);
  const lineScaleX = useTransform(scrollYProgress, [0.36, 0.8], [0, 1]);
  const lineOpacity = useTransform(scrollYProgress, [0.36, 0.46], [0, 1]);

  return (
    <motion.section
      ref={ref}
      id={id}
      aria-labelledby={`${id}-heading`}
      style={reducedMotion ? undefined : { opacity, y, scale, filter }}
      className={cn(
        "group/section relative scroll-mt-20 px-5 py-16 sm:px-6 sm:py-28 max-w-5xl mx-auto",
        className
      )}
    >
      {/*
        A terminal "tree connector" scrubbed by scroll instead of played
        once: a stem draws down out of the gap above, a node lands at the
        corner, then the line sweeps across - the same drawing gesture a
        directory listing makes, which is what the `// ~/section-id` labels
        below are already imitating.
      */}
      <motion.span
        aria-hidden
        style={reducedMotion ? undefined : { scaleY: stemScaleY }}
        className="pointer-events-none absolute -top-10 left-6 h-10 w-px origin-bottom bg-linear-to-b from-transparent to-primary/35 sm:-top-14 sm:h-14"
      />
      <motion.span
        aria-hidden
        style={reducedMotion ? undefined : { opacity: nodeOpacity, scale: nodeScale }}
        className="pointer-events-none absolute left-6 top-8 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary"
      />
      <motion.span
        aria-hidden
        style={reducedMotion ? undefined : { opacity: lineOpacity, scaleX: lineScaleX }}
        className="pointer-events-none absolute left-6 right-6 top-8 h-px origin-left bg-linear-to-r from-transparent via-primary/35 to-transparent"
      />
      {children}
    </motion.section>
  );
}
