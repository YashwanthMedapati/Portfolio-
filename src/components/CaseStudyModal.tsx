"use client";

import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import type { Project } from "@/data/resume";

const sections: { key: keyof NonNullable<Project["caseStudy"]>; label: string }[] = [
  { key: "challenge", label: "The Challenge" },
  { key: "approach", label: "The Approach" },
  { key: "tradeoffs", label: "Trade-offs" },
  { key: "outcome", label: "Outcome" },
];

export function CaseStudyModal({
  project,
  open,
  onOpenChange,
}: {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const caseStudy = project.caseStudy;
  if (!caseStudy) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 max-h-[85svh] w-[92vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg border border-border bg-card shadow-2xl shadow-black/60 transition-all duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
          <div className="flex items-center justify-between border-b border-border bg-secondary/60 px-5 py-3.5">
            <div className="min-w-0">
              <Dialog.Title className="truncate text-sm font-semibold text-foreground">
                {project.name}
              </Dialog.Title>
              <Dialog.Description className="truncate text-xs text-muted-foreground">
                Case Study
              </Dialog.Description>
            </div>
            <Dialog.Close
              className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Close case study"
            >
              <X className="size-4" />
            </Dialog.Close>
          </div>

          <div className="max-h-[calc(85svh-3.5rem)] overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
            <div className="flex flex-col gap-5">
              {sections.map(({ key, label }) => (
                <div key={key}>
                  <p className="mb-1.5 font-mono text-[11px] uppercase tracking-wide text-primary">{label}</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">{caseStudy[key]}</p>
                </div>
              ))}
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
