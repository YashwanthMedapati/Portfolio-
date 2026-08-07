/**
 * Slices the Yash character sprite sheet (design/yash-sprite-sheet-source.png)
 * into individual transparent PNG frames under public/yash/<category>/<n>.png.
 *
 * The source sheet has a flat, non-transparent cream background, so this
 * chroma-keys it to alpha first, then crops each pose and places every frame
 * in a category onto one shared transparent canvas. That keeps animations from
 * resizing or drifting between frames.
 *
 * Re-run with: node scripts/generate-yash-sprites.js
 */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "..", "design", "yash-sprite-sheet-source.png");
const OUT_DIR = path.join(__dirname, "..", "public", "yash");
const SHEET_W = 1536;
const SHEET_H = 1024;

// [category, x0, x1, y0, y1, frameCount]
const SECTIONS = [
  ["idle", 258, 708, 58, 225, 4],
  ["wave", 708, 1158, 58, 225, 4],
  ["jump", 1158, 1536, 58, 225, 4],
  ["run-left", 260, 880, 275, 430, 6],
  ["run-right", 875, 1536, 275, 430, 6],
  ["emote", 258, 1536, 480, 660, 10],
  ["sleep", 10, 520, 865, 1024, 3],
];

// Thinking currently uses the first clean character pose. The later slots in
// the source row contain speech bubbles/sparkles, not usable character frames.
const THINKING = { x0: 780, x1: 1536, y0: 685, y1: 840, slots: 7, charSlots: [0] };
const MANUAL_SLOTS = {
  sleep: [
    { left: 10, top: 865, width: 130, height: 159 },
    { left: 140, top: 865, width: 170, height: 159 },
    { left: 305, top: 858, width: 225, height: 166 },
  ],
};

async function chromaKeySheet() {
  const img = sharp(SRC);
  const { width, height } = await img.metadata();
  const { data } = await img.raw().toBuffer({ resolveWithObject: true });

  // Sample background color from a corner far from any character.
  const bgIdx = (10 * width + 1500) * 3;
  const bg = [data[bgIdx], data[bgIdx + 1], data[bgIdx + 2]];

  const out = Buffer.alloc(width * height * 4);
  const INNER = 26;
  const OUTER = 72;
  for (let i = 0, p = 0; i < data.length; i += 3, p += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const dist = Math.sqrt((r - bg[0]) ** 2 + (g - bg[1]) ** 2 + (b - bg[2]) ** 2);
    let alpha;
    if (dist <= INNER) alpha = 0;
    else if (dist >= OUTER) alpha = 255;
    else alpha = Math.round(((dist - INNER) / (OUTER - INNER)) * 255);
    out[p] = r;
    out[p + 1] = g;
    out[p + 2] = b;
    out[p + 3] = alpha;
  }

  return sharp(out, { raw: { width, height, channels: 4 } });
}

async function rawSlot(keyed, left, top, width, height) {
  return keyed.clone().extract({ left, top, width, height }).raw().toBuffer({ resolveWithObject: true });
}

function findComponents({ data, info }, threshold = 12) {
  const { width, height, channels } = info;
  const seen = new Uint8Array(width * height);
  const components = [];
  const index = (x, y) => y * width + x;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const start = index(x, y);
      if (seen[start] || data[start * channels + 3] <= threshold) continue;

      const queue = [[x, y]];
      let cursor = 0;
      let count = 0;
      let minX = x, minY = y, maxX = x, maxY = y;
      seen[start] = 1;

      while (cursor < queue.length) {
        const [cx, cy] = queue[cursor++];
        count += 1;
        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;

        for (let oy = -1; oy <= 1; oy++) {
          for (let ox = -1; ox <= 1; ox++) {
            if (ox === 0 && oy === 0) continue;
            const nx = cx + ox;
            const ny = cy + oy;
            if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
            const next = index(nx, ny);
            if (!seen[next] && data[next * channels + 3] > threshold) {
              seen[next] = 1;
              queue.push([nx, ny]);
            }
          }
        }
      }

      components.push({
        count,
        left: minX,
        top: minY,
        width: maxX - minX + 1,
        height: maxY - minY + 1,
      });
    }
  }

  return components;
}

function isSheetDivider(component) {
  return component.width <= 5 && component.height >= 40 && component.height / component.width > 8;
}

function touchesExpandedBox(component, box, pad) {
  return (
    component.left <= box.left + box.width + pad &&
    component.left + component.width >= box.left - pad &&
    component.top <= box.top + box.height + pad &&
    component.top + component.height >= box.top - pad
  );
}

