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
        "group/section relative scroll-mt-20 px-5 py-16 sm:px-6 sm:py-28 max-w-5xl mx-auto",
        className
      )}
    >
      {children}
    </motion.section>
  );
}
