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
