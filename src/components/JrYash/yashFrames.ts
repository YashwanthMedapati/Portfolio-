function frames(category: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => `/yash/${category}/${i + 1}.png`);
}

export const YASH_FRAMES = {
  idle: frames("idle", 4),
  wave: frames("wave", 4),
  jump: frames("jump", 4),
  runLeft: frames("run-left", 6),
  runRight: frames("run-right", 6),
  sleep: frames("sleep", 3),
  think: ["/yash/think/1.png"],
  emotes: frames("emote", 10),
};

// Every frame across every animation, flattened - fed to preloadYashFrames()
// so the browser has all 38-odd sprite PNGs cached before any animation
// (especially wave/jump, which advance every 100-200ms) needs them. Without
// this, the first play of any sequence fetches each frame on demand, and a
// frame that hasn't arrived yet by the time playback moves past it either
// gets skipped or flashes in late - the "wrong frame" ghosting this fixes.
export const ALL_YASH_FRAME_URLS = Object.values(YASH_FRAMES).flat();

let preloaded = false;
export function preloadYashFrames() {
  if (preloaded || typeof window === "undefined") return;
  preloaded = true;
  for (const src of ALL_YASH_FRAME_URLS) {
    const img = new Image();
    img.src = src;
  }
}
