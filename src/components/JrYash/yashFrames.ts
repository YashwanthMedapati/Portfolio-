function frames(category: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => `/yash/${category}/${i + 1}.png`);
}

// Newer frame sets ship as zero-padded, prefixed filenames (e.g.
// idle_01.png) rather than the plain 1.png/2.png the frames() helper above
// expects - kept separate since sleep/emotes still use the old naming.
function namedFrames(category: string, prefix: string, count: number): string[] {
  return Array.from(
    { length: count },
    (_, i) => `/yash/${category}/${prefix}${String(i + 1).padStart(2, "0")}.png`
  );
}

export const YASH_FRAMES = {
  idle: namedFrames("idle", "idle_", 7),
  wave: namedFrames("wave", "wave_", 8),
  jump: namedFrames("jump", "jump_", 5),
  runLeft: namedFrames("run-left", "run_left_", 8),
  runRight: namedFrames("run-right", "run_right_", 8),
  sleep: frames("sleep", 3),
  think: namedFrames("think", "thinking_", 8),
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
