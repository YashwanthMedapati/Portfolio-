"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function SectionHeader({
  sectionId,
  title,
  description,
  className,
}: {
  sectionId: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.38, ease: "easeOut" }}
      className={cn("mb-12", className)}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="code-label shrink-0">
          <span className="text-brand-cyan/70">{"//"}</span> ~/{sectionId}
        </span>
        <motion.span
          aria-hidden
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="section-accent-line h-px flex-1 origin-left"
        />
      </div>
      <h2
        id={`${sectionId}-heading`}
        className="text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl"
      >
        {title}
      </h2>
      {description && (
        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mt-3 leading-relaxed text-pretty">
          {description}
        </p>
      )}
    </motion.div>
  );
}
