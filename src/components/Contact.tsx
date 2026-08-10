"use client";

import { useState } from "react";
import type { ComponentType } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Mail, MailOpen, Phone } from "lucide-react";
import { personal, sectionIds } from "@/data/resume";
import { contactMethods, ContactMethodId } from "@/lib/contactMethods";
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
  const [copied, setCopied] = useState(false);
  const [copiedDetail, setCopiedDetail] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Portfolio contact from ${name || "a visitor"}`);
    const body = encodeURIComponent(`${message}\n\n- ${name} (${email})`);
    window.location.href = `mailto:${personal.email}?subject=${subject}&body=${body}`;
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(personal.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${personal.email}`;
    }
  };

  const copyDetail = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedDetail(value);
      window.setTimeout(() => setCopiedDetail(null), 1600);
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
                <Button type="button" size="sm" className="gap-1.5" onClick={copyEmail}>
                  {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  {copied ? "Copied" : "Copy Email"}
                </Button>
              </div>
            </CardContent>
          </Card>

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
                <Button type="submit" className="rounded-full gap-1.5 mt-1">
                  <MailOpen className="size-4" />
                  Open Email Draft
                </Button>
                <p className="text-xs text-muted-foreground -mt-2">
                  Opens your email app with this message pre-filled - nothing is sent from here directly.
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
