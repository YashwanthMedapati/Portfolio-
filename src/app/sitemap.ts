import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: absoluteUrl("/"),
      lastModified: new Date("2026-08-08T00:00:00.000Z"),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
