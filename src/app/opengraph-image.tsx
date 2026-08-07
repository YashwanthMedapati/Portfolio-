import { ogSize, ogContentType, ogAlt, renderOgImage } from "./og-shared";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = ogAlt;

export default function OpengraphImage() {
  return renderOgImage();
}
