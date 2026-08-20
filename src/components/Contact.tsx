"use client";

import { useState } from "react";
import type { ComponentType, MouseEvent } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, Mail, MailOpen, Phone } from "lucide-react";
import { personal, sectionIds } from "@/data/resume";
import { contactMethods, ContactMethodId, emailDraftHref } from "@/lib/contactMethods";
import { GithubIcon, InstagramIcon, LinkedinIcon } from "./icons";
import { Section } from "./Section";
import { SectionHeader } from "./SectionHeader";
import { SectionWatermark } from "./SectionWatermark";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const contactIcons: Record<ContactMethodId, ComponentType<{ size?: number; className?: string }>> = {
  email: Mail,
  phone: Phone,
  linkedin: LinkedinIcon,
  github: GithubIcon,
  instagram: InstagramIcon,
};

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [copiedDetail, setCopiedDetail] = useState<string | null>(null);
  const [phoneNotice, setPhoneNotice] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "fallback">("idle");

  const isPhoneCapable = () =>
    /Android|iPhone|iPad|iPod|Mobile/i.test(window.navigator.userAgent) ||
    window.matchMedia("(pointer: coarse)").matches;

  const openDraftFallback = () => {
    const subject = `Portfolio contact from ${name || "a visitor"}`;
    const body = `${message}\n\n- ${name} (${email})`;
    window.open(emailDraftHref(subject, body), "_blank", "noopener,noreferrer");
    setStatus("fallback");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error("send failed");
      setStatus("sent");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      // The form still works even if the email backend isn't configured or
      // is briefly down - open the same email-draft fallback as before
      // rather than losing what the visitor already typed.
      openDraftFallback();
    }
  };

  const openEmailDraft = () => {
    window.open(emailDraftHref("Portfolio contact", ""), "_blank", "noopener,noreferrer");
  };

  const copyDetail = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedDetail(value);
      window.setTimeout(() => setCopiedDetail(null), 1600);
    } catch {}
  };

  const handleContactClick = async (method: (typeof contactMethods)[number], event: MouseEvent<HTMLAnchorElement>) => {
    if (method.id !== "phone") return;
    if (isPhoneCapable()) return;
    event.preventDefault();
    setPhoneNotice(true);
    window.setTimeout(() => setPhoneNotice(false), 2400);
    try {
      await navigator.clipboard.writeText(personal.phone);
    } catch {}
  };

  return (
    <Section id={sectionIds.contact}>
      <SectionWatermark icon={Mail} corner="bottom-left" rotate={5} />
      <SectionHeader
        sectionId={sectionIds.contact}
        title="Let's Talk"
        description="Open to entry-level Software Engineer and Machine Learning Engineer roles. Reach out directly, or send a note below."
      />

      <div className="grid md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-3"
        >
          <Card className="ring-0 border border-primary/30 bg-primary-soft py-0">
            <CardContent className="px-4 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Fastest way to reach me</p>
                  <p className="text-xs text-muted-foreground">{personal.email}</p>
                </div>
                <Button type="button" size="sm" className="gap-1.5" onClick={openEmailDraft}>
                  <MailOpen className="size-3.5" />
                  Open Draft
                </Button>
              </div>
            </CardContent>
          </Card>
          {phoneNotice && (
            <p className="rounded-md border border-border bg-popover px-3 py-2 text-xs text-muted-foreground">
              This browser cannot place a call. I copied the number for you: {personal.phone}
            </p>
          )}

          <div className="flex flex-wrap justify-center gap-3">
            {contactMethods.map((method) => {
              const Icon = contactIcons[method.id];
              return (
              <div key={method.id} className="relative group">
                <a
                  href={method.href}
                  target={method.external ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  aria-label={method.label}
                  onClick={(event) => void handleContactClick(method, event)}
                  className="size-11 rounded-lg bg-card border border-border hover:border-primary/50 hover:bg-primary-soft flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Icon size={18} className="text-primary" />
                </a>
                <div className="pointer-events-none absolute left-1/2 top-full z-20 w-max max-w-[260px] -translate-x-1/2 pt-2 opacity-0 transition-all group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
                  <div className="translate-y-1 transition-transform group-hover:translate-y-0 group-focus-within:translate-y-0">
                  <button
                    type="button"
                    onClick={() => copyDetail(method.label)}
                    className="rounded-md border border-border bg-popover px-3 py-2 text-left text-xs text-foreground shadow-xl hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="block max-w-[230px] truncate">{method.label}</span>
                    <span className="mt-1 block font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                      {copiedDetail === method.label ? "Copied" : "Click to copy"}
                    </span>
                  </button>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.4, delay: 0.08 }}
        >
          <Card className="ring-0 border border-border">
            <CardContent>
              <form onSubmit={submit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="contact-name">Name</Label>
                  <Input
                    id="contact-name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="contact-email">Email</Label>
                  <Input
                    id="contact-email"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="contact-message">Message</Label>
                  <Textarea
                    id="contact-message"
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="What would you like to ask?"
                    rows={4}
                  />
                </div>
                <Button type="submit" className="rounded-full gap-1.5 mt-1" disabled={status === "sending"}>
                  {status === "sending" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : status === "sent" ? (
                    <Check className="size-4" />
                  ) : (
                    <MailOpen className="size-4" />
                  )}
                  {status === "sending" ? "Sending..." : status === "sent" ? "Sent" : "Submit Message"}
                </Button>
                <p className="text-xs text-muted-foreground -mt-2" role="status">
                  {status === "sent"
                    ? "Thanks - your message is on its way to me."
                    : status === "fallback"
                      ? "Opened your email app instead so nothing you typed is lost - go ahead and send from there."
                      : "Sends straight to my inbox."}
                </p>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-16">
        Built by me, {personal.name} - with Yash watching from the corner.
      </p>
    </Section>
  );
}