function alphaBBox(raw, threshold = 12) {
  const components = findComponents(raw, threshold)
    .filter((component) => component.count > 20 && !isSheetDivider(component))
    .sort((a, b) => b.count - a.count);

  if (components.length === 0) return null;

  const main = components[0];
  const included = components.filter((component) => {
    if (component === main) return true;
    if (component.count >= main.count * 0.025) return touchesExpandedBox(component, main, 28);
    return touchesExpandedBox(component, main, 12);
  });

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const component of included) {
    minX = Math.min(minX, component.left);
    minY = Math.min(minY, component.top);
    maxX = Math.max(maxX, component.left + component.width - 1);
    maxY = Math.max(maxY, component.top + component.height - 1);
  }

  const PAD = 3;
  const left = Math.max(0, minX - PAD);
  const top = Math.max(0, minY - PAD);
  return {
    left,
    top,
    width: Math.min(raw.info.width, maxX + PAD + 1) - left,
    height: Math.min(raw.info.height, maxY + PAD + 1) - top,
  };
}

function clearSheetDividers(raw, threshold = 12) {
  const components = findComponents(raw, threshold).filter(isSheetDivider);
  const { data, info } = raw;
  const { width, channels } = info;

  for (const component of components) {
    for (let y = component.top; y < component.top + component.height; y++) {
      for (let x = component.left; x < component.left + component.width; x++) {
        const offset = (y * width + x) * channels;
        if (data[offset + 3] > threshold) data[offset + 3] = 0;
      }
    }
  }
}

async function extractSlots(keyed, slots, outPaths) {
  const prepared = [];
  let canvasW = 0;
  let canvasH = 0;

  for (let i = 0; i < slots.length; i++) {
    const raw = await rawSlot(keyed, slots[i].left, slots[i].top, slots[i].width, slots[i].height);
    clearSheetDividers(raw);
    const { data, info } = raw;
    const bbox = alphaBBox(raw);
    const crop = bbox ?? { left: 0, top: 0, width: info.width, height: info.height };
    const image = await sharp(data, { raw: info })
      .extract(crop)
      .png({ compressionLevel: 9 })
      .toBuffer();
    prepared.push({ image, width: crop.width, height: crop.height });
    canvasW = Math.max(canvasW, crop.width);
    canvasH = Math.max(canvasH, crop.height);
  }

  canvasW += 10;
  canvasH += 10;

  for (let i = 0; i < prepared.length; i++) {
    const frame = prepared[i];
    await sharp({
      create: {
        width: canvasW,
        height: canvasH,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([
        {
          input: frame.image,
          left: Math.round((canvasW - frame.width) / 2),
          top: canvasH - frame.height - 5,
        },
      ])
      .png({ compressionLevel: 9 })
      .toFile(outPaths[i]);
    console.log("wrote", outPaths[i]);
  }
}

function resetFrameDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
  for (const file of fs.readdirSync(dir)) {
    if (file.endsWith(".png")) fs.unlinkSync(path.join(dir, file));
  }
}

function makeSlots(x0, y0, frameW, frameH, count) {
  const width = Math.round(frameW);
  const height = Math.round(frameH);
  const slots = [];
  for (let i = 0; i < count; i++) {
    const left = Math.max(0, Math.round(x0 + i * frameW));
    const top = Math.max(0, Math.round(y0));
    slots.push({
      left: Math.min(left, SHEET_W - width),
      top: Math.min(top, SHEET_H - height),
      width,
      height,
    });
  }
  return slots;
}

async function main() {
  const keyed = await chromaKeySheet();
  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const [category, x0, x1, y0, y1, count] of SECTIONS) {
    const dir = path.join(OUT_DIR, category);
    resetFrameDir(dir);
    const frameW = (x1 - x0) / count;
    const slots = MANUAL_SLOTS[category] ?? makeSlots(x0, y0, frameW, y1 - y0, count);
    const outPaths = slots.map((_, i) => path.join(dir, `${i + 1}.png`));
    await extractSlots(keyed, slots, outPaths);
  }

  const thinkDir = path.join(OUT_DIR, "think");
  resetFrameDir(thinkDir);
  const slotW = (THINKING.x1 - THINKING.x0) / THINKING.slots;
  const thinkSlots = THINKING.charSlots.map((slot) =>
    makeSlots(THINKING.x0 + slot * slotW, THINKING.y0, slotW, THINKING.y1 - THINKING.y0, 1)[0]
  );
  const thinkOutPaths = thinkSlots.map((_, i) => path.join(thinkDir, `${i + 1}.png`));
  await extractSlots(keyed, thinkSlots, thinkOutPaths);

  console.log("done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
