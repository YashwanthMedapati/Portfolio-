"use client";

import { Volume2, VolumeX } from "lucide-react";
import { usePortfolioSound } from "./PortfolioSound";
import { cn } from "@/lib/utils";

export function SoundToggle({ className }: { className?: string }) {
  const { enabled, toggleEnabled } = usePortfolioSound();

  return (
    <button
      type="button"
      onClick={toggleEnabled}
      aria-label={enabled ? "Turn sound off" : "Turn sound on"}
      aria-pressed={enabled}
      title={enabled ? "Sound on" : "Sound off"}
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        enabled
          ? "border-primary/35 bg-primary-soft text-primary shadow-[0_0_18px_rgba(245,165,36,0.16)]"
          : "border-border bg-card text-muted-foreground hover:border-primary/35 hover:text-foreground",
        className
      )}
    >
      {enabled ? <Volume2 className="size-4" aria-hidden /> : <VolumeX className="size-4" aria-hidden />}
    </button>
  );
}
