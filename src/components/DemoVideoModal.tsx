"use client";

import { useEffect, useRef } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";

export function DemoVideoModal({
  src,
  title,
  open,
  onOpenChange,
}: {
  src: string;
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!open) videoRef.current?.pause();
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg border border-border bg-card shadow-2xl shadow-black/60 transition-all duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
          <div className="flex items-center justify-between border-b border-border bg-secondary/60 px-4 py-2.5">
            <Dialog.Title className="truncate text-sm font-medium text-foreground">{title}</Dialog.Title>
            <Dialog.Close
              className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Close demo video"
            >
              <X className="size-4" />
            </Dialog.Close>
          </div>
          <div className="bg-black">
            {open && (
              <video
                ref={videoRef}
                key={src}
                src={src}
                controls
                autoPlay
                playsInline
                className="aspect-video w-full"
              >
                Your browser doesn&apos;t support embedded video.
              </video>
            )}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
