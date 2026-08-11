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

export function emailDraftHref(subject = "", body = "") {
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: personal.email,
  });
  if (subject) params.set("su", subject);
  if (body) params.set("body", body);
  return `https://mail.google.com/mail/?${params.toString()}`;
}

export const contactMethods: ContactMethod[] = [
  { id: "email", label: personal.email, href: emailDraftHref(), external: true },
  { id: "phone", label: personal.phone, href: phoneHref(personal.phone), external: false },
  { id: "linkedin", label: personal.linkedinHandle, href: personal.linkedin, external: true },
  { id: "github", label: personal.githubHandle, href: personal.github, external: true },
  { id: "instagram", label: personal.instagramHandle, href: personal.instagram, external: true },
];
