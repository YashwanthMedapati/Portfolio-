import { personal } from "@/data/resume";

export type ContactMethodId = "email" | "phone" | "linkedin" | "github" | "instagram";

export type ContactMethod = {
  id: ContactMethodId;
  label: string;
  href: string;
  external: boolean;
};

export function phoneHref(phone: string) {
  return `tel:${phone.replace(/[\s-]/g, "")}`;
}

export const contactMethods: ContactMethod[] = [
  { id: "email", label: personal.email, href: `mailto:${personal.email}`, external: false },
  { id: "phone", label: personal.phone, href: phoneHref(personal.phone), external: false },
  { id: "linkedin", label: personal.linkedinHandle, href: personal.linkedin, external: true },
  { id: "github", label: personal.githubHandle, href: personal.github, external: true },
  { id: "instagram", label: personal.instagramHandle, href: personal.instagram, external: true },
];
