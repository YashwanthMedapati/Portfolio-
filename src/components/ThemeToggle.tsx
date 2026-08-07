"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeContext";

const THUMB_SPRING = { type: "spring", stiffness: 500, damping: 30 } as const;

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      className={[
        "relative inline-flex h-8 w-[58px] shrink-0 items-center rounded-full border p-1 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isDark
          ? "border-zinc-700 bg-zinc-950 shadow-[inset_0_1px_4px_rgba(0,0,0,0.85),0_0_0_1px_rgba(245,165,36,0.12)]"
          : "border-primary/25 bg-[#f1eadc] shadow-[inset_0_1px_3px_rgba(255,255,255,0.9),0_1px_8px_rgba(154,91,18,0.12)]",
        className ?? "",
      ].join(" ")}
    >
      <Sun className="absolute left-2 size-3.5 text-primary/80" aria-hidden />
      <Moon className="absolute right-2 size-3.5 text-zinc-400" aria-hidden />
      <motion.span
        suppressHydrationWarning
        animate={{ x: isDark ? 26 : 0 }}
        transition={THUMB_SPRING}
        className={[
          "relative z-10 grid size-6 place-items-center rounded-full shadow-lg",
          isDark ? "bg-zinc-800 text-primary shadow-black/60" : "bg-white text-primary shadow-primary/20",
        ].join(" ")}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isDark ? "moon" : "sun"}
            initial={{ opacity: 0, rotate: -90, scale: 0.4 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.4 }}
            transition={{ duration: 0.18 }}
            className="grid place-items-center"
          >
            {isDark ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </button>
  );
}
