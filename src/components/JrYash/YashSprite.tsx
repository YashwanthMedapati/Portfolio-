"use client";

import { useEffect, useRef, useState } from "react";

export type YashPlaybackMode = "loop" | "once";

export type YashSpriteProps = {
  frames: string[];
  fps?: number;
  mode?: YashPlaybackMode;
  onComplete?: () => void;
  size?: number;
  stageWidth?: number;
  stageHeight?: number;
  mirror?: boolean;
  className?: string;
  alt?: string;
};

export function YashSprite({
  frames,
  fps = 8,
  mode = "loop",
  onComplete,
  size = 56,
  stageWidth,
  stageHeight,
  mirror = false,
  className,
  alt = "",
}: YashSpriteProps) {
  const [index, setIndex] = useState(0);
  const [prevFrames, setPrevFrames] = useState(frames);
  if (frames !== prevFrames) {
    setPrevFrames(frames);
    setIndex(0);
  }

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (frames.length <= 1) return;
    let stopped = false;
    const id = setInterval(() => {
      setIndex((prev) => {
        const next = prev + 1;
        if (next >= frames.length) {
          if (mode === "once") {
            if (!stopped) {
              stopped = true;
              clearInterval(id);
              // Deferred: calling a parent callback (which updates a sibling
              // component's state) synchronously inside a setState updater
              // triggers React's "update during render of a different
              // component" error. A microtask runs after this update commits.
              queueMicrotask(() => onCompleteRef.current?.());
            }
            return frames.length - 1;
          }
          return 0;
        }
        return next;
      });
    }, 1000 / fps);
    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, [frames, fps, mode]);

  const src = frames[Math.min(index, frames.length - 1)];
  if (!src) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- rapid flipbook frame-swapping; next/image's loading machinery fights this
    <img
      src={src}
      alt={alt}
      draggable={false}
      decoding="async"
      className={className}
      style={{
        width: stageWidth ? "100%" : "auto",
        height: stageHeight ? "100%" : size,
        maxWidth: stageWidth ? stageWidth : "100%",
        maxHeight: stageHeight ?? size,
        objectFit: "contain",
        objectPosition: "bottom center",
        userSelect: "none",
        pointerEvents: "none",
        imageRendering: "auto",
        transform: mirror ? "scaleX(-1)" : undefined,
      }}
    />
  );
}
