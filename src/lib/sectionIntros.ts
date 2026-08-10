import { sectionIds } from "@/data/resume";

// Short, first-person, in Yash's established voice (see jrYashBrain.ts) -
// a one-line "here's what you're looking at" as each section scrolls in.
export const sectionIntros: Record<string, string> = {
  [sectionIds.about]: "This section's the quick version of who I am and how I got here.",
  [sectionIds.projects]: "Real projects I've actually shipped, not just prototyped.",
  [sectionIds.skills]: "Everything I reach for day to day - hover one to see its logo.",
  [sectionIds.education]: "My Binghamton degrees, GPA, and a couple of certifications.",
  [sectionIds.resume]: "The full resume's here - grab the PDF or have me walk you through it.",
  [sectionIds.contact]: "I'm open to Software Engineer and ML Engineer roles - every way to reach me.",
};
