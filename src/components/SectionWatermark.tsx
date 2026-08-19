import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Corner = "top-right" | "bottom-left" | "top-left" | "bottom-right";

const cornerClasses: Record<Corner, string> = {
  "top-right": "top-6 right-6 sm:top-8 sm:right-8",
  "bottom-left": "bottom-6 left-6 sm:bottom-8 sm:left-8",
  "top-left": "top-6 left-6 sm:top-8 sm:left-8",
  "bottom-right": "bottom-6 right-6 sm:bottom-8 sm:right-8",
};

// A large, near-invisible copy of an icon the section already uses
// elsewhere (never a new symbol) - gives each section its own quiet
// identity instead of the same flat panel repeating six times.
export function SectionWatermark({
  icon: Icon,
  corner,
  rotate = 0,
}: {
  icon: LucideIcon;
  corner: Corner;
  rotate?: number;
}) {
  return (
    <Icon
      aria-hidden
      strokeWidth={0.55}
      className={cn(
        // Negative (not 0) z-index: a positioned element at z-0 still paints
        // ABOVE non-positioned in-flow siblings (cards, panels) per CSS
        // stacking order - only a negative z-index reliably guarantees this
        // stays behind them, wherever a card's edge happens to land.
        "pointer-events-none absolute -z-10 size-32 text-primary opacity-[0.035] sm:size-44",
        cornerClasses[corner]
      )}
      style={{ transform: `rotate(${rotate}deg)` }}
    />
  );
}
