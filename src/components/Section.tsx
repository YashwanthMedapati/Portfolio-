"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";
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

  return (
    <motion.section
      id={id}
      aria-labelledby={`${id}-heading`}
      initial={reducedMotion ? false : { opacity: 0, y: 24, scale: 0.992, filter: "blur(4px)" }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.2, margin: "-8% 0px -10% 0px" }}
      transition={{
        opacity: { duration: 0.45, ease: "easeOut" },
        filter: { duration: 0.45, ease: "easeOut" },
        y: { type: "spring", stiffness: 90, damping: 24, mass: 0.7 },
        scale: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
      }}
      className={cn(
        "group/section relative scroll-mt-20 py-20 sm:py-28 px-6 max-w-5xl mx-auto",
        className
      )}
    >
      <motion.span
        aria-hidden
        initial={reducedMotion ? false : { opacity: 0, scaleX: 0 }}
        whileInView={reducedMotion ? undefined : { opacity: 1, scaleX: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute left-6 right-6 top-8 h-px origin-left bg-linear-to-r from-transparent via-primary/35 to-transparent"
      />
      {children}
    </motion.section>
  );
}
